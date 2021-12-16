import level, { ILevel } from 'level-rocksdb'
import * as path from 'path'
import Database, { Database as IDatabase } from 'better-sqlite3'
import { readMigrations } from 'migrations-file'
import { migrate } from '@blackglory/better-sqlite3-migrations'
import { isntUndefined, isUndefined, isObject } from '@blackglory/types'
import pkgDir from 'pkg-dir'
import { setSchedule } from 'extra-timers'
import { DebounceMicrotask, each } from 'extra-promise'
import { ensureDir } from 'extra-filesystem'

export interface IMetadata {
  updatedAt: number
  timeToLive: number
  timeBeforeDeletion: number | null
}

// 出于性能考虑, DiskCache使用了多个数据库, 这导致缓存在一些情况下会失去一致性:
// SQLite的记录存在的时候并不代表着对应的RocksDB里的记录存在, 反之亦然.
// 在数据库的prepare和close阶段, 会删除各自数据库中缺失的项目.
export class DiskCache {
  private cancelClearTimeout?: () => void
  private debounceMicrotask = new DebounceMicrotask()

  protected constructor(
    public _data: ILevel<Buffer>
  , public _metadata: IDatabase
  ) {}

  static async create(dirname: string): Promise<DiskCache> {
    await ensureDir(dirname)
    const levelFilename = path.join(dirname, 'data.db')
    const sqliteFilename = path.join(dirname, 'metadata.db')
    const data = level<Buffer>(levelFilename, { valueEncoding: 'binary' })
    const metadata = new Database(sqliteFilename)
    await migrateDatabase(metadata)

    const diskCache = new DiskCache(data, metadata)
    await diskCache.purgeDeleteableItems(Date.now())
    await diskCache.deleteOrphanedItems()
    diskCache.rescheduleClearTimeout()

    return diskCache
  }

  async close(): Promise<void> {
    this.cancelClearTimeout?.()
    await this.deleteOrphanedItems()
    this._metadata.exec(`
      PRAGMA analysis_limit=400;
      PRAGMA optimize;
    `)
    this._metadata.close()
    await this._data.close()
  }

  /**
   * 该操作可能造成数据库锁定.
   */
  async deleteOrphanedItems(): Promise<void> {
    // 删除孤儿metadata记录
    await new Promise<void>(resolve => {
      const pendings: Array<Promise<void>> = []
      this._data.createKeyStream()
        .on('data', key => {
          if (!this.hasMetadata(key)) {
            pendings.push(this.deleteData(key))
          }
        })
        .once('close', async () => {
          await Promise.all(pendings)
          resolve()
        })
    })

    // 删除孤儿data记录
    const rows: Iterable<{ key: string }> = this._metadata.prepare(`
      SELECT key
        FROM cache_metadata
    `).iterate()
    await each(rows, async ({ key }) => {
      if (!await this.hasData(key)) {
        this.deleteMetadata(key)
      }
    })
  }

  hasData(key: string): Promise<boolean> {
    return new Promise(resolve => {
      let exists = false
      this._data.createKeyStream({ gte: key, lte: key, limit: 1 })
        .once('data', () => exists = true)
        .once('close', () => resolve(exists))
    })
  }

  hasMetadata(key: string): boolean {
    const row: { metadata_exists: 1 | 0 } = this._metadata.prepare(`
      SELECT EXISTS(
               SELECT *
                 FROM cache_metadata
                WHERE key = $key
             ) AS metadata_exists
    `).get({ key })

    return row.metadata_exists === 1
  }

  async getData(key: string): Promise<Buffer | undefined> {
    try {
      return await this._data.get(key)
    } catch (err: any) {
      if (isObject(err) && err.notFound) return undefined
      throw err
    }
  }

  getMetadata(key: string): IMetadata | undefined {
    const row: {
      updated_at: number
      time_to_live: number
      time_before_deletion: number | null
    } | undefined = this._metadata.prepare(`
      SELECT updated_at
           , time_to_live
           , time_before_deletion
        FROM cache_metadata
       WHERE key = $key
    `).get({ key })
    if (isUndefined(row)) return undefined

    return {
      updatedAt: row.updated_at
    , timeToLive: row.time_to_live
    , timeBeforeDeletion: row.time_before_deletion
    }
  }

  async set(
    key: string
  , value: Buffer
  , updatedAt: number
  , timeToLive: number
  , timeBeforeDeletion: number | null
  ): Promise<void> {
    const pendingSetData = this.setData(key, value)
    this.setMetadata(key, updatedAt, timeToLive, timeBeforeDeletion)
    await pendingSetData
  }

  async setData(
    key: string
  , value: Buffer
  ): Promise<void> {
    await this._data.put(key, value)
  }

  setMetadata(
    key: string
  , updatedAt: number
  , timeToLive: number
  , timeBeforeDeletion: number | null
  ): void {
    this._metadata.prepare(`
      INSERT INTO cache_metadata (
                    key
                  , updated_at
                  , time_to_live
                  , time_before_deletion
                  )
           VALUES ($key, $updatedAt, $timeToLive, $timeBeforeDeletion)
               ON CONFLICT(key)
               DO UPDATE SET updated_at = $updatedAt
                           , time_to_live = $timeToLive
                           , time_before_deletion = $timeBeforeDeletion
    `).run({ key, updatedAt, timeToLive, timeBeforeDeletion })

    this.debounceMicrotask.queue(this.rescheduleClearTimeout)
  }

  async delete(key: string): Promise<void> {
    const pendingDeleteData = this.deleteData(key)
    this.deleteMetadata(key)
    await pendingDeleteData
  }

  async deleteData(key: string): Promise<void> {
    await this._data.del(key)
  }

  deleteMetadata(key: string): void {
    this._metadata.prepare(`
      DELETE FROM cache_metadata
       WHERE key = $key
    `).run({ key })

    this.debounceMicrotask.queue(this.rescheduleClearTimeout)
  }

  async clear(): Promise<void> {
    const pendingClearData = this.clearData()
    this.clearMetadata()
    await pendingClearData
  }

  async clearData(): Promise<void> {
    await this._data.clear()
  }

  clearMetadata(): void {
    this._metadata.prepare(`
      DELETE FROM cache_metadata
    `).run()

    this.cancelClearTimeout?.()
  }

  private rescheduleClearTimeout = () => {
    this.cancelClearTimeout?.()

    const row: { timestamp: number } | undefined = this._metadata.prepare(`
      SELECT updated_at + time_to_live + time_before_deletion AS timestamp
        FROM cache_metadata
       WHERE time_before_deletion IS NOT NULL
       ORDER BY updated_at + time_to_live + time_before_deletion ASC
       LIMIT 1
    `).get()

    if (isntUndefined(row)) {
      const cancel = setSchedule(row.timestamp, () => {
        this.purgeDeleteableItems(Date.now())
        this.debounceMicrotask.queue(this.rescheduleClearTimeout)
      })

      this.cancelClearTimeout = () => {
        cancel()
        delete this.cancelClearTimeout
      }
    }
  }

  /**
   * @param timestamp 作为过期临界线的时间戳
   */
  async purgeDeleteableItems(timestamp: number): Promise<void> {
    const keys = this._metadata.transaction(() => {
      const rows: Array<{ key: string }> = this._metadata.prepare(`
        SELECT key
          FROM cache_metadata
         WHERE time_before_deletion IS NOT NULL
           AND updated_at + time_to_live + time_before_deletion < $timestamp
      `).all({ timestamp })

      this._metadata.prepare(`
        DELETE FROM cache_metadata
         WHERE time_before_deletion IS NOT NULL
           AND updated_at + time_to_live + time_before_deletion < $timestamp
      `).run({ timestamp })

      return rows.map(x => x.key)
    })()

    const ops = keys.map(key => ({ type: 'del', key }) as const)
    await this._data.batch(ops)
  }
}

export async function migrateDatabase(db: IDatabase) {
  const pkgRoot = (await pkgDir(__dirname))!
  const migrationsPath = path.join(pkgRoot, 'migrations')
  const migrations = await readMigrations(migrationsPath)
  migrate(db, migrations)
}

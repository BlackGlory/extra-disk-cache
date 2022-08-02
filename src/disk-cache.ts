import path from 'path'
import Database, { Database as IDatabase } from 'better-sqlite3'
import { readMigrations } from 'migrations-file'
import { migrate } from '@blackglory/better-sqlite3-migrations'
import { go, assert, isNull, isntUndefined, isUndefined } from '@blackglory/prelude'
import { setSchedule } from 'extra-timers'
import { DebounceMicrotask } from 'extra-promise'
import { findUpPackageFilename } from 'extra-filesystem'
import { map } from 'iterable-operator'

export class DiskCache {
  private cancelClearTimeout?: () => void
  private debounceMicrotask = new DebounceMicrotask()

  protected constructor(public _db: IDatabase) {}

  static async create(filename?: string): Promise<DiskCache> {
    const db = await go(async () => {
      const db = new Database(filename ?? ':memory:')

      await migrateDatabase(db)

      return db
    })

    const diskCache = new this(db)
    diskCache._purgeDeleteableItems(Date.now())
    diskCache.rescheduleClearTimeout()

    return diskCache

    async function migrateDatabase(db: IDatabase): Promise<void> {
      const pkgRoot = path.join((await findUpPackageFilename(__dirname))!, '..')
      const migrationsPath = path.join(pkgRoot, 'migrations')
      const migrations = await readMigrations(migrationsPath)
      migrate(db, migrations)
    }
  }

  close(): void {
    this.cancelClearTimeout?.()
    this._db.exec(`
      PRAGMA analysis_limit=400;
      PRAGMA optimize;
    `)
    this._db.close()
  }

  has(key: string): boolean {
    const row: { item_exists: 1 | 0 } = this._db.prepare(`
      SELECT EXISTS(
               SELECT *
                 FROM cache
                WHERE key = $key
             ) AS item_exists
    `).get({ key })

    return row.item_exists === 1
  }

  get(key: string): {
    value: Buffer
    updatedAt: number
    timeToLive: number | null
  } | undefined {
    const row: {
      value: Buffer
      updated_at: number
      time_to_live: number | null
    } | undefined = this._db.prepare(`
      SELECT value
           , updated_at
           , time_to_live
        FROM cache
       WHERE key = $key
    `).get({ key })
    if (isUndefined(row)) return undefined

    return {
      value: row.value
    , updatedAt: row.updated_at
    , timeToLive: row.time_to_live
    }
  }

  set(
    key: string
  , value: Buffer
  , updatedAt: number
    /**
     * `timeToLive > 0`: items will expire after `timeToLive` milliseconds.
     * `timeToLive = 0`: items will expire immediately.
     * `timeToLive = null`: items will not expire.
     */
  , timeToLive: number | null = null
  ): void {
    assert(
      isNull(timeToLive) || timeToLive >= 0
    , 'timeToLive should be greater than or equal to 0'
    )

    this._db.prepare(`
      INSERT INTO cache (
                    key
                  , value
                  , updated_at
                  , time_to_live
                  )
           VALUES ($key, $value, $updatedAt, $timeToLive)
               ON CONFLICT(key)
               DO UPDATE SET value = $value
                           , updated_at = $updatedAt
                           , time_to_live = $timeToLive
    `).run({
      key
    , value
    , updatedAt
    , timeToLive
    })

    this.debounceMicrotask.queue(this.rescheduleClearTimeout)
  }

  delete(key: string): void {
    this._db.prepare(`
      DELETE FROM cache
       WHERE key = $key
    `).run({ key })

    this.debounceMicrotask.queue(this.rescheduleClearTimeout)
  }

  clear(): void {
    this._db.prepare(`
      DELETE FROM cache
    `).run()

    this.cancelClearTimeout?.()
  }

  keys(): Iterable<string> {
    const iter: Iterable<{ key: string }> = this._db.prepare(`
      SELECT key
        FROM cache
    `).iterate()

    return map(iter, ({ key }) => key)
  }

  private rescheduleClearTimeout = () => {
    this.cancelClearTimeout?.()

    const row: { timestamp: number } | undefined = this._db.prepare(`
      SELECT updated_at + time_to_live AS timestamp
        FROM cache
       WHERE time_to_live IS NOT NULL
       ORDER BY updated_at + time_to_live ASC
       LIMIT 1
    `).get()

    if (isntUndefined(row)) {
      const cancel = setSchedule(row.timestamp, () => {
        this._purgeDeleteableItems(Date.now())
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
  _purgeDeleteableItems(timestamp: number): void {
    this._db.transaction(() => {
      this._db.prepare(`
        SELECT key
          FROM cache
         WHERE time_to_live IS NOT NULL
           AND updated_at + time_to_live < $timestamp
      `).run({ timestamp })

      this._db.prepare(`
        DELETE FROM cache
         WHERE time_to_live IS NOT NULL
           AND updated_at + time_to_live < $timestamp
      `).run({ timestamp })
    })()
  }
}

import path from 'path'
import Database, { Database as IDatabase } from 'better-sqlite3'
import { readMigrations } from 'migrations-file'
import { migrate } from '@blackglory/better-sqlite3-migrations'
import { go, assert, isNull, isntUndefined, isUndefined } from '@blackglory/prelude'
import { setSchedule } from 'extra-timers'
import { DebounceMicrotask } from 'extra-promise'
import { findUpPackageFilename } from 'extra-filesystem'
import { map } from 'iterable-operator'
import { withLazyStatic, lazyStatic } from 'extra-lazy'

export class DiskCache {
  private cancelClearingTask?: () => void
  private debounceMicrotask = new DebounceMicrotask()

  protected constructor(public _db: IDatabase) {}

  static async create(filename?: string): Promise<DiskCache> {
    const db = await go(async () => {
      const db = new Database(filename ?? ':memory:')

      await migrateDatabase(db)

      return db
    })

    const diskCache = new this(db)
    diskCache._clearExpiredItems(Date.now())
    diskCache.rescheduleClearingTask()

    return diskCache

    async function migrateDatabase(db: IDatabase): Promise<void> {
      const pkgRoot = path.join((await findUpPackageFilename(__dirname))!, '..')
      const migrationsPath = path.join(pkgRoot, 'migrations')
      const migrations = await readMigrations(migrationsPath)
      migrate(db, migrations)
    }
  }

  close(): void {
    this.cancelClearingTask?.()
    this._db.exec(`
      PRAGMA analysis_limit=400;
      PRAGMA optimize;
    `)
    this._db.close()
  }

  has = withLazyStatic((key: string): boolean => {
    const row: { item_exists: 1 | 0 } = lazyStatic(() => this._db.prepare(`
      SELECT EXISTS(
               SELECT *
                 FROM cache
                WHERE key = $key
             ) AS item_exists
    `), [this._db]).get({ key })

    return row.item_exists === 1
  })

  get = withLazyStatic((key: string): {
    value: Buffer
    updatedAt: number
    timeToLive: number | null
  } | undefined => {
    const row: {
      value: Buffer
      updated_at: number
      time_to_live: number | null
    } | undefined = lazyStatic(() => this._db.prepare(`
      SELECT value
           , updated_at
           , time_to_live
        FROM cache
       WHERE key = $key
    `), [this._db]).get({ key })
    if (isUndefined(row)) return undefined

    return {
      value: row.value
    , updatedAt: row.updated_at
    , timeToLive: row.time_to_live
    }
  })

  set = withLazyStatic((
    key: string
  , value: Buffer
  , updatedAt: number = Date.now()
    /**
     * `timeToLive > 0`: items will expire after `timeToLive` milliseconds.
     * `timeToLive = 0`: items will expire immediately.
     * `timeToLive = null`: items will not expire.
     */
  , timeToLive: number | null = null
  ): void => {
    assert(
      isNull(timeToLive) || timeToLive >= 0
    , 'timeToLive should be greater than or equal to 0'
    )

    lazyStatic(() => this._db.prepare(`
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
    `), [this._db]).run({
      key
    , value
    , updatedAt
    , timeToLive
    })

    this.debounceMicrotask.queue(this.rescheduleClearingTask)
  })

  delete = withLazyStatic((key: string): void => {
    lazyStatic(() => this._db.prepare(`
      DELETE FROM cache
       WHERE key = $key
    `), [this._db]).run({ key })

    this.debounceMicrotask.queue(this.rescheduleClearingTask)
  })

  clear = withLazyStatic((): void => {
    lazyStatic(() => this._db.prepare(`
      DELETE FROM cache
    `), [this._db]).run()

    this.cancelClearingTask?.()
  })

  keys = withLazyStatic((): Iterable<string> => {
    const iter: Iterable<{ key: string }> = lazyStatic(() => this._db.prepare(`
      SELECT key
        FROM cache
    `), [this._db]).iterate()

    return map(iter, ({ key }) => key)
  })

  private rescheduleClearingTask = withLazyStatic(() => {
    this.cancelClearingTask?.()

    const row: { timestamp: number } | undefined = lazyStatic(() => this._db.prepare(`
      SELECT updated_at + time_to_live AS timestamp
        FROM cache
       WHERE time_to_live IS NOT NULL
       ORDER BY updated_at + time_to_live ASC
       LIMIT 1
    `), [this._db]).get()

    if (isntUndefined(row)) {
      const cancelSchedule = setSchedule(row.timestamp, () => {
        this._clearExpiredItems(Date.now())
        this.debounceMicrotask.queue(this.rescheduleClearingTask)
      })

      this.cancelClearingTask = () => {
        this.debounceMicrotask.cancel(this.rescheduleClearingTask)
        cancelSchedule()
        delete this.cancelClearingTask
      }
    }
  })

  /**
   * @param timestamp 作为过期临界线的时间戳
   */
  _clearExpiredItems = withLazyStatic((timestamp: number): void => {
    lazyStatic(() => this._db.transaction((timestamp: number) => {
      lazyStatic(() => this._db.prepare(`
        SELECT key
          FROM cache
         WHERE time_to_live IS NOT NULL
           AND updated_at + time_to_live < $timestamp
      `), [this._db]).run({ timestamp })

      lazyStatic(() => this._db.prepare(`
        DELETE FROM cache
         WHERE time_to_live IS NOT NULL
           AND updated_at + time_to_live < $timestamp
      `), [this._db]).run({ timestamp })
    }), [this._db])(timestamp)
  })
}

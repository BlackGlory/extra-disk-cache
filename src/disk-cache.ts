import path from 'path'
import Database, { Database as IDatabase } from 'better-sqlite3'
import { findMigrationFilenames, readMigrationFile } from 'migration-files'
import { migrate } from '@blackglory/better-sqlite3-migrations'
import { go, assert, isNull, isntNull, isntUndefined, isUndefined } from '@blackglory/prelude'
import { setSchedule } from 'extra-timers'
import { map } from 'extra-promise'
import { findUpPackageFilename } from 'extra-filesystem'
import * as Iter from 'iterable-operator'
import { withLazyStatic, lazyStatic } from 'extra-lazy'

export class DiskCache {
  private minimalExpirationTime?: number
  private cancelScheduledCleaner?: () => void

  private constructor(public _db: IDatabase) {
    this.minimalExpirationTime = this.getMinimalExpirationTime()
    this._clearExpiredItems()
    this.scheduleCleaner()
  }

  static async create(filename?: string): Promise<DiskCache> {
    const db = await go(async () => {
      const db = new Database(filename ?? ':memory:')

      await migrateDatabase(db)

      db.unsafeMode(true)

      return db
    })

    return new this(db)

    async function migrateDatabase(db: IDatabase): Promise<void> {
      const packageFilename = await findUpPackageFilename(__dirname)
      assert(packageFilename, 'package.json not found')

      const packageRoot = path.dirname(packageFilename)
      const migrationsPath = path.join(packageRoot, 'migrations')
      const migrationFilenames = await findMigrationFilenames(migrationsPath)
      const migrations = await map(migrationFilenames, readMigrationFile)
      migrate(db, migrations)
    }
  }

  private scheduleCleaner(): void {
    if (this.cancelScheduledCleaner) {
      this.cancelScheduledCleaner()
      delete this.cancelScheduledCleaner
    }

    if (isntUndefined(this.minimalExpirationTime)) {
      this.cancelScheduledCleaner = setSchedule(
        this.minimalExpirationTime
      , () => {
          this._clearExpiredItems()

          this.minimalExpirationTime = this.getMinimalExpirationTime()
          this.scheduleCleaner()
        }
      )
    }
  }

  close(): void {
    if (this.cancelScheduledCleaner) {
      this.cancelScheduledCleaner()
      delete this.cancelScheduledCleaner
    }

    this._db.exec(`
      PRAGMA analysis_limit=400;
      PRAGMA optimize;
    `)

    this._db.close()
  }

  has = withLazyStatic((key: string): boolean => {
    const row = lazyStatic(() => this._db.prepare(`
      SELECT EXISTS(
               SELECT *
                 FROM cache
                WHERE key = $key
             ) AS item_exists
    `), [this._db]).get({ key }) as { item_exists: 1 | 0 }

    return row.item_exists === 1
  })

  get = withLazyStatic((key: string): Buffer | undefined => {
    const row = lazyStatic(() => this._db.prepare(`
      SELECT value
        FROM cache
       WHERE key = $key
    `), [this._db]).get({ key }) as { value: Buffer } | undefined

    return row?.value
  })

  getWithMetadata = withLazyStatic((key: string): {
    value: Buffer
    updatedAt: number
    timeToLive: number | null
  } | undefined => {
    const row = lazyStatic(() => this._db.prepare(`
      SELECT value
           , updated_at
           , time_to_live
        FROM cache
       WHERE key = $key
    `), [this._db]).get({ key }) as {
      value: Buffer
      updated_at: number
      time_to_live: number | null
    } | undefined

    if (row) {
      return {
        value: row.value
      , updatedAt: row.updated_at
      , timeToLive: row.time_to_live
      }
    }
  })

  set = withLazyStatic((
    key: string
  , value: Buffer
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

    const updatedAt = Date.now()
    const expirationTime = isntNull(timeToLive)
      ? updatedAt + timeToLive
      : null

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

    if (isntNull(expirationTime)) {
      if (isUndefined(this.minimalExpirationTime)) {
        this.minimalExpirationTime = expirationTime
        this.scheduleCleaner()
      } else {
        if (expirationTime < this.minimalExpirationTime) {
          this.minimalExpirationTime = expirationTime
          this.scheduleCleaner()
        }
      }
    }
  })

  delete = withLazyStatic((key: string): void => {
    lazyStatic(() => this._db.prepare(`
      DELETE FROM cache
       WHERE key = $key
    `), [this._db]).run({ key })
  })

  clear = withLazyStatic((): void => {
    lazyStatic(() => this._db.prepare(`
      DELETE FROM cache
    `), [this._db]).run()

    if (this.cancelScheduledCleaner) {
      this.cancelScheduledCleaner()
      delete this.cancelScheduledCleaner
    }
  })

  keys = withLazyStatic((): IterableIterator<string> => {
    const iter = lazyStatic(() => this._db.prepare(`
      SELECT key
        FROM cache
    `), [this._db]).iterate() as IterableIterator<{ key: string }>

    return Iter.map(iter, ({ key }) => key)
  })

  _clearExpiredItems = withLazyStatic((timestamp: number = Date.now()): void => {
    lazyStatic(() => this._db.prepare(`
      DELETE FROM cache
       WHERE time_to_live IS NOT NULL
         AND updated_at + time_to_live < $timestamp
    `), [this._db])
      .run({ timestamp })
  })

  private getMinimalExpirationTime = withLazyStatic((): number | undefined => {
    const row = lazyStatic(() => this._db.prepare(`
      SELECT updated_at + time_to_live AS expiration_time
        FROM cache
       WHERE time_to_live IS NOT NULL
       ORDER BY updated_at + time_to_live ASC
       LIMIT 1
    `), [this._db])
      .get() as { expiration_time: number } | undefined

    return row?.expiration_time
  })
}

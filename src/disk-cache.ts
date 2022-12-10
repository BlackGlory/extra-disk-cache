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
  private minimalDeletionTime?: number
  private cancelScheduledCleaner?: () => void

  private constructor(public _db: IDatabase) {
    this.minimalDeletionTime = this.getMinimalExpirationTimestamp()
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

    if (isntUndefined(this.minimalDeletionTime)) {
      this.cancelScheduledCleaner = setSchedule(this.minimalDeletionTime, () => {
        this._clearExpiredItems()

        this.minimalDeletionTime = this.getMinimalExpirationTimestamp()
        this.scheduleCleaner()
      })
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
    const row: { item_exists: 1 | 0 } = lazyStatic(() => this._db.prepare(`
      SELECT EXISTS(
               SELECT *
                 FROM cache
                WHERE key = $key
             ) AS item_exists
    `), [this._db]).get({ key })

    return row.item_exists === 1
  })

  get = withLazyStatic((key: string): Buffer | undefined => {
    const row: { value: Buffer } | undefined = lazyStatic(() => this._db.prepare(`
      SELECT value
        FROM cache
       WHERE key = $key
    `), [this._db]).get({ key })

    return row?.value
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

    const expirationTime = isntNull(timeToLive)
      ? Date.now() + timeToLive
      : null

    lazyStatic(() => this._db.prepare(`
      INSERT INTO cache (
                    key
                  , value
                  , expiration_time
                  )
           VALUES ($key, $value, $expirationTime)
               ON CONFLICT(key)
               DO UPDATE SET value = $value
                           , expiration_time = $expirationTime
    `), [this._db]).run({
      key
    , value
    , expirationTime
    })

    if (isntNull(expirationTime)) {
      if (isUndefined(this.minimalDeletionTime)) {
        this.minimalDeletionTime = expirationTime
        this.scheduleCleaner()
      } else {
        if (expirationTime < this.minimalDeletionTime) {
          this.minimalDeletionTime = expirationTime
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
    const iter: IterableIterator<{ key: string }> = lazyStatic(() => this._db.prepare(`
      SELECT key
        FROM cache
    `), [this._db]).iterate()

    return Iter.map(iter, ({ key }) => key)
  })

  _clearExpiredItems = withLazyStatic((timestamp: number = Date.now()): void => {
    lazyStatic(() => this._db.prepare(`
      DELETE FROM cache
       WHERE expiration_time IS NOT NULL
         AND expiration_time <= $timestamp
    `), [this._db])
      .run({ timestamp })
  })

  private getMinimalExpirationTimestamp = withLazyStatic((): number | undefined => {
    const row: { expiration_time: number } | undefined = lazyStatic(() => this._db.prepare(`
      SELECT expiration_time
        FROM cache
       WHERE expiration_time IS NOT NULL
       ORDER BY expiration_time ASC
       LIMIT 1
    `), [this._db])
      .get()

    return row?.expiration_time
  })
}

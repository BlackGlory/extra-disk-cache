import { isBoolean } from '@blackglory/prelude'
import { withLazyStatic, lazyStatic } from 'extra-lazy'
import { DiskCache } from './disk-cache'

export interface ICache {
  set(key: string, value: Buffer | boolean | undefined, timeToLive?: number): void
  get(key: string): Buffer | boolean | undefined
  delete(key: string): void
  clear(): void
}

export enum CacheKeyType {
  Exist
, Value
}

export class DiskCacheWithCache {
  constructor(
    private diskCache: DiskCache
  , private memoryCache: ICache
  ) {}

  close(): void {
    this.diskCache.close()
  }

  has(key: string): boolean {
    const cacheKey = createCacheKey(CacheKeyType.Exist, key)
    const result = this.memoryCache.get(cacheKey)
    if (isBoolean(result)) {
      return result
    } else {
      const result = this.getDiskCacheRecord(key)
      if (result) {
        this.memoryCache.set(
          cacheKey
        , true
        , result.expirationTime ?? undefined
        )
        return true
      } else {
        this.memoryCache.set(cacheKey, false)
        return false
      }
    }
  }

  get(key: string): Buffer | undefined {
    const cacheKey = createCacheKey(CacheKeyType.Value, key)
    const result = this.memoryCache.get(cacheKey)
    if (result instanceof Buffer) {
      return result
    } else {
      const result = this.getDiskCacheRecord(key)
      if (result) {
        this.memoryCache.set(
          cacheKey
        , result.value
        , result.expirationTime ?? undefined
        )
        return result.value
      } else {
        this.memoryCache.set(cacheKey, undefined)
        return result
      }
    }
  }

  private getDiskCacheRecord = withLazyStatic((key: string): {
    value: Buffer
    expirationTime: number | null
  } | undefined => {
    const row: {
      value: Buffer
      expiration_time: number | null
    } | undefined = lazyStatic(() => this.diskCache._db.prepare(`
      SELECT value
           , expiration_time
        FROM cache
       WHERE key = $key
    `), [this.diskCache._db]).get({ key })

    return row
         ? {
             value: row.value
           , expirationTime: row.expiration_time
           }
         : undefined
  })

  set(key: string, value: Buffer): void {
    this.diskCache.set(key, value)

    this.memoryCache.delete(createCacheKey(CacheKeyType.Value, key))
  }

  delete(key: string): void {
    this.diskCache.delete(key)

    this.memoryCache.delete(createCacheKey(CacheKeyType.Exist, key))
    this.memoryCache.delete(createCacheKey(CacheKeyType.Value, key))
  }

  clear(): void {
    this.diskCache.clear()

    this.memoryCache.clear()
  }

  keys(): IterableIterator<string> {
    return this.diskCache.keys()
  }
}

export function createCacheKey(type: CacheKeyType, key: string): string {
  return JSON.stringify([type, key])
}

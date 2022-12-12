import { isUndefined, isntUndefined } from '@blackglory/prelude'
import { DiskCache } from './disk-cache'

export interface ICache {
  set(
    key: string
  , value:
    | {
        value: Buffer
        updatedAt: number
        timeToLive: number | null
      }
    | false
  , timeToLive?: number
  ): void

  get(key: string):
  | {
      value: Buffer
      updatedAt: number
      timeToLive: number | null
    }
  | false
  | undefined

  delete(key: string): void
  clear(): void
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
    const result = this.memoryCache.get(key)
    if (result === false) {
      return false
    } else if (isntUndefined(result)) {
      return true
    } else {
      const result = this.getWithMetadata(key)
      if (isUndefined(result)) {
        this.memoryCache.set(key, false)
        return false
      } else {
        this.memoryCache.set(key, result, result.timeToLive ?? undefined)
        return true
      }
    }
  }

  get(key: string): Buffer | undefined {
    const result = this.memoryCache.get(key)
    if (result === false) {
      return undefined
    } else if (isntUndefined(result)) {
      return result.value
    } else {
      const result = this.diskCache.getWithMetadata(key)
      if (isUndefined(result)) {
        this.memoryCache.set(key, false)
        return result
      } else {
        this.memoryCache.set(
          key
        , result
        , result.timeToLive ?? undefined
        )
        return result.value
      }
    }
  }

  getWithMetadata(key: string): {
    value: Buffer
    updatedAt: number
    timeToLive: number | null
  } | undefined {
    const result = this.memoryCache.get(key)
    if (result === false) {
      return undefined
    } else if (isntUndefined(result)) {
      return result
    } else {
      const result = this.diskCache.getWithMetadata(key)
      if (isUndefined(result)) {
        this.memoryCache.set(key, false)
        return result
      } else {
        this.memoryCache.set(key, result, result.timeToLive ?? undefined)
        return result
      }
    }
  }

  set(key: string, value: Buffer, timeToLive: number | null = null): void {
    this.diskCache.set(key, value, timeToLive)

    this.memoryCache.delete(key)
  }

  delete(key: string): void {
    this.diskCache.delete(key)

    this.memoryCache.delete(key)
  }

  clear(): void {
    this.diskCache.clear()

    this.memoryCache.clear()
  }

  keys(): IterableIterator<string> {
    return this.diskCache.keys()
  }
}

import { DiskCache } from '@src/disk-cache.js'
import { DiskCacheWithCache } from '@src/disk-cache-with-cache.js'
import { IKeyAsyncConverter, IValueAsyncConverter } from '@src/types.js'
import { mapAsync, filterAsync } from 'iterable-operator'
import { pipe, isntUndefined } from 'extra-utils'

export class DiskCacheAsyncView<K, V> {
  constructor(
    private cache: DiskCache | DiskCacheWithCache
  , private keyConverter: IKeyAsyncConverter<K>
  , private valueConverter: IValueAsyncConverter<V>
  ) {}

  async has(key: K): Promise<boolean> {
    return this.cache.has(await this.keyConverter.toString(key))
  }

  async get(key: K): Promise<V | undefined> {
    const result = this.cache.get(await this.keyConverter.toString(key))

    if (result) {
      return await this.valueConverter.fromBuffer(result)
    } else {
      return undefined
    }
  }

  async getWithMetadata(key: K): Promise<{
    value: V
    updatedAt: number
    timeToLive: number | null
  } | undefined> {
    const result = this.cache.getWithMetadata(await this.keyConverter.toString(key))

    if (result) {
      return {
        value: await this.valueConverter.fromBuffer(result.value)
      , updatedAt: result.updatedAt
      , timeToLive: result.timeToLive
      }
    } else {
      return undefined
    }
  }

  async set(
    key: K
  , value: V
    /**
     * `timeToLive > 0`: items will expire after `timeToLive` milliseconds.
     * `timeToLive = 0`: items will expire immediately.
     * `timeToLive = null`: items will not expire.
     */
  , timeToLive: number | null = null
  ): Promise<void> {
    this.cache.set(
      await this.keyConverter.toString(key)
    , await this.valueConverter.toBuffer(value)
    , timeToLive
    )
  }

  async delete(key: K): Promise<void> {
    this.cache.delete(await this.keyConverter.toString(key))
  }

  clear(): void {
    this.cache.clear()
  }

  keys(): AsyncIterableIterator<K> {
    return pipe(
      this.cache.keys()
    , iter => mapAsync(iter, key => this.keyConverter.fromString(key))
    , iter => filterAsync<Awaited<K> | undefined, Awaited<Awaited<K>>>(iter, isntUndefined)
    )
  }
}

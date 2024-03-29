import { DiskCache } from '@src/disk-cache.js'
import { DiskCacheWithCache } from '@src/disk-cache-with-cache.js'
import { IKeyConverter, IValueConverter } from '@src/types.js'
import { map, filter } from 'iterable-operator'
import { isntUndefined } from '@blackglory/prelude'
import { pipe } from 'extra-utils'

export class DiskCacheView<K, V> {
  constructor(
    private cache: DiskCache | DiskCacheWithCache
  , private keyConverter: IKeyConverter<K>
  , private valueConverter: IValueConverter<V>
  ) {}

  has(key: K): boolean {
    return this.cache.has(this.keyConverter.toString(key))
  }

  get(key: K): V | undefined {
    const result = this.cache.get(this.keyConverter.toString(key))

    if (result) {
      return this.valueConverter.fromBuffer(result)
    } else {
      return undefined
    }
  }

  getWithMetadata(key: K): {
    value: V
    updatedAt: number
    timeToLive: number | null
  } | undefined {
    const result = this.cache.getWithMetadata(this.keyConverter.toString(key))

    if (result) {
      return {
        value: this.valueConverter.fromBuffer(result.value)
      , updatedAt: result.updatedAt
      , timeToLive: result.timeToLive
      }
    } else {
      return undefined
    }
  }

  set(
    key: K
  , value: V
    /**
     * `timeToLive > 0`: items will expire after `timeToLive` milliseconds.
     * `timeToLive = 0`: items will expire immediately.
     * `timeToLive = null`: items will not expire.
     */
  , timeToLive: number | null = null
  ): void {
    this.cache.set(
      this.keyConverter.toString(key)
    , this.valueConverter.toBuffer(value)
    , timeToLive
    )
  }

  delete(key: K): void {
    this.cache.delete(this.keyConverter.toString(key))
  }

  clear(): void {
    this.cache.clear()
  }

  keys(): IterableIterator<K> {
    return pipe(
      this.cache.keys()
    , iter => map(iter, key => this.keyConverter.fromString(key))
    , iter => filter(iter, isntUndefined)
    )
  }
}

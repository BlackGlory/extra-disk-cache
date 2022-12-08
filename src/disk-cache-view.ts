import { DiskCache } from '@src/disk-cache'
import { IKeyConverter, IValueConverter } from '@src/types'
import { map, filter } from 'iterable-operator'
import { isntUndefined } from '@blackglory/prelude'
import { pipe } from 'extra-utils'

export class DiskCacheView<K, V> {
  constructor(
    private cache: DiskCache
  , private keyConverter: IKeyConverter<K>
  , private valueConverter: IValueConverter<V>
  ) {}

  has(key: K): boolean {
    return this.cache.has(this.keyConverter.toString(key))
  }

  get(key: K): {
    value: V
    updatedAt: number
    timeToLive: number | null
  } | undefined {
    const item = this.cache.get(this.keyConverter.toString(key))

    if (item) {
      return {
        value: this.valueConverter.fromBuffer(item.value)
      , updatedAt: item.updatedAt
      , timeToLive: item.timeToLive
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

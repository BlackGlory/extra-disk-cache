import { setRawItem, getRawItem, hasRawItem } from '@test/utils'
import { DiskCache } from '@src/disk-cache'
import { DiskCacheWithCache } from '@src/disk-cache-with-cache'
import { ExpirableMap } from '@blackglory/structures'
import { toArray } from '@blackglory/prelude'
import '@blackglory/jest-matchers'

describe('DiskCacheWithCache', () => {
  describe('has', () => {
    test('item exists', async () => {
      const diskCache = await DiskCache.create()
      setRawItem(diskCache, {
        key: 'key'
      , value: Buffer.from('value')
      , updated_at: 0
      , time_to_live: null
      })
      const memoryCache = createMemoryCache()
      const cache = new DiskCacheWithCache(diskCache, memoryCache)

      const result = cache.has('key')

      expect(result).toBe(true)
      expect(memoryCache.size).toBe(1)
      expect(memoryCache.get('key')).toStrictEqual({
        value: Buffer.from('value')
      , updatedAt: 0
      , timeToLive: null
      })
    })

    test('item does not exist', async () => {
      const diskCache = await DiskCache.create()
      const memoryCache = createMemoryCache()
      const cache = new DiskCacheWithCache(diskCache, memoryCache)

      const result = cache.has('key')

      expect(result).toBe(false)
      expect(memoryCache.size).toBe(1)
      expect(memoryCache.get('key')).toBe(undefined)
    })
  })

  describe('get', () => {
    test('item exists', async () => {
      const diskCache = await DiskCache.create()
      const value = Buffer.from('value')
      setRawItem(diskCache, {
        key: 'key'
      , value
      , updated_at: 0
      , time_to_live: null
      })
      const memoryCache = createMemoryCache()
      memoryCache.set('key', {
        value
      , updatedAt: 0
      , timeToLive: null
      })
      const cache = new DiskCacheWithCache(diskCache, memoryCache)

      setRawItem(diskCache, {
        key: 'key'
      , value: Buffer.from('new-value')
      , updated_at: 0
      , time_to_live: null
      })
      const result = cache.get('key')

      expect(result).toStrictEqual(value)
      expect(memoryCache.size).toBe(1)
      expect(memoryCache.get('key')).toStrictEqual({
        value
      , updatedAt: 0
      , timeToLive: null
      })
    })

    test('item does not exist', async () => {
      const diskCache = await DiskCache.create()
      const memoryCache = createMemoryCache()
      const cache = new DiskCacheWithCache(diskCache, memoryCache)

      const result = cache.get('key')

      expect(result).toBeUndefined()
      expect(memoryCache.size).toBe(1)
      expect(memoryCache.get('key')).toBe(false)
    })
  })

  describe('getWithMetadata', () => {
    test('item exists', async () => {
      const diskCache = await DiskCache.create()
      const value = Buffer.from('value')
      setRawItem(diskCache, {
        key: 'key'
      , value
      , updated_at: 0
      , time_to_live: null
      })
      const memoryCache = createMemoryCache()
      memoryCache.set('key', {
        value
      , updatedAt: 0
      , timeToLive: null
      })
      const cache = new DiskCacheWithCache(diskCache, memoryCache)

      setRawItem(diskCache, {
        key: 'key'
      , value: Buffer.from('new-value')
      , updated_at: 0
      , time_to_live: null
      })
      const result = cache.getWithMetadata('key')

      expect(result).toStrictEqual({
        value
      , updatedAt: 0
      , timeToLive: null
      })
      expect(memoryCache.size).toBe(1)
      expect(memoryCache.get('key')).toStrictEqual({
        value
      , updatedAt: 0
      , timeToLive: null
      })
    })

    test('item does not exist', async () => {
      const diskCache = await DiskCache.create()
      const memoryCache = createMemoryCache()
      const cache = new DiskCacheWithCache(diskCache, memoryCache)

      const result = cache.getWithMetadata('key')

      expect(result).toBeUndefined()
      expect(memoryCache.size).toBe(1)
      expect(memoryCache.get('key')).toBe(false)
    })
  })

  describe('set', () => {
    test('item exists', async () => {
      jest.useFakeTimers({ now: 1000 })
      try {
        const diskCache = await DiskCache.create()
        const value = Buffer.from('value')
        const memoryCache = createMemoryCache()
        memoryCache.set('key', {
          value
        , updatedAt: 0
        , timeToLive: null
        })
        setRawItem(diskCache, {
          key: 'key'
        , value
        , updated_at: 0
        , time_to_live: null
        })
        const cache = new DiskCacheWithCache(diskCache, memoryCache)

        const newValue = Buffer.from('new value')
        const result = cache.set('key', newValue)

        expect(result).toBeUndefined()
        expect(getRawItem(diskCache, 'key')).toEqual({
          key: 'key'
        , value: newValue
        , updated_at: 1000
        , time_to_live: null
        })
        expect(memoryCache.size).toBe(0)
      } finally {
        jest.useRealTimers()
      }
    })

    test('data does not exist', async () => {
      jest.useFakeTimers({ now: 1000 })
      try {
        const diskCache = await DiskCache.create()
        const memoryCache = createMemoryCache()
        memoryCache.set('key', {
          value: Buffer.from('value')
        , updatedAt: 0
        , timeToLive: null
        })
        const cache = new DiskCacheWithCache(diskCache, memoryCache)

        const value = Buffer.from('value')
        cache.set('key', value)

        expect(getRawItem(diskCache, 'key')).toEqual({
          key: 'key'
        , value
        , updated_at: 1000
        , time_to_live: null
        })
        expect(memoryCache.size).toBe(0)
      } finally {
        jest.useRealTimers()
      }
    })
  })

  test('delete', async () => {
    const diskCache = await DiskCache.create()
    const value = Buffer.from('value')
    setRawItem(diskCache, {
      key: 'key'
    , value
    , updated_at: 0
    , time_to_live: null
    })
    const memoryCache = createMemoryCache()
    memoryCache.set('key', {
      value: Buffer.from('value')
    , updatedAt: 0
    , timeToLive: null
    })
    const cache = new DiskCacheWithCache(diskCache, memoryCache)

    const result = cache.delete('key')

    expect(result).toBeUndefined()
    expect(hasRawItem(diskCache, 'key')).toBeFalsy()
    expect(memoryCache.size).toBe(0)
  })

  test('clear', async () => {
    const diskCache = await DiskCache.create()
    setRawItem(diskCache, {
      key: 'key'
    , value: Buffer.from('value')
    , updated_at: 0
    , time_to_live: null
    })
    const memoryCache = createMemoryCache()
    memoryCache.set('key', {
      value: Buffer.from('value')
    , updatedAt: 0
    , timeToLive: null
    })
    const cache = new DiskCacheWithCache(diskCache, memoryCache)

    const result = cache.clear()

    expect(result).toBeUndefined()
    expect(hasRawItem(diskCache, 'key')).toBeFalsy()
    expect(memoryCache.size).toBe(0)
  })

  describe('keys', () => {
    test('general', async () => {
      const diskCache = await DiskCache.create()
      setRawItem(diskCache, {
        key: 'key'
      , value: Buffer.from('value')
      , updated_at: 0
      , time_to_live: null
      })
      const memoryCache = createMemoryCache()
      const cache = new DiskCacheWithCache(diskCache, memoryCache)

      const iter = cache.keys()
      const result = toArray(iter)

      expect(result).toStrictEqual(['key'])
    })

    test('edge: read while getting keys', async () => {
      const diskCache = await DiskCache.create()
      setRawItem(diskCache, {
        key: 'key'
      , value: Buffer.from('value')
      , updated_at: 0
      , time_to_live: null
      })
      const memoryCache = createMemoryCache()
      const cache = new DiskCacheWithCache(diskCache, memoryCache)

      const iter = cache.keys()
      const value = cache.get('key')
      const result = iter.next()

      expect(value).toStrictEqual(Buffer.from('value'))
      expect(result).toStrictEqual({
        done: false
      , value: 'key'
      })
    })

    test('edge: write while getting keys', async () => {
      const diskCache = await DiskCache.create()
      setRawItem(diskCache, {
        key: 'key'
      , value: Buffer.from('value')
      , updated_at: 0
      , time_to_live: null
      })
      const memoryCache = createMemoryCache()
      const cache = new DiskCacheWithCache(diskCache, memoryCache)

      const iter = cache.keys()
      cache.set('key', Buffer.from('new-value'))
      const result = iter.next()

      expect(result).toStrictEqual({
        done: false
      , value: 'key'
      })
    })
  })

  describe('close', () => {
    test('create, close', async () => {
      const diskCache = await DiskCache.create()
      const memoryCache = createMemoryCache()
      const cache = new DiskCacheWithCache(diskCache, memoryCache)

      cache.close()
    })

    test('create, set, close', async () => {
      const diskCache = await DiskCache.create()
      const memoryCache = createMemoryCache()
      const cache = new DiskCacheWithCache(diskCache, memoryCache)

      cache.set('key', Buffer.from('value'))

      cache.close()
    })
  })
})

function createMemoryCache(): ExpirableMap<
  string
, | {
      value: Buffer
      updatedAt: number
      timeToLive: number | null
    }
  | false
  | undefined
> {
  return new ExpirableMap()
}

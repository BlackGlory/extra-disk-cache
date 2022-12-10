import { setRawItem, getRawItem, hasRawItem } from '@test/utils'
import { DiskCache } from '@src/disk-cache'
import {
  DiskCacheWithCache
, createCacheKey
, CacheKeyType
} from '@src/disk-cache-with-cache'
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
      , expiration_time: null
      })
      const memoryCache = createMemoryCache()
      const cache = new DiskCacheWithCache(diskCache, memoryCache)

      const result = cache.has('key')

      expect(result).toBe(true)
      expect(memoryCache.size).toBe(1)
      expect(memoryCache.get(createCacheKey(CacheKeyType.Exist, 'key'))).toBe(true)
    })

    test('item does not exist', async () => {
      const diskCache = await DiskCache.create()
      const memoryCache = createMemoryCache()
      const cache = new DiskCacheWithCache(diskCache, memoryCache)

      const result = cache.has('key')

      expect(result).toBe(false)
      expect(memoryCache.size).toBe(1)
      expect(memoryCache.get(createCacheKey(CacheKeyType.Exist, 'key'))).toBe(false)
    })
  })

  describe('get', () => {
    test('item exists', async () => {
      const diskCache = await DiskCache.create()
      const value = Buffer.from('value')
      setRawItem(diskCache, {
        key: 'key'
      , value
      , expiration_time: null
      })
      const memoryCache = createMemoryCache()
      memoryCache.set(createCacheKey(CacheKeyType.Value, 'key'), value)
      const cache = new DiskCacheWithCache(diskCache, memoryCache)

      setRawItem(diskCache, {
        key: 'key'
      , value: Buffer.from('new-value')
      , expiration_time: null
      })
      const result = cache.get('key')

      expect(result).toStrictEqual(value)
      expect(memoryCache.size).toBe(1)
      expect(memoryCache.get(createCacheKey(CacheKeyType.Value, 'key'))).toBe(value)
    })

    test('item does not exist', async () => {
      const diskCache = await DiskCache.create()
      const memoryCache = createMemoryCache()
      const cache = new DiskCacheWithCache(diskCache, memoryCache)

      const result = cache.get('key')

      expect(result).toBeUndefined()
      expect(memoryCache.size).toBe(1)
      expect(memoryCache.get(createCacheKey(CacheKeyType.Value, 'key'))).toBe(undefined)
    })
  })

  describe('set', () => {
    test('item exists', async () => {
      const diskCache = await DiskCache.create()
      const value = Buffer.from('value')
      const memoryCache = createMemoryCache()
      memoryCache.set(createCacheKey(CacheKeyType.Value, 'key'), value)
      setRawItem(diskCache, {
        key: 'key'
      , value
      , expiration_time: null
      })
      const cache = new DiskCacheWithCache(diskCache, memoryCache)

      const newValue = Buffer.from('new value')
      const result = cache.set('key', newValue)

      expect(result).toBeUndefined()
      expect(getRawItem(diskCache, 'key')).toEqual({
        key: 'key'
      , value: newValue
      , expiration_time: null
      })
      expect(memoryCache.size).toBe(0)
    })

    test('data does not exist', async () => {
      const diskCache = await DiskCache.create()
      const memoryCache = createMemoryCache()
      memoryCache.set(createCacheKey(CacheKeyType.Value, 'key'), Buffer.from('value'))
      const cache = new DiskCacheWithCache(diskCache, memoryCache)

      const value = Buffer.from('value')
      const result = cache.set('key', value)

      expect(result).toBeUndefined()
      expect(getRawItem(diskCache, 'key')).toEqual({
        key: 'key'
      , value
      , expiration_time: null
      })
      expect(memoryCache.size).toBe(0)
    })
  })

  test('delete', async () => {
    const diskCache = await DiskCache.create()
    const value = Buffer.from('value')
    setRawItem(diskCache, {
      key: 'key'
    , value
    , expiration_time: null
    })
    const memoryCache = createMemoryCache()
    memoryCache.set(createCacheKey(CacheKeyType.Exist, 'key'), Buffer.from('value'))
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
    , expiration_time: null
    })
    const memoryCache = createMemoryCache()
    memoryCache.set(createCacheKey(CacheKeyType.Exist, 'key'), Buffer.from('value'))
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
      , expiration_time: null
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
      , expiration_time: null
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
      , expiration_time: null
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

function createMemoryCache(): ExpirableMap<string, Buffer | boolean | undefined> {
  return new ExpirableMap()
}

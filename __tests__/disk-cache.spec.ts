import { describe, test, expect, vi } from 'vitest'
import { setRawItem, getRawItem, hasRawItem } from '@test/utils.js'
import { DiskCache } from '@src/disk-cache.js'
import { delay } from 'extra-promise'
import { toArray } from '@blackglory/prelude'

const TIME_ERROR = 5

describe('DiskCache', () => {
  describe('cache expiration', () => {
    test('delete items after TTL', async () => {
      const cache = await DiskCache.create()

      cache.set('key', Buffer.from('value'), 100)
      await delay(100 + TIME_ERROR)

      expect(hasRawItem(cache, 'key')).toBeFalsy()
    })

    test('update TTL', async () => {
      const cache = await DiskCache.create()
      cache.set('key', Buffer.from('value'), 100)

      cache.set('key', Buffer.from('value'), 500)
      await delay(400 + TIME_ERROR)

      expect(hasRawItem(cache, 'key')).toBeTruthy()
    })

    test('edge: delete multiple items', async () => {
      const cache = await DiskCache.create()

      cache.set('key1', Buffer.from('value'), 100)
      cache.set('key2', Buffer.from('value'), 100)
      await delay(1000 + TIME_ERROR)

      expect(hasRawItem(cache, 'key1')).toBeFalsy()
      expect(hasRawItem(cache, 'key2')).toBeFalsy()
    })

    test('edge: schedule next cleaner', async () => {
      const cache = await DiskCache.create()

      cache.set('key1', Buffer.from('value'), 100)
      cache.set('key2', Buffer.from('value'), 500)
      await delay(1000 + TIME_ERROR)

      expect(hasRawItem(cache, 'key1')).toBeFalsy()
      expect(hasRawItem(cache, 'key2')).toBeFalsy()
    })
  })

  describe('has', () => {
    test('item exists', async () => {
      const cache = await DiskCache.create()
      setRawItem(cache, {
        key: 'key'
      , value: Buffer.from('value')
      , updated_at: 0
      , time_to_live: null
      })

      const result = cache.has('key')

      expect(result).toBe(true)
    })

    test('item does not exist', async () => {
      const cache = await DiskCache.create()

      const result = cache.has('key')

      expect(result).toBe(false)
    })
  })

  describe('get', () => {
    test('item exists', async () => {
      const cache = await DiskCache.create()
      const value = Buffer.from('value')
      setRawItem(cache, {
        key: 'key'
      , value
      , updated_at: 0
      , time_to_live: null
      })

      const result = cache.get('key')

      expect(result).toStrictEqual(value)
    })

    test('item does not exist', async () => {
      const cache = await DiskCache.create()

      const result = cache.get('key')

      expect(result).toBeUndefined()
    })
  })

  describe('getWithMetadata', () => {
    test('item exists', async () => {
      const cache = await DiskCache.create()
      const value = Buffer.from('value')
      setRawItem(cache, {
        key: 'key'
      , value
      , updated_at: 0
      , time_to_live: null
      })

      const result = cache.getWithMetadata('key')

      expect(result).toStrictEqual({
        value
      , updatedAt: 0
      , timeToLive: null
      })
    })

    test('item does not exist', async () => {
      const cache = await DiskCache.create()

      const result = cache.getWithMetadata('key')

      expect(result).toBeUndefined()
    })
  })

  describe('set', () => {
    test('item exists', async () => {
      vi.useFakeTimers({ now: 1000 })
      try {
        const cache = await DiskCache.create()
        const value = Buffer.from('value')
        setRawItem(cache, {
          key: 'key'
        , value
        , updated_at: 0
        , time_to_live: null
        })
        const newValue = Buffer.from('new value')

        cache.set('key', newValue, 3600)

        const item = getRawItem(cache, 'key')
        expect(item).toEqual({
          key: 'key'
        , value: newValue
        , updated_at: 1000
        , time_to_live: 3600
        })
      } finally {
        vi.useRealTimers()
      }
    })

    test('data does not exist', async () => {
      vi.useFakeTimers({ now: 1000 })
      try {
        const cache = await DiskCache.create()
        const value = Buffer.from('value')

        cache.set('key', value, 3600)

        const item = getRawItem(cache, 'key')
        expect(item).toEqual({
          key: 'key'
        , value
        , updated_at: 1000
        , time_to_live: 3600
        })
      } finally {
        vi.useRealTimers()
      }
    })
  })

  test('delete', async () => {
    const cache = await DiskCache.create()
    const value = Buffer.from('value')
    setRawItem(cache, {
      key: 'key'
    , value
    , updated_at: 0
    , time_to_live: null
    })

    const result = cache.delete('key')

    expect(result).toBeUndefined()
    expect(hasRawItem(cache, 'key')).toBeFalsy()
  })

  test('clear', async () => {
    const cache = await DiskCache.create()
    setRawItem(cache, {
      key: 'key'
    , value: Buffer.from('value')
    , updated_at: 0
    , time_to_live: null
    })

    const result = cache.clear()

    expect(result).toBeUndefined()
    expect(hasRawItem(cache, 'key')).toBeFalsy()
  })

  describe('keys', () => {
    test('general', async () => {
      const cache = await DiskCache.create()
      setRawItem(cache, {
        key: 'key'
      , value: Buffer.from('value')
      , updated_at: 0
      , time_to_live: null
      })

      const iter = cache.keys()
      const result = toArray(iter)

      expect(result).toStrictEqual(['key'])
    })

    test('edge: read while getting keys', async () => {
      const cache = await DiskCache.create()
      setRawItem(cache, {
        key: 'key'
      , value: Buffer.from('value')
      , updated_at: 0
      , time_to_live: null
      })

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
      const cache = await DiskCache.create()
      setRawItem(cache, {
        key: 'key'
      , value: Buffer.from('value')
      , updated_at: 0
      , time_to_live: null
      })

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
      const cache = await DiskCache.create()

      cache.close()
    })

    test('create, set, close', async () => {
      const cache = await DiskCache.create()
      cache.set('key', Buffer.from('value'), 1000)

      cache.close()
    })
  })

  test('clearExpiredItems', async () => {
    vi.useFakeTimers({ now: 0 })
    try {
      const cache = await DiskCache.create()
      const value = Buffer.from('value')
      setRawItem(cache, {
        key: '#1'
      , value
      , updated_at: 0
      , time_to_live: null
      })
      setRawItem(cache, {
        key: '#2'
      , value
      , updated_at: 0
      , time_to_live: 100
      })
      setRawItem(cache, {
        key: '#3'
      , value
      , updated_at: 0
      , time_to_live: 300
      })

      cache._clearExpiredItems(200)
      
      expect(hasRawItem(cache, '#1')).toBeTruthy()
      expect(hasRawItem(cache, '#2')).toBeFalsy()
      expect(hasRawItem(cache, '#3')).toBeTruthy()
    } finally {
      vi.useRealTimers()
    }
  })
})

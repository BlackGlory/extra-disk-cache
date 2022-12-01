import { setRawItem, getRawItem, hasRawItem } from '@test/utils'
import { DiskCache } from '@src/disk-cache'
import { delay } from 'extra-promise'
import { toArray } from '@blackglory/prelude'
import '@blackglory/jest-matchers'

const TIME_ERROR = 1

describe('DiskCache', () => {
  it('will delete items automatically', async () => {
    const cache = await DiskCache.create()
    cache.set('key', Buffer.from('value'), Date.now(), 100)

    await delay(201 + TIME_ERROR)

    expect(hasRawItem(cache, 'key')).toBeFalsy()
  })

  describe('has', () => {
    describe('item exists', () => {
      it('return true', async () => {
        const cache = await DiskCache.create()
        setRawItem(cache, {
          key: 'key'
        , value: Buffer.from('value')
        , updated_at: 0
        , time_to_live: 0
        })

        const result = cache.has('key')

        expect(result).toBe(true)
      })
    })

    describe('item does not exist', () => {
      it('return false', async () => {
        const cache = await DiskCache.create()

        const result = cache.has('key')

        expect(result).toBe(false)
      })
    })
  })

  describe('get', () => {
    describe('item exists', () => {
      it('return item', async () => {
        const cache = await DiskCache.create()
        const value = Buffer.from('value')
        setRawItem(cache, {
          key: 'key'
        , value
        , updated_at: 0
        , time_to_live: 0
        })

        const result = cache.get('key')

        expect(result).toStrictEqual({
          value
        , updatedAt: 0
        , timeToLive: 0
        })
      })
    })

    describe('item does not exist', () => {
      it('return item', async () => {
        const cache = await DiskCache.create()

        const result = cache.get('key')

        expect(result).toBeUndefined()
      })
    })
  })

  describe('set', () => {
    test('item exists', async () => {
      const cache = await DiskCache.create()
      const value = Buffer.from('value')
      setRawItem(cache, {
        key: 'key'
      , value
      , updated_at: 0
      , time_to_live: 0
      })
      const newValue = Buffer.from('new value')

      const result = cache.set('key', newValue, 1800, 3600)

      expect(result).toBeUndefined()
      expect(getRawItem(cache, 'key')).toEqual({
        key: 'key'
      , value: newValue
      , updated_at: 1800
      , time_to_live: 3600
      })
    })

    test('data does not exist', async () => {
      const cache = await DiskCache.create()
      const value = Buffer.from('value')
      const result = cache.set('key', value, 1800, 3600)

      expect(result).toBeUndefined()
      expect(getRawItem(cache, 'key')).toEqual({
        key: 'key'
      , value
      , updated_at: 1800
      , time_to_live: 3600
      })
    })
  })

  test('delete', async () => {
    const cache = await DiskCache.create()
    const value = Buffer.from('value')
    setRawItem(cache, {
      key: 'key'
    , value
    , updated_at: 0
    , time_to_live: 0
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
    , time_to_live: 0
    })

    const result = cache.clear()

    expect(result).toBeUndefined()
    expect(hasRawItem(cache, 'key')).toBeFalsy()
  })

  describe('keys', () => {
    test('normal', async () => {
      const cache = await DiskCache.create()
      setRawItem(cache, {
        key: 'key'
      , value: Buffer.from('value')
      , updated_at: 0
      , time_to_live: 0
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
      , time_to_live: 0
      })

      const iter = cache.keys()
      const key = cache.get('key')
      const result = iter.next()

      expect(key).toStrictEqual({
        value: Buffer.from('value')
      , updatedAt: 0
      , timeToLive: 0
      })
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
      , time_to_live: 0
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
      cache.set('key', Buffer.from('value'), Date.now(), 1000)

      cache.close()
    })
  })

  test('clearExpiredItems', async () => {
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
    , time_to_live: 200
    })

    cache._clearExpiredItems(150)
    
    expect(hasRawItem(cache, '#1')).toBeTruthy()
    expect(hasRawItem(cache, '#2')).toBeFalsy()
    expect(hasRawItem(cache, '#3')).toBeTruthy()
  })
})

import {
  diskCache
, initializeDiskCache
, clearDiskCache
, setRawItem
, getRawItem
, hasRawItem
} from '@test/utils'
import { delay } from 'extra-promise'
import { toArray } from '@blackglory/prelude'
import '@blackglory/jest-matchers'

beforeEach(initializeDiskCache)
afterEach(clearDiskCache)

const TIME_ERROR = 1

describe('DiskCache', () => {
  it('will delete items automatically', async () => {
    diskCache.set('key', Buffer.from('value'), Date.now(), 100)

    await delay(201 + TIME_ERROR)

    expect(diskCache.has('key')).toBeFalsy()
  })

  describe('has', () => {
    describe('item exists', () => {
      it('return true', () => {
        setRawItem({
          key: 'key'
        , value: Buffer.from('value')
        , updated_at: 0
        , time_to_live: 0
        })

        const result = diskCache.has('key')

        expect(result).toBe(true)
      })
    })

    describe('item does not exist', () => {
      it('return false', () => {
        const result = diskCache.has('key')

        expect(result).toBe(false)
      })
    })
  })

  describe('get', () => {
    describe('item exists', () => {
      it('return item', () => {
        const value = Buffer.from('value')
        setRawItem({
          key: 'key'
        , value
        , updated_at: 0
        , time_to_live: 0
        })

        const result = diskCache.get('key')

        expect(result).toStrictEqual({
          value
        , updatedAt: 0
        , timeToLive: 0
        })
      })
    })

    describe('item does not exist', () => {
      it('return item', () => {
        const result = diskCache.get('key')

        expect(result).toBeUndefined()
      })
    })
  })

  describe('set', () => {
    test('item exists', () => {
      const value = Buffer.from('value')
      setRawItem({
        key: 'key'
      , value
      , updated_at: 0
      , time_to_live: 0
      })
      const newValue = Buffer.from('new value')

      const result = diskCache.set('key', newValue, 1800, 3600)

      expect(result).toBeUndefined()
      expect(getRawItem('key')).toEqual({
        key: 'key'
      , value: newValue
      , updated_at: 1800
      , time_to_live: 3600
      })
    })

    test('data does not exist', () => {
      const value = Buffer.from('value')
      const result = diskCache.set('key', value, 1800, 3600)

      expect(result).toBeUndefined()
      expect(getRawItem('key')).toEqual({
        key: 'key'
      , value
      , updated_at: 1800
      , time_to_live: 3600
      })
    })
  })

  test('delete', () => {
    const value = Buffer.from('value')
    setRawItem({
      key: 'key'
    , value
    , updated_at: 0
    , time_to_live: 0
    })

    const result = diskCache.delete('key')

    expect(result).toBeUndefined()
    expect(hasRawItem('key')).toBeFalsy()
  })

  test('clear', () => {
    setRawItem({
      key: 'key'
    , value: Buffer.from('value')
    , updated_at: 0
    , time_to_live: 0
    })

    const result = diskCache.clear()

    expect(result).toBeUndefined()
    expect(hasRawItem('key')).toBeFalsy()
  })

  test('keys', () => {
    setRawItem({
      key: 'key'
    , value: Buffer.from('value')
    , updated_at: 0
    , time_to_live: 0
    })

    const iter = diskCache.keys()
    const result = toArray(iter)

    expect(result).toStrictEqual(['key'])
  })

  test('clearExpiredItems', () => {
    const value = Buffer.from('value')
    setRawItem({
      key: '#1'
    , value
    , updated_at: 0
    , time_to_live: null
    })
    setRawItem({
      key: '#2'
    , value
    , updated_at: 0
    , time_to_live: 100
    })
    setRawItem({
      key: '#3'
    , value
    , updated_at: 0
    , time_to_live: 200
    })

    diskCache._clearExpiredItems(150)
    
    expect(hasRawItem('#1')).toBeTruthy()
    expect(hasRawItem('#2')).toBeFalsy()
    expect(hasRawItem('#3')).toBeTruthy()
  })
})

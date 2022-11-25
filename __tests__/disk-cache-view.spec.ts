import {
  diskCache
, initializeDiskCache
, clearDiskCache
, setRawItem
, getRawItem
, hasRawItem
} from '@test/utils'
import { DiskCacheView } from '@src/disk-cache-view'
import { toArray } from '@blackglory/prelude'
import '@blackglory/jest-matchers'

beforeEach(initializeDiskCache)
afterEach(clearDiskCache)

describe('DiskCacheView', () => {
  describe('has', () => {
    describe('item exists', () => {
      it('return true', () => {
        setRawItem({
          key: 'key'
        , value: Buffer.from('value')
        , updated_at: 0
        , time_to_live: 0
        })
        const view = createView()

        const result = view.has('key')

        expect(result).toBe(true)
      })
    })

    describe('item does not exist', () => {
      it('return false', () => {
        const view = createView()

        const result = view.has('key')

        expect(result).toBe(false)
      })
    })
  })

  describe('get', () => {
    describe('item exists', () => {
      it('return item', () => {
        setRawItem({
          key: 'key'
        , value: Buffer.from('value')
        , updated_at: 0
        , time_to_live: 0
        })
        const view = createView()

        const result = view.get('key')

        expect(result).toStrictEqual({
          value: 'value'
        , updatedAt: 0
        , timeToLive: 0
        })
      })
    })

    describe('item does not exist', () => {
      it('return item', () => {
        const view = createView()

        const result = view.get('key')

        expect(result).toBeUndefined()
      })
    })
  })

  describe('set', () => {
    test('item exists', () => {
      setRawItem({
        key: 'key'
      , value: Buffer.from('value')
      , updated_at: 0
      , time_to_live: 0
      })
      const view = createView()
      const newValue = 'new value'

      const result = view.set('key', newValue, 1800, 3600)

      expect(result).toBeUndefined()
      expect(getRawItem('key')).toEqual({
        key: 'key'
      , value: Buffer.from(newValue)
      , updated_at: 1800
      , time_to_live: 3600
      })
    })

    test('data does not exist', () => {
      const view = createView()

      const result = view.set('key', 'value', 1800, 3600)

      expect(result).toBeUndefined()
      expect(getRawItem('key')).toEqual({
        key: 'key'
      , value: Buffer.from('value')
      , updated_at: 1800
      , time_to_live: 3600
      })
    })
  })

  test('delete', () => {
    setRawItem({
      key: 'key'
    , value: Buffer.from('value')
    , updated_at: 0
    , time_to_live: 0
    })
    const view = createView()

    const result = view.delete('key')

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
    const view = createView()

    const result = view.clear()

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
    const view = createView()

    const iter = view.keys()
    const result = toArray(iter)

    expect(result).toStrictEqual(['key'])
  })
})

function createView(): DiskCacheView<string, string> {
  return new DiskCacheView<string, string>(
    diskCache
  , {
      toString: x => x
    , fromString: x => x
    }
  , { 
      fromBuffer: x => x.toString()
    , toBuffer: x => Buffer.from(x)
    }
  )
}

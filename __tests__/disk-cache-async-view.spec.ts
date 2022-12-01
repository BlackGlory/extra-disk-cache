import { setRawItem, getRawItem, hasRawItem } from '@test/utils'
import { DiskCacheAsyncView } from '@src/disk-cache-async-view'
import { delay } from 'extra-promise'
import { DiskCache } from '@src/disk-cache'
import { toArrayAsync } from '@blackglory/prelude'
import '@blackglory/jest-matchers'

describe('DiskCacheAsyncView', () => {
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
        const view = createView(cache)

        const result = await view.has('key')

        expect(result).toBe(true)
      })
    })

    describe('item does not exist', () => {
      it('return false', async () => {
        const cache = await DiskCache.create()
        const view = createView(cache)

        const result = await view.has('key')

        expect(result).toBe(false)
      })
    })
  })

  describe('get', () => {
    describe('item exists', () => {
      it('return item', async () => {
        const cache = await DiskCache.create()
        setRawItem(cache, {
          key: 'key'
        , value: Buffer.from('value')
        , updated_at: 0
        , time_to_live: 0
        })
        const view = createView(cache)

        const result = await view.get('key')

        expect(result).toStrictEqual({
          value: 'value'
        , updatedAt: 0
        , timeToLive: 0
        })
      })
    })

    describe('item does not exist', () => {
      it('return item', async () => {
        const cache = await DiskCache.create()
        const view = createView(cache)

        const result = await view.get('key')

        expect(result).toBeUndefined()
      })
    })
  })

  describe('set', () => {
    test('item exists', async () => {
      const cache = await DiskCache.create()
      setRawItem(cache, {
        key: 'key'
      , value: Buffer.from('value')
      , updated_at: 0
      , time_to_live: 0
      })
      const view = createView(cache)
      const newValue = 'new value'

      const result = await view.set('key', newValue, 1800, 3600)

      expect(result).toBeUndefined()
      expect(getRawItem(cache, 'key')).toEqual({
        key: 'key'
      , value: Buffer.from(newValue)
      , updated_at: 1800
      , time_to_live: 3600
      })
    })

    test('data does not exist', async () => {
      const cache = await DiskCache.create()
      const view = createView(cache)

      const result = await view.set('key', 'value', 1800, 3600)

      expect(result).toBeUndefined()
      expect(getRawItem(cache, 'key')).toEqual({
        key: 'key'
      , value: Buffer.from('value')
      , updated_at: 1800
      , time_to_live: 3600
      })
    })
  })

  test('delete', async () => {
    const cache = await DiskCache.create()
    setRawItem(cache, {
      key: 'key'
    , value: Buffer.from('value')
    , updated_at: 0
    , time_to_live: 0
    })
    const view = createView(cache)

    const result = await view.delete('key')

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
    const view = createView(cache)

    const result = view.clear()

    expect(result).toBeUndefined()
    expect(hasRawItem(cache, 'key')).toBeFalsy()
  })

  test('keys', async () => {
    const cache = await DiskCache.create()
    setRawItem(cache, {
      key: 'key'
    , value: Buffer.from('value')
    , updated_at: 0
    , time_to_live: 0
    })
    const view = createView(cache)

    const iter = view.keys()
    const result = await toArrayAsync(iter)

    expect(result).toStrictEqual(['key'])
  })
})

function createView(cache: DiskCache): DiskCacheAsyncView<string, string> {
  return new DiskCacheAsyncView<string, string>(
    cache
  , {
      toString: async x => {
        await delay(0)
        return x
      }
    , fromString: async x => {
        await delay(0)
        return x
      }
    }
  , { 
      fromBuffer: async x => {
        await delay(0)
        return x.toString()
      }
    , toBuffer: async x => {
        await delay(0)
        return Buffer.from(x)
      }
    }
  )
}

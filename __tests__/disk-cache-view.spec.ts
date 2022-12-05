import { setRawItem, getRawItem, hasRawItem } from '@test/utils'
import { DiskCacheView } from '@src/disk-cache-view'
import { DiskCache } from '@src/disk-cache'
import { toArray } from '@blackglory/prelude'
import { PassthroughKeyConverter, PrefixKeyConverter } from '@src/converters'
import '@blackglory/jest-matchers'

describe('DiskCacheView', () => {
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

        const result = view.has('key')

        expect(result).toBe(true)
      })
    })

    describe('item does not exist', () => {
      it('return false', async () => {
        const cache = await DiskCache.create()
        const view = createView(cache)

        const result = view.has('key')

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

        const result = view.get('key')

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

        const result = view.get('key')

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

      const result = view.set('key', newValue, 1800, 3600)

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

      const result = view.set('key', 'value', 1800, 3600)

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

    const result = view.delete('key')

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

  describe('keys', () => {
    test('non-undefined', async () => {
      const cache = await DiskCache.create()
      setRawItem(cache, {
        key: 'key'
      , value: Buffer.from('value')
      , updated_at: 0
      , time_to_live: 0
      })
      const view = createView(cache)

      const iter = view.keys()
      const result = toArray(iter)

      expect(result).toStrictEqual(['key'])
    })

    test('undefined', async () => {
      const cache = await DiskCache.create()
      setRawItem(cache, {
        key: 'non-prefix-key'
      , value: Buffer.from('value')
      , updated_at: 0
      , time_to_live: 0
      })
      setRawItem(cache, {
        key: 'prefix-key'
      , value: Buffer.from('value')
      , updated_at: 0
      , time_to_live: 0
      })
      const view = createViewWithPrefix(cache, 'prefix-')

      const iter = view.keys()
      const result = toArray(iter)

      expect(result).toStrictEqual(['key'])
    })
  })
})

function createViewWithPrefix(cache: DiskCache, prefix: string): DiskCacheView<string, string> {
  return new DiskCacheView(
    cache
  , new PrefixKeyConverter(
      new PassthroughKeyConverter()
    , prefix
    )
  , { 
      fromBuffer: x => x.toString()
    , toBuffer: x => Buffer.from(x)
    }
  )
}

function createView(cache: DiskCache): DiskCacheView<string, string> {
  return new DiskCacheView<string, string>(
    cache
  , new PassthroughKeyConverter()
  , { 
      fromBuffer: x => x.toString()
    , toBuffer: x => Buffer.from(x)
    }
  )
}

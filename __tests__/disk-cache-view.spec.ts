import { setRawItem, getRawItem, hasRawItem } from '@test/utils'
import { DiskCacheView } from '@src/disk-cache-view'
import { DiskCache } from '@src/disk-cache'
import { toArray } from '@blackglory/prelude'
import { PassthroughKeyConverter, PrefixKeyConverter } from '@src/converters'

describe('DiskCacheView', () => {
  describe('has', () => {
    test('item exists', async () => {
      const cache = await DiskCache.create()
      setRawItem(cache, {
        key: 'key'
      , value: Buffer.from('value')
      , updated_at: 0
      , time_to_live: null
      })
      const view = createView(cache)

      const result = view.has('key')

      expect(result).toBe(true)
    })

    test('item does not exist', async () => {
      const cache = await DiskCache.create()
      const view = createView(cache)

      const result = view.has('key')

      expect(result).toBe(false)
    })
  })

  describe('get', () => {
    test('item exists', async () => {
      const cache = await DiskCache.create()
      setRawItem(cache, {
        key: 'key'
      , value: Buffer.from('value')
      , updated_at: 0
      , time_to_live: null
      })
      const view = createView(cache)

      const result = view.get('key')

      expect(result).toBe('value')
    })

    test('item does not exist', async () => {
      const cache = await DiskCache.create()
      const view = createView(cache)

      const result = view.get('key')

      expect(result).toBeUndefined()
    })
  })

  describe('getWithMetadata', () => {
    test('item exists', async () => {
      const cache = await DiskCache.create()
      setRawItem(cache, {
        key: 'key'
      , value: Buffer.from('value')
      , updated_at: 0
      , time_to_live: null
      })
      const view = createView(cache)

      const result = view.getWithMetadata('key')

      expect(result).toStrictEqual({
        value: 'value'
      , updatedAt: 0
      , timeToLive: null
      })
    })

    test('item does not exist', async () => {
      const cache = await DiskCache.create()
      const view = createView(cache)

      const result = view.getWithMetadata('key')

      expect(result).toBeUndefined()
    })
  })

  describe('set', () => {
    test('item exists', async () => {
      jest.useFakeTimers({ now: 1000 })
      try {
        const cache = await DiskCache.create()
        setRawItem(cache, {
          key: 'key'
        , value: Buffer.from('value')
        , updated_at: 0
        , time_to_live: null
        })
        const view = createView(cache)
        const newValue = 'new value'

        view.set('key', newValue, 3600)

        expect(getRawItem(cache, 'key')).toEqual({
          key: 'key'
        , value: Buffer.from(newValue)
        , updated_at: 1000
        , time_to_live: 3600
        })
      } finally {
        jest.useRealTimers()
      }
    })

    test('data does not exist', async () => {
      jest.useFakeTimers({ now: 1000 })
      try {
        const cache = await DiskCache.create()
        const view = createView(cache)

        view.set('key', 'value', 3600)

        expect(getRawItem(cache, 'key')).toEqual({
          key: 'key'
        , value: Buffer.from('value')
        , updated_at: 1000
        , time_to_live: 3600
        })
      } finally {
        jest.useRealTimers()
      }
    })
  })

  test('delete', async () => {
    const cache = await DiskCache.create()
    setRawItem(cache, {
      key: 'key'
    , value: Buffer.from('value')
    , updated_at: 0
    , time_to_live: null
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
    , time_to_live: null
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
      , time_to_live: null
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
      , time_to_live: null
      })
      setRawItem(cache, {
        key: 'prefix-key'
      , value: Buffer.from('value')
      , updated_at: 0
      , time_to_live: null
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

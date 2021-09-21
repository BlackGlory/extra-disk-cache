import {
  diskCache
, initializeDiskCache
, clearDiskCache
, setRawData
, setRawMetadata
, getRawData
, getRawMetadata
, hasRawData
, hasRawMetadata
} from '@test/utils'
import { delay } from 'extra-promise'
import '@blackglory/jest-matchers'

beforeEach(initializeDiskCache)
afterEach(clearDiskCache)

describe('DiskCache', () => {
  describe('Behavior', () => {
    it('will delete items automatically', async () => {
      await diskCache.set('key', Buffer.from('value'), Date.now(), 100, 100)

      await delay(201)

      expect(await diskCache.hasData('key')).toBeFalsy()
      expect(diskCache.hasMetadata('key')).toBeFalsy()
    })
  })

  describe('API', () => {
    describe('hasData(key: string): Promise<boolean>', () => {
      describe('data exists', () => {
        it('return true', async () => {
          await setRawData('key', Buffer.from('value'))

          const result = diskCache.hasData('key')
          const proResult = await result

          expect(result).toBePromise()
          expect(proResult).toBe(true)
        })
      })

      describe('data does not exist', () => {
        it('return false', async () => {
          const result = diskCache.hasData('key')
          const proResult = await result

          expect(result).toBePromise()
          expect(proResult).toBe(false)
        })
      })
    })

    describe('hasMetadata(key: string): boolean', () => {
      describe('metadata exists', () => {
        it('return true', () => {
          setRawMetadata({
            key: 'key'
          , updated_at: 0
          , time_to_live: 0
          , time_before_deletion: undefined
          })

          const result = diskCache.hasMetadata('key')

          expect(result).toBe(true)
        })
      })

      describe('metadata does not exist', () => {
        it('return false', () => {
          const result = diskCache.hasMetadata('key')

          expect(result).toBe(false)
        })
      })
    })

    describe('getData(key: string)', () => {
      describe('data exists', () => {
        it('return Buffer', async () => {
          const data = Buffer.from('value')
          setRawData('key', data)

          const result = diskCache.getData('key')
          const proResult = await result

          expect(result).toBePromise()
          expect(proResult).not.toBeUndefined()
          expect(proResult!.equals(data)).toBeTruthy()
        })
      })

      describe('data does not exist', () => {
        it('return undefined', async () => {
          const result = diskCache.getData('key')
          const proResult = await result

          expect(result).toBePromise()
          expect(proResult).toBeUndefined()
        })
      })
    })

    describe('getMetadata(key: string): IMetadata | undefined', () => {
      describe('metadata exists', () => {
        it('return IMetadata', () => {
          setRawMetadata({
            key: 'key'
          , updated_at: 0
          , time_to_live: 0
          , time_before_deletion: undefined
          })

          const result = diskCache.getMetadata('key')

          expect(result).toStrictEqual({
            updatedAt: 0
          , timeToLive: 0
          , timeBeforeDeletion: null
          })
        })
      })

      describe('metadata does not exist', () => {
        it('return undefined', () => {
          const result = diskCache.getMetadata('key')

          expect(result).toBeUndefined()
        })
      })
    })

    describe(`
      set(
        key: string
      , value: Buffer
      , updatedAt: number
      , timeToLive: number
      , timeBeforeDeletion?: number
      ): Promise<void>
    `, () => {
      test('data exists', async () => {
        const data = Buffer.from('value')
        await setRawData('key', data)
        setRawMetadata({
          key: 'key'
        , updated_at: 0
        , time_to_live: 0
        , time_before_deletion: 3600
        })
        const newData = Buffer.from('new value')

        const result = diskCache.set('key', newData, 1800, 3600, undefined)
        const proResult = await result

        expect(result).toBePromise()
        expect(proResult).toBeUndefined()
        expect((await getRawData('key')).equals(newData)).toBeTruthy()
        expect(getRawMetadata('key')).toEqual({
          key: 'key'
        , updated_at: 1800
        , time_to_live: 3600
        , time_before_deletion: null
        })
      })

      test('data does not exist', async () => {
        const data = Buffer.from('value')
        const result = diskCache.set('key', data, 1800, 3600, undefined)
        const proResult = await result

        expect(result).toBePromise()
        expect(proResult).toBeUndefined()
        expect((await getRawData('key')).equals(data)).toBeTruthy()
        expect(getRawMetadata('key')).toEqual({
          key: 'key'
        , updated_at: 1800
        , time_to_live: 3600
        , time_before_deletion: null
        })
      })
    })

    describe('setData(key: string, value: Buffer): Promise<void>', () => {
      test('data exists', async () => {
        const data = Buffer.from('value')
        await setRawData('key', data)
        const newData = Buffer.from('new value')

        const result = diskCache.setData('key', newData)
        const proResult = await result
        
        expect(result).toBePromise()
        expect(proResult).toBeUndefined()
        expect((await getRawData('key')).equals(newData)).toBeTruthy()
      })

      test('data does not exist', async () => {
        const data = Buffer.from('value')

        const result = diskCache.setData('key', data)
        const proResult = await result
        
        expect(result).toBePromise()
        expect(proResult).toBeUndefined()
        expect((await getRawData('key')).equals(data)).toBeTruthy()
      })
    })

    describe(`
      setMetadata(
        key: string
      , updatedAt: number
      , timeToLive: number
      , timeBeforeDeletion?: number
      ): void
    `, () => {
      test('metadata exists', () => {
        setRawMetadata({
          key: 'key'
        , updated_at: 0
        , time_to_live: 0
        , time_before_deletion: 3600
        })

        const result = diskCache.setMetadata('key', 1800, 3600, undefined)

        expect(result).toBeUndefined()
        expect(getRawMetadata('key')).toEqual({
          key: 'key'
        , updated_at: 1800
        , time_to_live: 3600
        , time_before_deletion: null
        })
      })

      test('metadata does not exist', () => {
        const result = diskCache.setMetadata('key', 1800, 3600, undefined)

        expect(result).toBeUndefined()
        expect(getRawMetadata('key')).toEqual({
          key: 'key'
        , updated_at: 1800
        , time_to_live: 3600
        , time_before_deletion: null
        })
      })
    })

    test('delete(key: string): Promise<void>', async () => {
      await setRawData('key', Buffer.from('value'))
      setRawMetadata({
        key: 'key'
      , updated_at: 0
      , time_to_live: 0
      , time_before_deletion: undefined
      })

      const result = diskCache.delete('key')
      const proResult = await result

      expect(result).toBePromise()
      expect(proResult).toBeUndefined()
      expect(await hasRawData('key')).toBeFalsy()
      expect(hasRawMetadata('key')).toBeFalsy()
    })

    describe('deleteData(key: string): Promise<void>', () => {
      test('data exists', async () => {
        await setRawData('key', Buffer.from('value'))

        const result = diskCache.deleteData('key')
        const proResult = await result

        expect(result).toBePromise()
        expect(proResult).toBeUndefined()
        expect(await hasRawData('key')).toBeFalsy()
      })

      test('data does not exist', async () => {
        const result = diskCache.deleteData('key')
        const proResult = await result

        expect(result).toBePromise()
        expect(proResult).toBeUndefined()
        expect(await hasRawData('key')).toBeFalsy()
      })
    })

    describe('deleteMetadata(key: string): void', () => {
      test('metadata exists', () => {
        setRawMetadata({
          key: 'key'
        , updated_at: 0
        , time_to_live: 0
        , time_before_deletion: undefined
        })

        const result = diskCache.deleteMetadata('key')

        expect(result).toBeUndefined()
        expect(hasRawMetadata('key')).toBeFalsy()
      })

      test('metadata does not exists', () => {
        const result = diskCache.deleteMetadata('key')

        expect(result).toBeUndefined()
        expect(hasRawMetadata('key')).toBeFalsy()
      })
    })

    test('clear(): Promise<void>', async () => {
      await setRawData('key', Buffer.from('value'))
      setRawMetadata({
        key: 'key'
      , updated_at: 0
      , time_to_live: 0
      , time_before_deletion: undefined
      })

      const result = diskCache.clear()
      const proResult = await result

      expect(result).toBePromise()
      expect(proResult).toBeUndefined()
      expect(await hasRawData('key')).toBeFalsy()
      expect(hasRawMetadata('key')).toBeFalsy()
    })

    test('clearData(): Promise<void>', async () => {
      await setRawData('key', Buffer.from('value'))

      const result = diskCache.clearData()
      const proResult = await result

      expect(result).toBePromise()
      expect(proResult).toBeUndefined()
      expect(await hasRawData('key')).toBeFalsy()
    })

    test('clearMetadata(): void', () => {
      setRawMetadata({
        key: 'key'
      , updated_at: 0
      , time_to_live: 0
      , time_before_deletion: undefined
      })

      const result = diskCache.clearMetadata()

      expect(result).toBeUndefined()
      expect(hasRawMetadata('key')).toBeFalsy()
    })

    describe('deleteOrphanedItems(): Promise<void>', () => {
      test('orphaned data', async () => {
        setRawData('orphan', Buffer.from('value'))
        setRawData('key', Buffer.from('value'))
        setRawMetadata({
          key: 'key'
        , updated_at: 0
        , time_to_live: 0
        , time_before_deletion: undefined
        })

        await diskCache.deleteOrphanedItems()

        expect(await hasRawData('orpah')).toBeFalsy()
        expect(hasRawMetadata('orpah')).toBeFalsy()
        expect(await hasRawData('key')).toBeTruthy()
        expect(hasRawMetadata('key')).toBeTruthy()
      })

      test('orphaned metadata', async () => {
        setRawMetadata({
          key: 'orphan'
        , updated_at: 0
        , time_to_live: 0
        , time_before_deletion: undefined
        })
        setRawData('key', Buffer.from('value'))
        setRawMetadata({
          key: 'key'
        , updated_at: 0
        , time_to_live: 0
        , time_before_deletion: undefined
        })

        await diskCache.deleteOrphanedItems()

        expect(await hasRawData('orphan')).toBeFalsy()
        expect(hasRawMetadata('orphan')).toBeFalsy()
        expect(await hasRawData('key')).toBeTruthy()
        expect(hasRawMetadata('key')).toBeTruthy()
      })
    })

    test('purgeDeleteableItems(timestamp: number): Promise<void>', async () => {
      setRawMetadata({
        key: '#1'
      , updated_at: 0
      , time_to_live: 100
      , time_before_deletion: undefined
      })
      setRawData('#1', Buffer.from('value'))
      setRawMetadata({
        key: '#2'
      , updated_at: 0
      , time_to_live: 100
      , time_before_deletion: 100
      })
      setRawData('#2', Buffer.from('value'))
      setRawMetadata({
        key: '#3'
      , updated_at: 0
      , time_to_live: 100
      , time_before_deletion: 200
      })
      setRawData('#3', Buffer.from('value'))

      await diskCache.purgeDeleteableItems(201)
      
      expect(await hasRawData('#1')).toBeTruthy()
      expect(hasRawMetadata('#1')).toBeTruthy()
      expect(await hasRawData('#2')).toBeFalsy()
      expect(hasRawMetadata('#2')).toBeFalsy()
      expect(await hasRawData('#3')).toBeTruthy()
      expect(hasRawMetadata('#3')).toBeTruthy()
    })
  })
})

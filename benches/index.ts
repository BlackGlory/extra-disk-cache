import { Benchmark } from 'extra-benchmark'
import { go } from '@blackglory/prelude'
import {
  DiskCache
, DiskCacheView
, IndexKeyConverter as CacheIndexKeyConverter
, JSONValueConverter as CacheJSONValueConverter
} from '..'
import {
  DiskStore
, DiskStoreView
, IndexKeyConverter as StoreIndexKeyConverter
, JSONValueConverter as StoreJSONValueConverter
} from 'extra-disk-store'
import { createTempFile, remove } from 'extra-filesystem'

const benchmark = new Benchmark('I/O performance')

go(async () => {
  benchmark.addCase('ExtraDiskCache (write)', async () => {
    const filename = await createTempFile()
    const cache = await DiskCache.create(filename)
    const view = new DiskCacheView(
      cache
    , new CacheIndexKeyConverter()
    , new CacheJSONValueConverter()
    )

    return {
      beforeEach() {
        cache.clear()
      }
    , iterate() {
        for (let i = 100; i--;) {
          view.set(i, i)
        }
      }
    , async afterAll() {
        cache.close()
        await remove(filename)
      }
    }
  })

  benchmark.addCase('ExtraDiskStore (write)', async () => {
    const filename = await createTempFile()
    const store = await DiskStore.create(filename)
    const view = new DiskStoreView(
      store
    , new StoreIndexKeyConverter()
    , new StoreJSONValueConverter()
    )

    return {
      beforeEach() {
        store.clear()
      }
    , iterate() {
        for (let i = 100; i--;) {
          view.set(i, i)
        }
      }
    , async afterAll() {
        store.close()
        await remove(filename)
      }
    }
  })

  benchmark.addCase('ExtraDiskCache (overwrite)', async () => {
    const filename = await createTempFile()
    const cache = await DiskCache.create(filename)
    const view = new DiskCacheView(
      cache
    , new CacheIndexKeyConverter()
    , new CacheJSONValueConverter()
    )
    for (let i = 100; i--;) {
      view.set(i, i)
    }

    return {
      iterate() {
        for (let i = 100; i--;) {
          view.set(i, i)
        }
      }
    , async afterAll() {
        cache.close()
        await remove(filename)
      }
    }
  })

  benchmark.addCase('ExtraDiskStore (overwrite)', async () => {
    const filename = await createTempFile()
    const store = await DiskStore.create(filename)
    const view = new DiskStoreView(
      store
    , new StoreIndexKeyConverter()
    , new StoreJSONValueConverter()
    )
    for (let i = 100; i--;) {
      view.set(i, i)
    }

    return {
      iterate() {
        for (let i = 100; i--;) {
          view.set(i, i)
        }
      }
    , async afterAll() {
        store.close()
        await remove(filename)
      }
    }
  })


  benchmark.addCase('ExtraDiskCache (read)', async () => {
    const filename = await createTempFile()
    const cache = await DiskCache.create(filename)
    const view = new DiskCacheView(
      cache
    , new CacheIndexKeyConverter()
    , new CacheJSONValueConverter()
    )
    for (let i = 100; i--;) {
      view.set(i, i)
    }

    return {
      iterate() {
        for (let i = 100; i--;) {
          view.get(i)
        }
      }
    , async afterAll() {
        cache.close()
        await remove(filename)
      }
    }
  })

  benchmark.addCase('ExtraDiskStore (read)', async () => {
    const filename = await createTempFile()
    const store = await DiskStore.create(filename)
    const view = new DiskStoreView(
      store
    , new StoreIndexKeyConverter()
    , new StoreJSONValueConverter()
    )
    for (let i = 100; i--;) {
      view.set(i, i)
    }

    return {
      iterate() {
        for (let i = 100; i--;) {
          view.get(i)
        }
      }
    , async afterAll() {
        store.close()
        await remove(filename)
      }
    }
  })

  console.log(benchmark.name)
  for await (const result of benchmark.run()) {
    console.log(result)
  }
})

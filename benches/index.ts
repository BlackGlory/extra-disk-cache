import { Benchmark } from 'extra-benchmark'
import { go } from '@blackglory/prelude'
import { TLRUMap } from '@blackglory/structures'
import {
  DiskCache
, DiskCacheView
, DiskCacheWithCache
, IndexKeyConverter as CacheIndexKeyConverter
, JSONValueConverter as CacheJSONValueConverter
} from '../lib/index.js'
import {
  DiskStore
, DiskStoreView
, IndexKeyConverter as StoreIndexKeyConverter
, JSONValueConverter as StoreJSONValueConverter
} from 'extra-disk-store'
import { createTempName, remove } from 'extra-filesystem'

const benchmark = new Benchmark('I/O performance')

go(async () => {
  benchmark.addCase('ExtraDiskCache (write)', async () => {
    const filename = await createTempName()
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

  benchmark.addCase('ExtraDiskCacheWithCache (write)', async () => {
    const filename = await createTempName()
    const diskCache = await DiskCache.create(filename)
    const memoryCache = new TLRUMap<string, any>(100)
    const cache = new DiskCacheWithCache(diskCache, memoryCache)
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

  benchmark.addCase('ExtraDiskStore (write, non-concurrent)', async () => {
    const store = new DiskStore()
    const view = new DiskStoreView(
      store
    , new StoreIndexKeyConverter()
    , new StoreJSONValueConverter()
    )

    return {
      beforeEach() {
        store.clear()
      }
    , async iterate() {
        for (let i = 100; i--;) {
          await view.set(i, i)
        }
      }
    , async afterAll() {
        await store.close()
      }
    }
  })

  benchmark.addCase('ExtraDiskStore (write, concurrent)', async () => {
    const store = new DiskStore()
    const view = new DiskStoreView(
      store
    , new StoreIndexKeyConverter()
    , new StoreJSONValueConverter()
    )

    return {
      beforeEach() {
        store.clear()
      }
    , async iterate() {
        const promises: Array<Promise<unknown>> = []
        for (let i = 100; i--;) {
          promises.push(view.set(i, i))
        }
        await Promise.all(promises)
      }
    , async afterAll() {
        await store.close()
      }
    }
  })

  benchmark.addCase('ExtraDiskCache (overwrite)', async () => {
    const filename = await createTempName()
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

  benchmark.addCase('ExtraDiskCacheWithCache (overwrite)', async () => {
    const filename = await createTempName()
    const diskCache = await DiskCache.create(filename)
    const memoryCache = new TLRUMap<string, any>(100)
    const cache = new DiskCacheWithCache(diskCache, memoryCache)
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
    const store = new DiskStore()
    const view = new DiskStoreView(
      store
    , new StoreIndexKeyConverter()
    , new StoreJSONValueConverter()
    )
    for (let i = 100; i--;) {
      await view.set(i, i)
    }

    return {
      async iterate() {
        const promises: Array<Promise<unknown>> = []
        for (let i = 100; i--;) {
          promises.push(view.set(i, i))
        }
        await Promise.all(promises)
      }
    , async afterAll() {
        await store.close()
      }
    }
  })


  benchmark.addCase('ExtraDiskCache (read)', async () => {
    const filename = await createTempName()
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

  benchmark.addCase('ExtraDiskCacheWithCache (read)', async () => {
    const filename = await createTempName()
    const diskCache = await DiskCache.create(filename)
    const memoryCache = new TLRUMap<string, any>(100)
    const cache = new DiskCacheWithCache(diskCache, memoryCache)
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
    const store = new DiskStore()
    const view = new DiskStoreView(
      store
    , new StoreIndexKeyConverter()
    , new StoreJSONValueConverter()
    )
    for (let i = 100; i--;) {
      await view.set(i, i)
    }

    return {
      async iterate() {
        const promises: Array<Promise<unknown>> = []
        for (let i = 100; i--;) {
          promises.push(view.get(i))
        }
        await Promise.all(promises)
      }
    , async afterAll() {
        await store.close()
      }
    }
  })

  console.log(benchmark.name)
  for await (const result of benchmark.run()) {
    console.log(result)
  }
})

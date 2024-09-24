import { Benchmark } from 'extra-benchmark'
import { go } from '@blackglory/prelude'
import { TLRUMap } from '@blackglory/structures'
import {
  DiskCache
, DiskCacheView
, DiskCacheWithCache
, IndexKeyConverter
, JSONValueConverter
} from '../lib/index.js'
import { createTempName, remove } from 'extra-filesystem'

const benchmark = new Benchmark('I/O performance')

go(async () => {
  benchmark.addCase('DiskCache (write)', async () => {
    const filename = await createTempName()
    const cache = await DiskCache.create(filename)
    const view = new DiskCacheView(
      cache
    , new IndexKeyConverter()
    , new JSONValueConverter()
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

  benchmark.addCase('DiskCacheWithCache (write)', async () => {
    const filename = await createTempName()
    const diskCache = await DiskCache.create(filename)
    const memoryCache = new TLRUMap<string, any>(100)
    const cache = new DiskCacheWithCache(diskCache, memoryCache)
    const view = new DiskCacheView(
      cache
    , new IndexKeyConverter()
    , new JSONValueConverter()
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

  benchmark.addCase('DiskCache (overwrite)', async () => {
    const filename = await createTempName()
    const cache = await DiskCache.create(filename)
    const view = new DiskCacheView(
      cache
    , new IndexKeyConverter()
    , new JSONValueConverter()
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

  benchmark.addCase('DiskCacheWithCache (overwrite)', async () => {
    const filename = await createTempName()
    const diskCache = await DiskCache.create(filename)
    const memoryCache = new TLRUMap<string, any>(100)
    const cache = new DiskCacheWithCache(diskCache, memoryCache)
    const view = new DiskCacheView(
      cache
    , new IndexKeyConverter()
    , new JSONValueConverter()
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

  benchmark.addCase('DiskCache (read)', async () => {
    const filename = await createTempName()
    const cache = await DiskCache.create(filename)
    const view = new DiskCacheView(
      cache
    , new IndexKeyConverter()
    , new JSONValueConverter()
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

  benchmark.addCase('DiskCacheWithCache (read)', async () => {
    const filename = await createTempName()
    const diskCache = await DiskCache.create(filename)
    const memoryCache = new TLRUMap<string, any>(100)
    const cache = new DiskCacheWithCache(diskCache, memoryCache)
    const view = new DiskCacheView(
      cache
    , new IndexKeyConverter()
    , new JSONValueConverter()
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

  console.log(benchmark.name)
  for await (const result of benchmark.run()) {
    console.log(result)
  }
})

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

const benchmark = new Benchmark('I/O performance')

go(async () => {
  benchmark.addCase('ExtraDiskCache (write)', async () => {
    const cache = await DiskCache.create()
    const view = new DiskCacheView(
      cache
    , new CacheIndexKeyConverter()
    , new CacheJSONValueConverter()
    )

    return () => {
      for (let i = 1000; i--;) {
        view.set(i, i)
      }
    }
  })

  benchmark.addCase('ExtraDiskStore (write)', async () => {
    const store = await DiskStore.create()
    const view = new DiskStoreView(
      store
    , new StoreIndexKeyConverter()
    , new StoreJSONValueConverter()
    )

    return () => {
      for (let i = 1000; i--;) {
        view.set(i, i)
      }
    }
  })

  benchmark.addCase('ExtraDiskCache (read)', async () => {
    const cache = await DiskCache.create()
    const view = new DiskCacheView(
      cache
    , new CacheIndexKeyConverter()
    , new CacheJSONValueConverter()
    )
    for (let i = 1000; i--;) {
      view.set(i, i)
    }

    return () => {
      for (let i = 1000; i--;) {
        view.get(i)
      }
    }
  })

  benchmark.addCase('ExtraDiskStore (read)', async () => {
    const store = await DiskStore.create()
    const view = new DiskStoreView(
      store
    , new StoreIndexKeyConverter()
    , new StoreJSONValueConverter()
    )
    for (let i = 1000; i--;) {
      view.set(i, i)
    }

    return () => {
      for (let i = 1000; i--;) {
        view.get(i)
      }
    }
  })

  for await (const result of benchmark.run()) {
    console.log(result)
  }
})

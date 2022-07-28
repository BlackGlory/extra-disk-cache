# extra-disk-cache
High-performance persistent cache, using SQLite3 and RocksDB under the hood.

## Install
```sh
npm install --save extra-disk-cache
# or
yarn add extra-disk-cache
```

### Usage
```ts
import { DiskCache } from 'extra-disk-cache'

const cache = new DiskCache('/tmp/cache')
cache.set('key', Buffer.from('value'), Date.now(), 3600)
const { value } = cache.get('key')
```

### API
```ts
interface IItem {
}
```

#### DiskCache
```ts
class DiskCache {
  constructor(dirname: string)

  close(): void

  has(key: string): boolean
  get(key: string): {
    value: Buffer
    updatedAt: number
    timeToLive: number | null
  }
  set(
    key: string
  , value: Buffer
  , updatedAt: number
    /**
     * `timeToLive > 0`: items will expire after `timeToLive` milliseconds.
     * `timeToLive = 0`: items will expire immediately.
     * `timeToLive = null`: items will not expire.
     */
  , timeToLive: number /* ms */ = null
  ): Promise<void>
  delete(key: string): void
  clear(): void
  keys(): Iterable<string>
}
```

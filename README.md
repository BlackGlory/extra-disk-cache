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

const cache = await DiskCache.create('/tmp/cache')
await cache.set('key', Buffer.from('value'), Date.now(), 3600, 0)
const data = await cache.getData('key')
```

### API

```ts
interface IMetadata {
  updatedAt: number
  timeToLive: number

  /**
   * `timeBeforeDeletion > 0`: items will survive `timeBeforeDeletion` milliseconds after expiration.
   * `timeBeforeDeletion = 0`: items will be deleted as soon as possible after expiration.
   * `timeBeforeDeletion = null`: items will not be deleted after expiration.
   */
  timeBeforeDeletion: number | null
}
```

#### DiskCache

```ts
class DiskCache {
  static create(dirname: string): Promise<DiskCache>

  close(): Promise<void>

  hasData(key: string): Promise<boolean>
  hasMetadata(key: string): boolean

  getData(key: string): Promise<Buffer | undefined>
  getMetadata(key: string): IMetadata | undefined

  set(
    key: string
  , value: Buffer
  , updatedAt: number
  , timeToLive: number /* ms */
  , timeBeforeDeletion: number | null /* ms */
  ): Promise<void>
  setData(key: string, value: Buffer): Promise<void>
  setMetadata(
    key: string
  , updatedAt: number
  , timeToLive: number /* ms */
  , timeBeforeDeletion: number | null /* ms */
  ): void

  delete(key: string): Promise<void>
  deleteData(key: string): Promise<void>
  deleteMetadata(key: string): void

  clear(): Promise<void>
  clearData(): Promise<void>
  clearMetadata(): void
}
```

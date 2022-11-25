# extra-disk-cache
A persistent cache.

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
#### DiskCache
```ts
class DiskCache {
  static create(filename?: string): Promise<DiskCache>

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
  , updatedAt: number = Date.now()
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

#### DiskCacheView
```ts
interface IKeyConverter<T> {
  toString: (value: T) => string
  fromString: (value: string) => T
}

interface IValueConverter<T> {
  toBuffer: (value: T) => Buffer
  fromBuffer: (value: Buffer) => T
}

class DiskCacheView<K, V> {
  constructor(
    private cache: DiskCache
  , private keyConverter: IKeyConverter<K>
  , private valueConverter: IValueConverter<V>
  )

  has(key: K): boolean
  get(key: K): {
    value: V
    updatedAt: number
    timeToLive: number | null
  } | undefined
  set(
    key: K
  , value: V
  , updatedAt: number = Date.now()
    /**
     * `timeToLive > 0`: items will expire after `timeToLive` milliseconds.
     * `timeToLive = 0`: items will expire immediately.
     * `timeToLive = null`: items will not expire.
     */
  , timeToLive: number | null = null
  ): void
  clear(): void
  delete(key: K): void
  keys(): Iterable<K>
}
```

#### JSONValueConverter
```ts
class JSONValueConverter<T> implements IValueConverter<T> {
  constructor(private encoding: BufferEncoding = 'utf-8')
}
```

#### PassthroughKeyConverter
```ts
class PassthroughKeyConverter implements IKeyConverter<string> 
```

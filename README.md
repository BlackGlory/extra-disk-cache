# extra-disk-cache
A disk-based persistent cache.

## Install
```sh
npm install --save extra-disk-cache
# or
yarn add extra-disk-cache
```

## Usage
```ts
import { DiskCache } from 'extra-disk-cache'

const cache = new DiskCache('/tmp/cache')
cache.set('key', Buffer.from('value'), Date.now(), 3600)
const { value } = cache.get('key')
```

## API
### DiskCache
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
  keys(): IterableIterator<string>
}
```

### DiskCacheView
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
  keys(): IterableIterator<K>
}
```

### DiskCacheAsyncView
```ts
interface IKeyAsyncConverter<T> {
  toString: (value: T) => Awaitable<string>
  fromString: (value: string) => Awaitable<T>
}

interface IValueAsyncConverter<T> {
  toBuffer: (value: T) => Awaitable<Buffer>
  fromBuffer: (value: Buffer) => Awaitable<T>
}

class DiskCacheAsyncView<K, V> {
  constructor(
    cache: DiskCache
  , keyConverter: IKeyAsyncConverter<K>
  , valueConverter: IValueAsyncConverter<V>
  )

  has(key: K): Promise<boolean>
  get(key: K): Promise<{
    value: V
    updatedAt: number
    timeToLive: number | null
  } | undefined>
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
  ): Promise<void>
  delete(key: K): Promise<void>
  clear(): void
  keys(): AsyncIterableIterator<K>
}
```

### Converters
#### PassthroughKeyConverter
```ts
class PassthroughKeyConverter implements IKeyConverter<string>, IKeyAsyncConverter<string>
```

#### PassthroughValueConverter
```ts
class PassthroughValueConverter implements IValueConverter<Buffer>, IValueAsyncConverter<Buffer>
```

#### JSONKeyConverter
```ts
class JSONKeyConverter<T> implements IKeyConverter<T>, IKeyAsyncConverter<T>
```

#### JSONValueConverter
```ts
class JSONValueConverter<T> implements IValueConverter<T>, IValueAsyncConverter<T> {
  constructor(encoding: BufferEncoding = 'utf-8')
}
```

#### IndexKeyConverter
```ts
class IndexKeyConverter implements IKeyConverter<number>, IKeyAsyncConverter<number> {
  constructor(radix: number = 10)
}
```

#### MessagePackValueConverter
```ts
class MessagePackValueConverter<T> implements IValueConverter<T>, IValueAsyncConverter<T>
```

#### LZ4ValueConverter
```ts
class LZ4ValueConverter<T> implements IValueConverter<T>, IValueAsyncConverter<T> {
  constructor(valueConverter: IValueConverter<T>)
}
```

#### ZstandardValueConverter
```ts
class ZstandardValueConverter<T> implements IValueConverter<T>, IValueAsyncConverter<T> {
  static create<T>(
    valueConverter: IValueConverter<T>
  , level: number
  ): Promise<ZstandardValueConverter<T>>
}
```

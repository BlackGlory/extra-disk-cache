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
import ms from 'ms'

const cache = await DiskCache.create('/tmp/cache')
cache.set('key', Buffer.from('value'), ms('1h'))
const value = cache.get('key')?.toString()
```

## API
### DiskCache
```ts
class DiskCache {
  static create(filename?: string): Promise<DiskCache>

  close(): void

  has(key: string): boolean
  get(key: string): Buffer | undefined
  set(
    key: string
  , value: Buffer
    /**
     * `timeToLive > 0`: items will expire after `timeToLive` milliseconds.
     * `timeToLive = 0`: items will expire immediately.
     * `timeToLive = null`: items will not expire.
     */
  , timeToLive: number | null /* ms */ = null
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
  fromString: (value: string) => T | undefined
}

interface IValueConverter<T> {
  toBuffer: (value: T) => Buffer
  fromBuffer: (value: Buffer) => T
}

class DiskCacheView<K, V> {
  constructor(
    cache: DiskCache | DiskCacheWithCache
  , keyConverter: IKeyConverter<K>
  , valueConverter: IValueConverter<V>
  )

  has(key: K): boolean
  get(key: K): V | undefined
  set(
    key: K
  , value: V
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
  fromString: (value: string) => Awaitable<T | undefined>
}

interface IValueAsyncConverter<T> {
  toBuffer: (value: T) => Awaitable<Buffer>
  fromBuffer: (value: Buffer) => Awaitable<T>
}

class DiskCacheAsyncView<K, V> {
  constructor(
    cache: DiskCache | DiskCacheWithCache
  , keyConverter: IKeyAsyncConverter<K>
  , valueConverter: IValueAsyncConverter<V>
  )

  has(key: K): Promise<boolean>
  get(key: K): Promise<V | undefined>
  set(
    key: K
  , value: V
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

### DiskCacheWithCache
```ts
interface ICache {
  set(key: string, value: Buffer | boolean | undefined, timeToLive?: number): void
  get(key: string): Buffer | boolean | undefined
  delete(key: string): void
  clear(): void
}

class DiskCacheWithCache {
  constructor(diskCache: DiskCache, memoryCache: ICache)

  close(): void

  has(key: string): boolean
  get(key: string): Buffer | undefined
  set(key: string, value: Buffer): void
  delete(key: string): void
  clear(): void
  keys(): IterableIterator<string>
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

#### LZ4ValueAsyncConverter
```ts
class LZ4ValueAsyncConverter<T> implements IValueAsyncConverter<T> {
  constructor(valueConverter: IValueConverter<T> | IValueAsyncConverter<T>)

  toBuffer(value: T): Promise<Buffer>
  fromBuffer(value: Buffer): Promise<T>
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

#### ZstandardValueAsyncConverter
```ts
class ZstandardValueAsyncConverter<T> implements IValueAsyncConverter<T> {
  static create<T>(
    valueConverter: IValueConverter<T> | IValueAsyncConverter<T>
  , level: number
  ): Promise<ZstandardValueAsyncConverter<T>>

  toBuffer(value: T): Promise<Buffer>
  fromBuffer(value: Buffer): Promise<T>
}
```

#### PrefixKeyConverter
```ts
export class PrefixKeyConverter<T> implements IKeyConverter<T>, IKeyAsyncConverter<T> {
  constructor(
    keyConverter: IKeyConverter<T>
  , prefix: string
  )

  toString(value: T): string
  fromString(value: string): T | undefined
}
```

#### PrefixKeyAsyncConverter
```ts
class PrefixKeyAsyncConverter<T> implements IKeyAsyncConverter<T> {
  constructor(
    keyConverter: IKeyConverter<T> | IKeyAsyncConverter<T>
  , prefix: string
  )

  toString(value: T): Promise<string>
  fromString(value: string): Promise<T | undefined>
}
```

import * as msgpack from 'msgpack-lite'
import { IValueConverter, IValueAsyncConverter } from '@src/types'

/**
 * @deprecated
 * There is no fast and correct implementation of MessagePack in JavaScript ecosystem.
 * Currently using the package `msgpack-lite` to instead of the incorrect `msgpackr`,
 * which is much slower than JSON.
 */
export class MessagePackValueConverter<T> implements IValueConverter<T>, IValueAsyncConverter<T> {
  fromBuffer(buffer: Buffer): T {
    return msgpack.decode(buffer)
  }

  toBuffer(value: T): Buffer {
    return msgpack.encode(value)
  }
}

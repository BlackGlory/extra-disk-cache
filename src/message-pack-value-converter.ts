import * as msgpack from 'msgpack-lite'
import { IValueConverter } from './disk-cache-view'

export class MessagePackValueConverter<T> implements IValueConverter<T> {
  fromBuffer(buffer: Buffer): T {
    return msgpack.decode(buffer)
  }

  toBuffer(value: T): Buffer {
    return msgpack.encode(value)
  }
}

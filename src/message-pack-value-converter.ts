import { pack, unpack } from 'msgpackr'
import { IValueConverter } from './disk-cache-view'

export class MessagePackValueConverter<T> implements IValueConverter<T> {
  fromBuffer(buffer: Buffer): T {
    return unpack(buffer)
  }

  toBuffer(value: T): Buffer {
    return pack(value)
  }
}

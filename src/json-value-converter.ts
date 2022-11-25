import { IValueConverter } from './disk-cache-view'

export class JSONValueConverter<T> implements IValueConverter<T> {
  constructor(private encoding: BufferEncoding = 'utf-8') {}

  fromBuffer(buffer: Buffer): T {
    return JSON.parse(buffer.toString(this.encoding))
  }

  toBuffer(val: T): Buffer {
    return Buffer.from(JSON.stringify(val), this.encoding)
  }
}

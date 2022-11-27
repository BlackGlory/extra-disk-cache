import { Packr } from 'msgpackr'
import { IValueConverter } from './disk-cache-view'

export class MessagePackValueConverter<T> implements IValueConverter<T> {
  private packer = new Packr({
    // https://github.com/kriszyp/msgpackr/issues/34
    variableMapSize: true
  })

  fromBuffer(buffer: Buffer): T {
    return this.packer.unpack(buffer)
  }

  toBuffer(value: T): Buffer {
    return this.packer.pack(value)
  }
}

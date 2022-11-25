import { IKeyConverter } from './disk-cache-view'

export class PassthroughKeyConverter implements IKeyConverter<string> {
  toString(value: string): string {
    return value
  }

  fromString(value: string): string {
    return value
  }
}

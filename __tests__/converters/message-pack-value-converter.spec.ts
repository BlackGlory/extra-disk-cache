import { describe, test, expect } from 'vitest'
import { MessagePackValueConverter } from '@converters/message-pack-value-converter.js'

describe('MessagePackValueConverter', () => {
  test('toBuffer & fromBuffer', () => {
    const converter = new MessagePackValueConverter()

    const buffer = converter.toBuffer(['foo', 'bar'])
    const result = converter.fromBuffer(buffer)

    expect(result).toStrictEqual(['foo', 'bar'])
  })

  test('toBuffer', () => {
    const converter = new MessagePackValueConverter()

    const result = converter.toBuffer(['foo', 'bar'])

    expect(result).toStrictEqual(Buffer.from([
      146
    , 163
    , 102
    , 111
    , 111
    , 163
    , 98
    , 97
    , 114
    ]))
  })

  test('fromBuffer', () => {
    const converter = new MessagePackValueConverter()

    const result = converter.fromBuffer(Buffer.from([
      146
    , 163
    , 102
    , 111
    , 111
    , 163
    , 98
    , 97
    , 114
    ]))

    expect(result).toStrictEqual(['foo', 'bar'])
  })
})

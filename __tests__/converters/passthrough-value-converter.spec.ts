import { PassthroughValueConverter } from '@converters/passthrough-value-converter'

describe('PassthroughValueConveter', () => {
  test('toBuffer & fromBuffer', () => {
    const converter = new PassthroughValueConverter()

    const buffer = converter.toBuffer(Buffer.from('foo'))
    const result = converter.fromBuffer(buffer)

    expect(result).toStrictEqual(Buffer.from('foo'))
  })

  test('toBuffer', () => {
    const converter = new PassthroughValueConverter()

    const result = converter.toBuffer(Buffer.from('foo'))

    expect(result).toStrictEqual(Buffer.from('foo'))
  })

  test('fromBuffer', () => {
    const converter = new PassthroughValueConverter()

    const result = converter.fromBuffer(Buffer.from('foo'))

    expect(result).toStrictEqual(Buffer.from('foo'))
  })
})

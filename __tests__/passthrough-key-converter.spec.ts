import { PassthroughKeyConverter } from '@src/passthrough-key-converter'

describe('PassthroughKeyConverter', () => {
  test('toString', () => {
    const converter = new PassthroughKeyConverter()

    const result = converter.toString('foo')

    expect(result).toBe('foo')
  })

  test('fromString', () => {
    const converter = new PassthroughKeyConverter()

    const result = converter.fromString('foo')

    expect(result).toBe('foo')
  })
})

import { PassthroughKeyConverter } from '@src/passthrough-key-converter'

test('PassthroughKeyConverter', () => {
  const converter = new PassthroughKeyConverter()

  const str = converter.toString('foo')
  const result = converter.fromString(str)

  expect(result).toBe('foo')
})

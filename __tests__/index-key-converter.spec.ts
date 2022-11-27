import { IndexKeyConverter } from '@src/index-key-converter'

test('IndexKeyConverter', () => {
  const converter = new IndexKeyConverter()

  const str = converter.toString(100)
  const result = converter.fromString(str)

  expect(result).toBe(100)
})

import { JSONValueConverter } from '@src/json-value-converter'

test('JSONValueConverter', () => {
  const converter = new JSONValueConverter('utf-8')

  const buffer = converter.toBuffer(['foo', 'bar'])
  const result = converter.fromBuffer(buffer)

  expect(result).toStrictEqual(['foo', 'bar'])
})

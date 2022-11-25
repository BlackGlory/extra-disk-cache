import { JSONValueConverter } from '@src/json-value-converter'

describe('JSONValueConverter', () => {
  test('toBuffer', () => {
    const converter = new JSONValueConverter('utf-8')

    const result = converter.toBuffer(['foo', 'bar'])

    expect(result).toStrictEqual(Buffer.from(JSON.stringify(['foo', 'bar'])))
  })

  test('fromBuffer', () => {
    const converter = new JSONValueConverter('utf-8')
    const buffer = Buffer.from(JSON.stringify(['foo', 'bar']))

    const result = converter.fromBuffer(buffer)

    expect(result).toStrictEqual(['foo', 'bar'])
  })
})

import { MessagePackValueConverter } from '@src/message-pack-value-converter'

test('MessagePackValueConverter', () => {
  const converter = new MessagePackValueConverter()

  const buffer = converter.toBuffer(['foo', 'bar'])
  const result = converter.fromBuffer(buffer)

  expect(result).toStrictEqual(['foo', 'bar'])
})

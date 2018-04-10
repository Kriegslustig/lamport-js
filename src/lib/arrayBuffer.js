// @flow

export const arrayBufferBitIterable = function * (
  data: ArrayBuffer | Uint8Array
): Iterable<number> {
  const uint8Data: Uint8Array = data instanceof Uint8Array
    ? data
    : new Uint8Array(data)

  for (let offset = 0; offset < data.byteLength * 8; ++offset) {
    const bitOffset = offset % 8
    const byteOffset = (offset - bitOffset) / 8
    const shift = 7 - bitOffset
    const bit = uint8Data[byteOffset] >> shift & 0b00000001
    yield bit
  }
}

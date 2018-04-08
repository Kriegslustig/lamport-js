// @flow

export const arrayBufferBitIterable = function * (data: ArrayBuffer): Iterable<number> {
  const uint8Data = new Uint8Array(data)

  for (let offset = 0; offset < data.byteLength * 8; ++offset) {
    const bitOffset = offset % 8
    const byteOffset = (offset - bitOffset) / 8
    const shift = 7 - bitOffset
    const bit = uint8Data[byteOffset] >> shift & 0b00000001
    yield bit
  }
}

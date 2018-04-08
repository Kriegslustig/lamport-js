// @flow

import { arrayBufferBitIterable } from './arrayBuffer'

describe('arrayBufferBitIterable', () => {
  it('should be an iterator of each bit in the ArrayBuffer bit', () => {
    const data = new Uint8Array([0b01010101, 0b01010101])
    const iterator = arrayBufferBitIterable(data.buffer)
    const result = [...iterator]
    expect(result).toEqual([
      0, 1, 0, 1, 0, 1, 0, 1,
      0, 1, 0, 1, 0, 1, 0, 1,
    ])
  })
})

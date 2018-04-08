// @flow

import * as lamport from './main.js'

describe('lamport.generateKeyPair', () => {
  it('should return a public and a secret key', async () => {
    const { secretKey, publicKey } = await lamport.generateKeyPair()
    expect(!!secretKey).toBe(true)
    expect(!!publicKey).toBe(true)
  })

  it('should return keys that are ArrayBuffers', async () => {
    const { secretKey, publicKey } = await lamport.generateKeyPair()
    expect(secretKey).toBeInstanceOf(ArrayBuffer)
    expect(publicKey).toBeInstanceOf(ArrayBuffer)
  })

  it('should return 2 * 256 * 256 bits long keys', async () => {
    const { secretKey, publicKey } = await lamport.generateKeyPair()
    expect(secretKey.byteLength).toBe(2 * 32 * 32)
    expect(publicKey.byteLength).toBe(2 * 32 * 32)
  })

  it('should generate a key where a SHA-256 hash of the first 256 bits of the secret key results in the first 256 bits of the public key', async () => {
    const { secretKey, publicKey } = await lamport.generateKeyPair()
    const input = new DataView(secretKey, 0, 32)
    const result = new Uint8Array(publicKey, 0, 32)
    const inputDigest = await window.crypto.subtle.digest('SHA-256', input)
    const expected = new Uint8Array(inputDigest)

    expect(result).toEqual(expected)
  })
})

describe('lamport.generateSignature', () => {
  it('should return a ArrayBuffer with the payload encoded using the secret key', async () => {
    const { secretKey } = await lamport.generateKeyPair()
    const payload = new Uint8Array(32)
    payload[0] = 0b01000000

    const signature = await lamport.generateSignature(secretKey, payload.buffer)

    expect(signature).toBeInstanceOf(ArrayBuffer)
    expect(signature.byteLength).toBe(32 * 32 * 8)
    expect(new Uint8Array(signature, 0, 32)).toEqual(new Uint8Array(secretKey, 0, 32))
    expect(new Uint8Array(signature, 32, 32)).toEqual(new Uint8Array(secretKey, (32 * 32) + 32, 32))
  })

  it('should throw if the data is not 256 bits long', async () => {
    const { secretKey } = await lamport.generateKeyPair()
    const data = new ArrayBuffer(1)
    expect(() => lamport.generateSignature(secretKey, data)).toThrow()
  })
})

describe('lamport.verifySignature', () => {
  it('should return true if all words in the signature map to the public key', async () => {
    const { secretKey, publicKey } = await lamport.generateKeyPair()
    const payload = new Uint8Array(32)
    payload[0] = 0b0100000
    const signature = lamport.generateSignature(secretKey, payload.buffer)

    const result = await lamport.verifySignature(
      publicKey,
      payload.buffer,
      signature
    )

    expect(result).toBe(true)
  })

  it('should return false if any words in the signature do not map to the public key', async () => {
    const { secretKey, publicKey } = await lamport.generateKeyPair()
    const payload = new Uint8Array(32)
    payload[0] = 0b0100000
    const signature = lamport.generateSignature(secretKey, payload.buffer)
    payload[0] = 0b0000000

    const result = await lamport.verifySignature(
      publicKey,
      payload.buffer,
      signature
    )

    expect(result).toBe(false)
  })
})

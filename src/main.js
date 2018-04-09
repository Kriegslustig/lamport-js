// @flow

import 'babel-polyfill'

import { arrayBufferBitIterable } from './lib/arrayBuffer'

const HASH_ALGORITHM = 'SHA-256'
const WORD_LENGTH_BYTES = 32
const MESSAGE_LENGTH_BITS = 256
const KEY_PART_LENGTH_BYTES = WORD_LENGTH_BYTES * MESSAGE_LENGTH_BITS
const KEY_LENGTH_BYTES = 2 * KEY_PART_LENGTH_BYTES

type KeyPair = {
  secretKey: ArrayBuffer,
  publicKey: ArrayBuffer,
}

export const generateKeyPair = async (): Promise<KeyPair> => {
  const secretKey = new Uint8Array(KEY_LENGTH_BYTES)
  const publicKey = new Uint8Array(KEY_LENGTH_BYTES)
  window.crypto.getRandomValues(secretKey)

  for (
    let offset = 0;
    offset < KEY_LENGTH_BYTES;
    offset += WORD_LENGTH_BYTES
  ) {
    const value = secretKey.subarray(offset, offset + WORD_LENGTH_BYTES)
    const digest = await window.crypto.subtle.digest(HASH_ALGORITHM, value)
    const uint8Digest = new Uint8Array(digest)
    publicKey.set(uint8Digest, offset)
  }

  return {
    publicKey: publicKey.buffer,
    secretKey: secretKey.buffer,
  }
}

export const generateSignature = (
  secretKey: ArrayBuffer,
  data: ArrayBuffer,
): ArrayBuffer => {
  if (data.byteLength !== 32) {
    throw new Error('Wrong length of input')
  }

  const signature = new Uint8Array(MESSAGE_LENGTH_BITS * WORD_LENGTH_BYTES)
  const uint8SecretKey = new Uint8Array(secretKey)
  const s0 = uint8SecretKey.subarray(0, KEY_PART_LENGTH_BYTES)
  const s1 = uint8SecretKey.subarray(KEY_PART_LENGTH_BYTES)

  const dataIter = arrayBufferBitIterable(data)
  let offset = 0

  for (let bit of dataIter) {
    const s = bit ? s1 : s0
    const wordOffset = offset * 32
    const word = s.subarray(wordOffset, wordOffset + 32)
    signature.set(word, wordOffset)
    offset += 1
  }

  return signature.buffer
}

export const verifySignature = async (
  publicKey: ArrayBuffer,
  data: ArrayBuffer,
  signature: ArrayBuffer,
): Promise<boolean> => {
  const uint8Signature = new Uint8Array(signature)
  const uint8PublicKey = new Uint8Array(publicKey)
  const p0 = uint8PublicKey.subarray(0, KEY_PART_LENGTH_BYTES)
  const p1 = uint8PublicKey.subarray(KEY_PART_LENGTH_BYTES)
  const dataIter = arrayBufferBitIterable(data)

  let offset = 0
  for (let bit of dataIter) {
    const wordOffset = offset * WORD_LENGTH_BYTES
    const p = bit ? p1 : p0
    const uint8ExpectedDigest = p.subarray(wordOffset, wordOffset + WORD_LENGTH_BYTES)
    const actualDigest = await window.crypto.subtle.digest(
      HASH_ALGORITHM,
      uint8Signature.subarray(wordOffset, wordOffset + WORD_LENGTH_BYTES)
    )
    const uint8ActualDigest = new Uint8Array(actualDigest)

    if (uint8ExpectedDigest .some((v, i) => uint8ActualDigest[i] !== v)) {
      return false
    }

    offset += 1
  }

  return true
}

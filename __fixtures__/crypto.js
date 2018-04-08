// @flow

import crypto from 'crypto'

global.crypto = {
  // $FlowFixMe
  getRandomValues: crypto.randomFillSync,
  subtle: {
    digest: (algo, content): Promise<ArrayBuffer> => new Promise((resolve, reject) => {
      try {
        if (algo !== 'SHA-256') throw new Error('Unsupported algorithm')
        const hash = crypto.createHash('sha256')
        hash.update(content)
        const digest = hash.digest()
        resolve((new Uint8Array(digest)).buffer)
      } catch (e) {
        reject(e)
      }
    })
  },
}

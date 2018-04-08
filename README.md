# Lamport.js

Browser implementation of the Lamport one-time signature scheme.

## Basic Usage

```
import * as lamport from 'lamport-js'

const { secretKey, publicKey } = await lamport.generateKeyPair()

const payload = 'I accept the terms and conditions'

const message = await lamport.sign(secretKey, payload)

const isValidSignature = await lamport.verify(publicKey, message)
isValidSignature === true
```

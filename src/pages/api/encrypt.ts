import * as crypto from 'crypto'

// subtle has type SubtleCrypto, from the DOM type definitions
const { subtle, getRandomValues } = crypto.webcrypto

/**
 *
 * Pulled from https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a#file-crypto-aes-gcm-js-L13
 *
 * Encrypts plaintext using AES-GCM with supplied password, for decryption with aesGcmDecrypt().
 *                                                                      (c) Chris Veness MIT Licence
 *
 * @param   {String} plaintext - Plaintext to be encrypted.
 * @param   {String} password - Password to use to encrypt plaintext.
 * @returns {String} Encrypted ciphertext.
 *
 * @example
 *   const ciphertext = await aesGcmEncrypt('my secret text', 'pw');
 *   aesGcmEncrypt('my secret text', 'pw').then(function(ciphertext) { console.log(ciphertext); });
 */
const aesGcmEncrypt = async (plaintext: string, password: string) => {
  console.log('password is: ', password)
  const pwUtf8 = new TextEncoder().encode(password) // encode password as UTF-8

  console.log('subtle exists? ', subtle)

  const pwHash = await subtle.digest('SHA-256', pwUtf8) // hash the password

  const iv = getRandomValues(new Uint8Array(12)) // get 96-bit random iv
  const ivStr = Array.from(iv)
    .map((b) => String.fromCharCode(b))
    .join('') // iv as utf-8 string

  const alg = { name: 'AES-GCM', iv: iv } // specify algorithm to use

  const key = await subtle.importKey('raw', pwHash, alg, false, ['encrypt']) // generate key from pw

  const ptUint8 = new TextEncoder().encode(plaintext) // encode plaintext as UTF-8
  const ctBuffer = await subtle.encrypt(alg, key, ptUint8) // encrypt plaintext using key

  const ctArray = Array.from(new Uint8Array(ctBuffer)) // ciphertext as byte array
  const ctStr = ctArray.map((byte) => String.fromCharCode(byte)).join('') // ciphertext as string

  return Buffer.from(ivStr + ctStr).toString('base64') // iv+ciphertext base64-encoded
}

export const post = async ({ request }: { request: Request }) => {
  const { text } = (await request.json()) as {
    text: string
  }

  const encrypted = await aesGcmEncrypt(text, process.env.SALT ?? '')
  console.log('encrypted is: ', encrypted)

  return new Response(JSON.stringify({ encrypted }), { status: 200 })
}

import * as crypto from 'crypto'

const { subtle } = crypto.webcrypto

/**
 *
 * Pulled from https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a#file-crypto-aes-gcm-js-L46
 *
 * Decrypts ciphertext encrypted with aesGcmEncrypt() using supplied password.
 *                                                                      (c) Chris Veness MIT Licence
 *
 * @param   {String} ciphertext - Ciphertext to be decrypted.
 * @param   {String} password - Password to use to decrypt ciphertext.
 * @returns {String} Decrypted plaintext.
 *
 * @example
 *   const plaintext = await aesGcmDecrypt(ciphertext, 'pw');
 *   aesGcmDecrypt(ciphertext, 'pw').then(function(plaintext) { console.log(plaintext); });
 */
const aesGcmDecrypt = async (ciphertext: string, password: string) => {
  console.log('ciphertext is: ', ciphertext)
  console.log('password is: ', password)
  const pwUtf8 = new TextEncoder().encode(password) // encode password as UTF-8
  console.log('pwUtf8: ', pwUtf8)
  const pwHash = await subtle.digest('SHA-256', pwUtf8) // hash the password

  console.log('cccc')

  // const ivStr = atob(ciphertext).slice(0, 12) // decode base64 iv
  // const ivStr = Buffer.from(ciphertext, 'base64').toString('ascii')
  const ivStr = Buffer.from(ciphertext, 'base64').toString('binary')

  console.log('ddd')

  const iv = new Uint8Array(Array.from(ivStr).map((ch) => ch.charCodeAt(0))) // iv as Uint8Array

  console.log('eee')

  const alg = { name: 'AES-GCM', iv: iv } // specify algorithm to use

  const key = await subtle.importKey('raw', pwHash, alg, false, ['decrypt']) // generate key from pw

  // const ctStr = atob(ciphertext).slice(12) // decode base64 ciphertext
  // const ctStr = Buffer.from(ciphertext, 'base64').toString('ascii')
  const ctStr = Buffer.from(ciphertext, 'base64').toString('binary')

  const ctUint8 = new Uint8Array(
    Array.from(ctStr).map((ch) => ch.charCodeAt(0))
  ) // ciphertext as Uint8Array
  // note: why doesn't ctUint8 = new TextEncoder().encode(ctStr) work?

  try {
    console.log('we in here...')
    const plainBuffer = await subtle.decrypt(alg, key, ctUint8) // decrypt ciphertext using key
    const plaintext = new TextDecoder().decode(plainBuffer) // plaintext from ArrayBuffer
    return plaintext // return the plaintext
  } catch (e) {
    console.error('error is: ', e)
    throw new Error('Decrypt failed')
  }
}

export const post = async ({ request }: { request: Request }) => {
  const { encryptedText } = (await request.json()) as {
    encryptedText: string
  }

  const decrypted = await aesGcmDecrypt(encryptedText, process.env.SALT ?? '')
  console.log('decrypt test is: ', decrypted)

  return new Response(
    JSON.stringify({
      decrypted,
    }),
    { status: 200 }
  )
}

import crypto from 'crypto'

const METHOD = 'aes-256-cbc'

// String from env variables
type EnvString = string | undefined

/**
 * Generate key and initialization vector for AES-256-CBC cipher.
 *
 * Throws on missing env variables (key and iv).
 *
 * Reference:
 * https://dev.to/jobizil/encrypt-and-decrypt-data-in-nodejs-using-aes-256-cbc-2l6d
 */
const genSecrets = (key: EnvString, iv: EnvString) => {
  if (!key || !iv) throw new Error('missing encryption secrets')
  return {
    key: crypto.createHash('sha512').update(key).digest('hex').substring(0, 32),
    iv: crypto.createHash('sha512').update(iv).digest('hex').substring(0, 16),
  }
}

/**
 * Encrypt data using AES-256-CBC cipher with variable key and initialization vector.
 *
 * Reference:
 * https://dev.to/jobizil/encrypt-and-decrypt-data-in-nodejs-using-aes-256-cbc-2l6d
 */
export const encryptData = (data: string, key: EnvString, iv: EnvString) => {
  const { key: secretKey, iv: initVector } = genSecrets(key, iv)
  const cipher = crypto.createCipheriv(METHOD, secretKey, initVector)
  return Buffer.from(cipher.update(data, 'utf8', 'hex') + cipher.final('hex')).toString('base64')
}

/**
 * Decrypt data using AES-256-CBC cipher with variable key and initialization vector.
 *
 * Reference:
 * https://dev.to/jobizil/encrypt-and-decrypt-data-in-nodejs-using-aes-256-cbc-2l6d
 */
export const decryptData = (data: string, key: EnvString, iv: EnvString) => {
  const { key: secretKey, iv: initVector } = genSecrets(key, iv)
  const decipher = crypto.createDecipheriv(METHOD, secretKey, initVector)
  const buff = Buffer.from(data, 'base64')
  return decipher.update(buff.toString('utf8'), 'hex', 'utf8') + decipher.final('utf8')
}

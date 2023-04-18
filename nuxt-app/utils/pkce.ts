// Spotify OAuth //
const generateRandomString = (length: number): string => {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

const base64encode = (arr: ArrayBuffer): string => {
  const uint8Array = new Uint8Array(arr)
  // const buf = Buffer.from(uint8Array)
  // const base64 = buf.toString('base64')
  const str = String.fromCharCode.apply(null, Array.from(uint8Array))
  const base64 = btoa(str)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  // Code Challenge
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  return base64encode(digest)
}

export default {
  generateCodeChallenge,
  generateRandomString,
}

export { generateCodeChallenge, generateRandomString }

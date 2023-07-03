// File to Blob(Base-64) Conversion
// FileReader API: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
// FileReader.readAsDataURL(): https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
const fileToBase64 = (file: File | undefined): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1]
        if (base64) {
          const decoder = new TextDecoder('utf-8')
          const buffer = decoder.decode(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)))
          resolve(buffer)
        } else {
          reject(new Error('Failed to convert file to Base64'))
        }
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file!)
  })
}

export default fileToBase64
export { fileToBase64 }

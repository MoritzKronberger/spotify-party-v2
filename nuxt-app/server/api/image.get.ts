import { Readable } from 'stream'
import { eq } from 'drizzle-orm'
import { db } from '~/db'
import { image } from '~/db/schema'

/** Handle GET requests to /api/image (defined by file name). */
export default defineEventHandler(async (event) => {
  // Get image Id from query parameters using H3
  // Reference: https://nuxt.com/docs/guide/directory-structure/server#handling-requests-with-query-parameters
  const query = getQuery(event)
  const id = query.id?.toString()
  // Ensure Id exists
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'No id provided',
    })
  }

  // Fetch image from database
  const imageRes = await db.select().from(image).where(eq(image.id, id))
  const { base64Blob: blob, mimeType } = imageRes[0] ?? {}
  // Ensure image exists for Id
  if (!blob || !mimeType) {
    throw createError({
      statusCode: 404,
      message: 'Image not found',
    })
  }

  // Set response content type depending on image mime type
  event.node.res.setHeader('Content-Type', mimeType)
  // Create readable stream from base64 blob
  // Reference: https://stackoverflow.com/a/44091532/14906871
  const buffer = Buffer.from(blob, 'base64')
  const readable = new Readable()
  readable.push(buffer)
  readable.push(null)
  // Send stream response using H3
  // Reference: https://nuxt.com/docs/guide/directory-structure/server#sending-streams-experimental
  return sendStream(event, readable)
})

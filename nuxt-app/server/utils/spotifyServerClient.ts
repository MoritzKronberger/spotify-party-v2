import SpotifyWebApi from 'spotify-web-api-node'
import z from 'zod'
import tsFetch from '~/utils/tsFetch'

const spotifyClientCredentialsResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
})

/**
 * Class for server-side interaction with Spotify-Web-API
 *
 * Uses async init factory function.
 *
 * Reference:
 * https://dev.to/somedood/the-proper-way-to-write-async-constructors-in-javascript-1o8c
 */
export class SpotifyServerClient {
  clientId: string
  clientSecret: string
  accessToken: string
  accessTokenExpiry: Date

  private constructor(clientId: string, clientSecret: string, accessToken: string, accessTokenExpiry: Date) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.accessToken = accessToken
    this.accessTokenExpiry = accessTokenExpiry
  }

  /**
   * Fetch access token from Spotify-Web-API and calculate its expiry date.
   *
   * Uses Client Credentials flow for server-side usage of Spotify-API.
   *
   * Reference:
   * https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
   */
  private static async fetchAccessToken(clientId: string, clientSecret: string, expiryBufferSeconds = 600) {
    const headers = {
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }

    const searchParams = new URLSearchParams({ grant_type: 'client_credentials' })

    const { access_token: accessToken, expires_in: expiresIn } = await tsFetch(
      'https://accounts.spotify.com/api/token',
      { 200: spotifyClientCredentialsResponseSchema },
      { method: 'post', headers, body: searchParams }
    )

    const tokenExpiry = new Date()
    tokenExpiry.setSeconds(tokenExpiry.getSeconds() + expiresIn - expiryBufferSeconds)

    return { accessToken, tokenExpiry }
  }

  /** Initialize Spotify-Server-Client with access token. */
  static async init(clientId: string, clientSecret: string) {
    const { accessToken, tokenExpiry } = await this.fetchAccessToken(clientId, clientSecret)

    return new SpotifyServerClient(clientId, clientSecret, accessToken, tokenExpiry)
  }

  /** Check if access token is expired. */
  private tokenExpired() {
    return new Date() > this.accessTokenExpiry
  }

  /** Return Spotify Web-API-Client with valid server-side access token. */
  async useWebAPI() {
    if (this.tokenExpired()) {
      const { accessToken, tokenExpiry } = await SpotifyServerClient.fetchAccessToken(this.clientId, this.clientSecret)
      this.accessToken = accessToken
      this.accessTokenExpiry = tokenExpiry
      if (this.tokenExpired()) throw new Error('Access token expired directly after refreshing')
    }

    const spotifyAPI = new SpotifyWebApi()
    spotifyAPI.setAccessToken(this.accessToken)
    return spotifyAPI
  }
}

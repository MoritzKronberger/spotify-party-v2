import { isPromise } from 'util/types'
import SpotifyWebApi from 'spotify-web-api-node'

type Credentials = {
  accessToken?: string
  refreshToken?: string
  clientId: string
  clientSecret: string
}

/**
 * Proxies all async Spotify-Web-API methods to retry unauthorized requests.
 *
 * References:
 * - https://plainenglish.io/blog/javascript-how-to-intercept-function-and-method-calls#apply-trap
 * - https://stackoverflow.com/a/72918166/14906871
 */
export const spotifyProxyAPI = (
  onUnauthorizedRetry: (spotifyAPI: SpotifyWebApi) => Promise<void>,
  credentials: Credentials
) => {
  // Instantiate Spotify-API client with credentials
  const spotifyAPI = new SpotifyWebApi(credentials)

  // Create proxy for object
  return new Proxy(spotifyAPI, {
    // Proxy property (method) access
    get(target, prop: keyof SpotifyWebApi) {
      // Get accessed method
      const fn = target[prop]
      // Create proxy for method
      return new Proxy(fn, {
        // Proxy method call
        apply: (target, thisArg, args) => {
          // Call method and get result
          const res = Reflect.apply(target, thisArg, args)
          // For non-Promise results, return the result as usual
          // (I.e. `setCredentials`, etc.)
          if (!isPromise(res)) return res
          // Otherwise try to resolve the promise an catch errors
          return Promise.resolve(res).catch(async (err) => {
            // For unauthorized errors, retry the request
            if (err?.body?.error?.status === 401) {
              // Execute the retry-callback before actually retrying
              await onUnauthorizedRetry(spotifyAPI)
              return Reflect.apply(target, thisArg, args)
            }
            // For all other errors throw as usual
            throw err
          })
        },
      })
    },
  })
}

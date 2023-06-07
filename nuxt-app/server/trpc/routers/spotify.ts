import { z } from 'zod'
import { spotifyUserProcedure, spotifyServerProcedure } from '../middleware/spotify'
import { router } from '../trpc'

const trackQuerySchema = z.string()

const createPlaylistSchema = z.object({
  name: z.string(),
  description: z.string(),
})

export const spotifyRouter = router({
  /**
   * Get Spotify track Id for every track query (if result was found.)
   *
   * Spotify search does allow for explicit filters like `'track:...,artist:...'`,
   * but using a simple query string containing the track name and author is often enough.
   * This also allows searching for non precise ChatGPT outputs like `'Thriller by Micheal Jackson'`.
   *
   * Reference:
   * https://developer.spotify.com/documentation/web-api/reference/search
   */
  searchTracks: spotifyServerProcedure.input(trackQuerySchema.array()).query(async ({ input, ctx }) => {
    const res = await Promise.all(input.map((query) => ctx.spotifyServerAPI.searchTracks(query, { limit: 1 })))
    const trackIds = res
      .map((rs) => {
        return rs.body.tracks?.items[0]?.id
      })
      .filter((id): id is string => !!id)
    return trackIds
  }),
  /** Get single track using its Spotify Id (for debugging purposes only). */
  getTrackById: spotifyServerProcedure.input(z.string()).query(async ({ input, ctx }) => {
    return (await ctx.spotifyServerAPI.getTrack(input)).body
  }),
  /**
   * Create private collaborative playlist as the main party playlist.
   *
   * Reference:
   * https://developer.spotify.com/documentation/web-api/reference/create-playlist
   */
  createPartyPlaylist: spotifyUserProcedure.input(createPlaylistSchema).mutation(async ({ input, ctx }) => {
    const { name, description } = input
    return (await ctx.spotifyClientAPI.createPlaylist(name, { description, collaborative: true, public: false })).body
  }),
})

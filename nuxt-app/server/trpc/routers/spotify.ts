import { z } from 'zod'
import { spotifyUserProcedure, spotifyServerProcedure, spotifySessionUserProcedure } from '../middleware/spotify'
import { router } from '../trpc'
import { base64BlobSchema } from '~/utils/image'

const trackQuerySchema = z.string()

const createPlaylistSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
})

export const spotifyRouter = router({
  /**
   * Get Spotify track Uri for every track query (if result was found.)
   *
   * Spotify search does allow for explicit filters like `'track:...,artist:...'`,
   * but using a simple query string containing the track name and author is often enough.
   * This also allows searching for non precise ChatGPT outputs like `'Thriller by Micheal Jackson'`.
   *
   * Reference:
   * https://developer.spotify.com/documentation/web-api/reference/search
   */
  searchTracks: spotifyServerProcedure.input(trackQuerySchema.array()).query(async ({ input, ctx }) => {
    const res = await Promise.all(
      input.map((query) =>
        ctx.spotifyServerAPI.searchTracks(query, { limit: 1 }).catch((e) => {
          // Return undefined if not found
          if (e?.body?.error?.status === 404) return undefined
          throw e
        })
      )
    )
    const trackUris = res
      .map((rs) => {
        return rs?.body.tracks?.items[0]?.uri
      })
      .filter((uri): uri is string => !!uri)
    return trackUris
  }),
  /** Get single track using its Spotify Id. */
  getTrackById: spotifyServerProcedure.input(z.string()).query(async ({ input, ctx }) => {
    return (await ctx.spotifyServerAPI.getTrack(input)).body
  }),
  /**
   * Create public playlist as the main party playlist.
   *
   * Reference:
   * https://developer.spotify.com/documentation/web-api/reference/create-playlist
   */
  createPartyPlaylist: spotifyUserProcedure.input(createPlaylistSchema).mutation(async ({ input, ctx }) => {
    const { name, description } = input
    return (await ctx.spotifyUserAPI.createPlaylist(name, { description: description ?? undefined, public: true })).body
  }),
  /**
   * Set custom cover image for playlist.
   *
   * Reference:
   * https://developer.spotify.com/documentation/web-api/reference/upload-custom-playlist-cover
   */
  setPlaylistCoverImage: spotifyUserProcedure
    .input(z.object({ playlistId: z.string(), base64Blob: base64BlobSchema }))
    .mutation(async ({ input, ctx }) => {
      const { playlistId, base64Blob } = input
      return await ctx.spotifyUserAPI.uploadCustomPlaylistCoverImage(playlistId, base64Blob)
    }),
  /**
   * Update tracks in party playlist.
   *
   * If playlist is currently being played: replace all tracks after the currently playing one.
   * Otherwise: replace all tracks in playlist.
   *
   * Reference:
   * - https://developer.spotify.com/documentation/web-api/reference/add-tracks-to-playlist
   * - https://developer.spotify.com/documentation/web-api/reference/reorder-or-replace-playlists-tracks
   */
  updatePlaylistTracks: spotifyUserProcedure
    .input(z.object({ playlistId: z.string(), trackURIs: z.string().array() }))
    .mutation(async ({ input, ctx }) => {
      const { playlistId, trackURIs } = input
      // Get currently playing track and playlist
      const playbackState = (await ctx.spotifyUserAPI.getMyCurrentPlaybackState()).body
      const playbackTrackURI = playbackState.item?.uri
      const playbackPlaylistURI = playbackState.context?.uri
      const playbackPlaylistId = playbackPlaylistURI?.replace('spotify:playlist:', '')
      // If party playlist is playing remove all tracks which haven't been played yet
      // (Replace them with new playlist tracks)
      if (playbackTrackURI && playbackPlaylistURI && playbackPlaylistId === playlistId) {
        // Get playlist tracks
        const playlist = (await ctx.spotifyUserAPI.getPlaylistTracks(playlistId)).body
        const playlistTrackURIs = playlist.items.map((item) => item.track?.uri).filter((uri): uri is string => !!uri)
        // Get index of currently playing track
        const currentTrackPlaylistIdx = playlistTrackURIs.indexOf(playbackTrackURI)
        // Remove all tracks after the currently playing one
        const removePlaylistTrackURIs = playlistTrackURIs.slice(currentTrackPlaylistIdx + 1)
        await ctx.spotifyUserAPI.removeTracksFromPlaylist(
          playlistId,
          removePlaylistTrackURIs.map((uri) => ({ uri }))
        )
        // Add new tracks to playlist
        await ctx.spotifyUserAPI.addTracksToPlaylist(playlistId, trackURIs)
      } else {
        // Otherwise, replace all tracks in playlist with new tracks
        await ctx.spotifyUserAPI.replaceTracksInPlaylist(playlistId, trackURIs)
      }
    }),
  /** Get single playlist by Id. */
  getPlaylist: spotifySessionUserProcedure.query(async ({ ctx }) => {
    const { playlistId } = ctx.party
    const playlist = (await ctx.spotifyUserAPI.getPlaylist(playlistId)).body
    // Keep data to a minimum
    return {
      id: playlist.id,
      uri: playlist.uri,
      name: playlist.name,
      description: playlist.description,
      images: playlist.images,
      tracks: playlist.tracks.items.map((item) => {
        const { track } = item
        return {
          id: track?.id,
          name: track?.name,
          images: track?.album.images,
          durationMs: track?.duration_ms,
          artists: track?.artists.map((artist) => ({ name: artist.name })),
        }
      }),
    }
  }),
  /**
   * Set playback on active device to playlist start.
   *
   * (Unless playlist is already playing.)
   */
  setPlaylistPlayback: spotifyUserProcedure
    .input(z.object({ playlistId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const playlistURI = `spotify:playlist:${input.playlistId}`
      const playbackState = (await ctx.spotifyUserAPI.getMyCurrentPlaybackState()).body
      const playbackContextURI = playbackState.context?.uri
      if (playlistURI !== playbackContextURI) return await ctx.spotifyUserAPI.play({ context_uri: playlistURI })
    }),
  /**
   * Get info about playback on the user's active device.
   *
   * Only if party playlist is being played (for privacy).
   */
  getPlayback: spotifyUserProcedure.input(z.object({ playlistId: z.string() })).mutation(async ({ input, ctx }) => {
    const playlistURI = `spotify:playlist:${input.playlistId}`
    const playbackState = (await ctx.spotifyUserAPI.getMyCurrentPlaybackState()).body
    const playbackContextURI = playbackState.context?.uri

    // If party playlist is playing
    if (playlistURI === playbackContextURI) {
      return {
        item: playbackState.item,
        progressMs: playbackState.progress_ms,
        timestamp: playbackState.timestamp,
        isPlaying: playbackState.is_playing,
      }
    }
  }),
})

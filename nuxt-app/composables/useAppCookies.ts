/** Composable for accessing all relevant app cookie refs.
 *
 * Reference: https://nuxt.com/docs/api/composables/use-cookie
 */
const useAppCookies = () => {
  return {
    jwt: useCookie('jwt', defaultCredentialsCookieSerializationOpts),
    code_verifier: useCookie('code_verifier', { ...defaultCredentialsCookieSerializationOpts, httpOnly: false }),
  }
}

export default useAppCookies
export type AppCookies = ReturnType<typeof useAppCookies>

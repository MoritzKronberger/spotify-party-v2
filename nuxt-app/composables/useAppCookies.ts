/** Composable for accessing all relevant app cookie refs. */
const useAppCookies = () => {
  return {
    access_token: useCookie('access_token', defaultCredentialsCookieSerializationOpts),
    refresh_token: useCookie('refresh_token', defaultCredentialsCookieSerializationOpts),
    code_verifier: useCookie('code_verifier', { ...defaultCredentialsCookieSerializationOpts, httpOnly: false }),
  }
}

export default useAppCookies
export type AppCookies = ReturnType<typeof useAppCookies>

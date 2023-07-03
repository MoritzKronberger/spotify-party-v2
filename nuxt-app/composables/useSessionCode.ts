export default async function useSessionCode() {
  const router = useRouter()
  const route = useRoute()
  const code = route.query.code?.toString() ?? undefined
  /* Pushback */
  if (code === undefined) {
    await router.push({ path: '/party/join-party' })
    return ''
  } else {
    return code
  }
}

export default async function useSessionCode() {
  const router = useRouter()
  const route = useRoute()
  const code = route.query.code?.toString() ?? undefined
  console.log(code)
  /* Pushback */
  if (code === undefined) {
    await router.push({ path: '/party/join-party' })
    return ''
  } else {
    return code
  }
}

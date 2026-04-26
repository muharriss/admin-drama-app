/**
 * Auth Middleware (Global)
 * - Redirect ke /login jika belum login (kecuali di halaman login)
 * - Redirect ke /dashboard jika sudah login tapi akses /login
 * - Validasi token ke backend jika ada token tersimpan
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Hanya jalan di client side (karena ssr: false)
  if (!import.meta.client) return

  const { token, isLoggedIn, loadSession, clearSession } = useAuthState()
  const { checkToken } = useAuthApi()

  // Load session dari localStorage jika belum ada di state
  if (!token.value) {
    loadSession()
  }

  const publicRoutes = ['/login']
  const isPublicRoute = publicRoutes.includes(to.path)

  // Jika sudah login dan akses halaman login → redirect ke dashboard
  if (isLoggedIn.value && isPublicRoute) {
    return navigateTo('/dashboard')
  }

  // Jika belum login dan bukan halaman publik → redirect ke login
  if (!isLoggedIn.value && !isPublicRoute) {
    return navigateTo('/login')
  }

  // Jika ada token, validasi ke backend (hanya sekali saat navigasi pertama)
  if (isLoggedIn.value && !isPublicRoute) {
    // Skip validasi jika sudah pernah tervalidasi di session ini
    const validated = useState('auth_validated', () => false)
    if (!validated.value) {
      try {
        await checkToken()
        validated.value = true
      } catch {
        // Token tidak valid, clear session dan redirect ke login
        clearSession()
        validated.value = false
        return navigateTo('/login')
      }
    }
  }
})

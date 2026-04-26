/**
 * useAuthState - Composable untuk mengelola state autentikasi admin.
 * Menggunakan Nuxt useState agar state bisa di-share antar komponen.
 */
export const useAuthState = () => {
  const token = useState('auth_token', () => null)
  const user = useState('auth_user', () => null)
  const isLoggedIn = computed(() => !!token.value)

  /**
   * Set session setelah login berhasil.
   * @param {{ token: string, user: Object }} session
   */
  const setSession = ({ token: newToken, user: newUser }) => {
    token.value = newToken
    user.value = newUser
    if (import.meta.client) {
      localStorage.setItem('admin_token', newToken)
      localStorage.setItem('admin_user', JSON.stringify(newUser))
    }
  }

  /**
   * Hapus session (logout).
   */
  const clearSession = () => {
    token.value = null
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
    }
  }

  /**
   * Load session dari localStorage (dipanggil saat app mount).
   */
  const loadSession = () => {
    if (import.meta.client) {
      const savedToken = localStorage.getItem('admin_token')
      const savedUser = localStorage.getItem('admin_user')
      if (savedToken) {
        token.value = savedToken
      }
      if (savedUser) {
        try {
          user.value = JSON.parse(savedUser)
        } catch {
          user.value = null
        }
      }
    }
  }

  /**
   * Cek apakah user memiliki akses ke modul tertentu.
   * @param {string} moduleCode - Kode modul (misal: '100', 'user-admin', 'provider')
   * @returns {boolean}
   */
  const hasAccess = (moduleCode) => {
    if (!user.value?.akses) return false
    return user.value.akses.some((a) => a._id === moduleCode || a.akses?.toLowerCase().includes(moduleCode.toLowerCase()))
  }

  /**
   * Mendapatkan inisial dari nama user.
   * @returns {string}
   */
  const userInitials = computed(() => {
    if (!user.value?.nama) return '?'
    return user.value.nama
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  })

  return {
    token,
    user,
    isLoggedIn,
    setSession,
    clearSession,
    loadSession,
    hasAccess,
    userInitials,
  }
}

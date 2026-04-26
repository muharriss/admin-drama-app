import { useApiFetch } from "./useApiFetch"

/**
 * useAuthApi - Composable untuk servis Auth (autentikasi admin).
 *
 * Endpoint prefix: /auth
 *
 * Mencakup:
 * - Captcha login
 * - Login / Logout
 * - Cek token aktif
 * - Cek permission role
 * - Info user aktif
 * - Log login
 * - Daftar token aktif
 * - Ganti password
 * - Ganti nama
 * - Hapus token aktif
 */
export const useAuthApi = () => {
  const { apiFetch } = useApiFetch()
  const PREFIX = '/auth'

  // ─── 1. Captcha Login ────────────────────────────────────────
  /**
   * Mengambil captcha login (SVG + hash).
   * @returns {Promise<{ data: { gambar: string, hash: string } }>}
   */
  const getCaptcha = () => {
    return apiFetch(`${PREFIX}/captcha`, {
      method: 'GET',
      useKey: true,
      useAuth: false,
    })
  }

  // ─── 2. Login ────────────────────────────────────────────────
  /**
   * Login admin dan buat session token baru.
   * @param {{ username: string, password: string, hash?: string, jawaban?: string }} credentials
   * @returns {Promise<{ data: { grant: string, token: string, iduser: string, user: Object } }>}
   */
  const login = (credentials) => {
    return apiFetch(`${PREFIX}/sessions`, {
      method: 'POST',
      body: credentials,
      useKey: true,
      useAuth: false,
    })
  }

  // ─── 3. Logout ───────────────────────────────────────────────
  /**
   * Logout dari session aktif saat ini.
   * @returns {Promise<{ message: string }>}
   */
  const logout = () => {
    return apiFetch(`${PREFIX}/sessions/current`, {
      method: 'DELETE',
      useKey: true,
      useAuth: true,
    })
  }

  // ─── 4. Cek Token Aktif ──────────────────────────────────────
  /**
   * Cek apakah token yang sedang dipakai masih valid.
   * @returns {Promise<{ data: { iduser: string, namauser: string } }>}
   */
  const checkToken = () => {
    return apiFetch(`${PREFIX}/tokens/current`, {
      method: 'GET',
      useKey: true,
      useAuth: true,
    })
  }

  // ─── 5. Cek Permission Role ──────────────────────────────────
  /**
   * Cek apakah user memiliki akses modul tertentu dengan method tertentu.
   * @param {{ role: string, method: string }} params
   * @returns {Promise<{ data: { iduser: string, namauser: string } }>}
   */
  const checkPermission = ({ role, method }) => {
    return apiFetch(`${PREFIX}/permissions`, {
      method: 'GET',
      query: { role, method },
      useKey: true,
      useAuth: true,
    })
  }

  // ─── 6. Info User Aktif ──────────────────────────────────────
  /**
   * Melihat profile admin yang sedang login.
   * @returns {Promise<{ data: Object }>}
   */
  const getMe = () => {
    return apiFetch(`${PREFIX}/users/me`, {
      method: 'GET',
      useKey: true,
      useAuth: true,
    })
  }

  // ─── 7. Log Login ────────────────────────────────────────────
  /**
   * Melihat histori login admin yang sedang aktif.
   * @param {{ page: number, limit: number, sortorder?: string }} params
   * @returns {Promise<{ data: Array, meta: Object }>}
   */
  const getLoginLogs = ({ page, limit, sortorder } = {}) => {
    return apiFetch(`${PREFIX}/login-logs`, {
      method: 'GET',
      query: { page, limit, sortorder },
      useKey: true,
      useAuth: true,
    })
  }

  // ─── 8. Daftar Token Aktif ───────────────────────────────────
  /**
   * Melihat seluruh token aktif milik user yang sedang login.
   * @returns {Promise<{ data: Array }>}
   */
  const getActiveTokens = () => {
    return apiFetch(`${PREFIX}/tokens`, {
      method: 'GET',
      useKey: true,
      useAuth: true,
    })
  }

  // ─── 9. Ganti Password ──────────────────────────────────────
  /**
   * Mengganti password admin yang sedang login.
   * @param {{ lama: string, baru: string }} payload
   * @returns {Promise<{ message: string }>}
   */
  const changePassword = ({ lama, baru }) => {
    return apiFetch(`${PREFIX}/users/me/password`, {
      method: 'PATCH',
      body: { lama, baru },
      useKey: true,
      useAuth: true,
    })
  }

  // ─── 10. Ganti Nama ─────────────────────────────────────────
  /**
   * Mengganti nama admin yang sedang login.
   * @param {{ nama: string }} payload
   * @returns {Promise<{ message: string }>}
   */
  const changeName = ({ nama }) => {
    return apiFetch(`${PREFIX}/users/me/profile`, {
      method: 'PATCH',
      body: { nama },
      useKey: true,
      useAuth: true,
    })
  }

  // ─── 11. Hapus Token Aktif ───────────────────────────────────
  /**
   * Menghapus salah satu token aktif milik sendiri.
   * @param {string} tokenId - ID token aktif yang akan dihapus
   * @returns {Promise<{ message: string }>}
   */
  const deleteActiveToken = (tokenId) => {
    return apiFetch(`${PREFIX}/tokens/${tokenId}`, {
      method: 'DELETE',
      useKey: true,
      useAuth: true,
    })
  }

  return {
    getCaptcha,
    login,
    logout,
    checkToken,
    checkPermission,
    getMe,
    getLoginLogs,
    getActiveTokens,
    changePassword,
    changeName,
    deleteActiveToken,
  }
}

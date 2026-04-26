import { useApiFetch } from "./useApiFetch"

/**
 * useUserAdminApi - Composable untuk servis User Admin.
 *
 * Endpoint prefix: /user-admin
 *
 * Mencakup:
 * - Daftar user admin (pagination)
 * - Detail user admin
 * - Info nama user admin
 * - Daftar modul akses
 * - Create user admin
 * - Set / ganti akses user
 * - Update data user admin
 * - Reset password user admin
 * - Hapus akses user
 * - Hapus user admin
 */
export const useUserAdminApi = () => {
  const { apiFetch } = useApiFetch()
  const PREFIX = '/user-admin'

  // ─── 1. Daftar User Admin ────────────────────────────────────
  /**
   * Menampilkan daftar user admin secara pagination.
   * @param {{ page: number, limit: number, username?: string, nama?: string, status?: string }} params
   * @returns {Promise<{ data: Array, meta: Object }>}
   */
  const getUsers = ({ page, limit, username, nama, status } = {}) => {
    return apiFetch(`${PREFIX}/user/${page}/${limit}`, {
      method: 'GET',
      query: { username, nama, status },
    })
  }

  // ─── 2. Detail User Admin ───────────────────────────────────
  /**
   * Melihat detail satu user admin beserta daftar akses modulnya.
   * @param {string} id - ObjectId user admin
   * @returns {Promise<{ data: Object }>}
   */
  const getUserDetail = (id) => {
    return apiFetch(`${PREFIX}/user/${id}/detail`, {
      method: 'GET',
    })
  }

  // ─── 3. Info Nama User Admin ─────────────────────────────────
  /**
   * Mengambil nama singkat user admin berdasarkan ID.
   * @param {string} id - ObjectId user admin
   * @returns {Promise<{ data: string }>}
   */
  const getUserInfo = (id) => {
    return apiFetch(`${PREFIX}/info/${id}`, {
      method: 'GET',
    })
  }

  // ─── 4. Daftar Modul Akses ──────────────────────────────────
  /**
   * Melihat master modul yang dapat diberikan ke user admin.
   * @returns {Promise<{ data: Array }>}
   */
  const getModules = () => {
    return apiFetch(`${PREFIX}/user/modul`, {
      method: 'GET',
    })
  }

  // ─── 5. Create User Admin ───────────────────────────────────
  /**
   * Membuat user admin baru.
   * @param {{ username: string, nama: string }} payload
   * @returns {Promise<{ message: string, data: { id: string } }>}
   */
  const createUser = ({ username, nama }) => {
    return apiFetch(`${PREFIX}/user`, {
      method: 'POST',
      body: { username, nama },
    })
  }

  // ─── 6. Set / Ganti Akses User ──────────────────────────────
  /**
   * Mengganti seluruh daftar akses modul milik user admin.
   * @param {{ id: string, akses: Array<string> }} payload
   *   - `akses` berisi array string JSON, contoh: '{"id":"100","method":["GET","POST"]}'
   * @returns {Promise<{ message: string }>}
   */
  const setUserAccess = ({ id, akses }) => {
    return apiFetch(`${PREFIX}/user/akses`, {
      method: 'POST',
      body: { id, akses },
    })
  }

  // ─── 7. Update Data User Admin ──────────────────────────────
  /**
   * Mengubah data dasar user admin.
   * @param {{ id: string, nama?: string, username?: string, status?: string }} payload
   * @returns {Promise<{ message: string }>}
   */
  const updateUser = ({ id, nama, username, status }) => {
    return apiFetch(`${PREFIX}/user`, {
      method: 'PUT',
      body: { id, nama, username, status },
    })
  }

  // ─── 8. Reset Password User Admin ──────────────────────────
  /**
   * Mereset password user ke password default berbasis username.
   * @param {{ id: string }} payload
   * @returns {Promise<{ message: string }>}
   */
  const resetUserPassword = ({ id }) => {
    return apiFetch(`${PREFIX}/user/password`, {
      method: 'PUT',
      body: { id },
    })
  }

  // ─── 9. Hapus Akses User ────────────────────────────────────
  /**
   * Menghapus satu modul akses atau satu method akses milik user admin.
   * @param {{ id: string, akses: string, method?: string }} payload
   * @returns {Promise<{ message: string }>}
   */
  const deleteUserAccess = ({ id, akses, method }) => {
    return apiFetch(`${PREFIX}/user/akses`, {
      method: 'DELETE',
      body: { id, akses, method },
    })
  }

  // ─── 10. Hapus User Admin ───────────────────────────────────
  /**
   * Menghapus user admin.
   * @param {{ id: string }} payload
   * @returns {Promise<{ message: string }>}
   */
  const deleteUser = ({ id }) => {
    return apiFetch(`${PREFIX}/user`, {
      method: 'DELETE',
      body: { id },
    })
  }

  return {
    getUsers,
    getUserDetail,
    getUserInfo,
    getModules,
    createUser,
    setUserAccess,
    updateUser,
    resetUserPassword,
    deleteUserAccess,
    deleteUser,
  }
}

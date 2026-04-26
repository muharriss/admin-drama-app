import { useApiFetch } from "./useApiFetch"

/**
 * useProviderApi - Composable untuk servis Provider.
 *
 * Endpoint prefix: /provider
 *
 * Mencakup:
 * - Daftar provider (pagination)
 * - Detail provider
 * - Input provider
 * - Update data provider
 * - Toggle status provider
 * - Toggle default provider
 * - Swap urutan provider
 * - Hapus provider
 */
export const useProviderApi = () => {
  const { apiFetch } = useApiFetch()
  const PREFIX = '/provider'

  // ─── 1. Daftar Provider ──────────────────────────────────────
  /**
   * Menampilkan daftar provider secara pagination.
   * @param {{ page: number, limit: number, nama?: string, keterangan?: string, status?: string, default?: string, sortby?: string, sortorder?: string }} params
   * @returns {Promise<{ data: Array, meta: Object }>}
   */
  const getProviders = ({ page, limit, nama, keterangan, status, default: isDefault, sortby, sortorder } = {}) => {
    return apiFetch(`${PREFIX}/${page}/${limit}`, {
      method: 'GET',
      query: { nama, keterangan, status, default: isDefault, sortby, sortorder },
    })
  }

  // ─── 2. Detail Provider ─────────────────────────────────────
  /**
   * Melihat detail provider.
   * @param {string} id - ID provider (huruf uppercase A-Z)
   * @returns {Promise<{ data: Object }>}
   */
  const getProviderDetail = (id) => {
    return apiFetch(`${PREFIX}/${id}/detail`, {
      method: 'GET',
    })
  }

  // ─── 3. Input Provider ──────────────────────────────────────
  /**
   * Membuat provider baru.
   * @param {{ _id: string, nama: string, keterangan: string, icon: string, free: number, urutan: number }} payload
   * @returns {Promise<{ message: string, data: { id: string } }>}
   */
  const createProvider = ({ _id, nama, keterangan, icon, free, urutan }) => {
    return apiFetch(`${PREFIX}/`, {
      method: 'POST',
      body: { _id, nama, keterangan, icon, free, urutan },
    })
  }

  // ─── 4. Update Data Provider ────────────────────────────────
  /**
   * Mengubah data provider secara partial.
   * @param {{ _id: string, nama?: string, keterangan?: string, icon?: string, free?: number, urutan?: number }} payload
   * @returns {Promise<{ message: string }>}
   */
  const updateProvider = ({ _id, nama, keterangan, icon, free, urutan }) => {
    return apiFetch(`${PREFIX}/`, {
      method: 'PUT',
      body: { _id, nama, keterangan, icon, free, urutan },
    })
  }

  // ─── 5. Toggle Status Provider ──────────────────────────────
  /**
   * Mengaktifkan atau menonaktifkan provider.
   * @param {{ _id: string }} payload
   * @returns {Promise<{ message: string }>}
   */
  const toggleProviderStatus = ({ _id }) => {
    return apiFetch(`${PREFIX}/status`, {
      method: 'PATCH',
      body: { _id },
    })
  }

  // ─── 6. Toggle Default Provider ─────────────────────────────
  /**
   * Mengubah status default provider.
   * @param {{ _id: string }} payload
   * @returns {Promise<{ message: string }>}
   */
  const toggleProviderDefault = ({ _id }) => {
    return apiFetch(`${PREFIX}/default`, {
      method: 'PATCH',
      body: { _id },
    })
  }

  // ─── 7. Swap Urutan Provider ────────────────────────────────
  /**
   * Menukar urutan dua provider.
   * @param {{ firstId: string, secondId: string }} payload
   * @returns {Promise<{ message: string }>}
   */
  const swapProviderOrder = ({ firstId, secondId }) => {
    return apiFetch(`${PREFIX}/swap-urutan`, {
      method: 'PATCH',
      body: { firstId, secondId },
    })
  }

  // ─── 8. Hapus Provider ──────────────────────────────────────
  /**
   * Menghapus provider.
   * @param {{ _id: string }} payload
   * @returns {Promise<{ message: string }>}
   */
  const deleteProvider = ({ _id }) => {
    return apiFetch(`${PREFIX}/`, {
      method: 'DELETE',
      body: { _id },
    })
  }

  return {
    getProviders,
    getProviderDetail,
    createProvider,
    updateProvider,
    toggleProviderStatus,
    toggleProviderDefault,
    swapProviderOrder,
    deleteProvider,
  }
}

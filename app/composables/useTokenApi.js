import { useApiFetch } from "./useApiFetch"

/**
 * useTokenApi - Composable untuk servis Token bisnis.
 *
 * Endpoint prefix: /token
 */
export const useTokenApi = () => {
  const { apiFetch } = useApiFetch()
  const PREFIX = '/token'

  /** Daftar token (tanpa pagination) */
  const getTokens = ({ token, status, expired, sortby, sortorder } = {}) => {
    return apiFetch(`${PREFIX}/`, {
      method: 'GET',
      query: { token, status, expired, sortby, sortorder },
    })
  }

  /** Detail satu token */
  const getTokenDetail = (id) => {
    return apiFetch(`${PREFIX}/${id}/detail`, { method: 'GET' })
  }

  /** Histori penggunaan token per hari */
  const getTokenUsage = (id, { startDate, endDate } = {}) => {
    return apiFetch(`${PREFIX}/${id}/usage`, {
      method: 'GET',
      query: { startDate, endDate },
    })
  }

  /** Buat token baru */
  const createToken = ({ token, expiredAt, maxUse, order }) => {
    return apiFetch(`${PREFIX}/`, {
      method: 'POST',
      body: { token, expiredAt, maxUse, order },
    })
  }

  /** Update token partial */
  const updateToken = ({ _id, token, expiredAt, maxUse, order }) => {
    return apiFetch(`${PREFIX}/`, {
      method: 'PUT',
      body: { _id, token, expiredAt, maxUse, order },
    })
  }

  /** Toggle status token */
  const toggleTokenStatus = ({ _id }) => {
    return apiFetch(`${PREFIX}/status`, {
      method: 'PATCH',
      body: { _id },
    })
  }

  /** Swap urutan dua token */
  const swapTokenOrder = ({ firstId, secondId }) => {
    return apiFetch(`${PREFIX}/swap-urutan`, {
      method: 'PATCH',
      body: { firstId, secondId },
    })
  }

  /** Hapus token beserta relasi usage */
  const deleteToken = ({ _id }) => {
    return apiFetch(`${PREFIX}/`, {
      method: 'DELETE',
      body: { _id },
    })
  }

  return {
    getTokens,
    getTokenDetail,
    getTokenUsage,
    createToken,
    updateToken,
    toggleTokenStatus,
    swapTokenOrder,
    deleteToken,
  }
}

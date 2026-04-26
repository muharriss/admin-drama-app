import { useApiFetch } from "./useApiFetch"

/**
 * usePenggunaApi - Composable untuk servis Pengguna (read-only).
 *
 * Endpoint prefix: /pengguna
 */
export const usePenggunaApi = () => {
  const { apiFetch } = useApiFetch()
  const PREFIX = '/pengguna'

  /** Daftar pengguna (pagination) */
  const getPengguna = ({ page, limit, nama, email, telegramId, googleId, platform, linked, registeredStartDate, registeredEndDate, sortby, sortorder } = {}) => {
    return apiFetch(`${PREFIX}/${page}/${limit}`, {
      method: 'GET',
      query: { nama, email, telegramId, googleId, platform, linked, registeredStartDate, registeredEndDate, sortby, sortorder },
    })
  }

  /** Detail satu pengguna */
  const getPenggunaDetail = (id) => {
    return apiFetch(`${PREFIX}/${id}/detail`, { method: 'GET' })
  }

  /** History nonton (pagination) */
  const getHistory = ({ page, limit, userId, provider, platform, dramaTitle, startDate, endDate } = {}) => {
    return apiFetch(`${PREFIX}/history/${page}/${limit}`, {
      method: 'GET',
      query: { userId, provider, platform, dramaTitle, startDate, endDate },
    })
  }

  /** Bookmark pengguna (pagination) */
  const getBookmarks = ({ page, limit, userId, provider, platform, dramaTitle, startDate, endDate } = {}) => {
    return apiFetch(`${PREFIX}/bookmark/${page}/${limit}`, {
      method: 'GET',
      query: { userId, provider, platform, dramaTitle, startDate, endDate },
    })
  }

  /** Watch time lintas pengguna (pagination) */
  const getWatchTime = ({ page, limit, userId, year, month, platform, sortby, sortorder } = {}) => {
    return apiFetch(`${PREFIX}/watch-time/${page}/${limit}`, {
      method: 'GET',
      query: { userId, year, month, platform, sortby, sortorder },
    })
  }

  /** Watch time per user tertentu (pagination) */
  const getUserWatchTime = (id, { page, limit, year, month, platform, sortby, sortorder } = {}) => {
    return apiFetch(`${PREFIX}/${id}/watch-time/${page}/${limit}`, {
      method: 'GET',
      query: { year, month, platform, sortby, sortorder },
    })
  }

  return {
    getPengguna,
    getPenggunaDetail,
    getHistory,
    getBookmarks,
    getWatchTime,
    getUserWatchTime,
  }
}

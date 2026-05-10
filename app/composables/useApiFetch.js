/**
 * useApiFetch - Base composable untuk semua API call admin drama app.
 *
 * Menyediakan:
 * - Base URL dari runtimeConfig
 * - Otomatis set header `Key` (API Key) dan `Authorization` (Bearer token)
 * - Centralized error handling (parsing error response backend)
 * - Auto-redirect ke login saat token expired (401)
 * - Helper untuk x-www-form-urlencoded body
 */
export const useApiFetch = () => {
  const config = useRuntimeConfig()
  const router = useRouter()

  const BASE_URL = config.public.apiBase
  const API_KEY = config.public.apiKey

  // --- Helpers ---

  /**
   * Ambil token dari localStorage.
   * @returns {string|null}
   */
  const getToken = () => {
    if (import.meta.client) {
      return localStorage.getItem('admin_token')
    }
    return null
  }

  /**
   * Konversi object ke URLSearchParams string (x-www-form-urlencoded).
   * Mendukung field yang dikirim berulang (array of values untuk satu key).
   * @param {Object} body
   * @returns {string}
   */
  const toFormBody = (body) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(body)) {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v))
      } else if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    }
    return params.toString()
  }

  /**
   * Parse error response dari backend.
   * Format error backend: { message, errors?, code? }
   * @param {Error} error
   * @returns {{ message: string, errors: Object|null, code: string|null, status: number }}
   */
  const parseError = (error) => {
    const status = error?.status || error?.statusCode || 500
    const responseData = error?.data || error?.response?._data || null

    const parsed = {
      message: responseData?.message || error?.message || 'Terjadi kesalahan pada server',
      errors: responseData?.errors || null,
      code: responseData?.code || null,
      status,
    }

    return parsed
  }

  /**
   * Core fetch function.
   *
   * @param {string} endpoint - Path relatif terhadap BASE_URL (misal: `/auth/sessions`)
   * @param {Object} options
   * @param {string} [options.method='GET']
   * @param {Object} [options.body] - Body data (akan di-encode ke form-urlencoded)
   * @param {Object} [options.query] - Query params
   * @param {Object} [options.headers] - Header tambahan
   * @param {boolean} [options.useKey=false] - Jika true, sertakan header `Key` (untuk auth module)
   * @param {boolean} [options.useAuth=true] - Jika true, sertakan header `Authorization: Bearer <token>`
   * @param {boolean} [options.rawBody=false] - Jika true, body dikirim apa adanya (JSON), bukan form-urlencoded
   * @returns {Promise<{ data: any, meta: any, message: string|null }>}
   * @throws {{ message: string, errors: Object|null, code: string|null, status: number }}
   */
  const apiFetch = async (endpoint, options = {}) => {
    const {
      method = 'GET',
      body = null,
      query = null,
      headers = {},
      useKey = false,
      useAuth = true,
      rawBody = false,
    } = options

    // Build headers
    const requestHeaders = { ...headers }

    if (useKey) {
      requestHeaders['Key'] = API_KEY
    }

    if (useAuth) {
      const token = getToken()
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`
      }
    }

    // Build fetch options
    const fetchOptions = {
      method,
      headers: requestHeaders,
    }

    // Query params
    if (query) {
      // Hapus key dengan value null/undefined/empty string
      const cleanQuery = {}
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null && value !== '') {
          cleanQuery[key] = value
        }
      }
      if (Object.keys(cleanQuery).length > 0) {
        fetchOptions.query = cleanQuery
      }
    }

    // Body (x-www-form-urlencoded atau raw JSON)
    if (body && method !== 'GET') {
      if (rawBody) {
        requestHeaders['Content-Type'] = 'application/json'
        fetchOptions.body = body
      } else {
        requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded'
        fetchOptions.body = toFormBody(body)
      }
    }

    try {
      const response = await $fetch(endpoint, {
        baseURL: BASE_URL,
        ...fetchOptions,
      })

      // Backend mengembalikan { data?, meta?, message? }
      return {
        data: response?.data ?? null,
        meta: response?.meta ?? null,
        message: response?.message ?? null,
      }
    } catch (error) {
      const parsed = parseError(error)

      // Auto-redirect ke login jika 401 (token expired / tidak valid)
      if (parsed.status === 401 || parsed.code === 'UNAUTHORIZED') {
        if (import.meta.client) {
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_user')
        }
        // await router.push('/login')
        await navigateTo('/login')
      }

      throw parsed
    }
  }

  return {
    apiFetch,
    toFormBody,
    getToken,
    parseError,
    BASE_URL,
    API_KEY,
  }
}

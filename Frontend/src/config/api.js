/**
 * Universal Frontend API Configuration for Enquiry Website (MERN Stack)
 *
 * Centralizes the Backend Server URL, API routing, and HTTP client for both
 * local development and production deployments (e.g. Render, Vercel).
 *
 * HOW TO CONFIGURE IN PRODUCTION (Render):
 * In your Render Static Site Dashboard -> Environment tab:
 * Add: VITE_API_BASE_URL = https://<your-backend-service-name>.onrender.com
 *
 * IN LOCAL DEVELOPMENT:
 * If VITE_API_BASE_URL is not set, it defaults to "" (empty string).
 * All requests route through the local Vite dev proxy configured in vite.config.js
 * which points to http://localhost:5000.
 */

// Read base URL from Vite environment variables (supports VITE_API_URL, VITE_API_BASE_URL, or VITE_BACKEND_URL)
const rawBase = (
  (import.meta.env && import.meta.env.VITE_API_URL) ||
  (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  (import.meta.env && import.meta.env.VITE_BACKEND_URL) ||
  ''
).trim().replace(/\/+$/, '')

// Normalize Backend Root URL (strip trailing /api if the user accidentally included it in .env)
export const BACKEND_URL = rawBase.replace(/\/api$/, '')

// Universal API Root (e.g. "https://api.example.com/api" or "/api" for relative proxy)
export const API_BASE_URL = BACKEND_URL ? `${BACKEND_URL}/api` : '/api'

/**
 * Resolves any endpoint to a valid full API URL without duplicate '/api' segments.
 *
 * @param {string} endpoint - Path like '/products', 'categories', or '/api/settings'
 * @returns {string} Sanitized full URL
 *
 * Examples:
 *   getApiUrl('/products')      => "https://backend.onrender.com/api/products" (or "/api/products" in dev)
 *   getApiUrl('/api/health')    => "https://backend.onrender.com/api/health"
 *   getApiUrl('upload')         => "https://backend.onrender.com/api/upload"
 */
export const getApiUrl = (endpoint = '') => {
  if (!endpoint) return API_BASE_URL
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  if (cleanEndpoint.startsWith('/api/')) {
    return BACKEND_URL ? `${BACKEND_URL}${cleanEndpoint}` : cleanEndpoint
  }
  return `${API_BASE_URL}${cleanEndpoint}`
}

/**
 * Universal API Client with automatic JSON parsing, credentials support,
 * multipart FormData detection, and robust error handling.
 *
 * @param {string} endpoint - API route (e.g. '/products' or '/upload')
 * @param {RequestInit} options - Standard fetch options (method, headers, body, etc.)
 * @returns {Promise<any>}
 */
export const apiClient = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint)
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  // Dual token support: attach Bearer token if saved in localStorage/sessionStorage
  let storedToken = null
  try {
    storedToken =
      (typeof localStorage !== 'undefined' && localStorage.getItem('admin_jwt_token')) ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('admin_jwt_token')) ||
      null
  } catch (e) {
    // ignore
  }

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(storedToken && !options.headers?.Authorization ? { Authorization: `Bearer ${storedToken}` } : {}),
    ...options.headers
  }

  // Include credentials by default for cookie / auth support
  const fetchOptions = {
    credentials: options.credentials || 'include',
    ...options,
    headers
  }

  // 30-second timeout controller to accommodate cloud database latency without false timeouts
  const timeoutMs = options.timeout || 30000
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: options.signal || controller.signal
    })
    clearTimeout(timeoutId)
    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return (
        data || {
          success: false,
          status: response.status,
          message: `Server returned error ${response.status}: ${response.statusText}`
        }
      )
    }

    return data
  } catch (error) {
    clearTimeout(timeoutId)
    const isTimeout = error.name === 'AbortError'
    const msg = isTimeout
      ? `Request timed out. Unable to reach backend server at ${url}. Please ensure the backend is running.`
      : `Unable to connect to backend server at ${url}. Please verify server is running.`
    console.warn(`[apiClient] Network request failed for ${url}:`, error.message)
    return {
      success: false,
      isOffline: true,
      message: msg
    }
  }
}

export default {
  BACKEND_URL,
  API_BASE_URL,
  getApiUrl,
  apiClient
}

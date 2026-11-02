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

/**
 * Resolves the Backend Server URL dynamically across build-time environment variables,
 * runtime localStorage overrides, and auto-detected cloud deployment patterns (Render).
 */
export const resolveBackendUrl = () => {
  // 1. Build-time Vite environment variables
  const envUrl = (
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) ||
    ''
  ).trim().replace(/\/+$/, '')

  if (envUrl) {
    return envUrl.replace(/\/api$/, '')
  }

  // 2. Runtime browser window or localStorage overrides (allows instant fix without full rebuild)
  if (typeof window !== 'undefined') {
    if (window.__API_URL__) {
      return String(window.__API_URL__).trim().replace(/\/+$/, '').replace(/\/api$/, '')
    }
    try {
      const stored = localStorage.getItem('VITE_API_URL') || localStorage.getItem('api_base_url')
      if (stored && stored.trim()) {
        return stored.trim().replace(/\/+$/, '').replace(/\/api$/, '')
      }
    } catch {
      // ignore localStorage security restrictions
    }

    // 3. Dynamic Render deployment auto-detection:
    // On Render, if the frontend static site is "service-frontend.onrender.com",
    // the paired backend REST API web service is conventionally named "service-backend.onrender.com".
    const host = window.location.hostname || ''
    if (host.endsWith('.onrender.com')) {
      if (host.includes('-frontend')) {
        const backendHost = host.replace('-frontend', '-backend')
        return `https://${backendHost}`
      }
      if (host.includes('frontend')) {
        const backendHost = host.replace('frontend', 'backend')
        return `https://${backendHost}`
      }
    }
  }

  return ''
}

// Normalize Backend Root URL
export const BACKEND_URL = resolveBackendUrl()

// Universal API Root (e.g. "https://api.example.com/api" or "/api" for relative proxy)
export const API_BASE_URL = BACKEND_URL ? `${BACKEND_URL}/api` : '/api'

/**
 * Resolves any endpoint to a valid full API URL without duplicate '/api' segments.
 *
 * @param {string} endpoint - Path like '/products', 'categories', or '/api/settings'
 * @returns {string} Sanitized full URL
 */
export const getApiUrl = (endpoint = '') => {
  const backend = resolveBackendUrl() || BACKEND_URL
  const apiBase = backend ? `${backend}/api` : API_BASE_URL

  if (!endpoint) return apiBase
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  if (cleanEndpoint.startsWith('/api/')) {
    return backend ? `${backend}${cleanEndpoint}` : cleanEndpoint
  }
  return `${apiBase}${cleanEndpoint}`
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

  // 60-second timeout controller to accommodate Render free-tier cold boot latency without false timeouts
  const timeoutMs = options.timeout || 60000
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: options.signal || controller.signal
    })
    clearTimeout(timeoutId)

    const contentType = response.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    const data = isJson ? await response.json().catch(() => null) : null

    // If server returned non-JSON (e.g. HTML from a static SPA rewrite or 502 Bad Gateway)
    if (!isJson) {
      console.warn(`[apiClient] Received non-JSON response from ${url}:`, { status: response.status, contentType })
      return {
        success: false,
        status: response.status,
        isHtmlResponse: true,
        message: `Backend API server at ${url} returned a non-JSON response (${contentType || 'text/html'}). Please ensure your backend is deployed and VITE_API_URL is configured.`
      }
    }

    if (!response.ok) {
      return (
        data || {
          success: false,
          status: response.status,
          message: `Server returned error ${response.status}: ${response.statusText}`
        }
      )
    }

    if (!data) {
      return {
        success: false,
        message: `Failed to parse JSON response from server at ${url}.`
      }
    }

    return data
  } catch (error) {
    clearTimeout(timeoutId)
    const isTimeout = error.name === 'AbortError'
    const msg = isTimeout
      ? `Request timed out after ${timeoutMs / 1000}s. The backend server at ${url} may be waking up from cold sleep. Please wait a moment and try again.`
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

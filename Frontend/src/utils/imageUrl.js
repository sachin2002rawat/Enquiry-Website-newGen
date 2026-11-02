import { BACKEND_URL } from '../config/api'

/**
 * Utility to resolve product and media image URLs to full valid endpoints.
 * Handles local backend uploads, absolute URLs, data URLs, and external assets.
 *
 * In production:
 * If url starts with '/uploads/', prepends BACKEND_URL (e.g. https://your-backend.onrender.com).
 * In development:
 * If BACKEND_URL is not set, returns '/uploads/...' which Vite proxies to http://localhost:5000/uploads.
 */
export const getFullImageUrl = (url) => {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed
  }
  if (trimmed.startsWith('/uploads/')) {
    return BACKEND_URL ? `${BACKEND_URL}${trimmed}` : trimmed
  }
  return trimmed
}

export default getFullImageUrl

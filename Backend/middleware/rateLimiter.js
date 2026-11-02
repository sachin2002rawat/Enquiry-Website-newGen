/**
 * In-Memory Sliding-Window Rate Limiter for Authentication Endpoints.
 * Limits failed login attempts per IP to prevent brute-force attacks.
 */

const loginAttempts = new Map()

const WINDOW_MS = 15 * 60 * 1000 // 15 minutes window
const MAX_ATTEMPTS = 10 // Max 10 failed attempts per window

// Helper to sanitize IP
const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.ip ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  )
}

/**
 * Middleware that blocks requests if IP exceeded failed login limit
 */
export const loginRateLimiter = (req, res, next) => {
  const ip = getClientIp(req)
  const now = Date.now()
  const record = loginAttempts.get(ip)

  if (record) {
    // Filter attempts within current window
    const recentAttempts = record.timestamps.filter((time) => now - time < WINDOW_MS)
    record.timestamps = recentAttempts

    if (recentAttempts.length >= MAX_ATTEMPTS) {
      const oldestAttempt = recentAttempts[0]
      const retryAfterSeconds = Math.ceil((oldestAttempt + WINDOW_MS - now) / 1000)

      res.setHeader('Retry-After', retryAfterSeconds)
      return res.status(429).json({
        success: false,
        message: `Too many failed login attempts from this IP. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.`
      })
    }
  }

  next()
}

/**
 * Record a failed login attempt for an IP
 */
export const recordFailedLogin = (req) => {
  const ip = getClientIp(req)
  const now = Date.now()
  const record = loginAttempts.get(ip) || { timestamps: [] }
  record.timestamps.push(now)
  loginAttempts.set(ip, record)
}

/**
 * Clear failed login attempts for an IP upon successful authentication
 */
export const clearLoginAttempts = (req) => {
  const ip = getClientIp(req)
  loginAttempts.delete(ip)
}

export default {
  loginRateLimiter,
  recordFailedLogin,
  clearLoginAttempts
}


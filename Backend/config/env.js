import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load environment variables from Backend/.env explicitly, and fall back to process.cwd() .env
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config()

/**
 * Safely masks sensitive credentials (connection strings, passwords, api keys) for logging
 */
export const maskSecret = (val = '') => {
  if (!val || typeof val !== 'string') return ''
  // If MongoDB URI, mask username and password: mongodb(+srv)://user:pass@host/db
  if (val.startsWith('mongodb+srv://') || val.startsWith('mongodb://')) {
    return val.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:********@')
  }
  if (val.length <= 4) return '****'
  return `${val.slice(0, 3)}***${val.slice(-3)}`
}

/**
 * Parses comma-separated or wildcard CORS origins into a sanitized array
 */
const parseCorsOrigins = (raw = '') => {
  if (!raw || raw.trim() === '*' || raw.trim() === '') {
    return ['*']
  }
  return raw
    .split(',')
    .map(origin => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean)
}

// Extract and normalize MongoDB URI
const rawMongoUri = (
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017/EnquiryWebsite'
).trim().replace(/^MONGO_URI=/, '')

/**
 * Centralized Backend Environment Configuration
 */
export const envConfig = {
  // Server networking
  port: Number(process.env.PORT) || 5001,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Database
  mongo: {
    uri: rawMongoUri,
    maskedUri: maskSecret(rawMongoUri)
  },

  // Security & Authentication
  jwtSecret: process.env.JWT_SECRET || 'enquiry_jwt_secret_dev_fallback_change_in_prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Initial Super Admin Bootstrap Credentials
  superAdmin: {
    name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
    email: (process.env.SUPER_ADMIN_EMAIL || 'admin@quick-enquiry.com').toLowerCase().trim(),
    password: process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456'
  },

  // CORS & Client Integration
  cors: {
    raw: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '*',
    allowedOrigins: parseCorsOrigins(process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '*')
  },

  // Host and Client URLs
  urls: {
    baseUrl: (process.env.BASE_URL || '').trim().replace(/\/+$/, ''),
    clientUrl: (process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173').trim().replace(/\/+$/, '')
  },

  // Cloudinary Image Storage
  cloudinary: {
    cloudName: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
    apiKey: (process.env.CLOUDINARY_API_KEY || '').trim(),
    apiSecret: (process.env.CLOUDINARY_API_SECRET || '').trim()
  },

  // SMTP Email Notification
  smtp: {
    host: (process.env.SMTP_HOST || 'smtp.gmail.com').trim(),
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    user: (process.env.SMTP_USER || '').trim(),
    pass: (process.env.SMTP_PASS || '').trim(),
    fromName: (process.env.SMTP_FROM_NAME || 'QuickEnquiry').trim(),
    fromEmail: (process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || '').trim(),
    replyTo: (process.env.SMTP_REPLY_TO || process.env.SMTP_USER || '').trim(),
    adminRecipient: (process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || '').trim(),
    companyName: (process.env.COMPANY_NAME || 'QuickEnquiry').trim()
  }
}

/**
 * Validates environment configuration on startup and prints non-sensitive diagnostic info
 */
export const validateEnv = () => {
  const warnings = []
  const notices = []

  if (envConfig.isProduction) {
    if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
      warnings.push('MONGO_URI is not set in production. Render instances do not run local MongoDB. Set MONGO_URI in Render dashboard.')
    }
    if (!process.env.CORS_ORIGIN && !process.env.FRONTEND_URL) {
      notices.push('CORS_ORIGIN is not restricted. Defaulting to allow all origins with credentials reflection.')
    }
    if (!process.env.CLOUDINARY_CLOUD_NAME && !process.env.CLOUDINARY_API_KEY) {
      notices.push('Cloudinary is not configured in env. Local uploads will use Render ephemeral disk unless configured in Admin UI.')
    }
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️ [Backend Environment Warnings]:')
    warnings.forEach(w => console.warn(`   • ${w}`))
    console.warn('')
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    notices
  }
}

export default envConfig

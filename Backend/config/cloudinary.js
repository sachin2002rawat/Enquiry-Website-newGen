import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import dotenv from 'dotenv'
import CompanySettings from '../models/CompanySettings.js'
import CloudinarySettings from '../models/CloudinarySettings.js'

dotenv.config()

/**
 * Retrieve active Cloudinary configuration
 * Priority: 1. MongoDB CloudinarySettings collection -> 2. MongoDB CompanySettings.cloudinary -> 3. Environment Variables (.env)
 */
export const getActiveCloudinaryConfig = async () => {
  try {
    const cloudDoc = await CloudinarySettings.findOne()        
    if (
      cloudDoc &&
      cloudDoc.cloudName &&
      cloudDoc.apiKey &&
      cloudDoc.apiSecret
    ) {
      return {
        enabled: cloudDoc.enabled !== false,
        cloudName: cloudDoc.cloudName.trim(),
        apiKey: cloudDoc.apiKey.trim(),
        apiSecret: cloudDoc.apiSecret.trim(),
        folder: (cloudDoc.folder || 'enquiry_products').trim(),
        source: 'database'
      }
    }

    const settings = await CompanySettings.findOne()
    if (
      settings &&
      settings.cloudinary &&
      settings.cloudinary.cloudName &&
      settings.cloudinary.apiKey &&
      settings.cloudinary.apiSecret
    ) {
      return {
        enabled: settings.cloudinary.enabled !== false,
        cloudName: settings.cloudinary.cloudName.trim(),
        apiKey: settings.cloudinary.apiKey.trim(),
        apiSecret: settings.cloudinary.apiSecret.trim(),
        folder: (settings.cloudinary.folder || 'enquiry_products').trim(),
        source: 'database'
      }
    }
  } catch (err) {
    console.warn('[cloudinary] Could not load DB Cloudinary settings, checking .env:', err.message)
  }

  // Fallback to Environment Variables (.env)
  const envCloudName = process.env.CLOUDINARY_CLOUD_NAME
  const envApiKey = process.env.CLOUDINARY_API_KEY
  const envApiSecret = process.env.CLOUDINARY_API_SECRET

  if (
    envCloudName &&
    envApiKey &&
    envApiSecret &&
    envCloudName !== 'your_cloud_name' &&
    envApiKey !== 'your_api_key'
  ) {
    return {
      enabled: true,
      cloudName: envCloudName.trim(),
      apiKey: envApiKey.trim(),
      apiSecret: envApiSecret.trim(),
      folder: 'enquiry_products',
      source: 'env'
    }
  }

  return null
}

/**
 * Configure Cloudinary SDK instance with specific or active credentials
 */
export const configureCloudinary = (config) => {
  if (config && config.cloudName && config.apiKey && config.apiSecret) {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true
    })
    return true
  }
  return false
}

/**
 * Verify Cloudinary connection and credentials via API ping
 */
export const testCloudinaryConfig = async ({ cloudName, apiKey, apiSecret }) => {
  try {
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloud Name, API Key, and API Secret are required to test Cloudinary')
    }

    const trimmedCloudName = cloudName.trim()
    const trimmedApiKey = apiKey.trim()
    const trimmedApiSecret = apiSecret.trim()

    const res = await cloudinary.api.ping({
      cloud_name: trimmedCloudName,
      api_key: trimmedApiKey,
      api_secret: trimmedApiSecret
    })

    return {
      success: true,
      message: `Cloudinary verified successfully! Connected to cloud "${trimmedCloudName}".`,
      status: res.status || 'ok'
    }
  } catch (err) {
    const errorDetail = err.error?.message || err.message || 'Cloudinary verification failed'
    console.error('❌ [cloudinary] Verification failed:', errorDetail)
    return {
      success: false,
      error: errorDetail
    }
  }
}

// Initial configuration from .env if present
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  })
}

// Memory storage for dynamic multi-tenant / DB-configured uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

export { cloudinary, upload }

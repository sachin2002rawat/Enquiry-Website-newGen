import express from 'express'
import path from 'path'
import fs from 'fs'
import {
  upload,
  cloudinary,
  getActiveCloudinaryConfig,
  configureCloudinary,
  testCloudinaryConfig
} from '../config/cloudinary.js'
import { protectAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// @desc    Upload image to Cloudinary via Multer (supports dynamic DB settings)
// @route   POST /api/upload
// @access  Private / Protected Admin
router.post('/', protectAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' })
    }

    // Load active Cloudinary configuration (MongoDB CompanySettings -> .env)
    const activeConfig = await getActiveCloudinaryConfig()
    const folder = activeConfig?.folder || 'enquiry_products'

    let imageUrl = null
    let publicId = null

    if (activeConfig && activeConfig.enabled && configureCloudinary(activeConfig)) {
      if (req.file.buffer) {
        const b64 = Buffer.from(req.file.buffer).toString('base64')
        const mime = req.file.mimetype || 'image/png'
        try {
          const uploadPromise = cloudinary.uploader.upload(`data:${mime};base64,${b64}`, {
            folder: folder,
            resource_type: 'auto'
          })
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Cloudinary upload timed out after 4s')), 4000)
          )
          const uploadResult = await Promise.race([uploadPromise, timeoutPromise])
          imageUrl = uploadResult.secure_url
          publicId = uploadResult.public_id
        } catch (cloudErr) {
          console.warn('⚠️ Cloudinary dynamic upload note:', cloudErr.message)
        }
      }
    }

    // Fallback if Cloudinary is not configured or failed: save to local /uploads directory
    if (!imageUrl && req.file.buffer) {
      try {
        const ext = req.file.mimetype ? (req.file.mimetype.split('/')[1] || 'png') : 'png'
        const cleanExt = ext === 'jpeg' ? 'jpg' : ext
        const filename = `img_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}.${cleanExt}`
        const uploadsDir = path.join(process.cwd(), 'uploads')
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true })
        }
        fs.writeFileSync(path.join(uploadsDir, filename), req.file.buffer)
        const serverBase = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`
        imageUrl = `${serverBase}/uploads/${filename}`
        publicId = filename
      } catch (saveErr) {
        console.warn('Local file write error:', saveErr.message)
        const b64 = Buffer.from(req.file.buffer).toString('base64')
        const mime = req.file.mimetype || 'image/png'
        imageUrl = `data:${mime};base64,${b64}`
        publicId = `local_${Date.now()}`
      }
    }

    res.status(200).json({
      success: true,
      message: imageUrl?.startsWith('http') ? 'Image uploaded successfully to Cloudinary!' : 'Image processed as DataURL',
      url: imageUrl,
      secure_url: imageUrl,
      public_id: publicId || req.file.filename || req.file.public_id || `file_${Date.now()}`,
      storage: imageUrl?.startsWith('http') ? 'cloudinary' : 'data_url'
    })
  } catch (error) {
    console.error('Upload Error:', error)
    res.status(500).json({ success: false, message: error.message || 'Image upload failed' })
  }
})

// @desc    Test Cloudinary configuration credentials
// @route   POST /api/upload/test-cloudinary
// @access  Public / Admin
router.post('/test-cloudinary', async (req, res) => {
  try {
    const { cloudName, apiKey, apiSecret } = req.body
    let creds = { cloudName, apiKey, apiSecret }

    if (!creds.cloudName || !creds.apiKey || !creds.apiSecret) {
      const active = await getActiveCloudinaryConfig()
      if (active) creds = active
    }

    const result = await testCloudinaryConfig(creds)
    if (result.success) {
      return res.status(200).json(result)
    } else {
      return res.status(400).json(result)
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router

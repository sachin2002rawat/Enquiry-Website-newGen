import express from 'express'
import {
  loginAdmin,
  logoutAdmin,
  getMe,
  updateMyProfile
} from '../controllers/adminAuthController.js'
import { protectAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public authentication routes
router.post('/login', loginAdmin)
router.post('/logout', logoutAdmin)

// Protected session & profile routes
router.get('/me', protectAdmin, getMe)
router.put('/profile', protectAdmin, updateMyProfile)

export default router


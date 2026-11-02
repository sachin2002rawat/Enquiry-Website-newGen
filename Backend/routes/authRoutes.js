import express from 'express'
import {
  superAdminLogin,
  loginAdmin,
  getMe,
  logoutAdmin,
  changePassword,
  updateMyProfile
} from '../controllers/adminAuthController.js'
import { protectAdmin } from '../middleware/authMiddleware.js'
import { loginRateLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Super Admin Authentication
router.post('/super-admin/login', loginRateLimiter, superAdminLogin)

// General / Regular Admin Authentication
router.post('/admin/login', loginRateLimiter, loginAdmin)
router.get('/admin/me', protectAdmin, getMe)
router.post('/admin/logout', logoutAdmin)
router.patch('/admin/change-password', protectAdmin, changePassword)
router.put('/admin/change-password', protectAdmin, changePassword)
router.put('/admin/profile', protectAdmin, updateMyProfile)

export default router


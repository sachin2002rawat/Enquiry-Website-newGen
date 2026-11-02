import express from 'express'
import {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  updateAdminPermissions,
  toggleAdminStatus,
  resetAdminPassword,
  deleteAdmin
} from '../controllers/adminManagementController.js'
import { protectAdmin, authorizeRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

// All admin management routes are strictly reserved for SUPER_ADMIN
router.use(protectAdmin, authorizeRoles('SUPER_ADMIN'))

router.post(['/create', '/admins'], createAdmin)
router.get(['/all', '/admins'], getAllAdmins)
router.get(['/:id', '/admins/:id'], getAdminById)
router.put(['/:id', '/admins/:id'], updateAdmin)
router.patch(['/:id', '/admins/:id'], updateAdmin)
router.patch(['/:id/status', '/admins/:id/status'], toggleAdminStatus)
router.put(['/:id/status', '/admins/:id/status'], toggleAdminStatus)
router.patch(['/:id/permissions', '/admins/:id/permissions'], updateAdminPermissions)
router.put(['/:id/permissions', '/admins/:id/permissions'], updateAdminPermissions)
router.post(['/:id/reset-password', '/:id/password', '/admins/:id/password', '/admins/:id/reset-password'], resetAdminPassword)
router.patch(['/:id/password', '/:id/reset-password', '/admins/:id/password', '/admins/:id/reset-password'], resetAdminPassword)
router.put(['/:id/password', '/:id/reset-password', '/admins/:id/password', '/admins/:id/reset-password'], resetAdminPassword)
router.delete(['/:id', '/admins/:id'], deleteAdmin)

export default router


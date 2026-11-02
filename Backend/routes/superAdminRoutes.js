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
import { protectSuperAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// All routes in this router require Super Admin privileges
router.use(protectSuperAdmin)

// Super Admin Management APIs
router.route('/admins')
  .post(createAdmin)
  .get(getAllAdmins)

router.route('/admins/:id')
  .get(getAdminById)
  .put(updateAdmin)
  .delete(deleteAdmin)

router.route('/admins/:id/status')
  .patch(toggleAdminStatus)
  .put(toggleAdminStatus)

router.route('/admins/:id/permissions')
  .patch(updateAdminPermissions)
  .put(updateAdminPermissions)

router.route('/admins/:id/password')
  .patch(resetAdminPassword)
  .put(resetAdminPassword)
  .post(resetAdminPassword)

export default router


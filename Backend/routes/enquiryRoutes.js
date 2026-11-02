import express from 'express'
import {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
  testSmtpConnection
} from '../controllers/enquiryController.js'
import { protectAdmin, authorizePermissions } from '../middleware/authMiddleware.js'

const router = express.Router()

// PUBLIC: Customer inquiry form submission from website
router.post('/', createEnquiry)

// PROTECTED: Admin enquiry management
router.get('/', protectAdmin, authorizePermissions('manage_enquiries'), getEnquiries)
router.put('/:id', protectAdmin, authorizePermissions('manage_enquiries'), updateEnquiryStatus)
router.delete('/:id', protectAdmin, authorizePermissions('manage_enquiries'), deleteEnquiry)
router.post('/test-smtp', protectAdmin, authorizePermissions('manage_settings'), testSmtpConnection)

export default router

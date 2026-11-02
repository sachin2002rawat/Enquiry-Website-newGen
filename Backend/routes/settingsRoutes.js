import express from 'express'
import {
  getSettings,
  updateSettings,
  getHomepageSettings,
  updateHomepageSettings,
  getFooterSettings,
  updateFooterSettings,
  getCompanySettings,
  updateCompanySettings,
  getWhatsappSettings,
  updateWhatsappSettings,
  getSmtpSettings,
  updateSmtpSettings,
  getCloudinarySettings,
  updateCloudinarySettings,
  testCloudinarySettings
} from '../controllers/settingsController.js'
import { protectAdmin, authorizePermissions } from '../middleware/authMiddleware.js'

const router = express.Router()

router.route('/')
  .get(getSettings)
  .put(protectAdmin, authorizePermissions('manage_settings'), updateSettings)

router.route('/homepage')
  .get(getHomepageSettings)
  .put(protectAdmin, authorizePermissions('manage_homepage', 'manage_settings'), updateHomepageSettings)

router.route('/footer')
  .get(getFooterSettings)
  .put(protectAdmin, authorizePermissions('manage_footer', 'manage_settings'), updateFooterSettings)

router.route('/company')
  .get(getCompanySettings)
  .put(protectAdmin, authorizePermissions('manage_company', 'manage_settings'), updateCompanySettings)

router.route('/whatsapp')
  .get(getWhatsappSettings)
  .put(protectAdmin, authorizePermissions('manage_settings'), updateWhatsappSettings)

router.route('/smtp')
  .get(getSmtpSettings)
  .put(protectAdmin, authorizePermissions('manage_settings'), updateSmtpSettings)

router.route('/cloudinary')
  .get(getCloudinarySettings)
  .put(protectAdmin, authorizePermissions('manage_settings'), updateCloudinarySettings)

router.post('/test-cloudinary', protectAdmin, authorizePermissions('manage_settings'), testCloudinarySettings)

export default router

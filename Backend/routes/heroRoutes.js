import express from 'express'
import { getHeroSlides, updateHeroSlides } from '../controllers/heroController.js'
import { protectAdmin, authorizePermissions } from '../middleware/authMiddleware.js'

const router = express.Router()

router.route('/')
  .get(getHeroSlides)
  .put(protectAdmin, authorizePermissions('manage_homepage', 'manage_settings'), updateHeroSlides)

export default router

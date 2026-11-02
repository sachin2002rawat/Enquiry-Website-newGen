import express from 'express'
import {
  getCategories,
  getCategoryByIdOrSlug,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js'
import { protectAdmin, authorizePermissions } from '../middleware/authMiddleware.js'

const router = express.Router()

router.route('/')
  .get(getCategories)
  .post(protectAdmin, authorizePermissions('manage_categories'), createCategory)

router.route('/:id')
  .get(getCategoryByIdOrSlug)
  .put(protectAdmin, authorizePermissions('manage_categories'), updateCategory)
  .delete(protectAdmin, authorizePermissions('manage_categories'), deleteCategory)

export default router

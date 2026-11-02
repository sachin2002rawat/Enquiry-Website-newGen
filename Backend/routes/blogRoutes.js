import express from 'express'
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogSettings,
  updateBlogSettings
} from '../controllers/blogController.js'
import { protectAdmin, authorizePermissions } from '../middleware/authMiddleware.js'

const router = express.Router()

// Settings endpoints (must be before :id to prevent matching 'settings' as an id)
router.route('/settings')
  .get(getBlogSettings)
  .put(protectAdmin, authorizePermissions('manage_blogs'), updateBlogSettings)

// Blog CRUD endpoints
router.route('/')
  .get(getBlogs)
  .post(protectAdmin, authorizePermissions('manage_blogs'), createBlog)

router.route('/:id')
  .get(getBlogById)
  .put(protectAdmin, authorizePermissions('manage_blogs'), updateBlog)
  .delete(protectAdmin, authorizePermissions('manage_blogs'), deleteBlog)

export default router

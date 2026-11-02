import express from 'express'
import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  generateSeoMetadata,
  getProductSitemap
} from '../controllers/productController.js'
import { protectAdmin, authorizePermissions } from '../middleware/authMiddleware.js'

const router = express.Router()

// ===============================================================================
// SEARCH ENGINE OPTIMIZATION (SEO) ROUTES
// ===============================================================================
// 1. Auto-generate SEO Page Title, Meta Description & Keywords (Protected Admin Tool)
router.post('/seo/generate', protectAdmin, authorizePermissions('manage_products'), generateSeoMetadata)

// 2. SEO Sitemap index for search engine crawlers & Google Search Console (Public)
router.get('/seo/sitemap', getProductSitemap)

// 3. Search product by SEO-friendly URL Slug (Public)
router.get('/slug/:slug', getProductBySlug)

// =============================================================================
// CORE PRODUCT CRUD ROUTES
// =============================================================================
// Get all products (Public storefront) / Create product (Protected Admin)
router.route('/')
  .get(getProducts)
  .post(protectAdmin, authorizePermissions('manage_products'), createProduct)

router.route('/:id')
  .get(getProductById)
  .put(protectAdmin, authorizePermissions('manage_products'), updateProduct)
  .delete(protectAdmin, authorizePermissions('manage_products'), deleteProduct)

export default router

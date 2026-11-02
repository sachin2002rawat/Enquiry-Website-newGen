import mongoose from 'mongoose'
import path from 'path'
import fs from 'fs'
import Product from '../models/Product.js'
import AllProduct from '../models/AllProduct.js'
import Category from '../models/Category.js'

// Helper to save base64 data URLs to local uploads directory to prevent 16MB MongoDB BSON limit errors
const saveBase64Image = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return dataUrl
  }
  try {
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/)
    if (!matches || matches.length !== 3) return dataUrl
    const rawExt = matches[1].toLowerCase()
    const ext = rawExt.includes('png') ? 'png' : rawExt.includes('webp') ? 'webp' : 'jpg'
    const buffer = Buffer.from(matches[2], 'base64')
    const filename = `prod_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}.${ext}`
    const uploadsDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    fs.writeFileSync(path.join(uploadsDir, filename), buffer)
    const serverBase = process.env.BASE_URL || 'http://localhost:5000'
    return `${serverBase}/uploads/${filename}`
  } catch (err) {
    console.warn('Failed to save base64 image to disk:', err.message)
    return dataUrl
  }
}

// Helper function to create URL-friendly slug
const slugify = (text) => {
  if (!text) return ''
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query
    let query = {}

    if (category && category !== 'ALL' && category !== 'all_products') {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category
      } else {
        const catDoc = await Category.findOne({
          $or: [
            { name: new RegExp(`^${category}$`, 'i') },
            { slug: category.toLowerCase() }
          ]
        })
        if (catDoc) {
          query.category = catDoc._id
        } else {
          // If query was a string that doesn't match any category
          query.category = null
        }
      }
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { sku: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { metaKeywords: new RegExp(search, 'i') },
        { seoTitle: new RegExp(search, 'i') }
      ]
    }

    const products = await Product.find(query)
      .populate('category', 'name slug image description')
      .sort({ createdAt: -1 })
      .lean()

    res.status(200).json({ success: true, count: products.length, data: products })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get single product by MongoDB ID or URL Slug
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params
    let product = null

    // Check if ID matches standard 24-hex character MongoDB ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id).populate('category', 'name slug image description')
    }

    // If not found by ObjectId, lookup by URL slug
    if (!product) {
      product = await Product.findOne({ slug: id.toLowerCase().trim() }).populate('category', 'name slug image description')
    }

    // Fallback: match by product name normalized
    if (!product) {
      const normalizedName = id.replace(/-/g, ' ')
      product = await Product.findOne({
        name: new RegExp(`^${normalizedName}$`, 'i')
      }).populate('category', 'name slug image description')
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    res.status(200).json({ success: true, data: product })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get product by exact URL slug
// @route   GET /api/products/slug/:slug
// @access  Public
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params
    const cleanSlug = slug.toLowerCase().trim()

    const product = await Product.findOne({ slug: cleanSlug }).populate('category', 'name slug image description')
    if (!product) {
      return res.status(404).json({ success: false, message: `Product with slug "${slug}" not found` })
    }

    res.status(200).json({ success: true, data: product })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Create new product with complete SEO metadata and Category ObjectId reference
// @route   POST /api/products
// @access  Public / Admin
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      sku,
      weight,
      netWeight,
      minOrderQty,
      availability,
      image,
      images,
      description,
      fullDescription,
      rating,
      reviewsCount,
      // Search Engine Optimization (SEO) parameters
      slug: customSlug,
      seoTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      ogImage,
      noIndex
    } = req.body

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Product name is required' })
    }

    // Validate and resolve Category reference from MongoDB
    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required for product' })
    }

    let categoryDoc = null
    if (mongoose.Types.ObjectId.isValid(category)) {
      categoryDoc = await Category.findById(category)
    }
    if (!categoryDoc && typeof category === 'string') {
      const cleanCat = category.replace(/^cat_/, '').replace(/_/g, ' ').trim()
      categoryDoc = await Category.findOne({
        $or: [
          { name: new RegExp(`^${category.trim()}$`, 'i') },
          { slug: category.trim().toLowerCase() },
          { name: new RegExp(`^${cleanCat}$`, 'i') },
          { slug: slugify(cleanCat) }
        ]
      })
    }

    if (!categoryDoc) {
      const categoryName = (typeof category === 'string' && category.trim())
        ? category.replace(/^cat_/, '').replace(/_/g, ' ').trim()
        : 'General'
      try {
        categoryDoc = await Category.create({
          name: categoryName.toUpperCase(),
          slug: slugify(categoryName)
        })
      } catch (catErr) {
        categoryDoc = await Category.findOne()
      }
    }

    // 1. Generate clean URL slug (use custom slug or slugify product name)
    let candidateSlug = customSlug && customSlug.trim() ? slugify(customSlug) : slugify(name)

    // Ensure slug uniqueness: if exists, append random suffix or timestamp
    const existingProductWithSlug = await Product.findOne({ slug: candidateSlug })
    if (existingProductWithSlug) {
      candidateSlug = `${candidateSlug}-${Math.floor(100 + Math.random() * 900)}`
    }

    // 2. Auto-generate recommended SEO Title if not provided (Target: 40-60 characters)
    let finalSeoTitle = seoTitle ? seoTitle.trim() : ''
    if (!finalSeoTitle) {
      const weightSuffix = weight ? ` (${weight})` : ''
      finalSeoTitle = `${name.trim()}${weightSuffix} - Buy Online | Quick Enquiry`
      if (finalSeoTitle.length > 60) {
        finalSeoTitle = `${name.trim()} | Quick Enquiry`
      }
    }

    // 3. Auto-generate recommended Meta Description if not provided (Target: 120-160 characters)
    let finalMetaDesc = metaDescription ? metaDescription.trim() : ''
    if (!finalMetaDesc) {
      if (description && description.length >= 40) {
        finalMetaDesc = description.length > 155
          ? `${description.substring(0, 152)}...`
          : description
      } else {
        finalMetaDesc = `Order pure, premium ${name} in sealed ${weight || '100g'} packs. Freshly milled, 100% natural quality available for wholesale and bulk enquiry.`
      }
    }

    // 4. Auto-generate Meta Keywords if not provided
    let finalMetaKeywords = metaKeywords ? metaKeywords.trim() : ''
    if (!finalMetaKeywords) {
      finalMetaKeywords = [
        categoryDoc.name,
        name,
        weight || '100g',
        'wholesale',
        'enquiry',
        'authentic'
      ]
        .filter(Boolean)
        .join(', ')
        .toLowerCase()
    }

    // 5. Construct images array & save any raw base64 data to disk
    let imageList = []
    if (Array.isArray(images) && images.length > 0) {
      imageList = images.filter(img => typeof img === 'string' && img.trim()).map(saveBase64Image)
    }
    if (imageList.length === 0 && image && image.trim()) {
      imageList = [saveBase64Image(image.trim())]
    }

    // Parse fullDescription into array of paragraphs if provided as string
    let parsedFullDescription = []
    if (Array.isArray(fullDescription)) {
      parsedFullDescription = fullDescription.map(s => String(s).trim()).filter(Boolean)
    } else if (typeof fullDescription === 'string' && fullDescription.trim()) {
      parsedFullDescription = fullDescription.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean)
    }

    // 6. Create product in database with Category ObjectId reference
    const product = await Product.create({
      name: name.trim(),
      category: categoryDoc._id,
      sku: sku ? sku.trim() : `SKU-${Date.now().toString().slice(-6)}`,
      weight: weight || '100g',
      netWeight: netWeight || '100g / Pack',
      minOrderQty: minOrderQty || '50 Units',
      availability: availability || 'In Stock',
      image: imageList[0],
      images: imageList,
      description: description || '',
      fullDescription: parsedFullDescription,
      rating: rating ? Number(rating) : 4.8,
      reviewsCount: reviewsCount ? Number(reviewsCount) : 15,
      // SEO Metadata
      slug: candidateSlug,
      seoTitle: finalSeoTitle,
      metaDescription: finalMetaDesc,
      metaKeywords: finalMetaKeywords,
      canonicalUrl: canonicalUrl || '',
      ogImage: saveBase64Image(ogImage) || imageList[0] || '',
      noIndex: Boolean(noIndex)
    })

    // Populate category reference before returning
    await product.populate('category', 'name slug image description')

    // Sync to allproducts collection
    try {
      await AllProduct.create({ ...product.toObject() })
    } catch {}

    res.status(201).json({
      success: true,
      message: 'Product created successfully in MongoDB catalogue',
      data: product
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Update product and its category / SEO configuration
// @route   PUT /api/products/:id
// @access  Public / Admin
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    // Validate and resolve Category reference if category is being updated
    if (updateData.category) {
      let categoryDoc = null
      if (mongoose.Types.ObjectId.isValid(updateData.category)) {
        categoryDoc = await Category.findById(updateData.category)
      }
      if (!categoryDoc && typeof updateData.category === 'string') {
        const cleanCat = updateData.category.replace(/^cat_/, '').replace(/_/g, ' ').trim()
        categoryDoc = await Category.findOne({
          $or: [
            { name: new RegExp(`^${updateData.category.trim()}$`, 'i') },
            { slug: updateData.category.trim().toLowerCase() },
            { name: new RegExp(`^${cleanCat}$`, 'i') },
            { slug: slugify(cleanCat) }
          ]
        })
      }

      if (!categoryDoc) {
        const categoryName = (typeof updateData.category === 'string' && updateData.category.trim())
          ? updateData.category.replace(/^cat_/, '').replace(/_/g, ' ').trim()
          : 'General'
        try {
          categoryDoc = await Category.create({
            name: categoryName.toUpperCase(),
            slug: slugify(categoryName)
          })
        } catch (catErr) {
          categoryDoc = await Category.findOne()
        }
      }

      updateData.category = categoryDoc._id
    }

    // If slug is being updated, clean and slugify it
    if (updateData.slug) {
      updateData.slug = slugify(updateData.slug)

      // Ensure no conflicting slug exists on another product
      const existingProduct = await Product.findOne({
        slug: updateData.slug,
        _id: { $ne: id }
      })
      if (existingProduct) {
        updateData.slug = `${updateData.slug}-${Math.floor(100 + Math.random() * 900)}`
      }
    } else if (updateData.name && !updateData.slug) {
      // Auto-refresh slug if name changes and no explicit slug provided
      updateData.slug = slugify(updateData.name)
    }

    // Parse fullDescription into array of paragraphs if provided
    if (updateData.fullDescription !== undefined) {
      if (Array.isArray(updateData.fullDescription)) {
        updateData.fullDescription = updateData.fullDescription
          .map(s => String(s).trim())
          .filter(Boolean)
      } else if (typeof updateData.fullDescription === 'string') {
        updateData.fullDescription = updateData.fullDescription
          .split(/\n\s*\n/)
          .map(s => s.trim())
          .filter(Boolean)
      }
    }

    // Sync and sanitize images array if provided & convert base64 to static files
    if (updateData.image) {
      updateData.image = saveBase64Image(updateData.image)
    }
    if (updateData.ogImage) {
      updateData.ogImage = saveBase64Image(updateData.ogImage)
    }
    if (Array.isArray(updateData.images)) {
      updateData.images = updateData.images
        .filter(img => typeof img === 'string' && img.trim())
        .map(saveBase64Image)
      if (updateData.images.length > 0 && !updateData.image) {
        updateData.image = updateData.images[0]
      }
    } else if (updateData.image && !updateData.images) {
      updateData.images = [updateData.image]
    }

    let updatedProduct = null

    // 1. Try finding by MongoDB ObjectId if id matches 24-hex format
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      updatedProduct = await Product.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('category', 'name slug image description')
    }

    // 2. Fallback: Lookup by slug, sku, or name
    if (!updatedProduct) {
      updatedProduct = await Product.findOneAndUpdate(
        {
          $or: [
            { slug: id.toLowerCase().trim() },
            { sku: id },
            { name: new RegExp(`^${id.replace(/-/g, ' ')}$`, 'i') }
          ]
        },
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('category', 'name slug image description')
    }

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    // Sync to allproducts collection
    try {
      await AllProduct.findByIdAndUpdate(updatedProduct._id, updateData)
    } catch {}

    res.status(200).json({
      success: true,
      message: 'Product and category updated successfully in MongoDB catalogue',
      data: updatedProduct
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Public / Admin
export const deleteProduct = async (req, res) => {
  try {
    const rawId = req.params.id ? decodeURIComponent(req.params.id).trim() : ''
    if (!rawId) {
      return res.status(400).json({ success: false, message: 'Product identifier is required' })
    }

    const escapeRegex = (str) => (str ? str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '')
    const escaped = escapeRegex(rawId)
    const escapedSpaces = escapeRegex(rawId.replace(/[-_]/g, ' '))

    const conditions = [
      { slug: rawId.toLowerCase() },
      { sku: rawId },
      { name: new RegExp(`^${escaped}$`, 'i') },
      { name: new RegExp(`^${escapedSpaces}$`, 'i') }
    ]

    let deletedProduct = null
    let deleteCondition = null

    if (rawId.match(/^[0-9a-fA-F]{24}$/)) {
      deleteCondition = { _id: rawId }
    } else {
      deleteCondition = {
        $or: [
          { slug: rawId.toLowerCase() },
          { sku: rawId },
          { name: new RegExp(`^${escaped}$`, 'i') },
          { name: new RegExp(`^${escapedSpaces}$`, 'i') }
        ]
      }
    }

    deletedProduct = await Product.findOneAndDelete(deleteCondition)

    // Sync to allproducts collection
    try {
      await AllProduct.deleteMany(deleteCondition)
    } catch {}

    res.status(200).json({
      success: true,
      message: 'Product permanently removed from database',
      deletedId: rawId,
      data: deletedProduct
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Auto-generate Google search optimized SEO metadata
// @route   POST /api/products/seo/generate
// @access  Public / Admin
export const generateSeoMetadata = async (req, res) => {
  try {
    const { name, category, description, weight } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required to generate SEO metadata'
      })
    }

    const cleanSlug = slugify(name)
    const weightSuffix = weight ? ` (${weight})` : ''
    
    // Page Title: Ideal between 40 - 60 chars
    let seoTitle = `${name}${weightSuffix} - Pure Quality | Quick Enquiry`
    if (seoTitle.length > 60) {
      seoTitle = `${name} | Quick Enquiry`
    }

    // Meta Description: Ideal between 120 - 160 chars
    let metaDescription = ''
    if (description && description.length >= 50) {
      metaDescription = description.length > 155
        ? `${description.substring(0, 152)}...`
        : description
    } else {
      metaDescription = `Order pure, premium ${name} in sealed ${weight || '100g'} packs. Freshly milled, 100% natural spices available for wholesale and bulk enquiry.`
    }

    // Meta Keywords: Comma-separated list
    const metaKeywords = [
      category || 'pure spices',
      name,
      weight || '100g',
      'wholesale',
      'bulk enquiry',
      'authentic quality'
    ]
      .filter(Boolean)
      .join(', ')
      .toLowerCase()

    res.status(200).json({
      success: true,
      data: {
        slug: cleanSlug,
        seoTitle,
        metaDescription,
        metaKeywords,
        characterCounts: {
          seoTitle: seoTitle.length,
          metaDescription: metaDescription.length
        },
        serpPreview: {
          breadcrumb: `https://quick-enquiry.co › products › ${cleanSlug}`,
          title: seoTitle,
          snippet: metaDescription
        }
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get SEO Sitemap dataset for search crawlers / Google indexing
// @route   GET /api/products/seo/sitemap
// @access  Public
export const getProductSitemap = async (req, res) => {
  try {
    const products = await Product.find({ noIndex: { $ne: true } })
      .select('name slug seoTitle metaDescription updatedAt createdAt')
      .sort({ updatedAt: -1 })

    const baseUrl = process.env.CLIENT_URL || 'https://quick-enquiry.co'
    
    const sitemapEntries = products.map((p) => ({
      url: `${baseUrl}/product/${p.slug || p._id}`,
      name: p.name,
      seoTitle: p.seoTitle || p.name,
      metaDescription: p.metaDescription || '',
      lastModified: p.updatedAt || p.createdAt
    }))

    res.status(200).json({
      success: true,
      count: sitemapEntries.length,
      data: sitemapEntries
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

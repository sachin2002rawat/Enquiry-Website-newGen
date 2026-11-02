import Category from '../models/Category.js'
import Product from '../models/Product.js'

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

// Default fallback categories with images matching the catalog
const DEFAULT_CATEGORIES = [
  {
    name: 'PULSES',
    description: 'Premium selection of pulses products crafted for authentic taste and quality.',
    image: 'https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'RICE',
    description: 'Premium selection of rice products crafted for authentic taste and quality.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'WHOLE SPICES',
    description: 'Premium selection of whole spices products crafted for authentic taste and quality.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'MIX MASALA',
    description: 'Premium selection of mix masala products crafted for authentic taste and quality.',
    image: '/garam_masala.png'
  },
  {
    name: 'SOYA CHUNKS',
    description: 'Premium selection of soya chunks products crafted for authentic taste and quality.',
    image: '/masala_tofu.png'
  },
  {
    name: 'PURE SPICES',
    description: '100% natural stone-ground spices preserved for authentic aroma.',
    image: '/premium_spices.png'
  },
  {
    name: 'EDIBLE OILS',
    description: 'Cold-pressed and refined healthy cooking oils.',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'
  }
]

// @desc    Get all categories (with real-time product count from MongoDB)
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    let categories = await Category.find().sort({ order: 1, createdAt: -1 })

    // Auto-seed default categories if empty in MongoDB
    if (categories.length === 0) {
      const categoriesToInsert = DEFAULT_CATEGORIES.map((defCat) => ({
        name: defCat.name.toUpperCase().trim(),
        slug: slugify(defCat.name),
        description: defCat.description,
        image: defCat.image
      }))

      try {
        await Category.insertMany(categoriesToInsert, { ordered: false })
      } catch {
        // ignore duplicate key errors
      }
      categories = await Category.find().sort({ order: 1, createdAt: -1 })
    }

    // Enrich with dynamic product counts from Product collection using Category ObjectId reference
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const catObj = cat.toObject()
        const count = await Product.countDocuments({ category: cat._id })
        catObj.productCount = count
        return catObj
      })
    )

    res.status(200).json({
      success: true,
      count: categoriesWithCounts.length,
      data: categoriesWithCounts
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get single category by Slug or ID with products
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryByIdOrSlug = async (req, res) => {
  try {
    const { id } = req.params
    let category = null

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(id)
    }

    if (!category) {
      const slugVal = id.toLowerCase().trim()
      category = await Category.findOne({
        $or: [{ slug: slugVal }, { name: id.toUpperCase().trim() }]
      })
    }

    if (!category) {
      return res.status(404).json({ success: false, message: `Category not found: ${id}` })
    }

    // Fetch products belonging to this category by ObjectId reference
    const products = await Product.find({ category: category._id })
      .populate('category', 'name slug image description')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        productCount: products.length,
        products
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Create a new category in MongoDB
// @route   POST /api/categories
// @access  Public/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, slug: customSlug, description, image, order, initialProduct } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' })
    }

    const cleanName = name.trim().toUpperCase()
    const slug = customSlug && customSlug.trim() ? slugify(customSlug) : slugify(cleanName)

    // If category with same name exists, update its image and description seamlessly
    let existing = await Category.findOne({ name: cleanName })
    if (existing) {
      if (image) existing.image = image.trim()
      if (description) existing.description = description.trim()
      await existing.save()
      const catData = existing.toObject()
      catData.productCount = await Product.countDocuments({ category: existing._id })
      return res.status(200).json({
        success: true,
        message: `Category "${cleanName}" updated with new image successfully!`,
        data: catData
      })
    }

    // Ensure unique slug if slug already exists
    let candidateSlug = slug
    const existingSlug = await Category.findOne({ slug: candidateSlug })
    if (existingSlug) {
      candidateSlug = `${slug}-${Math.floor(100 + Math.random() * 900)}`
    }

    const newCategory = await Category.create({
      name: cleanName,
      slug: candidateSlug,
      description: description?.trim() || `Premium selection of ${cleanName.toLowerCase()} products crafted for authentic taste and quality.`,
      image: image?.trim() || '/garam_masala.png',
      order: Number(order) || 0
    })

    const catData = newCategory.toObject()
    catData.productCount = 0

    res.status(201).json({
      success: true,
      message: `Category "${cleanName}" created successfully in MongoDB!`,
      data: catData
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Update category by ID
// @route   PUT /api/categories/:id
// @access  Public/Admin
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { name, slug: customSlug, description, image, order, isActive } = req.body

    let category = null
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(id)
    } else {
      category = await Category.findOne({
        $or: [{ slug: id.toLowerCase() }, { name: id.toUpperCase() }]
      })
    }

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    const oldName = category.name

    if (name && name.trim()) {
      const cleanName = name.trim().toUpperCase()
      if (cleanName !== oldName) {
        // Ensure no conflicting name exists
        const nameConflict = await Category.findOne({ name: cleanName, _id: { $ne: category._id } })
        if (nameConflict) {
          return res.status(400).json({ success: false, message: `Category "${cleanName}" already exists!` })
        }
        category.name = cleanName
        category.slug = slugify(cleanName)
      }
    }

    if (customSlug && customSlug.trim()) {
      const cleanSlug = slugify(customSlug)
      const slugConflict = await Category.findOne({ slug: cleanSlug, _id: { $ne: category._id } })
      if (!slugConflict) {
        category.slug = cleanSlug
      }
    }

    if (description !== undefined) category.description = description
    if (image !== undefined) category.image = image
    if (order !== undefined) category.order = Number(order)
    if (isActive !== undefined) category.isActive = Boolean(isActive)

    await category.save()

    const productCount = await Product.countDocuments({ category: category._id })

    const catObj = category.toObject()
    catObj.productCount = productCount

    res.status(200).json({
      success: true,
      message: 'Category updated successfully in MongoDB!',
      data: catObj
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Delete category by ID (safely reassign products to avoid accidental data loss)
// @desc    Delete category by ID, name, or slug permanently from MongoDB
// @route   DELETE /api/categories/:id
// @access  Public/Admin
export const deleteCategory = async (req, res) => {
  try {
    const rawId = req.params.id ? decodeURIComponent(req.params.id).trim() : ''
    if (!rawId) {
      return res.status(400).json({ success: false, message: 'Category identifier required' })
    }

    const cleanSlug = slugify(rawId)
    const lowerId = rawId.toLowerCase()

    const query = [
      { name: new RegExp(`^${rawId}$`, 'i') },
      { slug: lowerId },
      { slug: cleanSlug }
    ]

    if (rawId.match(/^[0-9a-fA-F]{24}$/)) {
      query.push({ _id: rawId })
    }

    // Find all categories matching any of the identifiers
    const categoriesToDelete = await Category.find({ $or: query })

    if (categoriesToDelete.length > 0) {
      const idsToDelete = categoriesToDelete.map((c) => c._id)

      // Fallback category to safely reassign products
      const fallbackCategory = await Category.findOne({
        _id: { $nin: idsToDelete }
      })

      if (fallbackCategory) {
        await Product.updateMany(
          { category: { $in: idsToDelete } },
          { $set: { category: fallbackCategory._id } }
        )
      } else {
        await Product.deleteMany({ category: { $in: idsToDelete } })
      }

      await Category.deleteMany({ _id: { $in: idsToDelete } })
    } else if (rawId.match(/^[0-9a-fA-F]{24}$/)) {
      await Category.findByIdAndDelete(rawId)
      await Product.deleteMany({ category: rawId })
    }

    res.status(200).json({
      success: true,
      message: `Category "${rawId}" permanently deleted from MongoDB database.`
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

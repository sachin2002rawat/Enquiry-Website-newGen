import mongoose from 'mongoose'
import Category from '../models/Category.js'
import Product from '../models/Product.js'
import AllProduct from '../models/AllProduct.js'

// Slugify helper
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

// Default standard categories
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

/**
 * Migrate database:
 * 1. Ensure all default & existing categories exist in Category collection.
 * 2. Convert all Product category strings to proper Category ObjectId references.
 * 3. Keep referential integrity persistent.
 */
export const migrateCategoriesAndProducts = async () => {
  try {
    const existingCount = await Category.countDocuments()
    if (existingCount >= DEFAULT_CATEGORIES.length) {
      console.log('✅ [Migration] Category and Product data already verified. Ready.')
      return
    }

    console.log('🔄 [Migration] Checking Category and Product data integrity...')

    // 1. Ensure standard categories exist
    for (const defCat of DEFAULT_CATEGORIES) {
      const cleanName = defCat.name.toUpperCase().trim()
      const existing = await Category.findOne({ name: cleanName })
      if (!existing) {
        await Category.create({
          name: cleanName,
          slug: slugify(cleanName),
          description: defCat.description,
          image: defCat.image,
          order: 0,
          isActive: true
        })
        console.log(`➕ [Migration] Created category: ${cleanName}`)
      }
    }

    // Load all current categories
    let allCategories = await Category.find()
    const categoryMap = new Map()
    allCategories.forEach((c) => {
      categoryMap.set(c.name.toUpperCase().trim(), c._id)
      categoryMap.set(c.slug.toLowerCase().trim(), c._id)
      categoryMap.set(String(c._id), c._id)
    })

    // Default fallback category (PURE SPICES)
    const fallbackCategoryId = categoryMap.get('PURE SPICES') || allCategories[0]._id

    // 2. Inspect raw products in Product collection
    // Use native collection or model to find products whose category is not a valid ObjectId reference
    const rawProducts = await mongoose.connection.db.collection('products').find({}).toArray()
    let updatedCount = 0

    for (const prod of rawProducts) {
      let targetCategoryId = null

      if (prod.category) {
        const catStr = String(prod.category).trim()
        // Check if already an ObjectId matching an existing category
        if (mongoose.Types.ObjectId.isValid(catStr) && categoryMap.has(catStr)) {
          continue
        }
        // It's a string name (e.g. "RICE", "PULSES")
        const upperName = catStr.toUpperCase()
        if (categoryMap.has(upperName)) {
          targetCategoryId = categoryMap.get(upperName)
        } else {
          targetCategoryId = fallbackCategoryId
        }
      } else {
        targetCategoryId = fallbackCategoryId
      }

      if (targetCategoryId) {
        await mongoose.connection.db.collection('products').updateOne(
          { _id: prod._id },
          { $set: { category: targetCategoryId } }
        )
        updatedCount++
      }
    }

    // Also update allproducts collection if exists
    try {
      const allProdCount = await mongoose.connection.db.collection('allproducts').countDocuments()
      if (allProdCount > 0) {
        const rawAllProds = await mongoose.connection.db.collection('allproducts').find({}).toArray()
        for (const ap of rawAllProds) {
          const catStr = String(ap.category || '').trim().toUpperCase()
          const matchedId = categoryMap.get(catStr) || fallbackCategoryId
          if (String(ap.category) === String(matchedId)) {
            continue
          }
          await mongoose.connection.db.collection('allproducts').updateOne(
            { _id: ap._id },
            { $set: { category: matchedId } }
          )
        }
      }
    } catch {
      // ignore
    }

    console.log(`✅ [Migration] Completed! Verified & linked ${updatedCount} products to Category ObjectId references.`)
  } catch (err) {
    console.error('❌ [Migration Error]:', err.message)
  }
}

export default migrateCategoriesAndProducts

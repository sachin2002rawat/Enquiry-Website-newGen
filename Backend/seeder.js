import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Category from './models/Category.js'
import Product from './models/Product.js'
import CompanySettings from './models/CompanySettings.js'
import HeroSlide from './models/HeroSlide.js'
import connectDB from './config/db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

// Safely load JSON files
const productsJsonPath = path.join(__dirname, '../Frontend/src/ProductsData.json')
const heroSlidesJsonPath = path.join(__dirname, '../Frontend/src/HeroImage.json')

const defaultProducts = JSON.parse(fs.readFileSync(productsJsonPath, 'utf-8'))
const defaultHeroSlides = JSON.parse(fs.readFileSync(heroSlidesJsonPath, 'utf-8'))

const DEFAULT_CATEGORIES = [
  { name: 'PULSES', description: 'Premium selection of pulses products crafted for authentic taste and quality.', image: 'https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=800&q=80' },
  { name: 'RICE', description: 'Premium selection of rice products crafted for authentic taste and quality.', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80' },
  { name: 'WHOLE SPICES', description: 'Premium selection of whole spices products crafted for authentic taste and quality.', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80' },
  { name: 'MIX MASALA', description: 'Premium selection of mix masala products crafted for authentic taste and quality.', image: '/garam_masala.png' },
  { name: 'SOYA CHUNKS', description: 'Premium selection of soya chunks products crafted for authentic taste and quality.', image: '/masala_tofu.png' },
  { name: 'PURE SPICES', description: '100% natural stone-ground spices preserved for authentic aroma.', image: '/premium_spices.png' },
  { name: 'EDIBLE OILS', description: 'Cold-pressed and refined healthy cooking oils.', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80' }
]

const importData = async () => {
  try {
    await connectDB()

    // Clear existing collections
    await Product.deleteMany({})
    await Category.deleteMany({})
    await CompanySettings.deleteMany({})
    await HeroSlide.deleteMany({})

    console.log('🧹 Existing collections cleared...')

    // Seed Categories
    const categoryDocs = await Category.insertMany(DEFAULT_CATEGORIES)
    const categoryMap = new Map()
    categoryDocs.forEach(c => categoryMap.set(c.name.toUpperCase().trim(), c._id))
    const fallbackId = categoryMap.get('PURE SPICES') || categoryDocs[0]._id
    console.log(`✅ Seeded ${categoryDocs.length} Categories into MongoDB`)

    // Seed Products with Category ObjectId reference
    const formattedProducts = defaultProducts.map((p, index) => {
      const catKey = (p.category || 'PURE SPICES').toUpperCase().trim()
      const categoryId = categoryMap.get(catKey) || fallbackId
      return {
        name: p.name,
        category: categoryId,
        sku: p.sku || `SKU-${p.id || index + 1}`,
        weight: p.weight || '100g',
        netWeight: p.netWeight || '100g / Pack',
        minOrderQty: p.minOrderQty || '50 Units',
        availability: p.availability || 'In Stock',
        image: p.image || '',
        description: p.description || '',
        rating: p.rating || 4.8,
        reviewsCount: p.reviewsCount || 15,
        slug: p.slug || (p.name ? p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : `product-${p.id || index + 1}`)
      }
    })

    await Product.insertMany(formattedProducts)
    console.log(`✅ Seeded ${formattedProducts.length} Products into MongoDB with Category references`)

    // Seed Hero Slides
    const formattedSlides = defaultHeroSlides.map((s) => ({
      image: s.url || s.image || '',
      url: s.url || s.image || '',
      title: s.title,
      subtitleBadge: s.subtitleBadge || 'PREMIUM QUALITY',
      description: s.subtitle || s.description || '',
      ctaText: s.ctaText || 'Explore Catalogue',
      ctaLink: s.ctaLink || '/product'
    }))
    await HeroSlide.insertMany(formattedSlides)
    console.log(`✅ Seeded ${formattedSlides.length} Hero Banner Slides into MongoDB`)

    // Seed Default Company Settings
    await CompanySettings.create({
      companyName: 'QuickEnquiry',
      tagline: '100% Organic & Stone Ground Spices',
      whatsappNumber: '+91 9876543210',
      contactEmail: 'info@enquirybrand.com',
      officeAddress: 'Sector 62, Business Park, Noida, UP - 201309'
    })
    console.log('✅ Seeded Default Company Settings into MongoDB')

    console.log('🌱 [Seeder] Database Seeder Completed Successfully!')
    process.exit(0)
  } catch (error) {
    console.error(`❌ [Seeder Error]: ${error.message}`)
    process.exit(1)
  }
}

importData()

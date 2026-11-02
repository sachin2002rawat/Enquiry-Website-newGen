import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from '../models/Product.js'
import AllProduct from '../models/AllProduct.js'

dotenv.config()
const uri = process.env.MONGO_URI || process.env.MONGODB_URI
await mongoose.connect(uri)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const productsPath = path.join(__dirname, '../../Frontend/src/ProductsData.json')
const productsJson = JSON.parse(fs.readFileSync(productsPath, 'utf8'))

console.log(`Seeding ${productsJson.length} products to 'products' and 'allproducts' collections...`)

for (const p of productsJson) {
  const productData = {
    name: p.name,
    category: p.category || 'PURE SPICES',
    sku: p.sku || 'SKU-' + (p.id || Math.floor(Math.random() * 10000)),
    weight: p.weight || '100g',
    netWeight: p.netWeight || '100g / Pack',
    minOrderQty: p.minOrderQty || '50 Units',
    availability: p.availability || 'In Stock',
    image: p.image || '',
    images: p.images || [],
    description: p.description || '',
    rating: p.rating || 4.8,
    reviewsCount: p.reviewsCount || 15,
    slug: p.slug || p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  }

  // Upsert in Product ('products' collection)
  await Product.findOneAndUpdate({ name: p.name }, { $set: productData }, { upsert: true, new: true })
  // Upsert in AllProduct ('allproducts' collection)
  await AllProduct.findOneAndUpdate({ name: p.name }, { $set: productData }, { upsert: true, new: true })
}

console.log('✅ Count in products:', await Product.countDocuments())
console.log('✅ Count in allproducts:', await AllProduct.countDocuments())

const collections = await mongoose.connection.db.listCollections().toArray()
console.log('ALL DB COLLECTIONS NOW:', collections.map(c => c.name))
process.exit(0)

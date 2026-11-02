import mongoose from 'mongoose'

// Helper function to create URL-friendly slug
const slugify = (text) => {
  if (!text) return ''
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters (except spaces and hyphens)
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with a single hyphen
    .replace(/^-+|-+$/g, '') // Trim leading/trailing hyphens
}

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category reference is required']
    },
    sku: {
      type: String,
      trim: true
    },
    weight: {
      type: String,
      default: '100g',
      trim: true
    },
    netWeight: {
      type: String,
      default: '100g / Pack',
      trim: true
    },
    minOrderQty: {
      type: String,
      default: '50 Units',
      trim: true
    },
    availability: {
      type: String,
      default: 'In Stock',
      trim: true
    },
    image: {
      type: String,
      default: '',
      trim: true
    },
    images: {
      type: [String],
      default: []
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    fullDescription: {
      type: [String],
      default: []
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5
    },
    reviewsCount: {
      type: Number,
      default: 15,
      min: 0
    },

    // =========================================================================
    // SEARCH ENGINE OPTIMIZATION (SEO) FIELDS
    // =========================================================================
    slug: {
      type: String,
      trim: true,
      index: true
    },
    seoTitle: {
      type: String,
      default: '',
      trim: true,
      maxLength: [120, 'SEO Title should not exceed 120 characters']
    },
    metaDescription: {
      type: String,
      default: '',
      trim: true,
      maxLength: [320, 'Meta description should not exceed 320 characters']
    },
    metaKeywords: {
      type: String,
      default: '',
      trim: true
    },
    canonicalUrl: {
      type: String,
      default: '',
      trim: true
    },
    ogImage: {
      type: String,
      default: '',
      trim: true
    },
    noIndex: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

productSchema.index({ createdAt: -1 })
productSchema.index({ category: 1, createdAt: -1 })

// Pre-save hook: Automatically generate slug & fallback SEO metadata if not explicitly provided
productSchema.pre('save', function (next) {
  // 1. Slug auto-generation
  if (!this.slug || this.isModified('name')) {
    const rawSlug = this.slug && this.slug.trim() ? this.slug : this.name
    this.slug = slugify(rawSlug)
  }

  // 2. Fallback SEO Title (ideal range 40-60 characters)
  if (!this.seoTitle || this.seoTitle.trim() === '') {
    const weightSuffix = this.weight ? ` (${this.weight})` : ''
    this.seoTitle = `${this.name}${weightSuffix} - Pure Quality | Quick Enquiry`
    if (this.seoTitle.length > 60) {
      this.seoTitle = `${this.name} | Quick Enquiry`
    }
  }

  // 3. Fallback Meta Description (ideal range 120-160 characters)
  if (!this.metaDescription || this.metaDescription.trim() === '') {
    if (this.description && this.description.length >= 40) {
      this.metaDescription = this.description.length > 155
        ? `${this.description.substring(0, 152)}...`
        : this.description
    } else {
      this.metaDescription = `Order pure, premium ${this.name} in sealed ${this.weight || '100g'} packs. 100% natural, fresh authentic quality available for enquiry and bulk wholesale.`
    }
  }

  // 4. Fallback Meta Keywords
  if (!this.metaKeywords || this.metaKeywords.trim() === '') {
    const keywords = [
      this.name,
      this.weight,
      'wholesale',
      'bulk enquiry',
      'authentic spices',
      'food product'
    ]
      .filter(Boolean)
      .join(', ')
      .toLowerCase()
    this.metaKeywords = keywords
  }

  // 5. Fallback OG Social Share Image
  if (!this.ogImage || this.ogImage.trim() === '') {
    this.ogImage = this.image || ''
  }

  next()
})

const Product = mongoose.model('Product', productSchema)

export { productSchema }
export default Product

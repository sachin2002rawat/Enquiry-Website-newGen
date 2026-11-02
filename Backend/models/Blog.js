import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    slug: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    image: {
      type: String,
      default: ''
    },
    images: {
      type: [String],
      default: []
    },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    readTime: {
      type: String,
      default: '5 min read'
    },
    rating: {
      type: Number,
      default: 4.8
    },
    reviewsCount: {
      type: Number,
      default: 120
    },
    targetHomepage: {
      type: String,
      enum: ['home1', 'home2', 'all'],
      default: 'home1'
    },
    keyHighlights: {
      type: [String],
      default: [
        '100% Authentic quality sourced directly from trusted organic farms.',
        'Processed under strict ISO-certified hygienic standards with zero artificial additives.',
        'Direct farm fresh and laboratory tested for optimal purity.'
      ]
    },
    fullDescription: {
      type: [String],
      default: []
    },
    sku: {
      type: String,
      default: 'SKU-BLG-001'
    },
    netWeight: {
      type: String,
      default: '200g / Pack'
    },
    minOrderQty: {
      type: String,
      default: '50 Units'
    },
    availability: {
      type: String,
      default: 'In Stock'
    },
    author: {
      type: String,
      default: 'Editorial Team'
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema)

export default Blog

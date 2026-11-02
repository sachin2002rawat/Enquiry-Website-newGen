import mongoose from 'mongoose'

const heroSlideSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true
    },
    url: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      required: true
    },
    subtitleBadge: {
      type: String,
      default: 'PREMIUM QUALITY'
    },
    description: {
      type: String,
      default: ''
    },
    ctaText: {
      type: String,
      default: 'Explore Catalogue'
    },
    ctaLink: {
      type: String,
      default: '/product'
    }
  },
  { timestamps: true }
)

const HeroSlide = mongoose.model('HeroSlide', heroSlideSchema)

export default HeroSlide

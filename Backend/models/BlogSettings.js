import mongoose from 'mongoose'

const blogSettingsSchema = new mongoose.Schema(
  {
    heroTag: {
      type: String,
      default: 'Our Blog'
    },
    heroTitle: {
      type: String,
      default: 'The Latest Articles & Insights'
    },
    heroSubtitle: {
      type: String,
      default: 'Explore expert tips, inspiring stories, and the latest insights from our blog to help you grow, learn, and stay motivated.'
    },
    breadcrumbText: {
      type: String,
      default: 'Blog'
    },
    enquiryBannerTitle: {
      type: String,
      default: 'Interested in Bulk Orders?'
    },
    enquiryBannerSubtitle: {
      type: String,
      default: 'Send an instant enquiry for wholesale pricing & custom packaging.'
    },
    enquiryButtonText: {
      type: String,
      default: 'Send Enquiry'
    },
    whatsappButtonText: {
      type: String,
      default: 'WhatsApp'
    },
    whyChooseTitle: {
      type: String,
      default: 'Why Choose Us?'
    },
    whyChooseHighlightsMasala: {
      type: [
        {
          title: String,
          desc: String
        }
      ],
      default: [
        { title: '100% Pure & Fresh:', desc: 'Direct farm sourcing.' },
        { title: 'Fast Nationwide Shipping:', desc: 'Secure packaging.' },
        { title: 'Verified Export Standards:', desc: 'Certified processing.' }
      ]
    },
    whyChooseHighlightsBeauty: {
      type: [
        {
          title: String,
          desc: String
        }
      ],
      default: [
        { title: '100% Clean & Botanical:', desc: 'Cruelty-free organic actives.' },
        { title: 'Dermatologist Tested:', desc: 'Gentle and safe for all skin types.' },
        { title: 'Sustainable Packaging:', desc: 'Recyclable eco-friendly materials.' }
      ]
    }
  },
  {
    timestamps: true
  }
)

const BlogSettings = mongoose.models.BlogSettings || mongoose.model('BlogSettings', blogSettingsSchema)

export default BlogSettings

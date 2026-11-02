import mongoose from 'mongoose'

const footerSettingsSchema = new mongoose.Schema(
  {
    footerBgColor: { type: String, default: '#0B132B' },
    footerTextColor: { type: String, default: '#E2E8F0' },
    footerDescription: { type: String, default: 'Connecting buyers directly with verified manufacturers, suppliers, and distributors.' },
    footerCopyrightText: { type: String, default: '© 2026 QuickEnquiry. All rights reserved.' },
    footerPhone: { type: String, default: '+91 9555140701' },
    footerEmail: { type: String, default: 'info@enquirybrand.com' },
    footerAddress: { type: String, default: 'Sector 62, Business Park, Noida, UP - 201309' },
    footerSocialLinks: { type: Object, default: {} },
    footerCategoryLinks: { type: Array, default: [] },
    footerQuickLinks: { type: Array, default: [] },
    footerCertifications: { type: Array, default: [] }
  },
  {
    timestamps: true,
    collection: 'footersettings',
    strict: false
  }
)

const FooterSettings = mongoose.model('FooterSettings', footerSettingsSchema)
export default FooterSettings

import mongoose from 'mongoose'

const cloudinarySettingsSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    cloudName: { type: String, default: '' },
    apiKey: { type: String, default: '' },
    apiSecret: { type: String, default: '' },
    folder: { type: String, default: 'enquiry_products' }
  },
  {
    timestamps: true,
    collection: 'cloudinarysettings'
  }
)

const CloudinarySettings = mongoose.model('CloudinarySettings', cloudinarySettingsSchema)
export default CloudinarySettings

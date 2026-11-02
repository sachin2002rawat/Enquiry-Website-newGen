import mongoose from 'mongoose'

const whatsAppSettingsSchema = new mongoose.Schema(
  {
    whatsappNumber: { type: String, default: '+91 9555140701' },
    whatsappLinkType: { type: String, default: 'number' },
    whatsappCustomUrl: { type: String, default: '' },
    whatsappMessage: { type: String, default: 'Hello! I would like to make an enquiry.' },
    whatsappEnabled: { type: Boolean, default: true },
    whatsappTooltipText: { type: String, default: 'Chat with Us' }
  },
  {
    timestamps: true,
    collection: 'whatsappsettings'
  }
)

const WhatsAppSettings = mongoose.model('WhatsAppSettings', whatsAppSettingsSchema)
export default WhatsAppSettings

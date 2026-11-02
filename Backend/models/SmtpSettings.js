import mongoose from 'mongoose'

const smtpSettingsSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    provider: { type: String, default: 'gmail' },
    host: { type: String, default: 'smtp.gmail.com' },
    port: { type: Number, default: 587 },
    encryption: { type: String, default: 'TLS' },
    user: { type: String, default: '' },
    password: { type: String, default: '' },
    fromName: { type: String, default: 'QuickEnquiry' },
    fromEmail: { type: String, default: '' },
    replyTo: { type: String, default: '' },
    adminRecipient: { type: String, default: '' },
    notifyOnNewEnquiry: { type: Boolean, default: true },
    sendCustomerReceipt: { type: Boolean, default: true },
    lowStockAlert: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    collection: 'smtpsettings'
  }
)

const SmtpSettings = mongoose.model('SmtpSettings', smtpSettingsSchema)
export default SmtpSettings

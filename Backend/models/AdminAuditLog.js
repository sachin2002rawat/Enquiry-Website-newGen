import mongoose from 'mongoose'

const adminAuditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    adminEmail: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    target: {
      type: String,
      default: ''
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

adminAuditLogSchema.index({ createdAt: -1 })
adminAuditLogSchema.index({ adminId: 1 })

const AdminAuditLog = mongoose.model('AdminAuditLog', adminAuditLogSchema)

export default AdminAuditLog


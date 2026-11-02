import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Admin name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Admin email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
      default: 'ADMIN'
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    permissions: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    },
    passwordChangedAt: {
      type: Date
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  {
    timestamps: true
  }
)

// Pre-save hook: Sync status & isActive, hash password, and track password changes
adminSchema.pre('save', async function () {
  // Synchronize status and isActive
  if (this.isModified('status')) {
    this.isActive = this.status === 'active'
  } else if (this.isModified('isActive')) {
    this.status = this.isActive ? 'active' : 'inactive'
  }

  // Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)

    if (!this.isNew) {
      this.passwordChangedAt = new Date(Date.now() - 1000)
    }
  }
})

// Password comparison method
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Check if password was changed after a JWT token was issued
adminSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    return JWTTimestamp < changedTimestamp
  }
  return false
}

// Sanitize sensitive fields in JSON serialization
adminSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

const Admin = mongoose.model('Admin', adminSchema)

export default Admin

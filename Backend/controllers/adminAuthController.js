import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import AdminAuditLog from '../models/AdminAuditLog.js'
import envConfig from '../config/env.js'
import { recordFailedLogin, clearLoginAttempts } from '../middleware/rateLimiter.js'

/**
 * Helper to generate JWT token for an admin
 */
const generateToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      role: admin.role,
      email: admin.email
    },
    envConfig.jwtSecret,
    {
      expiresIn: envConfig.jwtExpiresIn || '7d'
    }
  )
}

/**
 * Helper to get secure cookie options
 */
const getCookieOptions = () => {
  const isProd = envConfig.isProduction
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}

// @desc    Super Admin Dedicated Login
// @route   POST /api/auth/super-admin/login
// @access  Public (Rate-limited)
export const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password.'
      })
    }

    const cleanEmail = email.toLowerCase().trim()

    // Find admin with password
    const admin = await Admin.findOne({ email: cleanEmail }).select('+password')

    if (!admin) {
      recordFailedLogin(req)
      return res.status(401).json({
        success: false,
        message: 'Invalid Super Admin credentials.'
      })
    }

    // Role check: must be SUPER_ADMIN
    if (admin.role !== 'SUPER_ADMIN') {
      recordFailedLogin(req)
      return res.status(403).json({
        success: false,
        message: 'Access denied. Account is not a Super Administrator.'
      })
    }

    // Verify password
    const isMatch = await admin.matchPassword(password)
    if (!isMatch) {
      recordFailedLogin(req)
      return res.status(401).json({
        success: false,
        message: 'Invalid Super Admin credentials.'
      })
    }

    // Account status verification
    if (admin.status === 'inactive' || admin.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your Super Admin account has been deactivated.'
      })
    }

    // Reset failed login counter for this IP
    clearLoginAttempts(req)

    // Update lastLogin timestamp asynchronously
    Admin.findByIdAndUpdate(admin._id, { $set: { lastLogin: new Date() } }).exec().catch(() => {})

    // Generate JWT token
    const token = generateToken(admin)

    // Set HTTP-only Cookie
    res.cookie('admin_token', token, getCookieOptions())

    // Log login activity safely in the background
    AdminAuditLog.create({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'SUPER_ADMIN_LOGIN',
      target: 'AUTH',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || ''
    }).catch(() => {})

    res.status(200).json({
      success: true,
      message: 'Super Admin logged in successfully.',
      data: admin.toJSON(),
      admin: admin.toJSON(),
      token
    })
  } catch (error) {
    console.error('[superAdminLogin Error]:', error)
    res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred during Super Admin login.'
    })
  }
}

// @desc    Admin Login (Works for both regular Admins and Super Admins)
// @route   POST /api/auth/admin/login and /api/admin/auth/login
// @access  Public (Rate-limited)
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password.'
      })
    }

    const cleanEmail = email.toLowerCase().trim()
    console.log(`[Auth] Attempting login for: ${cleanEmail}`)

    // Find admin with password field included
    const admin = await Admin.findOne({ email: cleanEmail }).select('+password')

    if (!admin) {
      console.log(`[Auth] Admin not found for: ${cleanEmail}`)
      recordFailedLogin(req)
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      })
    }

    // Verify password
    const isMatch = await admin.matchPassword(password)
    if (!isMatch) {
      console.log(`[Auth] Password mismatch for: ${cleanEmail}`)
      recordFailedLogin(req)
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      })
    }

    // Check if account is active
    if (admin.status === 'inactive' || admin.isActive === false) {
      console.log(`[Auth] Account inactive for: ${cleanEmail}`)
      return res.status(403).json({
        success: false,
        message: 'Your admin account has been deactivated. Please contact the Super Admin.'
      })
    }

    // Reset rate limiter on successful login
    clearLoginAttempts(req)

    // Update lastLogin timestamp without triggering full pre-save hooks
    Admin.findByIdAndUpdate(admin._id, { $set: { lastLogin: new Date() } }).exec().catch((e) => {
      console.warn('[AdminLogin] Could not update lastLogin:', e.message)
    })

    // Generate JWT token
    const token = generateToken(admin)

    // Set HTTP-only Cookie
    res.cookie('admin_token', token, getCookieOptions())

    // Log admin login activity safely in the background
    AdminAuditLog.create({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'ADMIN_LOGIN',
      target: 'AUTH',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || ''
    }).catch((logErr) => {
      console.warn('[AuditLog] Failed to record login audit log:', logErr.message)
    })

    console.log(`[Auth] Login successful for: ${cleanEmail} (${admin.role})`)

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: admin.toJSON(),
      admin: admin.toJSON(),
      token
    })
  } catch (error) {
    console.error('[loginAdmin Error]:', error)
    res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred during login.'
    })
  }
}

// @desc    Log out Admin & Clear Cookie
// @route   POST /api/auth/admin/logout and /api/admin/auth/logout
// @access  Public / Protected
export const logoutAdmin = async (req, res) => {
  try {
    const isProd = envConfig.isProduction
    res.cookie('admin_token', '', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      expires: new Date(0)
    })

    if (req.admin) {
      AdminAuditLog.create({
        adminId: req.admin._id,
        adminEmail: req.admin.email,
        action: 'ADMIN_LOGOUT',
        target: 'AUTH',
        ipAddress: req.ip || req.headers['x-forwarded-for'] || ''
      }).catch(() => {})
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred during logout.'
    })
  }
}

// @desc    Get Current Logged-In Admin Profile
// @route   GET /api/auth/admin/me and /api/admin/auth/me
// @access  Private / Protected
export const getMe = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.'
      })
    }

    res.status(200).json({
      success: true,
      data: req.admin.toJSON()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching admin profile.'
    })
  }
}

// @desc    Change Password for Logged-In Admin
// @route   PATCH /api/auth/admin/change-password
// @access  Private / Protected
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required.'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      })
    }

    const admin = await Admin.findById(req.admin._id).select('+password')
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.'
      })
    }

    const isMatch = await admin.matchPassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.'
      })
    }

    admin.password = newPassword // Will be hashed by pre('save') and sets passwordChangedAt
    await admin.save()

    // Issue refreshed token
    const token = generateToken(admin)
    res.cookie('admin_token', token, getCookieOptions())

    AdminAuditLog.create({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'CHANGE_PASSWORD',
      target: 'SELF',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || ''
    }).catch(() => {})

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error changing password.'
    })
  }
}

// @desc    Update Admin Profile (Name and/or Password)
// @route   PUT /api/admin/auth/profile
// @access  Private / Protected
export const updateMyProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body
    const admin = await Admin.findById(req.admin._id).select('+password')

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.'
      })
    }

    if (name && name.trim()) {
      admin.name = name.trim()
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Please provide your current password to set a new password.'
        })
      }

      const isMatch = await admin.matchPassword(currentPassword)
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match.'
        })
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters.'
        })
      }

      admin.password = newPassword
    }

    await admin.save()

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: admin.toJSON()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile.'
    })
  }
}

export default {
  superAdminLogin,
  loginAdmin,
  logoutAdmin,
  getMe,
  changePassword,
  updateMyProfile
}

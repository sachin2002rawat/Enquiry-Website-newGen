import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import envConfig from '../config/env.js'

/**
 * Protect Admin Routes: Verifies JWT from HTTP-only cookie or Authorization header.
 * Attaches authenticated active admin document to req.admin.
 * Works for any active admin role (SUPER_ADMIN, ADMIN, EDITOR).
 */
export const protectAdmin = async (req, res, next) => {
  try {
    let token = null

    // 1. Check HTTP-only cookie first (preferred browser authentication)
    if (req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token
    }
    // 2. Fallback to Authorization: Bearer <token> header (CLI, Postman, automated tests)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to access the Admin Panel.'
      })
    }

    // Verify token
    const decoded = jwt.verify(token, envConfig.jwtSecret)

    // Find admin by ID
    const admin = await Admin.findById(decoded.id)

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin account no longer exists.'
      })
    }

    // Account status verification (support both status and isActive)
    if (admin.status === 'inactive' || admin.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your admin account has been deactivated. Please contact the Super Admin.'
      })
    }

    // Check if password was changed after the token was issued
    if (admin.changedPasswordAfter && admin.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Password recently changed. Please log in again.'
      })
    }

    req.admin = admin
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Admin session has expired. Please log in again.'
      })
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token. Please log in again.'
    })
  }
}

/**
 * Protect Super Admin Routes: Enforces that the authenticated user
 * has the role of 'SUPER_ADMIN'.
 */
export const protectSuperAdmin = async (req, res, next) => {
  // First ensure valid admin authentication
  protectAdmin(req, res, () => {
    if (!req.admin || req.admin.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super Admin privileges required.'
      })
    }
    next()
  })
}

/**
 * Role-Based Access Control (RBAC) Middleware.
 * Validates whether req.admin.role is in the allowed roles list.
 *
 * @param  {...string} roles Allowed roles: 'SUPER_ADMIN', 'ADMIN', 'EDITOR'
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      })
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.admin.role}' is not authorized to perform this action.`
      })
    }

    next()
  }
}

/**
 * Permission-Based Access Control Middleware.
 * SUPER_ADMIN is automatically granted all permissions.
 * ADMIN and EDITOR must have at least one of the required permissions.
 *
 * @param  {...string} requiredPermissions e.g. 'manage_products', 'manage_settings'
 */
export const authorizePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      })
    }

    // SUPER_ADMIN has unrestricted master access
    if (req.admin.role === 'SUPER_ADMIN') {
      return next()
    }

    const adminPermissions = Array.isArray(req.admin.permissions) ? req.admin.permissions : []
    const hasPermission = requiredPermissions.some((perm) => adminPermissions.includes(perm))

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required permission: ${requiredPermissions.join(' or ')}.`
      })
    }

    next()
  }
}

export default {
  protectAdmin,
  protectSuperAdmin,
  authorizeRoles,
  authorizePermissions
}

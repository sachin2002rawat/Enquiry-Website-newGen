import Admin from '../models/Admin.js'
import AdminAuditLog from '../models/AdminAuditLog.js'

// @desc    Create a new Admin account
// @route   POST /api/super-admin/admins and POST /api/admin/create
// @access  Private / SUPER_ADMIN only
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role = 'ADMIN', permissions = [], status = 'active' } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      })
    }

    // Email format validation
    const cleanEmail = email.toLowerCase().trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      })
    }

    // Strong password check (min 6 chars)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      })
    }

    // Duplicate email check
    const existing = await Admin.findOne({ email: cleanEmail })
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An administrator account with this email already exists.'
      })
    }

    // Role assignment: prevent creating another SUPER_ADMIN via this endpoint
    const validRoles = ['ADMIN', 'EDITOR']
    const assignedRole = validRoles.includes(role) ? role : 'ADMIN'

    // Clean permissions
    const cleanPermissions = Array.isArray(permissions) ? permissions.filter(Boolean) : []
    const initialStatus = status === 'inactive' ? 'inactive' : 'active'
    const initialIsActive = initialStatus === 'active'

    const newAdmin = await Admin.create({
      name: name.trim(),
      email: cleanEmail,
      password, // Pre-save hook hashes with bcrypt
      role: assignedRole,
      status: initialStatus,
      isActive: initialIsActive,
      permissions: cleanPermissions,
      createdBy: req.admin?._id
    })

    // Log Super Admin action
    AdminAuditLog.create({
      adminId: req.admin._id,
      adminEmail: req.admin.email,
      action: 'CREATE_ADMIN',
      target: newAdmin.email,
      details: { role: assignedRole, permissions: cleanPermissions },
      ipAddress: req.ip || ''
    }).catch(() => {})

    res.status(201).json({
      success: true,
      message: `Admin account for ${newAdmin.name} created successfully.`,
      data: newAdmin.toJSON()
    })
  } catch (error) {
    console.error('[createAdmin Error]:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating admin account.'
    })
  }
}

// @desc    Get all Admin accounts (search, filter by role/status, pagination)
// @route   GET /api/super-admin/admins and GET /api/admin/all
// @access  Private / SUPER_ADMIN only
export const getAllAdmins = async (req, res) => {
  try {
    const { search = '', role = '', status = '', page = 1, limit = 20 } = req.query

    const query = {}

    // Search filter
    if (search.trim()) {
      const term = search.trim()
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } }
      ]
    }

    // Role filter
    if (role && ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role)) {
      query.role = role
    }

    // Status filter
    if (status === 'active') {
      query.$or = [{ status: 'active' }, { isActive: true }]
    } else if (status === 'inactive') {
      query.$or = [{ status: 'inactive' }, { isActive: false }]
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20))
    const skip = (pageNum - 1) * limitNum

    const [admins, total] = await Promise.all([
      Admin.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email'),
      Admin.countDocuments(query)
    ])

    res.status(200).json({
      success: true,
      count: admins.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: admins
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching admin accounts.'
    })
  }
}

// @desc    Get single Admin by ID
// @route   GET /api/super-admin/admins/:id and GET /api/admin/:id
// @access  Private / SUPER_ADMIN only
export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).populate('createdBy', 'name email')
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.'
      })
    }

    res.status(200).json({
      success: true,
      data: admin.toJSON()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching admin details.'
    })
  }
}

// @desc    Update Admin details (name, role, permissions)
// @route   PUT /api/admin/:id
// @access  Private / SUPER_ADMIN only
export const updateAdmin = async (req, res) => {
  try {
    const { name, email, role, permissions, status, isActive } = req.body
    const targetAdmin = await Admin.findById(req.params.id)

    if (!targetAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.'
      })
    }

    // Safety: Prevent removing or demoting the only active SUPER_ADMIN
    if (targetAdmin.role === 'SUPER_ADMIN' && role && role !== 'SUPER_ADMIN') {
      const superAdminCount = await Admin.countDocuments({ role: 'SUPER_ADMIN', isActive: true })
      if (superAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot demote the only remaining active Super Admin.'
        })
      }
    }

    if (name && name.trim()) targetAdmin.name = name.trim()

    if (email && email.trim()) {
      const cleanEmail = email.toLowerCase().trim()
      if (cleanEmail !== targetAdmin.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(cleanEmail)) {
          return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address.'
          })
        }
        const existing = await Admin.findOne({ email: cleanEmail })
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'An administrator account with this email already exists.'
          })
        }
        targetAdmin.email = cleanEmail
      }
    }

    if (role && ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role)) targetAdmin.role = role
    if (Array.isArray(permissions)) targetAdmin.permissions = permissions.filter(Boolean)

    if (status && ['active', 'inactive'].includes(status)) {
      targetAdmin.status = status
      targetAdmin.isActive = status === 'active'
    } else if (typeof isActive === 'boolean') {
      targetAdmin.isActive = isActive
      targetAdmin.status = isActive ? 'active' : 'inactive'
    }

    await targetAdmin.save()

    AdminAuditLog.create({
      adminId: req.admin._id,
      adminEmail: req.admin.email,
      action: 'UPDATE_ADMIN',
      target: targetAdmin.email,
      details: { role: targetAdmin.role, permissions: targetAdmin.permissions, status: targetAdmin.status },
      ipAddress: req.ip || ''
    }).catch(() => {})

    res.status(200).json({
      success: true,
      message: 'Admin account updated successfully.',
      data: targetAdmin.toJSON()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating admin account.'
    })
  }
}

// @desc    Update Admin Permissions by Super Admin
// @route   PATCH /api/admin/:id/permissions
// @access  Private / SUPER_ADMIN only
export const updateAdminPermissions = async (req, res) => {
  try {
    const { permissions } = req.body
    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Permissions must be an array of permission keys.'
      })
    }

    const targetAdmin = await Admin.findById(req.params.id)
    if (!targetAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.'
      })
    }

    targetAdmin.permissions = permissions.filter(Boolean)
    await targetAdmin.save()

    AdminAuditLog.create({
      adminId: req.admin._id,
      adminEmail: req.admin.email,
      action: 'UPDATE_PERMISSIONS',
      target: targetAdmin.email,
      details: { permissions: targetAdmin.permissions },
      ipAddress: req.ip || ''
    }).catch(() => {})

    res.status(200).json({
      success: true,
      message: `Permissions updated successfully for ${targetAdmin.name}.`,
      data: targetAdmin.toJSON()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating permissions.'
    })
  }
}

// @desc    Activate/deactivate Admin
// @route   PATCH /api/super-admin/admins/:id/status
// @access  Private / SUPER_ADMIN only
export const toggleAdminStatus = async (req, res) => {
  try {
    const targetAdmin = await Admin.findById(req.params.id)

    if (!targetAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.'
      })
    }

    // Safety: Cannot deactivate yourself
    if (String(targetAdmin._id) === String(req.admin._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own Super Admin account.'
      })
    }

    // Safety: Cannot deactivate the only active Super Admin
    if (targetAdmin.role === 'SUPER_ADMIN' && (targetAdmin.status === 'active' || targetAdmin.isActive)) {
      const superAdminCount = await Admin.countDocuments({ role: 'SUPER_ADMIN', isActive: true })
      if (superAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate the only active Super Admin account.'
        })
      }
    }

    // Determine target status
    let nextActive
    if (req.body.status) {
      nextActive = req.body.status === 'active'
    } else if (typeof req.body.isActive === 'boolean') {
      nextActive = req.body.isActive
    } else {
      nextActive = !targetAdmin.isActive
    }

    targetAdmin.isActive = nextActive
    targetAdmin.status = nextActive ? 'active' : 'inactive'
    await targetAdmin.save()

    AdminAuditLog.create({
      adminId: req.admin._id,
      adminEmail: req.admin.email,
      action: nextActive ? 'ACTIVATE_ADMIN' : 'DEACTIVATE_ADMIN',
      target: targetAdmin.email,
      ipAddress: req.ip || ''
    }).catch(() => {})

    res.status(200).json({
      success: true,
      message: `Admin account has been ${nextActive ? 'activated' : 'deactivated'} successfully.`,
      data: targetAdmin.toJSON()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error changing admin status.'
    })
  }
}

// @desc    Reset Admin Password by Super Admin
// @route   PATCH /api/super-admin/admins/:id/password
// @access  Private / SUPER_ADMIN only
export const resetAdminPassword = async (req, res) => {
  try {
    const newPassword = req.body.newPassword || req.body.password

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      })
    }

    const targetAdmin = await Admin.findById(req.params.id).select('+password')

    if (!targetAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.'
      })
    }

    targetAdmin.password = newPassword // Pre-save hook hashes and updates passwordChangedAt
    await targetAdmin.save()

    AdminAuditLog.create({
      adminId: req.admin._id,
      adminEmail: req.admin.email,
      action: 'RESET_PASSWORD',
      target: targetAdmin.email,
      ipAddress: req.ip || ''
    }).catch(() => {})

    res.status(200).json({
      success: true,
      message: `Password for ${targetAdmin.name} (${targetAdmin.email}) has been reset successfully.`
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error resetting password.'
    })
  }
}

// @desc    Delete Admin account
// @route   DELETE /api/super-admin/admins/:id
// @access  Private / SUPER_ADMIN only
export const deleteAdmin = async (req, res) => {
  try {
    const targetAdmin = await Admin.findById(req.params.id)

    if (!targetAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.'
      })
    }

    // Safety: Cannot delete yourself
    if (String(targetAdmin._id) === String(req.admin._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own Super Admin account.'
      })
    }

    // Safety: Cannot delete the only Super Admin
    if (targetAdmin.role === 'SUPER_ADMIN') {
      const superAdminCount = await Admin.countDocuments({ role: 'SUPER_ADMIN' })
      if (superAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the only Super Admin account.'
        })
      }
    }

    await Admin.findByIdAndDelete(req.params.id)

    AdminAuditLog.create({
      adminId: req.admin._id,
      adminEmail: req.admin.email,
      action: 'DELETE_ADMIN',
      target: targetAdmin.email,
      ipAddress: req.ip || ''
    }).catch(() => {})

    res.status(200).json({
      success: true,
      message: `Admin ${targetAdmin.name} (${targetAdmin.email}) deleted successfully.`
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting admin.'
    })
  }
}

export default {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  updateAdminPermissions,
  toggleAdminStatus,
  resetAdminPassword,
  deleteAdmin
}

import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  FiUsers,
  FiUserPlus,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiKey,
  FiEdit2,
  FiTrash2,
  FiShield,
  FiClock,
  FiMail,
  FiRefreshCw,
  FiAlertCircle,
  FiX,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi'
import { apiService } from '../../api/apiService'
import './AdminUserManagement.css'

const AVAILABLE_PERMISSIONS = [
  { id: 'manage_products', label: 'Manage Products', desc: 'Create, edit & delete catalog products' },
  { id: 'manage_categories', label: 'Manage Categories', desc: 'Organize store departments & categories' },
  { id: 'manage_blogs', label: 'Manage Blogs', desc: 'Write, publish and edit blog articles' },
  { id: 'manage_enquiries', label: 'Manage Enquiries', desc: 'View customer inquiries and change statuses' },
  { id: 'manage_settings', label: 'Platform Settings', desc: 'Configure SMTP, Cloudinary, WhatsApp & store info' },
  { id: 'manage_homepage', label: 'Homepage Banners', desc: 'Edit hero carousel slides and homepage layout' },
  { id: 'manage_company', label: 'Company Profile', desc: 'Update About Us story, badges, and trust stats' },
  { id: 'manage_footer', label: 'Footer Links', desc: 'Edit footer branding, quick links and copyright' }
]

const ITEMS_PER_PAGE = 10

const AdminUserManagement = ({ showToast, currentAdmin }) => {
  const [admins, setAdmins] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(null)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(null)
  const [deleteConfirmAdmin, setDeleteConfirmAdmin] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ADMIN',
    permissions: ['manage_products', 'manage_enquiries']
  })
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset password form state
  const [resetPasswordValue, setResetPasswordValue] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showCreatePassword, setShowCreatePassword] = useState(false)
  const [showCreateConfirmPassword, setShowCreateConfirmPassword] = useState(false)

  // Fetch all admins
  const fetchAdmins = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await apiService.adminGetAll({
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: ITEMS_PER_PAGE
      })

      if (res && res.success) {
        setAdmins(res.data || [])
        setTotalPages(res.pages || 1)
        setTotalCount(res.total || 0)
        if (res.pages && page > res.pages) {
          setPage(res.pages)
        }
      } else {
        if (showToast) showToast(res?.message || 'Error fetching admin users.', 'warning')
      }
    } catch (err) {
      console.warn('[AdminUserManagement] Fetch error:', err.message)
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, roleFilter, statusFilter, page, showToast])

  useEffect(() => {
    fetchAdmins()
  }, [fetchAdmins])

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'ADMIN',
      permissions: ['manage_products', 'manage_enquiries']
    })
    setShowCreatePassword(false)
    setShowCreateConfirmPassword(false)
    setFormError('')
    setShowCreateModal(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (admin) => {
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: Array.isArray(admin.permissions) ? admin.permissions : []
    })
    setFormError('')
    setShowEditModal(admin)
  }

  // Toggle permission in form
  const togglePermission = (permId) => {
    setFormData((prev) => {
      const perms = prev.permissions.includes(permId)
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId]
      return { ...prev, permissions: perms }
    })
  }

  // Submit Create Admin
  const handleCreateSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setFormError('')

    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
      setFormError('Name, email, password, and confirm password are required.')
      return
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match. Please ensure both passwords match.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await apiService.adminCreate({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'ADMIN',
        permissions: formData.permissions
      })
      if (res && res.success) {
        if (showToast) showToast(`Admin account for ${formData.name} created!`)
        setShowCreateModal(false)
        fetchAdmins()
      } else {
        setFormError(res?.message || 'Failed to create admin account.')
      }
    } catch (err) {
      setFormError(err.message || 'Error creating admin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submit Edit Admin
  const handleEditSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!showEditModal) return
    setFormError('')

    if (!formData.name || !formData.name.trim()) {
      setFormError('Admin full name is required.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await apiService.adminUpdate(showEditModal._id, {
        name: formData.name.trim(),
        email: formData.email ? formData.email.trim() : showEditModal.email,
        role: formData.role,
        permissions: formData.permissions
      })

      if (res && res.success) {
        if (showToast) showToast('Admin account updated successfully!')
        const updatedDoc = res.data || { ...showEditModal, ...formData }
        setAdmins((prev) =>
          prev.map((adm) => (adm._id === showEditModal._id ? { ...adm, ...updatedDoc } : adm))
        )
        setShowEditModal(null)
        fetchAdmins()
      } else {
        setFormError(res?.message || 'Failed to update admin.')
      }
    } catch (err) {
      setFormError(err.message || 'Error updating admin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Toggle Active/Inactive Status
  const handleToggleStatus = async (admin) => {
    if (String(admin._id) === String(currentAdmin?._id)) {
      if (showToast) showToast('You cannot deactivate your own account.', 'warning')
      return
    }

    try {
      const res = await apiService.adminToggleStatus(admin._id)
      if (res && res.success) {
        if (showToast) showToast(res.message)
        fetchAdmins()
      } else {
        if (showToast) showToast(res?.message || 'Failed to change status.', 'warning')
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'warning')
    }
  }

  // Submit Reset Password
  const handleResetPasswordSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!showResetPasswordModal) return
    if (!resetPasswordValue || resetPasswordValue.length < 6) {
      setFormError('New password must be at least 6 characters.')
      return
    }

    setIsSubmitting(true)
    setFormError('')
    try {
      const res = await apiService.adminResetPassword(showResetPasswordModal._id, resetPasswordValue)
      if (res && res.success) {
        if (showToast) showToast(`Password for ${showResetPasswordModal.name} reset successfully!`)
        setShowResetPasswordModal(null)
        setResetPasswordValue('')
      } else {
        setFormError(res?.message || 'Failed to reset password.')
      }
    } catch (err) {
      setFormError(err.message || 'Error resetting password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete Admin
  const handleDeleteAdmin = async () => {
    if (!deleteConfirmAdmin) return
    setIsSubmitting(true)
    setFormError('')
    try {
      const res = await apiService.adminDelete(deleteConfirmAdmin._id)
      if (res && res.success) {
        if (showToast) showToast(`Admin ${deleteConfirmAdmin.name} removed.`)
        const deletedId = deleteConfirmAdmin._id
        setAdmins((prev) => prev.filter((adm) => adm._id !== deletedId))
        setTotalCount((prev) => Math.max(0, prev - 1))
        setDeleteConfirmAdmin(null)
        fetchAdmins()
      } else {
        const msg = res?.message || 'Failed to delete admin.'
        setFormError(msg)
        if (showToast) showToast(msg, 'warning')
      }
    } catch (err) {
      const msg = err.message || 'Error deleting admin.'
      setFormError(msg)
      if (showToast) showToast(msg, 'warning')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-users-view">
      {/* View Header & Action Bar */}
      <div className="section-header-modern" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))',
                  color: '#6366F1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}
              >
                <FiUsers />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
                  Administrator & Staff Management
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '2px 0 0 0' }}>
                  Manage authorized administrative users, assign role-based permissions, and audit access.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={handleOpenCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#4F46E5',
              color: '#ffffff',
              padding: '11px 20px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)'
            }}
          >
            <FiUserPlus size={18} />
            <span>Create New Admin</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="admin-card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          border: '1px solid #E8E2D8'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 300px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
            <input
              type="text"
              className="admin-form-input"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              style={{ paddingLeft: '36px', height: '40px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <select
            className="admin-form-select"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setPage(1)
            }}
            style={{ height: '40px', maxWidth: '160px' }}
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="EDITOR">Editor</option>
          </select>

          <select
            className="admin-form-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            style={{ height: '40px', maxWidth: '140px' }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          type="button"
          onClick={fetchAdmins}
          title="Refresh List"
          style={{
            background: '#F1F5F9',
            border: 'none',
            color: '#475569',
            padding: '9px 14px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 500
          }}
        >
          <FiRefreshCw className={isLoading ? 'animate-spin' : ''} size={15} /> Refresh
        </button>
      </div>

      {/* Admins Table */}
      <div
        className="admin-card"
        style={{
          padding: 0,
          overflow: 'hidden',
          border: '1px solid #E8E2D8',
          borderRadius: '14px'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>ADMIN NAME & EMAIL</th>
                <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>ROLE</th>
                <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>PERMISSIONS</th>
                <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>STATUS</th>
                <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>LAST LOGIN</th>
                <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 600, color: '#475569', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                    Loading administrator accounts...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    <FiUsers size={32} style={{ color: '#CBD5E1', marginBottom: '8px' }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>No administrator accounts found.</p>
                  </td>
                </tr>
              ) : (
                admins.map((adm) => {
                  const isCurrent = String(adm._id) === String(currentAdmin?._id)
                  return (
                    <tr
                      key={adm._id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        backgroundColor: isCurrent ? 'rgba(99, 102, 241, 0.02)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#1E293B' }}>
                          {adm.name}
                          {isCurrent && (
                            <span
                              style={{
                                marginLeft: '8px',
                                fontSize: '0.72rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                backgroundColor: '#EEF2FF',
                                color: '#4F46E5',
                                fontWeight: 700
                              }}
                            >
                              YOU
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <FiMail size={12} /> {adm.email}
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                            backgroundColor:
                              adm.role === 'SUPER_ADMIN'
                                ? '#FEF3C7'
                                : adm.role === 'ADMIN'
                                ? '#EEF2FF'
                                : '#F1F5F9',
                            color:
                              adm.role === 'SUPER_ADMIN'
                                ? '#B45309'
                                : adm.role === 'ADMIN'
                                ? '#4338CA'
                                : '#475569'
                          }}
                        >
                          <FiShield size={12} />
                          {adm.role.replace('_', ' ')}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', maxWidth: '280px' }}>
                        {adm.role === 'SUPER_ADMIN' ? (
                          <span style={{ fontSize: '0.82rem', color: '#10B981', fontWeight: 600 }}>
                            ★ Full Master Access (All Features)
                          </span>
                        ) : Array.isArray(adm.permissions) && adm.permissions.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {adm.permissions.map((p) => (
                              <span
                                key={p}
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '2px 8px',
                                  backgroundColor: '#F1F5F9',
                                  color: '#334155',
                                  borderRadius: '6px',
                                  fontWeight: 500
                                }}
                              >
                                {p.replace('manage_', '')}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>No permissions assigned</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(adm)}
                          disabled={isCurrent}
                          title={isCurrent ? 'Cannot deactivate self' : adm.isActive ? 'Click to deactivate' : 'Click to activate'}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            border: 'none',
                            cursor: isCurrent ? 'not-allowed' : 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            backgroundColor: adm.isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: adm.isActive ? '#059669' : '#DC2626'
                          }}
                        >
                          {adm.isActive ? <FiCheckCircle size={14} /> : <FiXCircle size={14} />}
                          {adm.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: '#64748B' }}>
                        {adm.lastLogin ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiClock size={12} /> {new Date(adm.lastLogin).toLocaleDateString()}
                          </div>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Never</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenEdit(adm)
                            }}
                            title="Edit Admin"
                            className="action-icon-btn edit-btn"
                          >
                            <FiEdit2 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowResetPasswordModal(adm)
                              setResetPasswordValue('')
                              setFormError('')
                            }}
                            title="Reset Password"
                            className="action-icon-btn key-btn"
                          >
                            <FiKey size={15} />
                          </button>

                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteConfirmAdmin(adm)
                                setFormError('')
                              }}
                              title="Delete Admin"
                              className="action-icon-btn delete-btn"
                            >
                              <FiTrash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalCount > 0 && (
          <div className="admin-pagination-bar">
            <div className="pagination-info">
              Showing <span style={{ color: 'var(--admin-text-main, #1E293B)', fontWeight: 600 }}>{((page - 1) * ITEMS_PER_PAGE) + 1}</span> to{' '}
              <span style={{ color: 'var(--admin-text-main, #1E293B)', fontWeight: 600 }}>{Math.min(page * ITEMS_PER_PAGE, totalCount)}</span> of{' '}
              <span style={{ color: 'var(--admin-text-main, #1E293B)', fontWeight: 600 }}>{totalCount}</span> administrators
            </div>

            <div className="pagination-controls">
              <button
                type="button"
                className="pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                title="Previous Page"
              >
                <FiChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`pagination-btn ${p === page ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                className="pagination-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                title="Next Page"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          CREATE ADMIN MODAL (PORTAL)
         ========================================================================= */}
      {showCreateModal && typeof document !== 'undefined' && createPortal(
        <div
          className="admin-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) setShowCreateModal(false)
          }}
        >
          <div className="admin-modal-card" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3>
                <FiUserPlus style={{ color: '#4F46E5' }} /> Create New Admin Account
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                disabled={isSubmitting}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-body">
              {formError && (
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    marginBottom: '16px'
                  }}
                >
                  {formError}
                </div>
              )}

              <form id="create-admin-form" onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Full Name *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Email Address *</label>
                  <input
                    type="email"
                    className="admin-form-input"
                    required
                    placeholder="admin@quick-enquiry.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Password * (min 6 characters)</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showCreatePassword ? 'text' : 'password'}
                      className="admin-form-input"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      style={{ paddingRight: '42px', width: '100%', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      title={showCreatePassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}
                    >
                      {showCreatePassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Confirm Password *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showCreateConfirmPassword ? 'text' : 'password'}
                      className="admin-form-input"
                      required
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      style={{ paddingRight: '42px', width: '100%', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreateConfirmPassword(!showCreateConfirmPassword)}
                      title={showCreateConfirmPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}
                    >
                      {showCreateConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Role Selection (ADMIN only) *</label>
                  <select
                    className="admin-form-select"
                    value="ADMIN"
                    disabled
                  >
                    <option value="ADMIN">ADMIN (Normal Administrator)</option>
                  </select>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px', display: 'block' }}>
                    Standard Administrator role with customizable module permissions.
                  </span>
                </div>

                {formData.role !== 'SUPER_ADMIN' && (
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ marginBottom: '8px', display: 'block' }}>
                      Assign Module Permissions
                    </label>
                    <div className="permissions-grid">
                      {AVAILABLE_PERMISSIONS.map((perm) => {
                        const isChecked = formData.permissions.includes(perm.id)
                        return (
                          <label key={perm.id} className="permission-checkbox-label">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(perm.id)}
                            />
                            <span>{perm.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                disabled={isSubmitting}
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={isSubmitting}
                onClick={handleCreateSubmit}
              >
                {isSubmitting ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
          EDIT ADMIN MODAL (PORTAL)
         ========================================================================= */}
      {showEditModal && typeof document !== 'undefined' && createPortal(
        <div
          className="admin-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) setShowEditModal(null)
          }}
        >
          <div className="admin-modal-card" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3>
                <FiEdit2 style={{ color: '#4F46E5' }} /> Edit Admin: {showEditModal.name}
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(null)}
                disabled={isSubmitting}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-body">
              {formError && (
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    marginBottom: '16px'
                  }}
                >
                  {formError}
                </div>
              )}

              <form id="edit-admin-form" onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Full Name *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Email Address *</label>
                  <input
                    type="email"
                    className="admin-form-input"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">System Role *</label>
                  <select
                    className="admin-form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="EDITOR">EDITOR</option>
                    <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  </select>
                </div>

                {formData.role !== 'SUPER_ADMIN' && (
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ marginBottom: '8px', display: 'block' }}>
                      Assigned Permissions
                    </label>
                    <div className="permissions-grid">
                      {AVAILABLE_PERMISSIONS.map((perm) => {
                        const isChecked = formData.permissions.includes(perm.id)
                        return (
                          <label key={perm.id} className="permission-checkbox-label">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(perm.id)}
                            />
                            <span>{perm.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                disabled={isSubmitting}
                onClick={() => setShowEditModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={isSubmitting}
                onClick={handleEditSubmit}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
          RESET PASSWORD MODAL (PORTAL)
         ========================================================================= */}
      {showResetPasswordModal && typeof document !== 'undefined' && createPortal(
        <div
          className="admin-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) setShowResetPasswordModal(null)
          }}
        >
          <div className="admin-modal-card" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>
                <FiKey style={{ color: '#D97706' }} /> Reset Admin Password
              </h3>
              <button
                type="button"
                onClick={() => setShowResetPasswordModal(null)}
                disabled={isSubmitting}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Enter a new secure password for <strong>{showResetPasswordModal.name}</strong> ({showResetPasswordModal.email}).
              </p>

              {formError && (
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    marginBottom: '16px'
                  }}
                >
                  {formError}
                </div>
              )}

              <form id="reset-password-form" onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">New Password (min 6 characters) *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="admin-form-input"
                      required
                      placeholder="Enter new password"
                      value={resetPasswordValue}
                      onChange={(e) => setResetPasswordValue(e.target.value)}
                      style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748B'
                      }}
                    >
                      {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                disabled={isSubmitting}
                onClick={() => setShowResetPasswordModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={isSubmitting}
                onClick={handleResetPasswordSubmit}
              >
                {isSubmitting ? 'Resetting...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL (PORTAL)
         ========================================================================= */}
      {deleteConfirmAdmin && typeof document !== 'undefined' && createPortal(
        <div
          className="admin-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) setDeleteConfirmAdmin(null)
          }}
        >
          <div className="admin-modal-card" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ color: '#DC2626' }}>
                <FiTrash2 size={20} /> Delete Administrator
              </h3>
              <button
                type="button"
                onClick={() => setDeleteConfirmAdmin(null)}
                disabled={isSubmitting}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ textAlign: 'center', padding: '24px 20px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#FEE2E2',
                  color: '#EF4444',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: '16px'
                }}
              >
                <FiAlertCircle size={28} />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1E293B', margin: '0 0 8px 0' }}>
                Delete {deleteConfirmAdmin.name}?
              </h4>
              <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                Are you sure you want to permanently delete administrator account <strong>{deleteConfirmAdmin.email}</strong>? This action cannot be undone.
              </p>

              {formError && (
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    marginTop: '12px'
                  }}
                >
                  {formError}
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                className="btn-secondary"
                disabled={isSubmitting}
                onClick={() => setDeleteConfirmAdmin(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDeleteAdmin}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default AdminUserManagement


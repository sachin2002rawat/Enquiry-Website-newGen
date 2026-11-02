import React, { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import AdminUserManagement from '../components/Admin/AdminUserManagement'
import { FaCommentDots } from 'react-icons/fa'
import {
  FiShield,
  FiLogOut,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi'
import './SuperAdminPage.css'

const SuperAdminPage = () => {
  const { admin, logout, isAuthenticated } = useAdminAuth()
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)

  // Auto-dismiss toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  // Guard: If not a SUPER_ADMIN, redirect to normal admin dashboard
  if (admin && admin.role !== 'SUPER_ADMIN') {
    return <Navigate to="/admin/dashboard" replace />
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/admin/login', { replace: true })
    } catch (err) {
      console.error('[SuperAdminPage] Logout error:', err)
      navigate('/admin/login', { replace: true })
    }
  }

  return (
    <div className="super-admin-layout">
      {/* Super Admin Dedicated Top Bar - NO normal sidebar, NO normal navbar */}
      <header className="super-admin-header">
        <div className="super-admin-brand">
          <div className="super-admin-logo-icon">
            <FaCommentDots />
          </div>
          <div className="super-admin-title-group">
            <h1 className="super-admin-title">
              Quick<span>Enquiry</span>
            </h1>
            <span className="super-admin-badge">
              <FiShield size={12} /> Super Admin Portal
            </span>
          </div>
        </div>

        <div className="super-admin-actions">
          <div className="super-admin-profile">
            <div className="super-admin-avatar">
              {admin?.name ? admin.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="super-admin-user-info">
              <span className="super-admin-user-name">{admin?.name || 'Super Administrator'}</span>
              <span className="super-admin-user-email">{admin?.email || 'admin@quick-enquiry.com'}</span>
            </div>
          </div>

          <button
            type="button"
            className="super-admin-logout-btn"
            onClick={handleLogout}
            title="Log Out of Super Admin Portal"
          >
            <FiLogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container - Displays ONLY Admin Management */}
      <main className="super-admin-main">
        <AdminUserManagement showToast={showToast} currentAdmin={admin} />
      </main>

      {/* Floating Action Feedback Toast */}
      {toast && (
        <div className={`super-admin-toast ${toast.type}`}>
          {toast.type === 'success' ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}

export default SuperAdminPage


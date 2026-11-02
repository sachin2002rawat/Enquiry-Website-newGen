import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { FiShield, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi'

const AdminProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, isLoading, admin } = useAdminAuth()
  const location = useLocation()

  // 1. Initial authentication verification loading spinner
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF6F0',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            border: '4px solid #E2E8F0',
            borderTopColor: '#6366F1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '16px'
          }}
        />
        <div style={{ color: '#1E293B', fontWeight: 600, fontSize: '1rem' }}>
          Verifying Admin Access...
        </div>
        <div style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
          Connecting to secure authentication service
        </div>
        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>
      </div>
    )
  }

  // 2. Redirect to Admin Login if unauthenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // 3. Check Role-Based Access Control if allowedRoles is specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(admin?.role)) {
    // Auto-redirect Super Admin if attempting to view standard admin dashboard
    if (admin?.role === 'SUPER_ADMIN') {
      return <Navigate to="/admin/manage-admins" replace />
    }

    // Auto-redirect standard admin if accessing manage-admins
    if (location.pathname === '/admin/manage-admins') {
      return <Navigate to="/admin/dashboard" replace />
    }

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF6F0',
          padding: '24px',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '36px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: '1px solid #E8E2D8'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              marginBottom: '16px'
            }}
          >
            <FiAlertTriangle />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
            Access Restricted (403)
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '24px' }}>
            Your account role (<strong style={{ color: '#4F46E5' }}>{admin?.role}</strong>) does not have permission to access this administrative section. Please contact your Super Administrator.
          </p>
          <a
            href={admin?.role === 'SUPER_ADMIN' ? '/admin/manage-admins' : '/admin/dashboard'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#6366F1',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none'
            }}
          >
            <FiArrowLeft size={16} /> Return to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return children
}

export default AdminProtectedRoute


import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiShield,
  FiArrowLeft
} from 'react-icons/fi'
import { FaCommentDots } from 'react-icons/fa'
import './AdminLogin.css'

const AdminLogin = () => {
  const { login, isAuthenticated, isLoading, admin } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Determine redirection target based on role
  const getRoleRedirect = (role, defaultPath = null) => {
    if (defaultPath && defaultPath !== '/admin' && defaultPath !== '/admin/login') {
      if (role === 'SUPER_ADMIN') {
        return defaultPath.startsWith('/admin/manage-admins') ? defaultPath : '/admin/manage-admins'
      }
      return defaultPath.startsWith('/admin/manage-admins') ? '/admin/dashboard' : defaultPath
    }
    return role === 'SUPER_ADMIN' ? '/admin/manage-admins' : '/admin/dashboard'
  }

  const from = location.state?.from?.pathname || null

  useEffect(() => {
    if (isAuthenticated && !isLoading && admin) {
      const target = getRoleRedirect(admin.role, from)
      navigate(target, { replace: true })
    }
  }, [isAuthenticated, isLoading, admin, navigate, from])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const cleanEmail = email.trim()
    if (!cleanEmail) {
      setErrorMessage('Please enter your administrator email address.')
      return
    }

    if (!password) {
      setErrorMessage('Please enter your password.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await login(cleanEmail, password)
      if (result && result.success) {
        const role = result.admin?.role || admin?.role
        const target = getRoleRedirect(role, from)
        navigate(target, { replace: true })
      } else {
        setErrorMessage(result?.message || 'Invalid administrator email or password.')
      }
    } catch (err) {
      console.error('[AdminLogin] Submission error:', err)
      setErrorMessage(err.message || 'An unexpected error occurred while logging in. Please check backend connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        {/* Brand Header */}
        <div className="admin-login-brand">
          <div className="admin-login-logo-icon">
            <FaCommentDots />
          </div>
          <h1 className="admin-login-title">
            Quick<span>Enquiry</span>
          </h1>
          <p className="admin-login-subtitle">
            Secure Administrator Management Portal
          </p>
          <div className="admin-login-badge">
            <FiShield size={12} /> Restricted Access Only
          </div>
        </div>

        {/* Error Alert Message */}
        {errorMessage && (
          <div className="admin-login-error" role="alert">
            <FiAlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
          {/* Email Field */}
          <div className="admin-login-field">
            <label className="admin-login-label" htmlFor="admin-email">
              Admin Email Address
            </label>
            <div className="admin-login-input-wrap">
              <span className="admin-login-input-icon">
                <FiMail size={18} />
              </span>
              <input
                id="admin-email"
                type="email"
                className="admin-login-input"
                placeholder="admin@quick-enquiry.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="admin-login-field">
            <label className="admin-login-label" htmlFor="admin-password">
              Password
            </label>
            <div className="admin-login-input-wrap">
              <span className="admin-login-input-icon">
                <FiLock size={18} />
              </span>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="admin-login-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="admin-login-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="admin-login-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="admin-login-btn-spinner" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Admin Portal</span>
            )}
          </button>
        </form>

        {/* Footer Actions */}
        <div className="admin-login-footer">
          <Link to="/" className="admin-login-back-link">
            <FiArrowLeft size={16} /> Return to Public Website
          </Link>
          <span className="admin-login-tip">
            Authorized personnel only. Public registration is not permitted.
          </span>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin


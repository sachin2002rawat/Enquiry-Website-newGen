import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiService } from '../api/apiService'

const AdminAuthContext = createContext(null)

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Verify active session on initial mount via HTTP-only cookie
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await apiService.adminGetMe()
      if (res && res.success && res.data) {
        setAdmin(res.data)
        setIsAuthenticated(true)
        setAuthError(null)
      } else {
        setAdmin(null)
        setIsAuthenticated(false)
      }
    } catch (err) {
      setAdmin(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  // Admin Login Handler
  const login = async (email, password) => {
    setIsLoading(true)
    setAuthError(null)
    try {
      const res = await apiService.adminLogin({ email, password })
      if (res && res.success && res.data) {
        if (res.token) {
          try {
            localStorage.setItem('admin_jwt_token', res.token)
          } catch {}
        }
        setAdmin(res.data)
        setIsAuthenticated(true)
        setAuthError(null)
        return { success: true, admin: res.data }
      }

      const msg = res?.message || 'Login failed. Please check your credentials.'
      setAuthError(msg)
      return { success: false, message: msg }
    } catch (err) {
      const msg = err.message || 'An unexpected error occurred during login.'
      setAuthError(msg)
      return { success: false, message: msg }
    } finally {
      setIsLoading(false)
    }
  }

  // Admin Logout Handler
  const logout = async () => {
    try {
      await apiService.adminLogout()
    } catch (err) {
      console.warn('[AdminAuth] Logout warning:', err.message)
    } finally {
      try {
        localStorage.removeItem('admin_jwt_token')
      } catch {}
      setAdmin(null)
      setIsAuthenticated(false)
      setAuthError(null)
    }
  }

  // Helper to re-fetch current admin profile
  const refreshAdmin = async () => {
    try {
      const res = await apiService.adminGetMe()
      if (res && res.success && res.data) {
        setAdmin(res.data)
      }
    } catch (err) {
      // ignore
    }
  }

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAuthenticated,
        isLoading,
        authError,
        login,
        logout,
        refreshAdmin,
        checkAuthStatus
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

export default AdminAuthContext


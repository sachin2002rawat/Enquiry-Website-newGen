import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './page/Home'
import Home2 from './page/home2'
import Product from './page/Product'
import ProductDetails from './page/ProductDetails'
import CategoryDetails from './page/CategoryDetails'
import Enquirycompo from './components/Enquirycompo'
import { EnquiryModalProvider } from './context/EnquiryModalContext'
import useScrollReveal from './hooks/useScrollReveal'
import './App.css'
import { apiService } from './api/apiService'
import Contact from './page/Contact'
import Blog from './page/Blog'
import BlogDetail from './page/BlogDetail'
import AboutEnquiryCompany from './page/AboutEnquiryCompany'
import WhatsAppButton from './components/Product/WhatsAppButton'
import AdminPage from './page/AdminPage'
import SuperAdminPage from './page/SuperAdminPage'
import AdminLogin from './page/AdminLogin'
import AdminProtectedRoute from './components/Admin/AdminProtectedRoute'
import { AdminAuthProvider } from './context/AdminAuthContext'

const RootHomeRoute = () => {
  const [activeHome, setActiveHome] = React.useState(() => {
    try {
      const saved = localStorage.getItem('enquiry_admin_store_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.activeHomepage || 'home1'
      }
    } catch {
      // fallback
    }
    return 'home1'
  })

  React.useEffect(() => {
    // 1. Fetch latest activeHomepage from backend database on mount
    const fetchLatestSettings = async () => {
      try {
        const dbSettings = await apiService.getSettings()
        if (dbSettings) {
          if (dbSettings.activeHomepage) {
            setActiveHome(dbSettings.activeHomepage)
          }
          try {
            const saved = localStorage.getItem('enquiry_admin_store_settings')
            const parsed = saved ? JSON.parse(saved) : {}
            localStorage.setItem(
              'enquiry_admin_store_settings',
              JSON.stringify({ ...parsed, ...dbSettings })
            )
          } catch {}
        }
      } catch (err) {
        // fallback to local storage state
      }
    }
    fetchLatestSettings()

    // 2. Local Storage & Custom Event Sync
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('enquiry_admin_store_settings')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.activeHomepage) {
            setActiveHome(parsed.activeHomepage)
          }
        }
      } catch {
        // fallback
      }
    }

    const handleCustomChange = (e) => {
      if (e.detail) {
        setActiveHome(e.detail)
      } else {
        handleStorageChange()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('homepageChanged', handleCustomChange)
    const interval = setInterval(handleStorageChange, 500)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('homepageChanged', handleCustomChange)
      clearInterval(interval)
    }
  }, [])

  React.useEffect(() => {
    try {
      sessionStorage.setItem('active_homepage', activeHome)
    } catch (e) {}
  }, [activeHome])

  return activeHome === 'home2' ? <Home2 /> : <Home />
}

const AppContent = () => {
  useScrollReveal()

  return (
    <>
      <Routes>
        <Route path="/" element={<RootHomeRoute />} />
        <Route path="/home1" element={<Home />} />
        <Route path="/home2" element={<Home2 />} />
        <Route path="/about" element={<AboutEnquiryCompany />} />
        <Route path="/about-company" element={<AboutEnquiryCompany />} />
        <Route path="/enquiry" element={<Enquirycompo />} />
        <Route path="/product" element={<Product />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/productDetail" element={<ProductDetails />} />
        <Route path="/category/:id" element={<CategoryDetails />} />
        <Route path="/category" element={<CategoryDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />

        {/* ADMIN AUTHENTICATION (PUBLIC LOGIN ONLY) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* SUPER ADMIN EXCLUSIVE ROUTE (NO SIDEBAR, NO NORMAL DASHBOARD) */}
        <Route
          path="/admin/manage-admins"
          element={
            <AdminProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <SuperAdminPage />
            </AdminProtectedRoute>
          }
        />

        {/* NORMAL ADMIN PROTECTED ROUTES */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute allowedRoles={['ADMIN', 'EDITOR']}>
              <AdminPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute allowedRoles={['ADMIN', 'EDITOR']}>
              <AdminPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/blogs/create"
          element={
            <AdminProtectedRoute allowedRoles={['ADMIN', 'EDITOR']}>
              <AdminPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/blogs/edit/:id"
          element={
            <AdminProtectedRoute allowedRoles={['ADMIN', 'EDITOR']}>
              <AdminPage />
            </AdminProtectedRoute>
          }
        />
      
      </Routes>
      
      {/* Global Glassmorphic Enquiry Pop-up Modal */}
      <Enquirycompo isModal={true} />

      {/* Global Fixed Floating WhatsApp Quick Contact Button */}
      <WhatsAppButton />
    </>
  )
}

const App = () => {
  return (
    <AdminAuthProvider>
      <EnquiryModalProvider>
        <AppContent />
      </EnquiryModalProvider>
    </AdminAuthProvider>
  )
}

export default React.memo(App)

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/Admin/AdminSidebar'
import AdminHeader from '../components/Admin/AdminHeader'
import DashboardOverview from '../components/Admin/DashboardOverview'
import HomepageSettings from '../components/Admin/HomepageSettings'
import FooterSettings from '../components/Admin/FooterSettings'
import CompanySettings from '../components/Admin/CompanySettings'
import ProductManagement from '../components/Admin/ProductManagement'
import CategoryManagement from '../components/Admin/CategoryManagement'
import EnquiryManagement from '../components/Admin/EnquiryManagement'
import SmtpSettings from '../components/Admin/SmtpSettings'
import CloudinarySettings from '../components/Admin/CloudinarySettings'
import WhatsAppSettings from '../components/Admin/WhatsAppSettings'
import BlogManagement from '../components/Admin/BlogManagement'
import BlogEditorPage from '../components/Admin/BlogEditorPage'
import AdminUserManagement from '../components/Admin/AdminUserManagement'
import { useAdminAuth } from '../context/AdminAuthContext'
import defaultHeroImages from '../HeroImage.json'
import defaultProducts from '../ProductsData.json'
import defaultFaqs from '../Faq.json'
import defaultWhyChoose from '../WhyChoose.json'
import defaultReviews from '../Review.json'
import { apiService } from '../api/apiService'
import {
  FiCheckCircle,
  FiAlertCircle,
  FiSettings,
  FiSave,
  FiRotateCcw,
  FiBell,
  FiShield,
  FiDatabase,
  FiDollarSign,
  FiGlobe,
  FiRefreshCw,
  FiDownload,
  FiCheck
} from 'react-icons/fi'
import './AdminPage.css'

const LOCAL_KEY_ACTIVE_TAB = 'enquiry_admin_active_tab'
const LOCAL_KEY_SIDEBAR_COLLAPSED = 'enquiry_admin_sidebar_collapsed'
const VALID_ADMIN_TABS = [
  'overview',
  'homepage',
  'blog',
  'footer',
  'company',
  'product',
  'category',
  'enquiry',
  'settings',
  'smtp',
  'cloudinary',
  'whatsapp',
  'manage-admins'
]

const LOCAL_KEY_HERO = 'enquiry_admin_hero_slides'
const LOCAL_KEY_PRODUCTS = 'enquiry_admin_products'
const LOCAL_KEY_SETTINGS = 'enquiry_admin_store_settings'
const LOCAL_KEY_VISIBILITY = 'enquiry_admin_section_visibility'
const LOCAL_KEY_FAQS = 'enquiry_admin_faqs'
const LOCAL_KEY_WHY_CHOOSE = 'enquiry_admin_why_choose'
const LOCAL_KEY_REVIEWS = 'enquiry_admin_reviews'
const LOCAL_KEY_TRUSTED_BY = 'enquiry_admin_trusted_partners'
const LOCAL_KEY_POPULAR_PRODUCTS = 'enquiry_admin_popular_products'

const defaultPopularProducts = [
  {
    id: 13,
    slug: 'chaat-masala',
    name: 'Chaat Masala',
    category: 'MIX MASALA',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    pdfUrl: '',
    whatsappNumber: '+919876543210'
  },
  {
    id: 14,
    slug: 'kitchen-king-masala',
    name: 'Kitchen King Masala',
    category: 'MIX MASALA',
    image: '/garam_masala.png',
    pdfUrl: '',
    whatsappNumber: '+919876543210'
  },
  {
    id: 15,
    slug: 'pav-bhaji-masala',
    name: 'Pav Bhaji Masala',
    category: 'MIX MASALA',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    pdfUrl: '',
    whatsappNumber: '+919876543210'
  },
  {
    id: 16,
    slug: 'biryani-masala',
    name: 'Biryani Masala',
    category: 'MIX MASALA',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    pdfUrl: '',
    whatsappNumber: '+919876543210'
  },
  {
    id: 1,
    slug: 'garam-masala',
    name: 'Garam Masala',
    category: 'PURE SPICES',
    image: '/garam_masala.png',
    pdfUrl: '',
    whatsappNumber: '+919876543210'
  }
]

const defaultTrustedByPartners = [
  'Reliance Retail',
  'Big Basket',
  'D-Mart',
  'Amazon Fresh',
  'Flipkart',
  'Jiomart',
  'Blinkit',
  'Zepto',
  'Swiggy Instamart'
]

// Embedded System Settings view (no extra external page file needed)
const SystemSettingsView = ({ storeSettings, setStoreSettings, showToast }) => {
  const [settingsForm, setSettingsForm] = useState(() => {
    try {
      const saved = localStorage.getItem('enquiry_admin_system_settings')
      return saved
        ? JSON.parse(saved)
        : {
            storeName: storeSettings?.storeName || 'QuickEnquiry',
            currency: storeSettings?.currency || 'INR (₹)',
            supportEmail: storeSettings?.supportEmail || 'support@quick-enquiry.co',
            supportPhone: storeSettings?.supportPhone || '+91 9876543210',
            timezone: 'Asia/Kolkata (IST)',
            emailAlerts: true,
            whatsappAlerts: true,
            soundAlerts: false,
            itemsPerPage: '10',
            showOutOfStock: true,
            allowQuoteRequests: true
          }
    } catch {
      return {
        storeName: 'QuickEnquiry',
        currency: 'INR (₹)',
        supportEmail: 'support@quick-enquiry.co',
        supportPhone: '+91 9876543210',
        timezone: 'Asia/Kolkata (IST)',
        emailAlerts: true,
        whatsappAlerts: true,
        soundAlerts: false,
        itemsPerPage: '10',
        showOutOfStock: true,
        allowQuoteRequests: true
      }
    }
  })

  const handleSettingChange = (field, value) => {
    setSettingsForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    try {
      localStorage.setItem('enquiry_admin_system_settings', JSON.stringify(settingsForm))
    } catch {}
    const updatedStore = {
      ...storeSettings,
      storeName: settingsForm.storeName,
      currency: settingsForm.currency,
      supportEmail: settingsForm.supportEmail,
      supportPhone: settingsForm.supportPhone
    }
    setStoreSettings(updatedStore)
    try {
      localStorage.setItem(LOCAL_KEY_SETTINGS, JSON.stringify(updatedStore))
    } catch {}
    apiService.updateSettings(updatedStore)
    window.dispatchEvent(new Event('storage'))
    showToast('System settings saved & synchronized successfully!')
  }

  const handleExportBackup = () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        systemSettings: settingsForm,
        storeSettings: JSON.parse(localStorage.getItem(LOCAL_KEY_SETTINGS) || '{}'),
        products: JSON.parse(localStorage.getItem(LOCAL_KEY_PRODUCTS) || '[]'),
        heroSlides: JSON.parse(localStorage.getItem(LOCAL_KEY_HERO) || '[]'),
        enquiries: JSON.parse(localStorage.getItem('enquiry_admin_customer_enquiries') || '[]')
      }
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `quickenquiry_system_backup_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('System configuration backup downloaded!')
    } catch {
      showToast('Export failed', 'warning')
    }
  }

  const handleClearCache = () => {
    window.dispatchEvent(new Event('storage'))
    showToast('Browser cache refreshed and synchronized!')
  }

  return (
    <div className="admin-homepage-settings" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Card */}
      <div className="admin-card">
        <div className="admin-card-header" style={{ marginBottom: 0, borderBottom: 'none', flexWrap: 'wrap', gap: '16px' }}>
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
              <FiSettings size={22} />
            </div>
            <div>
              <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 className="card-title">System & Platform Settings</h2>
                <span className="live-count-badge" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE' }}>
                  Live System Config
                </span>
              </div>
              <p className="card-subtitle" style={{ margin: '4px 0 0 0' }}>
                Manage store configurations, currency, automated enquiry notifications, catalog preferences, and backup tools.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClearCache}
              style={{ fontSize: '0.84rem', padding: '9px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <FiRefreshCw size={15} /> Sync Cache
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
              style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5', fontSize: '0.84rem', padding: '9px 20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <FiSave size={16} /> Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Grid */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeft: '4px solid #4F46E5' }}>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
            <FiDollarSign size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Active Currency</span>
            <span className="kpi-value">{settingsForm.currency.split(' ')[0]}</span>
            <span className="kpi-meta" style={{ color: '#4F46E5' }}>Default store denomination</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #059669' }}>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
            <FiBell size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Lead Alerts</span>
            <span className="kpi-value">{settingsForm.emailAlerts && settingsForm.whatsappAlerts ? 'Full Active' : 'Partial'}</span>
            <span className="kpi-meta" style={{ color: '#059669' }}>Email & WhatsApp ready</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #D97706' }}>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <FiGlobe size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Timezone & Locale</span>
            <span className="kpi-value" style={{ fontSize: '1.05rem' }}>Asia/Kolkata</span>
            <span className="kpi-meta" style={{ color: '#D97706' }}>IST (UTC+05:30)</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #0284C7' }}>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
            <FiShield size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Data State</span>
            <span className="kpi-value">Connected</span>
            <span className="kpi-meta" style={{ color: '#0284C7' }}>MongoDB Synced</span>
          </div>
        </div>
      </div>

      {/* 3. General Store & Regional Settings */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
              <FiGlobe size={20} />
            </div>
            <div>
              <h2 className="card-title">General Platform & Regional Formats</h2>
              <p className="card-subtitle">Default branding and display parameters used across storefront.</p>
            </div>
          </div>
        </div>

        <div className="form-grid" style={{ marginBottom: '16px' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Store / Platform Name</label>
            <input
              type="text"
              className="form-input"
              value={settingsForm.storeName}
              onChange={(e) => handleSettingChange('storeName', e.target.value)}
              placeholder="QuickEnquiry"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Store Currency</label>
            <select
              className="form-input"
              value={settingsForm.currency}
              onChange={(e) => handleSettingChange('currency', e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="INR (₹)">INR - Indian Rupee (₹)</option>
              <option value="USD ($)">USD - US Dollar ($)</option>
              <option value="EUR (€)">EUR - Euro (€)</option>
              <option value="GBP (£)">GBP - British Pound (£)</option>
              <option value="AED (د.إ)">AED - UAE Dirham (د.إ)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Support Notification Email</label>
            <input
              type="email"
              className="form-input"
              value={settingsForm.supportEmail}
              onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
              placeholder="support@quick-enquiry.co"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Support Phone / Helpline</label>
            <input
              type="text"
              className="form-input"
              value={settingsForm.supportPhone}
              onChange={(e) => handleSettingChange('supportPhone', e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>
        </div>
      </div>

      {/* 4. Automated Lead & Notification Preferences */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
              <FiBell size={20} />
            </div>
            <div>
              <h2 className="card-title">Enquiry & Lead Alert Channels</h2>
              <p className="card-subtitle">Choose how you want to be notified when a customer submits an enquiry or quote request.</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>Instant Email Notification</div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Send an instant copy of every customer enquiry to the support email address.</div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settingsForm.emailAlerts}
                onChange={(e) => handleSettingChange('emailAlerts', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>WhatsApp Lead Forwarding</div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Enable quick one-click WhatsApp response link on all new enquiries.</div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settingsForm.whatsappAlerts}
                onChange={(e) => handleSettingChange('whatsappAlerts', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>Allow Out-of-Stock Enquiries</div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Allow buyers to enquire about products that are currently marked out of stock.</div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settingsForm.showOutOfStock}
                onChange={(e) => handleSettingChange('showOutOfStock', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* 5. Backup & Data Tools */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <FiDatabase size={20} />
            </div>
            <div>
              <h2 className="card-title">Data Maintenance & Backup Tools</h2>
              <p className="card-subtitle">Export your store configuration or force a clean sync with the cloud database.</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleExportBackup}
            style={{ fontSize: '0.85rem', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FiDownload size={15} /> Export Configuration Backup (JSON)
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClearCache}
            style={{ fontSize: '0.85rem', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FiRefreshCw size={15} /> Refresh LocalStorage Cache
          </button>
        </div>
      </div>
    </div>
  )
}

const AdminPage = () => {
  const { admin } = useAdminAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const location = useLocation()
  const navigate = useNavigate()

  // Requirement: Super Admin must NEVER see normal admin panel/dashboard
  useEffect(() => {
    if (admin && admin.role === 'SUPER_ADMIN') {
      navigate('/admin/manage-admins', { replace: true })
    }
  }, [admin, navigate])

  if (admin && admin.role === 'SUPER_ADMIN') {
    return null
  }

  const isBlogCreate = location.pathname === '/admin/blogs/create'
  const isBlogEdit = location.pathname.startsWith('/admin/blogs/edit')
  const isBlogSubPage = isBlogCreate || isBlogEdit

  // 1. URL search param (?tab=...) is the primary source of truth,
  // falling back to localStorage or 'overview'
  const tabFromUrl = searchParams.get('tab')
  const activeTab = isBlogSubPage
    ? 'blog'
    : (tabFromUrl && VALID_ADMIN_TABS.includes(tabFromUrl))
    ? tabFromUrl
    : (() => {
        try {
          const savedTab = localStorage.getItem(LOCAL_KEY_ACTIVE_TAB)
          if (savedTab && VALID_ADMIN_TABS.includes(savedTab)) {
            return savedTab
          }
        } catch {
          // ignore
        }
        return 'overview'
      })()

  // Tab changer handler: updates URL search params and localStorage cleanly without ping-pong
  const setActiveTab = useCallback(
    (newTabOrFn) => {
      const targetTab = typeof newTabOrFn === 'function' ? newTabOrFn(activeTab) : newTabOrFn
      if (!VALID_ADMIN_TABS.includes(targetTab)) return

      try {
        localStorage.setItem(LOCAL_KEY_ACTIVE_TAB, targetTab)
      } catch {
        // ignore
      }

      if (location.pathname.startsWith('/admin/blogs')) {
        navigate(`/admin?tab=${targetTab}`)
      } else {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev)
            next.set('tab', targetTab)
            return next
          },
          { replace: true }
        )
      }
    },
    [activeTab, location.pathname, navigate, setSearchParams]
  )

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem(LOCAL_KEY_SIDEBAR_COLLAPSED) === 'true'
    } catch {
      return false
    }
  })
  const [searchFilter, setSearchFilter] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL')
  const [toast, setToast] = useState(null)

  // Persist sidebar collapsed state
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY_SIDEBAR_COLLAPSED, String(isCollapsed))
    } catch {
      // ignore
    }
  }, [isCollapsed])

  // Synchronize URL search params and localStorage if URL ?tab= is missing or invalid
  useEffect(() => {
    if (isBlogSubPage) return

    const currentUrlTab = searchParams.get('tab')
    if (currentUrlTab !== activeTab) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('tab', activeTab)
          return next
        },
        { replace: true }
      )
    }
    try {
      localStorage.setItem(LOCAL_KEY_ACTIVE_TAB, activeTab)
    } catch {
      // ignore
    }
  }, [activeTab, isBlogSubPage, searchParams, setSearchParams])

  // Always scroll window to top whenever activeTab changes so user starts at the top of content
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [activeTab])

  // 1. Hero Slides State with LocalStorage persistence
  const [heroSlides, setHeroSlides] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_HERO)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
      return defaultHeroImages
    } catch {
      return defaultHeroImages
    }
  })

  // 2. Products State with LocalStorage persistence
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_PRODUCTS)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
      return defaultProducts
    } catch {
      return defaultProducts
    }
  })

  // 3. FAQs State with LocalStorage persistence
  const [faqs, setFaqs] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_FAQS)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
      return defaultFaqs
    } catch {
      return defaultFaqs
    }
  })

  // 4. Why Choose Us Features State with LocalStorage persistence
  const [whyChooseList, setWhyChooseList] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_WHY_CHOOSE)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
      return defaultWhyChoose
    } catch {
      return defaultWhyChoose
    }
  })

  // 5. Customer Reviews State with LocalStorage persistence
  const [reviewsList, setReviewsList] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_REVIEWS)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
      return defaultReviews
    } catch {
      return defaultReviews
    }
  })

  // 6. Trusted By Retail Partners State with LocalStorage persistence
  const [trustedByPartners, setTrustedByPartners] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_TRUSTED_BY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
      return defaultTrustedByPartners
    } catch {
      return defaultTrustedByPartners
    }
  })

  // 7. Popular Products Coverflow State with LocalStorage persistence
  const [popularProducts, setPopularProducts] = useState(() => {
    try {
      const savedSettings = localStorage.getItem('enquiry_admin_store_settings')
      const isBeauty = savedSettings && JSON.parse(savedSettings).activeHomepage === 'home2'
      if (isBeauty) {
        const savedBeauty = localStorage.getItem('enquiry_admin_popular_products_beauty')
        if (savedBeauty) {
          const parsed = JSON.parse(savedBeauty)
          if (Array.isArray(parsed)) return parsed
        }
      }
      const saved = localStorage.getItem(LOCAL_KEY_POPULAR_PRODUCTS)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
      return defaultPopularProducts
    } catch {
      return defaultPopularProducts
    }
  })

  // 8. General Store Settings State
  const defaultStoreSettingsObj = {
    activeHomepage: 'home1',
    topbarBgColor: '#E0F2FE',
    topbarTextColor: '#1E293B',
    announcementText: 'Free Shipping on orders over ₹499 | Premium Stone Ground Spices',
    whatsappNumber: '+91 9876543210',
    whatsappLinkType: 'number',
    whatsappCustomUrl: '',
    contactEmail: 'info@enquirybrand.com',
    tagline: '100% Organic & Stone Ground Spices',
    logoType: 'icon',
    logoText: 'QuickEnquiry',
    logoUrl: '',
    logoIconColor: '#86d2a3',
    faqSubtitle: 'COMMON QUESTIONS',
    faqTitle: 'Frequently asked questions.',
    faqContactPrompt: "Can't find what you're looking for?",
    faqContactBtnText: 'Contact support',
    homeAboutSubtitle: '— WHO WE ARE',
    homeAboutTitle: 'About Our Company',
    homeAboutDesc1:
      'Established in 2012, we have grown from a small local business into a trusted national brand. Our commitment to quality, innovation, and customer satisfaction has made us the preferred choice for thousands of customers across the country.',
    homeAboutDesc2:
      'Every product in our catalogue is carefully selected and quality-checked to ensure it meets our high standards. We believe that great products and great service go hand in hand.',
    homeAboutImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    homeAboutBadge1Number: '12+',
    homeAboutBadge1Label: 'YEARS ESTABLISHED',
    homeAboutBadge2Number: '35+',
    homeAboutBadge2Label: 'TEAM MEMBERS',
    homeAboutBtnText: 'About More',
    homeAboutBtnLink: '/about-company',
    whyChooseTag: '• WHY CHOOSE US •',
    whyChooseTitle: 'Why Choose Us',
    whyChooseSubtitle: 'Our Commitment to Quality, Purity & Customer Satisfaction',
    reviewTag: '— CUSTOMER LOVE',
    reviewTitle: 'What They Say About Us',
    trustedByLabel: 'TRUSTED BY',
    trustedByPartners: defaultTrustedByPartners
  }

  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_SETTINGS)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return { ...defaultStoreSettingsObj, ...parsed }
        }
      }
      return defaultStoreSettingsObj
    } catch {
      return defaultStoreSettingsObj
    }
  })

  // 9. Section Visibility Toggles State
  const defaultVisibilityObj = {
    heroSlider: true,
    trustedBy: true,
    featuredProducts: true,
    whyChoose: true,
    reviews: true,
    faq: true,
    blogs: true
  }

  const [sectionVisibility, setSectionVisibility] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_VISIBILITY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === 'object') {
          return { ...defaultVisibilityObj, ...parsed }
        }
      }
      return defaultVisibilityObj
    } catch {
      return defaultVisibilityObj
    }
  })

  // Fetch initial data from MongoDB API if available
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const dbProducts = await apiService.getProducts()
        if (dbProducts && Array.isArray(dbProducts)) {
          setProducts(dbProducts)
        }
        const dbSettings = await apiService.getSettings()
        if (dbSettings) {
          const currentActiveHome = dbSettings.activeHomepage || 'home1'
          setStoreSettings((prev) => ({
            ...prev,
            ...dbSettings,
            activeHomepage: currentActiveHome
          }))
          if (dbSettings.faqs && Array.isArray(dbSettings.faqs) && dbSettings.faqs.length > 0) {
            setFaqs(dbSettings.faqs)
          }
          if (dbSettings.whyChooseFeatures && Array.isArray(dbSettings.whyChooseFeatures) && dbSettings.whyChooseFeatures.length > 0) {
            setWhyChooseList(dbSettings.whyChooseFeatures)
          }
          if (dbSettings.reviewsList && Array.isArray(dbSettings.reviewsList) && dbSettings.reviewsList.length > 0) {
            setReviewsList(dbSettings.reviewsList)
          }
          if (dbSettings.trustedByPartners && Array.isArray(dbSettings.trustedByPartners) && dbSettings.trustedByPartners.length > 0) {
            setTrustedByPartners(dbSettings.trustedByPartners)
          }
          if (currentActiveHome === 'home2') {
            if (dbSettings.popularProductsListBeauty && Array.isArray(dbSettings.popularProductsListBeauty) && dbSettings.popularProductsListBeauty.length > 0) {
              setPopularProducts(dbSettings.popularProductsListBeauty)
            }
          } else if (dbSettings.popularProductsList && Array.isArray(dbSettings.popularProductsList) && dbSettings.popularProductsList.length > 0) {
            setPopularProducts(dbSettings.popularProductsList)
          }
        }
      } catch (err) {
        console.warn('[AdminPage] MongoDB API sync fallback to local storage:', err.message)
      }
    }
    fetchBackendData()

    const handleProductsUpdated = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setProducts(e.detail)
      }
    }
    window.addEventListener('enquiry_products_updated', handleProductsUpdated)
    return () => {
      window.removeEventListener('enquiry_products_updated', handleProductsUpdated)
    }
  }, [])

  // Save updates to localStorage on change & sync CSS Root variables
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY_HERO, JSON.stringify(heroSlides))
    } catch (e) {
      console.warn('[AdminPage] Storage quota exceeded for heroSlides:', e.message)
    }
  }, [heroSlides])

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY_PRODUCTS, JSON.stringify(products))
      window.dispatchEvent(new Event('storage'))
    } catch (err) {
      console.warn('[AdminPage] Storage quota exceeded for products:', err.message)
      try {
        const lightProducts = (products || []).map((p) => {
          if (p && p.image && String(p.image).length > 2000) {
            return { ...p, image: '' }
          }
          return p
        })
        localStorage.setItem(LOCAL_KEY_PRODUCTS, JSON.stringify(lightProducts))
        window.dispatchEvent(new Event('storage'))
      } catch {
        try { localStorage.removeItem(LOCAL_KEY_PRODUCTS) } catch {}
      }
    }
  }, [products])

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY_SETTINGS, JSON.stringify(storeSettings))
      window.dispatchEvent(new Event('storage'))
    } catch (e) {
      console.warn('[AdminPage] Storage quota exceeded for storeSettings:', e.message)
    }
    if (storeSettings.topbarBgColor) {
      document.documentElement.style.setProperty('--bg-topbar', storeSettings.topbarBgColor)
    }
    if (storeSettings.topbarTextColor) {
      document.documentElement.style.setProperty('--topbar-text-color', storeSettings.topbarTextColor)
    }
  }, [storeSettings])

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY_VISIBILITY, JSON.stringify(sectionVisibility))
    } catch (e) {
      console.warn('[AdminPage] Storage quota exceeded for sectionVisibility:', e.message)
    }
  }, [sectionVisibility])

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY_FAQS, JSON.stringify(faqs))
      window.dispatchEvent(new Event('storage'))
    } catch (e) {
      console.warn('[AdminPage] Storage quota exceeded for faqs:', e.message)
    }
  }, [faqs])

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY_WHY_CHOOSE, JSON.stringify(whyChooseList))
      window.dispatchEvent(new Event('storage'))
    } catch (e) {
      console.warn('[AdminPage] Storage quota exceeded for whyChooseList:', e.message)
    }
  }, [whyChooseList])

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY_REVIEWS, JSON.stringify(reviewsList))
      window.dispatchEvent(new Event('storage'))
    } catch (e) {
      console.warn('[AdminPage] Storage quota exceeded for reviewsList:', e.message)
    }
  }, [reviewsList])

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY_TRUSTED_BY, JSON.stringify(trustedByPartners))
      window.dispatchEvent(new Event('storage'))
    } catch (e) {
      console.warn('[AdminPage] Storage quota exceeded for trustedByPartners:', e.message)
    }
  }, [trustedByPartners])

  // Toast notification helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3200)
  }, [])

  // In Stock count calculation (safely guarded)
  const inStockCount = Array.isArray(products)
    ? products.filter((p) => p && (p.availability === 'In Stock' || p.availability === true)).length
    : 0

  return (
    <div className="admin-container">
      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onSelectAllProducts={() => setProductCategoryFilter('ALL')}
      />

      {/* Main Content Dashboard Wrapper */}
      <div className={`admin-main-wrapper ${isCollapsed ? 'collapsed' : ''}`}>
        <AdminHeader
          activeTab={activeTab}
          setIsOpen={setIsSidebarOpen}
          showToast={showToast}
        />

        <main className="admin-content">
          {activeTab === 'overview' && (
            <DashboardOverview
              setActiveTab={setActiveTab}
              heroSlides={heroSlides}
              products={products}
            />
          )}

          {activeTab === 'homepage' && (
            <HomepageSettings
              heroSlides={heroSlides}
              setHeroSlides={setHeroSlides}
              storeSettings={storeSettings}
              setStoreSettings={setStoreSettings}
              sectionVisibility={sectionVisibility}
              setSectionVisibility={setSectionVisibility}
              faqs={faqs}
              setFaqs={setFaqs}
              whyChooseList={whyChooseList}
              setWhyChooseList={setWhyChooseList}
              reviewsList={reviewsList}
              setReviewsList={setReviewsList}
              trustedByPartners={trustedByPartners}
              setTrustedByPartners={setTrustedByPartners}
              popularProducts={popularProducts}
              setPopularProducts={setPopularProducts}
              showToast={showToast}
            />
          )}

          {activeTab === 'blog' && (
            isBlogSubPage ? (
              <BlogEditorPage showToast={showToast} />
            ) : (
              <BlogManagement showToast={showToast} />
            )
          )}

          {activeTab === 'footer' && (
            <FooterSettings
              storeSettings={storeSettings}
              setStoreSettings={setStoreSettings}
              showToast={showToast}
            />
          )}

          {activeTab === 'company' && (
            <CompanySettings
              storeSettings={storeSettings}
              setStoreSettings={setStoreSettings}
              showToast={showToast}
            />
          )}

          {activeTab === 'product' && (
            <ProductManagement
              products={products}
              setProducts={setProducts}
              showToast={showToast}
              globalSearch={searchFilter}
              selectedCategoryProp={productCategoryFilter}
              onCategoryChange={setProductCategoryFilter}
            />
          )}

          {activeTab === 'category' && (
            <CategoryManagement
              products={products}
              setProducts={setProducts}
              setActiveTab={setActiveTab}
              showToast={showToast}
              onViewCategoryProducts={(catName) => {
                setProductCategoryFilter(catName)
                setActiveTab('product')
              }}
            />
          )}

          {activeTab === 'enquiry' && (
            <EnquiryManagement
              showToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <SystemSettingsView
              storeSettings={storeSettings}
              setStoreSettings={setStoreSettings}
              showToast={showToast}
            />
          )}

          {activeTab === 'smtp' && (
            <SmtpSettings
              storeSettings={storeSettings}
              setStoreSettings={setStoreSettings}
              showToast={showToast}
            />
          )}

          {activeTab === 'cloudinary' && (
            <CloudinarySettings
              storeSettings={storeSettings}
              setStoreSettings={setStoreSettings}
              showToast={showToast}
            />
          )}

          {activeTab === 'whatsapp' && (
            <WhatsAppSettings
              storeSettings={storeSettings}
              setStoreSettings={setStoreSettings}
              showToast={showToast}
            />
          )}

          {activeTab === 'manage-admins' && (
            <AdminUserManagement
              showToast={showToast}
              currentAdmin={admin}
            />
          )}
        </main>
      </div>

      {/* Toast Notification Banner */}
      {toast && (
        <div
          className="admin-toast"
          style={{
            background:
              toast.type === 'warning'
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'linear-gradient(135deg, #10b981, #059669)'
          }}
        >
          {toast.type === 'warning' ? (
            <FiAlertCircle size={20} />
          ) : (
            <FiCheckCircle size={20} />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AdminPortal Error Caught]:', error, errorInfo)
  }

  handleReset = () => {
    try {
      localStorage.removeItem('enquiry_admin_active_tab')
      localStorage.removeItem('enquiry_admin_sidebar_collapsed')
      localStorage.removeItem('enquiry_admin_hero_slides')
      localStorage.removeItem('enquiry_admin_products')
      localStorage.removeItem('enquiry_admin_store_settings')
      localStorage.removeItem('enquiry_admin_section_visibility')
      localStorage.removeItem('enquiry_admin_faqs')
      localStorage.removeItem('enquiry_admin_why_choose')
      localStorage.removeItem('enquiry_admin_reviews')
      localStorage.removeItem('enquiry_admin_trusted_partners')
      localStorage.removeItem('enquiry_admin_popular_products')
      localStorage.removeItem('enquiry_admin_popular_products_beauty')
      localStorage.removeItem('enquiry_admin_customer_enquiries')
    } catch (e) {
      console.warn('Error clearing admin storage cache:', e)
    }
    window.location.href = '/admin?tab=overview'
  }

  render() {
    if (this.state.hasError) {
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
              maxWidth: '540px',
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '36px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.08)',
              textAlign: 'center',
              border: '1px solid #E8E2D8'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                color: '#EF4444',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '20px'
              }}
            >
              ⚠️
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#1E293B', marginBottom: '10px' }}>
              Admin Portal Recovery
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '22px' }}>
              A cached browser setting or component state prevented the admin portal from rendering. Click below to clear invalid admin local storage cache and reload cleanly.
            </p>
            {this.state.error?.message && (
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '0.82rem',
                  color: '#DC2626',
                  fontFamily: 'Consolas, monospace',
                  textAlign: 'left',
                  marginBottom: '24px',
                  overflowX: 'auto',
                  wordBreak: 'break-all'
                }}
              >
                {this.state.error.message}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  backgroundColor: '#6366F1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 24px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
                }}
              >
                Reset Admin Cache & Reload
              </button>
              <a
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#F1F5F9',
                  color: '#334155',
                  borderRadius: '10px',
                  padding: '12px 22px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textDecoration: 'none'
                }}
              >
                Go to Website
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const AdminPageWithErrorBoundary = (props) => (
  <AdminErrorBoundary>
    <AdminPage {...props} />
  </AdminErrorBoundary>
)

export default React.memo(AdminPageWithErrorBoundary)

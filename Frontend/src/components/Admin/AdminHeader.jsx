import React, { useState, useRef, useEffect } from 'react'
import {
  FiMenu,
  FiPackage,
  FiSliders,
  FiGrid,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiExternalLink,
  FiShield,
  FiTag,
  FiLayout,
  FiBriefcase,
  FiSettings,
  FiMail,
  FiCloud,
  FiBookOpen
} from 'react-icons/fi'
import { FaCommentDots, FaWhatsapp } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

const AdminHeader = ({ activeTab, setIsOpen, showToast }) => {
  const { admin, logout } = useAdminAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      if (showToast) showToast('Logged out of Admin Portal successfully!')
    } catch (e) {
      console.error('Logout error:', e)
    } finally {
      setIsProfileOpen(false)
      navigate('/admin/login', { replace: true })
    }
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'homepage':
        return {
          title: 'Homepage Settings',
          subtitle: 'Customize hero banners, topbar header colors, and section visibility.',
          icon: <FiSliders size={20} color="#4F46E5" />,
          accentColor: '#4F46E5'
        }
      case 'blog':
        return {
          title: 'Blog Management',
          subtitle: 'Create, edit, and organize articles and insights for your storefront.',
          icon: <FiBookOpen size={20} color="#4F46E5" />,
          accentColor: '#4F46E5'
        }
      case 'footer':
        return {
          title: 'Footer Settings',
          subtitle: 'Customize footer brand story, social profiles, navigation columns, and certifications.',
          icon: <FiLayout size={20} color="#059669" />,
          accentColor: '#059669'
        }
      case 'company':
        return {
          title: 'Company Settings',
          subtitle: 'Manage company profile, contact details, and organization branding.',
          icon: <FiBriefcase size={20} color="#D97706" />,
          accentColor: '#D97706'
        }
      case 'product':
        return {
          title: 'Product Management',
          subtitle: 'Manage catalog items, stock status, categories, and inventory details.',
          icon: <FiPackage size={20} color="#0284C7" />,
          accentColor: '#0284C7'
        }
      case 'category':
        return {
          title: 'Category Management',
          subtitle: 'Organize store departments, catalog groupings, and storefront filters.',
          icon: <FiTag size={20} color="#0D9488" />,
          accentColor: '#0D9488'
        }
      case 'enquiry':
        return {
          title: 'Customer Enquiries & Leads',
          subtitle: 'Track incoming product quote requests, bulk orders, and buyer contact leads.',
          icon: <FaCommentDots size={20} color="#EA580C" />,
          accentColor: '#EA580C'
        }
      case 'settings':
        return {
          title: 'System & Platform Settings',
          subtitle: 'Configure store preferences, currency, alerts, and data maintenance.',
          icon: <FiSettings size={20} color="#6366F1" />,
          accentColor: '#6366F1'
        }
      case 'smtp':
        return {
          title: 'SMTP & Email Configuration',
          subtitle: 'Configure mail server credentials, sender identity, security protocols, and email notifications.',
          icon: <FiMail size={20} color="#7C3AED" />,
          accentColor: '#7C3AED'
        }
      case 'cloudinary':
        return {
          title: 'Cloudinary Media Configuration',
          subtitle: 'Configure Cloud Name, API Key, and Secret from the frontend to manage media asset uploads dynamically.',
          icon: <FiCloud size={20} color="#0284C7" />,
          accentColor: '#0284C7'
        }
      case 'whatsapp':
        return {
          title: 'WhatsApp Settings & Redirection',
          subtitle: 'Configure your support WhatsApp phone number, custom enquiry greeting, and floating website widget.',
          icon: <FaWhatsapp size={20} color="#25D366" />,
          accentColor: '#25D366'
        }
      case 'manage-admins':
        return {
          title: 'Admin Management',
          subtitle: 'Manage administrative accounts, role privileges, and security permissions.',
          icon: <FiShield size={20} color="#8B5CF6" />,
          accentColor: '#8B5CF6'
        }
      case 'overview':
      default:
        return {
          title: 'Dashboard Overview',
          subtitle: 'Welcome to your Enquiry website real-time control center.',
          icon: <FiGrid size={20} color="#2563EB" />,
          accentColor: '#2563EB'
        }
    }
  }

  const { title, subtitle, icon, accentColor } = getTabTitle()

  return (
    <header className="admin-header">
      <div className="header-left">
        <button
          className="mobile-sidebar-toggle"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle Navigation"
        >
          <FiMenu size={20} />
        </button>

        <div className="header-title-box">
          <div className="header-icon-glow" style={{ borderColor: `${accentColor}33`, backgroundColor: `${accentColor}12` }}>
            {icon}
          </div>
          <div>
            <h1 className="header-page-title">{title}</h1>
            <p className="header-subtitle">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: PROFILE & LOGOUT CONTROLS */}
      <div className="header-right-profile" ref={dropdownRef}>
        <button
          type="button"
          className="admin-profile-pill"
          onClick={() => setIsProfileOpen((prev) => !prev)}
          title="Account Profile & Settings"
        >
          <div className="admin-avatar-box">
            <span className="avatar-initials">
              {admin?.name
                ? admin.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'AD'}
            </span>
            <span className="online-indicator"></span>
          </div>
          <div className="admin-profile-info">
            <span className="admin-name">{admin?.name || 'Admin User'}</span>
            <span className="admin-role">
              {admin?.role === 'SUPER_ADMIN'
                ? 'Super Admin'
                : admin?.role === 'ADMIN'
                ? 'Admin'
                : 'Editor'}
            </span>
          </div>
          <FiChevronDown
            size={16}
            className={`chevron-icon ${isProfileOpen ? 'rotate' : ''}`}
          />
        </button>

        {/* PROFILE DROPDOWN POPOVER MENU */}
        {isProfileOpen && (
          <div className="profile-dropdown-menu">
            <div className="dropdown-user-header">
              <div className="dropdown-avatar-large">
                <FiUser size={22} color="#6366F1" />
              </div>
              <div>
                <div className="dropdown-user-name">{admin?.name || 'Store Administrator'}</div>
                <div className="dropdown-user-email">{admin?.email || 'admin@quick-enquiry.com'}</div>
                <span className="dropdown-badge">
                  <FiShield size={12} color="#34D399" /> {admin?.role || 'Authenticated'}
                </span>
              </div>
            </div>

            <div className="dropdown-divider"></div>

            <Link
              to="/"
              className="dropdown-menu-item"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsProfileOpen(false)}
            >
              <FiExternalLink size={16} color="#38BDF8" />
              <span>View Live Storefront</span>
            </Link>

            <div className="dropdown-divider"></div>

            <button type="button" className="dropdown-menu-item logout" onClick={handleLogout}>
              <FiLogOut size={16} color="#EF4444" />
              <span>Logout Account</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default React.memo(AdminHeader)

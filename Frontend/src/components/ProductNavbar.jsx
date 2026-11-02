import React, { useState, useEffect } from 'react'
import { LayoutGrid, MessageSquareMore, User, Menu, X } from 'lucide-react'
import { FaCommentDots } from 'react-icons/fa'
import { FiSearch } from 'react-icons/fi'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEnquiryModal } from '../context/EnquiryModalContext'

const ProductNavbar = () => {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { openEnquiryModal } = useEnquiryModal()

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('enquiry_admin_store_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          logoType: parsed.logoType || 'icon',
          logoText: parsed.logoText || 'QuickEnquiry',
          logoUrl: parsed.logoUrl || '',
          logoIconColor: parsed.logoIconColor || ''
        }
      }
    } catch {
      // ignore
    }
    return { logoType: 'icon', logoText: 'QuickEnquiry', logoUrl: '', logoIconColor: '' }
  }

  const [navSettings, setNavSettings] = useState(loadSettings)

  useEffect(() => {
    const handleStorage = () => {
      setNavSettings(loadSettings())
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About Company', path: '/about-company' },
    { name: 'Enquiry', path: '#' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact Us', path: '/contact' }
  ]

  const isLinkActive = (item) => {
    if (item.path === '/') return location.pathname === '/'
    if (item.path === '#') return false
    return location.pathname === item.path || location.pathname.startsWith(item.path)
  }

  const handleCategoriesClick = () => {
    alert('Categories dropdown clicked')
  }

  const handleEnquiryClick = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    openEnquiryModal()
    try {
      window.dispatchEvent(new CustomEvent('open_enquiry_modal'))
    } catch {}
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate('/product')
    }
  }

  return (
    <header className="product-navbar-wrapper" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <div className="product-navbar-bar">
        
        {/* Left: Home Navbar Logo (QuickEnquiry) - Desktop Only */}
        <div className="product-nav-logo desktop-only">
          <Link to="/" className="logo-link">
            {navSettings.logoUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={navSettings.logoUrl}
                  alt={navSettings.logoText || 'QuickEnquiry'}
                  className="topbar-logo-img"
                  style={{ maxHeight: '38px', objectFit: 'contain' }}
                />
                {navSettings.logoText && (
                  <span className="logo-text">{navSettings.logoText}</span>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="logo-graphics">
                  <FaCommentDots className="logo-icon" />
                </div>
                <span className="logo-text">{navSettings.logoText || 'QuickEnquiry'}</span>
              </div>
            )}
          </Link>
        </div>
        
        {/* Categories Glass Pill Button (Desktop) / Category Icon Only (Mobile) */}
        <div className="product-nav-categories-wrapper">
          <button 
            type="button" 
            className="product-nav-categories-btn desktop-only"
            onClick={handleCategoriesClick}
          >
            <LayoutGrid size={18} className="categories-grid-icon" />
            <span>Categories</span>
          </button>

          {/* Mobile Left: Category Icon Only */}
          <button 
            type="button" 
            className="mobile-categories-btn mobile-only" 
            onClick={handleCategoriesClick}
            aria-label="Categories"
          >
            <LayoutGrid size={20} />
          </button>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="product-nav-menu desktop-only">
          {navItems.map((item, index) => (
            <React.Fragment key={item.name}>
              <Link
                to={item.path}
                className={`product-nav-link ${isLinkActive(item) ? 'active' : ''}`}
                onClick={(e) => {
                  if (item.path === '#') e.preventDefault()
                  if (item.name === 'Enquiry') {
                    openEnquiryModal()
                  }
                }}
              >
                {item.name}
              </Link>
              {index < navItems.length - 1 && (
                <span className="product-nav-divider">|</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Right Section: Profile Icon, Send Enquiry Button (Desktop) & Search Bar + Mobile Hamburger Toggle */}
        <div className="product-nav-actions">
          <button type="button" className="product-nav-profile-btn desktop-only" aria-label="User Profile">
            <User size={20} className="profile-icon" />
          </button>

          <button 
            type="button" 
            className="product-nav-enquiry-btn desktop-only"
            onClick={handleEnquiryClick}
          >
            <MessageSquareMore size={16} className="enquiry-icon" />
            <span>Send Enquiry</span>
          </button>

          {/* Search Bar (Mobile Right) */}
          <form className="mobile-nav-search-form mobile-only" onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              className="mobile-nav-search-input" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="mobile-nav-search-btn" aria-label="Search">
              <FiSearch size={16} />
            </button>
          </form>

          {/* Hamburger Menu Button (Mobile Only) */}
          <button
            type="button"
            className="product-mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Mobile Navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="product-mobile-drawer">
          <nav className="product-mobile-menu">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`product-mobile-link ${isLinkActive(item) ? 'active' : ''}`}
                onClick={(e) => {
                  if (item.path === '#' || item.name === 'Enquiry') {
                    e.preventDefault()
                    handleEnquiryClick(e)
                  }
                  setMobileMenuOpen(false)
                }}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div style={{ padding: '12px 16px' }}>
            <button
              type="button"
              className="product-nav-enquiry-btn"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={(e) => {
                setMobileMenuOpen(false)
                handleEnquiryClick(e)
              }}
            >
              <MessageSquareMore size={16} className="enquiry-icon" />
              <span>Send Enquiry</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

export default ProductNavbar

import React, { useState } from 'react'
import {
  FiLayout,
  FiSave,
  FiRotateCcw,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiCheck,
  FiX,
  FiArrowRight,
  FiShield,
  FiPhone,
  FiMail,
  FiMapPin,
  FiGlobe,
  FiLink
} from 'react-icons/fi'
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaLeaf
} from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { apiService } from '../../api/apiService'

const defaultFooterState = {
  footerBrandName: 'QuickEnquiry',
  footerBrandDesc:
    'Dedicated to pure customer service since 2012. Our commitment is quality and innovation.',
  footerLearnBtnText: 'Learn More',
  footerLearnBtnLink: '/about-company',
  footerSocialFacebook: 'https://facebook.com',
  footerSocialTwitter: 'https://twitter.com',
  footerSocialInstagram: 'https://instagram.com',
  footerSocialLinkedin: 'https://linkedin.com',
  footerSocialYoutube: 'https://youtube.com',
  footerCol1Title: 'CATEGORY',
  footerCol1Links: [
    { label: 'Edible Oils', url: '#category' },
    { label: 'Mix Masala', url: '#category' },
    { label: 'Soya Chunks', url: '#category' },
    { label: 'Pure Spices', url: '#category' }
  ],
  footerCol2Title: 'OTHER LINKS',
  footerCol2Links: [
    { label: 'Help & Support', url: '#links' },
    { label: 'Blog & Articles', url: '#links' },
    { label: 'Privacy Policy', url: '#links' },
    { label: "T&C's", url: '#links' }
  ],
  footerShowBadges: true,
  footerBadge1Text: 'ISO 22000',
  footerBadge2Text: 'fssai',
  footerBadge3Sub: 'Appoint Distributors',
  footerBadge3Main: 'TRUSTED PARTNER',
  footerConnectTitle: 'CONNECT WITH US',
  footerPhone: '+91 9876543210',
  footerEmail: 'info@quick-enquiry.co',
  footerAddress: 'Suite 300, London, UK',
  footerCopyright:
    '©2025 QuickEnquiry. London, UK. All materials are protected. Crafted with ♡ by Appoint Distributors.'
}

const FooterSettings = ({ storeSettings, setStoreSettings, showToast }) => {
  const [formData, setFormData] = useState(() => ({
    footerBrandName: storeSettings.footerBrandName || defaultFooterState.footerBrandName,
    footerBrandDesc: storeSettings.footerBrandDesc || defaultFooterState.footerBrandDesc,
    footerLearnBtnText: storeSettings.footerLearnBtnText || defaultFooterState.footerLearnBtnText,
    footerLearnBtnLink: storeSettings.footerLearnBtnLink || defaultFooterState.footerLearnBtnLink,
    footerSocialFacebook: storeSettings.footerSocialFacebook || defaultFooterState.footerSocialFacebook,
    footerSocialTwitter: storeSettings.footerSocialTwitter || defaultFooterState.footerSocialTwitter,
    footerSocialInstagram: storeSettings.footerSocialInstagram || defaultFooterState.footerSocialInstagram,
    footerSocialLinkedin: storeSettings.footerSocialLinkedin || defaultFooterState.footerSocialLinkedin,
    footerSocialYoutube: storeSettings.footerSocialYoutube || defaultFooterState.footerSocialYoutube,
    footerCol1Title: storeSettings.footerCol1Title || defaultFooterState.footerCol1Title,
    footerCol1Links: Array.isArray(storeSettings.footerCol1Links) && storeSettings.footerCol1Links.length > 0
      ? storeSettings.footerCol1Links
      : defaultFooterState.footerCol1Links,
    footerCol2Title: storeSettings.footerCol2Title || defaultFooterState.footerCol2Title,
    footerCol2Links: Array.isArray(storeSettings.footerCol2Links) && storeSettings.footerCol2Links.length > 0
      ? storeSettings.footerCol2Links
      : defaultFooterState.footerCol2Links,
    footerShowBadges: storeSettings.footerShowBadges !== false,
    footerBadge1Text: storeSettings.footerBadge1Text || defaultFooterState.footerBadge1Text,
    footerBadge2Text: storeSettings.footerBadge2Text || defaultFooterState.footerBadge2Text,
    footerBadge3Sub: storeSettings.footerBadge3Sub || defaultFooterState.footerBadge3Sub,
    footerBadge3Main: storeSettings.footerBadge3Main || defaultFooterState.footerBadge3Main,
    footerConnectTitle: storeSettings.footerConnectTitle || defaultFooterState.footerConnectTitle,
    footerPhone: storeSettings.footerPhone || defaultFooterState.footerPhone,
    footerEmail: storeSettings.footerEmail || defaultFooterState.footerEmail,
    footerAddress: storeSettings.footerAddress || defaultFooterState.footerAddress,
    footerCopyright: storeSettings.footerCopyright || defaultFooterState.footerCopyright
  }))

  // Temporary inputs for adding links
  const [newCol1Label, setNewCol1Label] = useState('')
  const [newCol1Url, setNewCol1Url] = useState('#category')
  const [newCol2Label, setNewCol2Label] = useState('')
  const [newCol2Url, setNewCol2Url] = useState('#links')

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Column 1 Link Handlers
  const handleAddCol1Link = (e) => {
    e.preventDefault()
    if (!newCol1Label.trim()) return
    const updated = [...formData.footerCol1Links, { label: newCol1Label.trim(), url: newCol1Url.trim() || '#' }]
    setFormData((prev) => ({ ...prev, footerCol1Links: updated }))
    setNewCol1Label('')
    setNewCol1Url('#category')
    showToast('Added category link')
  }

  const handleRemoveCol1Link = (index) => {
    const updated = formData.footerCol1Links.filter((_, idx) => idx !== index)
    setFormData((prev) => ({ ...prev, footerCol1Links: updated }))
    showToast('Removed link')
  }

  // Column 2 Link Handlers
  const handleAddCol2Link = (e) => {
    e.preventDefault()
    if (!newCol2Label.trim()) return
    const updated = [...formData.footerCol2Links, { label: newCol2Label.trim(), url: newCol2Url.trim() || '#' }]
    setFormData((prev) => ({ ...prev, footerCol2Links: updated }))
    setNewCol2Label('')
    setNewCol2Url('#links')
    showToast('Added navigation link')
  }

  const handleRemoveCol2Link = (index) => {
    const updated = formData.footerCol2Links.filter((_, idx) => idx !== index)
    setFormData((prev) => ({ ...prev, footerCol2Links: updated }))
    showToast('Removed link')
  }

  // Reset to default
  const handleResetDefaults = () => {
    if (window.confirm('Reset all footer settings and links to defaults?')) {
      setFormData(defaultFooterState)
      showToast('Reset footer settings to defaults!')
    }
  }

  // Save all footer settings
  const handleSaveFooter = () => {
    try {
      const updatedSettings = {
        ...storeSettings,
        ...formData
      }
      setStoreSettings(updatedSettings)
      localStorage.setItem('enquiry_admin_store_settings', JSON.stringify(updatedSettings))
      localStorage.setItem('enquiry_admin_footer_settings', JSON.stringify(formData))
      apiService.updateSettings(updatedSettings)
      window.dispatchEvent(new Event('storage'))
      showToast('Footer settings saved and synced successfully!')
    } catch (err) {
      showToast('Failed to save footer settings', 'warning')
    }
  }

  return (
    <div className="admin-homepage-settings">
      {/* 1. TOP HEADER BANNER CARD */}
      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <div className="admin-card-header" style={{ marginBottom: 0, borderBottom: 'none', flexWrap: 'wrap', gap: '16px' }}>
          <div className="card-title-group">
            <div
              className="card-title-icon-wrapper"
              style={{
                backgroundColor: '#ECFDF5',
                color: '#059669',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)'
              }}
            >
              <FiLayout className="card-title-icon" size={22} />
            </div>
            <div>
              <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 className="card-title" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  Footer Settings & Customization
                </h2>
                <span
                  className="live-count-badge"
                  style={{
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    border: '1px solid #A7F3D0',
                    fontWeight: 700
                  }}
                >
                  Live Storefront Footer
                </span>
                <span
                  style={{
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid #BFDBFE'
                  }}
                >
                  Dark Theme (#0F172A)
                </span>
              </div>
              <p className="card-subtitle" style={{ margin: '4px 0 0 0', maxWidth: '680px' }}>
                Configure footer branding, story description, category links, navigation links, certification badges, and customer support channels.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetDefaults}
              style={{
                fontSize: '0.84rem',
                padding: '9px 16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FiRotateCcw size={15} /> Reset Defaults
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveFooter}
              style={{
                backgroundColor: '#059669',
                borderColor: '#059669',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                fontSize: '0.84rem',
                padding: '9px 20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FiSave size={16} /> Save Footer Settings
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS & QUICK-JUMP KPI METRICS */}
      <div className="kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="kpi-card" style={{ borderLeft: '4px solid #059669' }}>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
            <FiGlobe size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Brand & Story</span>
            <span className="kpi-value">{formData.footerBrandName || 'Brand'}</span>
            <span className="kpi-meta" style={{ color: '#059669' }}>5 Social profiles linked</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #16A34A' }}>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
            <FiLayout size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">{formData.footerCol1Title || 'Category'}</span>
            <span className="kpi-value">{formData.footerCol1Links?.length || 0} Links</span>
            <span className="kpi-meta" style={{ color: '#16A34A' }}>Product department tags</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #2563EB' }}>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
            <FiLink size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">{formData.footerCol2Title || 'Navigation'}</span>
            <span className="kpi-value">{formData.footerCol2Links?.length || 0} Links</span>
            <span className="kpi-meta" style={{ color: '#2563EB' }}>Company & policy pages</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #D97706' }}>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <FiShield size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Trust Badges</span>
            <span className="kpi-value">{formData.footerShowBadges ? 'Active' : 'Hidden'}</span>
            <span className="kpi-meta" style={{ color: '#D97706' }}>ISO 22000, FSSAI certified</span>
          </div>
        </div>
      </div>

      {/* 1. BRANDING & ABOUT COLUMN CARD */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header">
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
              <FiGlobe size={20} />
            </div>
            <div>
              <h2 className="card-title">Brand & About Column</h2>
              <p className="card-subtitle">
                Customize the left-most footer section containing brand name, brief story, call-to-action button, and social profiles.
              </p>
            </div>
          </div>
        </div>

        <div className="form-grid" style={{ marginBottom: '16px' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Brand Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.footerBrandName}
              onChange={(e) => handleChange('footerBrandName', e.target.value)}
              placeholder="e.g. QuickEnquiry"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>"Learn More" Button Text & Link</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-input"
                style={{ width: '40%' }}
                value={formData.footerLearnBtnText}
                onChange={(e) => handleChange('footerLearnBtnText', e.target.value)}
                placeholder="Button Text"
              />
              <input
                type="text"
                className="form-input"
                style={{ width: '60%' }}
                value={formData.footerLearnBtnLink}
                onChange={(e) => handleChange('footerLearnBtnLink', e.target.value)}
                placeholder="/about-company"
              />
            </div>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label" style={{ fontWeight: 600 }}>Brand Story / Description</label>
          <textarea
            rows={2}
            className="form-textarea"
            style={{ minHeight: '60px', resize: 'vertical' }}
            value={formData.footerBrandDesc}
            onChange={(e) => handleChange('footerBrandDesc', e.target.value)}
            placeholder="Dedicated to pure customer service since 2012..."
          />
        </div>

        {/* Social Media Links */}
        <label className="form-label" style={{ fontWeight: 700, marginBottom: '10px' }}>
          Social Media Profile URLs
        </label>
        <div className="form-grid" style={{ gap: '12px' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem', color: '#64748B' }}>Facebook URL</label>
            <input
              type="url"
              className="form-input"
              value={formData.footerSocialFacebook}
              onChange={(e) => handleChange('footerSocialFacebook', e.target.value)}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem', color: '#64748B' }}>X (Twitter) URL</label>
            <input
              type="url"
              className="form-input"
              value={formData.footerSocialTwitter}
              onChange={(e) => handleChange('footerSocialTwitter', e.target.value)}
              placeholder="https://x.com/..."
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem', color: '#64748B' }}>Instagram URL</label>
            <input
              type="url"
              className="form-input"
              value={formData.footerSocialInstagram}
              onChange={(e) => handleChange('footerSocialInstagram', e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem', color: '#64748B' }}>LinkedIn URL</label>
            <input
              type="url"
              className="form-input"
              value={formData.footerSocialLinkedin}
              onChange={(e) => handleChange('footerSocialLinkedin', e.target.value)}
              placeholder="https://linkedin.com/..."
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem', color: '#64748B' }}>YouTube URL</label>
            <input
              type="url"
              className="form-input"
              value={formData.footerSocialYoutube}
              onChange={(e) => handleChange('footerSocialYoutube', e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION LINK COLUMNS CARD */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header">
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
              <FiLayout size={20} />
            </div>
            <div>
              <h2 className="card-title">Category & Navigation Links</h2>
              <p className="card-subtitle">
                Manage the link columns displayed in the center of the footer. Add, remove, or modify links.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Column 1: CATEGORY */}
          <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontWeight: 700 }}>Column 1 Heading</label>
              <input
                type="text"
                className="form-input"
                value={formData.footerCol1Title}
                onChange={(e) => handleChange('footerCol1Title', e.target.value)}
                placeholder="CATEGORY"
              />
            </div>

            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', color: '#475569' }}>
              Links ({formData.footerCol1Links.length})
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {formData.footerCol1Links.map((link, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>{link.label}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginLeft: '8px' }}>{link.url}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-icon delete"
                    onClick={() => handleRemoveCol1Link(idx)}
                    title="Remove link"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Col 1 */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, padding: '6px 10px', fontSize: '0.82rem' }}
                value={newCol1Label}
                onChange={(e) => setNewCol1Label(e.target.value)}
                placeholder="Link text (e.g. Masala)"
              />
              <input
                type="text"
                className="form-input"
                style={{ width: '90px', padding: '6px 10px', fontSize: '0.82rem' }}
                value={newCol1Url}
                onChange={(e) => setNewCol1Url(e.target.value)}
                placeholder="#url"
              />
              <button
                type="button"
                className="btn-primary"
                onClick={handleAddCol1Link}
                style={{ padding: '6px 12px', fontSize: '0.82rem', backgroundColor: '#16A34A', borderColor: '#16A34A' }}
              >
                <FiPlus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Column 2: OTHER LINKS */}
          <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontWeight: 700 }}>Column 2 Heading</label>
              <input
                type="text"
                className="form-input"
                value={formData.footerCol2Title}
                onChange={(e) => handleChange('footerCol2Title', e.target.value)}
                placeholder="OTHER LINKS"
              />
            </div>

            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', color: '#475569' }}>
              Links ({formData.footerCol2Links.length})
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {formData.footerCol2Links.map((link, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>{link.label}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginLeft: '8px' }}>{link.url}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-icon delete"
                    onClick={() => handleRemoveCol2Link(idx)}
                    title="Remove link"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Col 2 */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, padding: '6px 10px', fontSize: '0.82rem' }}
                value={newCol2Label}
                onChange={(e) => setNewCol2Label(e.target.value)}
                placeholder="Link text (e.g. Terms)"
              />
              <input
                type="text"
                className="form-input"
                style={{ width: '90px', padding: '6px 10px', fontSize: '0.82rem' }}
                value={newCol2Url}
                onChange={(e) => setNewCol2Url(e.target.value)}
                placeholder="#url"
              />
              <button
                type="button"
                className="btn-primary"
                onClick={handleAddCol2Link}
                style={{ padding: '6px 12px', fontSize: '0.82rem', backgroundColor: '#16A34A', borderColor: '#16A34A' }}
              >
                <FiPlus size={14} /> Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. QUALITY CERTIFICATIONS & TRUST BADGES CARD */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header">
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <FiShield size={20} />
            </div>
            <div>
              <h2 className="card-title">Quality Certifications & Trust Badges</h2>
              <p className="card-subtitle">
                Customize the ISO, FSSAI, and Trusted Partner certification pill badges in the footer.
              </p>
            </div>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={formData.footerShowBadges}
              onChange={(e) => handleChange('footerShowBadges', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        {formData.footerShowBadges && (
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Badge 1 (ISO Emblem)</label>
              <input
                type="text"
                className="form-input"
                value={formData.footerBadge1Text}
                onChange={(e) => handleChange('footerBadge1Text', e.target.value)}
                placeholder="ISO 22000"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Badge 2 (FSSAI Tag)</label>
              <input
                type="text"
                className="form-input"
                value={formData.footerBadge2Text}
                onChange={(e) => handleChange('footerBadge2Text', e.target.value)}
                placeholder="fssai"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Badge 3 Subtext & Main Title</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  value={formData.footerBadge3Sub}
                  onChange={(e) => handleChange('footerBadge3Sub', e.target.value)}
                  placeholder="Appoint Distributors"
                  style={{ width: '50%' }}
                />
                <input
                  type="text"
                  className="form-input"
                  value={formData.footerBadge3Main}
                  onChange={(e) => handleChange('footerBadge3Main', e.target.value)}
                  placeholder="TRUSTED PARTNER"
                  style={{ width: '50%' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. CONNECT WITH US / CONTACT & COPYRIGHT CARD */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header">
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
              <FiPhone size={20} />
            </div>
            <div>
              <h2 className="card-title">Contact Information & Copyright</h2>
              <p className="card-subtitle">
                Update phone, email, headquarters address, and bottom copyright notice.
              </p>
            </div>
          </div>
        </div>

        <div className="form-grid" style={{ marginBottom: '16px' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Column 4 Heading</label>
            <input
              type="text"
              className="form-input"
              value={formData.footerConnectTitle}
              onChange={(e) => handleChange('footerConnectTitle', e.target.value)}
              placeholder="CONNECT WITH US"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Customer Support Phone</label>
            <input
              type="text"
              className="form-input"
              value={formData.footerPhone}
              onChange={(e) => handleChange('footerPhone', e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Official Email Address</label>
            <input
              type="email"
              className="form-input"
              value={formData.footerEmail}
              onChange={(e) => handleChange('footerEmail', e.target.value)}
              placeholder="info@quick-enquiry.co"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Headquarters / City Address</label>
            <input
              type="text"
              className="form-input"
              value={formData.footerAddress}
              onChange={(e) => handleChange('footerAddress', e.target.value)}
              placeholder="Suite 300, London, UK"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Bottom Bar Copyright Text</label>
          <input
            type="text"
            className="form-input"
            value={formData.footerCopyright}
            onChange={(e) => handleChange('footerCopyright', e.target.value)}
            placeholder="©2025 QuickEnquiry. All rights reserved."
          />
        </div>
      </div>

      {/* 5. LIVE STOREFRONT FOOTER PREVIEW (Matching user's screenshot exactly!) */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header">
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ backgroundColor: '#F1F5F9', color: '#0F172A' }}>
              <FiLayout size={20} />
            </div>
            <div>
              <h2 className="card-title">Live Storefront Footer Preview</h2>
              <p className="card-subtitle">
                Real-time visual reflection of the dark mode footer as seen by customers on the live storefront.
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: '16px',
            padding: '36px 28px 24px 28px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
            border: '1px solid #1E293B'
          }}
        >
          {/* Main 4 Columns Preview */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '28px',
              marginBottom: '32px'
            }}
          >
            {/* Col 1: Brand & Desc */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF'
                  }}
                >
                  <FiGlobe size={18} />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {formData.footerBrandName}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                {formData.footerBrandDesc}
              </p>
              <button
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'transparent',
                  border: '1.5px solid #10B981',
                  color: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '6px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
              >
                {formData.footerLearnBtnText} <FiArrowRight size={13} color="#10B981" />
              </button>

              {/* Social Icons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                  <FaFacebookF size={12} />
                </span>
                <span style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                  <FaXTwitter size={12} />
                </span>
                <span style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                  <FaInstagram size={12} />
                </span>
                <span style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                  <FaLinkedinIn size={12} />
                </span>
                <span style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                  <FaYoutube size={12} />
                </span>
              </div>
            </div>

            {/* Col 2: CATEGORY */}
            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34D399', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px' }}>
                {formData.footerCol1Title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {formData.footerCol1Links.map((link, idx) => (
                  <li key={idx} style={{ fontSize: '0.88rem', color: '#CBD5E1' }}>
                    {link.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: OTHER LINKS */}
            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34D399', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px' }}>
                {formData.footerCol2Title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {formData.footerCol2Links.map((link, idx) => (
                  <li key={idx} style={{ fontSize: '0.88rem', color: '#CBD5E1' }}>
                    {link.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Badges & CONNECT WITH US */}
            <div>
              {formData.footerShowBadges && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {formData.footerBadge1Text && (
                    <div style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1E293B', fontSize: '0.72rem', fontWeight: 700, color: '#E2E8F0' }}>
                      {formData.footerBadge1Text}
                    </div>
                  )}
                  {formData.footerBadge2Text && (
                    <div style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1E293B', fontSize: '0.72rem', fontStyle: 'italic', fontWeight: 700, color: '#E2E8F0' }}>
                      {formData.footerBadge2Text}
                    </div>
                  )}
                  {formData.footerBadge3Main && (
                    <div style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #065F46', backgroundColor: '#064E3B', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FiShield size={12} color="#34D399" />
                      <div>
                        <div style={{ fontSize: '0.62rem', color: '#A7F3D0' }}>{formData.footerBadge3Sub}</div>
                        <div style={{ fontWeight: 800, color: '#34D399' }}>{formData.footerBadge3Main}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34D399', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
                {formData.footerConnectTitle}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: '#94A3B8' }}>
                {formData.footerPhone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaPhoneAlt size={12} color="#10B981" /> {formData.footerPhone}
                  </div>
                )}
                {formData.footerEmail && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaEnvelope size={12} color="#10B981" /> {formData.footerEmail}
                  </div>
                )}
                {formData.footerAddress && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaMapMarkerAlt size={12} color="#10B981" /> {formData.footerAddress}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Copyright Row */}
          <div
            style={{
              borderTop: '1px solid #1E293B',
              paddingTop: '16px',
              textAlign: 'center',
              fontSize: '0.78rem',
              color: '#64748B'
            }}
          >
            {formData.footerCopyright}
          </div>
        </div>
      </div>

      {/* Bottom Save Button Bar */}
      <div
        className="admin-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px'
        }}
      >
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>Ready to update storefront footer?</div>
          <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
            All changes will immediately reflect on the live website and synchronize across devices.
          </div>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={handleSaveFooter}
          style={{ padding: '10px 24px', fontSize: '0.9rem', backgroundColor: '#059669', borderColor: '#059669' }}
        >
          <FiSave size={16} /> Save All Footer Changes
        </button>
      </div>
    </div>
  )
}

export default React.memo(FooterSettings)

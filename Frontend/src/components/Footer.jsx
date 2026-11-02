import React, { useState, useEffect } from 'react'
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
import { FiMessageSquare, FiArrowRight, FiShield } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../api/apiService'

const LOCAL_KEY_FOOTER = 'enquiry_admin_footer_settings'
const LOCAL_KEY_SETTINGS = 'enquiry_admin_store_settings'

const defaultFooterData = {
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

const Footer = () => {
  const navigate = useNavigate()

  const [footerData, setFooterData] = useState(() => {
    try {
      const savedFooter = localStorage.getItem(LOCAL_KEY_FOOTER)
      if (savedFooter) {
        return { ...defaultFooterData, ...JSON.parse(savedFooter) }
      }
      const savedSettings = localStorage.getItem(LOCAL_KEY_SETTINGS)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        return { ...defaultFooterData, ...parsed }
      }
    } catch {}
    return defaultFooterData
  })

  // Real-time synchronization on storage change from Admin
  useEffect(() => {
    const handleSync = () => {
      try {
        const savedFooter = localStorage.getItem(LOCAL_KEY_FOOTER)
        if (savedFooter) {
          setFooterData((prev) => ({ ...prev, ...JSON.parse(savedFooter) }))
          return
        }
        const savedSettings = localStorage.getItem(LOCAL_KEY_SETTINGS)
        if (savedSettings) {
          setFooterData((prev) => ({ ...prev, ...JSON.parse(savedSettings) }))
        }
      } catch {}
    }
    window.addEventListener('storage', handleSync)
    return () => window.removeEventListener('storage', handleSync)
  }, [])

  // Sync with MongoDB backend API
  useEffect(() => {
    let isMounted = true
    const fetchRemote = async () => {
      try {
        const dbSettings = await apiService.getSettings()
        if (dbSettings && isMounted) {
          setFooterData((prev) => ({
            ...prev,
            ...dbSettings,
            footerCol1Links: Array.isArray(dbSettings.footerCol1Links) && dbSettings.footerCol1Links.length > 0
              ? dbSettings.footerCol1Links
              : prev.footerCol1Links,
            footerCol2Links: Array.isArray(dbSettings.footerCol2Links) && dbSettings.footerCol2Links.length > 0
              ? dbSettings.footerCol2Links
              : prev.footerCol2Links
          }))
        }
      } catch {}
    }
    fetchRemote()
    return () => {
      isMounted = false
    }
  }, [])

  const handleLearnMore = () => {
    if (footerData.footerLearnBtnLink?.startsWith('http')) {
      window.open(footerData.footerLearnBtnLink, '_blank')
    } else {
      navigate(footerData.footerLearnBtnLink || '/about-company')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <footer className="site-footer">
      <div className="footer-container">
        
        {/* Row 1: Main 4 Columns Grid */}
        <div className="footer-grid">
          
          {/* Column 1: Brand Logo, Description, Learn More Button, Social Icons */}
          <div className="footer-col footer-col-brand">
            <div className="footer-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
              <div className="footer-logo-icon">
                <FiMessageSquare size={22} color="#ffffff" />
              </div>
              <span className="footer-logo-text">
                {footerData.footerBrandName?.includes('Enquiry') ? (
                  <>
                    {footerData.footerBrandName.split('Enquiry')[0]}
                    <span className="logo-text-highlight">Enquiry</span>
                    {footerData.footerBrandName.split('Enquiry').slice(1).join('Enquiry')}
                  </>
                ) : (
                  footerData.footerBrandName || 'QuickEnquiry'
                )}
              </span>
            </div>

            <p className="footer-brand-desc">
              {footerData.footerBrandDesc}
            </p>

            <button 
              type="button" 
              className="footer-learn-btn" 
              onClick={handleLearnMore}
            >
              {footerData.footerLearnBtnText || 'Learn More'}{' '}
              <FiArrowRight size={15} className="btn-arrow" />
            </button>

            {/* Social Media Links */}
            <div className="footer-social-links">
              {footerData.footerSocialFacebook && (
                <a href={footerData.footerSocialFacebook} target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Facebook">
                  <FaFacebookF size={15} />
                </a>
              )}
              {footerData.footerSocialTwitter && (
                <a href={footerData.footerSocialTwitter} target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="X (Twitter)">
                  <FaXTwitter size={15} />
                </a>
              )}
              {footerData.footerSocialInstagram && (
                <a href={footerData.footerSocialInstagram} target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Instagram">
                  <FaInstagram size={15} />
                </a>
              )}
              {footerData.footerSocialLinkedin && (
                <a href={footerData.footerSocialLinkedin} target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="LinkedIn">
                  <FaLinkedinIn size={15} />
                </a>
              )}
              {footerData.footerSocialYoutube && (
                <a href={footerData.footerSocialYoutube} target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="YouTube">
                  <FaYoutube size={15} />
                </a>
              )}
            </div>
          </div>

          {/* Wrapper for CATEGORY & OTHER LINKS (side-by-side on mobile, contents on desktop) */}
          <div className="footer-links-row">
            {/* Column 2: CATEGORY */}
            <div className="footer-col footer-col-category">
              <h4 className="footer-col-title">{footerData.footerCol1Title || 'CATEGORY'}</h4>
              <ul className="footer-links-list">
                {(footerData.footerCol1Links || []).map((link, idx) => (
                  <li key={idx}>
                    <a href={link.url || '#category'}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: OTHER LINKS */}
            <div className="footer-col footer-col-links">
              <h4 className="footer-col-title">{footerData.footerCol2Title || 'OTHER LINKS'}</h4>
              <ul className="footer-links-list">
                {(footerData.footerCol2Links || []).map((link, idx) => (
                  <li key={idx}>
                    <a href={link.url || '#links'}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quality & Food Safety Certification Badges */}
          {footerData.footerShowBadges !== false && (
            <div className="footer-cert-badges">
              {/* ISO Emblem badge */}
              {footerData.footerBadge1Text && (
                <div className="cert-badge emblem-badge">
                  <span className="emblem-text">{footerData.footerBadge1Text}</span>
                </div>
              )}

              {/* FSSAI badge */}
              {footerData.footerBadge2Text && (
                <div className="cert-badge fssai-badge">
                  <span className="fssai-text">{footerData.footerBadge2Text}</span>
                </div>
              )}

              {/* Trusted Partner Shield */}
              {footerData.footerBadge3Main && (
                <div className="cert-badge shield-badge">
                  <FiShield size={16} className="shield-icon" />
                  <div className="shield-text">
                    <span className="shield-sub">{footerData.footerBadge3Sub}</span>
                    <span className="shield-main">{footerData.footerBadge3Main}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Column 4: CONNECT WITH US */}
          <div className="footer-col footer-col-connect">
            <h4 className="footer-col-title">{footerData.footerConnectTitle || 'CONNECT WITH US'}</h4>
            
            {/* Top Decorative Icons */}
            <div className="connect-top-icons">
              <FaLeaf size={20} className="connect-decorative-icon" />
              <span className="organic-symbol">🐾</span>
            </div>

            {/* Contact Details */}
            <div className="connect-info-list">
              {footerData.footerPhone && (
                <a href={`tel:${footerData.footerPhone.replace(/\s+/g, '')}`} className="connect-item">
                  <FaPhoneAlt size={15} className="connect-icon" />
                  <span>{footerData.footerPhone}</span>
                </a>
              )}

              {footerData.footerEmail && (
                <a href={`mailto:${footerData.footerEmail}`} className="connect-item">
                  <FaEnvelope size={15} className="connect-icon" />
                  <span>{footerData.footerEmail}</span>
                </a>
              )}

              {footerData.footerAddress && (
                <div className="connect-item">
                  <FaMapMarkerAlt size={15} className="connect-icon" />
                  <span>{footerData.footerAddress}</span>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Row 2: Bottom Bar Copyright */}
        <div className="footer-bottom-bar">
          <p className="copyright-text">
            {footerData.footerCopyright}
          </p>
        </div>

      </div>
    </footer>
  )
}

export default React.memo(Footer)


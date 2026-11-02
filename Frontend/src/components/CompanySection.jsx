import React, { useState, useEffect } from 'react'
import { apiService } from '../api/apiService'

const LOCAL_KEY_TRUSTED_BY = 'enquiry_admin_trusted_partners'
const LOCAL_KEY_SETTINGS = 'enquiry_admin_store_settings'

const CompanySection = ({ isBeauty = false, partners }) => {
  const defaultCompanies = [
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

  const beautyCompanies = [
    'Sephora',
    'Nykaa',
    'Cult Beauty',
    'Ulta Beauty',
    'Tira Beauty',
    'Tata CLiQ Palette',
    'Purplle',
    'Lookfantastic',
    'Shoppers Stop Beauty'
  ]

  // Dynamic label
  const [label, setLabel] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_SETTINGS)
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.trustedByLabel || 'TRUSTED BY'
      }
    } catch {}
    return 'TRUSTED BY'
  })

  // Dynamic company list
  const [partnerList, setPartnerList] = useState(() => {
    if (partners && partners.length > 0) return partners
    try {
      const saved = localStorage.getItem(LOCAL_KEY_TRUSTED_BY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      const savedSettings = localStorage.getItem(LOCAL_KEY_SETTINGS)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        if (Array.isArray(parsed.trustedByPartners) && parsed.trustedByPartners.length > 0) {
          return parsed.trustedByPartners
        }
      }
    } catch {}
    return isBeauty ? beautyCompanies : defaultCompanies
  })

  // Real-time synchronization with localStorage changes from Admin
  useEffect(() => {
    if (partners && partners.length > 0) return
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(LOCAL_KEY_TRUSTED_BY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPartnerList(parsed)
          }
        }
        const savedSettings = localStorage.getItem(LOCAL_KEY_SETTINGS)
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          if (parsed.trustedByLabel) {
            setLabel(parsed.trustedByLabel)
          }
          if (!saved && Array.isArray(parsed.trustedByPartners) && parsed.trustedByPartners.length > 0) {
            setPartnerList(parsed.trustedByPartners)
          }
        }
      } catch {}
    }
    window.addEventListener('storage', handleSync)
    return () => window.removeEventListener('storage', handleSync)
  }, [partners, isBeauty])

  // Sync with MongoDB backend API if available
  useEffect(() => {
    if (partners && partners.length > 0) return
    let isMounted = true
    const fetchRemoteSettings = async () => {
      try {
        const dbSettings = await apiService.getSettings()
        if (dbSettings && isMounted) {
          if (dbSettings.trustedByLabel) {
            setLabel(dbSettings.trustedByLabel)
          }
          if (Array.isArray(dbSettings.trustedByPartners) && dbSettings.trustedByPartners.length > 0) {
            setPartnerList(dbSettings.trustedByPartners)
          }
        }
      } catch {}
    }
    fetchRemoteSettings()
    return () => {
      isMounted = false
    }
  }, [partners, isBeauty])

  const companyList = partners || partnerList

  return (
    <section className="company-section">
      <div className="company-container">
        
        {/* Left Fixed Label */}
        <div className="company-label">
          <span className="label-text">{label}</span>
          <span className="label-divider"></span>
        </div>

        {/* Horizontal Scrolling Marquee Track */}
        <div className="company-marquee-wrapper">
          <div className="company-marquee-track">
            {/* First loop sequence */}
            {companyList.map((company, index) => (
              <span key={`set1-${index}`} className="company-item">
                {company}
              </span>
            ))}
            
            {/* Second identical loop sequence for seamless continuous motion */}
            {companyList.map((company, index) => (
              <span key={`set2-${index}`} className="company-item">
                {company}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

export default React.memo(CompanySection)

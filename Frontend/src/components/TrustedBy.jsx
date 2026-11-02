import React, { useState, useEffect } from 'react'
import { apiService } from '../api/apiService'

const LOCAL_KEY_TRUSTED_BY = 'enquiry_admin_trusted_partners'
const LOCAL_KEY_SETTINGS = 'enquiry_admin_store_settings'

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

const TrustedBy = () => {
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

  const [companies, setCompanies] = useState(() => {
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
    return defaultCompanies
  })

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(LOCAL_KEY_TRUSTED_BY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCompanies(parsed)
          }
        }
        const savedSettings = localStorage.getItem(LOCAL_KEY_SETTINGS)
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          if (parsed.trustedByLabel) {
            setLabel(parsed.trustedByLabel)
          }
          if (!saved && Array.isArray(parsed.trustedByPartners) && parsed.trustedByPartners.length > 0) {
            setCompanies(parsed.trustedByPartners)
          }
        }
      } catch {}
    }
    window.addEventListener('storage', handleSync)
    return () => window.removeEventListener('storage', handleSync)
  }, [])

  useEffect(() => {
    let isMounted = true
    const fetchRemote = async () => {
      try {
        const dbSettings = await apiService.getSettings()
        if (dbSettings && isMounted) {
          if (dbSettings.trustedByLabel) {
            setLabel(dbSettings.trustedByLabel)
          }
          if (Array.isArray(dbSettings.trustedByPartners) && dbSettings.trustedByPartners.length > 0) {
            setCompanies(dbSettings.trustedByPartners)
          }
        }
      } catch {}
    }
    fetchRemote()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="trusted-by-section">
      <div className="trusted-by-container">
        
        {/* Left Section Label */}
        <div className="trusted-label-box">
          <span className="trusted-title">{label}</span>
          <span className="trusted-divider"></span>
        </div>

        {/* Horizontal Scrolling Marquee Track */}
        <div className="ticker-container">
          <div className="ticker-track">
            {/* Group 1 */}
            {companies.map((name, index) => (
              <span key={`g1-${index}`} className="company-name">
                {name}
              </span>
            ))}

            {/* Group 2 (Duplicate for Seamless Loop) */}
            {companies.map((name, index) => (
              <span key={`g2-${index}`} className="company-name">
                {name}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

export default React.memo(TrustedBy)

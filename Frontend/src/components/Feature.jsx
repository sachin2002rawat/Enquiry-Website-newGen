import React, { useState, useEffect } from 'react'
import {
  Handshake,
  ClipboardCheck,
  Tag,
  Headphones,
  ShieldCheck,
  Sparkles,
  Heart,
  UserCheck,
  Award,
  Truck,
  CheckCircle,
  ThumbsUp,
  Clock
} from 'lucide-react'
import defaultFeatureData from '../WhyChoose.json'
import { apiService } from '../api/apiService'

const LOCAL_KEY_WHY_CHOOSE = 'enquiry_admin_why_choose'
const LOCAL_KEY_SETTINGS = 'enquiry_admin_store_settings'

const iconMap = {
  1: ShieldCheck,
  2: Sparkles,
  3: Heart,
  4: UserCheck,
  ShieldCheck,
  Sparkles,
  Heart,
  UserCheck,
  Handshake,
  ClipboardCheck,
  Tag,
  Headphones,
  Award,
  Truck,
  CheckCircle,
  ThumbsUp,
  Clock
}

const Feature = ({ data, isBeauty = false }) => {
  const [rotatedId, setRotatedId] = useState(null)

  // Dynamic feature cards state
  const [featureList, setFeatureList] = useState(() => {
    if (data && data.length > 0) return data
    try {
      const saved = localStorage.getItem(LOCAL_KEY_WHY_CHOOSE)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      const savedSettings = localStorage.getItem(LOCAL_KEY_SETTINGS)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        if (Array.isArray(parsed.whyChooseFeatures) && parsed.whyChooseFeatures.length > 0) {
          return parsed.whyChooseFeatures
        }
      }
      return defaultFeatureData
    } catch {
      return defaultFeatureData
    }
  })

  // Dynamic header titles
  const [meta, setMeta] = useState(() => {
    try {
      const savedSettings = localStorage.getItem(LOCAL_KEY_SETTINGS)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        return {
          tag: parsed.whyChooseTag || '• WHY CHOOSE US •',
          title: parsed.whyChooseTitle || 'Why Choose Us',
          subtitle:
            parsed.whyChooseSubtitle ||
            (isBeauty
              ? 'Our Commitment to Your Perfect Beauty Experience'
              : 'Our Commitment to Quality, Purity & Customer Satisfaction')
        }
      }
    } catch {}
    return {
      tag: '• WHY CHOOSE US •',
      title: 'Why Choose Us',
      subtitle: isBeauty
        ? 'Our Commitment to Your Perfect Beauty Experience'
        : 'Our Commitment to Quality, Purity & Customer Satisfaction'
    }
  })

  // Real-time synchronization with localStorage changes from Admin
  useEffect(() => {
    if (data && data.length > 0) return
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(LOCAL_KEY_WHY_CHOOSE)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFeatureList(parsed)
          }
        }
        const savedSettings = localStorage.getItem(LOCAL_KEY_SETTINGS)
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          if (!saved && Array.isArray(parsed.whyChooseFeatures) && parsed.whyChooseFeatures.length > 0) {
            setFeatureList(parsed.whyChooseFeatures)
          }
          setMeta({
            tag: parsed.whyChooseTag || '• WHY CHOOSE US •',
            title: parsed.whyChooseTitle || 'Why Choose Us',
            subtitle:
              parsed.whyChooseSubtitle ||
              (isBeauty
                ? 'Our Commitment to Your Perfect Beauty Experience'
                : 'Our Commitment to Quality, Purity & Customer Satisfaction')
          })
        }
      } catch {}
    }
    window.addEventListener('storage', handleSync)
    return () => window.removeEventListener('storage', handleSync)
  }, [data, isBeauty])

  // Sync with MongoDB backend if available
  useEffect(() => {
    if (data && data.length > 0) return
    let isMounted = true
    const fetchRemoteSettings = async () => {
      try {
        const dbSettings = await apiService.getSettings()
        if (dbSettings && isMounted) {
          if (Array.isArray(dbSettings.whyChooseFeatures) && dbSettings.whyChooseFeatures.length > 0) {
            setFeatureList(dbSettings.whyChooseFeatures)
          }
          setMeta({
            tag: dbSettings.whyChooseTag || '• WHY CHOOSE US •',
            title: dbSettings.whyChooseTitle || 'Why Choose Us',
            subtitle:
              dbSettings.whyChooseSubtitle ||
              (isBeauty
                ? 'Our Commitment to Your Perfect Beauty Experience'
                : 'Our Commitment to Quality, Purity & Customer Satisfaction')
          })
        }
      } catch {}
    }
    fetchRemoteSettings()
    return () => {
      isMounted = false
    }
  }, [data, isBeauty])

  const activeDataset = data && data.length > 0 ? data : featureList

  const handleCardClick = (id) => {
    setRotatedId((prev) => (prev === id ? null : id))
  }

  const resolveIcon = (item) => {
    if (item.icon && iconMap[item.icon]) return iconMap[item.icon]
    if (item.id && iconMap[item.id]) return iconMap[item.id]
    return Handshake
  }

  return (
    <section className="why-choose-section">
      <div className="why-choose-container">
        
        {/* Header Section */}
        <div className="why-choose-header">
          <span className="why-choose-tag">{meta.tag}</span>
          <h2 className="why-choose-title">{meta.title}</h2>
          <p className="why-choose-subtitle">
            {meta.subtitle}
          </p>
        </div>

        {/* Dynamic Layout: 4 Modern Floating Cards Grid for isBeauty vs Standard Single Capsule Frame */}
        {isBeauty ? (
          <div className="beauty-why-choose-grid">
            {activeDataset.map((item, index) => {
              const IconComponent = resolveIcon(item)
              const isRotated = rotatedId === item.id

              return (
                <div 
                  key={item.id} 
                  className={`beauty-feature-card ${isRotated ? 'is-rotated-30' : ''}`}
                  onClick={() => handleCardClick(item.id)}
                  style={{ cursor: 'pointer', animationDelay: `${index * 0.12}s` }}
                >
                  <div className="beauty-feature-card-shine"></div>
                  <span className="beauty-card-index">0{index + 1}</span>

                  <div className="feature-icon-wrapper">
                    <div className="feature-icon-circle">
                      <IconComponent size={28} className="feature-lucide-icon" />
                    </div>
                  </div>

                  <h3 className="feature-item-title">{item.title}</h3>
                  <div className="feature-item-dash"></div>
                  <p className="feature-item-desc">{item.description}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="why-choose-capsule-frame">
            {activeDataset.map((item, index) => {
              const IconComponent = resolveIcon(item)
              const isRotated = rotatedId === item.id

              return (
                <React.Fragment key={item.id}>
                  <div 
                    className={`why-choose-item ${isRotated ? 'is-rotated-30' : ''}`}
                    onClick={() => handleCardClick(item.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="feature-icon-wrapper">
                      <div className="feature-icon-circle">
                        <IconComponent size={32} className="feature-lucide-icon" />
                      </div>
                    </div>
                    <h3 className="feature-item-title">{item.title}</h3>
                    <div className="feature-item-dash"></div>
                    <p className="feature-item-desc">{item.description}</p>
                  </div>

                  {index < activeDataset.length - 1 && (
                    <div className="why-choose-divider"></div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        )}

      </div>
    </section>
  )
}

export default React.memo(Feature)

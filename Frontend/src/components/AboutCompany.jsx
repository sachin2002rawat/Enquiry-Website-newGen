import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Users, Sparkles } from 'lucide-react'
import { FiArrowRight } from 'react-icons/fi'
import { apiService } from '../api/apiService'
import { useActiveHomepage } from '../hooks/useActiveHomepage'

const LOCAL_KEY_SETTINGS = 'enquiry_admin_store_settings'

const AboutCompany = ({
  isBeauty = false,
  image,
  title,
  subtitle = '— WHO WE ARE',
  description1,
  description2,
  badge1Number,
  badge1Label,
  badge2Number,
  badge2Label
}) => {
  const navigate = useNavigate()
  const activeHomepage = useActiveHomepage()
  const isBeautyEffective = isBeauty || activeHomepage === 'home2'

  // Real-time synchronization with Admin Homepage Settings
  const [adminSettings, setAdminSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_SETTINGS)
      if (saved) return JSON.parse(saved)
    } catch {}
    return {}
  })

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(LOCAL_KEY_SETTINGS)
        if (saved) setAdminSettings(JSON.parse(saved))
      } catch {}
    }
    window.addEventListener('storage', handleSync)
    window.addEventListener('homepageChanged', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('homepageChanged', handleSync)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const fetchRemote = async () => {
      try {
        const dbSettings = await apiService.getSettings()
        if (dbSettings && isMounted) {
          setAdminSettings((prev) => ({ ...prev, ...dbSettings }))
        }
      } catch {}
    }
    fetchRemote()
    return () => {
      isMounted = false
    }
  }, [])

  // Beauty defaults vs Standard defaults
  const defaultImage = isBeautyEffective
    ? 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'

  const defaultDesc1 = isBeautyEffective
    ? 'Established in 2012, we are dedicated to crafting dermatologically-tested, organic, and cruelty-free skincare, haircare, and cosmetic solutions. Our commitment to pure ingredients, innovative formulations, and radiant skin health has made us a trusted beauty choice for thousands.'
    : 'Established in 2012, we have grown from a small local business into a trusted national brand. Our commitment to quality, innovation, and customer satisfaction has made us the preferred choice for thousands of customers across the country.'

  const defaultDesc2 = isBeautyEffective
    ? 'Every serum, hydrating gel, and botanical elixir in our collection is carefully formulated with clean, active ingredients to nourish your skin, enhance natural glow, and elevate your daily self-care ritual.'
    : 'Every product in our catalogue is carefully selected and quality-checked to ensure it meets our high standards. We believe that great products and great service go hand in hand.'

  // Dynamic values with priority: props -> admin settings for active theme -> standard/beauty defaults
  const activeImage = image || (isBeautyEffective
    ? (adminSettings.homeAboutImageBeauty || defaultImage)
    : (adminSettings.homeAboutImage || defaultImage))

  const activeSubtitle =
    subtitle !== '— WHO WE ARE'
      ? subtitle
      : (isBeautyEffective
          ? (adminSettings.homeAboutSubtitleBeauty || '— WHO WE ARE')
          : (adminSettings.homeAboutSubtitle || '— WHO WE ARE'))

  const activeTitle = title || (isBeautyEffective
    ? (adminSettings.homeAboutTitleBeauty || 'About Our Beauty Care')
    : (adminSettings.homeAboutTitle || 'About Our Company'))

  const activeDesc1 = description1 || (isBeautyEffective
    ? (adminSettings.homeAboutDesc1Beauty || defaultDesc1)
    : (adminSettings.homeAboutDesc1 || defaultDesc1))

  const activeDesc2 = description2 || (isBeautyEffective
    ? (adminSettings.homeAboutDesc2Beauty || defaultDesc2)
    : (adminSettings.homeAboutDesc2 || defaultDesc2))

  const b1Number = badge1Number || (isBeautyEffective
    ? (adminSettings.homeAboutBadge1NumberBeauty || '12+')
    : (adminSettings.homeAboutBadge1Number || '12+'))

  const b1Label = badge1Label || (isBeautyEffective
    ? (adminSettings.homeAboutBadge1LabelBeauty || 'YEARS IN BEAUTY')
    : (adminSettings.homeAboutBadge1Label || 'YEARS ESTABLISHED'))

  const b2Number = badge2Number || (isBeautyEffective
    ? (adminSettings.homeAboutBadge2NumberBeauty || '100%')
    : (adminSettings.homeAboutBadge2Number || '35+'))

  const b2Label = badge2Label || (isBeautyEffective
    ? (adminSettings.homeAboutBadge2LabelBeauty || 'CRUELTY FREE & VEGAN')
    : (adminSettings.homeAboutBadge2Label || 'TEAM MEMBERS'))

  const btnText = isBeautyEffective
    ? (adminSettings.homeAboutBtnTextBeauty || 'About More')
    : (adminSettings.homeAboutBtnText || 'About More')

  const btnLink = isBeautyEffective
    ? (adminSettings.homeAboutBtnLinkBeauty || '/about-company')
    : (adminSettings.homeAboutBtnLink || '/about-company')

  const handleAboutMore = () => {
    navigate(btnLink)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderTitle = () => {
    if (activeTitle) {
      if (activeTitle.includes('Beauty Care')) {
        const parts = activeTitle.split('Beauty Care')
        return (
          <h2 className="about-title">
            {parts[0]}<span className="about-title-blue">Beauty Care</span>{parts[1]}
          </h2>
        )
      }
      if (activeTitle.includes('Company')) {
        const parts = activeTitle.split('Company')
        return (
          <h2 className="about-title">
            {parts[0]}<span className="about-title-blue">Company</span>{parts[1]}
          </h2>
        )
      }
      return <h2 className="about-title">{activeTitle}</h2>
    }
    return (
      <h2 className="about-title">
        About Our <span className="about-title-blue">{isBeautyEffective ? 'Beauty Care' : 'Company'}</span>
      </h2>
    )
  }

  return (
    <section className="about-company-section">
      {/* Soft background light flare beam overlay */}
      <div className="about-light-flare"></div>

      <div className="about-company-container">
        
        {/* Left Column: Team Image with Glassmorphism Overlay Cards */}
        <div className="about-image-column">
          <div className="about-image-card">
            
            {/* Main Image */}
            <img 
              src={activeImage} 
              alt={isBeautyEffective ? 'Our Beauty Brand Journey' : 'Our Company Journey'} 
              className="about-main-img"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = defaultImage
              }}
            />

            {/* Top-Left Glassmorphism Badge */}
            <div className="glass-badge badge-top-left">
              <div className="glass-icon-wrapper">
                <Award size={20} className="glass-icon" />
              </div>
              <div className="glass-badge-text">
                <span className="glass-badge-number">{b1Number}</span>
                <span className="glass-badge-label">{b1Label}</span>
              </div>
            </div>

            {/* Bottom-Right Glassmorphism Badge */}
            <div className="glass-badge badge-bottom-right">
              <div className="glass-icon-wrapper">
                {isBeautyEffective ? <Sparkles size={20} className="glass-icon" /> : <Users size={20} className="glass-icon" />}
              </div>
              <div className="glass-badge-text">
                <span className="glass-badge-number">{b2Number}</span>
                <span className="glass-badge-label">{b2Label}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Text Content & CTA */}
        <div className="about-content-column">
          
          <span className="about-subtitle-tag">{activeSubtitle}</span>
          
          {renderTitle()}

          <p className="about-description">
            {activeDesc1}
          </p>

          <p className="about-description">
            {activeDesc2}
          </p>

          {/* CTA Button */}
          <button 
            type="button" 
            className="about-cta-btn" 
            onClick={handleAboutMore}
          >
            {btnText} <FiArrowRight size={16} className="btn-arrow" />
          </button>

        </div>

      </div>

      {/* Decorative Sparkle Icon Accent in Bottom Right */}
      <div className="about-decorative-star">✦</div>
    </section>
  )
}

export default React.memo(AboutCompany)

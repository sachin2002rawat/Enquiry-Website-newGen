import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Target, Eye, Star, CheckCircle2, ShieldCheck, Lightbulb, Heart, BarChart3 } from 'lucide-react'
import { FiArrowRight, FiChevronDown } from 'react-icons/fi'
import ProductNavbar from '../components/ProductNavbar'
import Footer from '../components/Footer'
import ScrollReveal from '../components/ScrollReveal'
import { useEnquiryModal } from '../context/EnquiryModalContext'
import { apiService } from '../api/apiService'
import './AboutEnquiryCompany.css'

const AboutEnquiryCompany = () => {
  const { openEnquiryModal } = useEnquiryModal()

  // Helper to load store/company settings from localStorage
  const loadCompanySettings = () => {
    try {
      const saved = localStorage.getItem('enquiry_admin_store_settings')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // fallback
    }
    return {}
  }

  const [companySettings, setCompanySettings] = useState(loadCompanySettings)

  useEffect(() => {
    const fetchDBSettings = async () => {
      try {
        const dbSettings = await apiService.getSettings()
        if (dbSettings) {
          setCompanySettings((prev) => ({ ...prev, ...dbSettings }))
        }
      } catch (err) {
        // fallback
      }
    }
    fetchDBSettings()

    const handleStorageChange = () => {
      setCompanySettings(loadCompanySettings())
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <div className="about-page-wrapper">
      {/* Top Navbar */}
      <ProductNavbar />

      {/* 1. Hero Section (Light Cream Theme) */}
      <ScrollReveal variant="up">
        <section className="about-hero-clean">
        {/* Glow light accents */}
        <div className="about-glow-flare-1"></div>
        <div className="about-glow-flare-2"></div>

        <div className="about-hero-clean-container">
          
          {/* Top Pill Badge */}
          <div className="about-clean-badge">
            <span className="badge-dot"></span>
            <span>{companySettings.aboutBadge || 'ABOUT QUICKENQUIRY'}</span>
          </div>

          {/* Main Headline */}
          <h1 className="about-clean-title">
            {companySettings.aboutTitle ? (
              companySettings.aboutTitle
            ) : (
              <>
                Empowering Businesses with <br />
                <span className="gradient-text">Seamless Product Enquiry & Trade</span>
              </>
            )}
          </h1>

          {/* Subtitle / Value Proposition */}
          <p className="about-clean-desc">
            {companySettings.aboutDesc ||
              'QuickEnquiry is a premier B2B and B2C digital enquiry platform dedicated to connecting buyers directly with verified manufacturers, suppliers, and distributors across food products, spices, staples, and consumer essentials.'}
          </p>

          {/* Action Row */}
          <div className="about-clean-actions">
            <div className="about-breadcrumb-pill">
              <Link to="/">Home</Link>
              <span>•</span>
              <span className="active-crumb">About Company</span>
            </div>

            <button 
              type="button" 
              className="about-contact-btn" 
              onClick={openEnquiryModal}
            >
              Send Enquiry Now
            </button>
          </div>

          {/* Stats Bar Cards */}
          <div className="about-stats-grid">
            <div className="about-stat-card">
              <div className="stat-card-number">{companySettings.statYears || '12+'}</div>
              <div className="stat-card-label">{companySettings.statYearsLabel || 'Years Market Trust'}</div>
            </div>
            <div className="about-stat-card">
              <div className="stat-card-number">{companySettings.statEnquiries || '50k+'}</div>
              <div className="stat-card-label">{companySettings.statEnquiriesLabel || 'Enquiries Fulfilled'}</div>
            </div>
            <div className="about-stat-card">
              <div className="stat-card-number">{companySettings.statSatisfaction || '98.6%'}</div>
              <div className="stat-card-label">{companySettings.statSatisfactionLabel || 'Customer Satisfaction'}</div>
            </div>
            <div className="about-stat-card">
              <div className="stat-card-number">{companySettings.statCategories || '100+'}</div>
              <div className="stat-card-label">{companySettings.statCategoriesLabel || 'Product Categories'}</div>
            </div>
          </div>

        </div>
      </section>
      </ScrollReveal>

      {/* 2. BUILDING EXCELLENCE / ONE RELATIONSHIP AT A TIME SECTION */}
      <ScrollReveal variant="up">
        <section className="about-relationship-section">
        <div className="about-relationship-container">
          
          {/* Left Side: Team Image & Floating Trust Badge */}
          <div className="relationship-image-col">
            <div className="relationship-image-wrapper">
              <img 
                src={
                  companySettings.storyImageUrl ||
                  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
                } 
                alt="Building Excellence - Team Collaboration" 
                className="relationship-main-img"
              />
              <div className="relationship-trust-badge">
                <div className="trust-icon-box">
                  <Trophy size={20} />
                </div>
                <div className="trust-badge-text">
                  <span className="trust-number">{companySettings.statYears || '12+'}</span>
                  <span className="trust-label">YEARS OF TRUST</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Text Content & Action Buttons */}
          <div className="relationship-content-col">
            <span className="relationship-subtitle">{companySettings.storySubtitle || '— BUILDING EXCELLENCE'}</span>
            
            <h2 className="relationship-title">{companySettings.storyTitle || 'One Relationship at a Time'}</h2>
            
            <p className="relationship-paragraph">
              {companySettings.storyParagraph1 ||
                'Founded with a clear vision and unwavering commitment, we have grown into a trusted partner for thousands of clients across the country. Our work is guided by integrity, innovation, and a deep respect for the people we serve.'}
            </p>
            
            <p className="relationship-paragraph">
              {companySettings.storyParagraph2 ||
                'From our very first day, we believed that exceptional service is not a luxury — it is a standard. Every project we take on, every relationship we build, is approached with the same dedication and care that has been the cornerstone of our success.'}
            </p>

            {/* Action Buttons Row */}
            <div className="relationship-actions">
              <button 
                type="button" 
                className="btn-get-in-touch"
                onClick={openEnquiryModal}
              >
                <span>Get In Touch</span>
                <FiArrowRight size={16} />
              </button>
 
              <button 
                type="button" 
                className="btn-our-mission"
                onClick={() => {
                  const el = document.querySelector('.relationship-certificates-row')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <span>Our Mission</span>
                <FiChevronDown size={16} />
              </button>
            </div>

            {/* Certificates / Quality Badges Row */}
            <div className="relationship-certificates-row">
              <div className="cert-item-badge">
                <span className="cert-code">ISO 22000</span>
                <span className="cert-lbl">Food Safety</span>
              </div>
              <div className="cert-item-badge">
                <span className="cert-code">fssai</span>
                <span className="cert-lbl">Certified</span>
              </div>
              <div className="cert-item-badge">
                <span className="cert-code">100%</span>
                <span className="cert-lbl">Organic Standards</span>
              </div>
              <div className="cert-item-badge">
                <span className="cert-code">GMP</span>
                <span className="cert-lbl">Quality Assured</span>
              </div>
            </div>

          </div>

        </div>
      </section>
      </ScrollReveal>

      {/* 3. OUR DNA / THE VALUES THAT DEFINE US SECTION */}
      <ScrollReveal variant="up">
        <section className="about-dna-values-section">
        {/* Header Title */}
        <div className="dna-values-header">
          <span className="dna-subtitle">{companySettings.dnaSubtitle || '— OUR DNA —'}</span>
          <h2 className="dna-title">
            {companySettings.dnaTitle ? (
              companySettings.dnaTitle
            ) : (
              <>
                The Values That <span className="dna-title-accent">Define Us</span>
              </>
            )}
          </h2>
        </div>

        {/* Dynamic Value Cards Grid */}
        <div className="dna-cards-grid">
          {(
            companySettings.dnaCards && Array.isArray(companySettings.dnaCards) && companySettings.dnaCards.length > 0
              ? companySettings.dnaCards
              : [
                  {
                    title: companySettings.dnaCard1Title || 'Integrity',
                    desc: companySettings.dnaCard1Desc || 'We say what we mean and do what we say. Honesty is the foundation of every relationship we build.'
                  },
                  {
                    title: companySettings.dnaCard2Title || 'Innovation',
                    desc: companySettings.dnaCard2Desc || 'We embrace change, challenge convention, and constantly seek better ways to serve our clients.'
                  },
                  {
                    title: companySettings.dnaCard3Title || 'Empathy',
                    desc: companySettings.dnaCard3Desc || 'We understand that behind every enquiry is a person. Compassion shapes every interaction we have.'
                  },
                  {
                    title: companySettings.dnaCard4Title || 'Excellence',
                    desc: companySettings.dnaCard4Desc || 'Good enough is never enough. We hold ourselves to the highest standard in every single task.'
                  }
                ]
          ).map((card, idx) => {
            const icons = [<ShieldCheck size={24} key="1" />, <Lightbulb size={24} key="2" />, <Heart size={24} key="3" />, <BarChart3 size={24} key="4" />]
            const IconComp = icons[idx % icons.length]
            return (
              <div className="dna-card" key={idx}>
                <div className="dna-icon-wrapper">
                  {IconComp}
                </div>
                <h3 className="dna-card-title">{card.title}</h3>
                <p className="dna-card-desc">{card.desc}</p>
              </div>
            )
          })}
        </div>
      </section>
      </ScrollReveal>

      {/* 4. OUR MISSION & VISION SECTION */}
      <ScrollReveal variant="up">
        <section className="about-mission-vision-section">
        {/* Header Title */}
        <div className="mission-vision-header">
          <span className="mv-subtitle">— WHAT DRIVES US</span>
          <h2 className="mv-title">
            Our <span className="mv-title-accent">Mission & Vision</span>
          </h2>
          <p className="mv-description">
            Two guiding principles shape everything we do — a mission rooted in service and a vision pointed toward the future.
          </p>
        </div>

        {/* 2-Card Container with Center Divider */}
        <div className="mission-vision-grid-container">
          
          {/* Vertical Center Divider Line & Star Emblem */}
          <div className="mv-center-line">
            <div className="mv-star-badge">
              <Star size={16} fill="#3b82f6" color="#3b82f6" />
            </div>
          </div>

          {/* Left Card: OUR MISSION */}
          <div className="mv-card mv-card-mission">
            <div className="mv-icon-box">
              <Target size={22} />
            </div>

            <span className="mv-card-tag">OUR MISSION</span>

            {companySettings.missionHeading && (
              <h3 className="mv-card-heading">
                {companySettings.missionHeading}
              </h3>
            )}

            <p className="mv-card-paragraph">
              {companySettings.missionText ||
                'Our mission is to deliver exceptional, personalised services that solve real problems, create genuine value, and help each client grow with confidence.'}
            </p>

            <ul className="mv-check-list">
              {(
                companySettings.missionPoints && Array.isArray(companySettings.missionPoints) && companySettings.missionPoints.length > 0
                  ? companySettings.missionPoints
                  : [
                      companySettings.missionPoint1 || 'Deliver measurable results with every engagement',
                      companySettings.missionPoint2 || 'Foster long-term partnerships built on trust',
                      companySettings.missionPoint3 || 'Continuously improve through client feedback',
                      companySettings.missionPoint4 || 'Make excellence accessible to businesses of all sizes'
                    ]
              ).map((pointText, idx) => (
                <li key={idx}>
                  <CheckCircle2 size={15} className="check-icon" />
                  <span>{pointText}</span>
                </li>
              ))}
            </ul>

            <div className="mv-card-bg-circle"></div>
          </div>

          {/* Right Card: OUR VISION */}
          <div className="mv-card mv-card-vision">
            <div className="mv-icon-box">
              <Eye size={22} />
            </div>

            <span className="mv-card-tag">OUR VISION</span>

            <h3 className="mv-card-heading">
              {companySettings.visionHeading || 'A Future Where Quality Is Never Compromised'}
            </h3>

            <p className="mv-card-paragraph">
              {companySettings.visionText ||
                'We envision a world where every individual and organisation has access to world-class service — regardless of size or scale.'}
            </p>
                
            <ul className="mv-check-list">
              {(
                companySettings.visionPoints && Array.isArray(companySettings.visionPoints) && companySettings.visionPoints.length > 0
                  ? companySettings.visionPoints
                  : [
                      companySettings.visionPoint1 || 'Become the most trusted name in our industry',
                      companySettings.visionPoint2 || 'Lead innovation without losing the human touch',
                      companySettings.visionPoint3 || 'Scale our impact across communities and sectors',
                      companySettings.visionPoint4 || 'Build a legacy of excellence for future generations'
                    ]
              ).map((pointText, idx) => (
                <li key={idx}>
                  <CheckCircle2 size={15} className="check-icon" />
                  <span>{pointText}</span>
                </li>
              ))}
            </ul>

            <div className="mv-card-bg-circle"></div>
          </div>

        </div>
      </section>
      </ScrollReveal>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default AboutEnquiryCompany

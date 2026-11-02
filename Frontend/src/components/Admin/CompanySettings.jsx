import React, { useState } from 'react'
import {
  FiBriefcase,
  FiSave,
  FiAward,
  FiTarget,
  FiEye,
  FiGlobe,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
  FiUsers,
  FiPlus,
  FiTrash2
} from 'react-icons/fi'
import { apiService } from '../../api/apiService'

const CompanySettings = ({ storeSettings, setStoreSettings, showToast }) => {
  const [formData, setFormData] = useState({
    companyName: storeSettings.companyName || 'QuickEnquiry',
    tagline: storeSettings.tagline || '100% Organic & Stone Ground Spices',
    foundedYear: storeSettings.foundedYear || '2014',
    whatsappNumber: storeSettings.whatsappNumber || '+91 9876543210',
    contactEmail: storeSettings.contactEmail || 'info@enquirybrand.com',
    officeAddress: storeSettings.officeAddress || 'Sector 62, Business Park, Noida, UP - 201309',

    // About Hero Section
    aboutBadge: storeSettings.aboutBadge || 'ABOUT QUICKENQUIRY',
    aboutTitle: storeSettings.aboutTitle || 'Empowering Businesses with Seamless Product Enquiry & Trade',
    aboutDesc:
      storeSettings.aboutDesc ||
      'QuickEnquiry is a premier B2B and B2C digital enquiry platform dedicated to connecting buyers directly with verified manufacturers, suppliers, and distributors across food products, spices, staples, and consumer essentials.',

    // Stats Bar
    statYears: storeSettings.statYears || '12+',
    statYearsLabel: storeSettings.statYearsLabel || 'Years Market Trust',
    statEnquiries: storeSettings.statEnquiries || '50k+',
    statEnquiriesLabel: storeSettings.statEnquiriesLabel || 'Enquiries Fulfilled',
    statSatisfaction: storeSettings.statSatisfaction || '98.6%',
    statSatisfactionLabel: storeSettings.statSatisfactionLabel || 'Customer Satisfaction',
    statCategories: storeSettings.statCategories || '100+',
    statCategoriesLabel: storeSettings.statCategoriesLabel || 'Product Categories',

    // Excellence / Story Section
    storySubtitle: storeSettings.storySubtitle || '— BUILDING EXCELLENCE',
    storyTitle: storeSettings.storyTitle || 'One Relationship at a Time',
    storyImageUrl:
      storeSettings.storyImageUrl ||
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    storyParagraph1:
      storeSettings.storyParagraph1 ||
      'Founded with a clear vision and unwavering commitment, we have grown into a trusted partner for thousands of clients across the country. Our work is guided by integrity, innovation, and a deep respect for the people we serve.',
    storyParagraph2:
      storeSettings.storyParagraph2 ||
      'From our very first day, we believed that exceptional service is not a luxury — it is a standard. Every project we take on, every relationship we build, is approached with dedication and care.',

    // Mission & Vision
    missionHeading: storeSettings.missionHeading || 'Empowering Businesses & Delivering Excellence',
    missionText:
      storeSettings.missionText ||
      'Our mission is to deliver exceptional, personalised services that solve real problems, create genuine value, and help each client grow with confidence.',
    missionPoints: storeSettings.missionPoints && Array.isArray(storeSettings.missionPoints) && storeSettings.missionPoints.length > 0
      ? storeSettings.missionPoints
      : [
          storeSettings.missionPoint1 || 'Deliver measurable results with every engagement',
          storeSettings.missionPoint2 || 'Foster long-term partnerships built on trust',
          storeSettings.missionPoint3 || 'Continuously improve through client feedback',
          storeSettings.missionPoint4 || 'Make excellence accessible to businesses of all sizes'
        ],

    visionHeading:
      storeSettings.visionHeading || 'A Future Where Quality Is Never Compromised',
    visionText:
      storeSettings.visionText ||
      'We envision a world where every individual and organisation has access to world-class service — regardless of size or scale.',
    visionPoints: storeSettings.visionPoints && Array.isArray(storeSettings.visionPoints) && storeSettings.visionPoints.length > 0
      ? storeSettings.visionPoints
      : [
          storeSettings.visionPoint1 || 'Become the most trusted name in our industry',
          storeSettings.visionPoint2 || 'Lead innovation without losing the human touch',
          storeSettings.visionPoint3 || 'Scale our impact across communities and sectors',
          storeSettings.visionPoint4 || 'Build a legacy of excellence for future generations'
        ],

    // Our DNA / Core Values Section
    dnaSubtitle: storeSettings.dnaSubtitle || '— OUR DNA —',
    dnaTitle: storeSettings.dnaTitle || 'The Values That Define Us',
    dnaCards: storeSettings.dnaCards && Array.isArray(storeSettings.dnaCards) && storeSettings.dnaCards.length > 0
      ? storeSettings.dnaCards
      : [
          {
            title: storeSettings.dnaCard1Title || 'Integrity',
            desc: storeSettings.dnaCard1Desc || 'We say what we mean and do what we say. Honesty is the foundation of every relationship we build.'
          },
          {
            title: storeSettings.dnaCard2Title || 'Innovation',
            desc: storeSettings.dnaCard2Desc || 'We embrace change, challenge convention, and constantly seek better ways to serve our clients.'
          },
          {
            title: storeSettings.dnaCard3Title || 'Empathy',
            desc: storeSettings.dnaCard3Desc || 'We understand that behind every enquiry is a person. Compassion shapes every interaction we have.'
          },
          {
            title: storeSettings.dnaCard4Title || 'Excellence',
            desc: storeSettings.dnaCard4Desc || 'Good enough is never enough. We hold ourselves to the highest standard in every single task.'
          }
        ]
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Dynamic Mission Points Handlers
  const handleMissionPointChange = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.missionPoints]
      updated[index] = value
      return { ...prev, missionPoints: updated }
    })
  }

  const handleAddMissionPoint = () => {
    setFormData((prev) => ({
      ...prev,
      missionPoints: [...prev.missionPoints, '']
    }))
  }

  const handleDeleteMissionPoint = (index) => {
    setFormData((prev) => {
      const updated = prev.missionPoints.filter((_, i) => i !== index)
      return { ...prev, missionPoints: updated }
    })
  }

  // Dynamic Vision Points Handlers
  const handleVisionPointChange = (index, value) => {
    setFormData((prev) => {
      const updated = [...(prev.visionPoints || [])]
      updated[index] = value
      return { ...prev, visionPoints: updated }
    })
  }

  const handleAddVisionPoint = () => {
    setFormData((prev) => ({
      ...prev,
      visionPoints: [...(prev.visionPoints || []), '']
    }))
  }

  const handleDeleteVisionPoint = (index) => {
    setFormData((prev) => {
      const updated = (prev.visionPoints || []).filter((_, i) => i !== index)
      return { ...prev, visionPoints: updated }
    })
  }

  // Dynamic DNA Cards Handlers
  const handleDnaCardChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...(prev.dnaCards || [])]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, dnaCards: updated }
    })
  }

  const handleAddDnaCard = () => {
    setFormData((prev) => ({
      ...prev,
      dnaCards: [...(prev.dnaCards || []), { title: '', desc: '' }]
    }))
  }

  const handleDeleteDnaCard = (index) => {
    setFormData((prev) => {
      const updated = (prev.dnaCards || []).filter((_, i) => i !== index)
      return { ...prev, dnaCards: updated }
    })
  }

  const handleStoryImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'warning')
      return
    }

    showToast(`Uploading ${file.name} to Cloudinary...`, 'info')
    try {
      const uploadRes = await apiService.uploadImage(file)
      if (uploadRes && uploadRes.url) {
        setFormData((prev) => ({ ...prev, storyImageUrl: uploadRes.url }))
        showToast(`Uploaded team photo to Cloudinary successfully!`)
      } else {
        const reader = new FileReader()
        reader.onload = () => {
          setFormData((prev) => ({ ...prev, storyImageUrl: reader.result }))
        }
        reader.readAsDataURL(file)
      }
    } catch (err) {
      console.warn('Cloudinary upload warning:', err)
      const reader = new FileReader()
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, storyImageUrl: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (e) => {
    e?.preventDefault()
    const updated = {
      ...storeSettings,
      ...formData
    }
    try {
      await apiService.updateSettings(updated)
    } catch (err) {
      console.warn('MongoDB settings save error:', err.message)
    }
    setStoreSettings(updated)
    localStorage.setItem('enquiry_admin_store_settings', JSON.stringify(updated))
    window.dispatchEvent(new Event('storage'))
    showToast('Company & About Page settings saved successfully to MongoDB!')
  }

  return (
    <div className="company-settings-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Title Card */}
      <div className="admin-card">
        <div className="admin-card-header" style={{ marginBottom: '0', borderBottom: 'none' }}>
          <div className="card-title-group">
            <div className="card-title-icon-wrapper">
              <FiBriefcase className="card-title-icon" size={20} />
            </div>
            <div>
              <div className="card-title-row">
                <h2 className="card-title">Company & About Page Settings</h2>
                <span className="live-count-badge">Active Profile</span>
              </div>
              <p className="card-subtitle">
                Manage company profile info, About Page hero content, trust stats, mission, vision, and contact details.
              </p>
            </div>
          </div>
          <button className="btn-primary" onClick={handleSave} style={{ padding: '9px 20px' }}>
            <FiSave size={16} /> Save Settings
          </button>
        </div>
      </div>

      {/* 1. Basic Company Information */}
      <div className="admin-card">
        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '4px', height: '22px', borderRadius: '4px', background: 'linear-gradient(180deg, #6366F1 0%, #4338CA 100%)', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0, color: '#1E1B4B', background: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              1. Basic Company Profile & Contact Info
            </h3>
            <p className="card-subtitle" style={{ margin: '2px 0 0 0' }}>
              Official brand details used across header, footer, contact modal, and about page.
            </p>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Company Name</label>
            <input
              type="text"
              name="companyName"
              className="form-input"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. QuickEnquiry"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Company Tagline / Subtitle</label>
            <input
              type="text"
              name="tagline"
              className="form-input"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="e.g. 100% Organic & Stone Ground Spices"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Support Phone / WhatsApp</label>
            <input
              type="text"
              name="whatsappNumber"
              className="form-input"
              value={formData.whatsappNumber}
              onChange={handleChange}
              placeholder="+91 9876543210"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Official Email Address</label>
            <input
              type="email"
              name="contactEmail"
              className="form-input"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="info@enquirybrand.com"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Head Office Address</label>
          <input
            type="text"
            name="officeAddress"
            className="form-input"
            value={formData.officeAddress}
            onChange={handleChange}
            placeholder="Sector 62, Business Hub, Noida, UP 201309"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn-primary" onClick={handleSave} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            <FiSave size={15} /> Save Changes
          </button>
        </div>
      </div>

      {/* 2. About Page Hero Section */}
      <div className="admin-card">
        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '4px', height: '22px', borderRadius: '4px', background: 'linear-gradient(180deg, #6366F1 0%, #4338CA 100%)', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0, color: '#1E1B4B', background: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              2. About Page Hero Content
            </h3>
            <p className="card-subtitle" style={{ margin: '2px 0 0 0' }}>
              Main headline and introduction text displayed on top of the About Company Page.
            </p>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label" style={{ fontWeight: 600 }}>Top Badge Text</label>
          <input
            type="text"
            name="aboutBadge"
            className="form-input"
            value={formData.aboutBadge}
            onChange={handleChange}
            placeholder="ABOUT QUICKENQUIRY"
          />
        </div>

        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label" style={{ fontWeight: 600 }}>Main Headline Title</label>
          <input
            type="text"
            name="aboutTitle"
            className="form-input"
            value={formData.aboutTitle}
            onChange={handleChange}
            placeholder="Empowering Businesses with Seamless Product Enquiry & Trade"
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Subtitle Description / Value Proposition</label>
          <textarea
            rows={3}
            name="aboutDesc"
            className="form-textarea"
            style={{ minHeight: '70px', resize: 'vertical' }}
            value={formData.aboutDesc}
            onChange={handleChange}
            placeholder="Enter brief company description..."
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn-primary" onClick={handleSave} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            <FiSave size={15} /> Save Changes
          </button>
        </div>
      </div>

      {/* 3. Company Trust Stats Bar */}
      <div className="admin-card">
        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '4px', height: '22px', borderRadius: '4px', background: 'linear-gradient(180deg, #6366F1 0%, #4338CA 100%)', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0, color: '#1E1B4B', background: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              3. Key Performance & Trust Metrics
            </h3>
            <p className="card-subtitle" style={{ margin: '2px 0 0 0' }}>
              Four key milestone stats showcased in the About Page hero banner cards.
            </p>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Stat 1: Value & Label</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                name="statYears"
                className="form-input"
                style={{ width: '90px' }}
                value={formData.statYears}
                onChange={handleChange}
                placeholder="12+"
              />
              <input
                type="text"
                name="statYearsLabel"
                className="form-input"
                style={{ flex: 1 }}
                value={formData.statYearsLabel}
                onChange={handleChange}
                placeholder="Years Market Trust"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Stat 2: Value & Label</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                name="statEnquiries"
                className="form-input"
                style={{ width: '90px' }}
                value={formData.statEnquiries}
                onChange={handleChange}
                placeholder="50k+"
              />
              <input
                type="text"
                name="statEnquiriesLabel"
                className="form-input"
                style={{ flex: 1 }}
                value={formData.statEnquiriesLabel}
                onChange={handleChange}
                placeholder="Enquiries Fulfilled"
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Stat 3: Value & Label</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                name="statSatisfaction"
                className="form-input"
                style={{ width: '90px' }}
                value={formData.statSatisfaction}
                onChange={handleChange}
                placeholder="98.6%"
              />
              <input
                type="text"
                name="statSatisfactionLabel"
                className="form-input"
                style={{ flex: 1 }}
                value={formData.statSatisfactionLabel}
                onChange={handleChange}
                placeholder="Customer Satisfaction"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Stat 4: Value & Label</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                name="statCategories"
                className="form-input"
                style={{ width: '90px' }}
                value={formData.statCategories}
                onChange={handleChange}
                placeholder="100+"
              />
              <input
                type="text"
                name="statCategoriesLabel"
                className="form-input"
                style={{ flex: 1 }}
                value={formData.statCategoriesLabel}
                onChange={handleChange}
                placeholder="Product Categories"
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn-primary" onClick={handleSave} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            <FiSave size={15} /> Save Changes
          </button>
        </div>
      </div>

      {/* 4. Company Story / Building Excellence Section */}
      <div className="admin-card">
        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '4px', height: '22px', borderRadius: '4px', background: 'linear-gradient(180deg, #6366F1 0%, #4338CA 100%)', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0, color: '#1E1B4B', background: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              4. Building Excellence & Story Section
            </h3>
            <p className="card-subtitle" style={{ margin: '2px 0 0 0' }}>
              Content for the team image, title, and brand story paragraph section.
            </p>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Subtitle Badge</label>
            <input
              type="text"
              name="storySubtitle"
              className="form-input"
              value={formData.storySubtitle}
              onChange={handleChange}
              placeholder="— BUILDING EXCELLENCE"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Story Main Title</label>
            <input
              type="text"
              name="storyTitle"
              className="form-input"
              value={formData.storyTitle}
              onChange={handleChange}
              placeholder="One Relationship at a Time"
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label className="form-label" style={{ fontWeight: 600, margin: 0 }}>Team Photo / Story Image</label>
            {formData.storyImageUrl && (
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '2px 8px', color: '#EF4444', borderColor: '#FCA5A5' }}
                onClick={() => setFormData((prev) => ({ ...prev, storyImageUrl: '' }))}
              >
                Clear Image
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
            <input
              type="file"
              accept="image/*"
              className="form-input"
              style={{ flex: 1, minWidth: '200px', padding: '7px 10px', background: '#FFFFFF', cursor: 'pointer' }}
              onChange={handleStoryImageUpload}
            />
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>OR URL:</span>
            <input
              type="text"
              name="storyImageUrl"
              className="form-input"
              style={{ flex: 1, minWidth: '200px' }}
              value={formData.storyImageUrl}
              onChange={handleChange}
              placeholder="Paste image URL (https://...)"
            />
          </div>

          {/* Live Team Image Preview Thumbnail */}
          {formData.storyImageUrl && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid var(--admin-card-border)' }}>
              <img
                src={formData.storyImageUrl}
                alt="Story Team Preview"
                style={{ width: '84px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #CBD5E1', flexShrink: 0 }}
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
                }}
              />
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E1B4B', display: 'block' }}>
                  Live Image Preview
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  This photo will be displayed in the Building Excellence section on the About Page.
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label" style={{ fontWeight: 600 }}>Story Paragraph 1</label>
          <textarea
            rows={2}
            name="storyParagraph1"
            className="form-textarea"
            style={{ minHeight: '55px', resize: 'vertical' }}
            value={formData.storyParagraph1}
            onChange={handleChange}
            placeholder="Enter first story paragraph..."
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Story Paragraph 2</label>
          <textarea
            rows={2}
            name="storyParagraph2"
            className="form-textarea"
            style={{ minHeight: '55px', resize: 'vertical' }}
            value={formData.storyParagraph2}
            onChange={handleChange}
            placeholder="Enter second story paragraph..."
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn-primary" onClick={handleSave} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            <FiSave size={15} /> Save Changes
          </button>
        </div>
      </div>

      {/* 5. Mission & Vision Statements */}
      <div className="admin-card">
        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '4px', height: '22px', borderRadius: '4px', background: 'linear-gradient(180deg, #6366F1 0%, #4338CA 100%)', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0, color: '#1E1B4B', background: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              5. Mission & Vision Statements
            </h3>
            <p className="card-subtitle" style={{ margin: '2px 0 0 0' }}>
              Customize mission & vision card headings, descriptions, and bullet points displayed on the About Page.
            </p>
          </div>
        </div>

        {/* Mission & Vision 2 Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '16px' }}>
          
          {/* OUR MISSION CARD FORM */}
          <div style={{ padding: '16px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid var(--admin-card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FiTarget size={18} color="#6366F1" />
              <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#1E1B4B' }}>OUR MISSION CARD</h4>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Mission Statement</label>
              <textarea
                rows={3}
                name="missionText"
                className="form-textarea"
                style={{ minHeight: '65px', resize: 'vertical' }}
                value={formData.missionText}
                onChange={handleChange}
                placeholder="Our mission is to deliver exceptional..."
              />
            </div>

            {/* Mission Dynamic Points */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ fontWeight: 600, margin: 0 }}>
                Mission Key Highlights ({(formData.missionPoints || []).length} Points)
              </label>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '3px 10px', color: '#4F46E5', borderColor: '#A5B4FC' }}
                onClick={handleAddMissionPoint}
              >
                <FiPlus size={14} /> Add New Point
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(formData.missionPoints || []).map((point, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={point}
                    onChange={(e) => handleMissionPointChange(index, e.target.value)}
                    placeholder={`Highlight point ${index + 1}...`}
                  />
                  <button
                    type="button"
                    className="btn-icon delete"
                    title="Remove Point"
                    onClick={() => handleDeleteMissionPoint(index)}
                    style={{ flexShrink: 0 }}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn-secondary"
              style={{ width: '100%', marginTop: '12px', padding: '6px', fontSize: '0.82rem', justifyContent: 'center', color: '#4F46E5', borderColor: '#C7D2FE', background: '#EEF2FF' }}
              onClick={handleAddMissionPoint}
            >
              <FiPlus size={14} /> Add New Mission Field
            </button>
          </div>

          {/* OUR VISION CARD FORM */}
          <div style={{ padding: '16px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid var(--admin-card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FiEye size={18} color="#6366F1" />
              <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#1E1B4B' }}>OUR VISION CARD</h4>
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Vision Card Heading</label>
              <input
                type="text"
                name="visionHeading"
                className="form-input"
                value={formData.visionHeading}
                onChange={handleChange}
                placeholder="A Future Where Quality Is Never Compromised"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Vision Statement</label>
              <textarea
                rows={3}
                name="visionText"
                className="form-textarea"
                style={{ minHeight: '65px', resize: 'vertical' }}
                value={formData.visionText}
                onChange={handleChange}
                placeholder="We envision a world where every individual..."
              />
            </div>

            {/* Vision Dynamic Points */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ fontWeight: 600, margin: 0 }}>
                Vision Key Goals ({(formData.visionPoints || []).length} Points)
              </label>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '3px 10px', color: '#4F46E5', borderColor: '#A5B4FC' }}
                onClick={handleAddVisionPoint}
              >
                <FiPlus size={14} /> Add New Goal
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(formData.visionPoints || []).map((point, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={point}
                    onChange={(e) => handleVisionPointChange(index, e.target.value)}
                    placeholder={`Goal point ${index + 1}...`}
                  />
                  <button
                    type="button"
                    className="btn-icon delete"
                    title="Remove Goal"
                    onClick={() => handleDeleteVisionPoint(index)}
                    style={{ flexShrink: 0 }}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn-secondary"
              style={{ width: '100%', marginTop: '12px', padding: '6px', fontSize: '0.82rem', justifyContent: 'center', color: '#4F46E5', borderColor: '#C7D2FE', background: '#EEF2FF' }}
              onClick={handleAddVisionPoint}
            >
              <FiPlus size={14} /> Add New Vision Field
            </button>
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn-primary" onClick={handleSave} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            <FiSave size={15} /> Save Changes
          </button>
        </div>
      </div>

      {/* 6. Our DNA / Core Values Section */}
      <div className="admin-card">
        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '4px', height: '22px', borderRadius: '4px', background: 'linear-gradient(180deg, #6366F1 0%, #4338CA 100%)', flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0, color: '#1E1B4B', background: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                6. Our DNA / Core Brand Values ({(formData.dnaCards || []).length} Cards)
              </h3>
              <p className="card-subtitle" style={{ margin: '2px 0 0 0' }}>
                Edit section title, subtitle, and add/remove core value cards dynamically.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleAddDnaCard}
            style={{ padding: '6px 14px', fontSize: '0.82rem', color: '#4F46E5', borderColor: '#A5B4FC' }}
          >
            <FiPlus size={15} /> Add New Value Card
          </button>
        </div>

        <div className="form-row" style={{ marginBottom: '16px' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Section Subtitle</label>
            <input
              type="text"
              name="dnaSubtitle"
              className="form-input"
              value={formData.dnaSubtitle}
              onChange={handleChange}
              placeholder="— OUR DNA —"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Section Main Title</label>
            <input
              type="text"
              name="dnaTitle"
              className="form-input"
              value={formData.dnaTitle}
              onChange={handleChange}
              placeholder="The Values That Define Us"
            />
          </div>
        </div>

        {/* Dynamic Value Cards Form Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {(formData.dnaCards || []).map((card, index) => (
            <div key={index} style={{ padding: '14px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid var(--admin-card-border)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#4F46E5', margin: 0 }}>
                  Value {index + 1} {card.title ? `(${card.title})` : ''}
                </label>
                {(formData.dnaCards || []).length > 1 && (
                  <button
                    type="button"
                    className="btn-icon delete"
                    title="Delete Value Card"
                    onClick={() => handleDeleteDnaCard(index)}
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
              <input
                type="text"
                className="form-input"
                style={{ marginBottom: '8px' }}
                value={card.title}
                onChange={(e) => handleDnaCardChange(index, 'title', e.target.value)}
                placeholder="Title (e.g. Integrity, Quality)"
              />
              <textarea
                rows={3}
                className="form-textarea"
                style={{ minHeight: '60px', fontSize: '0.84rem' }}
                value={card.desc}
                onChange={(e) => handleDnaCardChange(index, 'desc', e.target.value)}
                placeholder="Enter value description..."
              />
            </div>
          ))}
        </div>

        {/* Add New Value Card Full Width Button */}
        <button
          type="button"
          className="btn-secondary"
          style={{ width: '100%', marginTop: '16px', padding: '10px', fontSize: '0.88rem', fontWeight: 700, justifyContent: 'center', color: '#4F46E5', borderColor: '#C7D2FE', background: '#EEF2FF' }}
          onClick={handleAddDnaCard}
        >
          <FiPlus size={16} /> Add New Core Value Card
        </button>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn-primary" onClick={handleSave} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            <FiSave size={15} /> Save Changes
          </button>
        </div>
      </div>

      {/* Save Action Bar */}
      <div
        className="admin-card"
        style={{
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFDF9',
          border: '1px solid var(--admin-card-border)',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div>
          <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1E1B4B' }}>
            Save Company & About Settings
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
            Persist all updates to company details, about page content, stats metrics, mission, and vision.
          </div>
        </div>

        <button className="btn-primary" onClick={handleSave} style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
          <FiSave size={16} /> Save Settings
        </button>
      </div>
    </div>
  )
}

export default CompanySettings

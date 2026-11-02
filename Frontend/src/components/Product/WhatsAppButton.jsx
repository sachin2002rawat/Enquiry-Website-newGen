import React, { useState, useEffect, useRef } from 'react'
import { FaWhatsapp, FaTimes, FaPhoneAlt, FaUser, FaCommentDots } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'
import { apiService } from '../../api/apiService'
import { openWhatsApp } from '../../utils/whatsappHelper'
import './WhatsAppButton.css'

const LOCAL_KEY_SETTINGS = 'enquiry_admin_store_settings'
const LOCAL_KEY_USER_NAME = 'enquiry_user_name'
const LOCAL_KEY_USER_PHONE = 'enquiry_user_whatsapp'
const DEFAULT_NUMBER = '+91 9555140701'
const DEFAULT_MESSAGE = 'Hello! I would like to make an enquiry.'
const DEFAULT_TOOLTIP = 'Chat with Us'

/**
 * WhatsAppButton Component
 * Modern, clean, and elegant WhatsApp floating button with a streamlined chat popup.
 * Features:
 * - Name Section
 * - Number of Query Sender Field
 * - Query Message Section
 * - Synchronized with MongoDB backend (/api/enquiries) & WhatsApp redirection
 */
const WhatsAppButton = ({ phoneNumber: propPhone, defaultMessage: propMessage }) => {
  const location = useLocation()
  const popupRef = useRef(null)

  // 1. WhatsApp Target State (Admin Configured Number or Link)
  const [whatsappState, setWhatsappState] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_SETTINGS)
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          number: propPhone || parsed.whatsappNumber || DEFAULT_NUMBER,
          linkType: parsed.whatsappLinkType || 'number',
          customUrl: parsed.whatsappCustomUrl || '',
          message: propMessage || parsed.whatsappMessage || DEFAULT_MESSAGE,
          enabled: parsed.whatsappEnabled !== false,
          tooltip: parsed.whatsappTooltipText || DEFAULT_TOOLTIP
        }
      }
    } catch {
      // fallback
    }
    return {
      number: propPhone || DEFAULT_NUMBER,
      linkType: 'number',
      customUrl: '',
      message: propMessage || DEFAULT_MESSAGE,
      enabled: true,
      tooltip: DEFAULT_TOOLTIP
    }
  })

  // 2. Chat Popup Form State (Fresh and empty on every page reload)
  const [isOpen, setIsOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [userQuery, setUserQuery] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Clear any legacy saved user inputs from localStorage on load
  useEffect(() => {
    try {
      localStorage.removeItem(LOCAL_KEY_USER_NAME)
      localStorage.removeItem(LOCAL_KEY_USER_PHONE)
    } catch {}
  }, [])

  // 3. Fetch latest settings from backend MongoDB on mount
  useEffect(() => {
    let isMounted = true

    const fetchLatestWhatsappSettings = async () => {
      try {
        const data = await apiService.getWhatsappSettings()
        if (isMounted && data) {
          try {
            const saved = localStorage.getItem(LOCAL_KEY_SETTINGS)
            const parsed = saved ? JSON.parse(saved) : {}
            localStorage.setItem(LOCAL_KEY_SETTINGS, JSON.stringify({ ...parsed, ...data }))
          } catch {}
          setWhatsappState((prev) => ({
            ...prev,
            number: propPhone || data.whatsappNumber || prev.number,
            linkType: data.whatsappLinkType || prev.linkType,
            customUrl: data.whatsappCustomUrl !== undefined ? data.whatsappCustomUrl : prev.customUrl,
            message: propMessage || data.whatsappMessage || prev.message,
            enabled: data.whatsappEnabled !== undefined ? data.whatsappEnabled : prev.enabled,
            tooltip: data.whatsappTooltipText || prev.tooltip
          }))
        }
      } catch (err) {
        // Fallback to local state
      }
    }

    fetchLatestWhatsappSettings()

    // 4. Listen to storage and custom real-time events
    const syncFromStorage = () => {
      try {
        const saved = localStorage.getItem(LOCAL_KEY_SETTINGS)
        if (saved) {
          const parsed = JSON.parse(saved)
          setWhatsappState((prev) => ({
            ...prev,
            number: propPhone || parsed.whatsappNumber || prev.number,
            linkType: parsed.whatsappLinkType || prev.linkType,
            customUrl: parsed.whatsappCustomUrl !== undefined ? parsed.whatsappCustomUrl : prev.customUrl,
            message: propMessage || parsed.whatsappMessage || prev.message,
            enabled: parsed.whatsappEnabled !== false,
            tooltip: parsed.whatsappTooltipText || prev.tooltip
          }))
        }
      } catch {
        // ignore
      }
    }

    const handleCustomEvent = (e) => {
      if (e.detail) {
        setWhatsappState((prev) => ({
          ...prev,
          number: propPhone || e.detail.whatsappNumber || prev.number,
          linkType: e.detail.whatsappLinkType || prev.linkType,
          customUrl: e.detail.whatsappCustomUrl !== undefined ? e.detail.whatsappCustomUrl : prev.customUrl,
          message: propMessage || e.detail.whatsappMessage || prev.message,
          enabled: e.detail.whatsappEnabled !== undefined ? e.detail.whatsappEnabled : prev.enabled,
          tooltip: e.detail.whatsappTooltipText || prev.tooltip
        }))
      } else {
        syncFromStorage()
      }
    }

    window.addEventListener('storage', syncFromStorage)
    window.addEventListener('whatsappSettingsChanged', handleCustomEvent)

    return () => {
      isMounted = false
      window.removeEventListener('storage', syncFromStorage)
      window.removeEventListener('whatsappSettingsChanged', handleCustomEvent)
    }
  }, [propPhone, propMessage])

  // 5. Close popup on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        const toggleBtn = document.querySelector('.floating-whatsapp-btn')
        if (toggleBtn && toggleBtn.contains(e.target)) return
        setIsOpen(false)
      }
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  // Don't render inside Admin dashboard
  if (location.pathname.startsWith('/admin')) {
    return null
  }

  // If admin explicitly disabled the floating button
  if (!whatsappState.enabled) {
    return null
  }

  // Target: custom link or phone number
  const activeAdminTarget =
    whatsappState.linkType === 'custom_link' && whatsappState.customUrl
      ? whatsappState.customUrl
      : whatsappState.number || whatsappState.customUrl || DEFAULT_NUMBER

  // Handle Form Submit: saves to backend and redirects to WhatsApp
  const handleUserSubmit = (e) => {
    e.preventDefault()

    const rawDigits = userPhone.replace(/\D/g, '')
    if (!rawDigits || rawDigits.length < 8) {
      setPhoneError('Please enter a valid phone number')
      return
    }

    setPhoneError('')
    setIsSubmitting(true)

    const cleanName = userName.trim()
    const cleanPhone = userPhone.trim()
    const cleanQuery = userQuery.trim()

    // 1. Submit to Backend asynchronously (records MongoDB Enquiry & triggers Nodemailer alert)
    apiService.submitEnquiry({
      name: cleanName || 'Valued Customer',
      phone: cleanPhone,
      message: cleanQuery || 'WhatsApp Quick Enquiry',
      productName: 'WhatsApp Quick Enquiry',
      source: 'WhatsApp'
    }).catch((err) => {
      console.warn('[WhatsApp] Backend enquiry sync warning:', err)
    })

    // 2. Prepare clean formatted WhatsApp message with standard bold styling
    const intro = (whatsappState.message && whatsappState.message !== DEFAULT_MESSAGE)
      ? whatsappState.message.trim()
      : 'Hello! I would like to make an enquiry:'

    const lines = [
      intro,
      '',
      `*Name:* ${cleanName || 'Valued Customer'}`,
      `*WhatsApp:* ${cleanPhone}`
    ]
    if (cleanQuery) {
      lines.push(`*Requirement / Query:* ${cleanQuery}`)
    }
    lines.push('', 'Please get back to me. Thank you!')
    const finalMessage = lines.join('\n')

    // 3. Resolve active integrated WhatsApp target
    let target = activeAdminTarget
    if (!target || target === DEFAULT_NUMBER) {
      try {
        const saved = localStorage.getItem(LOCAL_KEY_SETTINGS)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.whatsappNumber && whatsappState.linkType !== 'custom_link') {
            target = parsed.whatsappNumber
          }
        }
      } catch {}
    }

    // 4. Open WhatsApp immediately via user synchronous gesture (avoids browser popup blocker)
    openWhatsApp(target, finalMessage)

    setIsSubmitting(false)
    setUserName('')
    setUserPhone('')
    setUserQuery('')
    setIsOpen(false)
  }

  // Direct chat bypass
  const handleDirectChat = () => {
    openWhatsApp(activeAdminTarget, whatsappState.message)
    setIsOpen(false)
  }

  return (
    <div className="global-whatsapp-fixed-wrapper">
      {/* Streamlined Clean Chat Popup */}
      {isOpen && (
        <div className="whatsapp-chat-popup" ref={popupRef}>
          {/* Header */}
          <div className="whatsapp-popup-header">
            <div className="whatsapp-header-info">
              <div className="whatsapp-agent-avatar">
                <FaWhatsapp />
                <span className="whatsapp-status-indicator" title="Online now"></span>
              </div>
              <div className="whatsapp-header-text">
                <h4>Customer Support</h4>
                <p>● Online | Quick reply</p>
              </div>
            </div>
            <button
              type="button"
              className="whatsapp-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>

          {/* Body */}
          <div className="whatsapp-popup-body">
            {/* Friendly Greeting */}
            <div className="whatsapp-chat-bubble-agent">
              👋 Hi there! Enter your <strong>details and query</strong> below to chat directly with our team.
            </div>

            {/* Clean Form with Name, Phone, and Query Message */}
            <form className="whatsapp-user-form-card" onSubmit={handleUserSubmit}>
              {/* Name Section */}
              <div className="whatsapp-input-group">
                <FaUser className="whatsapp-input-icon" />
                <input
                  type="text"
                  className="whatsapp-input-field"
                  placeholder="Your Name..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>

              {/* Number of Query Sender Field */}
              <div>
                <div className="whatsapp-input-group">
                  <FaPhoneAlt className="whatsapp-input-icon" />
                  <input
                    type="tel"
                    className="whatsapp-input-field"
                    placeholder="Your WhatsApp number..."
                    value={userPhone}
                    onChange={(e) => {
                      setUserPhone(e.target.value)
                      if (phoneError) setPhoneError('')
                    }}
                    required
                  />
                </div>
                {phoneError && <div className="whatsapp-error-hint">{phoneError}</div>}
              </div>

              {/* Query Message Section */}
              <div className="whatsapp-input-group" style={{ alignItems: 'flex-start' }}>
                <FaCommentDots className="whatsapp-input-icon" style={{ top: '10px' }} />
                <textarea
                  className="whatsapp-input-field whatsapp-textarea"
                  rows="2"
                  placeholder="Your Query / Requirement..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  required
                />
              </div>

              {/* Main CTA Button */}
              <button type="submit" className="whatsapp-submit-btn" disabled={isSubmitting}>
                <FaWhatsapp size={18} />
                <span>{isSubmitting ? 'Sending...' : 'Chat on WhatsApp'}</span>
              </button>

              {/* Minimal Bypass */}
              <button
                type="button"
                className="whatsapp-direct-link-btn"
                onClick={handleDirectChat}
              >
                Or open chat directly →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <div className="whatsapp-btn-row">
        {!isOpen && (
          <span className="whatsapp-tooltip-text">{whatsappState.tooltip}</span>
        )}
        <button
          type="button"
          className={`floating-whatsapp-btn ${isOpen ? 'is-active' : ''}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Close WhatsApp Chat' : 'Open WhatsApp Chat'}
          title={isOpen ? 'Close' : `Chat on WhatsApp`}
        >
          {!isOpen && <span className="whatsapp-pulse-ring"></span>}
          {isOpen ? (
            <FaTimes size={20} />
          ) : (
            <FaWhatsapp className="floating-whatsapp-icon" />
          )}
        </button>
      </div>
    </div>
  )
}

export default React.memo(WhatsAppButton)

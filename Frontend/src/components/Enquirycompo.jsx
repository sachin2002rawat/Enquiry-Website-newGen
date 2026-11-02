import React, { useState, useEffect } from 'react'
import { Smartphone, Mail, ArrowRight, Check, X, Tag, User } from 'lucide-react'
import { useEnquiryModal } from '../context/EnquiryModalContext'
import { apiService } from '../api/apiService'
import './Enquirycompo.css'

const Enquirycompo = ({ isModal = false, isOpen: customIsOpen, onClose: customOnClose }) => {
  const { isEnquiryOpen, closeEnquiryModal, selectedProduct } = useEnquiryModal()
  
  // Use passed prop or context state
  const isOpen = customIsOpen !== undefined ? customIsOpen : isEnquiryOpen
  const handleClose = customOnClose || closeEnquiryModal

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    request: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModal && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModal, isOpen, handleClose])

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isModal && isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isModal, isOpen])

  const [supportPhone, setSupportPhone] = useState(() => {
    try {
      const saved = localStorage.getItem('enquiry_admin_store_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.companyPhone || parsed.whatsappNumber || '9876543210'
      }
    } catch {}
    return '9876543210'
  })

  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const handleSettingsSync = () => {
      try {
        const saved = localStorage.getItem('enquiry_admin_store_settings')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.companyPhone || parsed.whatsappNumber) {
            setSupportPhone(parsed.companyPhone || parsed.whatsappNumber)
          }
        }
      } catch {}
    }
    window.addEventListener('storage', handleSettingsSync)
    return () => window.removeEventListener('storage', handleSettingsSync)
  }, [])

  // If in modal mode and closed, do not render
  if (isModal && !isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    if (errorMessage) setErrorMessage('')
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!formData.name.trim()) {
      setErrorMessage('Please enter your Customer Name.')
      return
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Please enter your Mobile Number.')
      return
    }

    setIsSubmitting(true)

    const targetProduct = selectedProduct || 'General Buying Requirement'
    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      message: formData.request.trim(),
      productName: targetProduct,
      source: 'Website'
    }

    try {
      const res = await apiService.submitEnquiry(payload)
      if (res && res.success) {
        const savedEnquiry = res.data || {
          _id: `enq-${Date.now()}`,
          id: Date.now(),
          ...payload,
          status: 'New',
          createdAt: new Date().toISOString()
        }

        // Sync into localStorage so Admin Panel Enquiry Table updates immediately
        try {
          const stored = localStorage.getItem('enquiry_admin_customer_enquiries')
          const list = stored ? JSON.parse(stored) : []
          const updatedList = [savedEnquiry, ...list]
          localStorage.setItem('enquiry_admin_customer_enquiries', JSON.stringify(updatedList))
          window.dispatchEvent(new Event('storage'))
          window.dispatchEvent(new CustomEvent('enquiry_created', { detail: savedEnquiry }))
        } catch (storageErr) {
          console.warn('LocalStorage enquiry sync error:', storageErr)
        }

        setIsSubmitted(true)
        setTimeout(() => {
          setIsSubmitted(false)
          setFormData({ name: '', phone: '', email: '', request: '' })
          if (isModal) {
            handleClose()
          }
        }, 2200)
      } else {
        setErrorMessage(res?.message || 'Failed to submit enquiry. Please check your information.')
      }
    } catch (err) {
      console.error('Enquiry submission error:', err)
      setErrorMessage('Network error occurred. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const cardContent = (
    <div 
      className={`enquiry-card ${isModal ? 'is-modal-card' : ''}`} 
      onClick={(e) => e.stopPropagation()}
    >
      
      {/* Modal Close Button (X) */}
      {isModal && (
        <button
          type="button"
          className="enquiry-modal-close-btn"
          onClick={handleClose}
          aria-label="Close Enquiry Form"
        >
          <X size={18} />
        </button>
      )}

      {/* Card Header Title & Subtitle */}
      <h2 className="enquiry-title">Buying Requirement Details</h2>
      <p className="enquiry-subtitle">
        Fill up form below for enquiry and our Expert will contact you soon.
      </p>

      {selectedProduct && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          fontSize: '0.82rem',
          fontWeight: 700,
          padding: '4px 12px',
          borderRadius: '20px',
          border: '1px solid #bfdbfe',
          margin: '0 auto 16px',
          alignSelf: 'center'
        }}>
          <Tag size={13} />
          <span>Product: {selectedProduct}</span>
        </div>
      )}

      {isSubmitted ? (
        <div className="enquiry-success-message">
          <div className="enquiry-success-icon">
            <Check size={26} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0f172a' }}>
            Enquiry Submitted Successfully!
          </h3>
          <p style={{ color: '#475569', fontSize: '0.9rem' }}>
            Thank you for reaching out. A confirmation copy has been sent to your email address, and our expert will contact you shortly.
          </p>
        </div>
      ) : (
        <form className="enquiry-form" onSubmit={handleSubmit}>
          
          {/* Field 0: Customer Name (Required, Star *) */}
          <div className="enquiry-field-group">
            <label htmlFor="name" className="enquiry-label">
              Customer Name *
            </label>
            <div className="enquiry-input-wrapper">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="enquiry-input"
                placeholder="Enter your name"
                required
              />
              <User className="enquiry-field-icon" size={18} />
            </div>
          </div>

          {/* Field 1: Mobile Number (Required, Star *) */}
          <div className="enquiry-field-group">
            <label htmlFor="phone" className="enquiry-label">
              Mobile Number *
            </label>
            <div className="enquiry-input-wrapper">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="enquiry-input"
                required
              />
              <Smartphone className="enquiry-field-icon" size={18} />
            </div>
          </div>

          {/* Field 2: Email Address (Optional, No Star) */}
          <div className="enquiry-field-group">
            <label htmlFor="email" className="enquiry-label">
              Email Address
            </label>
            <div className="enquiry-input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="enquiry-input"
                placeholder="Enter email to receive confirmation copy"
              />
              <Mail className="enquiry-field-icon" size={18} />
            </div>
          </div>

          {/* Field 3: Your Enquiry (Textarea) */}
          <div className="enquiry-field-group">
            <label htmlFor="request" className="enquiry-label">
              Your Enquiry
            </label>
            <div className="enquiry-input-wrapper">
              <textarea
                id="request"
                name="request"
                value={formData.request}
                onChange={handleChange}
                className="enquiry-input enquiry-textarea"
                placeholder="Write your enquiry details here..."
                rows={3}
              />
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '14px',
              fontWeight: 500
            }}>
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="enquiry-submit-btn" disabled={isSubmitting}>
            <span>{isSubmitting ? 'Sending Enquiry...' : 'Send Enquiry'}</span>
            <span className="enquiry-btn-arrow">
              <ArrowRight size={18} />
            </span>
          </button>

          {/* Consent Disclaimer Copy */}
          <p className="enquiry-consent-text">
            By sending, you consent to us contacting you regarding inquiry.
          </p>

          {/* Bottom Call Tag Inside Form Flow */}
          <a href={`tel:${supportPhone}`} className="enquiry-call-tag">
            Call us directly: <span className="enquiry-call-number">{supportPhone}</span>
          </a>
        </form>
      )}

    </div>
  )

  if (isModal) {
    return (
      <div className="enquiry-modal-backdrop" onClick={handleClose}>
        {cardContent}
      </div>
    )
  }

  return (
    <section className="enquiry-section-wrapper">
      {cardContent}
    </section>
  )
}

export default Enquirycompo

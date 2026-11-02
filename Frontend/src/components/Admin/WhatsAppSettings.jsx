import React, { useState, useEffect } from 'react'
import {
  FaWhatsapp,
  FaRegCopy,
  FaCheck,
  FaExternalLinkAlt,
  FaPhoneAlt,
  FaCommentDots,
  FaToggleOn,
  FaToggleOff,
  FaSave,
  FaUndo,
  FaLink
} from 'react-icons/fa'
import { FiRefreshCw } from 'react-icons/fi'
import { apiService } from '../../api/apiService'
import { sanitizeWhatsAppNumber, getWhatsAppUrl, openWhatsApp, isWhatsAppUrl } from '../../utils/whatsappHelper'

const LOCAL_KEY_SETTINGS = 'enquiry_admin_store_settings'
const DEFAULT_NUMBER = '+91 9876543210'
const DEFAULT_MESSAGE = 'Hello! I would like to make an enquiry.'
const DEFAULT_TOOLTIP = 'Chat with Us'

const WhatsAppSettings = ({ storeSettings, setStoreSettings, showToast }) => {
  const [formData, setFormData] = useState({
    whatsappNumber: storeSettings?.whatsappNumber || DEFAULT_NUMBER,
    whatsappLinkType: storeSettings?.whatsappLinkType || 'number',
    whatsappCustomUrl: storeSettings?.whatsappCustomUrl || '',
    whatsappMessage: storeSettings?.whatsappMessage || DEFAULT_MESSAGE,
    whatsappEnabled: storeSettings?.whatsappEnabled !== false,
    whatsappTooltipText: storeSettings?.whatsappTooltipText || DEFAULT_TOOLTIP
  })

  const [isSaving, setIsSaving] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Sync if parent storeSettings updates
  useEffect(() => {
    if (storeSettings) {
      setFormData({
        whatsappNumber: storeSettings.whatsappNumber || DEFAULT_NUMBER,
        whatsappLinkType: storeSettings.whatsappLinkType || (isWhatsAppUrl(storeSettings.whatsappCustomUrl) ? 'custom_link' : 'number'),
        whatsappCustomUrl: storeSettings.whatsappCustomUrl || '',
        whatsappMessage: storeSettings.whatsappMessage || DEFAULT_MESSAGE,
        whatsappEnabled: storeSettings.whatsappEnabled !== false,
        whatsappTooltipText: storeSettings.whatsappTooltipText || DEFAULT_TOOLTIP
      })
    }
  }, [storeSettings])

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === 'whatsappNumber' && isWhatsAppUrl(value)) {
        updated.whatsappLinkType = 'custom_link'
        updated.whatsappCustomUrl = value
      }
      return updated
    })
  }

  // Active target for redirection (custom URL or phone number)
  const activeTarget =
    formData.whatsappLinkType === 'custom_link' && formData.whatsappCustomUrl
      ? formData.whatsappCustomUrl
      : formData.whatsappNumber || DEFAULT_NUMBER

  const previewUrl = getWhatsAppUrl(activeTarget, formData.whatsappMessage)

  const handleCopyLink = () => {
    if (!previewUrl) return
    navigator.clipboard.writeText(previewUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
    if (showToast) showToast('WhatsApp link copied!')
  }

  const handleTestClick = () => {
    if (!activeTarget) {
      if (showToast) showToast('Please enter a WhatsApp number or link first!')
      return
    }
    openWhatsApp(activeTarget, formData.whatsappMessage)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updatedStore = {
        ...storeSettings,
        whatsappNumber: formData.whatsappNumber.trim(),
        whatsappLinkType: formData.whatsappLinkType,
        whatsappCustomUrl: formData.whatsappCustomUrl.trim(),
        whatsappMessage: formData.whatsappMessage.trim(),
        whatsappEnabled: formData.whatsappEnabled,
        whatsappTooltipText: formData.whatsappTooltipText.trim()
      }

      localStorage.setItem(LOCAL_KEY_SETTINGS, JSON.stringify(updatedStore))
      if (setStoreSettings) {
        setStoreSettings(updatedStore)
      }

      window.dispatchEvent(
        new CustomEvent('whatsappSettingsChanged', {
          detail: {
            whatsappNumber: updatedStore.whatsappNumber,
            whatsappLinkType: updatedStore.whatsappLinkType,
            whatsappCustomUrl: updatedStore.whatsappCustomUrl,
            whatsappMessage: updatedStore.whatsappMessage,
            whatsappEnabled: updatedStore.whatsappEnabled,
            whatsappTooltipText: updatedStore.whatsappTooltipText
          }
        })
      )
      window.dispatchEvent(new Event('storage'))

      try {
        await apiService.updateWhatsappSettings({
          whatsappNumber: updatedStore.whatsappNumber,
          whatsappLinkType: updatedStore.whatsappLinkType,
          whatsappCustomUrl: updatedStore.whatsappCustomUrl,
          whatsappMessage: updatedStore.whatsappMessage,
          whatsappEnabled: updatedStore.whatsappEnabled,
          whatsappTooltipText: updatedStore.whatsappTooltipText
        })
      } catch {
        await apiService.updateSettings(updatedStore)
      }

      if (showToast) showToast('WhatsApp settings saved successfully!')
    } catch (err) {
      if (showToast) showToast('Settings saved locally.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setFormData({
      whatsappNumber: DEFAULT_NUMBER,
      whatsappLinkType: 'number',
      whatsappCustomUrl: '',
      whatsappMessage: DEFAULT_MESSAGE,
      whatsappEnabled: true,
      whatsappTooltipText: DEFAULT_TOOLTIP
    })
    if (showToast) showToast('Reset to default WhatsApp configuration')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* 1. Sleek Compact Header Card */}
      <div
        className="admin-card"
        style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
          color: '#FFFFFF',
          padding: '20px 24px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: '#4ADE80'
            }}
          >
            <FaWhatsapp />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                WhatsApp Settings
              </h2>
              <button
                type="button"
                onClick={() => handleChange('whatsappEnabled', !formData.whatsappEnabled)}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '16px',
                  backgroundColor: formData.whatsappEnabled ? 'rgba(74, 222, 128, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                  color: formData.whatsappEnabled ? '#86EFAC' : '#FCA5A5',
                  border: `1px solid ${formData.whatsappEnabled ? 'rgba(74, 222, 128, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  cursor: 'pointer'
                }}
              >
                {formData.whatsappEnabled ? '● Active' : '○ Hidden'}
              </button>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#D1FAE5' }}>
              Configure your phone number or direct WhatsApp link for storefront customer enquiries.
            </p>
          </div>
        </div>

        {/* Live Target Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '0.86rem',
              fontWeight: 700,
              color: '#FFFFFF',
              maxWidth: '220px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {activeTarget || 'Not Set'}
          </div>
          <button
            type="button"
            onClick={handleTestClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#25D366',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <span>Test</span>
            <FaExternalLinkAlt size={11} />
          </button>
        </div>
      </div>

      {/* 2. Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.95fr)', gap: '20px' }}>
        {/* Left: Clean Form */}
        <div className="admin-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: 'var(--admin-text-main)' }}>
            Destination & Greeting
          </h3>

          {/* Mode Selector Pill */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => handleChange('whatsappLinkType', 'number')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '7px',
                border: 'none',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: formData.whatsappLinkType === 'number' ? '#FFFFFF' : 'transparent',
                color: formData.whatsappLinkType === 'number' ? '#059669' : '#64748B',
                boxShadow: formData.whatsappLinkType === 'number' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <FaPhoneAlt size={12} />
              <span>Phone Number</span>
            </button>

            <button
              type="button"
              onClick={() => handleChange('whatsappLinkType', 'custom_link')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '7px',
                border: 'none',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: formData.whatsappLinkType === 'custom_link' ? '#FFFFFF' : 'transparent',
                color: formData.whatsappLinkType === 'custom_link' ? '#059669' : '#64748B',
                boxShadow: formData.whatsappLinkType === 'custom_link' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <FaLink size={12} />
              <span>Direct Link / URL</span>
            </button>
          </div>

          {/* Input 1: Phone or Link */}
          {formData.whatsappLinkType === 'number' ? (
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--admin-text-main)', marginBottom: '6px' }}>
                WhatsApp Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                  placeholder="+91 9876543210"
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    borderRadius: '8px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    border: '1.5px solid #94A3B8',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
                  }}
                />
                <FaPhoneAlt style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#059669', fontSize: '13px' }} />
              </div>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--admin-text-main)', marginBottom: '6px' }}>
                Direct WhatsApp Link / Chat URL
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="url"
                  className="form-input"
                  value={formData.whatsappCustomUrl}
                  onChange={(e) => handleChange('whatsappCustomUrl', e.target.value)}
                  placeholder="https://wa.me/919876543210 or https://chat.whatsapp.com/..."
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    border: '1.5px solid #94A3B8',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
                  }}
                />
                <FaLink style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#059669', fontSize: '13px' }} />
              </div>
            </div>
          )}

          {/* Input 2: Pre-filled Message */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--admin-text-main)', marginBottom: '6px' }}>
              Pre-filled Customer Message
            </label>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.whatsappMessage}
              onChange={(e) => handleChange('whatsappMessage', e.target.value)}
              placeholder="Hello! I would like to make an enquiry."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                border: '1.5px solid #94A3B8',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Input 3: Tooltip Label */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--admin-text-main)', marginBottom: '6px' }}>
              Floating Button Tooltip
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.whatsappTooltipText}
              onChange={(e) => handleChange('whatsappTooltipText', e.target.value)}
              placeholder="Chat with Us"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                border: '1.5px solid #94A3B8',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
              }}
            />
          </div>

          {/* Input 4: Toggle Widget Display */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '10px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0F172A' }}>
                Show Floating Button on Website
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                {formData.whatsappEnabled ? 'Widget is visible on storefront.' : 'Widget is currently hidden.'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleChange('whatsappEnabled', !formData.whatsappEnabled)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.75rem', color: formData.whatsappEnabled ? '#059669' : '#94A3B8', display: 'flex', padding: 0 }}
            >
              {formData.whatsappEnabled ? <FaToggleOn /> : <FaToggleOff />}
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={handleSave}
              disabled={isSaving}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {isSaving ? <FiRefreshCw className="spin" size={15} /> : <FaSave size={15} />}
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>

            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '11px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              <FaUndo size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Right: Clean Live Preview */}
        <div className="admin-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: 'var(--admin-text-main)' }}>
              Storefront Preview
            </h3>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              Live
            </span>
          </div>

          {/* Clean Website Mock Corner */}
          <div
            style={{
              position: 'relative',
              height: '220px',
              borderRadius: '12px',
              backgroundColor: '#FAF5EF',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '16px'
            }}
          >
            <div style={{ maxWidth: '65%' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em' }}>
                — STOREFRONT
              </span>
              <h4 style={{ margin: '3px 0', fontSize: '0.92rem', fontWeight: 800, color: '#1E293B' }}>
                About Our Company
              </h4>
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748B', lineHeight: 1.4 }}>
                Our commitment to quality, innovation, and customer satisfaction...
              </p>
            </div>

            {formData.whatsappEnabled ? (
              <div style={{ position: 'absolute', bottom: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#0F172A', color: '#FFFFFF', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '14px', whiteSpace: 'nowrap' }}>
                  {formData.whatsappTooltipText || 'Chat with Us'}
                </span>
                <button
                  type="button"
                  onClick={handleTestClick}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    color: '#FFFFFF',
                    border: '2px solid rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 6px 16px rgba(37, 211, 102, 0.45)',
                    fontSize: '24px'
                  }}
                  title="Click to test redirect"
                >
                  <FaWhatsapp />
                </button>
              </div>
            ) : (
              <div style={{ position: 'absolute', bottom: '16px', right: '16px', padding: '6px 12px', borderRadius: '8px', backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: '0.74rem', fontWeight: 600 }}>
                Widget is hidden
              </div>
            )}
          </div>

          {/* Clean URL Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.78rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
              Target: <strong style={{ color: '#0F172A' }}>{activeTarget}</strong>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: copiedLink ? '#059669' : '#2563EB', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {copiedLink ? <FaCheck size={11} /> : <FaRegCopy size={11} />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(WhatsAppSettings)

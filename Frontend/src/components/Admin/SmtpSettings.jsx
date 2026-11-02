import React, { useState, useEffect } from 'react'
import {
  FiMail,
  FiServer,
  FiShield,
  FiLock,
  FiUser,
  FiSave,
  FiSend,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiAlertCircle,
  FiSettings,
  FiInbox,
  FiCheck,
  FiZap,
  FiBell,
  FiArrowRight,
  FiLayers
} from 'react-icons/fi'
import { apiService } from '../../api/apiService'

const LOCAL_KEY_SMTP = 'enquiry_admin_smtp_settings'

const DEFAULT_SMTP = {
  enabled: true,
  provider: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  encryption: 'TLS',
  user: '',
  password: '',
  fromName: 'QuickEnquiry Notifications',
  fromEmail: '',
  replyTo: '',
  adminRecipient: '',
  notifyOnNewEnquiry: true,
  sendCustomerReceipt: true,
  lowStockAlert: false
}

const PRESETS = [
  {
    id: 'gmail',
    name: 'Gmail',
    tag: 'Google Workspace',
    color: '#EA4335',
    bg: '#FEF2F2',
    border: '#FECACA',
    host: 'smtp.gmail.com',
    port: 587,
    encryption: 'TLS'
  },
  {
    id: 'outlook',
    name: 'Microsoft 365',
    tag: 'Outlook / Exchange',
    color: '#0078D4',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    host: 'smtp.office365.com',
    port: 587,
    encryption: 'STARTTLS'
  },
  {
    id: 'ses',
    name: 'Amazon SES',
    tag: 'AWS Cloud Mail',
    color: '#FF9900',
    bg: '#FFFBEB',
    border: '#FDE68A',
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    encryption: 'TLS'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    tag: 'Twilio Platform',
    color: '#1A82E2',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    host: 'smtp.sendgrid.net',
    port: 587,
    encryption: 'TLS'
  },
  {
    id: 'mailgun',
    name: 'Mailgun',
    tag: 'Transactional API',
    color: '#E11D48',
    bg: '#FFF1F2',
    border: '#FECDD3',
    host: 'smtp.mailgun.org',
    port: 587,
    encryption: 'TLS'
  },
  {
    id: 'custom',
    name: 'Custom SMTP',
    tag: 'Private / Dedicated',
    color: '#4F46E5',
    bg: '#EEF2FF',
    border: '#C7D2FE',
    host: '',
    port: 587,
    encryption: 'TLS'
  }
]

const SmtpSettings = ({ storeSettings, setStoreSettings, showToast }) => {
  const [smtpForm, setSmtpForm] = useState(() => {
    try {
      if (storeSettings && storeSettings.smtp && storeSettings.smtp.user) {
        return { ...DEFAULT_SMTP, ...storeSettings.smtp }
      }
      const saved = localStorage.getItem(LOCAL_KEY_SMTP)
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return DEFAULT_SMTP
  })

  // Synchronize with database settings once loaded
  useEffect(() => {
    if (storeSettings && storeSettings.smtp) {
      const isPlaceholder = (val) => !val || String(val).includes('quick-enquiry.co') || String(val).includes('yourdomain.com')
      const dbUser = isPlaceholder(storeSettings.smtp.user) ? '' : storeSettings.smtp.user
      const dbRecipient = isPlaceholder(storeSettings.smtp.adminRecipient)
        ? (storeSettings.smtp.replyTo || dbUser)
        : storeSettings.smtp.adminRecipient
      const dbReply = isPlaceholder(storeSettings.smtp.replyTo) ? (dbRecipient || dbUser) : storeSettings.smtp.replyTo
      const dbFrom = isPlaceholder(storeSettings.smtp.fromEmail) ? dbUser : storeSettings.smtp.fromEmail

      setSmtpForm((prev) => ({
        ...prev,
        ...storeSettings.smtp,
        port: Number(storeSettings.smtp.port) || 587,
        user: dbUser || prev.user || '',
        fromEmail: dbFrom || dbUser || prev.fromEmail || '',
        replyTo: dbReply || prev.replyTo || '',
        adminRecipient: dbRecipient || prev.adminRecipient || '',
        password: storeSettings.smtp.password || prev.password || ''
      }))
    }
  }, [storeSettings?.smtp])

  const [showPassword, setShowPassword] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testEmailRecipient, setTestEmailRecipient] = useState('')
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)

  const handleChange = (field, value) => {
    setSmtpForm((prev) => {
      const updated = { ...prev, [field]: value }
      // When user updates their SMTP login email, keep sender fromEmail in sync if unset
      if (field === 'user') {
        const trimmed = (value || '').trim()
        if (!prev.fromEmail || prev.fromEmail === prev.user || prev.fromEmail.includes('quick-enquiry.co')) {
          updated.fromEmail = trimmed
        }
      }
      return updated
    })
  }

  const handleApplyPreset = (preset) => {
    setSmtpForm((prev) => ({
      ...prev,
      provider: preset.id,
      host: preset.host || prev.host,
      port: preset.port,
      encryption: preset.encryption
    }))
    if (showToast) {
      showToast(`Selected ${preset.name} (${preset.encryption} • Port ${preset.port})`)
    }
  }

  const handleSave = async () => {
    try {
      const targetInbox = smtpForm.adminRecipient || smtpForm.replyTo || smtpForm.user || 'configured email'
      const payload = {
        ...smtpForm,
        adminRecipient: smtpForm.adminRecipient || smtpForm.replyTo || smtpForm.user,
        replyTo: smtpForm.replyTo || smtpForm.adminRecipient || smtpForm.user
      }
      localStorage.setItem(LOCAL_KEY_SMTP, JSON.stringify(payload))
      if (setStoreSettings) {
        setStoreSettings((prev) => ({ ...prev, smtp: payload }))
      }
      const res = await apiService.updateSettings({ smtp: payload })
      if (res && res.data && setStoreSettings) {
        setStoreSettings(res.data)
      }
      window.dispatchEvent(new Event('storage'))
      if (showToast) {
        showToast(`SMTP settings saved! Enquiry leads will be delivered to: ${targetInbox}`)
      }
    } catch {
      if (showToast) {
        showToast('Saved to local storage!', 'warning')
      }
    }
  }

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      if (showToast) showToast('Please enter a valid recipient email address', 'warning')
      return
    }

    setIsTesting(true)
    try {
      const res = await apiService.testSmtp({
        ...smtpForm,
        testEmail: testEmailRecipient
      })
      if (res && res.success) {
        setIsTestModalOpen(false)
        if (showToast) {
          showToast(res.message || `Verification test email dispatched to ${testEmailRecipient}!`, 'success')
        }
        setTestEmailRecipient('')
      } else {
        const errMsg = res?.message || 'SMTP connection verification failed. Please check host, port, and credentials.'
        if (showToast) {
          showToast(`SMTP Error: ${errMsg}`, 'error')
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to send test email'
      if (showToast) {
        showToast(`SMTP Error: ${errMsg}`, 'error')
      }
    } finally {
      setIsTesting(false)
    }
  }

  const activePreset = PRESETS.find((p) => p.id === smtpForm.provider) || PRESETS[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Sleek Action Bar & Gateway Status (No Duplicate Title) */}
      <div
        className="admin-card"
        style={{
          padding: '16px 22px',
          marginBottom: 0,
          background: '#FFFFFF',
          borderRadius: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '30px',
                backgroundColor: smtpForm.enabled ? '#ECFDF5' : '#FEF2F2',
                border: `1px solid ${smtpForm.enabled ? '#A7F3D0' : '#FECACA'}`,
                color: smtpForm.enabled ? '#065F46' : '#991B1B',
                fontSize: '0.82rem',
                fontWeight: 700
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: smtpForm.enabled ? '#10B981' : '#EF4444',
                  boxShadow: smtpForm.enabled ? '0 0 8px rgba(16, 185, 129, 0.6)' : 'none'
                }}
              />
              {smtpForm.enabled ? 'SMTP Gateway Ready' : 'Service Suspended'}
            </div>

            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
              Provider: <strong style={{ color: '#0F172A' }}>{activePreset.name}</strong> • Port <strong style={{ color: '#0F172A' }}>{smtpForm.port}</strong> ({smtpForm.encryption})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsTestModalOpen(true)}
              style={{
                fontSize: '0.84rem',
                padding: '8px 16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '8px'
              }}
            >
              <FiSend size={14} /> Send Test Email
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #4338CA)',
                borderColor: '#4338CA',
                fontSize: '0.84rem',
                padding: '8px 20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
              }}
            >
              <FiSave size={15} /> Save Configuration
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sleek KPI Metrics Cards (Properly Sized & Formatted) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Metric 1 */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--admin-card-border)',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            borderLeft: '4px solid #6366F1'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#EEF2FF',
              color: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
              flexShrink: 0
            }}
          >
            <FiServer />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              MTA Server
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activePreset.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#4F46E5', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {smtpForm.host || 'smtp.server'}
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--admin-card-border)',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            borderLeft: '4px solid #059669'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
              flexShrink: 0
            }}
          >
            <FiShield />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              Security & Port
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
              Port {smtpForm.port}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
              {smtpForm.encryption} Encrypted
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--admin-card-border)',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            borderLeft: '4px solid #D97706'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
              flexShrink: 0
            }}
          >
            <FiMail />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              Sender Envelope
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {smtpForm.fromName || 'Store Alerts'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {smtpForm.fromEmail || 'no-reply'}
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--admin-card-border)',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            borderLeft: '4px solid #0284C7'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#E0F2FE',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
              flexShrink: 0
            }}
          >
            <FiZap />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              Dispatch Status
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: smtpForm.enabled ? '#059669' : '#DC2626' }}>
              {smtpForm.enabled ? 'Active' : 'Disabled'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#0284C7', fontWeight: 600 }}>
              {smtpForm.notifyOnNewEnquiry ? 'Enquiry Alerts On' : 'Alerts Paused'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Modern Provider Selector Cards */}
      <div className="admin-card" style={{ padding: '20px', marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
              Select Email Provider
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '3px 0 0 0' }}>
              Click any provider to automatically populate host, port, and security specifications.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
          {PRESETS.map((p) => {
            const isSelected = smtpForm.provider === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: isSelected ? `2px solid ${p.color}` : '1px solid var(--admin-card-border)',
                  backgroundColor: isSelected ? p.bg : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? `0 4px 12px ${p.color}25` : 'none'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#FFFFFF' : p.bg,
                    border: `1px solid ${p.border}`,
                    color: p.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    flexShrink: 0
                  }}
                >
                  {p.name.charAt(0)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: isSelected ? p.color : '#0F172A' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.tag}
                  </div>
                </div>
                {isSelected && <FiCheck size={16} color={p.color} style={{ strokeWidth: 3 }} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Two-Column Settings Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Left Column: Server Credentials */}
        <div className="admin-card" style={{ padding: '22px', marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--admin-card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#EEF2FF',
                  color: '#4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiServer size={16} />
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Mail Server & Credentials
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748B' }}>Service Active</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={smtpForm.enabled}
                  onChange={(e) => handleChange('enabled', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>SMTP Host / Server Address</label>
              <input
                type="text"
                className="form-input"
                value={smtpForm.host}
                onChange={(e) => handleChange('host', e.target.value)}
                placeholder="e.g. smtp.gmail.com"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>Port</label>
                <input
                  type="number"
                  className="form-input"
                  value={smtpForm.port || 587}
                  onChange={(e) => handleChange('port', Number(e.target.value) || 587)}
                  placeholder="587"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>Encryption Protocol</label>
                <select
                  className="form-input"
                  value={smtpForm.encryption || 'TLS'}
                  onChange={(e) => handleChange('encryption', e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="TLS">TLS (Port 587)</option>
                  <option value="STARTTLS">STARTTLS (Port 587)</option>
                  <option value="SSL">SSL (Port 465)</option>
                  <option value="None">None (Port 25)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>Username / SMTP Login Account</label>
              <input
                type="text"
                className="form-input"
                value={smtpForm.user}
                onChange={(e) => handleChange('user', e.target.value)}
                placeholder="e.g. yourbusiness@gmail.com"
              />
              <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                Your mail server authentication username / login account (used for SMTP handshake).
              </span>
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>Password / App Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ width: '100%', paddingRight: '40px' }}
                  value={smtpForm.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="App-specific password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                For Gmail, use a 16-character <strong>App Password</strong> generated in Google Security settings.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Sender Identity & Triggers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sender Identity Card */}
          <div className="admin-card" style={{ padding: '22px', marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid var(--admin-card-border)', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiUser size={16} />
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Sender Identity & Headers
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>Sender Name (From Name)</label>
                <input
                  type="text"
                  className="form-input"
                  value={smtpForm.fromName}
                  onChange={(e) => handleChange('fromName', e.target.value)}
                  placeholder="e.g. Your Company Name"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>Sender Email (From Address)</label>
                <input
                  type="email"
                  className="form-input"
                  value={smtpForm.fromEmail}
                  onChange={(e) => handleChange('fromEmail', e.target.value)}
                  placeholder="e.g. yourbusiness@gmail.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>Reply-To Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={smtpForm.replyTo}
                  onChange={(e) => handleChange('replyTo', e.target.value)}
                  placeholder="e.g. yourbusiness@gmail.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem', color: '#0F172A' }}>
                  Enquiry Alert Recipient (Where You Receive Leads)
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={smtpForm.adminRecipient}
                  onChange={(e) => handleChange('adminRecipient', e.target.value)}
                  placeholder="e.g. yourprimary@gmail.com"
                />
                <span style={{ fontSize: '0.72rem', color: '#059669', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiInbox size={12} /> New customer buying requirements & enquiry alerts will be delivered to this inbox.
                </span>
              </div>
            </div>
          </div>

          {/* Automated Notification Triggers Card */}
          <div className="admin-card" style={{ padding: '22px', marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid var(--admin-card-border)', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiBell size={16} />
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Notification Triggers
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0F172A' }}>New Enquiry Alert</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Deliver instant buyer lead to admin email</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={smtpForm.notifyOnNewEnquiry}
                    onChange={(e) => handleChange('notifyOnNewEnquiry', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0F172A' }}>Customer Auto-Reply</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Send immediate receipt confirmation to buyer</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={smtpForm.sendCustomerReceipt}
                    onChange={(e) => handleChange('sendCustomerReceipt', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0F172A' }}>Low Stock Inventory Alert</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Notify when catalog items go out of stock</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={smtpForm.lowStockAlert}
                    onChange={(e) => handleChange('lowStockAlert', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Modern Test Email Modal */}
      {isTestModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsTestModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '460px', borderRadius: '14px', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiSend size={15} />
                </div>
                <h3 className="modal-title" style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Send SMTP Verification Test</h3>
              </div>
            </div>

            <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.78rem', color: '#475569' }}>
                Connecting to: <strong style={{ color: '#0F172A' }}>{smtpForm.host}:{smtpForm.port}</strong> ({smtpForm.encryption})
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Recipient Test Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  placeholder="admin@yourcompany.com"
                  autoFocus
                />
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsTestModalOpen(false)}
                disabled={isTesting}
                style={{ fontSize: '0.82rem', padding: '7px 14px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSendTestEmail}
                disabled={isTesting}
                style={{
                  background: 'linear-gradient(135deg, #4F46E5, #4338CA)',
                  fontSize: '0.82rem',
                  padding: '7px 18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isTesting ? (
                  <>
                    <FiRefreshCw size={13} className="spin" /> Dispathing...
                  </>
                ) : (
                  <>
                    <FiSend size={13} /> Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(SmtpSettings)

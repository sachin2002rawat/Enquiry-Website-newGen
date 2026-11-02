import React, { useState } from 'react'
import {
  FiCloud,
  FiKey,
  FiLock,
  FiFolder,
  FiSave,
  FiCheck,
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiZap,
  FiHelpCircle,
  FiExternalLink,
  FiRefreshCw,
  FiShield
} from 'react-icons/fi'
import { apiService } from '../../api/apiService'

const LOCAL_KEY_CLOUDINARY = 'enquiry_admin_cloudinary_settings'

const DEFAULT_CLOUDINARY = {
  enabled: true,
  cloudName: '',
  apiKey: '',
  apiSecret: '',
  folder: 'enquiry_products'
}

const CloudinarySettings = ({ storeSettings, setStoreSettings, showToast }) => {
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_CLOUDINARY)
      if (saved) return JSON.parse(saved)
      if (storeSettings && storeSettings.cloudinary) {
        return { ...DEFAULT_CLOUDINARY, ...storeSettings.cloudinary }
      }
    } catch {
      // fallback
    }
    return DEFAULT_CLOUDINARY
  })

  const [showSecret, setShowSecret] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      localStorage.setItem(LOCAL_KEY_CLOUDINARY, JSON.stringify(form))
      if (setStoreSettings) {
        setStoreSettings((prev) => ({ ...prev, cloudinary: form }))
      }
      await apiService.updateSettings({ cloudinary: form })
      window.dispatchEvent(new Event('storage'))
      if (showToast) {
        showToast('Cloudinary settings saved & synchronized with backend successfully!')
      }
    } catch {
      if (showToast) {
        showToast('Saved to local storage!', 'warning')
      }
    }
  }

  const handleTestConnection = async () => {
    if (!form.cloudName || !form.apiKey || !form.apiSecret) {
      if (showToast) showToast('Please fill in Cloud Name, API Key, and API Secret first', 'warning')
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const res = await apiService.testCloudinary({
        cloudName: form.cloudName,
        apiKey: form.apiKey,
        apiSecret: form.apiSecret
      })

      if (res && res.success) {
        setTestResult({
          success: true,
          message: res.message || `Successfully connected to Cloudinary cloud "${form.cloudName}"!`
        })
        if (showToast) showToast(`Cloudinary Connection Verified!`, 'success')
      } else {
        setTestResult({
          success: false,
          error: res?.error || res?.message || 'Verification failed. Please check credentials.'
        })
        if (showToast) showToast(`Connection Error: ${res?.error || 'Invalid credentials'}`, 'warning')
      }
    } catch (err) {
      setTestResult({
        success: false,
        error: err.message || 'Network error occurred while verifying Cloudinary'
      })
      if (showToast) showToast(`Error: ${err.message}`, 'error')
    } finally {
      setIsTesting(false)
    }
  }

  const isConfigured = Boolean(form.cloudName && form.apiKey && form.apiSecret)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Action Bar & Gateway Status Banner */}
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
                backgroundColor: form.enabled && isConfigured ? '#ECFDF5' : form.enabled ? '#EFF6FF' : '#FEF2F2',
                border: `1px solid ${form.enabled && isConfigured ? '#A7F3D0' : form.enabled ? '#BFDBFE' : '#FECACA'}`,
                color: form.enabled && isConfigured ? '#065F46' : form.enabled ? '#1E40AF' : '#991B1B',
                fontSize: '0.82rem',
                fontWeight: 700
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: form.enabled && isConfigured ? '#10B981' : form.enabled ? '#3B82F6' : '#EF4444',
                  boxShadow: form.enabled && isConfigured ? '0 0 8px rgba(16, 185, 129, 0.6)' : 'none'
                }}
              />
              {form.enabled && isConfigured
                ? 'Cloudinary Gateway Ready'
                : form.enabled
                ? 'Awaiting Credentials'
                : 'Service Disabled'}
            </div>

            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
              Cloud: <strong style={{ color: '#0F172A' }}>{form.cloudName || 'Not configured'}</strong> • Folder: <strong style={{ color: '#0F172A' }}>{form.folder || 'enquiry_products'}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setIsTestModalOpen(true)
                setTestResult(null)
              }}
              style={{
                fontSize: '0.84rem',
                padding: '8px 16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '8px'
              }}
            >
              <FiZap size={14} /> Test Connection
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #0284C7, #0369A1)',
                borderColor: '#0284C7',
                fontSize: '0.84rem',
                padding: '8px 20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
              }}
            >
              <FiSave size={15} /> Save Configuration
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Metric 1: Cloud Name */}
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
            <FiCloud />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              Cloud Name
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {form.cloudName || 'Not Set'}
            </div>
            <div style={{ fontSize: '0.72rem', color: form.cloudName ? '#0284C7' : '#94A3B8', fontWeight: 600 }}>
              {form.cloudName ? 'Custom Cloud Active' : 'Requires Cloud Name'}
            </div>
          </div>
        </div>

        {/* Metric 2: API Key */}
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
            <FiKey />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              API Key Status
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
              {form.apiKey ? `${form.apiKey.slice(0, 4)}••••${form.apiKey.slice(-4)}` : 'Not Set'}
            </div>
            <div style={{ fontSize: '0.72rem', color: form.apiKey ? '#059669' : '#DC2626', fontWeight: 600 }}>
              {form.apiKey ? 'Public Key Attached' : 'Missing API Key'}
            </div>
          </div>
        </div>

        {/* Metric 3: Target Folder */}
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
            borderLeft: '4px solid #8B5CF6'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#EDE9FE',
              color: '#8B5CF6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
              flexShrink: 0
            }}
          >
            <FiFolder />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              Target Folder
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {form.folder || 'enquiry_products'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#8B5CF6', fontWeight: 600 }}>
              Asset Namespace
            </div>
          </div>
        </div>

        {/* Metric 4: Service Status */}
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
            borderLeft: '4px solid #F59E0B'
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
            <FiShield />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              Upload Engine
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: form.enabled ? '#059669' : '#DC2626' }}>
              {form.enabled ? 'Enabled' : 'Disabled'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
              Direct Cloud Delivery
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Configuration & Help Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Left Card: Cloudinary API Credentials Form */}
        <div className="admin-card" style={{ padding: '22px', marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--admin-card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#E0F2FE',
                  color: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiCloud size={16} />
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Cloudinary API Credentials
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748B' }}>Enable Cloudinary</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => handleChange('enabled', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Cloud Name */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                Cloud Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={form.cloudName}
                onChange={(e) => handleChange('cloudName', e.target.value)}
                placeholder="e.g. dxyz123abc"
              />
              <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '3px' }}>
                Your unique Cloudinary cloud identifier (found on your dashboard).
              </span>
            </div>

            {/* API Key */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                API Key <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={form.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="e.g. 123456789012345"
              />
              <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '3px' }}>
                The public API Key provided for your product environment.
              </span>
            </div>

            {/* API Secret */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                API Secret <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showSecret ? 'text' : 'password'}
                  className="form-input"
                  style={{ width: '100%', paddingRight: '40px' }}
                  value={form.apiSecret}
                  onChange={(e) => handleChange('apiSecret', e.target.value)}
                  placeholder="e.g. aBcDeFgHiJkLmNoPqRsTuVwXyZ"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
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
                  title={showSecret ? 'Hide secret' : 'Show secret'}
                >
                  {showSecret ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '3px' }}>
                Stored securely in your database. Never exposed to storefront visitors.
              </span>
            </div>

            {/* Upload Folder */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                Default Upload Folder
              </label>
              <input
                type="text"
                className="form-input"
                value={form.folder}
                onChange={(e) => handleChange('folder', e.target.value)}
                placeholder="enquiry_products"
              />
              <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '3px' }}>
                Cloudinary folder where product and category images will be organized.
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Quick Instructions & Integration Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="admin-card" style={{ padding: '22px', marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid var(--admin-card-border)', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#EDE9FE',
                  color: '#8B5CF6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiHelpCircle size={16} />
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Where to Find Your Credentials
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
              <p style={{ margin: 0 }}>
                You do <strong>not</strong> need to edit the server <code style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', color: '#0F172A' }}>.env</code> file. Enter your credentials right here:
              </p>

              <ol style={{ margin: '0 0 0 18px', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  Log in to your <strong>Cloudinary Dashboard</strong> at{' '}
                  <a
                    href="https://console.cloudinary.com"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#0284C7', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                  >
                    console.cloudinary.com <FiExternalLink size={12} />
                  </a>
                </li>
                <li>
                  Go to <strong>Dashboard</strong> or <strong>Product Environment Settings</strong>.
                </li>
                <li>
                  Under <strong>API Keys</strong>, copy your <strong>Cloud Name</strong>, <strong>API Key</strong>, and <strong>API Secret</strong>.
                </li>
                <li>
                  Paste them into the fields on the left and click <strong>Save Configuration</strong>.
                </li>
                <li>
                  Click <strong>Test Connection</strong> to verify that your credentials can communicate with Cloudinary's servers.
                </li>
              </ol>

              <div
                style={{
                  marginTop: '10px',
                  padding: '12px 14px',
                  backgroundColor: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  color: '#0369A1',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start'
                }}
              >
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>✨</span>
                <div>
                  <strong>Zero-Downtime Live Sync:</strong> When updated here, the backend immediately picks up the new credentials for all subsequent image uploads on products and categories.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Test Connection Modal */}
      {isTestModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsTestModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '480px', borderRadius: '14px', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiCloud size={16} />
                </div>
                <h3 className="modal-title" style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Test Cloudinary Connection</h3>
              </div>
            </div>

            <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>
                Verify that your Cloudinary credentials are valid by sending a test ping to Cloudinary API servers.
              </p>

              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }}>
                <div><strong>Cloud Name:</strong> {form.cloudName || '<empty>'}</div>
                <div><strong>API Key:</strong> {form.apiKey ? `${form.apiKey.slice(0, 4)}••••` : '<empty>'}</div>
                <div><strong>API Secret:</strong> {form.apiSecret ? '••••••••••••' : '<empty>'}</div>
              </div>

              {testResult && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    backgroundColor: testResult.success ? '#ECFDF5' : '#FEF2F2',
                    border: `1px solid ${testResult.success ? '#A7F3D0' : '#FECACA'}`,
                    color: testResult.success ? '#065F46' : '#991B1B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {testResult.success ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
                  <span>{testResult.success ? testResult.message : testResult.error}</span>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsTestModalOpen(false)}
                style={{ fontSize: '0.84rem', padding: '8px 16px' }}
              >
                Close
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={handleTestConnection}
                disabled={isTesting}
                style={{
                  background: 'linear-gradient(135deg, #0284C7, #0369A1)',
                  borderColor: '#0284C7',
                  fontSize: '0.84rem',
                  padding: '8px 18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isTesting ? (
                  <>
                    <FiRefreshCw size={14} className="spin-animate" /> Verifying...
                  </>
                ) : (
                  <>
                    <FiZap size={14} /> Run Test Ping
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

export default React.memo(CloudinarySettings)

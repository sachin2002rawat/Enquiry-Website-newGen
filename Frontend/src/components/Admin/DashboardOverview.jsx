import React, { useState } from 'react'
import {
  FiHome,
  FiPackage,
  FiSliders,
  FiCheckCircle,
  FiArrowRight,
  FiGrid,
  FiBriefcase
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import KpiDetailsModal from './KpiDetailsModal'

const DashboardOverview = ({
  setActiveTab,
  heroSlides = [],
  products = []
}) => {
  const [selectedKpiModal, setSelectedKpiModal] = useState(null)

  const heroSlidesCount = Array.isArray(heroSlides) ? heroSlides.length : 0
  const productsCount = Array.isArray(products) ? products.length : 0
  const inStockCount = Array.isArray(products)
    ? products.filter((p) => p && (p.availability === 'In Stock' || p.availability === true)).length
    : 0

  return (
    <div className="dashboard-overview-container">
      {/* KPI METRICS GRID - CLICKABLE WITH PAGINATED POPUP */}
      <div className="kpi-grid">
        <div
          className="kpi-card"
          style={{ cursor: 'pointer' }}
          onClick={() => setSelectedKpiModal('hero_banners')}
          title="Click to view all Hero Banner Slides"
        >
          <div className="kpi-icon-wrapper indigo">
            <FiSliders />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Hero Banners</span>
            <span className="kpi-value">{heroSlidesCount}</span>
          </div>
        </div>

        <div
          className="kpi-card"
          style={{ cursor: 'pointer' }}
          onClick={() => setSelectedKpiModal('total_products')}
          title="Click to view all Store Products"
        >
          <div className="kpi-icon-wrapper emerald">
            <FiPackage />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Total Products</span>
            <span className="kpi-value">{productsCount}</span>
          </div>
        </div>

        <div
          className="kpi-card"
          style={{ cursor: 'pointer' }}
          onClick={() => setSelectedKpiModal('in_stock')}
          title="Click to view all Available In-Stock Items"
        >
          <div className="kpi-icon-wrapper blue">
            <FiCheckCircle />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Available In Stock</span>
            <span className="kpi-value">{inStockCount}</span>
          </div>
        </div>
      </div>

      {/* TWO PRIMARY MODULE SHORTCUT CARDS */}
      <div className="section-header-modern" style={{ marginBottom: '20px', marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.15rem',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.12)'
              }}
            >
              <FiGrid />
            </div>
            <div>
              <div className="card-title-row">
                <h3 className="card-title">
                  Quick Management Modules
                </h3>
                <span className="live-count-badge">
                  4 Modules
                </span>
              </div>
              <p style={{ fontSize: '0.83rem', color: 'var(--admin-text-muted)', margin: '2px 0 0 0', fontWeight: 500 }}>
                Direct shortcuts to configure storefront banners and manage store products.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-modules-grid">
        {/* Module 1: Homepage Settings */}
        <div
          className="admin-card interactive-module-card"
          style={{ marginBottom: 0, cursor: 'pointer' }}
          onClick={() => setActiveTab('homepage')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <div
              className="module-icon-box"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(99, 102, 241, 0.1)',
                color: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.45rem'
              }}
            >
              <FiHome />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text-main)', margin: 0 }}>
                Homepage Settings
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                {heroSlidesCount} Slides Configured
              </span>
            </div>
          </div>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '20px' }}>
            Control hero slider images, headline titles, header announcement text, contact details, and enable/disable page sections.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4F46E5', fontWeight: 600, fontSize: '0.9rem' }}>
            Open Homepage Settings <FiArrowRight className="module-arrow-icon" />
          </div>
        </div>

        {/* Module 2: Product Management */}
        <div
          className="admin-card interactive-module-card"
          style={{ marginBottom: 0, cursor: 'pointer' }}
          onClick={() => setActiveTab('product')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <div
              className="module-icon-box"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.45rem'
              }}
            >
              <FiPackage />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text-main)', margin: 0 }}>
                Product Management
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                {productsCount} Active Products
              </span>
            </div>
          </div>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '20px' }}>
            Add new spice products, update stock availability, modify product descriptions, SKUs, images, and categories.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 600, fontSize: '0.9rem' }}>
            Open Product Management <FiArrowRight className="module-arrow-icon" />
          </div>
        </div>

        {/* Module 3: Company Settings */}
        <div
          className="admin-card interactive-module-card"
          style={{ marginBottom: 0, cursor: 'pointer' }}
          onClick={() => setActiveTab('company')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <div
              className="module-icon-box"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(245, 158, 11, 0.1)',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.45rem'
              }}
            >
              <FiBriefcase />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text-main)', margin: 0 }}>
                Company Settings
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                About Page & Brand Profile
              </span>
            </div>
          </div>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '20px' }}>
            Control About Page hero title, trust milestone stats, story text, team image, mission statement, and vision.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D97706', fontWeight: 600, fontSize: '0.9rem' }}>
            Open Company Settings <FiArrowRight className="module-arrow-icon" />
          </div>
        </div>

        {/* Module 4: WhatsApp Settings */}
        <div
          className="admin-card interactive-module-card"
          style={{ marginBottom: 0, cursor: 'pointer' }}
          onClick={() => setActiveTab('whatsapp')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <div
              className="module-icon-box"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(37, 211, 102, 0.12)',
                color: '#25D366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.45rem'
              }}
            >
              <FaWhatsapp />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text-main)', margin: 0 }}>
                WhatsApp Settings
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                Direct Customer Redirection
              </span>
            </div>
          </div>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '20px' }}>
            Configure the support WhatsApp number for the bottom-right floating icon and instant customer enquiry chats.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 600, fontSize: '0.9rem' }}>
            Open WhatsApp Settings <FiArrowRight className="module-arrow-icon" />
          </div>
        </div>
      </div>

      {/* KPI DATA DETAILS POPUP MODAL WITH 5-ITEM PAGINATION */}
      <KpiDetailsModal
        isOpen={!!selectedKpiModal}
        onClose={() => setSelectedKpiModal(null)}
        modalType={selectedKpiModal}
        heroSlides={heroSlides}
        products={products}
      />
    </div>
  )
}

export default React.memo(DashboardOverview)

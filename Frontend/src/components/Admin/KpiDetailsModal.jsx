import React, { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  FiX,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiSliders,
  FiPackage,
  FiCheckCircle,
  FiAlertTriangle
} from 'react-icons/fi'
import { getCategoryName } from '../../utils/categoryHelper'
import { getFullImageUrl } from '../../utils/imageUrl'

const ITEMS_PER_PAGE = 5

const KpiDetailsModal = ({
  isOpen,
  onClose,
  modalType,
  heroSlides = [],
  products = []
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Reset page & search on open/type change
  useEffect(() => {
    setSearchTerm('')
    setCurrentPage(1)
  }, [modalType, isOpen])

  // Get raw items depending on type
  const rawItems = useMemo(() => {
    switch (modalType) {
      case 'hero_banners':
        return heroSlides
      case 'total_products':
        return products
      case 'in_stock':
        return products.filter(
          (p) => p.availability === 'In Stock' || p.availability === true
        )
      case 'out_stock':
        return products.filter(
          (p) => p.availability !== 'In Stock' && p.availability !== true
        )
      default:
        return products
    }
  }, [modalType, heroSlides, products])

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return rawItems

    const query = searchTerm.toLowerCase()
    return rawItems.filter((item) => {
      const nameMatch = item.name && item.name.toLowerCase().includes(query)
      const titleMatch = item.title && item.title.toLowerCase().includes(query)
      const skuMatch = item.sku && item.sku.toLowerCase().includes(query)
      const catName = getCategoryName(item.category)
      const catMatch = catName && catName.toLowerCase().includes(query)
      return nameMatch || titleMatch || skuMatch || catMatch
    })
  }, [rawItems, searchTerm])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)

  const paginatedItems = useMemo(() => {
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredItems, startIndex])

  if (!isOpen) return null

  // Header Title & Icon config
  const getModalConfig = () => {
    switch (modalType) {
      case 'hero_banners':
        return {
          title: 'Hero Banner Slides',
          icon: FiSliders,
          badgeColor: '#6366F1'
        }
      case 'total_products':
        return {
          title: 'All Store Products Catalogue',
          icon: FiPackage,
          badgeColor: '#6366F1'
        }
      case 'in_stock':
        return {
          title: 'Available In-Stock Products',
          icon: FiCheckCircle,
          badgeColor: '#10B981'
        }
      case 'out_stock':
        return {
          title: 'Out of Stock Products',
          icon: FiAlertTriangle,
          badgeColor: '#EF4444'
        }
      default:
        return {
          title: 'KPI Data Details',
          icon: FiPackage,
          badgeColor: '#6366F1'
        }
    }
  }

  const { title, icon: HeaderIcon, badgeColor } = getModalConfig()

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '780px', width: '92%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HeaderIcon size={20} color={badgeColor} />
            <h3 className="modal-title">{title}</h3>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'rgba(99, 102, 241, 0.12)',
                color: badgeColor,
                padding: '3px 9px',
                borderRadius: '12px'
              }}
            >
              {rawItems.length} Total
            </span>
          </div>

          <button className="btn-icon" onClick={onClose} aria-label="Close Modal">
            <FiX size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Search Filter input */}
          <div className="table-search" style={{ marginBottom: '12px' }}>
            <FiSearch className="table-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search items in list..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          {/* Items Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  {modalType === 'hero_banners' ? (
                    <>
                      <th>Banner Slide Details</th>
                      <th>Order #</th>
                      <th>Subtitle Description</th>
                    </>
                  ) : (
                    <>
                      <th>Product Details</th>
                      <th>Category</th>
                      <th>Weight / Size</th>
                      <th>Stock Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item, idx) => {
                    if (modalType === 'hero_banners') {
                      return (
                        <tr key={item.id || idx}>
                          <td>
                            <div className="product-cell">
                              <img
                                src={item.url}
                                alt={item.title}
                                className="product-thumb"
                                onError={(e) => {
                                  e.target.onerror = null
                                  e.target.src =
                                    'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80'
                                }}
                              />
                              <div>
                                <div className="product-info-name">{item.title}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="category-tag">Slide #{startIndex + idx + 1}</span>
                          </td>
                          <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem' }}>
                            {item.subtitle || 'Main Hero Carousel Banner'}
                          </td>
                        </tr>
                      )
                    } else {
                      const isInStock =
                        item.availability === 'In Stock' || item.availability === true
                      return (
                        <tr key={item.id || idx}>
                          <td>
                            <div className="product-cell">
                              <img
                                src={getFullImageUrl(item.image)}
                                alt={item.name}
                                className="product-thumb"
                                onError={(e) => {
                                  e.target.onerror = null
                                  e.target.style.opacity = '0.5'
                                }}
                              />
                              <div>
                                <div className="product-info-name">{item.name}</div>
                                <div className="product-info-sku">{item.sku || `SKU-${item.id}`}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="category-tag">{getCategoryName(item.category) || 'PURE SPICES'}</span>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>
                            {item.netWeight || item.weight || '100g'}
                          </td>
                          <td>
                            <span
                              className={`status-badge ${isInStock ? 'in-stock' : 'out-stock'}`}
                            >
                              {isInStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                        </tr>
                      )
                    }
                  })
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>
                      <p style={{ color: 'var(--admin-text-muted)', margin: 0 }}>
                        No matching items found.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer with 5-item Pagination Bar */}
        {filteredItems.length > 0 && (
          <div className="admin-pagination-bar">
            <div className="pagination-info">
              Showing{' '}
              <span style={{ color: 'var(--admin-text-main)', fontWeight: 600 }}>
                {startIndex + 1}
              </span>{' '}
              to{' '}
              <span style={{ color: 'var(--admin-text-main)', fontWeight: 600 }}>
                {endIndex}
              </span>{' '}
              of{' '}
              <span style={{ color: 'var(--admin-text-main)', fontWeight: 600 }}>
                {filteredItems.length}
              </span>{' '}
              items
            </div>

            <div className="pagination-controls">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                title="Previous Page"
              >
                <FiChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                title="Next Page"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default React.memo(KpiDetailsModal)

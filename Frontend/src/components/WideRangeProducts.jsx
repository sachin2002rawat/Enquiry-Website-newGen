import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { FaWhatsapp, FaStar, FaFilePdf } from 'react-icons/fa'
import { FiArrowRight, FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import defaultProductsData from '../ProductsData.json'
import { useEnquiryModal } from '../context/EnquiryModalContext'
import useLiveProducts from '../hooks/useLiveProducts'
import { openWhatsApp } from '../utils/whatsappHelper'
import { getCategoryName } from '../utils/categoryHelper'
import { getFullImageUrl } from '../utils/imageUrl'

const WideRangeProducts = ({ data, isBeauty = false, cardsToShow }) => {
  const [liveProducts] = useLiveProducts()
  const displayCount = cardsToShow || (isBeauty ? 4 : 3)
  const activeDataset = (data && data.length > 0) ? data : liveProducts
  const navigate = useNavigate()
  const { openEnquiryModal } = useEnquiryModal()

  // Ref for Desktop Carousel Slider Track
  const gridRef = React.useRef(null)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragScrollLeft, setDragScrollLeft] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Move carousel to the right on desktop
  const handleNextDesktop = () => {
    if (!gridRef.current) return
    const card = gridRef.current.querySelector('.product-wide-card')
    const gap = 24
    const scrollStep = card ? (card.offsetWidth + gap) : 340
    const maxScroll = gridRef.current.scrollWidth - gridRef.current.clientWidth

    if (gridRef.current.scrollLeft >= maxScroll - 15) {
      // Loop smoothly back to the beginning
      gridRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      gridRef.current.scrollBy({ left: scrollStep, behavior: 'smooth' })
    }
  }

  // Move carousel to the left on desktop
  const handlePrevDesktop = () => {
    if (!gridRef.current) return
    const card = gridRef.current.querySelector('.product-wide-card')
    const gap = 24
    const scrollStep = card ? (card.offsetWidth + gap) : 340

    if (gridRef.current.scrollLeft <= 15) {
      // Loop smoothly to the end
      gridRef.current.scrollTo({
        left: gridRef.current.scrollWidth - gridRef.current.clientWidth,
        behavior: 'smooth'
      })
    } else {
      gridRef.current.scrollBy({ left: -scrollStep, behavior: 'smooth' })
    }
  }

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e) => {
    if (!gridRef.current) return
    if (e.target.closest('button')) return
    setIsMouseDown(true)
    setIsDragging(false)
    setDragStartX(e.pageX - gridRef.current.offsetLeft)
    setDragScrollLeft(gridRef.current.scrollLeft)
  }

  const handleMouseMove = (e) => {
    if (!isMouseDown || !gridRef.current) return
    const x = e.pageX - gridRef.current.offsetLeft
    const walk = x - dragStartX
    if (Math.abs(walk) > 6) {
      setIsDragging(true)
    }
    gridRef.current.scrollLeft = dragScrollLeft - walk
  }

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false)
    setTimeout(() => setIsDragging(false), 60)
  }

  // State for Mobile Pagination List View (5 items per page)
  const [mobilePage, setMobilePage] = useState(1)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [isPageAnimating, setIsPageAnimating] = useState(false)
  const itemsPerPage = 5

  const totalMobilePages = Math.ceil(activeDataset.length / itemsPerPage)

  // Mobile page change handler with smooth animation reset
  const handleMobilePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalMobilePages && newPage !== mobilePage) {
      setIsPageAnimating(true)
      setMobilePage(newPage)
      setTimeout(() => setIsPageAnimating(false), 400)
      const section = document.querySelector('.wide-range-section')
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  // Touch Swipe Gesture Handlers for Mobile Responsive Carousel/List
  const minSwipeDistance = 40

  const handleTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && mobilePage < totalMobilePages) {
      handleMobilePageChange(mobilePage + 1)
    } else if (isRightSwipe && mobilePage > 1) {
      handleMobilePageChange(mobilePage - 1)
    }
  }

  const handleEnquire = (productTitle, e) => {
    if (e) e.stopPropagation()
    openEnquiryModal(productTitle)
    try {
      window.dispatchEvent(new CustomEvent('open_enquiry_modal', { detail: { productName: productTitle } }))
    } catch {}
  }

  const handleWhatsApp = (productTitle, e) => {
    if (e) e.stopPropagation()
    let num = '+91 9876543210'
    try {
      const saved = localStorage.getItem('enquiry_admin_store_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.whatsappNumber) num = parsed.whatsappNumber
      }
    } catch {}
    openWhatsApp(num, `Hi, I am interested in inquiring about ${productTitle}.`)
  }

  const handleCardClick = (product) => {
    if (isDragging) return
    const targetSlug = product.slug || product.id
    navigate(`/product/${targetSlug}`)
  }

  // Current slice of products for mobile list (5 products per page)
  const currentMobileProducts = activeDataset.slice(
    (mobilePage - 1) * itemsPerPage,
    mobilePage * itemsPerPage
  )

  return (
    <section className="wide-range-section">
      {/* 1. Header Section */}
      <div className="wide-range-header">
        <div className="wide-range-header-left">
          <span className="wide-range-subtitle">— HANDPICKED FOR YOU</span>
          <h2 className="wide-range-title">
            Wide Range of <span className="title-highlight">Products</span>
          </h2>
        </div>
        
        <a 
          href="#products" 
          className="view-all-products-link"
          onClick={(e) => {
            e.preventDefault()
            navigate('/product')
          }}
        >
          View All Products <span className="arrow-icon">→</span>
        </a>
      </div>

      {/* 2. Desktop Carousel View (Hidden on Mobile) */}
      <div className="wide-range-carousel-wrapper desktop-only-carousel">
        {/* Left Arrow Button */}
        <button 
          type="button"
          className="carousel-arrow-btn prev" 
          onClick={handlePrevDesktop} 
          aria-label="Previous products"
        >
          <FiArrowLeft size={20} />
        </button>

        {/* Desktop Carousel Cards Track */}
        <div 
          ref={gridRef}
          className={`wide-range-grid cards-${displayCount}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          {activeDataset.map((product) => {
            const isOutOfStock = product.availability === 'Out of Stock' || product.availability === false
            return (
              <div 
                key={product._id || product.id || product.slug || product.name} 
                className={`product-wide-card ${isBeauty ? 'beauty-animated-card' : ''}`}
                onClick={() => handleCardClick(product)}
                style={{ cursor: 'pointer' }}
              >
                <span className="product-wide-tag">{product.collection || getCategoryName(product.category) || 'FEATURED'}</span>
                
                <div className="product-wide-img-container" style={{ position: 'relative' }}>
                  <img 
                    src={getFullImageUrl(product.image)} 
                    alt={product.name} 
                    className="product-wide-img" 
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.opacity = '0.7';
                    }}
                  />
                  {isOutOfStock && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: '#EF4444',
                        color: '#FFFFFF',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                        zIndex: 3
                      }}
                    >
                      Out of Stock
                    </span>
                  )}
                </div>
                
                <h3 className="product-wide-title">{product.name}</h3>
                <span className="product-wide-category">{getCategoryName(product.category) || 'GENERAL'}</span>
                <div className="product-wide-rating">
                <div className="stars-group">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} size={14} color="#f59e0b" />
                  ))}
                </div>
                <span className="rating-count">({product.reviewsCount || 127})</span>
              </div>
              
              <div className="product-wide-actions">
                <button 
                  type="button" 
                  className="enquire-now-btn" 
                  onClick={(e) => handleEnquire(product.name, e)}
                >
                  <MessageSquare size={16} /> Enquire Now
                </button>
                
                <button 
                  type="button" 
                  className="whatsapp-btn" 
                  onClick={(e) => handleWhatsApp(product.name, e)}
                  aria-label={`Inquire about ${product.name} on WhatsApp`}
                >
                  <FaWhatsapp size={20} />
                </button>
              </div>
            </div>
          )
        })}
        </div>

        {/* Right Arrow Button */}
        <button 
          type="button"
          className="carousel-arrow-btn next" 
          onClick={handleNextDesktop} 
          aria-label="Next products"
        >
          <FiArrowRight size={20} />
        </button>
      </div>

      {/* 3. Mobile Vertical List View with Touch Swipe & Pagination (Visible ONLY on Mobile screens <= 768px) */}
      <div 
        className="wide-range-mobile-list-wrapper mobile-only-list"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`wide-range-mobile-list ${isPageAnimating ? 'page-transitioning' : ''}`}>
          {currentMobileProducts.map((product, idx) => (
            <div 
              key={`${product.id}-mobile-p${mobilePage}`} 
              className={`wide-range-mobile-card ${isBeauty ? 'beauty-animated-card' : ''}`}
              style={{ animationDelay: `${idx * 0.08}s, ${idx * 0.4 + 0.5}s` }}
              onClick={() => handleCardClick(product)}
            >
              {/* Full Width Top Image with Floating Badges */}
              <div className="mobile-card-img-container">
                <span className="mobile-card-badge">Best Seller</span>
                <img 
                  src={getFullImageUrl(product.image)} 
                  alt={product.name} 
                  className="mobile-card-img" 
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.opacity = '0.7';
                  }}
                />
                <div className="mobile-card-pdf-badge" title="Catalog PDF Available">
                  <FaFilePdf size={16} color="#e11d48" />
                </div>
              </div>

              {/* Product Info Section Below Image */}
              <div className="mobile-card-info">
                <span className="mobile-card-category">{getCategoryName(product.category)}</span>
                <h3 className="mobile-card-title">{product.name}</h3>
                
                {/* Rating Stars Row */}
                <div className="mobile-card-rating">
                  <div className="stars-group">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} size={13} color="#f59e0b" />
                    ))}
                  </div>
                  <span className="rating-count">({product.reviewsCount || 127})</span>
                </div>
              </div>

              {/* Bottom Action Buttons Row */}
              <div className="mobile-card-actions">
                <button 
                  type="button" 
                  className="mobile-enquire-btn"
                  onClick={(e) => handleEnquire(product.name, e)}
                >
                  <MessageSquare size={16} /> Send Enquiry
                </button>
                
                <button 
                  type="button" 
                  className="mobile-whatsapp-btn"
                  onClick={(e) => handleWhatsApp(product.name, e)}
                  aria-label={`WhatsApp ${product.name}`}
                >
                  <FaWhatsapp size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Pagination (Shown ONLY on Mobile) */}
        <div className="wide-range-mobile-pagination">
          <button 
            type="button" 
            className="mobile-page-btn nav-btn"
            disabled={mobilePage === 1}
            onClick={() => handleMobilePageChange(mobilePage - 1)}
            aria-label="Previous page"
          >
            <FiChevronLeft size={18} />
          </button>

          <div className="mobile-page-numbers">
            {Array.from({ length: totalMobilePages }, (_, index) => {
              const pageNum = index + 1
              return (
                <button
                  key={pageNum}
                  type="button"
                  className={`mobile-page-num ${mobilePage === pageNum ? 'active' : ''}`}
                  onClick={() => handleMobilePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button 
            type="button" 
            className="mobile-page-btn nav-btn"
            disabled={mobilePage === totalMobilePages}
            onClick={() => handleMobilePageChange(mobilePage + 1)}
            aria-label="Next page"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  )
}

export default React.memo(WideRangeProducts)

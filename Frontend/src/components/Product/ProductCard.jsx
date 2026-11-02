import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { FaWhatsapp, FaStar } from 'react-icons/fa'
import { useEnquiryModal } from '../../context/EnquiryModalContext'
import { getCategoryName } from '../../utils/categoryHelper'
import { getFullImageUrl } from '../../utils/imageUrl'
import { openWhatsApp } from '../../utils/whatsappHelper'

/**
 * ProductCard Component
 * Displays product details using the homepage Wide Range of Products card design.
 */
const ProductCard = ({ product }) => {
  const navigate = useNavigate()
  const { openEnquiryModal } = useEnquiryModal()
  const displayTitle = product?.name || product?.title || 'Product Item'
  const collectionTag = product?.collection || 'PURE SPICES'
  const category = getCategoryName(product?.category) || 'PURE SPICES'
  const rating = product?.rating || 4.8
  const reviewsCount = product?.reviewsCount || 127
  const image = getFullImageUrl(product?.image) || '/garam_masala.png'

  const handleCardClick = () => {
    if (product) {
      const targetSlug = product.slug || product._id || product.id
      navigate(`/product/${targetSlug}`)
    }
  }

  const handleSendEnquiry = (e) => {
    if (e) e.stopPropagation()
    openEnquiryModal(displayTitle)
    try {
      window.dispatchEvent(new CustomEvent('open_enquiry_modal', { detail: { productName: displayTitle } }))
    } catch {}
  }

  const handleWhatsAppClick = (e) => {
    if (e) e.stopPropagation()
    let num = product?.whatsappNumber || '+91 9555140701'
    try {
      const saved = localStorage.getItem('enquiry_admin_store_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.whatsappNumber) num = parsed.whatsappNumber
      }
    } catch {}
    openWhatsApp(num, `Hi, I am interested in inquiring about ${displayTitle}.`)
  }

  const isOutOfStock = product?.availability === 'Out of Stock' || product?.availability === false

  return (
    <div 
      className="product-wide-card"
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Collection Tag centered at top */}
      <span className="product-wide-tag">{collectionTag}</span>
      
      {/* Product Image Area */}
      <div className="product-wide-img-container" style={{ position: 'relative' }}>
        <img 
          src={image} 
          alt={displayTitle} 
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

      {/* Product Title centered */}
      <h3 className="product-wide-title">{displayTitle}</h3>

      {/* Category Label */}
      <span className="product-wide-category">{category}</span>

      {/* Star Rating Row */}
      <div className="product-wide-rating">
        <div className="stars-group">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              size={14}
              color="#f59e0b"
            />
          ))}
        </div>
        <span className="rating-count">({reviewsCount})</span>
      </div>

      {/* Action Buttons: Enquire Now + WhatsApp */}
      <div className="product-wide-actions">
        <button 
          type="button" 
          className="enquire-now-btn" 
          onClick={(e) => handleSendEnquiry(e)}
        >
          <MessageSquare size={16} /> Enquire Now
        </button>
        
        <button 
          type="button" 
          className="whatsapp-btn" 
          onClick={(e) => handleWhatsAppClick(e)}
          aria-label={`Inquire about ${displayTitle} on WhatsApp`}
        >
          <FaWhatsapp size={20} />
        </button>
      </div>
    </div>
  )
}

export default ProductCard

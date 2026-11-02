import React, { useState } from 'react';
import './ProductDetailHero.css';
import { useEnquiryModal } from '../../context/EnquiryModalContext';
import { 
  Share2, 
  ZoomIn, 
  Star, 
  CheckCircle, 
  Mail, 
  PhoneCall, 
  Truck, 
  Headphones, 
  RotateCcw, 
  Grid, 
  X 
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { getCategoryName } from '../../utils/categoryHelper';
import { getFullImageUrl } from '../../utils/imageUrl';
import { openWhatsApp } from '../../utils/whatsappHelper';

// =========================================================================
// HARDCODED PRODUCT DATA (Freshers: Easy to read & update or replace later)
// =========================================================================
const HARDCODED_PRODUCT = {
  title: "Garam Masala Premium Blend",
  category: "PURE SPICES",
  rating: "4.8",
  reviewsCount: "127",
  description: "Premium aromatic Indian spice blend, handpicked and ground to perfection using traditional stone-grinding techniques. Rich in essential oils and authentic aroma.",
  sku: "SKU-SP-001",
  netWeight: "100g / Pack",
  minOrderQty: "50 Units",
  availability: "In Stock",
  images: [
    "/garam_masala.png",
    "/premium_spices.png",
    "/coriander_powder.png"
  ]
};

const ProductHero = ({ product }) => {
  const { openEnquiryModal } = useEnquiryModal();
  const activeProduct = {
    title: product?.name || product?.title || HARDCODED_PRODUCT.title,
    category: getCategoryName(product?.category) || HARDCODED_PRODUCT.category,
    rating: product?.rating ?? HARDCODED_PRODUCT.rating,
    reviewsCount: product?.reviewsCount ?? HARDCODED_PRODUCT.reviewsCount,
    description: product?.description || HARDCODED_PRODUCT.description,
    sku: product?.sku || `SKU-${product?.id || '001'}`,
    netWeight: product?.netWeight || (product?.weight ? `${product.weight} / Pack` : HARDCODED_PRODUCT.netWeight),
    minOrderQty: product?.minOrderQty || HARDCODED_PRODUCT.minOrderQty,
    availability: product?.availability || HARDCODED_PRODUCT.availability,
    images: Array.isArray(product?.images) && product.images.length > 0
      ? product.images
      : (product?.image ? [product.image] : HARDCODED_PRODUCT.images)
  };

  // State 1: Keep track of which image INDEX is currently selected in the gallery
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Reset selected image index to 0 whenever product prop changes
  React.useEffect(() => {
    setSelectedImageIndex(0);
  }, [product]);

  // Gallery Navigation: Left & Right arrow handlers
  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => 
      (prev - 1 + activeProduct.images.length) % activeProduct.images.length
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => 
      (prev + 1) % activeProduct.images.length
    );
  };

  // Keyboard navigation support: ArrowLeft and ArrowRight keys
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProduct.images.length]);

  // State 2: Keep track of whether the zoom modal is open (true) or closed (false)
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const currentMainImage = activeProduct.images[selectedImageIndex] || activeProduct.images[0];

  // Dynamic theory paragraphs for product overview card
  const displayTheoryParagraphs = Array.isArray(product?.fullDescription) && product.fullDescription.length > 0
    ? product.fullDescription
    : (typeof product?.fullDescription === 'string' && product.fullDescription.trim()
        ? product.fullDescription.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean)
        : [
            `Our ${activeProduct.title} is carefully crafted and sourced directly from certified organic farms, adhering to strict international food safety standards to deliver uncompromised aroma, vibrant natural color, and authentic taste.`,
            `Processed in state-of-the-art FSSAI-certified facilities using low-temperature milling techniques that preserve natural essential volatile oils, key nutrients, and rich culinary notes.`,
            `Free from synthetic colors, artificial preservatives, or chemical fillers. Ideal for home cooking, gourmet recipes, hotel kitchens, and B2B wholesale buyers.`
          ]);

  return (
    <section className="product-hero-section">
      <div className="ph-container-wrapper">
        <div className="ph-grid-container">
        
        {/* =================================================================
           LEFT SIDE: PRODUCT GALLERY (MAIN IMAGE & THUMBNAILS & THEORY CARD)
           ================================================================= */}
        <div className="ph-gallery-column">
          
          {/* Main Product Image Card */}
          <div className="ph-gallery-card">
            
            {/* Top Badges: FSSAI & Share */}
            <div className="ph-card-topbar">
              <span className="ph-badge-fssai">+ FSSAI CERTIFIED</span>
              <button 
                type="button" 
                className="ph-share-btn" 
                onClick={() => alert("Product link copied!")}
              >
                <Share2 size={15} />
                <span>Share</span>
              </button>
            </div>

            {/* Center Main Product Image with Gallery Arrow Controls */}
            <div className="ph-main-img-wrapper" style={{ position: 'relative' }}>
              
              {/* Left Arrow Button over Main Image */}
              {activeProduct.images.length > 1 && (
                <button
                  type="button"
                  className="ph-gallery-arrow prev"
                  onClick={handlePrevImage}
                  aria-label="Previous gallery image"
                  title="Previous image (Left Arrow Key)"
                >
                  ‹
                </button>
              )}

              <img 
                src={getFullImageUrl(currentMainImage)} 
                alt="Product Preview" 
                className="ph-main-img" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.opacity = '0.7';
                }}
              />

              {/* Right Arrow Button over Main Image */}
              {activeProduct.images.length > 1 && (
                <button
                  type="button"
                  className="ph-gallery-arrow next"
                  onClick={handleNextImage}
                  aria-label="Next gallery image"
                  title="Next image (Right Arrow Key)"
                >
                  ›
                </button>
              )}
            </div>

            {/* Bottom Button: Tap to Zoom */}
            <button 
              type="button" 
              className="ph-zoom-btn" 
              onClick={() => setIsZoomOpen(true)}
            >
              <ZoomIn size={15} />
              <span>Tap to Zoom (Press ← → keys to switch)</span>
            </button>

          </div>

          {/* Thumbnail Images Row Container with styled background */}
          <div className="ph-thumbnails-container">
            <div className="ph-thumbnails-header">
              <span className="ph-thumbnails-title">Product Views ({activeProduct.images.length})</span>
            </div>
            <div className="ph-thumbnails-row">
              {activeProduct.images.map((imageSrc, index) => (
                <button 
                  key={index}
                  type="button"
                  className={`ph-thumb-card ${selectedImageIndex === index ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                  aria-label={`View product image ${index + 1}`}
                >
                  <img 
                    src={getFullImageUrl(imageSrc)} 
                    alt={`Thumbnail ${index + 1}`} 
                    className="ph-thumb-img" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.opacity = '0.7';
                    }}
                  />
                  {selectedImageIndex === index && (
                    <span className="ph-thumb-active-badge">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Product Overview & Sourcing Theory Card */}
          <div className="ph-info-theory-card">
            <div className="ph-info-header">
              <span className="ph-info-badge">PRODUCT OVERVIEW & THEORY</span>
              <h3 className="ph-info-title">About {activeProduct.title}</h3>
            </div>

            <div className="ph-info-body">
              {displayTheoryParagraphs.map((paragraph, index) => (
                <p key={index} className="ph-info-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

        </div>

        {/* =================================================================
           RIGHT SIDE: PRODUCT DETAILS & ACTION BUTTONS
           ================================================================= */}
        
        <div className="ph-details-card">
          
          {/* Category Tag */}
          <div className="ph-category-tag">
            <Grid size={13} />
            <span>{activeProduct.category}</span>
          </div>

          {/* Product Title */}
          <h1 className="ph-product-title">{activeProduct.title}</h1>

          {/* Rating & Verified Badge */}
          <div className="ph-rating-row">
            <div className="ph-stars">
              <Star size={16} fill="#F59E0B" stroke="#F59E0B" />
              <Star size={16} fill="#F59E0B" stroke="#F59E0B" />
              <Star size={16} fill="#F59E0B" stroke="#F59E0B" />
              <Star size={16} fill="#F59E0B" stroke="#F59E0B" />
              <Star size={16} fill="#F59E0B" stroke="#F59E0B" />
            </div>

            <span className="ph-rating-text">
              <strong className="ph-rating-score">{activeProduct.rating}</strong> ({activeProduct.reviewsCount} reviews)
            </span>

            <div className="ph-verified-badge">
              <CheckCircle size={14} />
              <span>Verified</span>
            </div>
          </div>

          {/* Product Description */}
          <p className="ph-description">
            {activeProduct.description}
          </p>

          {/* Product Specifications (2x2 Grid) */}
          <div className="ph-spec-grid">
            <div className="ph-spec-box">
              <span className="ph-spec-label">SKU</span>
              <span className="ph-spec-value">{activeProduct.sku}</span>
            </div>

            <div className="ph-spec-box">
              <span className="ph-spec-label">NET WEIGHT</span>
              <span className="ph-spec-value">{activeProduct.netWeight}</span>
            </div>

            <div className="ph-spec-box">
              <span className="ph-spec-label">MIN. ORDER QTY</span>
              <span className="ph-spec-value">{activeProduct.minOrderQty}</span>
            </div>

            <div className="ph-spec-box">
              <span className="ph-spec-label">AVAILABILITY</span>
              <span className={`ph-spec-value ${activeProduct.availability === 'Out of Stock' ? 'ph-out-stock-text' : 'ph-in-stock-text'}`}>
                <span
                  className="ph-in-stock-dot"
                  style={{
                    backgroundColor: activeProduct.availability === 'Out of Stock' ? '#EF4444' : '#10B981'
                  }}
                ></span>
                {activeProduct.availability}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="ph-cta-group">
            {/* Send Enquiry Button */}
            <button 
              type="button" 
              className="ph-btn-enquiry" 
              onClick={() => openEnquiryModal(activeProduct.title)}
            >
              <Mail size={18} />
              <span>Send Enquiry</span>
            </button>

            {/* Request Callback & WhatsApp Buttons */}
            <div className="ph-btn-row">
              <button 
                type="button" 
                className="ph-btn-callback" 
                onClick={() => alert(`Callback requested for ${activeProduct.title}!`)}
              >
                <PhoneCall size={18} />
                <span>Request A Callback</span>
              </button>

              <button  
                type="button" 
                className="ph-btn-whatsapp"
                onClick={() => {
                  let num = '+91 9555140701';
                  try {
                    const saved = localStorage.getItem('enquiry_admin_store_settings');
                    if (saved) {
                      const parsed = JSON.parse(saved);
                      if (parsed.whatsappNumber) num = parsed.whatsappNumber;
                    }
                  } catch {}
                  openWhatsApp(num, `Hi, I want to enquire about ${activeProduct.title}`);
                }}
              >
                <FaWhatsapp size={20} />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Highlights Footer Icons */}
          <div className="ph-highlights-row">
            <div className="ph-highlight-item">
              <CheckCircle size={16} className="ph-highlight-icon" />
              <span>FSSAI Certified</span>
            </div>

            <div className="ph-highlight-item">
              <Truck size={16} className="ph-highlight-icon" />
              <span>Pan-India Delivery</span>
            </div>

            <div className="ph-highlight-item">
              <Headphones size={16} className="ph-highlight-icon" />
              <span>24/7 Support</span>
            </div>

            <div className="ph-highlight-item">
              <RotateCcw size={16} className="ph-highlight-icon" />
              <span>Easy Returns</span>
            </div>
          </div>

        </div>
      </div>
    </div>

      {/* Pop-up Modal when "Tap to Zoom" is clicked */}
      {isZoomOpen && (
        <div className="ph-zoom-modal-overlay" onClick={() => setIsZoomOpen(false)}>
          <div className="ph-zoom-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="ph-modal-close-btn" 
              onClick={() => setIsZoomOpen(false)}
            >
              <X size={20} />
            </button>
            <img src={currentMainImage} alt="Enlarged View" className="ph-zoomed-img" />
          </div>
        </div>
      )}

    </section>
  );
};

export default ProductHero;

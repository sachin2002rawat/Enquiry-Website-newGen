import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RelatedProduct.css';
import { MessageSquare } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import productsData from '../../ProductsData.json';
import beautyProductsData from '../../BeautyProductsData.json';
import { useEnquiryModal } from '../../context/EnquiryModalContext';
import { openWhatsApp } from '../../utils/whatsappHelper';

import useLiveProducts from '../../hooks/useLiveProducts';
import { getCategoryName } from '../../utils/categoryHelper';

const RelatedProduct = ({ currentProduct }) => {
  const navigate = useNavigate();
  const { openEnquiryModal } = useEnquiryModal();
  const [liveProducts] = useLiveProducts();

  const allProducts = React.useMemo(
    () => [...liveProducts, ...beautyProductsData],
    [liveProducts]
  );

  // Helper function to build related products list (at least 5 items)
  const getRelatedProducts = (currProd) => {
    if (!currProd) return allProducts.slice(1, 7);

    const currCategory = getCategoryName(currProd.category).toUpperCase();
    const currId = currProd._id || currProd.id;
    const currSlug = (currProd.slug || '').toLowerCase();

    // Helper functions for category grouping
    const isSpiceCategory = (cat) => 
      ['PURE SPICES', 'WHOLE SPICES', 'MIX MASALA'].includes(cat) || 
      cat.includes('SPICE') || cat.includes('MASALA');

    const isTofuCategory = (cat) => 
      ['YUMII MASALA TOFU', 'SOYA CHUNKS'].includes(cat) || 
      cat.includes('TOFU') || cat.includes('SOYA');

    const isBeautyCategory = (cat) =>
      ['SKIN CARE', 'HAIR CARE', 'FACE CARE', 'COSMETICS', 'BODY CARE', 'ESSENTIAL OILS'].includes(cat) ||
      cat.includes('SKIN') || cat.includes('BEAUTY') || cat.includes('HAIR') || cat.includes('FACE');

    // Exclude current product itself
    const candidateList = allProducts.filter((item) => {
      const itemId = item._id || item.id;
      if (itemId && currId && String(itemId) === String(currId)) return false;
      if (item.slug && currSlug && item.slug.toLowerCase() === currSlug) return false;
      return true;
    });

    let relatedMatches = [];

    if (isSpiceCategory(currCategory)) {
      relatedMatches = candidateList.filter((item) => isSpiceCategory(getCategoryName(item.category).toUpperCase()));
    } else if (isTofuCategory(currCategory)) {
      relatedMatches = candidateList.filter((item) => isTofuCategory(getCategoryName(item.category).toUpperCase()));
    } else if (isBeautyCategory(currCategory)) {
      relatedMatches = candidateList.filter((item) => isBeautyCategory(getCategoryName(item.category).toUpperCase()));
    } else {
      relatedMatches = candidateList.filter((item) => getCategoryName(item.category).toUpperCase() === currCategory);
    }

    // Ensure at least 5 items are in the related list
    if (relatedMatches.length < 5) {
      const existingIds = new Set(relatedMatches.map((p) => p.id));
      const fallbackItems = candidateList.filter((item) => !existingIds.has(item.id));
      relatedMatches = [...relatedMatches, ...fallbackItems];
    }

    return relatedMatches;
  };

  // Store filtered products in state for infinite carousel rotation
  const [products, setProducts] = useState(() => getRelatedProducts(currentProduct));

  // Re-filter when currentProduct changes
  useEffect(() => {
    setProducts(getRelatedProducts(currentProduct));
  }, [currentProduct]);

  // Track whether mouse is hovering over carousel (pauses auto-rotation)
  const [isHovered, setIsHovered] = useState(false);

  // Rotate carousel to the next product card
  const handleNext = () => {
    setProducts((prev) => {
      if (prev.length <= 1) return prev;
      const copy = [...prev];
      const first = copy.shift();
      copy.push(first);
      return copy;
    });
  };

  // Rotate carousel to the previous product card
  const handlePrev = () => {
    setProducts((prev) => {
      if (prev.length <= 1) return prev;
      const copy = [...prev];
      const last = copy.pop();
      copy.unshift(last);
      return copy;
    });
  };

  // Auto-slide animation: cycles cards every 2.8 seconds
  useEffect(() => {
    if (isHovered || products.length === 0) return;

    const interval = setInterval(() => {
      handleNext();
    }, 2800);

    return () => clearInterval(interval);
  }, [isHovered, products]);

  const handleEnquire = (productName, e) => {
    if (e) e.stopPropagation();
    openEnquiryModal(productName);
    try {
      window.dispatchEvent(new CustomEvent('open_enquiry_modal', { detail: { productName } }));
    } catch {}
  };

  const handleWhatsApp = (productName, e) => {
    if (e) e.stopPropagation();
    let num = '+91 9876543210';
    try {
      const saved = localStorage.getItem('enquiry_admin_store_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.whatsappNumber) num = parsed.whatsappNumber;
      }
    } catch {}
    openWhatsApp(num, `Hi, I am interested in inquiring about ${productName}.`);
  };

  const handleCardClick = (product) => {
    const targetSlug = product.slug || product.id;
    navigate(`/product/${targetSlug}`);
  };

  const activeCategoryTitle = currentProduct?.name || getCategoryName(currentProduct?.category) || 'Spices';

  return (
    <section className="related-product-section">
      <div className="rp-container-wrapper">
        
        {/* Header Section */}
        <div className="rp-header">
          
          <div className="rp-header-left">
            <span className="rp-subtitle">— RELATED TO {String(activeCategoryTitle).toUpperCase()} ({products.length} PRODUCTS)</span>
            <h2 className="rp-title">
              Related <span className="rp-title-highlight">Products</span>
            </h2>
          </div>

          <a href="/product" className="rp-view-all-link">
            <span>View All Products</span>
            <FiArrowRight size={16} />
          </a>

        </div>

        {/* Carousel Container with Side Overlay Buttons & Auto-Play */}
        <div 
          className="rp-carousel-wrapper"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          
          {/* Floating Left Side Arrow Button */}
          <button 
            type="button" 
            className="rp-side-arrow prev" 
            onClick={handlePrev} 
            aria-label="Previous Products"
          >
            <FiArrowLeft size={20} />
          </button>

          {/* Product Cards Grid Track */}
          <div className="rp-grid-track">
            {products.slice(0, 3).map((product) => (
              <div 
                key={product.id} 
                className="rp-card"
                onClick={() => handleCardClick(product)}
                style={{ cursor: 'pointer' }}
              >
                
                {/* Collection Tag */}
                <span className="rp-card-tag">
                  {product.collection || `${getCategoryName(product.category)} COLLECTION`}
                </span>

                {/* Product Image */}
                <div className="rp-img-container">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="rp-img" 
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/premium_spices.png";
                    }}
                  />
                </div>

                {/* Product Name */}
                <h3 className="rp-card-title">{product.name}</h3>

                {/* Category */}
                <span className="rp-card-category">{getCategoryName(product.category)}</span>

                {/* Description */}
                <p className="rp-card-description">{product.description}</p>

                {/* Action Buttons (Enquire & WhatsApp) */}
                <div className="rp-card-actions">
                  
                  <button 
                    type="button" 
                    className="rp-btn-enquire"
                    onClick={(e) => handleEnquire(product.name, e)}
                  >
                    <MessageSquare size={16} />
                    <span>Enquire Now</span>
                  </button>

                  <button 
                    type="button" 
                    className="rp-btn-whatsapp"
                    onClick={(e) => handleWhatsApp(product.name, e)}
                    aria-label={`Inquire about ${product.name} on WhatsApp`}
                  >
                    <FaWhatsapp size={18} />
                  </button>

                </div>

              </div>
            ))}
          </div>

          {/* Floating Right Side Arrow Button */}
          <button 
            type="button" 
            className="rp-side-arrow next" 
            onClick={handleNext} 
            aria-label="Next Products"
          >
            <FiArrowRight size={20} />
          </button>

        </div>

      </div>
    </section>
  );
};

export default RelatedProduct;


import React from 'react'
import { Link } from 'react-router-dom'
import { FiPackage, FiShield } from 'react-icons/fi'
import { FaRegCommentDots } from 'react-icons/fa'
import { TbTruckDelivery } from 'react-icons/tb'
import { useEnquiryModal } from '../../context/EnquiryModalContext'
import useLiveProducts from '../../hooks/useLiveProducts'

/**
 * ProductBelowNavbar Component
 * Banner section placed directly below the Product Navbar.
 * Features 3 identical, perfectly aligned bronze feature badges.
 */
const ProductBelowNavbar = () => {
  const { openEnquiryModal } = useEnquiryModal()
  const [liveProducts] = useLiveProducts()
  const totalProducts = liveProducts && liveProducts.length > 0 ? liveProducts.length : 26

  const handleBulkEnquiry = () => {
    openEnquiryModal()
  }

  return (
    <section className="product-below-navbar-container">
      <div className="product-below-content">
        
        {/* --- LEFT SECTION: Title, Breadcrumbs & Sub-info --- */}
        <div className="p-below-left">
          {/* Main Collection Title */}
          <h1 className="p-collection-title">Our Product Collection</h1>

          {/* Breadcrumb Links */}
          <div className="p-breadcrumbs">
            <Link to="/">Home</Link>
            <span className="p-slash">/</span>
            <a href="#">Shop</a>
            <span className="p-slash">/</span>
            <span className="p-crumb-pill">All Products</span>
          </div>

          {/* Sub Info Row */}
          <div className="p-sub-info-bar">
            <div className="p-sub-item">
              <FiPackage className="p-sub-icon" />
              <span><strong>{totalProducts}</strong> Products</span>
            </div>

            <span className="p-sub-divider">|</span>

            <div className="p-sub-item">
              <FiShield className="p-sub-icon" />
              <span><strong>FSSAI</strong> Certified</span>
            </div>

            <span className="p-sub-divider">|</span>

            <div className="p-sub-item">
              <TbTruckDelivery className="p-sub-icon" />
              <span><strong>Pan-India</strong> Delivery</span>
            </div>
          </div>
        </div>

        {/* --- MIDDLE SECTION: 3 Identical & Perfectly Aligned Bronze Badges --- */}
        <div className="p-below-middle">
          
          {/* Badge 1: Dynamic Products count */}
          <div className="p-feature-badge-item">
            <div className="p-badge-icon-box">
              <FiPackage className="p-badge-icon" />
            </div>
            <span className="p-badge-text"><strong>{totalProducts}</strong> Products</span>
          </div>
                  
          {/* Badge 2: FSSAI Certified */}
          <div className="p-feature-badge-item">
            <div className="p-badge-icon-box">
              <FiShield className="p-badge-icon" />
              <span className="p-fssai-micro-text">fssai</span>
            </div>
            <span className="p-badge-text"><strong>FSSAI</strong> Certified</span>
          </div>

          {/* Badge 3: Pan-India Delivery */}
          <div className="p-feature-badge-item">
            <div className="p-badge-icon-box">
              <TbTruckDelivery className="p-badge-icon" />
            </div>
            <span className="p-badge-text"><strong>Pan-India</strong> Delivery</span>
          </div>

        </div>

        {/* --- RIGHT SECTION: Bulk Enquiry Button --- */}
        <div className="p-below-right">
          <button 
            type="button" 
            className="p-bulk-enquiry-btn"
            onClick={handleBulkEnquiry}
          >
            <FaRegCommentDots size={15} />
            <span>Bulk Enquiry</span>
          </button>
        </div>

      </div>
    </section>
  )
}

export default ProductBelowNavbar

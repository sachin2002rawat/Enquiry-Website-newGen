import React from 'react';
import './ProductDetailNavbar.css';
import { getCategoryName } from '../../utils/categoryHelper';

// Default static data matching the image design
// Freshers: In the future, you can change these values or fetch them dynamically from JSON / API
const defaultProductData = {
  title: "Garam Masala",
  category: "Pure Spices",
  weight: "100g",
  image: "/garam_masala.png"
};

const ProductDetailNavbar = ({ product = defaultProductData }) => {
  // Use passed product data or fallback to default static data
  const currentProduct = product || defaultProductData;
  const displayTitle = currentProduct.name || currentProduct.title || "Product";
  const displayCategory = getCategoryName(currentProduct.category) || "Pure Spices";
  const displayWeight = currentProduct.weight || "100g";
  const displayImage = currentProduct.image || "/garam_masala.png";

  return (
    <div className="product-detail-navbar">
      <div className="pd-navbar-container">
        
        {/* Left Side: Breadcrumb & Title */}
        <div className="pd-navbar-left">
          
          {/* Breadcrumb Navigation */}
          <nav className="pd-breadcrumb" aria-label="Breadcrumb">
            <a href="/" className="pd-breadcrumb-link">Home</a>
            <span className="pd-breadcrumb-sep">/</span>
            <a href="/product" className="pd-breadcrumb-link">Products</a>
            <span className="pd-breadcrumb-sep">&gt;</span>
            <a href="/product" className="pd-breadcrumb-link">
              {displayCategory}
            </a>
            <span className="pd-breadcrumb-sep">&gt;</span>
            <span className="pd-breadcrumb-current">
              {displayTitle} - {displayWeight}
            </span>
          </nav>

          {/* Product Title and Green Leaf Icon */}
          <div className="pd-title-wrapper">
            <h1 className="pd-title">
              {displayTitle}
            </h1>
            
            {/* Green Leaf Icon Badge */}
            <div className="pd-leaf-badge" title="100% Organic / Vegan">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="6" fill="#4B8B3B" />
                <path
                  d="M17 7C12 7 9 10 8 14C6.5 12 4 11 2 11.5C3 15.5 7 18 10.5 17C13.5 16 17 12 17 7Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>

        </div>

        {/* Right Side: Product Pack Image */}
        <div className="pd-navbar-right">
          <img 
            src={displayImage} 
            alt={displayTitle} 
            className="pd-product-img"
            onError={(e) => {
              // Fallback image if primary image fails to load
              e.target.onerror = null;
              e.target.src = "/masala_tofu.png";
            }}
          />
        </div>

      </div>
    </div>
  );
};

export default ProductDetailNavbar;

import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProductNavbar from '../components/ProductNavbar';
import Footer from '../components/Footer';
import categoryDataMap from '../CategoryProductsData.json';
import productsData from '../ProductsData.json';
import beautyProductsData from '../BeautyProductsData.json';
import useLiveProducts from '../hooks/useLiveProducts';
import useLiveCategories from '../hooks/useLiveCategories';
import { getCategoryName, getCategoryId } from '../utils/categoryHelper';
import { getFullImageUrl } from '../utils/imageUrl';
import '../components/CategoryProductGrid.css';
import { MessageSquare } from 'lucide-react';
import { FaWhatsapp, FaStar, FaFilePdf } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';
import { useEnquiryModal } from '../context/EnquiryModalContext';
import { openWhatsApp } from '../utils/whatsappHelper';

const CategoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openEnquiryModal } = useEnquiryModal();
  const [liveProducts] = useLiveProducts();
  const [liveCategories] = useLiveCategories();

  const combinedCatalog = useMemo(() => [...liveProducts, ...beautyProductsData], [liveProducts]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const categoryKey = id ? id.toLowerCase().trim() : 'garam-masala';

  // Find category in MongoDB liveCategories
  const matchedLiveCategory = useMemo(() => {
    if (!id || !Array.isArray(liveCategories)) return null;
    const cleanId = id.toLowerCase().trim();
    return liveCategories.find((c) => {
      const cSlug = (c.slug || '').toLowerCase().trim();
      const cName = (c.name || '').toLowerCase().trim();
      const cId = (c._id || '').toString().toLowerCase().trim();
      return cSlug === cleanId || cName === cleanId.replace(/-/g, ' ') || cId === cleanId;
    });
  }, [id, liveCategories]);

  // Retrieve exact 4-card category products list from CategoryProductsData.json
  let categoryGroup = categoryDataMap[categoryKey];

  // Fallback matching if slug key isn't exact
  if (!categoryGroup) {
    const foundKey = Object.keys(categoryDataMap).find(
      (key) => key.includes(categoryKey) || categoryKey.includes(key)
    );
    if (foundKey) {
      categoryGroup = categoryDataMap[foundKey];
    }
  }

  const targetNormalized = categoryKey.replace(/-/g, ' ');

  // Dynamic fallback: build category products from live catalog
  // Check if categoryKey matches Category ObjectId, name, or product slug/name
  const liveCategoryMatches = liveProducts.filter((p) => {
    const pCatName = getCategoryName(p.category).toLowerCase().trim();
    const pCatId = getCategoryId(p.category);
    const targetCat = matchedLiveCategory ? matchedLiveCategory.name.toLowerCase().trim() : targetNormalized;
    const targetCatId = matchedLiveCategory ? String(matchedLiveCategory._id) : '';

    return (
      (targetCatId && pCatId && String(pCatId) === targetCatId) ||
      pCatName === targetCat ||
      pCatName === targetNormalized
    );
  });

  // If matched product directly, find all products sharing its category
  let matchedCategoryName = matchedLiveCategory ? matchedLiveCategory.name : '';
  if (!matchedCategoryName && liveCategoryMatches.length > 0) {
    matchedCategoryName = getCategoryName(liveCategoryMatches[0].category);
  }

  const allItemsInSameCategory = matchedCategoryName
    ? liveProducts.filter((p) => {
        const pCatName = getCategoryName(p.category).toLowerCase().trim();
        const pCatId = getCategoryId(p.category);
        const targetCatId = matchedLiveCategory ? String(matchedLiveCategory._id) : '';
        return (
          (targetCatId && pCatId && String(pCatId) === targetCatId) ||
          pCatName === matchedCategoryName.toLowerCase().trim()
        );
      })
    : liveCategoryMatches;

  let displayTitle =
    matchedLiveCategory?.name ||
    categoryGroup?.title ||
    matchedCategoryName ||
    id?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') ||
    'Products';

  let categoryProducts = categoryGroup?.products || [];

  if (allItemsInSameCategory.length > 0 && categoryProducts.length === 0) {
    categoryProducts = allItemsInSameCategory;
  } else if (allItemsInSameCategory.length > 0 && categoryProducts.length > 0) {
    // Merge new admin products that aren't already in categoryProducts
    const existingIds = new Set(
      categoryProducts.map((p) => String(p._id || p.id || p.slug || p.name))
    );
    const newItems = allItemsInSameCategory.filter(
      (p) => !existingIds.has(String(p._id || p.id || p.slug || p.name))
    );
    categoryProducts = [...newItems, ...categoryProducts];
  } else if (categoryProducts.length === 0) {
    categoryProducts = allItemsInSameCategory;
  }

  // Merge latest changes (stock status, name, image, description) from liveProducts
  categoryProducts = categoryProducts.map((item) => {
    const liveMatch = liveProducts.find((lp) =>
      (lp._id && item._id && String(lp._id) === String(item._id)) ||
      (lp.id !== undefined && item.id !== undefined && String(lp.id) === String(item.id)) ||
      (lp.slug && item.slug && lp.slug === item.slug) ||
      (lp.name && item.name && lp.name.toLowerCase() === item.name.toLowerCase())
    );
    return liveMatch ? { ...item, ...liveMatch } : item;
  });

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
    const targetSlug = product.slug || product._id || product.id;
    navigate(`/product/${targetSlug}`);
  };

  return (
    <div>
      <ProductNavbar />

      <section className="category-detail-section">
        <div className="cpg-container-wrapper">
          
          {/* Header Section matching Image 2 */}
          <div className="cpg-header">
            <div className="cpg-header-left">
              <span className="cpg-subtitle">— HANDPICKED FOR YOU</span>
              <h2 className="cpg-title">
                Related <span className="cpg-title-highlight">{displayTitle}</span> Products
              </h2>
            </div>

            <Link to="/product" className="cpg-view-all-link">
              <span>View All Catalog Products</span>
              <FiArrowRight size={16} />
            </Link>
          </div>

          {/* 4-Card Grid matching Image 2 */}
          <div className="cpg-grid-track">
            {categoryProducts.map((product) => (
              <div 
                key={product._id || product.id || product.slug || product.name} 
                className="cpg-card"
                onClick={() => handleCardClick(product)}
                style={{ cursor: 'pointer' }}
              >
                
                {/* Collection Tag */}
                <span className="cpg-card-tag">
                  {product.collection || `${displayTitle.toUpperCase()} COLLECTION`}
                </span>

                {/* Product Image Container with PDF Badge */}
                <div className="cpg-img-container">
                  <img 
                    src={getFullImageUrl(product.image)} 
                    alt={product.name} 
                    className="cpg-img" 
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.opacity = '0.7';
                    }}
                  />
                  {product.hasPdf !== false && (
                    <div className="cpg-pdf-badge" title="Catalog PDF Available">
                      <FaFilePdf size={15} color="#e11d48" />
                    </div>
                  )}
                </div>

                {/* Category Tag */}
                <span className="cpg-card-category">{getCategoryName(product.category)}</span>

                {/* Product Title */}
                <h3 className="cpg-card-title">{product.name}</h3>

                {/* Rating Stars Row */}
                <div className="cpg-rating-row">
                  <div className="cpg-stars">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} size={14} color="#f59e0b" />
                    ))}
                  </div>
                  <span className="cpg-rating-count">({product.rating || 4.8})</span>
                </div>

                {/* Description */}
                <p className="cpg-card-description">{product.description}</p>

                {/* Action Buttons (Enquire & WhatsApp) */}
                <div className="cpg-card-actions">
                  <button 
                    type="button" 
                    className="cpg-btn-enquire"
                    onClick={(e) => handleEnquire(product.name, e)}
                  >
                    <MessageSquare size={16} />
                    <span>Enquire Now</span>
                  </button>

                  <button 
                    type="button" 
                    className="cpg-btn-whatsapp"
                    onClick={(e) => handleWhatsApp(product.name, e)}
                    aria-label={`Inquire about ${product.name} on WhatsApp`}
                  >
                    <FaWhatsapp size={18} />
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CategoryDetails;

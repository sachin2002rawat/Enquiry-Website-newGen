import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { FaWhatsapp, FaFilePdf } from 'react-icons/fa'
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi'
import defaultProductsList from '../../ProductsData.json'
import { useEnquiryModal } from '../../context/EnquiryModalContext'
import useLiveProducts from '../../hooks/useLiveProducts'
import { getCategoryName } from '../../utils/categoryHelper'
import { openWhatsApp } from '../../utils/whatsappHelper'
import { useActiveHomepage } from '../../hooks/useActiveHomepage'

export const defaultPopularItems = [
  {
    id: 13,
    slug: 'chaat-masala',
    name: 'Chaat Masala',
    category: 'MIX MASALA',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    pdfUrl: '',
    whatsappNumber: '+919876543210'
  },
  {
    id: 14,
    slug: 'kitchen-king-masala',
    name: 'Kitchen King Masala',
    category: 'MIX MASALA',
    image: '/garam_masala.png',
    pdfUrl: '',
    whatsappNumber: '+919876543210'
  },
  {
    id: 15,
    slug: 'pav-bhaji-masala',
    name: 'Pav Bhaji Masala',
    category: 'MIX MASALA',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    pdfUrl: '',
    whatsappNumber: '+919876543210'
  },
  {
    id: 16,
    slug: 'biryani-masala',
    name: 'Biryani Masala',
    category: 'MIX MASALA',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    pdfUrl: '',
    whatsappNumber: '+919876543210'
  },
  {
    id: 1,
    slug: 'garam-masala',
    name: 'Garam Masala',
    category: 'PURE SPICES',
    image: '/garam_masala.png',
    pdfUrl: '',
    whatsappNumber: '+919876543210'
  }
]

export const defaultBeautyPopularItems = [
  {
    id: 201,
    slug: 'radiance-vitamin-c-serum',
    name: 'Radiance Vitamin C Serum',
    category: 'SKIN CARE',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    pdfUrl: '',
    whatsappNumber: '+919876543210'
  },
  {
    id: 202,
    slug: 'rosewater-hydrating-moisturizer',
    name: 'Rosewater Hydrating Gel Cream',
    category: 'SKIN CARE',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    pdfUrl: '',
    whatsappNumber: '+919876543210'
  },
  {
    id: 203,
    slug: 'organic-argan-hair-serum',
    name: 'Organic Argan Hair Elixir',
    category: 'HAIR CARE',
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80',
    pdfUrl: '',
    whatsappNumber: '+919876543210'
  },
  {
    id: 204,
    slug: 'tea-tree-foaming-cleanser',
    name: 'Tea Tree Foaming Cleanser',
    category: 'FACE CARE',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80',
    pdfUrl: '',
    whatsappNumber: '+919876543210'
  },
  {
    id: 205,
    slug: 'velvet-matte-lipstick-nude',
    name: 'Velvet Matte Lipstick - Nude Blush',
    category: 'COSMETICS',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
    pdfUrl: '',
    whatsappNumber: '+919876543210'
  },
  {
    id: 206,
    slug: 'detoxifying-charcoal-clay-mask',
    name: 'Detoxifying French Clay Mask',
    category: 'SKIN CARE',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    pdfUrl: '',
    whatsappNumber: '+919876543210'
  }
]

const PopularProduct = ({ data, isBeauty = false }) => {
  const navigate = useNavigate()
  const { openEnquiryModal } = useEnquiryModal()
  const activeHomepage = useActiveHomepage()
  const isBeautyEffective = isBeauty || activeHomepage === 'home2'
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Local admin settings state
  const [adminSettings, setAdminSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('enquiry_admin_store_settings')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // Dynamic popular products list for Home 1 (Masala)
  const [customList, setCustomList] = useState(() => {
    try {
      const saved = localStorage.getItem('enquiry_admin_popular_products')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Dynamic popular products list for Home 2 (Beauty)
  const [customListBeauty, setCustomListBeauty] = useState(() => {
    try {
      const saved = localStorage.getItem('enquiry_admin_popular_products_beauty')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Listen for admin changes across tabs / storage events
  useEffect(() => {
    const handleSync = () => {
      try {
        const savedSettings = localStorage.getItem('enquiry_admin_store_settings')
        if (savedSettings) {
          setAdminSettings(JSON.parse(savedSettings))
        }
        const savedProducts = localStorage.getItem('enquiry_admin_popular_products')
        if (savedProducts) {
          setCustomList(JSON.parse(savedProducts))
        }
        const savedBeautyProducts = localStorage.getItem('enquiry_admin_popular_products_beauty')
        if (savedBeautyProducts) {
          setCustomListBeauty(JSON.parse(savedBeautyProducts))
        }
      } catch (err) {
        console.error('Error syncing Popular Products with localStorage:', err)
      }
    }

    window.addEventListener('storage', handleSync)
    window.addEventListener('homepageChanged', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('homepageChanged', handleSync)
    }
  }, [])

  const [liveProducts] = useLiveProducts()

  // Resolve products list according to active theme (Masala vs Beauty):
  const productsList = useMemo(() => {
    let baseList = []

    if (isBeautyEffective) {
      if (customListBeauty && Array.isArray(customListBeauty) && customListBeauty.length > 0) {
        baseList = customListBeauty
      } else if (adminSettings.popularProductsListBeauty && Array.isArray(adminSettings.popularProductsListBeauty) && adminSettings.popularProductsListBeauty.length > 0) {
        baseList = adminSettings.popularProductsListBeauty
      } else if (data && Array.isArray(data) && data.length > 0) {
        const beautyFiltered = data.filter((p) => {
          const cat = getCategoryName(p.category).toUpperCase()
          return /SKIN|HAIR|FACE|BODY|BEAUTY|COSMETIC|SERUM|CREAM|LOTION|OIL/i.test(cat) ||
                 /SERUM|CREAM|LOTION|CLEANSER|LIPSTICK|TONER|MOISTURIZER/i.test(p.name || '')
        })
        baseList = beautyFiltered.length > 0 ? beautyFiltered.slice(0, 6) : defaultBeautyPopularItems
      } else {
        baseList = defaultBeautyPopularItems
      }
    } else {
      if (customList && Array.isArray(customList) && customList.length > 0) {
        baseList = customList
      } else if (adminSettings.popularProductsList && Array.isArray(adminSettings.popularProductsList) && adminSettings.popularProductsList.length > 0) {
        baseList = adminSettings.popularProductsList
      } else if (data && Array.isArray(data) && data.length > 0) {
        baseList = data.slice(0, 6)
      } else {
        baseList = defaultPopularItems
      }
    }

    // Merge real-time changes (edited name, image, category, stock status, weight) from liveProducts
    return baseList.map((item) => {
      const match = liveProducts.find(
        (p) =>
          (p._id && item._id && String(p._id) === String(item._id)) ||
          (p.id !== undefined && item.id !== undefined && String(p.id) === String(item.id)) ||
          (p.slug && item.slug && p.slug === item.slug) ||
          (p.name && item.name && p.name.toLowerCase() === item.name.toLowerCase())
      )
      return match ? { ...item, ...match } : item
    })
  }, [isBeautyEffective, data, customList, customListBeauty, adminSettings.popularProductsList, adminSettings.popularProductsListBeauty, liveProducts])

  // Computed configuration variables according to active theme
  const subtitle = isBeautyEffective
    ? (adminSettings.popularProductsSubtitleBeauty || '— MOST LOVED BEAUTY')
    : (adminSettings.popularProductsSubtitle || '— TRENDING NOW')

  const titleMain = isBeautyEffective
    ? (adminSettings.popularProductsTitleMainBeauty !== undefined ? adminSettings.popularProductsTitleMainBeauty : 'Popular')
    : (adminSettings.popularProductsTitleMain !== undefined ? adminSettings.popularProductsTitleMain : 'Popular')

  const titleHighlight = isBeautyEffective
    ? (adminSettings.popularProductsTitleHighlightBeauty !== undefined ? adminSettings.popularProductsTitleHighlightBeauty : 'Products')
    : (adminSettings.popularProductsTitleHighlight !== undefined ? adminSettings.popularProductsTitleHighlight : 'Products')

  const description = isBeautyEffective
    ? (adminSettings.popularProductsDescBeauty || 'Explore our most-loved skincare, haircare, and beauty essentials, trusted by thousands of glowing customers.')
    : (adminSettings.popularProductsDesc || 'Explore our most-loved items, trusted by thousands of happy customers across the country.')

  const browseText = isBeautyEffective
    ? (adminSettings.popularProductsBrowseTextBeauty || 'Browse Beauty Collection')
    : (adminSettings.popularProductsBrowseText || 'Browse All Products')

  const browseLink = isBeautyEffective
    ? (adminSettings.popularProductsBrowseLinkBeauty || '/product')
    : (adminSettings.popularProductsBrowseLink || '/product')

  const autoPlay = adminSettings.popularProductsAutoPlay !== false
  const intervalSeconds = Number(adminSettings.popularProductsInterval) || 3
  const showEnquire = adminSettings.popularProductsShowEnquire !== false
  const showBulk = adminSettings.popularProductsShowBulk !== false
  const showPdf = adminSettings.popularProductsShowPdf !== false

  // Auto-play: cycles cards every N seconds, pauses on mouse hover
  useEffect(() => {
    if (!autoPlay || isHovered || !productsList || productsList.length === 0) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % productsList.length)
    }, intervalSeconds * 1000)

    return () => clearInterval(interval)
  }, [autoPlay, isHovered, productsList.length, intervalSeconds])

  const handleNext = () => {
    if (!productsList || productsList.length === 0) return
    setActiveIndex((prev) => (prev + 1) % productsList.length)
  }

  const handlePrev = () => {
    if (!productsList || productsList.length === 0) return
    setActiveIndex((prev) => (prev - 1 + productsList.length) % productsList.length)
  }

  const handleEnquire = (productName, e) => {
    e.stopPropagation() // Prevent card select click trigger
    openEnquiryModal(productName)
    try {
      window.dispatchEvent(new CustomEvent('open_enquiry_modal', { detail: { productName } }))
    } catch {}
  }

  const handleBulkWhatsApp = (product, e) => {
    e.stopPropagation()
    let targetPhone = product?.whatsappNumber || adminSettings?.whatsappNumber || '+91 9555140701'
    try {
      const saved = localStorage.getItem('enquiry_admin_store_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.whatsappNumber) targetPhone = parsed.whatsappNumber
      }
    } catch {}
    openWhatsApp(targetPhone, `Hi, I would like to make an enquiry about ${product?.name || 'Product'}.`)
  }

  const handleCardClick = (index, product) => {
    if (index === activeIndex && product) {
      const targetSlug = product.slug || product.id
      navigate(`/product/${targetSlug}`)
    } else {
      setActiveIndex(index) // Click an adjacent card to immediately slide it to center focus
    }
  }

  // Coverflow class generator using relative circular index offsets
  const getCoverflowClass = (index) => {
    const total = productsList.length
    if (total <= 1) return 'card-center'
    const diff = (index - activeIndex + total) % total

    if (diff === 0) return 'card-center'
    if (diff === 1) return 'card-next'
    if (diff === total - 1) return 'card-prev'
    if (diff === 2) return 'card-far-next'
    if (diff === total - 2) return 'card-far-prev'
    return 'card-hidden'
  }

  return (
    <section className={`popular-products-section ${isBeautyEffective ? 'is-beauty' : ''}`}>
      {/* 1. Header Area (Trending subtitle, Gold-highlighted title, Description & Link) */}
      <div className="popular-header">
        {subtitle && <span className="popular-subtitle">{subtitle}</span>}
        <h2 className="popular-title">
          {titleMain} {titleHighlight && <span className="gold-highlight">{titleHighlight}</span>}
        </h2>
        {description && <p className="popular-description">{description}</p>}
        {browseText && (
          <a
            href={browseLink}
            className="browse-all-link"
            onClick={(e) => {
              e.preventDefault()
              if (browseLink.startsWith('http')) {
                window.open(browseLink, '_blank')
              } else {
                navigate(browseLink)
              }
            }}
          >
            {browseText} <span className="arrow">→</span>
          </a>
        )}
      </div>

      {/* 2. Coverflow Carousel wrapper (pauses and starts rotation on hover) */}
      <div
        className="popular-carousel-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left Arrow Button */}
        <button
          type="button"
          className="carousel-arrow-btn prev"
          onClick={handlePrev}
          aria-label="Previous products"
          style={{ left: '-20px', zIndex: 15 }}
        >
          <FiArrowLeft size={20} />
        </button>

        {/* Dynamic Coverflow Track */}
        <div className="popular-track-container">
          {productsList.map((product, index) => {
            const coverflowClass = getCoverflowClass(index)
            return (
              <div
                key={product.id || index}
                className={`popular-card-coverflow ${coverflowClass} ${isBeauty ? 'beauty-card-vertical' : ''}`}
                onClick={() => handleCardClick(index, product)}
              >
                {/* Left Column: Product Image with soft square background */}
                <div className="popular-img-container">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="popular-img"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.onerror = null
                      const catName = getCategoryName(product?.category)
                      const isBeautyMatch = catName && /SKIN|HAIR|FACE|BODY|COSMETICS|BEAUTY/i.test(catName)
                      e.target.src = isBeautyMatch
                        ? 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
                        : '/garam_masala.png'
                    }}
                  />
                  {showPdf && (
                    <div
                      className="popular-card-pdf-badge"
                      title={product.pdfUrl ? 'Download Catalog PDF' : 'Catalog PDF Available'}
                      onClick={(e) => {
                        if (product.pdfUrl) {
                          e.stopPropagation()
                          window.open(product.pdfUrl, '_blank')
                        }
                      }}
                      style={{ cursor: product.pdfUrl ? 'pointer' : 'default' }}
                    >
                      <FaFilePdf size={16} color="#e11d48" />
                    </div>
                  )}
                </div>

                {/* Center Column: Category label and bold Product Title */}
                <div className="popular-details">
                  <span className="popular-card-category">{getCategoryName(product.category)}</span>
                  <h3 className="popular-card-name">{product.name}</h3>
                </div>

                {/* Right Column: Stacked Action Pill Buttons */}
                {(showEnquire || showBulk) && (
                  <div className="popular-actions">
                    {showEnquire && (
                      <button
                        type="button"
                        className="popular-enquire-btn"
                        onClick={(e) => handleEnquire(product.name, e)}
                      >
                        <MessageSquare size={14} /> Enquire Now
                      </button>
                    )}

                    {showBulk && (
                      <button
                        type="button"
                        className="popular-bulk-btn"
                        onClick={(e) => handleBulkWhatsApp(product, e)}
                      >
                        <FaWhatsapp size={16} /> Bulk Enquire
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          className="carousel-arrow-btn next"
          onClick={handleNext}
          aria-label="Next products"
          style={{ right: '-20px', zIndex: 15 }}
        >
          <FiArrowRight size={20} />
        </button>
      </div>
    </section>
  )
}

export default React.memo(PopularProduct)

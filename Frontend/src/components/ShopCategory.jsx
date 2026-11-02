import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi'
import { FaFilePdf } from 'react-icons/fa'
import { Store } from 'lucide-react'

import productsData from '../ProductsData.json'
import useLiveProducts from '../hooks/useLiveProducts'
import useLiveCategories from '../hooks/useLiveCategories'

const ShopCategory = ({ data, categories: propCategories, isBeauty = false, cardsToShow }) => {
  const [liveCategories] = useLiveCategories()
  const [liveProducts] = useLiveProducts()
  const displayCount = cardsToShow || (isBeauty ? 4 : 3)
  const navigate = useNavigate()

  // Use MongoDB live categories for storefront browsing
  const activeDataset = React.useMemo(() => {
    let list = []
    if (isBeauty) {
      list = data && data.length > 0 ? data : liveProducts
    } else if (liveCategories && liveCategories.length > 0) {
      list = liveCategories
    } else if (propCategories && propCategories.length > 0) {
      list = propCategories
    } else {
      list = data && data.length > 0 ? data : liveProducts
    }
    if (Array.isArray(list)) {
      return list.filter((item) => item && item.isActive !== false)
    }
    return []
  }, [isBeauty, liveCategories, propCategories, data, liveProducts])

  // Ref for Carousel Track
  const trackRef = React.useRef(null)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragScrollLeft, setDragScrollLeft] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const handleViewAll = () => {
    navigate('/product')
  }

  const handleCategoryClick = (category) => {
    if (isDragging) return
    if (category) {
      const targetSlug =
        category.slug ||
        (category.name ? category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : category.id)
      navigate(`/category/${targetSlug}`)
    } else {
      navigate('/product')
    }
  }

  // Move carousel to the right (smooth scroll forward)
  const handleNext = () => {
    if (!trackRef.current) return
    const card = trackRef.current.querySelector('.category-card')
    const gap = 24
    const scrollStep = card ? (card.offsetWidth + gap) : 340
    const maxScroll = trackRef.current.scrollWidth - trackRef.current.clientWidth

    if (trackRef.current.scrollLeft >= maxScroll - 15) {
      // Loop smoothly back to the beginning
      trackRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      trackRef.current.scrollBy({ left: scrollStep, behavior: 'smooth' })
    }
  }

  // Move carousel to the left (smooth scroll backward)
  const handlePrev = () => {
    if (!trackRef.current) return
    const card = trackRef.current.querySelector('.category-card')
    const gap = 24
    const scrollStep = card ? (card.offsetWidth + gap) : 340

    if (trackRef.current.scrollLeft <= 15) {
      // Loop smoothly to the end
      trackRef.current.scrollTo({
        left: trackRef.current.scrollWidth - trackRef.current.clientWidth,
        behavior: 'smooth'
      })
    } else {
      trackRef.current.scrollBy({ left: -scrollStep, behavior: 'smooth' })
    }
  }

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e) => {
    if (!trackRef.current) return
    if (e.target.closest('button')) return
    setIsMouseDown(true)
    setIsDragging(false)
    setDragStartX(e.pageX - trackRef.current.offsetLeft)
    setDragScrollLeft(trackRef.current.scrollLeft)
  }

  const handleMouseMove = (e) => {
    if (!isMouseDown || !trackRef.current) return
    const x = e.pageX - trackRef.current.offsetLeft
    const walk = x - dragStartX
    if (Math.abs(walk) > 6) {
      setIsDragging(true)
    }
    trackRef.current.scrollLeft = dragScrollLeft - walk
  }

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false)
    setTimeout(() => setIsDragging(false), 60)
  }

  // Touch Swipe Gesture Handlers for Mobile Responsive Category Carousel
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
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

    if (isLeftSwipe) {
      handleNext()
    } else if (isRightSwipe) {
      handlePrev()
    }
  }

  return (
    <section className="shop-category-section">
      {/* 1. Header Section (Titles and View All Button) */}
      <div className="shop-category-header">
        {/* Left Side: Icon & Titles */}
        <div className="shop-category-header-left">
          <div className="shop-category-icon-wrapper">
            <Store size={30} className="shop-category-icon" />
          </div>
          <div className="shop-category-titles">
            <span className="shop-category-subtitle">Browse By</span>
            <h2 className="shop-category-title">Our Categories</h2>
          </div>
        </div>
         
        {/* Right Side: View All Button */}
        <button 
          className="view-all-btn"  
          onClick={handleViewAll}   
        >
          View All
        </button>
      </div>

      {/* 2. Carousel Container (with Left & Right Overlay Arrows) */}
      <div className="shop-category-carousel-wrapper">
        {/* Left Arrow Button */}
        <button 
          className="carousel-arrow-btn prev" 
          onClick={handlePrev} 
          aria-label="Previous categories"
        >
          <FiArrowLeft size={20} />
        </button>

        {/* Category Cards Track with Smooth Scroll & Touch/Drag */}
        <div 
          ref={trackRef}
          className={`shop-category-list cards-${displayCount}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {activeDataset.map((category, idx) => {
            const displayName = category.name || category.title || 'Category';
            const catImage = (category.image && typeof category.image === 'string' && category.image.trim()) || category.sampleImage || '/garam_masala.png';
            return (
              <div          
                key={category._id || category.id || `${displayName}-${idx}`} 
                className={`category-card ${isBeauty ? 'beauty-animated-card' : ''}`}  
                onClick={() => handleCategoryClick(category)}
              >
                {/* Container for the category image */}
                <div className="category-card-img-container">
                  <img 
                    src={catImage} 
                    alt={displayName} 
                    className="category-card-img" 
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/garam_masala.png';
                    }}
                  />
                  <div className="category-card-pdf-badge" title="Catalog PDF Available">
                    <FaFilePdf size={16} color="#e11d48" />
                  </div>
                </div>

                {/* Category/Product Name below image */}
                <h3 className="category-card-title">
                  {displayName}
                </h3>
              </div>
            )
          })}
        </div>

        {/* Right Arrow Button */}
        <button 
          className="carousel-arrow-btn next" 
          onClick={handleNext} 
          aria-label="Next categories"
        >
          <FiArrowRight size={20} />
        </button>
      </div>
    </section>
  )
}

export default ShopCategory

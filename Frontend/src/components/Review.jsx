import React, { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import reviewsData from '../Review.json'
import { apiService } from '../api/apiService'

const LOCAL_KEY_REVIEWS = 'enquiry_admin_reviews'
const LOCAL_KEY_SETTINGS = 'enquiry_admin_store_settings'

const Review = ({ data, isBeauty = false }) => {
  // Dynamic review list state
  const [reviewList, setReviewList] = useState(() => {
    if (data && data.length > 0) return data
    try {
      const saved = localStorage.getItem(LOCAL_KEY_REVIEWS)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      const savedSettings = localStorage.getItem(LOCAL_KEY_SETTINGS)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        if (Array.isArray(parsed.reviewsList) && parsed.reviewsList.length > 0) {
          return parsed.reviewsList
        }
      }
      return reviewsData
    } catch {
      return reviewsData
    }
  })

  // Dynamic header titles
  const [meta, setMeta] = useState(() => {
    try {
      const savedSettings = localStorage.getItem(LOCAL_KEY_SETTINGS)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        return {
          tag: parsed.reviewTag || '— CUSTOMER LOVE',
          title: parsed.reviewTitle || 'What They Say About Us'
        }
      }
    } catch {}
    return {
      tag: '— CUSTOMER LOVE',
      title: 'What They Say About Us'
    }
  })

  // Real-time synchronization with localStorage changes from Admin
  useEffect(() => {
    if (data && data.length > 0) return
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(LOCAL_KEY_REVIEWS)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReviewList(parsed)
          }
        }
        const savedSettings = localStorage.getItem(LOCAL_KEY_SETTINGS)
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          if (!saved && Array.isArray(parsed.reviewsList) && parsed.reviewsList.length > 0) {
            setReviewList(parsed.reviewsList)
          }
          setMeta({
            tag: parsed.reviewTag || '— CUSTOMER LOVE',
            title: parsed.reviewTitle || 'What They Say About Us'
          })
        }
      } catch {}
    }
    window.addEventListener('storage', handleSync)
    return () => window.removeEventListener('storage', handleSync)
  }, [data])

  // Sync with MongoDB backend if available
  useEffect(() => {
    if (data && data.length > 0) return
    let isMounted = true
    const fetchRemoteSettings = async () => {
      try {
        const dbSettings = await apiService.getSettings()
        if (dbSettings && isMounted) {
          if (Array.isArray(dbSettings.reviewsList) && dbSettings.reviewsList.length > 0) {
            setReviewList(dbSettings.reviewsList)
          }
          setMeta({
            tag: dbSettings.reviewTag || '— CUSTOMER LOVE',
            title: dbSettings.reviewTitle || 'What They Say About Us'
          })
        }
      } catch {}
    }
    fetchRemoteSettings()
    return () => {
      isMounted = false
    }
  }, [data])

  const activeDataset = data && data.length > 0 ? data : reviewList

  // Duplicate dataset to create seamless non-stop infinite loop
  const marqueeDataset = [...activeDataset, ...activeDataset]

  // Intelligent title highlighting (e.g. highlight "About Us" or final words in blue)
  const renderFormattedTitle = (titleStr) => {
    if (!titleStr) return null
    if (titleStr.includes('About Us')) {
      const parts = titleStr.split('About Us')
      return (
        <>
          {parts[0]}<span className="review-title-blue">About Us</span>{parts.slice(1).join('About Us')}
        </>
      )
    }
    const words = titleStr.split(' ')
    if (words.length > 2) {
      const main = words.slice(0, words.length - 2).join(' ')
      const highlight = words.slice(words.length - 2).join(' ')
      return (
        <>
          {main} <span className="review-title-blue">{highlight}</span>
        </>
      )
    }
    return titleStr
  }

  return (
    <section className="review-section">
      {/* Subtle glowing background beam */}
      <div className="review-bg-glow"></div>

      {/* Header Area: Subtitle & Title */}
      <div className="review-header">
        <div className="review-header-left">
          <span className="review-subtitle-tag">{meta.tag}</span>
          <h2 className="review-title">
            {renderFormattedTitle(meta.title)}
          </h2>
        </div>
      </div>

      {/* Non-Stop Infinite Smooth Slow Marquee Moving Left-to-Right */}
      <div className="review-marquee-stage">
        <div className="review-marquee-track">
          {marqueeDataset.map((review, index) => (
            <div 
              key={`${review.id}-${index}`} 
              className={`review-marquee-card ${isBeauty ? 'beauty-review-card' : ''}`}
            >
              {/* Card Header Tag & Rating */}
              <div className="review-card-top-row">
                <span className="review-card-category-tag">{review.category || 'TRUST & QUALITY'}</span>
                <div className="review-card-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      color="#f59e0b" 
                      fill={i < (review.rating || 5) ? '#f59e0b' : 'transparent'} 
                    />
                  ))}
                </div>
              </div>

              {/* Quote Mark Decor */}
              <div className="card-quote-icon">“</div>

              {/* Review Testimonial Quote */}
              <p className="review-card-body-text">
                "{review.review}"
              </p>

              {/* Author & Verification Footer */}
              <div className="review-card-bottom-row">
                <div className="review-author-info">
                  <img 
                    src={review.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
                    alt={review.name} 
                    className="review-author-avatar"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                    }}
                  />
                  <div className="review-author-details">
                    <h4 className="review-author-name">{review.name}</h4>
                    <span className="review-author-role">
                      {review.verified || 'Verified Buyer'} · {review.location || 'Customer'}
                    </span>
                  </div>
                </div>

                <div className="review-verified-badge">
                  <Star size={13} color="#f59e0b" fill="#f59e0b" />
                  <span>{review.rating || 5}.0 ★</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </section>
  )
}

export default React.memo(Review)

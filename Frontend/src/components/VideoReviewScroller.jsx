import React, { useState } from 'react'
import { Star, Play, X } from 'lucide-react'
import beautyVideoReviews from '../BeautyVideoReview.json'

const VideoReviewScroller = ({ data }) => {
  const activeDataset = data && data.length > 0 ? data : beautyVideoReviews
  const [selectedVideo, setSelectedVideo] = useState(null)

  // Duplicate dataset to create seamless non-stop infinite scroller
  const marqueeDataset = [...activeDataset, ...activeDataset]

  return (
    <section className="video-review-section">
      <div className="review-bg-glow"></div>

      {/* Header Area: Subtitle & Title */}
      <div className="review-header">
        <div className="review-header-left">
          <span className="review-subtitle-tag">— VIDEO TESTIMONIALS</span>
          <h2 className="review-title">
            What People Say <span className="review-title-blue">About Beauty Products</span>
          </h2>
        </div>
      </div>

      {/* Infinite Marquee Scroller moving Left-to-Right */}
      <div className="review-marquee-stage">
        <div className="video-marquee-track">
          {marqueeDataset.map((item, index) => (
            <div 
              key={`video-rev-${item.id}-${index}`} 
              className="video-review-card"
            >
              {/* Card Top Row: Category Tag & Rating Stars */}
              <div className="review-card-top-row">
                <span className="review-card-category-tag">{item.category}</span>
                <div className="review-card-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      color="#f59e0b" 
                      fill={i < (item.rating || 5) ? '#f59e0b' : 'transparent'} 
                    />
                  ))}
                </div>
              </div>

              {/* Quote Icon Decor */}
              <div className="card-quote-icon">“</div>

              {/* Video Thumbnail Box with Play Button */}
              <div 
                className="video-card-thumbnail-box"
                onClick={() => setSelectedVideo(item)}
                title="Click to watch YouTube review"
              >
                <img 
                  src={item.thumbnail} 
                  alt={item.productName || item.name} 
                  className="video-card-thumb-img"
                  loading="lazy"
                />
                <div className="video-card-overlay">
                  <div className="video-play-button">
                    <Play size={22} fill="#ffffff" color="#ffffff" className="play-icon-offset" />
                  </div>
                  <span className="video-card-product-tag">{item.productName}</span>
                </div>
              </div>

              {/* Review Text */}
              <p className="video-card-review-text">
                "{item.review}"
              </p>

              {/* Author & Rating Footer */}
              <div className="review-card-bottom-row">
                <div className="review-author-info">
                  <img 
                    src={item.avatar || item.image} 
                    alt={item.name} 
                    className="review-author-avatar"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                    }}
                  />
                  <div className="review-author-details">
                    <h4 className="review-author-name">{item.name}</h4>
                    <span className="review-author-role">
                      {item.role || 'Verified Buyer'} · {item.location || 'Customer'}
                    </span>
                  </div>
                </div>

                <div className="review-verified-badge">
                  <Star size={13} color="#f59e0b" fill="#f59e0b" />
                  <span>{item.rating || 5}.0 ★</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* YouTube Video Modal Overlay */}
      {selectedVideo && (
        <div className="video-modal-backdrop" onClick={() => setSelectedVideo(null)}>
          <div className="video-modal-container" onClick={(e) => e.stopPropagation()}>
            <button 
              className="video-modal-close" 
              onClick={() => setSelectedVideo(null)}
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <div className="video-modal-header">
              <h3>{selectedVideo.productName} — Video Review</h3>
              <p>By {selectedVideo.name} ({selectedVideo.role})</p>
            </div>
            <div className="video-modal-iframe-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                title={`${selectedVideo.name} Video Review`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

    </section>
  )
}

export default React.memo(VideoReviewScroller)

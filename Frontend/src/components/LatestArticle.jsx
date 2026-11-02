import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi'
import ScrollReveal from './ScrollReveal'
import { useLiveBlogs } from '../hooks/useLiveBlogs'
import { getFullImageUrl } from '../utils/imageUrl'

const LatestArticle = ({ data, isBeauty = false }) => {
  const navigate = useNavigate()
  const { blogs } = useLiveBlogs()

  // Filter live blogs: must be published and belong to the current homepage (or 'all')
  const activeArticles = useMemo(() => {
    // If external non-empty data is provided, use it; otherwise use live blogs from MongoDB/admin
    const source = (data && data.length > 0) ? data : (blogs || [])
    return source.filter((article) => {
      if (!article) return false
      if (article.isPublished === false) return false
      const idStr = String(article._id || article.id || '')
      // Discard legacy mock/product items
      if (idStr.startsWith('seed-masala-') || idStr.startsWith('seed-beauty-')) return false

      const target = article.targetHomepage || 'home1'
      if (isBeauty) {
        return target === 'home2' || target === 'all'
      }
      return target === 'home1' || target === 'all'
    })
  }, [data, blogs, isBeauty])

  // If no blog articles exist for this homepage, hide the entire section completely
  if (!activeArticles || activeArticles.length === 0) {
    return null
  }

  return (
    <ScrollReveal variant="up">
      <LatestArticleContent 
        articlesList={activeArticles} 
        isBeauty={isBeauty} 
        navigate={navigate} 
      />
    </ScrollReveal>
  )
}

const LatestArticleContent = ({ articlesList, isBeauty, navigate }) => {
  // Store articles in state for carousel rotation
  const [products, setProducts] = useState(articlesList)

  useEffect(() => {
    setProducts(articlesList)
  }, [articlesList])

  const handleNext = () => {
    setProducts((prev) => {
      if (!prev || prev.length <= 1) return prev
      const copy = [...prev]
      const first = copy.shift()
      copy.push(first)
      return copy
    })
  }

  const handlePrev = () => {
    setProducts((prev) => {
      if (!prev || prev.length <= 1) return prev
      const copy = [...prev]
      const last = copy.pop()
      copy.unshift(last)
      return copy
    })
  }

  const handleArticleClick = (article) => {
    const articleId = article?.slug || article?._id || article?.id
    if (articleId) {
      navigate(`/blog/${articleId}`)
    } else {
      navigate('/blog')
    }
  }

  const fallbackImg = isBeauty
    ? 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
    : '/premium_spices.png'

  return (
    <section className="latest-articles-section">
      <div className="latest-articles-container">
        
        {/* Header Section */}
        <div className="latest-articles-header">
          <div className="latest-articles-header-left">
            <span className="latest-subtitle-tag">— STAY INFORMED</span>
            <h2 className="latest-title">The Latest Articles</h2>
          </div>

          <div className="latest-header-right">
            <a 
              href="/blog" 
              className="view-all-articles-link"
            >
              View All Articles <span className="link-arrow">→</span>
            </a>

            {/* Carousel Arrow Controls */}
            {products.length > 1 && (
              <div className="latest-carousel-nav">
                <button 
                  type="button" 
                  className="latest-arrow-btn" 
                  onClick={handlePrev}
                  aria-label="Previous article"
                >
                  <FiArrowLeft size={18} />
                </button>
                <button 
                  type="button" 
                  className="latest-arrow-btn" 
                  onClick={handleNext}
                  aria-label="Next article"
                >
                  <FiArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Articles Grid / Carousel Stage */}
        <div className="latest-articles-grid">
          {products.slice(0, 3).map((article, idx) => {
            const articleKey = article._id || article.id || article.slug || idx
            const title = article.title || article.name || 'Untitled Article'
            const category = article.category || (isBeauty ? 'BEAUTY' : 'FEATURED')
            const imgUrl = getFullImageUrl(article.image || article.images?.[0] || '')

            return (
              <div 
                key={articleKey} 
                className={`article-card ${isBeauty ? 'beauty-animated-article-card' : ''}`}
                onClick={() => handleArticleClick(article)}
                style={{ cursor: 'pointer' }}
              >
                {/* Ribbon Bookmark Date Tag */}
                <div className="article-date-ribbon">
                  <span className="ribbon-fold"></span>
                  {category}
                </div>

                {/* Card Image */}
                <div className="article-img-container">
                  <img 
                    src={imgUrl || fallbackImg} 
                    alt={title} 
                    className="article-img"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = fallbackImg
                    }}
                  />
                </div>

                {/* Bottom Frosted Glassmorphism Panel */}
                <div className="article-glass-panel">
                  <h3 className="article-title">{title}</h3>
                  
                  <div className="article-panel-footer">
                    <span className="read-more-link">
                      Read More <FiArrowRight size={15} className="read-arrow" />
                    </span>

                    {/* Brand Leaf Watermark Icon */}
                    <div className="article-brand-watermark">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
                      </svg>
                    </div>
                  </div>

                </div>

              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

export default React.memo(LatestArticle)

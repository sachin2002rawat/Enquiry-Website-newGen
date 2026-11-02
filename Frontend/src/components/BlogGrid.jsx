import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useActiveHomepage } from '../hooks/useActiveHomepage'
import { useLiveBlogs } from '../hooks/useLiveBlogs'
import { getCategoryName } from '../utils/categoryHelper'
import './BlogGrid.css'

const ITEMS_PER_PAGE = 9 // Exactly 3 rows of 3 articles each

const BlogGrid = () => {
  const navigate = useNavigate()
  const activeHomepage = useActiveHomepage()
  const { blogs } = useLiveBlogs()

  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // 1. Choose articles dataset strictly matching the active homepage from saved blogs only
  const allArticles = useMemo(() => {
    if (activeHomepage === 'home2') {
      return (blogs || []).filter(
        b => b.targetHomepage === 'home2' || b.targetHomepage === 'all'
      )
    }

    return (blogs || []).filter(
      b => b.targetHomepage === 'home1' || b.targetHomepage === 'all' || !b.targetHomepage
    )
  }, [activeHomepage, blogs])

  // 2. Generate category tabs dynamically based on the active dataset only
  // Using getCategoryName to safely handle both plain string categories and MongoDB populated category objects
  const categories = useMemo(() => {
    const rawCategories = (allArticles || [])
      .map((item) => (getCategoryName(item?.category) || '').trim().toUpperCase())
      .filter(Boolean)
    const unique = Array.from(new Set(rawCategories))
    return ['All', ...unique]
  }, [allArticles])

  // Reset category filter & page if active homepage changes
  useEffect(() => {
    setActiveTab('All')
    setCurrentPage(1)
    setSearchQuery('')
  }, [activeHomepage])

  // 3. Filter articles based on Category tab and Search Query
  const filteredArticles = useMemo(() => {
    return (allArticles || []).filter((item) => {
      const title = item?.title || item?.name || ''
      const desc = item?.description || ''
      const cat = getCategoryName(item?.category) || ''

      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.toLowerCase().includes(searchQuery.toLowerCase())

      if (activeTab === 'All') return matchesSearch
      return matchesSearch && cat.toUpperCase() === activeTab.toUpperCase()
    })
  }, [allArticles, activeTab, searchQuery])

  // 4. Calculate pagination slices (9 items per page: 3 rows of 3)
  const totalArticles = filteredArticles.length
  const totalPages = Math.max(1, Math.ceil(totalArticles / ITEMS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const currentArticles = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE
    return filteredArticles.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredArticles, safeCurrentPage])

  const handleTabChange = (cat) => {
    setActiveTab(cat)
    setCurrentPage(1)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      const section = document.querySelector('.blog-grid-section')
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <section className="blog-grid-section">
      {/* Filter Tabs & Search Bar */}
      <div className="blog-grid-toolbar">
        <div className="blog-filter-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`blog-filter-btn ${activeTab === cat ? 'active' : ''}`}
              onClick={() => handleTabChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="blog-search-box">
          <input
            type="text"
            className="blog-search-input"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <FiSearch size={18} className="blog-search-icon" />
        </div>
      </div>

      {/* Blog Cards Grid (3 Columns x 3 Rows = 9 Cards) */}
      <div className="blog-articles-grid">
        {currentArticles.map((item, idx) => {
          const catName = getCategoryName(item?.category) || 'ARTICLE'
          const itemId = item?._id || item?.id || idx
          const title = item?.title || item?.name || 'Article'
          
          return (
            <div 
              key={itemId} 
              className="blog-card"
              onClick={() => navigate(`/blog/${itemId}`)}
            >
              <div className="blog-card-img-wrapper">
                <span className="blog-card-date-ribbon">{catName}</span>
                <img
                  src={item?.image || '/premium_spices.png'}
                  alt={title}
                  className="blog-card-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = activeHomepage === 'home2'
                      ? 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
                      : '/premium_spices.png'
                  }}
                />
              </div>

              <div className="blog-card-body">
                <h3 className="blog-card-title">{title}</h3>
                <p className="blog-card-desc">{item?.description || ''}</p>
                
                <div className="blog-card-footer">
                  <span className="blog-read-link">
                    Read Article <FiArrowRight size={14} />
                  </span>
                  <span className="blog-read-time">⭐ {item?.rating || 4.8} ({item?.reviewsCount || 120})</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {currentArticles.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <h3>No articles found</h3>
          <p>Try searching for a different keyword or select another category.</p>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="blog-pagination-wrapper">
          <div className="blog-pagination-info">
            Showing {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safeCurrentPage * ITEMS_PER_PAGE, totalArticles)} of {totalArticles} articles
          </div>

          <div className="blog-pagination-controls">
            <button
              type="button"
              className="blog-page-btn nav-arrow"
              disabled={safeCurrentPage === 1}
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              aria-label="Previous Page"
            >
              <FiChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => {
              const pageNum = index + 1
              return (
                <button
                  key={pageNum}
                  type="button"
                  className={`blog-page-btn page-num ${safeCurrentPage === pageNum ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              type="button"
              className="blog-page-btn nav-arrow"
              disabled={safeCurrentPage === totalPages}
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              aria-label="Next Page"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default React.memo(BlogGrid)

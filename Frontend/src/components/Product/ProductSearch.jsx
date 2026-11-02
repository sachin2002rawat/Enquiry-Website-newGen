import React, { useState, useEffect } from 'react'
import { FiSearch } from 'react-icons/fi'

/**
 * ProductSearch Component
 * Real-time search box matching the CategoryFilter dark header theme.
 */
const ProductSearch = ({ searchTerm = '', onSearch }) => {
  const [internalTerm, setInternalTerm] = useState(searchTerm)

  useEffect(() => {
    setInternalTerm(searchTerm)
  }, [searchTerm])

  const handleChange = (e) => {
    const val = e.target.value
    setInternalTerm(val)
    if (onSearch) {
      onSearch(val)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(internalTerm)
    }
  }

  const handleClear = () => {
    setInternalTerm('')
    if (onSearch) {
      onSearch('')
    }
  }

  return (
    <div className="modern-search-card">
      
      {/* Dark Header Bar */}
      <div className="search-header-bar">
        <h3 className="search-header-title">Search Products</h3>
      </div>

      {/* Card Body with Search Input */}
      <div className="search-card-body">
        <form onSubmit={handleSubmit} className="modern-search-form">
          <div className="modern-search-input-box">
            <FiSearch className="search-box-icon" />
            
            <input
              type="text"
              className="modern-search-input"
              placeholder="Search products..."
              value={internalTerm}
              onChange={handleChange}
            />

            {internalTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={handleClear}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}

            <button type="submit" className="modern-search-btn">
              Search
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}

export default ProductSearch

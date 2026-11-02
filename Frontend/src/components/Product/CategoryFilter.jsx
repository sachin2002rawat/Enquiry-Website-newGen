import React from 'react'
import { FiCheck } from 'react-icons/fi'

/**
 * CategoryFilter Component
 * Displays product categories with real-time counts from ProductsData.json
 * and toggle switches to filter products dynamically.
 */
const CategoryFilter = ({ categories = [], onToggleCategory, onClearFilters }) => {
  return (
    <div className="new-category-filter-card">
      
      {/* Top Dark Header Bar */}
      <div className="filter-header-bar">
        <h3 className="filter-header-title">Categories</h3>
      </div>

      {/* Card Body */}
      <div className="filter-card-body">
        
        {/* Sub-heading */}
        <h4 className="filter-subheading">Product Categories</h4>

        {/* Categories List */}
        <div className="filter-items-list">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="filter-item-row"
              onClick={() => onToggleCategory && onToggleCategory(cat.id)}
            >
              {/* Left Side: Toggle Switch & Category Name */}
              <div className="filter-item-left">
                {/* Custom Pill Toggle Switch */}
                <div className={`switch-track ${cat.checked ? 'on' : 'off'}`}>
                  {cat.checked && <FiCheck className="switch-check-icon" />}
                  <span className="switch-knob" />
                </div>

                {/* Category Name */}
                <span className={`filter-cat-name ${cat.checked ? 'active' : ''}`}>
                  {cat.name}
                </span>
              </div>

              {/* Right Side: Gold Count Badge [x] */}
              <span className="filter-gold-badge">
                [{cat.count}]
              </span>
            </div>
          ))}
        </div>

        {/* Bottom Right: Clear Filters */}
        <div className="filter-clear-wrapper">
          <button 
            type="button" 
            className="filter-clear-btn"
            onClick={() => onClearFilters && onClearFilters()}
          >
            Clear Filters
          </button>
        </div>

      </div>

    </div>
  )
}

export default CategoryFilter

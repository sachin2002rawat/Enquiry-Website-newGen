import React from 'react'
import { RxDashboard } from 'react-icons/rx'
import { FiList, FiChevronDown } from 'react-icons/fi'

/**
 * ProductToolbar Component
 * Displays dynamic product count range, sorting dropdown, and Grid/List view toggle buttons.
 */
const ProductToolbar = ({ 
  startIndex = 1, 
  endIndex = 4, 
  totalProducts = 4, 
  sortBy = 'Default Sorting', 
  onSortChange, 
  viewMode = 'grid', 
  onViewChange 
}) => {
  const handleViewChange = (mode) => {
    if (onViewChange) onViewChange(mode)
  }

  const handleSortChange = (e) => {
    if (onSortChange) onSortChange(e.target.value)
  }

  return (
    <div className="product-toolbar-card">
      {/* Top Accent Line */}
      <div className="toolbar-top-line" />

      <div className="toolbar-content">
        {/* Left: Product count display */}
        <div className="toolbar-count">
          Showing <strong>{startIndex}–{endIndex}</strong> of <strong>{totalProducts}</strong> products
        </div>

        {/* Right: Sorting & View toggle buttons */}
        <div className="toolbar-actions">
          {/* Sorting Dropdown */}
          <div className="toolbar-select-wrapper">
            <select
              className="toolbar-select"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="Default Sorting">Default Sorting</option>
              <option value="Name: A to Z">Name: A to Z</option>
              <option value="Name: Z to A">Name: Z to A</option>
              <option value="Category">Category</option>
              <option value="Latest">Latest</option>
            </select>
            <FiChevronDown className="select-arrow-icon" />
          </div>

          {/* Grid/List View Buttons */}
          <div className="view-toggle-group">
            <button
              type="button"
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => handleViewChange('grid')}
              aria-label="Grid View"
            >
              <RxDashboard size={16} />
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => handleViewChange('list')}
              aria-label="List View"
            >
              <FiList size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductToolbar

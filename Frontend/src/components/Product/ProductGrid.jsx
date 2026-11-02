import React from 'react'
import ProductCard from './ProductCard'

/**
 * ProductGrid Component
 * Renders product cards + fully workable Pagination bar.
 */
const ProductGrid = ({ 
  products = [], 
  viewMode = 'grid', 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange 
}) => {
  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      if (onPageChange) onPageChange(page)
    }
  }

  // Generate page numbers array for pagination bar
  const renderPageNumbers = () => {
    const pages = []
    
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          type="button"
          className={`page-num-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageClick(i)}
        >
          {i}
        </button>
      )
    }

    return pages
  }

  return (
    <div className="product-grid-section">
      {/* Cards Grid / List Container */}
      {products.length > 0 ? (
        <div className={`product-cards-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
          {products.map((product) => (
            <ProductCard key={product._id || product.id || product.slug || product.name} product={product} />
          ))}
        </div>
      ) : (
        <div className="no-products-found">
          <h3>No products found</h3>
          <p>Try searching for a different keyword or adjusting your category filters.</p>
        </div>
      )}

      {/* Pagination Controls Bar */}
      {totalPages > 1 && (
        <div className="product-pagination-bar">
          {/* First Page Button */}
          <button
            type="button"
            className="page-nav-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageClick(1)}
            aria-label="First page"
          >
            &lt;&lt;
          </button>

          {/* Previous Page Button */}
          <button
            type="button"
            className="page-nav-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageClick(currentPage - 1)}
            aria-label="Previous page"
          >
            &lt;
          </button>

          {/* Page Numbers */}
          {renderPageNumbers()}

          {/* Next Page Button */}
          <button
            type="button"
            className="page-nav-btn"
            disabled={currentPage === totalPages}
            onClick={() => handlePageClick(currentPage + 1)}
            aria-label="Next page"
          >
            &gt;
          </button>

          {/* Last Page Button */}
          <button
            type="button"
            className="page-nav-btn"
            disabled={currentPage === totalPages}
            onClick={() => handlePageClick(totalPages)}
            aria-label="Last page"
          >
            &gt;&gt;
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductGrid

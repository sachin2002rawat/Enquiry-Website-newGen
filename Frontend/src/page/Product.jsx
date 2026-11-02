import React, { useState, useMemo } from "react";
import ProductNavbar from "../components/ProductNavbar";
import ProductBelowNavbar from "../components/Product/ProductBelowNavbar";
import ProductSearch from "../components/Product/ProductSearch";
import CategoryFilter from "../components/Product/CategoryFilter";
import ProductToolbar from "../components/Product/ProductToolbar";
import ProductGrid from "../components/Product/ProductGrid";
import WhatsAppButton from "../components/Product/WhatsAppButton";
import productsData from "../ProductsData.json";
import Footer from "../components/Footer";
import useLiveProducts from "../hooks/useLiveProducts";
import useLiveCategories from "../hooks/useLiveCategories";
import { getCategoryName, getCategoryId } from "../utils/categoryHelper";

/**
 * Product Page Component
 * Connects ProductSearch, CategoryFilter, ProductToolbar, and ProductGrid 
 * using real dynamic data synchronized with Admin Panel and MongoDB.
 */
const Product = () => {
  const [liveProducts] = useLiveProducts();
  const [liveCategories] = useLiveCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategories, setActiveCategories] = useState(['all_products']);
  const [sortBy, setSortBy] = useState('Default Sorting');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12; // 12 cards shown per page (4 rows of 3 grid cards)

  // Dynamically derive categories directly from MongoDB liveCategories
  const categoriesConfig = useMemo(() => {
    const list = [{ id: 'all_products', name: 'All Products', key: 'ALL' }];
    const seenKeys = new Set(['ALL']);

    // 1. Primary: All active categories from MongoDB
    if (Array.isArray(liveCategories) && liveCategories.length > 0) {
      liveCategories.forEach((cat) => {
        if (!cat || cat.isActive === false) return;
        const name = (cat.name || '').trim();
        const key = name.toUpperCase();
        if (key && !seenKeys.has(key)) {
          seenKeys.add(key);
          list.push({
            id: cat._id || cat.id || key.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
            _id: cat._id,
            name: name,
            key: key
          });
        }
      });
    }

    // 2. Fallback: Also include any categories present on live products not yet listed
    if (Array.isArray(liveProducts)) {
      liveProducts.forEach((p) => {
        const catName = (getCategoryName(p.category) || '').trim();
        const key = catName.toUpperCase();
        if (key && !seenKeys.has(key)) {
          seenKeys.add(key);
          list.push({
            id: key.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
            name: catName,
            key: key
          });
        }
      });
    }

    return list;
  }, [liveCategories, liveProducts]);

  // 1. Calculate dynamic category counts directly from liveProducts
  const categoriesWithCounts = useMemo(() => {
    return categoriesConfig.map((cat) => {
      let count = 0;
      if (cat.id === 'all_products') {
        count = liveProducts.length;
      } else {
        count = liveProducts.filter((item) => {
          const itemCatName = getCategoryName(item.category).toUpperCase().trim();
          const itemCatId = String(getCategoryId(item.category) || '');
          const catId = String(cat._id || cat.id || '');
          return itemCatName === cat.key || (catId && itemCatId === catId);
        }).length;
      }
      return {
        ...cat,
        count,
        checked: activeCategories.includes(cat.id),
      };
    });
  }, [categoriesConfig, liveProducts, activeCategories]);

  // 2. Filter & Sort products based on search term, active categories, and sort choice
  const filteredProducts = useMemo(() => {
    let result = [...liveProducts];

    // Filter by Category
    const isAllSelected = activeCategories.includes('all_products') || activeCategories.length === 0;
    if (!isAllSelected) {
      const selectedCats = categoriesConfig.filter((cat) => activeCategories.includes(cat.id));
      const selectedKeys = selectedCats.map((cat) => cat.key);
      const selectedIds = selectedCats.map((cat) => String(cat._id || cat.id || '')).filter(Boolean);

      result = result.filter((item) => {
        const itemCatName = getCategoryName(item.category).toUpperCase().trim();
        const itemCatId = String(getCategoryId(item.category) || '');
        return selectedKeys.includes(itemCatName) || (itemCatId && selectedIds.includes(itemCatId));
      });
    }

    // Filter by Search Query
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter((item) =>
        (item.name || '').toLowerCase().includes(query) ||
        (item.description || '').toLowerCase().includes(query) ||
        getCategoryName(item.category).toLowerCase().includes(query)
      );
    }

    // Apply Sorting
    if (sortBy === 'Name: A to Z') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'Name: Z to A') {
      result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    } else if (sortBy === 'Category') {
      result.sort((a, b) => getCategoryName(a.category).localeCompare(getCategoryName(b.category)));
    } else if (sortBy === 'Latest') {
      result.sort((a, b) => {
        const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
        const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
        if (timeB !== timeA) return timeB - timeA;
        return (b.id || 0) - (a.id || 0);
      });
    }

    return result;
  }, [liveProducts, categoriesConfig, searchTerm, activeCategories, sortBy]);

  // 3. Pagination calculation
  const totalProductsCount = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProductsCount / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = totalProductsCount === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(safeCurrentPage * ITEMS_PER_PAGE, totalProductsCount);

  const currentProductsPage = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, safeCurrentPage]);

  // Handlers
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // reset to page 1 on search
  };

  const handleToggleCategory = (catId) => {
    setCurrentPage(1); // reset to page 1 on filter change
    if (catId === 'all_products') {
      setActiveCategories(['all_products']);
    } else {
      setActiveCategories((prev) => {
        let updated;
        if (prev.includes(catId)) {
          updated = prev.filter((id) => id !== catId && id !== 'all_products');
        } else {
          updated = [...prev.filter((id) => id !== 'all_products'), catId];
        }

        if (updated.length === 0) {
          return ['all_products'];
        }
        return updated;
      });
    }
  };

  const handleClearFilters = () => {
    setActiveCategories(['all_products']);
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="product-page-wrapper">
      {/* 1. Top Navbar */}
      <ProductNavbar />

      {/* 2. Banner section directly below Navbar */}
      <ProductBelowNavbar />

      {/* 3. Main Product Collection Content Layout */}
      <main className="product-main-container">
        <div className="product-layout-grid">
          
          {/* Left Sidebar */}
          <aside className="product-sidebar">
            <ProductSearch 
              searchTerm={searchTerm} 
              onSearch={handleSearchChange} 
            />
            <CategoryFilter 
              categories={categoriesWithCounts} 
              onToggleCategory={handleToggleCategory} 
              onClearFilters={handleClearFilters} 
            />
          </aside>

          {/* Right Content Area */}
          <section className="product-content-area">
            <ProductToolbar 
              startIndex={startIndex}
              endIndex={endIndex}
              totalProducts={totalProductsCount}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewChange={setViewMode}
            />
            <ProductGrid 
              products={currentProductsPage}
              viewMode={viewMode}
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </section>

        </div>
      </main>

      <Footer/>
    </div>
  );
};

export default Product;

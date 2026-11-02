import React, { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  FiTag,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiX,
  FiCheck,
  FiArrowRight,
  FiLayers,
  FiImage,
  FiList,
  FiGrid,
  FiChevronLeft,
  FiChevronRight,
  FiEye
} from 'react-icons/fi'
import { broadcastProductUpdate } from '../../hooks/useLiveProducts'
import useLiveCategories, { broadcastCategoryUpdate, getStoredCategories } from '../../hooks/useLiveCategories'
import { apiService } from '../../api/apiService'
import { getCategoryName, getCategoryId, getCategorySlug } from '../../utils/categoryHelper'

const CategoryManagement = ({ products = [], setProducts, setActiveTab, showToast, onViewCategoryProducts }) => {
  const [liveCategories, setLiveCategories, refreshCategories] = useLiveCategories()
  const [viewMode, setViewMode] = useState('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: ''
  })
  const [selectedFileName, setSelectedFileName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteCatName, setDeleteCatName] = useState(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Extract categories from MongoDB liveCategories merged with products
  const categoryStats = useMemo(() => {
    const map = new Map()

    // 1. Populate with all categories from MongoDB
    if (Array.isArray(liveCategories)) {
      liveCategories.forEach((cat) => {
        const catName = (cat.name || '').trim().toUpperCase()
        if (catName) {
          map.set(catName, {
            _id: cat._id,
            name: catName,
            slug: cat.slug || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            count: typeof cat.productCount === 'number' ? cat.productCount : 0,
            sampleImage: cat.image || '/garam_masala.png',
            description: cat.description || `Premium selection of ${catName.toLowerCase()} products crafted for authentic taste and quality.`
          })
        }
      })
    }

    // Tally actual matching products for each category
    const list = Array.from(map.values())
    list.forEach((cat) => {
      const directCount = (Array.isArray(products) ? products : []).filter((p) => {
        const pCatId = getCategoryId(p.category)
        const pCatName = getCategoryName(p.category).trim().toUpperCase()
        return (cat._id && pCatId && String(cat._id) === String(pCatId)) || (pCatName && pCatName === cat.name)
      }).length
      cat.count = directCount
    })

    return list
  }, [liveCategories, products])

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return categoryStats
    return categoryStats.filter((c) =>
      c.name.toLowerCase().includes(term) || c.description.toLowerCase().includes(term)
    )
  }, [categoryStats, searchTerm])

  // Pagination (10 items per page as requested)
  const ITEMS_PER_PAGE = 10
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredCategories.length)
  const paginatedCategories = useMemo(() => {
    return filteredCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredCategories, startIndex])

  // Top category with most items
  const topCategory = useMemo(() => {
    if (categoryStats.length === 0) return 'N/A'
    return [...categoryStats].sort((a, b) => b.count - a.count)[0].name
  }, [categoryStats])

  // KPI Detail Modal State & 5-items per page Pagination
  const [activeKpiModal, setActiveKpiModal] = useState(null) // 'categories' | 'products' | 'topCategory'
  const [kpiModalSearch, setKpiModalSearch] = useState('')
  const KPI_ITEMS_PER_PAGE = 5
  const [kpiCurrentPage, setKpiCurrentPage] = useState(1)

  useEffect(() => {
    setKpiCurrentPage(1)
  }, [activeKpiModal, kpiModalSearch])

  // Filtered items inside KPI Modal
  // 1. When activeKpiModal === 'categories'
  const kpiModalCategories = useMemo(() => {
    if (activeKpiModal !== 'categories') return []
    let list = categoryStats
    if (kpiModalSearch.trim()) {
      const q = kpiModalSearch.trim().toLowerCase()
      list = list.filter((c) =>
        c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [categoryStats, activeKpiModal, kpiModalSearch])

  // 2. When activeKpiModal === 'products' or 'topCategory'
  const kpiModalProducts = useMemo(() => {
    if (activeKpiModal !== 'products' && activeKpiModal !== 'topCategory') return []
    let list = products
    if (activeKpiModal === 'topCategory') {
      list = products.filter(
        (p) => getCategoryName(p.category).trim().toUpperCase() === topCategory.trim().toUpperCase()
      )
    }
    if (kpiModalSearch.trim()) {
      const q = kpiModalSearch.trim().toLowerCase()
      list = list.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q) ||
          getCategoryName(p.category).toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [products, activeKpiModal, topCategory, kpiModalSearch])

  // Pagination calculation based on active modal type
  const activeKpiTotalItems =
    activeKpiModal === 'categories' ? kpiModalCategories.length : kpiModalProducts.length
  const totalKpiPages = Math.max(1, Math.ceil(activeKpiTotalItems / KPI_ITEMS_PER_PAGE))
  const kpiStartIndex = (kpiCurrentPage - 1) * KPI_ITEMS_PER_PAGE
  const kpiEndIndex = Math.min(kpiStartIndex + KPI_ITEMS_PER_PAGE, activeKpiTotalItems)

  const paginatedKpiCategories = useMemo(() => {
    return kpiModalCategories.slice(kpiStartIndex, kpiStartIndex + KPI_ITEMS_PER_PAGE)
  }, [kpiModalCategories, kpiStartIndex])

  const paginatedKpiProducts = useMemo(() => {
    return kpiModalProducts.slice(kpiStartIndex, kpiStartIndex + KPI_ITEMS_PER_PAGE)
  }, [kpiModalProducts, kpiStartIndex])

  const handleOpenAddModal = () => {
    setEditingCategory(null)
    setSelectedFileName('')
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      image: '/garam_masala.png'
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat)
    setSelectedFileName(cat.sampleImage ? 'Current category image' : '')
    setCategoryForm({
      name: cat.name,
      slug: cat.slug || '',
      description: cat.description || '',
      image: cat.sampleImage || cat.image || '/garam_masala.png'
    })
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()

    let cleanName = (categoryForm.name || '').trim().toUpperCase()
    let customSlug = (categoryForm.slug || '').trim()

    // Smart fallback if user uploaded an image without typing category name
    if (!cleanName && selectedFileName) {
      cleanName = selectedFileName
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .trim()
        .toUpperCase()
    }
    if (!cleanName && customSlug) {
      cleanName = customSlug.toUpperCase()
    }
    if (!cleanName) {
      cleanName = `CATEGORY ${Date.now().toString().slice(-4)}`
    }

    const cleanSlug = customSlug
      ? customSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      : cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    try {
      if (editingCategory) {
        const catId = editingCategory._id || editingCategory.id
        const oldName = (editingCategory.name || '').trim().toUpperCase()
        const catIdentifier = catId || editingCategory.slug || oldName

        const updatePayload = {
          name: cleanName,
          slug: cleanSlug,
          description: categoryForm.description || '',
          image: categoryForm.image || '/garam_masala.png'
        }

        const res = await apiService.updateCategory(catIdentifier, updatePayload)
        if (res && res.success && res.data) {
          const updatedCatData = res.data
          const currentList = Array.isArray(liveCategories) && liveCategories.length > 0 ? liveCategories : getStoredCategories()
          const nextCategories = currentList.map((c) => {
            const isMatch = (catId && (c._id === catId || c.id === catId)) ||
                            ((c.name || '').trim().toUpperCase() === oldName)
            return isMatch ? { ...c, ...updatedCatData } : c
          })

          setLiveCategories(nextCategories)
          broadcastCategoryUpdate(nextCategories)

          // Rename category across all products in frontend state if name changed
          if (cleanName !== oldName && setProducts) {
            const updatedProducts = (Array.isArray(products) ? products : []).map((p) => {
              const pName = getCategoryName(p.category).trim().toUpperCase()
              const pId = getCategoryId(p.category)
              const isMatch = (catId && pId && String(catId) === String(pId)) || pName === oldName
              if (isMatch) {
                if (typeof p.category === 'object' && p.category !== null) {
                  return { ...p, category: { ...p.category, name: cleanName, image: updatePayload.image } }
                }
                return { ...p, category: cleanName }
              }
              return p
            })
            setProducts(updatedProducts)
            broadcastProductUpdate(updatedProducts)
          }

          showToast(`Category "${cleanName}" updated successfully!`, 'success')
          if (refreshCategories) refreshCategories()
          setIsModalOpen(false)
        } else {
          showToast(res?.message || 'Failed to update category', 'error')
        }
      } else {
        const newPayload = {
          name: cleanName,
          slug: cleanSlug,
          description: categoryForm.description || `Premium selection of ${cleanName.toLowerCase()} products crafted for authentic taste and quality.`,
          image: categoryForm.image || '/garam_masala.png',
          order: 0
        }

        const res = await apiService.createCategory(newPayload)
        if (res && res.success && res.data) {
          const createdCat = res.data
          const currentList = Array.isArray(liveCategories) && liveCategories.length > 0 ? liveCategories : getStoredCategories()
          const nextCategories = [
            createdCat,
            ...currentList.filter(
              (c) => (c._id && c._id !== createdCat._id) && (c.name || '').toUpperCase() !== cleanName
            )
          ]
          setLiveCategories(nextCategories)
          broadcastCategoryUpdate(nextCategories)

          showToast(`Category "${cleanName}" created successfully!`, 'success')
          if (refreshCategories) refreshCategories()
          setIsModalOpen(false)
        } else {
          showToast(res?.message || 'Failed to create category', 'error')
        }
      }
    } catch (err) {
      console.warn('[CategoryManagement Form Submit]:', err)
      showToast(`Category could not be saved: ${err.message || 'Error'}`, 'error')
    }
  }

  const handleDeleteCategory = async (target) => {
    if (!target) return
    const targetId = typeof target === 'object' ? (target._id || target.id) : (typeof target === 'string' && target.match(/^[0-9a-fA-F]{24}$/) ? target : null)
    const targetName = (typeof target === 'object' ? (target.name || '') : String(target || '')).trim().toUpperCase()
    const targetSlug = typeof target === 'object' ? target.slug : null

    // 1. Immediately close ALL delete modal states
    setDeleteTarget(null)
    setDeleteCatName(null)

    // 2. Immediately remove from liveCategories and broadcast across app
    const currentList = Array.isArray(liveCategories) && liveCategories.length > 0 ? liveCategories : getStoredCategories()
    const nextCategories = currentList.filter((c) => {
      const cId = c._id || c.id
      const cName = (c.name || '').trim().toUpperCase()
      const cSlug = (c.slug || '').toLowerCase()
      if (targetId && cId && String(cId).toLowerCase() === String(targetId).toLowerCase()) return false
      if (targetName && cName === targetName) return false
      if (targetSlug && cSlug === targetSlug.toLowerCase()) return false
      return true
    })
    setLiveCategories(nextCategories)
    broadcastCategoryUpdate(nextCategories)

    // 3. Reassign products in this category to fallback category
    const fallbackCat = Array.isArray(nextCategories)
      ? nextCategories.find((c) => c.name.toUpperCase() === 'PURE SPICES') || nextCategories[0]
      : null

    const updatedProducts = (Array.isArray(products) ? products : []).map((p) => {
      const pName = getCategoryName(p.category).trim().toUpperCase()
      const pId = getCategoryId(p.category)
      const isMatch =
        (targetId && pId && String(targetId).toLowerCase() === String(pId).toLowerCase()) ||
        pName === targetName ||
        (p.category && String(p.category).toUpperCase() === targetName)
      if (isMatch) {
        return {
          ...p,
          category: fallbackCat ? { _id: fallbackCat._id, name: fallbackCat.name, slug: fallbackCat.slug } : 'PURE SPICES'
        }
      }
      return p
    })
    setProducts(updatedProducts)
    broadcastProductUpdate(updatedProducts)

    showToast(`Category "${targetName || 'Item'}" deleted permanently!`, 'success')

    // 4. Delete from MongoDB in backend
    try {
      const catIdentifier = targetId || targetSlug || targetName
      await apiService.deleteCategory(catIdentifier)
      if (targetName && targetName !== catIdentifier) {
        await apiService.deleteCategory(targetName)
      }
      if (refreshCategories) await refreshCategories()
    } catch (err) {
      console.warn('[CategoryManagement Delete Backend Error]:', err)
    }
  }

  const handleViewProductsOfCategory = (catName) => {
    if (onViewCategoryProducts) {
      onViewCategoryProducts(catName)
    } else if (setActiveTab) {
      setActiveTab('product')
    }
  }

  return (
    <div className="category-management-container">
      {/* 1. TOP STATS BAR */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div
          className="kpi-card clickable"
          onClick={() => {
            setKpiModalSearch('')
            setActiveKpiModal('categories')
          }}
          title="Click to view total categories breakdown"
          style={{ borderLeft: '4px solid #0D9488', cursor: 'pointer', position: 'relative' }}
        >
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#CCFBF1', color: '#0D9488' }}>
            <FiTag size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Total Categories</span>
            <span className="kpi-value">{categoryStats.length}</span>
            <span className="kpi-meta" style={{ color: '#0D9488' }}>Active store departments</span>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#0D9488',
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: '#CCFBF1',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
          >
            <FiEye size={13} />
            <span>View</span>
          </div>
        </div>

        <div
          className="kpi-card clickable"
          onClick={() => {
            setKpiModalSearch('')
            setActiveKpiModal('products')
          }}
          title="Click to view all catalog products list"
          style={{ borderLeft: '4px solid #4F46E5', cursor: 'pointer', position: 'relative' }}
        >
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
            <FiPackage size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Catalog Products</span>
            <span className="kpi-value">{products.length}</span>
            <span className="kpi-meta" style={{ color: '#4F46E5' }}>Items organized in categories</span>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#4F46E5',
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: '#EEF2FF',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
          >
            <FiEye size={13} />
            <span>View</span>
          </div>
        </div>

        <div
          className="kpi-card clickable"
          onClick={() => {
            setKpiModalSearch('')
            setActiveKpiModal('topCategory')
          }}
          title={`Click to view products in top category (${topCategory})`}
          style={{ borderLeft: '4px solid #F59E0B', cursor: 'pointer', position: 'relative' }}
        >
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <FiLayers size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Top Category</span>
            <span className="kpi-value" style={{ fontSize: '1.25rem', textTransform: 'capitalize' }}>
              {topCategory}
            </span>
            <span className="kpi-meta" style={{ color: '#D97706' }}>Highest product count</span>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#D97706',
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: '#FEF3C7',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
          >
            <FiEye size={13} />
            <span>View</span>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS HEADER */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: '14px' }}>
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ backgroundColor: '#CCFBF1', color: '#0D9488' }}>
              <FiTag className="card-title-icon" size={20} />
            </div>
            <div>
              <div className="card-title-row">
                <h2 className="card-title">Category Management</h2>
                <span className="live-count-badge" style={{ backgroundColor: '#CCFBF1', color: '#0D9488' }}>
                  {filteredCategories.length} Categories
                </span>
              </div>
              <p className="card-subtitle">
                Organize store products into logical categories for catalog browsing and storefront filters.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '240px' }}>
              <FiSearch
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* View Mode Toggle: List (Default) or Grid */}
            <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                title="List View"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'list' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'list' ? '#0F172A' : '#64748B',
                  boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <FiList size={14} /> List View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Grid Cards View"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'grid' ? '#0F172A' : '#64748B',
                  boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <FiGrid size={14} /> Grid
              </button>
            </div>

            <button
              type="button"
              className="btn-primary"
              style={{ backgroundColor: '#0D9488', borderColor: '#0D9488', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={handleOpenAddModal}
            >
              <FiPlus size={16} /> Add New Category
            </button>
          </div>
        </div>

        {/* 3. CATEGORIES DISPLAY (LIST VIEW AS DEFAULT) */}
        {viewMode === 'list' ? (
          <div style={{ border: '1px solid var(--admin-card-border)', borderRadius: '12px', background: '#FFFFFF', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--admin-card-border)', fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '12px 18px', width: '220px' }}>Category</th>
                    <th style={{ padding: '12px 18px' }}>Description</th>
                    <th style={{ padding: '12px 18px', width: '140px', textAlign: 'center' }}>Products</th>
                    <th style={{ padding: '12px 18px', width: '140px', textAlign: 'center' }}>Browse</th>
                    <th style={{ padding: '12px 18px', width: '110px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.map((cat) => (
                    <tr
                      key={cat.name}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Category Thumbnail & Name */}
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={cat.sampleImage}
                            alt={cat.name}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '1px solid #E2E8F0',
                              backgroundColor: '#F8FAFC',
                              flexShrink: 0
                            }}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = '/garam_masala.png'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--admin-text-main)', fontSize: '0.92rem', letterSpacing: '-0.01em' }}>
                              {cat.name}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'lowercase' }}>
                              #{cat.name.toLowerCase().replace(/\s+/g, '-')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.45, maxWidth: '420px' }}>
                          {cat.description}
                        </div>
                      </td>

                      {/* Product Count Badge */}
                      <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                        <span
                          onClick={() => handleViewProductsOfCategory(cat.name)}
                          title={`Click to view all ${cat.count} products in ${cat.name}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '12px',
                            backgroundColor: '#CCFBF1',
                            color: '#0D9488',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <FiPackage size={12} /> {cat.count} {cat.count === 1 ? 'Product' : 'Products'}
                        </span>
                      </td>

                      {/* View Products */}
                      <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleViewProductsOfCategory(cat.name)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0D9488',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            borderRadius: '6px'
                          }}
                        >
                          View Products <FiArrowRight size={13} />
                        </button>
                      </td>

                      {/* Edit & Delete Action Buttons */}
                      <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => handleOpenEditModal(cat)}
                            title="Edit Category"
                            style={{ width: '28px', height: '28px', color: '#0D9488', padding: 0 }}
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => {
                              setDeleteTarget(cat)
                              setDeleteCatName(cat.name)
                            }}
                            title="Delete Category"
                            style={{ width: '28px', height: '28px', color: '#EF4444', padding: 0 }}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* GRID VIEW */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '18px',
              marginTop: '10px'
            }}
          >
            {paginatedCategories.map((cat) => (
              <div
                key={cat.name}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid var(--admin-card-border)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                    <img
                      src={cat.sampleImage}
                      alt={cat.name}
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#F8FAFC'
                      }}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = '/garam_masala.png'
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-text-main)', margin: 0 }}>
                          {cat.name}
                        </h3>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#CCFBF1',
                            color: '#0D9488'
                          }}
                        >
                          {cat.count} {cat.count === 1 ? 'Product' : 'Products'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.45, margin: '0 0 16px 0' }}>
                    {cat.description}
                  </p>
                </div>

                {/* Actions Bottom Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid #F1F5F9'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleViewProductsOfCategory(cat.name)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0D9488',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    View Products <FiArrowRight size={14} />
                  </button>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => handleOpenEditModal(cat)}
                      title="Edit Category"
                      style={{ color: '#0D9488' }}
                    >
                      <FiEdit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => {
                        setDeleteTarget(cat)
                        setDeleteCatName(cat.name)
                      }}
                      title="Delete Category"
                      style={{ color: '#EF4444' }}
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category List & Grid Pagination Bar (10 items per page) */}
        {filteredCategories.length > 0 && (
          <div className="admin-pagination-bar" style={{ marginTop: '20px' }}>
            <div className="pagination-info">
              Showing <span style={{ color: 'var(--admin-text-main)', fontWeight: 700 }}>{filteredCategories.length > 0 ? startIndex + 1 : 0}</span> to{' '}
              <span style={{ color: 'var(--admin-text-main)', fontWeight: 700 }}>{endIndex}</span> of{' '}
              <span style={{ color: 'var(--admin-text-main)', fontWeight: 700 }}>{filteredCategories.length}</span> categories
            </div>

            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  title="Previous Page"
                >
                  <FiChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  title="Next Page"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {filteredCategories.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
            <FiTag size={36} color="#CBD5E1" style={{ marginBottom: '12px' }} />
            <h4 style={{ margin: '0 0 4px 0', color: 'var(--admin-text-main)' }}>No categories found</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>Try adjusting your search query or add a new category.</p>
          </div>
        )}
      </div>

      {/* ADD / EDIT CATEGORY MODAL */}
      {isModalOpen &&
        createPortal(
          <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={() => setIsModalOpen(false)}>
            <div
              className="modal-content"
              style={{
                maxWidth: '520px',
                width: '92%',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.45)',
                border: '1px solid var(--admin-card-border)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="modal-header"
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#FAF6F0',
                  borderBottom: '1px solid var(--admin-card-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#CCFBF1',
                      color: '#0D9488',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <FiTag size={16} />
                  </div>
                  <h3 className="modal-title" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-text-main)', margin: 0 }}>
                    {editingCategory ? `Edit Category: ${editingCategory.name || editingCategory}` : 'Add New Category'}
                  </h3>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} style={{ margin: 0, backgroundColor: '#FFFFFF' }}>
                <div
                  className="modal-body"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    backgroundColor: '#FFFFFF',
                    maxHeight: 'calc(85vh - 120px)',
                    overflowY: 'auto'
                  }}
                >
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--admin-text-main)' }}>
                        Category Name <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={categoryForm.name}
                        onChange={(e) => {
                          const val = e.target.value
                          setCategoryForm((prev) => ({
                            ...prev,
                            name: val,
                            slug: (!prev.slug || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
                              ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                              : prev.slug
                          }))
                        }}
                        placeholder="e.g. EDIBLE OILS, MIX MASALA"
                        style={{ fontSize: '0.9rem', padding: '8px 12px' }}
                      />
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--admin-text-main)' }}>
                        Category Slug (URL Identifier)
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={categoryForm.slug}
                        onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                        placeholder="e.g. edible-oils (auto-generated from name)"
                        style={{ fontSize: '0.9rem', padding: '8px 12px' }}
                      />
                    </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--admin-text-main)' }}>
                      Description
                    </label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      placeholder="Brief summary of items in this department..."
                      style={{ fontSize: '0.88rem', padding: '8px 12px', resize: 'vertical' }}
                    />
                  </div>

                  {/* Representative Image with Live Preview & File Picker */}
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--admin-text-main)' }}>
                      Category Representative Image
                    </label>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img
                        src={categoryForm.image || '/garam_masala.png'}
                        alt="Preview"
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '10px',
                          objectFit: 'cover',
                          border: '2px solid #E2E8F0',
                          backgroundColor: '#F8FAFC',
                          flexShrink: 0
                        }}
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = '/garam_masala.png'
                        }}
                      />

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <label
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              backgroundColor: '#EEF2FF',
                              color: '#4F46E5',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: '1px solid #C7D2FE',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <FiImage size={14} /> Choose Image or File
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setSelectedFileName(file.name)
                                  // Instant zero-delay preview for user
                                  const reader = new FileReader()
                                  reader.onload = (event) => {
                                    setCategoryForm((prev) => ({ ...prev, image: event.target?.result || '' }))
                                  }
                                  reader.readAsDataURL(file)

                                  // Background optional upload to Cloudinary/server
                                  apiService.uploadImage(file).then((uploadRes) => {
                                    if (uploadRes && (uploadRes.secure_url || uploadRes.url)) {
                                      setCategoryForm((prev) => ({ ...prev, image: uploadRes.secure_url || uploadRes.url }))
                                    }
                                  }).catch((err) => {
                                    console.warn('Background upload note:', err)
                                  })
                                }
                              }}
                            />
                          </label>

                          <span style={{ fontSize: '0.78rem', color: '#64748B', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selectedFileName || (categoryForm.image ? 'Image selected' : 'No file chosen')}
                          </span>

                          {categoryForm.image && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFileName('')
                                setCategoryForm({ ...categoryForm, image: '/garam_masala.png' })
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#EF4444',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                padding: '4px 6px'
                              }}
                            >
                              Reset
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          className="form-input"
                          value={categoryForm.image}
                          onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                          placeholder="Or paste image URL (https://...)"
                          style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="modal-footer"
                  style={{
                    padding: '14px 20px',
                    backgroundColor: '#FAF6F0',
                    borderTop: '1px solid var(--admin-card-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '10px'
                  }}
                >
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsModalOpen(false)}
                    style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleFormSubmit}
                    className="btn-primary"
                    style={{
                      backgroundColor: 'var(--admin-primary, #4F46E5)',
                      borderColor: 'var(--admin-primary, #4F46E5)',
                      color: '#FFFFFF',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      padding: '8px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FiCheck size={16} /> {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* KPI DETAIL POPUP MODAL WITH 5 ITEMS PER PAGE PAGINATION */}
      {activeKpiModal &&
        createPortal(
          <div
            className="modal-overlay"
            style={{
              zIndex: 10000,
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(4px)',
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
            onClick={() => setActiveKpiModal(null)}
          >
            <div
              className="modal-content"
              style={{
                maxWidth: '680px',
                width: '100%',
                maxHeight: '88vh',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--admin-card-border)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL HEADER */}
              <div
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#FAF6F0',
                  borderBottom: '1px solid var(--admin-card-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      fontSize: '1.2rem',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor:
                        activeKpiModal === 'categories'
                          ? '#CCFBF1'
                          : activeKpiModal === 'products'
                          ? '#EEF2FF'
                          : '#FEF3C7',
                      color:
                        activeKpiModal === 'categories'
                          ? '#0D9488'
                          : activeKpiModal === 'products'
                          ? '#4F46E5'
                          : '#D97706'
                    }}
                  >
                    {activeKpiModal === 'categories' && <FiTag />}
                    {activeKpiModal === 'products' && <FiPackage />}
                    {activeKpiModal === 'topCategory' && <FiLayers />}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--admin-text-main)' }}>
                      {activeKpiModal === 'categories' && `Total Categories (${categoryStats.length})`}
                      {activeKpiModal === 'products' && `Catalog Products (${products.length})`}
                      {activeKpiModal === 'topCategory' && `Top Category: ${topCategory} (${kpiModalProducts.length} items)`}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                      {activeKpiModal === 'categories' && 'Breakdown of active store departments, catalog groupings, and product counts.'}
                      {activeKpiModal === 'products' && 'Comprehensive overview of all products organized across catalog departments.'}
                      {activeKpiModal === 'topCategory' && `Products assigned to "${topCategory}", the category with highest catalog inventory.`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--admin-card-border)',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--admin-text-muted)'
                  }}
                  onClick={() => setActiveKpiModal(null)}
                >
                  <FiX size={16} />
                </button>
              </div>

              {/* SEARCH BAR */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #F1F5F9', backgroundColor: '#FFFFFF' }}>
                <div style={{ position: 'relative' }}>
                  <FiSearch
                    size={15}
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
                  />
                  <input
                    type="text"
                    placeholder={
                      activeKpiModal === 'categories'
                        ? 'Search categories by name or description...'
                        : 'Search products by name, SKU or category...'
                    }
                    value={kpiModalSearch}
                    onChange={(e) => setKpiModalSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      borderRadius: '8px',
                      border: '1px solid var(--admin-card-border)',
                      fontSize: '0.84rem',
                      outline: 'none',
                      backgroundColor: '#FAF6F0'
                    }}
                  />
                </div>
              </div>

              {/* MODAL BODY LIST */}
              <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, maxHeight: '55vh' }}>
                {activeKpiModal === 'categories' ? (
                  paginatedKpiCategories.length > 0 ? (
                    paginatedKpiCategories.map((cat) => (
                      <div
                        key={cat.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--admin-card-border)',
                          backgroundColor: '#FFFFFF',
                          marginBottom: '10px',
                          gap: '12px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <img
                            src={cat.sampleImage || '/garam_masala.png'}
                            alt={cat.name}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '1px solid #E2E8F0',
                              flexShrink: 0
                            }}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = '/garam_masala.png'
                            }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--admin-text-main)' }}>
                                {cat.name}
                              </span>
                              <span
                                style={{
                                  backgroundColor: '#CCFBF1',
                                  color: '#0D9488',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: '12px'
                                }}
                              >
                                {cat.count} {cat.count === 1 ? 'Product' : 'Products'}
                              </span>
                            </div>
                            <p
                              style={{
                                margin: '3px 0 0',
                                fontSize: '0.76rem',
                                color: 'var(--admin-text-muted)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '360px'
                              }}
                            >
                              {cat.description}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ fontSize: '0.74rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => {
                              handleOpenEditModal(cat)
                              setActiveKpiModal(null)
                            }}
                          >
                            <FiEdit2 size={12} /> Edit
                          </button>
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ backgroundColor: '#0D9488', borderColor: '#0D9488', fontSize: '0.74rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => {
                              handleViewProductsOfCategory(cat.name)
                              setActiveKpiModal(null)
                            }}
                          >
                            Products <FiArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748B' }}>
                      <FiTag size={36} color="#CBD5E1" style={{ marginBottom: '10px' }} />
                      <h4 style={{ margin: '0 0 4px', fontSize: '0.96rem', color: 'var(--admin-text-main)' }}>No categories found</h4>
                      <p style={{ margin: 0, fontSize: '0.82rem' }}>No categories match "{kpiModalSearch}".</p>
                    </div>
                  )
                ) : (
                  paginatedKpiProducts.length > 0 ? (
                    paginatedKpiProducts.map((p) => {
                      const isInStock = p.availability === 'In Stock' || p.availability === true
                      return (
                        <div
                          key={p._id || p.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1px solid var(--admin-card-border)',
                            backgroundColor: '#FFFFFF',
                            marginBottom: '8px',
                            gap: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                            <img
                              src={p.image || '/garam_masala.png'}
                              alt={p.name}
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                border: '1px solid #E2E8F0',
                                flexShrink: 0
                              }}
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = '/garam_masala.png'
                              }}
                            />
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontWeight: 700,
                                  fontSize: '0.88rem',
                                  color: 'var(--admin-text-main)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {p.name}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    backgroundColor: '#F1F5F9',
                                    color: '#475569',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontWeight: 600
                                  }}
                                >
                                  {p.sku || `SKU-${p.id || 'PRD'}`}
                                </span>
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    backgroundColor: '#EEF2FF',
                                    color: '#4F46E5',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontWeight: 700
                                  }}
                                >
                                  {getCategoryName(p.category) || 'UNCATEGORIZED'}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                                  {p.netWeight || p.weight || '100g'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            <span
                              className={`status-badge ${isInStock ? 'in-stock' : 'out-stock'}`}
                              style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                            >
                              {isInStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ fontSize: '0.74rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => {
                                if (setActiveTab) setActiveTab('product')
                                setActiveKpiModal(null)
                              }}
                            >
                              <FiEye size={12} /> View
                            </button>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748B' }}>
                      <FiPackage size={36} color="#CBD5E1" style={{ marginBottom: '10px' }} />
                      <h4 style={{ margin: '0 0 4px', fontSize: '0.96rem', color: 'var(--admin-text-main)' }}>No products found</h4>
                      <p style={{ margin: 0, fontSize: '0.82rem' }}>
                        {kpiModalSearch ? `No products match "${kpiModalSearch}".` : 'No products found for this category.'}
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* MODAL FOOTER WITH 5-ITEM PAGINATION */}
              <div
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#FAF6F0',
                  borderTop: '1px solid var(--admin-card-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', minWidth: '140px' }}>
                  {activeKpiTotalItems > 0 ? (
                    <>
                      Showing <strong style={{ color: 'var(--admin-text-main)' }}>{kpiStartIndex + 1}</strong> to{' '}
                      <strong style={{ color: 'var(--admin-text-main)' }}>{kpiEndIndex}</strong> of{' '}
                      <strong style={{ color: 'var(--admin-text-main)' }}>{activeKpiTotalItems}</strong> {activeKpiModal === 'categories' ? 'categories' : 'items'}
                    </>
                  ) : (
                    '0 items'
                  )}
                </div>

                {/* PAGINATION CONTROLS (5 ITEMS PER PAGE) */}
                {totalKpiPages > 1 && (
                  <div className="pagination-controls" style={{ gap: '4px', margin: '0 auto' }}>
                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={kpiCurrentPage === 1}
                      onClick={() => setKpiCurrentPage((prev) => Math.max(prev - 1, 1))}
                      title="Previous Page"
                      style={{ width: '28px', height: '28px', padding: 0 }}
                    >
                      <FiChevronLeft size={14} />
                    </button>

                    {Array.from({ length: totalKpiPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        className={`pagination-btn ${page === kpiCurrentPage ? 'active' : ''}`}
                        onClick={() => setKpiCurrentPage(page)}
                        style={{
                          width: '28px',
                          height: '28px',
                          padding: 0,
                          fontSize: '0.78rem',
                          fontWeight: page === kpiCurrentPage ? 700 : 500
                        }}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={kpiCurrentPage === totalKpiPages}
                      onClick={() => setKpiCurrentPage((prev) => Math.min(prev + 1, totalKpiPages))}
                      title="Next Page"
                      style={{ width: '28px', height: '28px', padding: 0 }}
                    >
                      <FiChevronRight size={14} />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '6px 18px', minWidth: '80px' }}
                  onClick={() => setActiveKpiModal(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* DELETE CONFIRMATION MODAL */}
      {(deleteCatName || deleteTarget) &&
        createPortal(
          <div
            className="modal-overlay"
            style={{ zIndex: 10000 }}
            onClick={() => {
              setDeleteCatName(null)
              setDeleteTarget(null)
            }}
          >
            <div
              className="modal-content"
              style={{
                maxWidth: '420px',
                width: '90%',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.45)',
                border: '1px solid var(--admin-card-border)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="modal-header"
                style={{
                  padding: '14px 18px',
                  backgroundColor: '#FAF6F0',
                  borderBottom: '1px solid var(--admin-card-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <h3 className="modal-title" style={{ color: '#EF4444', fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                  Delete Category?
                </h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => {
                    setDeleteCatName(null)
                    setDeleteTarget(null)
                  }}
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="modal-body" style={{ padding: '20px', backgroundColor: '#FFFFFF' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                  Are you sure you want to permanently delete category <strong>"{deleteCatName || deleteTarget?.name || 'this category'}"</strong>? Products in this category will be safely reassigned to "PURE SPICES".
                </p>
              </div>

              <div
                className="modal-footer"
                style={{
                  padding: '14px 18px',
                  backgroundColor: '#FAF6F0',
                  borderTop: '1px solid var(--admin-card-border)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px'
                }}
              >
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setDeleteCatName(null)
                    setDeleteTarget(null)
                  }}
                  style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  style={{
                    backgroundColor: '#EF4444',
                    borderColor: '#EF4444',
                    fontSize: '0.85rem',
                    padding: '8px 18px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onClick={() => handleDeleteCategory(deleteTarget || deleteCatName)}
                >
                  <FiTrash2 size={15} /> Yes, Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default React.memo(CategoryManagement)

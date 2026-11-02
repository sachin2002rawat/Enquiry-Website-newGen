import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiBookOpen,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiEye,
  FiX,
  FiCheck,
  FiUploadCloud,
  FiSettings,
  FiStar,
  FiLayers,
  FiRefreshCw,
  FiGlobe,
  FiTag,
  FiExternalLink,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi'
import { apiService } from '../../api/apiService'
import { useLiveBlogs, getDefaultBlogSettings } from '../../hooks/useLiveBlogs'
import { getCategoryName } from '../../utils/categoryHelper'
import { getFullImageUrl } from '../../utils/imageUrl'

export { getFullImageUrl }

const BlogManagement = ({ showToast = () => {} }) => {
  const {
    blogs,
    setBlogs,
    blogSettings,
    setBlogSettings,
    broadcastBlogsUpdate,
    broadcastBlogSettingsUpdate
  } = useLiveBlogs()

  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedHomepage, setSelectedHomepage] = useState('all') // 'all' | 'home1' | 'home2'
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const [settingsFormData, setSettingsFormData] = useState(blogSettings)

  useEffect(() => {
    setSettingsFormData(blogSettings)
  }, [blogSettings])

  // Extract unique categories across all blogs
  const categoriesList = useMemo(() => {
    const raw = (blogs || [])
      .map(b => getCategoryName(b.category))
      .filter(Boolean)
    return ['All', ...Array.from(new Set(raw))]
  }, [blogs])

  // Filtered blogs based on search, homepage, and category
  const filteredBlogs = useMemo(() => {
    return (blogs || []).filter(item => {
      const title = (item.title || item.name || '').toLowerCase()
      const desc = (item.description || '').toLowerCase()
      const cat = (getCategoryName(item.category) || '').toLowerCase()
      const query = searchQuery.toLowerCase().trim()

      const matchesSearch = !query || title.includes(query) || desc.includes(query) || cat.includes(query)

      const matchesHomepage =
        selectedHomepage === 'all' ||
        item.targetHomepage === selectedHomepage ||
        item.targetHomepage === 'all' ||
        (!item.targetHomepage && selectedHomepage === 'home1')

      const matchesCat =
        selectedCategory === 'All' ||
        cat === selectedCategory.toLowerCase()

      return matchesSearch && matchesHomepage && matchesCat
    })
  }, [blogs, searchQuery, selectedHomepage, selectedCategory])

  // Reset to first page whenever search, homepage, or category filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedHomepage, selectedCategory])

  // Pagination calculation (10 items per page)
  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredBlogs.length)
  const paginatedBlogs = useMemo(() => {
    return filteredBlogs.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredBlogs, startIndex])

  // Keep currentPage valid if totalPages shrinks
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  // Helper to generate page buttons (with ellipses for large number of pages)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages]
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
  }

  // Navigate to dedicated page for Adding new blog
  const handleOpenAddModal = () => {
    navigate('/admin/blogs/create')
  }

  // Navigate to dedicated page for Editing existing blog
  const handleOpenEditModal = (blog) => {
    const targetId = blog._id || blog.id
    navigate(`/admin/blogs/edit/${targetId}`)
  }

  // Delete Blog
  const handleDeleteBlog = async (blog) => {
    const title = blog.title || blog.name || 'this blog'
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    const targetId = blog._id || blog.id
    try {
      await apiService.deleteBlog(targetId)
    } catch {}

    const updatedList = blogs.filter(b => b._id !== targetId && b.id !== targetId)
    setBlogs(updatedList)
    broadcastBlogsUpdate(updatedList)
    showToast('Blog article deleted successfully!', 'success')
  }

  // Save Blog Page General Settings
  const handleSaveSettings = async (e) => {
    e?.preventDefault()
    setIsSaving(true)
    try {
      await apiService.updateBlogSettings(settingsFormData)
      setBlogSettings(settingsFormData)
      broadcastBlogSettingsUpdate(settingsFormData)
      showToast('Blog page settings saved and updated live on frontend!', 'success')
      setIsSettingsModalOpen(false)
    } catch (err) {
      showToast(err.message || 'Error saving settings', 'danger')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="blog-management-container" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 1. Header Card */}
      <div className="admin-card">
        <div className="admin-card-header" style={{ marginBottom: 0, borderBottom: 'none', flexWrap: 'wrap', gap: '16px' }}>
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
              <FiBookOpen size={22} />
            </div>
            <div>
              <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 className="card-title">Blog Articles & Content Manager</h2>
                <span className="live-count-badge" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE' }}>
                  {filteredBlogs.length} Articles
                </span>
              </div>
              <p className="card-subtitle" style={{ margin: '4px 0 0 0' }}>
                Add, edit, and organize articles for Homepage 1 (Masala / Food) and Homepage 2 (Beauty / Cosmetics), plus customize frontend headers & highlights.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsSettingsModalOpen(true)}
              style={{ fontSize: '0.84rem', padding: '9px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <FiSettings size={15} /> Page Hero & Settings
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleOpenAddModal}
              style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5', fontSize: '0.84rem', padding: '9px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <FiPlus size={16} /> Add New Blog
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Grid */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeft: '4px solid #4F46E5' }}>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
            <FiLayers size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Total Articles</span>
            <span className="kpi-value">{blogs.length}</span>
            <span className="kpi-meta" style={{ color: '#4F46E5' }}>Across all categories</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #059669' }}>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
            <FiGlobe size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Masala Blogs (Home 1)</span>
            <span className="kpi-value">
              {blogs.filter(b => b.targetHomepage === 'home1' || !b.targetHomepage).length}
            </span>
            <span className="kpi-meta" style={{ color: '#059669' }}>Food & spice articles</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #D97706' }}>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <FiStar size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Beauty Blogs (Home 2)</span>
            <span className="kpi-value">
              {blogs.filter(b => b.targetHomepage === 'home2').length}
            </span>
            <span className="kpi-meta" style={{ color: '#D97706' }}>Cosmetics & skincare</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #0284C7' }}>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
            <FiCheckCircle size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Live Status</span>
            <span className="kpi-value">{blogs.filter(b => b.isPublished !== false).length} Active</span>
            <span className="kpi-meta" style={{ color: '#0284C7' }}>Visible on frontend</span>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className="admin-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          
          {/* Left: Search input */}
          <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
            <FiSearch size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search by title, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input"
              style={{ paddingLeft: '36px', height: '40px', width: '100%', borderRadius: '8px' }}
            />
          </div>

          {/* Right: Homepage and Category Selectors */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>Homepage:</span>
              <select
                value={selectedHomepage}
                onChange={(e) => setSelectedHomepage(e.target.value)}
                className="admin-input"
                style={{ height: '40px', padding: '6px 12px', borderRadius: '8px', fontSize: '0.84rem' }}
              >
                <option value="all">All Homepages</option>
                <option value="home1">Homepage 1 (Masala / Food)</option>
                <option value="home2">Homepage 2 (Beauty / Skincare)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="admin-input"
                style={{ height: '40px', padding: '6px 12px', borderRadius: '8px', fontSize: '0.84rem' }}
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Blog Articles Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="blog-manager-table" style={{ width: '100%', minWidth: '960px', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '32%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Article</th>
                <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Target Homepage</th>
                <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Details</th>
                <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Rating</th>
                <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 20px', color: '#64748B' }}>
                    <FiBookOpen size={36} style={{ color: '#CBD5E1', marginBottom: '10px' }} />
                    <p style={{ margin: 0, fontSize: '0.94rem', fontWeight: 600 }}>
                      {blogs.length === 0 ? 'No blogs created yet' : 'No blog articles found matching your filters'}
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94A3B8' }}>
                      {blogs.length === 0 ? 'Add your first blog article to get started.' : 'Try adjusting your search query or filters.'}
                    </p>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleOpenAddModal}
                      style={{ marginTop: '14px', fontSize: '0.82rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <FiPlus size={14} /> Add Blog
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedBlogs.map((item, idx) => {
                  const itemId = item._id || item.id || idx
                  const title = item.title || item.name || 'Untitled Article'
                  const cat = getCategoryName(item.category) || 'GENERAL'
                  const isBeauty = item.targetHomepage === 'home2'
                  const homeLabel = isBeauty ? 'Homepage 2 (Beauty)' : 'Homepage 1 (Masala)'

                  return (
                    <tr key={itemId} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}>
                      {/* Image & Title */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <img
                            src={getFullImageUrl(item.image) || '/premium_spices.png'}
                            alt={title}
                            style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E2E8F0', flexShrink: 0 }}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = '/premium_spices.png'
                            }}
                          />
                          <div style={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
                            <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={title}>
                              {title}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }} title={item.description || ''}>
                              {item.description || 'No excerpt available'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Homepage Tag */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            backgroundColor: isBeauty ? '#FDF2F8' : '#EEF2FF',
                            color: isBeauty ? '#DB2777' : '#4F46E5',
                            border: `1px solid ${isBeauty ? '#FBCFE8' : '#C7D2FE'}`,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isBeauty ? '#EC4899' : '#6366F1' }} />
                          {homeLabel}
                        </span>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', backgroundColor: '#F1F5F9', padding: '3px 9px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                          {cat}
                        </span>
                      </td>

                      {/* Details (Date & Author) */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '0.78rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                        <div><strong style={{ color: '#475569' }}>Date:</strong> {item.date || 'N/A'}</div>
                        <div style={{ marginTop: '2px' }}><strong style={{ color: '#475569' }}>Author:</strong> {item.author || 'Editorial Team'}</div>
                      </td>

                      {/* Rating */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 700, color: '#F59E0B' }}>
                          <FiStar size={13} fill="#F59E0B" /> {item.rating || 4.8}
                          <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 500 }}>({item.reviewsCount || 120})</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <a
                            href={`/blog/${itemId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-icon"
                            title="Preview on frontend"
                            style={{ color: '#0284C7', padding: '6px', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <FiExternalLink size={14} />
                          </a>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit Blog"
                            style={{ color: '#4F46E5', padding: '6px', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => handleDeleteBlog(item)}
                            title="Delete Blog"
                            style={{ color: '#EF4444', padding: '6px', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 10 Items Per Page Table Pagination Bar */}
        {filteredBlogs.length > 0 && (
          <div className="admin-pagination-bar">
            <div className="pagination-info">
              Showing <span style={{ color: 'var(--admin-text-main)', fontWeight: 600 }}>{filteredBlogs.length === 0 ? 0 : startIndex + 1}</span> to{' '}
              <span style={{ color: 'var(--admin-text-main)', fontWeight: 600 }}>{endIndex}</span> of{' '}
              <span style={{ color: 'var(--admin-text-main)', fontWeight: 600 }}>{filteredBlogs.length}</span> articles
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

                {getPageNumbers().map((page, pIdx) => {
                  if (page === '...') {
                    return (
                      <span
                        key={`ellipsis-${pIdx}`}
                        style={{
                          padding: '0 6px',
                          color: 'var(--admin-text-muted)',
                          fontSize: '0.85rem',
                          userSelect: 'none'
                        }}
                      >
                        ...
                      </span>
                    )
                  }
                  return (
                    <button
                      key={page}
                      type="button"
                      className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                })}

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
      </div>



      {/* ========================================================================= */}
      {/* 6. GLOBAL BLOG PAGE SETTINGS MODAL */}
      {/* ========================================================================= */}
      {isSettingsModalOpen && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="admin-modal-container" style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '720px', maxHeight: '90vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                  <FiSettings size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>
                    Blog Page Global Settings
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                    Edit hero headings, description, and enquiry callout banners shown on frontend /blog
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', padding: '6px' }}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveSettings} style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Hero Section Texts */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', color: '#0F172A', fontWeight: 700 }}>
                  Hero Header Section (/blog)
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Top Tag / Pill Text
                    </label>
                    <input
                      type="text"
                      value={settingsFormData.heroTag || ''}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, heroTag: e.target.value })}
                      className="admin-input"
                      style={{ width: '100%', height: '38px', borderRadius: '6px', padding: '0 10px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Main Heading Title
                    </label>
                    <input
                      type="text"
                      value={settingsFormData.heroTitle || ''}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, heroTitle: e.target.value })}
                      className="admin-input"
                      style={{ width: '100%', height: '38px', borderRadius: '6px', padding: '0 10px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Subtitle / Subheading Description
                    </label>
                    <textarea
                      rows={2}
                      value={settingsFormData.heroSubtitle || ''}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, heroSubtitle: e.target.value })}
                      className="admin-input"
                      style={{ width: '100%', borderRadius: '6px', padding: '8px 10px', fontSize: '0.84rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Detail Page Enquiry Banner */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', color: '#0F172A', fontWeight: 700 }}>
                  Bottom Enquiry CTA Banner (/blog/:id)
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Banner Title
                    </label>
                    <input
                      type="text"
                      value={settingsFormData.enquiryBannerTitle || ''}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, enquiryBannerTitle: e.target.value })}
                      className="admin-input"
                      style={{ width: '100%', height: '38px', borderRadius: '6px', padding: '0 10px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Banner Subtitle
                    </label>
                    <input
                      type="text"
                      value={settingsFormData.enquiryBannerSubtitle || ''}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, enquiryBannerSubtitle: e.target.value })}
                      className="admin-input"
                      style={{ width: '100%', height: '38px', borderRadius: '6px', padding: '0 10px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '9px 18px', fontSize: '0.86rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary"
                  style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5', padding: '9px 22px', fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {isSaving ? <FiRefreshCw className="spin" size={16} /> : <FiCheck size={16} />}
                  Save Settings Live
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default React.memo(BlogManagement)

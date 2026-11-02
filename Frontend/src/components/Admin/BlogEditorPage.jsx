import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  FiArrowLeft,
  FiBookOpen,
  FiCheck,
  FiCheckCircle,
  FiRefreshCw,
  FiUploadCloud,
  FiX,
  FiStar,
  FiGlobe,
  FiTag,
  FiCalendar,
  FiClock,
  FiUser,
  FiBox,
  FiLayers
} from 'react-icons/fi'
import { apiService } from '../../api/apiService'
import { useLiveBlogs } from '../../hooks/useLiveBlogs'
import { getCategoryName } from '../../utils/categoryHelper'
import { getFullImageUrl } from './BlogManagement'

const BlogEditorPage = ({ showToast = () => {} }) => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const { blogs, setBlogs, broadcastBlogsUpdate } = useLiveBlogs()
  const fileInputRef = useRef(null)

  const initialForm = {
    title: '',
    name: '',
    slug: '',
    category: '',
    targetHomepage: 'home1',
    description: '',
    image: '',
    date: '',
    readTime: '',
    rating: '',
    reviewsCount: '',
    keyHighlights: [''],
    fullDescription: [''],
    sku: '',
    netWeight: '',
    minOrderQty: '',
    availability: '',
    author: '',
    isPublished: true
  }

  const [formData, setFormData] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(isEdit)
  const [isSaving, setIsSaving] = useState(false)

  // Auto-slugify helper
  const slugify = (text) => {
    if (!text) return ''
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Load existing blog if in Edit mode
  useEffect(() => {
    if (!isEdit) return

    let isMounted = true

    // 1. Try finding in current live blogs state immediately
    const foundLocal = (blogs || []).find(
      (b) => String(b._id) === String(id) || String(b.id) === String(id) || b.slug === id
    )
    if (foundLocal) {
      populateForm(foundLocal)
      setIsLoading(false)
    }

    // 2. Also fetch freshest from backend API to ensure data accuracy
    const fetchBlogFromApi = async () => {
      try {
        const dbBlog = await apiService.getBlogById(id)
        if (isMounted && dbBlog) {
          populateForm(dbBlog)
        }
      } catch (err) {
        if (isMounted && !foundLocal) {
          showToast('Failed to load blog data', 'danger')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchBlogFromApi()

    return () => {
      isMounted = false
    }
  }, [id, isEdit])

  const populateForm = (blog) => {
    setFormData({
      title: blog.title || blog.name || '',
      name: blog.name || blog.title || '',
      slug: blog.slug || '',
      category: getCategoryName(blog.category) || '',
      targetHomepage: blog.targetHomepage || 'home1',
      description: blog.description || '',
      image: blog.image || '',
      date: blog.date || '',
      readTime: blog.readTime || '',
      rating: blog.rating !== undefined && blog.rating !== null ? blog.rating : '',
      reviewsCount: blog.reviewsCount !== undefined && blog.reviewsCount !== null ? blog.reviewsCount : '',
      keyHighlights:
        Array.isArray(blog.keyHighlights) && blog.keyHighlights.length > 0
          ? [...blog.keyHighlights]
          : [''],
      fullDescription:
        Array.isArray(blog.fullDescription) && blog.fullDescription.length > 0
          ? [...blog.fullDescription]
          : [''],
      sku: blog.sku || '',
      netWeight: blog.netWeight || '',
      minOrderQty: blog.minOrderQty || '',
      availability: blog.availability || '',
      author: blog.author || '',
      isPublished: blog.isPublished !== false
    })
  }

  // Handle title change and auto slugify
  const handleTitleChange = (val) => {
    const slugVal = slugify(val)
    setFormData((prev) => ({
      ...prev,
      title: val,
      name: val,
      slug: prev.slug === '' || prev.slug === slugify(prev.title) ? slugVal : prev.slug
    }))
  }

  // Handle Image Upload
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file', 'warning')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }))
      showToast('Image uploaded and preview ready!', 'success')
    }
    reader.readAsDataURL(file)
  }

  // Highlights handlers
  const handleAddHighlight = () => {
    setFormData((prev) => ({
      ...prev,
      keyHighlights: [...prev.keyHighlights, '']
    }))
  }

  const handleUpdateHighlight = (index, val) => {
    setFormData((prev) => {
      const updated = [...prev.keyHighlights]
      updated[index] = val
      return { ...prev, keyHighlights: updated }
    })
  }

  const handleRemoveHighlight = (index) => {
    setFormData((prev) => ({
      ...prev,
      keyHighlights: prev.keyHighlights.filter((_, i) => i !== index)
    }))
  }

  // Paragraphs handlers
  const handleAddParagraph = () => {
    setFormData((prev) => ({
      ...prev,
      fullDescription: [...prev.fullDescription, '']
    }))
  }

  const handleUpdateParagraph = (index, val) => {
    setFormData((prev) => {
      const updated = [...prev.fullDescription]
      updated[index] = val
      return { ...prev, fullDescription: updated }
    })
  }

  const handleRemoveParagraph = (index) => {
    setFormData((prev) => ({
      ...prev,
      fullDescription: prev.fullDescription.filter((_, i) => i !== index)
    }))
  }

  // Save Blog handler
  const handleSave = async (e) => {
    e?.preventDefault()

    if (!formData.title.trim()) {
      showToast('Please enter an article title', 'warning')
      return
    }

    setIsSaving(true)

    const payload = {
      ...formData,
      category: formData.category.trim() || 'General',
      author: formData.author.trim() || 'Editorial Team',
      date: formData.date.trim() || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      readTime: formData.readTime.trim() || '5 min read',
      rating: formData.rating !== '' ? Number(formData.rating) : 4.8,
      reviewsCount: formData.reviewsCount !== '' ? Number(formData.reviewsCount) : 120,
      sku: formData.sku.trim() || 'SKU-BLG-001',
      netWeight: formData.netWeight.trim() || '200g / Pack',
      minOrderQty: formData.minOrderQty.trim() || '50 Units',
      availability: formData.availability.trim() || 'In Stock',
      name: formData.title,
      slug: formData.slug || slugify(formData.title),
      keyHighlights: formData.keyHighlights.filter((h) => h.trim().length > 0),
      fullDescription: formData.fullDescription.filter((p) => p.trim().length > 0)
    }

    try {
      if (isEdit) {
        // Update existing blog
        const res = await apiService.updateBlog(id, payload)
        const updatedItem = res && res.data ? res.data : { ...payload, _id: id }

        const updatedList = (blogs || []).map((b) =>
          String(b._id) === String(id) || String(b.id) === String(id) || b.slug === id
            ? updatedItem
            : b
        )
        setBlogs(updatedList)
        broadcastBlogsUpdate(updatedList)
        showToast('Blog article updated successfully!', 'success')
      } else {
        // Create new blog
        const res = await apiService.createBlog(payload)
        const newItem =
          res && res.data
            ? res.data
            : { ...payload, _id: `blog_${Date.now()}`, id: Date.now() }

        const updatedList = [newItem, ...(blogs || [])]
        setBlogs(updatedList)
        broadcastBlogsUpdate(updatedList)
        showToast('New blog article created successfully!', 'success')
      }

      // Navigate back to Blog Management tab
      navigate('/admin?tab=blog')
    } catch (err) {
      showToast(err.message || 'Error saving blog article', 'danger')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748B' }}>
        <FiRefreshCw className="spin" size={32} style={{ color: '#4F46E5', marginBottom: '12px' }} />
        <p style={{ fontSize: '0.96rem', fontWeight: 600 }}>Loading blog article...</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Breadcrumb and Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => navigate('/admin?tab=blog')}
            className="btn-secondary"
            style={{
              padding: '8px 14px',
              fontSize: '0.84rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px'
            }}
          >
            <FiArrowLeft size={16} /> Back to Blogs
          </button>
          <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
            <span>Blog Management</span> &nbsp;/&nbsp; <strong style={{ color: '#1E293B' }}>{isEdit ? 'Edit Article' : 'Create Article'}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/admin?tab=blog')}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.84rem', borderRadius: '8px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary"
            style={{
              backgroundColor: '#4F46E5',
              borderColor: '#4F46E5',
              padding: '8px 20px',
              fontSize: '0.84rem',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isSaving ? <FiRefreshCw className="spin" size={15} /> : <FiCheck size={16} />}
            {isEdit ? 'Save Changes' : 'Publish Article'}
          </button>
        </div>
      </div>

      {/* 2. Top Title Card */}
      <div className="admin-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FiBookOpen size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              {isEdit ? 'Edit Blog Article' : 'Create New Blog Article'}
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#64748B' }}>
              Configure all content, featured imagery, homepage placement, highlights, and full description story paragraphs.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Form Container */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Section 1: Basic Information */}
        <div className="admin-card" style={{ padding: '24px' }}>
          <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiLayers size={18} color="#4F46E5" />
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1E293B' }}>
              Basic Article Information
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Title & Homepage */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Article Title <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sona Masoori Rice or The Secrets of Traditional Garam Masala"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="admin-input"
                  style={{ width: '100%', height: '42px', borderRadius: '8px', padding: '0 12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Target Homepage <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={formData.targetHomepage}
                  onChange={(e) => setFormData({ ...formData, targetHomepage: e.target.value })}
                  className="admin-input"
                  style={{ width: '100%', height: '42px', borderRadius: '8px', padding: '0 12px', fontSize: '0.86rem' }}
                >
                  <option value="home1">Homepage 1 (Masala / Food Products)</option>
                  <option value="home2">Homepage 2 (Beauty / Skincare)</option>
                  <option value="all">Both Homepages (All)</option>
                </select>
              </div>
            </div>

            {/* Category, Slug & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Category Badge <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PURE SPICES, RICE, or SKINCARE"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value.toUpperCase() })}
                  className="admin-input"
                  style={{ width: '100%', height: '42px', borderRadius: '8px', padding: '0 12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="e.g. sona-masoori-rice (auto-generated if left blank)"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="admin-input"
                  style={{ width: '100%', height: '42px', borderRadius: '8px', padding: '0 12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Publication Status
                </label>
                <select
                  value={formData.isPublished ? 'published' : 'draft'}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.value === 'published' })}
                  className="admin-input"
                  style={{ width: '100%', height: '42px', borderRadius: '8px', padding: '0 12px', fontSize: '0.86rem' }}
                >
                  <option value="published">Published (Visible on site)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>
            </div>

            {/* Author, Date, Read Time */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Author Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chef Sanjeev, Nutritionist Priya, or Editorial Team"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="admin-input"
                  style={{ width: '100%', height: '42px', borderRadius: '8px', padding: '0 12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Display Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. October 2026 or Oct 15, 2026"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="admin-input"
                  style={{ width: '100%', height: '42px', borderRadius: '8px', padding: '0 12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Reading Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5 min read"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  className="admin-input"
                  style={{ width: '100%', height: '42px', borderRadius: '8px', padding: '0 12px' }}
                />
              </div>
            </div>

            {/* Short Excerpt */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Short Excerpt / Overview
              </label>
              <textarea
                rows={2}
                placeholder="Brief 1-2 sentence overview shown on blog cards and hero banner..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="admin-input"
                style={{ width: '100%', borderRadius: '8px', padding: '10px 12px', resize: 'vertical', fontSize: '0.88rem' }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Featured Media */}
        <div className="admin-card" style={{ padding: '24px' }}>
          <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiUploadCloud size={18} color="#4F46E5" />
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1E293B' }}>
              Featured Blog Image
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Image Preview Box */}
            <div
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '12px',
                border: '2px dashed #CBD5E1',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F8FAFC',
                flexShrink: 0
              }}
            >
              {formData.image ? (
                <img
                  src={getFullImageUrl(formData.image)}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = '/premium_spices.png'
                  }}
                />
              ) : (
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', textAlign: 'center', padding: '10px' }}>
                  No Image Selected
                </span>
              )}
            </div>

            {/* Image Upload Actions */}
            <div style={{ flex: 1, minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary"
                  style={{
                    fontSize: '0.84rem',
                    padding: '9px 16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderRadius: '8px'
                  }}
                >
                  <FiUploadCloud size={18} /> Choose Image File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageFileChange}
                />
                {formData.image && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '8px 12px', color: '#EF4444' }}
                  >
                    Clear Image
                  </button>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', marginBottom: '6px' }}>
                  Or paste direct image URL (Unsplash, CDN, or uploaded path):
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or /garam_masala.png"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="admin-input"
                  style={{ width: '100%', height: '38px', borderRadius: '8px', padding: '0 12px', fontSize: '0.84rem' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Catalogue & Product Specifications (Optional) */}
        <div className="admin-card" style={{ padding: '24px' }}>
          <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiBox size={18} color="#4F46E5" />
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1E293B' }}>
              Catalog Specifications & Rating (Optional)
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>
                SKU Code
              </label>
              <input
                type="text"
                placeholder="e.g. SKU-BLG-001 or SPICE-01"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="admin-input"
                style={{ width: '100%', height: '38px', borderRadius: '6px', padding: '0 10px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>
                Net Weight
              </label>
              <input
                type="text"
                placeholder="e.g. 200g / Pack or 100ml Bottle"
                value={formData.netWeight}
                onChange={(e) => setFormData({ ...formData, netWeight: e.target.value })}
                className="admin-input"
                style={{ width: '100%', height: '38px', borderRadius: '6px', padding: '0 10px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>
                Min Order Qty
              </label>
              <input
                type="text"
                placeholder="e.g. 50 Units or 10 Cartons"
                value={formData.minOrderQty}
                onChange={(e) => setFormData({ ...formData, minOrderQty: e.target.value })}
                className="admin-input"
                style={{ width: '100%', height: '38px', borderRadius: '6px', padding: '0 10px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>
                Availability
              </label>
              <input
                type="text"
                placeholder="e.g. In Stock, Available, or Pre-order"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="admin-input"
                style={{ width: '100%', height: '38px', borderRadius: '6px', padding: '0 10px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>
                Rating (1 - 5)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                placeholder="e.g. 4.8"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="admin-input"
                style={{ width: '100%', height: '38px', borderRadius: '6px', padding: '0 10px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>
                Reviews Count
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 120"
                value={formData.reviewsCount}
                onChange={(e) => setFormData({ ...formData, reviewsCount: e.target.value })}
                className="admin-input"
                style={{ width: '100%', height: '38px', borderRadius: '6px', padding: '0 10px' }}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Key Highlights & Summary Callouts */}
        <div className="admin-card" style={{ padding: '24px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#166534' }}>
                Key Highlights & Callout Points
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#15803D' }}>
                Rendered as highlighted bullet points inside the green spotlight card on the article page.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddHighlight}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 14px', backgroundColor: '#FFFFFF' }}
            >
              + Add Highlight Point
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {formData.keyHighlights.map((hl, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <FiCheckCircle size={18} color="#166534" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  value={hl}
                  placeholder={
                    index === 0
                      ? 'e.g. 100% Authentic quality sourced directly from trusted organic farms.'
                      : index === 1
                      ? 'e.g. Processed under strict ISO-certified hygienic standards with zero artificial additives.'
                      : 'e.g. Direct farm fresh and laboratory tested for optimal purity.'
                  }
                  onChange={(e) => handleUpdateHighlight(index, e.target.value)}
                  className="admin-input"
                  style={{
                    flex: 1,
                    height: '40px',
                    borderRadius: '8px',
                    padding: '0 12px',
                    fontSize: '0.86rem',
                    backgroundColor: '#FFFFFF',
                    borderColor: '#86EFAC'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveHighlight(index)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#EF4444',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px'
                  }}
                  title="Remove point"
                >
                  <FiX size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Full Article Story Paragraphs */}
        <div className="admin-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1E293B' }}>
                Full Article Story & Body Paragraphs
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                Add detailed content paragraphs displayed in order on the single blog article reading page.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddParagraph}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 14px' }}
            >
              + Add Paragraph
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {formData.fullDescription.map((para, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', marginTop: '10px', minWidth: '26px' }}>
                  P{index + 1}:
                </span>
                <textarea
                  rows={3}
                  value={para}
                  placeholder={
                    index === 0
                      ? 'e.g. Discover authentic flavors and pure ingredients carefully curated for your household and culinary needs...'
                      : index === 1
                      ? 'e.g. Every batch undergoes rigorous quality assurance tests to ensure optimal flavor, aroma, and nutrient retention...'
                      : `e.g. Paragraph ${index + 1} content...`
                  }
                  onChange={(e) => handleUpdateParagraph(index, e.target.value)}
                  className="admin-input"
                  style={{
                    flex: 1,
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '0.88rem',
                    backgroundColor: '#FFFFFF',
                    resize: 'vertical'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveParagraph(index)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#EF4444',
                    cursor: 'pointer',
                    padding: '8px',
                    marginTop: '6px'
                  }}
                  title="Remove paragraph"
                >
                  <FiX size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="admin-card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <button
            type="button"
            onClick={() => navigate('/admin?tab=blog')}
            className="btn-secondary"
            style={{ padding: '9px 20px', fontSize: '0.86rem', borderRadius: '8px' }}
          >
            Cancel & Return
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary"
            style={{
              backgroundColor: '#4F46E5',
              borderColor: '#4F46E5',
              padding: '9px 26px',
              fontSize: '0.88rem',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isSaving ? <FiRefreshCw className="spin" size={16} /> : <FiCheck size={16} />}
            {isEdit ? 'Save Changes' : 'Publish Article'}
          </button>
        </div>

      </form>
    </div>
  )
}

export default React.memo(BlogEditorPage)

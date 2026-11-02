import React, { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  FiPackage,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiAlertTriangle,
  FiX,
  FiCheck,
  FiGrid,
  FiTag,
  FiLayers,
  FiChevronLeft,
  FiChevronRight,
  FiUploadCloud,
  FiLink,
  FiEye,
  FiStar,
  FiArrowRight,
  FiGlobe,
  FiZap,
  FiImage
} from 'react-icons/fi'
import { apiService } from '../../api/apiService'
import { broadcastProductUpdate } from '../../hooks/useLiveProducts'
import useLiveCategories from '../../hooks/useLiveCategories'
import { getCategoryName, getCategoryId } from '../../utils/categoryHelper'
import { getFullImageUrl } from '../../utils/imageUrl'

export { getFullImageUrl }

const ITEMS_PER_PAGE = 5

const ProductManagement = ({
  products,
  setProducts,
  showToast,
  globalSearch,
  selectedCategoryProp,
  onCategoryChange
}) => {
  const [liveCategories] = useLiveCategories()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(selectedCategoryProp || 'ALL')
  const [currentPage, setCurrentPage] = useState(1)

  // Sync state if selectedCategoryProp changes externally (e.g., from CategoryManagement)
  useEffect(() => {
    if (selectedCategoryProp !== undefined) {
      setSelectedCategory(selectedCategoryProp)
    }
  }, [selectedCategoryProp])

  const handleCategoryFilterChange = (newCat) => {
    setSelectedCategory(newCat)
    if (onCategoryChange) {
      onCategoryChange(newCat)
    }
  }

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [modalTab, setModalTab] = useState('general') // 'general' | 'seo'
  const [imageSourceType, setImageSourceType] = useState('upload') // 'upload' | 'url'
  const [formState, setFormState] = useState({
    name: '',
    category: '',
    sku: '',
    weight: '',
    netWeight: '',
    minOrderQty: '50 Units',
    availability: 'In Stock',
    image: '',
    images: [],
    description: '',
    fullDescription: '',
    rating: 4.8,
    reviewsCount: 15,
    seoTitle: '',
    metaDescription: '',
    metaKeywords: ''
  })

  const [uploadedProductFileName, setUploadedProductFileName] = useState('')
  const [newGalleryImageUrl, setNewGalleryImageUrl] = useState('')
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isSavingProduct, setIsSavingProduct] = useState(false)

  const handleProductImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'warning')
      return
    }

    setUploadedProductFileName(file.name)

    // 1. Immediately read file as Data URL for instant local preview
    let localDataUrl = ''
    try {
      localDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    } catch (readErr) {
      console.warn('Local file read error:', readErr)
    }

    if (localDataUrl) {
      setFormState((prev) => {
        // Purge any default/masala placeholder images so only the user's uploaded images show
        const cleanImgs = (Array.isArray(prev.images) ? prev.images : [])
          .filter((img) => img && !img.includes('photo-1596040033229-a9821ebd058d') && img !== '/premium_spices.png' && img !== localDataUrl)
        return {
          ...prev,
          image: localDataUrl,
          images: [localDataUrl, ...cleanImgs]
        }
      })
      showToast(`Selected image: ${file.name}`)
    }

    // 2. Upload to backend/Cloudinary in background for permanent hosted URL
    setIsUploadingImage(true)
    try {
      const uploadRes = await apiService.uploadImage(file)
      if (uploadRes && uploadRes.url) {
        const fullUrl = getFullImageUrl(uploadRes.url)
        setFormState((prev) => {
          const currentImgs = (Array.isArray(prev.images) ? prev.images : []).map((img) =>
            img === localDataUrl ? fullUrl : img
          )
          if (!currentImgs.includes(fullUrl)) {
            currentImgs.unshift(fullUrl)
          }
          return {
            ...prev,
            image: prev.image === localDataUrl ? fullUrl : prev.image,
            images: currentImgs
          }
        })
      }
    } catch (err) {
      console.warn('Background image upload note:', err)
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Handle multiple image files upload for Product Views gallery
  const handleGalleryImageUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsUploadingGallery(true)
    showToast(`Loading ${files.length} gallery image(s)...`, 'info')

    // 1. Immediately read all files as Data URLs so user sees preview in popup instantly
    const fileEntries = []
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      try {
        const dataUrl = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = () => resolve(null)
          reader.readAsDataURL(file)
        })
        if (dataUrl) fileEntries.push({ file, dataUrl })
      } catch (err) {
        console.warn('File read error:', err)
      }
    }

    if (fileEntries.length > 0) {
      setFormState((prev) => {
        // Strip out default/masala placeholder images so only the user's uploaded images show
        const cleanImgs = (Array.isArray(prev.images) ? prev.images : [])
          .filter((img) => img && !img.includes('photo-1596040033229-a9821ebd058d') && img !== '/premium_spices.png')
        fileEntries.forEach(({ dataUrl }) => {
          if (!cleanImgs.includes(dataUrl)) cleanImgs.push(dataUrl)
        })

        const isCurrentPrimaryMasala =
          !prev.image ||
          prev.image.includes('photo-1596040033229-a9821ebd058d') ||
          prev.image === '/premium_spices.png'
        const primaryImg = isCurrentPrimaryMasala ? (cleanImgs[0] || '') : prev.image

        return {
          ...prev,
          images: cleanImgs,
          image: primaryImg
        }
      })
      showToast(`Added ${fileEntries.length} image(s) to gallery preview!`)
    }

    // 2. Background upload to Cloudinary/server for permanent URLs
    try {
      for (const { file, dataUrl } of fileEntries) {
        try {
          const uploadRes = await apiService.uploadImage(file)
          if (uploadRes && uploadRes.url) {
            const permUrl = getFullImageUrl(uploadRes.url)
            setFormState((prev) => {
              const currentImgs = (Array.isArray(prev.images) ? prev.images : [])
                .map((img) => (img === dataUrl ? permUrl : img))
              return {
                ...prev,
                images: currentImgs,
                image: prev.image === dataUrl ? permUrl : prev.image
              }
            })
          }
        } catch (singleErr) {
          console.warn('Gallery upload warning:', singleErr)
        }
      }
    } catch (err) {
      console.warn('Gallery batch error:', err)
    } finally {
      setIsUploadingGallery(false)
    }
  }

  // Handle adding image URL to gallery
  const handleAddGalleryImageUrl = () => {
    if (!newGalleryImageUrl || !newGalleryImageUrl.trim()) {
      showToast('Please enter an image URL', 'warning')
      return
    }
    const trimmed = newGalleryImageUrl.trim()
    setFormState((prev) => {
      const currentImgs = Array.isArray(prev.images) ? [...prev.images] : []
      if (!currentImgs.includes(trimmed)) {
        currentImgs.push(trimmed)
      }
      return {
        ...prev,
        images: currentImgs,
        image: prev.image || currentImgs[0]
      }
    })
    setNewGalleryImageUrl('')
    showToast('Image added to gallery!')
  }

  // Remove individual image from gallery
  const handleRemoveGalleryImage = (indexToRemove) => {
    setFormState((prev) => {
      const currentImgs = Array.isArray(prev.images) ? [...prev.images] : []
      const updated = currentImgs.filter((_, idx) => idx !== indexToRemove)
      const newPrimary =
        prev.image === currentImgs[indexToRemove]
          ? (updated[0] || '')
          : prev.image
      return {
        ...prev,
        images: updated,
        image: newPrimary
      }
    })
  }

  // Set an image from gallery as primary display image
  const handleSetPrimaryImage = (imgUrl) => {
    setFormState((prev) => ({ ...prev, image: imgUrl }))
    showToast('Selected as main display image', 'info')
  }

  // Modal State for Delete Confirmation (tracks targeted product object)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Modal States for KPI Card Details Popup
  const [activeKpiModal, setActiveKpiModal] = useState(null) // 'total' | 'inStock' | 'outOfStock' | 'categories' | null
  const [kpiModalSearch, setKpiModalSearch] = useState('')
  const [selectedProductDetail, setSelectedProductDetail] = useState(null)

  // Sync with global header search if present
  const activeSearch = searchTerm || globalSearch

  // Reset page to 1 whenever search or category filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, globalSearch])

  // Categories list derived from liveCategories and products
  const categories = useMemo(() => {
    const cats = new Set()
    if (Array.isArray(liveCategories)) {
      liveCategories.forEach((c) => {
        if (c.name) cats.add(c.name.trim().toUpperCase())
      })
    }
    products.forEach((p) => {
      const pCat = getCategoryName(p.category).trim().toUpperCase()
      if (pCat && !pCat.match(/^[0-9a-fA-F]{24}$/)) cats.add(pCat)
    })
    if (selectedCategory && selectedCategory !== 'ALL' && !selectedCategory.match(/^[0-9a-fA-F]{24}$/)) {
      cats.add(selectedCategory.trim().toUpperCase())
    }
    return ['ALL', ...Array.from(cats)]
  }, [liveCategories, products, selectedCategory])

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const pName = (p.name || '').toLowerCase()
      const pSku = (p.sku || '').toLowerCase()
      const pCatName = getCategoryName(p.category).trim().toUpperCase()
      const pCatId = getCategoryId(p.category)

      const matchSearch =
        !activeSearch ||
        pName.includes(activeSearch.toLowerCase()) ||
        pSku.includes(activeSearch.toLowerCase()) ||
        pCatName.toLowerCase().includes(activeSearch.toLowerCase())

      const sCat = (selectedCategory || 'ALL').trim().toUpperCase()
      const matchedCat = Array.isArray(liveCategories)
        ? liveCategories.find(
            (c) =>
              (c.name || '').trim().toUpperCase() === sCat ||
              String(c._id).toLowerCase() === String(selectedCategory).toLowerCase() ||
              (c.slug && c.slug.toLowerCase() === selectedCategory.toLowerCase())
          )
        : null

      const targetCatName = matchedCat ? (matchedCat.name || '').trim().toUpperCase() : sCat
      const targetCatId = matchedCat
        ? String(matchedCat._id)
        : (selectedCategory.match(/^[0-9a-fA-F]{24}$/) ? selectedCategory : null)

      const matchCat =
        sCat === 'ALL' ||
        pCatName === targetCatName ||
        (targetCatId && pCatId && String(pCatId) === String(targetCatId))

      return matchSearch && matchCat
    })
  }, [products, activeSearch, selectedCategory, liveCategories])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredProducts, startIndex])

  // KPIs
  const totalProducts = products.length
  const inStockCount = products.filter(
    (p) => p.availability === 'In Stock' || p.availability === true
  ).length
  const outOfStockCount = totalProducts - inStockCount
  const categoryCount =
    Array.isArray(liveCategories) && liveCategories.length > 0
      ? liveCategories.length
      : categories.length - 1

  // KPI Modal list calculation
  const kpiModalProducts = useMemo(() => {
    if (!activeKpiModal || activeKpiModal === 'categories') return []
    let list = products
    if (activeKpiModal === 'inStock') {
      list = products.filter((p) => p.availability === 'In Stock' || p.availability === true)
    } else if (activeKpiModal === 'outOfStock') {
      list = products.filter((p) => p.availability !== 'In Stock' && p.availability !== true)
    }
    if (kpiModalSearch.trim()) {
      const q = kpiModalSearch.toLowerCase()
      list = list.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          getCategoryName(p.category).toLowerCase().includes(q)
      )
    }
    return list
  }, [products, activeKpiModal, kpiModalSearch])

  // Category breakdown calculation for KPI Categories Modal
  const categoryBreakdown = useMemo(() => {
    if (activeKpiModal !== 'categories') return []
    const map = {}
    products.forEach((p) => {
      const cat = getCategoryName(p.category) || 'GENERAL'
      if (!map[cat]) {
        map[cat] = { name: cat, count: 0, products: [] }
      }
      map[cat].count += 1
      if (map[cat].products.length < 5) {
        map[cat].products.push(p)
      }
    })
    let list = Object.values(map)
    if (kpiModalSearch.trim()) {
      const q = kpiModalSearch.toLowerCase()
      list = list.filter((c) => c.name.toLowerCase().includes(q))
    }
    return list
  }, [products, activeKpiModal, kpiModalSearch])

  // KPI Card Popup Pagination (5 items per page)
  const KPI_ITEMS_PER_PAGE = 5
  const [kpiCurrentPage, setKpiCurrentPage] = useState(1)

  // Reset KPI pagination to page 1 whenever activeKpiModal or search query changes
  useEffect(() => {
    setKpiCurrentPage(1)
  }, [activeKpiModal, kpiModalSearch])

  // Active dataset count and pagination indices for KPI popup
  const activeKpiTotalItems =
    activeKpiModal === 'categories' ? categoryBreakdown.length : kpiModalProducts.length
  const totalKpiPages = Math.max(1, Math.ceil(activeKpiTotalItems / KPI_ITEMS_PER_PAGE))
  const kpiStartIndex = (kpiCurrentPage - 1) * KPI_ITEMS_PER_PAGE
  const kpiEndIndex = Math.min(kpiStartIndex + KPI_ITEMS_PER_PAGE, activeKpiTotalItems)

  // Paginated 5 items per page for Products (Total / In Stock / Out of Stock)
  const paginatedKpiProducts = useMemo(() => {
    return kpiModalProducts.slice(kpiStartIndex, kpiStartIndex + KPI_ITEMS_PER_PAGE)
  }, [kpiModalProducts, kpiStartIndex])

  // Paginated 5 items per page for Categories
  const paginatedKpiCategories = useMemo(() => {
    return categoryBreakdown.slice(kpiStartIndex, kpiStartIndex + KPI_ITEMS_PER_PAGE)
  }, [categoryBreakdown, kpiStartIndex])

  // Open modal for new product
  const handleAddProduct = () => {
    setEditingProduct(null)
    setModalTab('general')
    setUploadedProductFileName('')
    setNewGalleryImageUrl('')
    let defaultCatId = ''
    if (selectedCategory && selectedCategory !== 'ALL') {
      const sCat = selectedCategory.trim().toUpperCase()
      const matched = Array.isArray(liveCategories)
        ? liveCategories.find(
            (c) =>
              (c.name || '').trim().toUpperCase() === sCat ||
              String(c._id).toLowerCase() === String(selectedCategory).toLowerCase()
          )
        : null
      if (matched) defaultCatId = matched._id
    }

    setFormState({
      name: '',
      category: defaultCatId,
      sku: '',
      weight: '',
      netWeight: '',
      minOrderQty: '50 Units',
      availability: 'In Stock',
      image: '',
      images: [],
      description: '',
      fullDescription: '',
      rating: 4.8,
      reviewsCount: 15,
      seoTitle: '',
      metaDescription: '',
      metaKeywords: ''
    })
    setIsModalOpen(true)
  }

  // Open modal for editing product
  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setModalTab('general')
    setUploadedProductFileName('')
    setNewGalleryImageUrl('')

    // Resolve matching Category ObjectId
    let selectedCatId = getCategoryId(product.category)
    if (!selectedCatId || !selectedCatId.match(/^[0-9a-fA-F]{24}$/)) {
      const catName = getCategoryName(product.category).toUpperCase().trim()
      const matched = Array.isArray(liveCategories)
        ? liveCategories.find((c) => (c.name || '').trim().toUpperCase() === catName)
        : null
      selectedCatId = matched?._id || (liveCategories[0]?._id || '')
    }

    // Resolve gallery images
    let initialImages = []
    if (Array.isArray(product.images) && product.images.length > 0) {
      initialImages = [...product.images]
    } else if (product.image) {
      initialImages = [product.image]
    }

    // Resolve full description / overview paragraphs
    let initialFullDesc = ''
    if (Array.isArray(product.fullDescription) && product.fullDescription.length > 0) {
      initialFullDesc = product.fullDescription.join('\n\n')
    } else if (typeof product.fullDescription === 'string' && product.fullDescription.trim()) {
      initialFullDesc = product.fullDescription
    } else if (product.description) {
      initialFullDesc = product.description
    }

    setFormState({
      name: product.name || '',
      category: selectedCatId,
      sku: product.sku || '',
      weight: product.weight || '100g',
      netWeight: product.netWeight || '100g / Pack',
      minOrderQty: product.minOrderQty || '50 Units',
      availability: product.availability || 'In Stock',
      image: product.image || initialImages[0] || '',
      images: initialImages,
      description: product.description || '',
      fullDescription: initialFullDesc,
      rating: product.rating || 4.5,
      reviewsCount: product.reviewsCount || 10,
      seoTitle: product.seoTitle || product.metaTitle || '',
      metaDescription: product.metaDescription || '',
      metaKeywords: product.metaKeywords || ''
    })
    setIsModalOpen(true)
  }

  // Quick toggle product stock status
  const handleToggleStock = async (product) => {
    const isCurrentlyInStock =
      product.availability === 'In Stock' || product.availability === true
    const newStatus = isCurrentlyInStock ? 'Out of Stock' : 'In Stock'
    const targetId = product._id || product.slug || product.sku || product.name || product.id

    try {
      await apiService.updateProduct(targetId, { availability: newStatus })
    } catch (err) {
      console.warn('Backend stock status update error:', err.message)
    }

    const updated = products.map((p) => {
      const isMatch =
        (product._id && p._id && p._id === product._id) ||
        (product.id !== undefined && p.id !== undefined && String(p.id) === String(product.id)) ||
        (product.slug && p.slug && p.slug === product.slug) ||
        (product.name && p.name && p.name === product.name)
      return isMatch ? { ...p, availability: newStatus } : p
    })

    setProducts(updated)
    broadcastProductUpdate(updated)
    showToast(`${product.name} marked as ${newStatus}`)
  }

  // Form Submit handler (Add/Edit in MongoDB)
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!formState.name || !formState.name.trim()) {
      setModalTab('general')
      showToast('Please enter Product Name', 'warning')
      setTimeout(() => {
        const el = document.getElementById('product-name-input')
        if (el) {
          el.focus()
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 50)
      return
    }

    let finalCategory = formState.category
    if (!finalCategory) {
      if (Array.isArray(liveCategories) && liveCategories.length > 0 && liveCategories[0]._id) {
        finalCategory = liveCategories[0]._id
        setFormState((prev) => ({ ...prev, category: finalCategory }))
      } else {
        setModalTab('general')
        showToast('Please select a Category', 'warning')
        setTimeout(() => {
          const el = document.getElementById('product-category-select')
          if (el) {
            el.focus()
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 50)
        return
      }
    }

    const finalImage = formState.image || (Array.isArray(formState.images) && formState.images[0]) || ''
    const finalImages = Array.isArray(formState.images) && formState.images.length > 0
      ? formState.images
      : (finalImage ? [finalImage] : [])

    setIsSavingProduct(true)
    try {
      const payload = {
        ...formState,
        category: finalCategory,
        image: finalImage,
        images: finalImages,
        weight: formState.weight || formState.netWeight || '100g',
        netWeight: formState.netWeight || formState.weight || '100g / Pack'
      }

      if (editingProduct) {
        // Update existing in MongoDB
        const targetId = editingProduct._id || editingProduct.slug || editingProduct.sku || editingProduct.name || editingProduct.id
        const res = await apiService.updateProduct(targetId, payload)
        const updatedProduct = (res && res.success && res.data) ? res.data : { ...editingProduct, ...payload }
        const updated = products.map((p) => {
          const isMatch =
            (editingProduct._id && p._id && p._id === editingProduct._id) ||
            (editingProduct.id !== undefined && p.id !== undefined && String(p.id) === String(editingProduct.id)) ||
            (editingProduct.slug && p.slug && p.slug === editingProduct.slug) ||
            (editingProduct.name && p.name && p.name.toLowerCase() === editingProduct.name.toLowerCase())

          return isMatch ? updatedProduct : p
        })
        setProducts(updated)
        try {
          localStorage.setItem('enquiry_admin_products', JSON.stringify(updated))
        } catch {}
        broadcastProductUpdate(updated)
        showToast('Product updated successfully!', 'success')
        setIsModalOpen(false)
      } else {
        // Create new in MongoDB
        const res = await apiService.createProduct(payload)
        const newProduct = (res && res.success && res.data)
          ? res.data
          : {
              ...payload,
              _id: `prod_${Date.now()}`,
              id: Date.now(),
              createdAt: new Date().toISOString()
            }
        const newProductsList = [newProduct, ...products]
        setProducts(newProductsList)
        try {
          localStorage.setItem('enquiry_admin_products', JSON.stringify(newProductsList))
        } catch {}
        broadcastProductUpdate(newProductsList)
        showToast('New product saved successfully!', 'success')
        setIsModalOpen(false)
      }
    } catch (err) {
      console.warn('MongoDB save error:', err.message)
      showToast(`Error: ${err.message}`, 'error')
    } finally {
      setIsSavingProduct(false)
    }
  }

  // Confirm delete handler with full multi-identifier support & storage sync
  const confirmDelete = async (productToDel) => {
    const target = productToDel || deleteTarget
    if (!target) return

    const targetMongoId = target._id
    const targetLocalId = target.id
    const targetName = target.name
    const targetSlug = target.slug
    const targetSku = target.sku

    // 1. Immediately close delete confirmation modal
    setDeleteTarget(null)

    const apiId =
      targetMongoId ||
      targetSlug ||
      targetSku ||
      (typeof targetLocalId === 'string' && targetLocalId.length >= 24 ? targetLocalId : null) ||
      targetName

    if (apiId) {
      try {
        const res = await apiService.deleteProduct(apiId)
        if (res && res.success) {
          const updated = products.filter((p) => {
            if (targetMongoId && p._id && String(p._id) === String(targetMongoId)) return false
            if (
              targetLocalId !== undefined &&
              targetLocalId !== null &&
              p.id !== undefined &&
              p.id !== null &&
              String(p.id) === String(targetLocalId)
            )
              return false
            if (targetSlug && p.slug && p.slug.toLowerCase() === targetSlug.toLowerCase()) return false
            if (targetSku && p.sku && p.sku.toLowerCase() === targetSku.toLowerCase()) return false
            if (
              p.name &&
              targetName &&
              p.name.trim().toLowerCase() === targetName.trim().toLowerCase()
            )
              return false
            return true
          })

          setProducts(updated)
          broadcastProductUpdate(updated)
          showToast(`"${targetName || 'Product'}" removed successfully!`, 'success')
        } else {
          showToast(res?.message || 'Failed to delete product', 'error')
        }
      } catch (err) {
        console.warn('MongoDB delete warning:', err.message)
        showToast(`Failed to delete product: ${err.message}`, 'error')
      }
    }
  }

  return (
    <div className="product-management-container">
      {/* KPI METRICS ROW */}
      <div className="kpi-grid">
        <div
          className="kpi-card clickable"
          onClick={() => {
            setKpiModalSearch('')
            setActiveKpiModal('total')
          }}
          title="Click to view total products list"
          style={{ cursor: 'pointer', position: 'relative' }}
        >
          <div className="kpi-icon-wrapper indigo">
            <FiPackage />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Total Products</span>
            <span className="kpi-value">{totalProducts}</span>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#6366F1',
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
            setActiveKpiModal('inStock')
          }}
          title="Click to view in-stock products"
          style={{ cursor: 'pointer', position: 'relative' }}
        >
          <div className="kpi-icon-wrapper emerald">
            <FiCheckCircle />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">In Stock Items</span>
            <span className="kpi-value">{inStockCount}</span>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#059669',
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: '#ECFDF5',
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
            setActiveKpiModal('outOfStock')
          }}
          title="Click to view out-of-stock products"
          style={{ cursor: 'pointer', position: 'relative' }}
        >
          <div className="kpi-icon-wrapper amber">
            <FiAlertTriangle />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Out of Stock</span>
            <span className="kpi-value">{outOfStockCount}</span>
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
              backgroundColor: '#FFFBEB',
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
            setActiveKpiModal('categories')
          }}
          title="Click to view categories breakdown"
          style={{ cursor: 'pointer', position: 'relative' }}
        >
          <div className="kpi-icon-wrapper blue">
            <FiLayers />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Categories</span>
            <span className="kpi-value">{categoryCount > 0 ? categoryCount : 1}</span>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#2563EB',
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: '#EFF6FF',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
          >
            <FiEye size={13} />
            <span>View</span>
          </div>
        </div>
      </div>

      {/* MAIN PRODUCTS TABLE CARD */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="card-title-group">
            <div className="card-title-icon-wrapper">
              <FiGrid className="card-title-icon" size={20} />
            </div>
            <div>
              <div className="card-title-row">
                <h2 className="card-title">Product Inventory & Catalogue</h2>
                <span className="live-count-badge">{totalProducts} Items</span>
              </div>
              <p className="card-subtitle">
                Real-time catalog management, stock monitoring, and item control.
              </p>
            </div>
          </div>
          <button className="btn-primary" onClick={handleAddProduct}>
            <FiPlus size={16} /> Add Product
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="table-filter-bar">
          <div className="table-search">
            <FiSearch className="table-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => handleCategoryFilterChange(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Active Category Filter Indicator Banner */}
        {selectedCategory !== 'ALL' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F0FDFA',
              border: '1px solid #99F6E4',
              borderRadius: '8px',
              padding: '8px 16px',
              margin: '0 20px 14px 20px',
              fontSize: '0.84rem',
              color: '#0F766E'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#CCFBF1',
                  color: '#0D9488',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.78rem'
                }}
              >
                <FiTag size={12} /> {selectedCategory}
              </span>
              <span>
                Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'product' : 'products'} for this category
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCategoryFilterChange('ALL')}
              style={{
                background: 'none',
                border: 'none',
                color: '#0D9488',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '6px'
              }}
            >
              <FiX size={14} /> Clear Category Filter
            </button>
          </div>
        )}

        {/* Products Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Product Details</th>
                <th style={{ width: '18%' }}>Category</th>
                <th style={{ width: '16%' }}>Weight / Pack</th>
                <th style={{ width: '16%' }}>Status</th>
                <th style={{ width: '20%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => {
                  const currentProdKey =
                    product._id || product.id || product.slug || product.name
                  const isInStock =
                    product.availability === 'In Stock' || product.availability === true
                  const isDeletingThis =
                    deleteTarget &&
                    ((deleteTarget._id && product._id && deleteTarget._id === product._id) ||
                      (deleteTarget.id !== undefined &&
                        product.id !== undefined &&
                        String(deleteTarget.id) === String(product.id)) ||
                      (deleteTarget.name &&
                        product.name &&
                        deleteTarget.name === product.name))

                  return (
                    <tr key={currentProdKey}>
                      <td>
                        <div
                          className="product-cell"
                          style={{ cursor: 'pointer' }}
                          title="Click to view full product details"
                          onClick={() => setSelectedProductDetail(product)}
                        >
                          <img
                            src={getFullImageUrl(product.image)}
                            alt={product.name}
                            className="product-thumb"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.style.opacity = '0.5'
                            }}
                          />
                          <div style={{ minWidth: 0, overflow: 'hidden' }}>
                            <div className="product-info-name" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
                              <FiGlobe size={12} color="#6366F1" style={{ opacity: 0.8, flexShrink: 0 }} />
                            </div>
                            <div className="product-info-sku">
                              {product.sku ||
                                (product.id
                                  ? `SKU-${product.id}`
                                  : product._id
                                  ? `SKU-${product._id.slice(-6).toUpperCase()}`
                                  : 'SKU-PRD')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-tag">{getCategoryName(product.category) || 'GENERAL'}</span>
                      </td>
                      <td>{product.netWeight || product.weight || '100g'}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleStock(product)}
                          className={`status-badge ${isInStock ? 'in-stock' : 'out-stock'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          title="Click to toggle availability"
                        >
                          {isInStock ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap', paddingRight: '6px' }}>
                        {isDeletingThis ? (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              gap: '4px',
                              backgroundColor: '#FEF2F2',
                              border: '1px solid #FECACA',
                              borderRadius: '6px',
                              padding: '2px 5px',
                              boxShadow: '0 2px 5px rgba(239, 68, 68, 0.08)'
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.72rem',
                                color: '#991B1B',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                            >
                              <FiAlertTriangle size={11} style={{ color: '#DC2626' }} />
                              Delete?
                            </span>
                            <button
                              type="button"
                              style={{
                                backgroundColor: '#DC2626',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '5px',
                                padding: '3px 7px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 1px 2px rgba(220, 38, 38, 0.25)',
                                transition: 'all 0.15s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#B91C1C')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#DC2626')}
                              onClick={() => confirmDelete(product)}
                            >
                              <FiTrash2 size={11} />
                              Delete
                            </button>
                            <button
                              type="button"
                              title="Cancel"
                              style={{
                                backgroundColor: '#FFFFFF',
                                color: '#475569',
                                border: '1px solid #CBD5E1',
                                borderRadius: '5px',
                                padding: '3px 7px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#F1F5F9'
                                e.currentTarget.style.borderColor = '#94A3B8'
                                e.currentTarget.style.color = '#0F172A'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFFFFF'
                                e.currentTarget.style.borderColor = '#CBD5E1'
                                e.currentTarget.style.color = '#475569'
                              }}
                              onClick={() => setDeleteTarget(null)}
                            >
                              <FiX size={12} style={{ strokeWidth: 2.5 }} />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              gap: '4px'
                            }}
                          >
                            <button
                              type="button"
                              className="btn-icon"
                              title="View Product Info"
                              onClick={() => setSelectedProductDetail(product)}
                            >
                              <FiEye size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon"
                              title="Edit Product"
                              onClick={() => handleEditProduct(product)}
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon delete"
                              title="Delete Product"
                              onClick={() => setDeleteTarget(product)}
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                    <p style={{ color: 'var(--admin-text-muted)', margin: 0 }}>
                      No products found matching your search filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Bar */}
        {filteredProducts.length > 0 && (
          <div className="admin-pagination-bar">
            <div className="pagination-info">
              Showing <span style={{ color: 'var(--admin-text-main)', fontWeight: 600 }}>{startIndex + 1}</span> to{' '}
              <span style={{ color: 'var(--admin-text-main)', fontWeight: 600 }}>{endIndex}</span> of{' '}
              <span style={{ color: 'var(--admin-text-main)', fontWeight: 600 }}>{filteredProducts.length}</span> products
            </div>

            <div className="pagination-controls">
              <button
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
                  className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                title="Next Page"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen &&
        createPortal(
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      backgroundColor: '#EEF2FF',
                      color: 'var(--admin-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FiPackage size={17} />
                  </div>
                  <div>
                    <h3 className="modal-title" style={{ margin: 0, fontSize: '1.02rem', lineHeight: 1.25 }}>
                      {editingProduct ? 'Edit Product Details' : 'Add New Product'}
                    </h3>
                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                      {editingProduct
                        ? (editingProduct.sku || editingProduct.category || 'Update product details')
                        : 'Complete product catalog details'}
                    </div>
                  </div>
                </div>
                <button className="btn-icon" onClick={() => setIsModalOpen(false)} aria-label="Close">
                  <FiX size={18} />
                </button>
              </div>

              {/* Modal Sub-navigation Tabs */}
              <div className="modal-tabs-bar">
                <button
                  type="button"
                  className={`modal-tab-btn ${modalTab === 'general' ? 'active' : ''}`}
                  onClick={() => setModalTab('general')}
                >
                  <FiPackage size={15} />
                  <span>Product Details</span>
                </button>
                <button
                  type="button"
                  className={`modal-tab-btn ${modalTab === 'seo' ? 'active' : ''}`}
                  onClick={() => setModalTab('seo')}
                >
                  <FiGlobe size={15} />
                  <span>Search & SEO</span>
                  {(formState.seoTitle || formState.metaDescription || formState.metaKeywords) && (
                    <span className="modal-tab-badge">Configured</span>
                  )}
                </button>
              </div>

              <form onSubmit={handleFormSubmit} noValidate>
                <div className="modal-body">
                  {modalTab === 'general' ? (
                    <>
                      <div className="form-group">
                        <label className="form-label">Product Name *</label>
                        <input
                          id="product-name-input"
                          type="text"
                          className="form-input"
                          value={formState.name}
                          onChange={(e) =>
                            setFormState({ ...formState, name: e.target.value })
                          }
                          placeholder="e.g. Pure Turmeric Powder"
                          required
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">
                            Category <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <select
                            id="product-category-select"
                            className="form-input"
                            required
                            value={formState.category}
                            onChange={(e) =>
                              setFormState({ ...formState, category: e.target.value })
                            }
                            style={{ fontSize: '0.88rem', padding: '9px 12px' }}
                          >
                            <option value="" disabled>Select a Category (e.g. Masala, Tofu)</option>
                            {Array.isArray(liveCategories) &&
                              liveCategories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                  {cat.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">SKU Code</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formState.sku}
                            onChange={(e) =>
                              setFormState({ ...formState, sku: e.target.value })
                            }
                            placeholder="e.g. SKU-PRD-101"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Net Weight / Pack</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formState.netWeight}
                            onChange={(e) =>
                              setFormState({ ...formState, netWeight: e.target.value })
                            }
                            placeholder="e.g. 100g / Pack"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Stock Availability</label>
                          <select
                            className="form-select"
                            value={formState.availability}
                            onChange={(e) =>
                              setFormState({ ...formState, availability: e.target.value })
                            }
                          >
                            <option value="In Stock">In Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                          </select>
                        </div>
                      </div>

                      {/* Dual Image Input Mode */}
                      <div className="form-group">
                        <label className="form-label">Product Display Image</label>

                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{
                              flex: 1,
                              justifyContent: 'center',
                              fontSize: '0.82rem',
                              padding: '8px 12px',
                              backgroundColor:
                                imageSourceType === 'upload' ? '#FFFFFF' : '#FAF6F0',
                              borderColor:
                                imageSourceType === 'upload' ? 'var(--admin-primary)' : 'var(--admin-card-border)',
                              color: imageSourceType === 'upload' ? 'var(--admin-primary)' : 'var(--admin-text-main)',
                              fontWeight: 700
                            }}
                            onClick={() => setImageSourceType('upload')}
                          >
                            <FiUploadCloud size={16} /> Upload Image File
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{
                              flex: 1,
                              justifyContent: 'center',
                              fontSize: '0.82rem',
                              padding: '8px 12px',
                              backgroundColor:
                                imageSourceType === 'url' ? '#FFFFFF' : '#FAF6F0',
                              borderColor:
                                imageSourceType === 'url' ? 'var(--admin-primary)' : 'var(--admin-card-border)',
                              color: imageSourceType === 'url' ? 'var(--admin-primary)' : 'var(--admin-text-main)',
                              fontWeight: 700
                            }}
                            onClick={() => setImageSourceType('url')}
                          >
                            <FiLink size={16} /> Paste Image Link URL
                          </button>
                        </div>

                        <input
                          id="product-file-input"
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleProductImageUpload}
                          onClick={(e) => { e.target.value = '' }}
                        />

                        {imageSourceType === 'upload' ? (
                          <div
                            style={{
                              border: formState.image ? '2px solid #10B981' : '2px dashed var(--admin-card-border)',
                              borderRadius: '10px',
                              padding: '12px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              backgroundColor: formState.image ? '#ECFDF5' : '#FAF6F0',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onClick={() => document.getElementById('product-file-input')?.click()}
                          >
                            {formState.image ? (
                              <>
                                <FiCheckCircle size={18} color="#10B981" />
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#059669' }}>
                                  Selected: {uploadedProductFileName || 'Image Loaded ✓'}
                                </div>
                                <span style={{ fontSize: '0.72rem', color: '#64748B', marginLeft: '6px' }}>(Click to change photo)</span>
                              </>
                            ) : (
                              <>
                                <FiUploadCloud size={18} color="var(--admin-primary)" />
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                                  {isUploadingImage ? 'Processing Image...' : 'Click to select image file from device (JPG, PNG, WEBP)'}
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <input
                            type="text"
                            className="form-input"
                            value={formState.image}
                            onChange={(e) => {
                              const val = e.target.value
                              setUploadedProductFileName('')
                              setFormState((prev) => {
                                const currentImgs = Array.isArray(prev.images) ? [...prev.images] : []
                                if (val && !currentImgs.includes(val)) {
                                  currentImgs.unshift(val)
                                }
                                return { ...prev, image: val, images: currentImgs }
                              })
                            }}
                            placeholder="e.g. https://example.com/product.jpg or /image.png"
                          />
                        )}

                        {/* Image Preview Box Below Input */}
                        {formState.image && (
                          <div
                            style={{
                              marginTop: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              padding: '8px 12px',
                              backgroundColor: '#FFFFFF',
                              border: '1.5px solid #10B981',
                              borderRadius: '8px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                              <img
                                src={getFullImageUrl(formState.image)}
                                alt="Uploaded Preview"
                                style={{
                                  width: '58px',
                                  height: '58px',
                                  objectFit: 'cover',
                                  borderRadius: '6px',
                                  border: '1px solid var(--admin-card-border)',
                                  flexShrink: 0
                                }}
                                onError={(e) => {
                                  e.target.onerror = null
                                  console.warn('Preview load error for:', formState.image)
                                }}
                              />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <FiCheckCircle size={14} /> Primary Display Image Ready ✓
                                </div>
                                <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {uploadedProductFileName || (formState.image.startsWith('data:') ? 'Local Image Preview' : formState.image)}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="btn-icon"
                              style={{ color: '#EF4444', flexShrink: 0 }}
                              title="Remove image"
                              onClick={(e) => {
                                e.stopPropagation()
                                setFormState((prev) => {
                                  const updatedImgs = (prev.images || []).filter((img) => img !== prev.image)
                                  return {
                                    ...prev,
                                    image: updatedImgs[0] || '',
                                    images: updatedImgs
                                  }
                                })
                                setUploadedProductFileName('')
                              }}
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Product Views / Multiple Images Gallery */}
                      <div
                        className="form-group"
                        style={{
                          backgroundColor: '#FAF6F0',
                          border: '1px solid var(--admin-card-border)',
                          borderRadius: '10px',
                          padding: '12px 14px',
                          marginTop: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FiImage size={15} color="var(--admin-primary)" />
                            <span>Product Views Gallery ({formState.images?.length || 0})</span>
                          </label>
                          <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                            Click a photo to make it Primary
                          </span>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)', margin: '0 0 10px 0', lineHeight: 1.35 }}>
                          Add multiple images or views of this product. These display as interactive thumbnails under <strong>PRODUCT VIEWS</strong> on the product details page.
                        </p>

                        {/* Controls to add images to gallery */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                          <input
                            id="gallery-files-input"
                            type="file"
                            accept="image/*"
                            multiple
                            style={{ display: 'none' }}
                            onChange={handleGalleryImageUpload}
                            onClick={(e) => { e.target.value = '' }}
                          />
                          <button
                            type="button"
                            className="btn-secondary"
                            disabled={isUploadingGallery}
                            style={{
                              fontSize: '0.80rem',
                              padding: '7px 12px',
                              backgroundColor: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              cursor: isUploadingGallery ? 'not-allowed' : 'pointer'
                            }}
                            onClick={() => document.getElementById('gallery-files-input')?.click()}
                          >
                            <FiUploadCloud size={14} color="var(--admin-primary)" />
                            <span>{isUploadingGallery ? 'Loading Images...' : 'Upload More Images'}</span>
                          </button>
                        </div>

                        {/* Gallery Thumbnails Grid */}
                        {Array.isArray(formState.images) && formState.images.length > 0 ? (
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                            {formState.images.map((imgUrl, idx) => {
                              const isPrimary = formState.image === imgUrl
                              return (
                                <div
                                  key={idx}
                                  style={{
                                    position: 'relative',
                                    width: '74px',
                                    height: '74px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: isPrimary ? '2px solid #10B981' : '1px solid var(--admin-card-border)',
                                    backgroundColor: '#FFFFFF',
                                    cursor: 'pointer',
                                    boxShadow: isPrimary ? '0 0 0 2px rgba(16, 185, 129, 0.25)' : 'none',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onClick={() => handleSetPrimaryImage(imgUrl)}
                                  title={isPrimary ? 'Current Main Image' : 'Click to set as Main Image'}
                                >
                                  <img
                                    src={getFullImageUrl(imgUrl)}
                                    alt={`Product view ${idx + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                      e.target.onerror = null
                                      console.warn('Gallery thumbnail load error for:', imgUrl)
                                    }}
                                  />
                                  {isPrimary && (
                                    <div
                                      style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        backgroundColor: '#10B981',
                                        color: '#FFFFFF',
                                        fontSize: '0.62rem',
                                        fontWeight: 800,
                                        textAlign: 'center',
                                        padding: '1px 0',
                                        letterSpacing: '0.5px'
                                      }}
                                    >
                                      PRIMARY
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRemoveGalleryImage(idx)
                                    }}
                                    style={{
                                      position: 'absolute',
                                      top: '3px',
                                      right: '3px',
                                      width: '18px',
                                      height: '18px',
                                      borderRadius: '50%',
                                      backgroundColor: 'rgba(0,0,0,0.65)',
                                      color: '#FFFFFF',
                                      border: 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      padding: 0
                                    }}
                                    title="Remove from gallery"
                                    aria-label="Remove image"
                                  >
                                    <FiX size={11} />
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                            No additional views added yet. Use upload or paste URL to add views.
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Short Description</label>
                        <textarea
                          rows={2}
                          className="form-textarea"
                          value={formState.description}
                          onChange={(e) =>
                            setFormState({ ...formState, description: e.target.value })
                          }
                          placeholder="e.g. Premium authentic spice crafted with 100% natural organic ingredients..."
                        />
                      </div>

                      {/* Product Overview & Theory (Seen in 3rd screenshot) */}
                      <div className="form-group" style={{ marginTop: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                backgroundColor: '#EEF2FF',
                                color: 'var(--admin-primary)',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                letterSpacing: '0.5px'
                              }}
                            >
                              PRODUCT OVERVIEW & THEORY
                            </span>
                            <span>About {formState.name ? formState.name : 'Product'}</span>
                          </label>
                          <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                            Separate paragraphs with blank lines
                          </span>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                          Detailed theory & sourcing overview displayed on the live product details page under <strong>About {formState.name || 'Product'}</strong>.
                        </p>
                        <textarea
                          rows={6}
                          className="form-textarea"
                          style={{ fontFamily: 'inherit', fontSize: '0.84rem', lineHeight: '1.5' }}
                          value={formState.fullDescription}
                          onChange={(e) =>
                            setFormState({ ...formState, fullDescription: e.target.value })
                          }
                          placeholder={`e.g. Our ${formState.name || 'product'} is carefully crafted and sourced directly from certified organic farms, adhering to strict food safety standards.\n\nProcessed in state-of-the-art facilities using low-temperature milling that preserves natural essential oils and nutrients.\n\nFree from synthetic colors, artificial preservatives, or chemical fillers. Ideal for home cooking and wholesale.`}
                        />
                      </div>

                      {/* Quick SEO Jump Card */}
                      <div
                        style={{
                          marginTop: '10px',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          backgroundColor: '#FAF6F0',
                          border: '1px solid var(--admin-card-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: '#FFFFFF',
                              border: '1px solid var(--admin-card-border)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--admin-primary)'
                            }}
                          >
                            <FiGlobe size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                              Search Engine Optimization (SEO)
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                              {formState.seoTitle
                                ? `Configured title: "${formState.seoTitle.substring(0, 32)}..."`
                                : 'Configure title, description & preview how it appears on Google.'}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
                          onClick={() => setModalTab('seo')}
                        >
                          Configure SEO →
                        </button>
                      </div>
                    </>
                  ) : (
                    /* SEO & SEARCH ENGINE CONFIGURATION VIEW */
                    <div className="seo-settings-wrap">
                      <div className="seo-card">
                        <div className="seo-card-header">
                          <div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--admin-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FiGlobe size={16} color="var(--admin-primary)" />
                              Search Engine Listing
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                              Customize how this product displays in search engine results and social shares.
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ fontSize: '0.76rem', padding: '6px 11px', whiteSpace: 'nowrap', gap: '5px' }}
                            onClick={async () => {
                              try {
                                if (formState.name) {
                                  const resolvedCatName = getCategoryName(
                                    liveCategories?.find((c) => c._id === formState.category)?.name || formState.category
                                  )
                                  const res = await apiService.generateProductSeo({
                                    name: formState.name,
                                    category: resolvedCatName,
                                    description: formState.description,
                                    weight: formState.weight || formState.netWeight
                                  })
                                  if (res && res.success && res.data) {
                                    setFormState((prev) => ({
                                      ...prev,
                                      seoTitle: res.data.seoTitle,
                                      metaDescription: res.data.metaDescription,
                                      metaKeywords: res.data.metaKeywords
                                    }))
                                    showToast('AI-powered SEO metadata generated from backend!')
                                    return
                                  }
                                }
                              } catch (err) {
                                // Fallback to local auto-generation
                              }

                              const autoTitle = formState.name ? `${formState.name} - Buy Online | Quick Enquiry` : ''
                              const autoDesc = formState.description || (formState.name ? `Order authentic ${formState.name}. Premium quality available for enquiry and bulk wholesale orders.` : '')
                              const autoKeywords = [
                                formState.category,
                                formState.name,
                                'wholesale',
                                'enquiry',
                                'authentic'
                              ].filter(Boolean).join(', ').toLowerCase()

                              setFormState((prev) => ({
                                ...prev,
                                seoTitle: prev.seoTitle || autoTitle,
                                metaDescription: prev.metaDescription || autoDesc,
                                metaKeywords: prev.metaKeywords || autoKeywords
                              }))
                              showToast('Auto-generated SEO metadata from product details!')
                            }}
                          >
                            <FiZap size={14} color="var(--admin-primary)" /> Auto-Fill from Info
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {/* 1. Page Title */}
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <div className="seo-field-header">
                              <label className="form-label" style={{ marginBottom: 0 }}>
                                Page Title
                              </label>
                              <div className="seo-char-meter">
                                <span>{(formState.seoTitle || '').length} / 60</span>
                                <span
                                  className={`seo-char-pill ${
                                    (formState.seoTitle || '').length === 0
                                      ? 'neutral'
                                      : (formState.seoTitle || '').length <= 60
                                      ? 'optimal'
                                      : 'warning'
                                  }`}
                                >
                                  {(formState.seoTitle || '').length === 0
                                    ? 'Recommended: 40-60'
                                    : (formState.seoTitle || '').length <= 60
                                    ? 'Good length'
                                    : 'May truncate'}
                                </span>
                              </div>
                            </div>
                            <input
                              type="text"
                              className="form-input"
                              value={formState.seoTitle || ''}
                              onChange={(e) => setFormState({ ...formState, seoTitle: e.target.value })}
                              placeholder="e.g. Pure Turmeric Powder - Premium Quality Wholesale"
                            />
                            <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                              The main headline displayed in Google search results.
                            </span>
                          </div>

                          {/* 2. Meta Description */}
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <div className="seo-field-header">
                              <label className="form-label" style={{ marginBottom: 0 }}>
                                Meta Description
                              </label>
                              <div className="seo-char-meter">
                                <span>{(formState.metaDescription || '').length} / 160</span>
                                <span
                                  className={`seo-char-pill ${
                                    (formState.metaDescription || '').length === 0
                                      ? 'neutral'
                                      : (formState.metaDescription || '').length <= 160
                                      ? 'optimal'
                                      : 'warning'
                                  }`}
                                >
                                  {(formState.metaDescription || '').length === 0
                                    ? 'Recommended: 120-160'
                                    : (formState.metaDescription || '').length <= 160
                                    ? 'Good length'
                                    : 'May truncate'}
                                </span>
                              </div>
                            </div>
                            <textarea
                              rows={3}
                              className="form-textarea"
                              style={{ resize: 'vertical' }}
                              value={formState.metaDescription || ''}
                              onChange={(e) => setFormState({ ...formState, metaDescription: e.target.value })}
                              placeholder="e.g. Order pure turmeric powder in sealed 100g packs. Freshly milled, 100% natural spices available for wholesale and bulk enquiry."
                            />
                            <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                              A brief, compelling summary to encourage searchers to click through.
                            </span>
                          </div>

                          {/* 3. Meta Keywords */}
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <div className="seo-field-header">
                              <label className="form-label" style={{ marginBottom: 0 }}>
                                Target Keywords
                              </label>
                              <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                                Comma-separated
                              </span>
                            </div>
                            <input
                              type="text"
                              className="form-input"
                              value={formState.metaKeywords || ''}
                              onChange={(e) => setFormState({ ...formState, metaKeywords: e.target.value })}
                              placeholder="e.g. spices, turmeric, 100g pack, wholesale"
                            />
                            {/* Interactive Keyword Chips */}
                            {formState.metaKeywords && (
                              <div className="seo-chips-wrap">
                                {formState.metaKeywords
                                  .split(',')
                                  .map((kw) => kw.trim())
                                  .filter(Boolean)
                                  .map((kw, idx) => (
                                    <span key={idx} className="seo-chip">
                                      #{kw}
                                      <button
                                        type="button"
                                        className="seo-chip-remove"
                                        onClick={() => {
                                          const currentList = formState.metaKeywords
                                            .split(',')
                                            .map((k) => k.trim())
                                            .filter(Boolean)
                                          const filtered = currentList.filter((_, i) => i !== idx).join(', ')
                                          setFormState({ ...formState, metaKeywords: filtered })
                                        }}
                                        title="Remove keyword"
                                      >
                                        <FiX size={12} />
                                      </button>
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Google Search Result Live Preview Card */}
                      <div className="serp-card">
                        <div className="serp-card-label">
                          <FiSearch size={13} /> Google Search Result (Live Preview)
                        </div>
                        <div className="serp-breadcrumb">
                          <span className="serp-favicon">G</span>
                          <span>
                            https://quick-enquiry.co › products › {formState.name ? formState.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'product-item'}
                          </span>
                        </div>
                        <div className="serp-title">
                          {formState.seoTitle || formState.name || 'Product Title — Quick Enquiry'}
                        </div>
                        <div className="serp-desc">
                          {formState.metaDescription || formState.description || 'Add an SEO meta description to preview how your product will be indexed and displayed across search engines.'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    {modalTab === 'seo' ? (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setModalTab('general')}
                        style={{ fontSize: '0.82rem' }}
                      >
                        <FiChevronLeft size={16} /> Back to Details
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setModalTab('seo')}
                        style={{ fontSize: '0.82rem' }}
                      >
                        Configure SEO <FiChevronRight size={16} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={isSavingProduct}
                      style={{
                        opacity: isSavingProduct ? 0.75 : 1,
                        cursor: isSavingProduct ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {isSavingProduct ? (
                        <>
                          <FiZap size={16} /> Saving Product...
                        </>
                      ) : (
                        <>
                          <FiCheck size={16} /> Save Product
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* KPI CARD DETAIL POPUP MODAL */}
      {activeKpiModal &&
        createPortal(
          <div
            className="modal-overlay"
            style={{
              zIndex: 10000,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
                maxWidth: '750px',
                width: '100%',
                maxHeight: '85vh',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
                border: '1px solid var(--admin-card-border)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
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
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    className={`kpi-icon-wrapper ${
                      activeKpiModal === 'total'
                        ? 'indigo'
                        : activeKpiModal === 'inStock'
                        ? 'emerald'
                        : activeKpiModal === 'outOfStock'
                        ? 'amber'
                        : 'blue'
                    }`}
                    style={{ width: '40px', height: '40px', fontSize: '1.2rem', borderRadius: '10px' }}
                  >
                    {activeKpiModal === 'total' && <FiPackage />}
                    {activeKpiModal === 'inStock' && <FiCheckCircle />}
                    {activeKpiModal === 'outOfStock' && <FiAlertTriangle />}
                    {activeKpiModal === 'categories' && <FiLayers />}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--admin-text-main)' }}>
                      {activeKpiModal === 'total' && `Total Products (${products.length})`}
                      {activeKpiModal === 'inStock' && `In Stock Items (${inStockCount})`}
                      {activeKpiModal === 'outOfStock' && `Out of Stock Items (${outOfStockCount})`}
                      {activeKpiModal === 'categories' && `Catalogue Categories (${categoryCount > 0 ? categoryCount : 1})`}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                      {activeKpiModal === 'total' && 'Detailed inspection of all catalogue items, SKU codes, and weights.'}
                      {activeKpiModal === 'inStock' && 'Products currently available and ready for customer orders.'}
                      {activeKpiModal === 'outOfStock' && 'Products currently out of stock requiring inventory reorder.'}
                      {activeKpiModal === 'categories' && 'Distribution of products across catalogue categories.'}
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
                        ? 'Search categories by name...'
                        : 'Search by product name, SKU or category...'
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

              {/* MODAL BODY CONTENT */}
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
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: '1px solid var(--admin-card-border)',
                          backgroundColor: '#FFFFFF',
                          marginBottom: '10px',
                          gap: '12px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--admin-text-main)' }}>
                              {cat.name}
                            </span>
                            <span style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                              {cat.count} {cat.count === 1 ? 'Product' : 'Products'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                            {cat.products.map((cp) => (
                              <span
                                key={cp._id || cp.id}
                                style={{
                                  fontSize: '0.72rem',
                                  color: '#64748B',
                                  backgroundColor: '#F8FAFC',
                                  border: '1px solid #E2E8F0',
                                  padding: '1px 6px',
                                  borderRadius: '4px'
                                }}
                              >
                                {cp.name}
                              </span>
                            ))}
                            {cat.count > cat.products.length && (
                              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                                +{cat.count - cat.products.length} more
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ fontSize: '0.76rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
                          onClick={() => {
                            setSelectedCategory(cat.name)
                            setActiveKpiModal(null)
                            showToast(`Filtered catalogue by ${cat.name}`)
                          }}
                        >
                          Filter in Table →
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B', fontSize: '0.85rem' }}>
                      No categories found matching "{kpiModalSearch}".
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
                            gap: '12px'
                          }}
                        >
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, cursor: 'pointer' }}
                            onClick={() => setSelectedProductDetail(p)}
                            title="Click to view full product information"
                          >
                            <img
                              src={getFullImageUrl(p.image)}
                              alt={p.name}
                              style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid #E2E8F0' }}
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.style.opacity = '0.5'
                              }}
                            />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--admin-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {p.name}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.72rem', backgroundColor: '#F1F5F9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                  {p.sku || `SKU-${p.id || 'PRD'}`}
                                </span>
                                <span style={{ fontSize: '0.72rem', color: '#6366F1', fontWeight: 600 }}>
                                  {p.category || 'GENERAL'}
                                </span>
                                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                                  {p.netWeight || p.weight || '100g'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={() => handleToggleStock(p)}
                              className={`status-badge ${isInStock ? 'in-stock' : 'out-stock'}`}
                              style={{ cursor: 'pointer', border: 'none', fontSize: '0.72rem', padding: '3px 8px' }}
                              title="Click to toggle stock"
                            >
                              {isInStock ? 'In Stock' : 'Out of Stock'}
                            </button>
                            <button
                              type="button"
                              className="btn-icon"
                              style={{ width: '30px', height: '30px' }}
                              title="View Details"
                              onClick={() => setSelectedProductDetail(p)}
                            >
                              <FiEye size={14} />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div style={{ textAlign: 'center', padding: '36px 16px' }}>
                      {activeKpiModal === 'outOfStock' ? (
                        <>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.4rem' }}>
                            <FiCheckCircle />
                          </div>
                          <h4 style={{ margin: '0 0 6px', color: '#065F46', fontSize: '1rem', fontWeight: 700 }}>All Products In Stock!</h4>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>Currently zero products are marked out of stock in your catalogue.</p>
                        </>
                      ) : (
                        <p style={{ color: '#64748B', fontSize: '0.85rem' }}>No products match your search query.</p>
                      )}
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
                      <strong style={{ color: 'var(--admin-text-main)' }}>{activeKpiTotalItems}</strong> items
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

      {/* FULL PRODUCT DETAIL POPUP MODAL */}
      {selectedProductDetail &&
        createPortal(
          <div
            className="modal-overlay"
            style={{
              zIndex: 10001,
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(4px)',
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
            onClick={() => setSelectedProductDetail(null)}
          >
            <div
              className="modal-content"
              style={{
                maxWidth: '560px',
                width: '100%',
                maxHeight: '90vh',
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
              {/* HEADER */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                    {getCategoryName(selectedProductDetail.category) || 'PURE SPICES'}
                  </span>
                  <span
                    className={`status-badge ${
                      selectedProductDetail.availability === 'In Stock' || selectedProductDetail.availability === true
                        ? 'in-stock'
                        : 'out-stock'
                    }`}
                    style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                  >
                    {selectedProductDetail.availability === 'In Stock' || selectedProductDetail.availability === true
                      ? 'In Stock'
                      : 'Out of Stock'}
                  </span>
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
                  onClick={() => setSelectedProductDetail(null)}
                >
                  <FiX size={16} />
                </button>
              </div>

              {/* BODY */}
              <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', marginBottom: '18px' }}>
                  <img
                    src={getFullImageUrl(selectedProductDetail.image)}
                    alt={selectedProductDetail.name}
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      border: '1px solid var(--admin-card-border)',
                      flexShrink: 0
                    }}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.style.opacity = '0.5'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text-main)' }}>
                      {selectedProductDetail.name}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '10px' }}>
                      SKU: <strong style={{ color: 'var(--admin-text-main)' }}>{selectedProductDetail.sku || (selectedProductDetail.id ? `SKU-${selectedProductDetail.id}` : 'SKU-PRD')}</strong>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: '#FAF6F0', border: '1px solid var(--admin-card-border)' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Weight / Pack</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                          {selectedProductDetail.netWeight || selectedProductDetail.weight || '100g'}
                        </div>
                      </div>
                      <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: '#FAF6F0', border: '1px solid var(--admin-card-border)' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Min Order Qty</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                          {selectedProductDetail.minOrderQty || '50 Units'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.84rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                    Description
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, backgroundColor: '#FAF6F0', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--admin-card-border)' }}>
                    {selectedProductDetail.description || 'No description provided for this product catalogue item.'}
                  </p>
                </div>

                {/* RATING & REVIEWS */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#FEF9C3', border: '1px solid #FEF08A' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiStar size={16} fill="#CA8A04" color="#CA8A04" />
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#854D0E' }}>
                      {selectedProductDetail.rating || 4.8} / 5.0
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#854D0E', fontWeight: 600 }}>
                    {selectedProductDetail.reviewsCount || 12} Verified Customer Reviews
                  </span>
                </div>

                {/* SEO TAGS & METADATA PREVIEW */}
                {(selectedProductDetail.seoTitle || selectedProductDetail.metaKeywords || selectedProductDetail.metaDescription) && (
                  <div style={{ marginTop: '14px', padding: '12px 14px', borderRadius: '10px', backgroundColor: '#FAF6F0', border: '1px solid var(--admin-card-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <FiGlobe size={15} color="var(--admin-primary)" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                        Search Engine Metadata (SEO)
                      </span>
                    </div>
                    {selectedProductDetail.seoTitle && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-main)', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--admin-text-muted)', fontWeight: 600 }}>Page Title:</span> {selectedProductDetail.seoTitle}
                      </div>
                    )}
                    {selectedProductDetail.metaKeywords && (
                      <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-main)', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--admin-text-muted)', fontWeight: 600 }}>Keywords:</span> {selectedProductDetail.metaKeywords}
                      </div>
                    )}
                    {selectedProductDetail.metaDescription && (
                      <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)', fontStyle: 'italic', marginTop: '4px', lineHeight: 1.4 }}>
                        "{selectedProductDetail.metaDescription}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#FAF6F0',
                  borderTop: '1px solid var(--admin-card-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                  onClick={() => {
                    handleToggleStock(selectedProductDetail)
                    setSelectedProductDetail((prev) => ({
                      ...prev,
                      availability: prev.availability === 'In Stock' || prev.availability === true ? 'Out of Stock' : 'In Stock'
                    }))
                  }}
                >
                  Toggle Stock Status
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                    onClick={() => {
                      handleEditProduct(selectedProductDetail)
                      setSelectedProductDetail(null)
                    }}
                  >
                    <FiEdit2 size={13} /> Edit Product
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                    onClick={() => setSelectedProductDetail(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

    </div>
  )
}

export default React.memo(ProductManagement)

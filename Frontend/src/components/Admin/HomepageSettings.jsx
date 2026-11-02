import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { apiService } from '../../api/apiService'
import defaultHeroImages from '../../HeroImage.json'
import beautyHeroImages from '../../BeautyHeroImage.json'
import defaultFaqData from '../../Faq.json'
import defaultWhyChoose from '../../WhyChoose.json'
import defaultReviews from '../../Review.json'
import { defaultPopularItems, defaultBeautyPopularItems } from '../Product/PopularProduct'
import {
  ShieldCheck,
  Sparkles,
  Heart,
  UserCheck,
  Handshake,
  Award as LucideAward,
  Truck,
  CheckCircle,
  ThumbsUp,
  Clock,
  Star as LucideStar,
  MessageSquareQuote
} from 'lucide-react'
import {
  FiSliders,
  FiPlus,
  FiList,
  FiGrid,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiEye,
  FiX,
  FiCheck,
  FiUploadCloud,
  FiLink,
  FiImage,
  FiCheckCircle,
  FiDroplet,
  FiType,
  FiTrash,
  FiCrop,
  FiScissors,
  FiHelpCircle,
  FiArrowUp,
  FiArrowDown,
  FiRotateCcw,
  FiChevronDown,
  FiChevronUp,
  FiUsers,
  FiAward,
  FiArrowRight,
  FiArrowLeft,
  FiShoppingBag,
  FiPackage,
  FiPlay
} from 'react-icons/fi'
import { FaCommentDots, FaWhatsapp, FaFilePdf } from 'react-icons/fa'

// Helper to parse CSS color names (e.g. 'red', 'blue', 'pink', 'lightgreen') or hex to valid 6-digit hex for <input type="color">
const parseCssColorToHex = (colorStr, fallback = '#ffffff') => {
  if (!colorStr) return fallback
  const str = colorStr.trim()
  if (/^#([0-9a-f]{3}){1,2}$/i.test(str)) {
    if (str.length === 4) {
      return '#' + str[1] + str[1] + str[2] + str[2] + str[3] + str[3]
    }
    return str
  }
  try {
    const ctx = document.createElement('canvas').getContext('2d')
    ctx.fillStyle = str
    const computed = ctx.fillStyle
    if (computed && computed.startsWith('#')) {
      return computed
    }
  } catch (err) {
    // fallback
  }
  return fallback
}

const COLOR_PRESET_OPTIONS = [
  { label: '-- Select Color Name --', value: '' },
  { label: 'Red', value: 'red' },
  { label: 'Blue', value: 'blue' },
  { label: 'Green', value: 'green' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Pink', value: 'pink' },
  { label: 'Purple', value: 'purple' },
  { label: 'Orange', value: 'orange' },
  { label: 'Black', value: 'black' },
  { label: 'White', value: 'white' },
  { label: 'Light Green', value: 'lightgreen' },
  { label: 'Sky Blue', value: 'skyblue' },
  { label: 'Dark Green', value: 'darkgreen' },
  { label: 'Navy', value: 'navy' },
  { label: 'Teal', value: 'teal' },
  { label: 'Maroon', value: 'maroon' },
  { label: 'Gold', value: 'gold' },
  { label: 'Cyan', value: 'cyan' },
  { label: 'Gray', value: 'gray' }
]

const WHY_CHOOSE_ICON_OPTIONS = [
  { label: 'Shield (Security / Protection)', value: 'ShieldCheck' },
  { label: 'Sparkles (Quality / Premium)', value: 'Sparkles' },
  { label: 'Heart (Best Prices / Care)', value: 'Heart' },
  { label: 'User Check (Support / Help Center)', value: 'UserCheck' },
  { label: 'Award (Certified Excellence)', value: 'Award' },
  { label: 'Truck (Fast Delivery)', value: 'Truck' },
  { label: 'Handshake (Trusted Partnership)', value: 'Handshake' },
  { label: 'Check Circle (Quality Guaranteed)', value: 'CheckCircle' },
  { label: 'Thumbs Up (Customer Satisfaction)', value: 'ThumbsUp' },
  { label: 'Clock (24/7 Availability)', value: 'Clock' }
]

const renderWhyChooseIcon = (iconName, size = 18, color = '#92400E') => {
  switch (iconName) {
    case 'ShieldCheck':
      return <ShieldCheck size={size} color={color} />
    case 'Sparkles':
      return <Sparkles size={size} color={color} />
    case 'Heart':
      return <Heart size={size} color={color} />
    case 'UserCheck':
      return <UserCheck size={size} color={color} />
    case 'Award':
      return <LucideAward size={size} color={color} />
    case 'Truck':
      return <Truck size={size} color={color} />
    case 'Handshake':
      return <Handshake size={size} color={color} />
    case 'CheckCircle':
      return <CheckCircle size={size} color={color} />
    case 'ThumbsUp':
      return <ThumbsUp size={size} color={color} />
    case 'Clock':
      return <Clock size={size} color={color} />
    default:
      return <ShieldCheck size={size} color={color} />
  }
}

const HomepageSettings = ({
  heroSlides,
  setHeroSlides,
  storeSettings,
  setStoreSettings,
  sectionVisibility,
  setSectionVisibility,
  faqs = [],
  setFaqs,
  whyChooseList = [],
  setWhyChooseList,
  reviewsList = [],
  setReviewsList,
  trustedByPartners = [],
  setTrustedByPartners,
  popularProducts = [],
  setPopularProducts,
  showToast
}) => {
  // Modal state for adding/editing a Hero Banner Slide
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState(null)
  const [imageSourceType, setImageSourceType] = useState('upload') // 'upload' | 'url'
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [deleteSlideId, setDeleteSlideId] = useState(null)
  const [bannerViewMode, setBannerViewMode] = useState('list') // 'list' | 'grid'

  // FAQ Management State
  const [faqMeta, setFaqMeta] = useState({
    subtitle: storeSettings.faqSubtitle || 'COMMON QUESTIONS',
    title: storeSettings.faqTitle || 'Frequently asked questions.',
    contactPrompt: storeSettings.faqContactPrompt || "Can't find what you're looking for?",
    contactBtnText: storeSettings.faqContactBtnText || 'Contact support'
  })
  const [faqModalOpen, setFaqModalOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState(null)
  const [faqForm, setFaqForm] = useState({ question: '', answer: '' })
  const [deleteFaqId, setDeleteFaqId] = useState(null)
  const [previewFaqOpenId, setPreviewFaqOpenId] = useState(null)

  // About Company Showcase State
  const isInitialBeauty = (storeSettings.activeHomepage || 'home1') === 'home2'
  const [aboutForm, setAboutForm] = useState({
    subtitle: isInitialBeauty
      ? (storeSettings.homeAboutSubtitleBeauty || '— WHO WE ARE')
      : (storeSettings.homeAboutSubtitle || '— WHO WE ARE'),
    title: isInitialBeauty
      ? (storeSettings.homeAboutTitleBeauty || 'About Our Beauty Care')
      : (storeSettings.homeAboutTitle || 'About Our Company'),
    desc1: isInitialBeauty
      ? (storeSettings.homeAboutDesc1Beauty ||
         'Established in 2012, we are dedicated to crafting dermatologically-tested, organic, and cruelty-free skincare, haircare, and cosmetic solutions. Our commitment to pure ingredients, innovative formulations, and radiant skin health has made us a trusted beauty choice for thousands.')
      : (storeSettings.homeAboutDesc1 ||
         'Established in 2012, we have grown from a small local business into a trusted national brand. Our commitment to quality, innovation, and customer satisfaction has made us the preferred choice for thousands of customers across the country.'),
    desc2: isInitialBeauty
      ? (storeSettings.homeAboutDesc2Beauty ||
         'Every serum, hydrating gel, and botanical elixir in our collection is carefully formulated with clean, active ingredients to nourish your skin, enhance natural glow, and elevate your daily self-care ritual.')
      : (storeSettings.homeAboutDesc2 ||
         'Every product in our catalogue is carefully selected and quality-checked to ensure it meets our high standards. We believe that great products and great service go hand in hand.'),
    image: isInitialBeauty
      ? (storeSettings.homeAboutImageBeauty || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80')
      : (storeSettings.homeAboutImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'),
    b1Num: isInitialBeauty
      ? (storeSettings.homeAboutBadge1NumberBeauty || '12+')
      : (storeSettings.homeAboutBadge1Number || '12+'),
    b1Lbl: isInitialBeauty
      ? (storeSettings.homeAboutBadge1LabelBeauty || 'YEARS IN BEAUTY')
      : (storeSettings.homeAboutBadge1Label || 'YEARS ESTABLISHED'),
    b2Num: isInitialBeauty
      ? (storeSettings.homeAboutBadge2NumberBeauty || '100%')
      : (storeSettings.homeAboutBadge2Number || '35+'),
    b2Lbl: isInitialBeauty
      ? (storeSettings.homeAboutBadge2LabelBeauty || 'CRUELTY FREE & VEGAN')
      : (storeSettings.homeAboutBadge2Label || 'TEAM MEMBERS'),
    btnText: isInitialBeauty
      ? (storeSettings.homeAboutBtnTextBeauty || 'About More')
      : (storeSettings.homeAboutBtnText || 'About More'),
    btnLink: isInitialBeauty
      ? (storeSettings.homeAboutBtnLinkBeauty || '/about-company')
      : (storeSettings.homeAboutBtnLink || '/about-company')
  })
  const [aboutImageSourceType, setAboutImageSourceType] = useState('upload') // 'upload' | 'url'

  // Why Choose Us Management State
  const [whyChooseMeta, setWhyChooseMeta] = useState({
    tag: storeSettings.whyChooseTag || '• WHY CHOOSE US •',
    title: storeSettings.whyChooseTitle || 'Why Choose Us',
    subtitle:
      storeSettings.whyChooseSubtitle ||
      'Our Commitment to Quality, Purity & Customer Satisfaction'
  })
  const [whyChooseModalOpen, setWhyChooseModalOpen] = useState(false)
  const [editingWhyChooseItem, setEditingWhyChooseItem] = useState(null)
  const [whyChooseForm, setWhyChooseForm] = useState({
    title: '',
    description: '',
    icon: 'ShieldCheck'
  })
  const [deleteWhyChooseId, setDeleteWhyChooseId] = useState(null)

  // Customer Reviews Management State
  const [reviewMeta, setReviewMeta] = useState({
    tag: storeSettings.reviewTag || '— CUSTOMER LOVE',
    title: storeSettings.reviewTitle || 'What They Say About Us'
  })
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [reviewForm, setReviewForm] = useState({
    name: '',
    category: 'TRUST & QUALITY',
    rating: 5,
    review: '',
    verified: 'Verified Buyer',
    location: '',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'
  })
  const [reviewImageSourceType, setReviewImageSourceType] = useState('upload') // 'upload' | 'url'
  const [deleteReviewId, setDeleteReviewId] = useState(null)

  // Trusted By Partners State
  const [trustedByLabel, setTrustedByLabel] = useState(
    storeSettings.trustedByLabel || 'TRUSTED BY'
  )
  const [newPartnerInput, setNewPartnerInput] = useState('')

  // Popular Products Coverflow Carousel State
  const [popularMeta, setPopularMeta] = useState({
    subtitle: isInitialBeauty
      ? (storeSettings.popularProductsSubtitleBeauty || '— MOST LOVED BEAUTY')
      : (storeSettings.popularProductsSubtitle || '— TRENDING NOW'),
    titleMain: isInitialBeauty
      ? (storeSettings.popularProductsTitleMainBeauty !== undefined ? storeSettings.popularProductsTitleMainBeauty : 'Popular')
      : (storeSettings.popularProductsTitleMain !== undefined ? storeSettings.popularProductsTitleMain : 'Popular'),
    titleHighlight: isInitialBeauty
      ? (storeSettings.popularProductsTitleHighlightBeauty !== undefined ? storeSettings.popularProductsTitleHighlightBeauty : 'Products')
      : (storeSettings.popularProductsTitleHighlight !== undefined ? storeSettings.popularProductsTitleHighlight : 'Products'),
    desc: isInitialBeauty
      ? (storeSettings.popularProductsDescBeauty || 'Explore our most-loved skincare, haircare, and beauty essentials, trusted by thousands of glowing customers.')
      : (storeSettings.popularProductsDesc || 'Explore our most-loved items, trusted by thousands of happy customers across the country.'),
    browseText: isInitialBeauty
      ? (storeSettings.popularProductsBrowseTextBeauty || 'Browse Beauty Collection')
      : (storeSettings.popularProductsBrowseText || 'Browse All Products'),
    browseLink: isInitialBeauty
      ? (storeSettings.popularProductsBrowseLinkBeauty || '/product')
      : (storeSettings.popularProductsBrowseLink || '/product'),
    autoPlay: storeSettings.popularProductsAutoPlay !== false,
    interval: Number(storeSettings.popularProductsInterval) || 3,
    showEnquire: storeSettings.popularProductsShowEnquire !== false,
    showBulk: storeSettings.popularProductsShowBulk !== false,
    showPdf: storeSettings.popularProductsShowPdf !== false
  })
  const [popularModalOpen, setPopularModalOpen] = useState(false)
  const [editingPopularItem, setEditingPopularItem] = useState(null)
  const [popularForm, setPopularForm] = useState({
    name: '',
    category: 'MIX MASALA',
    image: '',
    slug: '',
    pdfUrl: '',
    whatsappNumber: ''
  })
  const [popularImageSourceType, setPopularImageSourceType] = useState('upload')
  const [deletePopularId, setDeletePopularId] = useState(null)
  const [popularPreviewIndex, setPopularPreviewIndex] = useState(0)

  // Simple Logo Draft State (Changes only apply when Save Changes is clicked)
  const [logoTextDraft, setLogoTextDraft] = useState(storeSettings.logoText || 'QuickEnquiry')
  const [logoUrlDraft, setLogoUrlDraft] = useState(storeSettings.logoUrl || '')

  // Easy Mouse Selection Box Cropper State
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 })
  const [activeDrag, setActiveDrag] = useState(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialBox, setInitialBox] = useState({ x: 10, y: 10, width: 80, height: 80 })
  const cropContainerRef = React.useRef(null)

  const handleStartDrag = (handleType, e) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveDrag(handleType)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    setDragStart({ x: clientX, y: clientY })
    setInitialBox({ ...cropBox })
  }

  const handleDragMove = (e) => {
    if (!activeDrag || !cropContainerRef.current) return
    const rect = cropContainerRef.current.getBoundingClientRect()
    if (!rect.width || !rect.height) return

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const dx = ((clientX - dragStart.x) / rect.width) * 100
    const dy = ((clientY - dragStart.y) / rect.height) * 100

    setCropBox(() => {
      let { x, y, width, height } = initialBox

      if (activeDrag === 'move') {
        x = Math.max(0, Math.min(100 - width, initialBox.x + dx))
        y = Math.max(0, Math.min(100 - height, initialBox.y + dy))
      } else if (activeDrag === 'br') {
        width = Math.max(10, Math.min(100 - initialBox.x, initialBox.width + dx))
        height = Math.max(10, Math.min(100 - initialBox.y, initialBox.height + dy))
      } else if (activeDrag === 'tl') {
        const newX = Math.max(0, Math.min(initialBox.x + initialBox.width - 10, initialBox.x + dx))
        const newY = Math.max(0, Math.min(initialBox.y + initialBox.height - 10, initialBox.y + dy))
        width = initialBox.width + (initialBox.x - newX)
        height = initialBox.height + (initialBox.y - newY)
        x = newX
        y = newY
      } else if (activeDrag === 'tr') {
        const newY = Math.max(0, Math.min(initialBox.y + initialBox.height - 10, initialBox.y + dy))
        width = Math.max(10, Math.min(100 - initialBox.x, initialBox.width + dx))
        height = initialBox.height + (initialBox.y - newY)
        y = newY
      } else if (activeDrag === 'bl') {
        const newX = Math.max(0, Math.min(initialBox.x + initialBox.width - 10, initialBox.x + dx))
        width = initialBox.width + (initialBox.x - newX)
        height = Math.max(10, Math.min(100 - initialBox.y, initialBox.height + dy))
        x = newX
      }

      return { x, y, width, height }
    })
  }

  const handleEndDrag = () => {
    setActiveDrag(null)
  }

  // Apply Crop Function using Mouse Box coordinates
  const handleApplyCrop = () => {
    if (!logoUrlDraft) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const sx = (cropBox.x / 100) * img.naturalWidth
      const sy = (cropBox.y / 100) * img.naturalHeight
      const sw = (cropBox.width / 100) * img.naturalWidth
      const sh = (cropBox.height / 100) * img.naturalHeight

      const canvas = document.createElement('canvas')
      canvas.width = Math.max(10, Math.round(sw))
      canvas.height = Math.max(10, Math.round(sh))
      const ctx = canvas.getContext('2d')

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
      const croppedDataUrl = canvas.toDataURL('image/png')

      setLogoUrlDraft(croppedDataUrl)
      setCropModalOpen(false)
      showToast('Image cropped successfully!')
    }
    img.src = logoUrlDraft
  }

  const [slideForm, setSlideForm] = useState({
    title: '',
    subtitle: '',
    url: ''
  })

  // Handle logo file selection (draft state update only)
  const handleLogoFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file for logo', 'warning')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setLogoUrlDraft(reader.result)
      showToast(`Selected logo image: ${file.name}`)
    }
    reader.readAsDataURL(file)
  }

  // Save Logo Changes handler (applies changes to storeSettings and localStorage)
  const handleSaveLogo = () => {
    const updated = {
      ...storeSettings,
      logoText: logoTextDraft,
      logoUrl: logoUrlDraft
    }
    setStoreSettings(updated)
    localStorage.setItem('enquiry_admin_store_settings', JSON.stringify(updated))
    window.dispatchEvent(new Event('storage'))
    showToast('Logo changes saved successfully!')
  }

  // Save Theme & Colors handler
  const handleSaveThemeColors = () => {
    localStorage.setItem('enquiry_admin_store_settings', JSON.stringify(storeSettings))
    window.dispatchEvent(new Event('storage'))
    showToast('Header Theme & Colors saved successfully!')
  }

  // Handle local image file upload conversion to DataURL
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'warning')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setSlideForm((prev) => ({ ...prev, url: reader.result }))
      setUploadedFileName(file.name)
      showToast(`Uploaded ${file.name} successfully!`)
    }
    reader.readAsDataURL(file)
  }

  // Open modal for new slide
  const handleAddSlideClick = () => {
    setEditingSlide(null)
    setSlideForm({ title: '', subtitle: '', url: '' })
    setModalOpen(true)
  }

  // Open modal for editing slide
  const handleEditSlideClick = (slide) => {
    setEditingSlide(slide)
    setSlideForm({
      title: slide.title,
      subtitle: slide.subtitle,
      url: slide.url
    })
    setModalOpen(true)
  }

  // Save slide form submit
  const handleSlideFormSubmit = (e) => {
    e.preventDefault()
    if (!slideForm.title || !slideForm.url) {
      showToast('Please fill in Slide Title and Image URL', 'warning')
      return
    }

    if (editingSlide) {
      // Edit existing
      const updated = heroSlides.map((item) =>
        item.id === editingSlide.id ? { ...item, ...slideForm } : item
      )
      setHeroSlides(updated)
      showToast('Hero banner updated successfully!')
    } else {
      // Create new
      const newSlide = {
        id: Date.now(),
        ...slideForm
      }
      setHeroSlides([...heroSlides, newSlide])
      showToast('New hero banner slide added!')
    }
    setModalOpen(false)
  }

  // Delete slide
  const handleDeleteSlide = (id) => {
    if (heroSlides.length <= 1) {
      showToast('You must keep at least one Hero Slide!', 'warning')
      setDeleteSlideId(null)
      return
    }
    const filtered = heroSlides.filter((slide) => slide.id !== id)
    setHeroSlides(filtered)
    setDeleteSlideId(null)
    showToast('Hero slide deleted!')
  }

  // Store settings handler
  const handleStoreSettingsChange = (e) => {
    const { name, value } = e.target
    setStoreSettings((prev) => ({ ...prev, [name]: value }))
  }

  // Section toggle handler
  const handleToggleSection = (key) => {
    setSectionVisibility((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // FAQ Handlers
  const handleAddFaqClick = () => {
    setEditingFaq(null)
    setFaqForm({ question: '', answer: '' })
    setFaqModalOpen(true)
  }

  const handleEditFaqClick = (faq) => {
    setEditingFaq(faq)
    setFaqForm({ question: faq.question, answer: faq.answer })
    setFaqModalOpen(true)
  }

  const handleFaqFormSubmit = (e) => {
    e.preventDefault()
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      showToast('Please fill in both Question and Answer', 'warning')
      return
    }

    if (editingFaq) {
      const updated = faqs.map((item) =>
        item.id === editingFaq.id
          ? { ...item, question: faqForm.question.trim(), answer: faqForm.answer.trim() }
          : item
      )
      setFaqs(updated)
      showToast('FAQ question updated successfully!')
    } else {
      const newFaq = {
        id: Date.now(),
        question: faqForm.question.trim(),
        answer: faqForm.answer.trim()
      }
      setFaqs([...faqs, newFaq])
      showToast('New FAQ item added!')
    }
    setFaqModalOpen(false)
  }

  const handleDeleteFaq = (id) => {
    if (faqs.length <= 1) {
      showToast('You must keep at least one FAQ item!', 'warning')
      setDeleteFaqId(null)
      return
    }
    const filtered = faqs.filter((item) => item.id !== id)
    setFaqs(filtered)
    setDeleteFaqId(null)
    showToast('FAQ item deleted!')
  }

  const handleMoveFaq = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= faqs.length) return
    const updated = [...faqs]
    const [moved] = updated.splice(index, 1)
    updated.splice(targetIndex, 0, moved)
    setFaqs(updated)
  }

  const handleResetFaqs = () => {
    if (window.confirm('Reset FAQ items and headings to original default values?')) {
      setFaqs(defaultFaqData)
      setFaqMeta({
        subtitle: 'COMMON QUESTIONS',
        title: 'Frequently asked questions.',
        contactPrompt: "Can't find what you're looking for?",
        contactBtnText: 'Contact support'
      })
      showToast('FAQ settings reset to default values!')
    }
  }

  const handleSaveFaqSettings = () => {
    try {
      const updatedSettings = {
        ...storeSettings,
        faqSubtitle: faqMeta.subtitle,
        faqTitle: faqMeta.title,
        faqContactPrompt: faqMeta.contactPrompt,
        faqContactBtnText: faqMeta.contactBtnText,
        faqs: faqs
      }
      setStoreSettings(updatedSettings)
      localStorage.setItem('enquiry_admin_store_settings', JSON.stringify(updatedSettings))
      localStorage.setItem('enquiry_admin_faqs', JSON.stringify(faqs))
      apiService.updateSettings(updatedSettings)
      window.dispatchEvent(new Event('storage'))
      showToast('FAQ settings and questions saved successfully!')
    } catch (err) {
      showToast('Failed to save FAQ settings', 'warning')
    }
  }

  // About Company Showcase Handlers
  const handleAboutImageFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'warning')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setAboutForm((prev) => ({ ...prev, image: reader.result }))
      showToast(`Selected showcase image: ${file.name}`)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveAboutSection = () => {
    try {
      const isBeautyActive = (storeSettings.activeHomepage || 'home1') === 'home2'
      const updatedSettings = isBeautyActive
        ? {
            ...storeSettings,
            homeAboutSubtitleBeauty: aboutForm.subtitle,
            homeAboutTitleBeauty: aboutForm.title,
            homeAboutDesc1Beauty: aboutForm.desc1,
            homeAboutDesc2Beauty: aboutForm.desc2,
            homeAboutImageBeauty: aboutForm.image,
            homeAboutBadge1NumberBeauty: aboutForm.b1Num,
            homeAboutBadge1LabelBeauty: aboutForm.b1Lbl,
            homeAboutBadge2NumberBeauty: aboutForm.b2Num,
            homeAboutBadge2LabelBeauty: aboutForm.b2Lbl,
            homeAboutBtnTextBeauty: aboutForm.btnText,
            homeAboutBtnLinkBeauty: aboutForm.btnLink
          }
        : {
            ...storeSettings,
            homeAboutSubtitle: aboutForm.subtitle,
            homeAboutTitle: aboutForm.title,
            homeAboutDesc1: aboutForm.desc1,
            homeAboutDesc2: aboutForm.desc2,
            homeAboutImage: aboutForm.image,
            homeAboutBadge1Number: aboutForm.b1Num,
            homeAboutBadge1Label: aboutForm.b1Lbl,
            homeAboutBadge2Number: aboutForm.b2Num,
            homeAboutBadge2Label: aboutForm.b2Lbl,
            homeAboutBtnText: aboutForm.btnText,
            homeAboutBtnLink: aboutForm.btnLink
          }
      setStoreSettings(updatedSettings)
      localStorage.setItem('enquiry_admin_store_settings', JSON.stringify(updatedSettings))
      apiService.updateSettings(updatedSettings)
      window.dispatchEvent(new Event('storage'))
      showToast(`About ${isBeautyActive ? 'Beauty' : 'Company'} showcase saved successfully!`)
    } catch (err) {
      showToast('Failed to save About Company showcase', 'warning')
    }
  }

  const handleResetAboutDefaults = () => {
    const isBeautyActive = (storeSettings.activeHomepage || 'home1') === 'home2'
    if (window.confirm(`Reset About ${isBeautyActive ? 'Beauty' : 'Company'} showcase to default values?`)) {
      const defaults = isBeautyActive
        ? {
            subtitle: '— WHO WE ARE',
            title: 'About Our Beauty Care',
            desc1:
              'Established in 2012, we are dedicated to crafting dermatologically-tested, organic, and cruelty-free skincare, haircare, and cosmetic solutions. Our commitment to pure ingredients, innovative formulations, and radiant skin health has made us a trusted beauty choice for thousands.',
            desc2:
              'Every serum, hydrating gel, and botanical elixir in our collection is carefully formulated with clean, active ingredients to nourish your skin, enhance natural glow, and elevate your daily self-care ritual.',
            image:
              'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
            b1Num: '12+',
            b1Lbl: 'YEARS IN BEAUTY',
            b2Num: '100%',
            b2Lbl: 'CRUELTY FREE & VEGAN',
            btnText: 'About More',
            btnLink: '/about-company'
          }
        : {
            subtitle: '— WHO WE ARE',
            title: 'About Our Company',
            desc1:
              'Established in 2012, we have grown from a small local business into a trusted national brand. Our commitment to quality, innovation, and customer satisfaction has made us the preferred choice for thousands of customers across the country.',
            desc2:
              'Every product in our catalogue is carefully selected and quality-checked to ensure it meets our high standards. We believe that great products and great service go hand in hand.',
            image:
              'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
            b1Num: '12+',
            b1Lbl: 'YEARS ESTABLISHED',
            b2Num: '35+',
            b2Lbl: 'TEAM MEMBERS',
            btnText: 'About More',
            btnLink: '/about-company'
          }
      setAboutForm(defaults)
      showToast(`Reset About ${isBeautyActive ? 'Beauty' : 'Company'} showcase to defaults!`)
    }
  }

  // Why Choose Us Section Handlers
  const handleAddWhyChooseClick = () => {
    setEditingWhyChooseItem(null)
    setWhyChooseForm({
      title: '',
      description: '',
      icon: 'ShieldCheck'
    })
    setWhyChooseModalOpen(true)
  }

  const handleEditWhyChooseClick = (item) => {
    setEditingWhyChooseItem(item)
    setWhyChooseForm({
      title: item.title,
      description: item.description,
      icon: item.icon || 'ShieldCheck'
    })
    setWhyChooseModalOpen(true)
  }

  const handleWhyChooseFormSubmit = (e) => {
    e.preventDefault()
    if (!whyChooseForm.title.trim() || !whyChooseForm.description.trim()) {
      showToast('Please fill in Title and Description', 'warning')
      return
    }

    if (editingWhyChooseItem) {
      const updated = whyChooseList.map((item) =>
        item.id === editingWhyChooseItem.id
          ? {
              ...item,
              title: whyChooseForm.title.trim(),
              description: whyChooseForm.description.trim(),
              icon: whyChooseForm.icon
            }
          : item
      )
      setWhyChooseList(updated)
      showToast('Why Choose Us item updated successfully!')
    } else {
      const newItem = {
        id: Date.now(),
        title: whyChooseForm.title.trim(),
        description: whyChooseForm.description.trim(),
        icon: whyChooseForm.icon
      }
      setWhyChooseList([...whyChooseList, newItem])
      showToast('New Why Choose Us item added!')
    }
    setWhyChooseModalOpen(false)
  }

  const handleDeleteWhyChooseItem = (id) => {
    if (whyChooseList.length <= 1) {
      showToast('You must keep at least one Why Choose Us item!', 'warning')
      setDeleteWhyChooseId(null)
      return
    }
    const filtered = whyChooseList.filter((item) => item.id !== id)
    setWhyChooseList(filtered)
    setDeleteWhyChooseId(null)
    showToast('Why Choose Us item deleted!')
  }

  const handleResetWhyChooseDefaults = () => {
    if (window.confirm('Reset Why Choose Us section to default values?')) {
      setWhyChooseList(defaultWhyChoose)
      setWhyChooseMeta({
        tag: '• WHY CHOOSE US •',
        title: 'Why Choose Us',
        subtitle: 'Our Commitment to Quality, Purity & Customer Satisfaction'
      })
      showToast('Reset Why Choose Us to defaults!')
    }
  }

  const handleSaveWhyChooseSettings = () => {
    try {
      const updatedSettings = {
        ...storeSettings,
        whyChooseTag: whyChooseMeta.tag,
        whyChooseTitle: whyChooseMeta.title,
        whyChooseSubtitle: whyChooseMeta.subtitle,
        whyChooseFeatures: whyChooseList
      }
      setStoreSettings(updatedSettings)
      localStorage.setItem('enquiry_admin_store_settings', JSON.stringify(updatedSettings))
      localStorage.setItem('enquiry_admin_why_choose', JSON.stringify(whyChooseList))
      apiService.updateSettings(updatedSettings)
      window.dispatchEvent(new Event('storage'))
      showToast('Why Choose Us settings saved successfully!')
    } catch (err) {
      showToast('Failed to save Why Choose Us settings', 'warning')
    }
  }

  // Customer Reviews Handlers
  const handleAddReviewClick = () => {
    setEditingReview(null)
    setReviewForm({
      name: '',
      category: 'TRUST & QUALITY',
      rating: 5,
      review: '',
      verified: 'Verified Buyer',
      location: '',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'
    })
    setReviewImageSourceType('upload')
    setReviewModalOpen(true)
  }

  const handleEditReviewClick = (item) => {
    setEditingReview(item)
    setReviewForm({
      name: item.name || '',
      category: item.category || 'TRUST & QUALITY',
      rating: item.rating || 5,
      review: item.review || '',
      verified: item.verified || 'Verified Buyer',
      location: item.location || '',
      image: item.image || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'
    })
    setReviewImageSourceType(item.image && item.image.startsWith('data:') ? 'upload' : 'url')
    setReviewModalOpen(true)
  }

  const handleReviewAvatarFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'warning')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setReviewForm((prev) => ({ ...prev, image: reader.result }))
      showToast(`Selected reviewer avatar: ${file.name}`)
    }
    reader.readAsDataURL(file)
  }

  const handleReviewFormSubmit = (e) => {
    e.preventDefault()
    if (!reviewForm.name.trim() || !reviewForm.review.trim()) {
      showToast('Please enter Reviewer Name and Testimonial Quote', 'warning')
      return
    }

    if (editingReview) {
      const updated = reviewsList.map((item) =>
        item.id === editingReview.id
          ? {
              ...item,
              name: reviewForm.name.trim(),
              category: reviewForm.category.trim() || 'TRUST & QUALITY',
              rating: Number(reviewForm.rating) || 5,
              review: reviewForm.review.trim(),
              verified: reviewForm.verified.trim() || 'Verified Buyer',
              location: reviewForm.location.trim() || 'Customer',
              image: reviewForm.image
            }
          : item
      )
      setReviewsList(updated)
      showToast('Customer review updated successfully!')
    } else {
      const newItem = {
        id: Date.now(),
        name: reviewForm.name.trim(),
        category: reviewForm.category.trim() || 'TRUST & QUALITY',
        rating: Number(reviewForm.rating) || 5,
        review: reviewForm.review.trim(),
        verified: reviewForm.verified.trim() || 'Verified Buyer',
        location: reviewForm.location.trim() || 'Customer',
        image:
          reviewForm.image ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      }
      setReviewsList([...reviewsList, newItem])
      showToast('New customer review added!')
    }
    setReviewModalOpen(false)
  }

  const handleDeleteReviewItem = (id) => {
    if (reviewsList.length <= 1) {
      showToast('You must keep at least one customer review!', 'warning')
      setDeleteReviewId(null)
      return
    }
    const filtered = reviewsList.filter((item) => item.id !== id)
    setReviewsList(filtered)
    setDeleteReviewId(null)
    showToast('Customer review deleted!')
  }

  const handleResetReviewDefaults = () => {
    if (window.confirm('Reset Customer Reviews section to default items and titles?')) {
      setReviewsList(defaultReviews)
      setReviewMeta({
        tag: '— CUSTOMER LOVE',
        title: 'What They Say About Us'
      })
      showToast('Reset customer reviews to defaults!')
    }
  }

  const handleSaveReviewSettings = () => {
    try {
      const updatedSettings = {
        ...storeSettings,
        reviewTag: reviewMeta.tag,
        reviewTitle: reviewMeta.title,
        reviewsList: reviewsList
      }
      setStoreSettings(updatedSettings)
      localStorage.setItem('enquiry_admin_store_settings', JSON.stringify(updatedSettings))
      localStorage.setItem('enquiry_admin_reviews', JSON.stringify(reviewsList))
      apiService.updateSettings(updatedSettings)
      window.dispatchEvent(new Event('storage'))
      showToast('Customer reviews saved successfully!')
    } catch (err) {
      showToast('Failed to save customer reviews', 'warning')
    }
  }

  // Trusted By Partners Handlers
  const handleAddPartner = (e) => {
    if (e) e.preventDefault()
    const trimmed = newPartnerInput.trim()
    if (!trimmed) return
    if (trustedByPartners.includes(trimmed)) {
      showToast('This partner is already in the list', 'warning')
      return
    }
    const updated = [...trustedByPartners, trimmed]
    setTrustedByPartners(updated)
    setNewPartnerInput('')
    showToast(`Added "${trimmed}" to trusted partners!`)
  }

  const handleRemovePartner = (indexToRemove) => {
    if (trustedByPartners.length <= 1) {
      showToast('You must keep at least one partner company', 'warning')
      return
    }
    const updated = trustedByPartners.filter((_, idx) => idx !== indexToRemove)
    setTrustedByPartners(updated)
    showToast('Partner removed')
  }

  const handleResetTrustedByDefaults = () => {
    if (window.confirm('Reset Trusted By partners to defaults?')) {
      const defaults = [
        'Reliance Retail',
        'Big Basket',
        'D-Mart',
        'Amazon Fresh',
        'Flipkart',
        'Jiomart',
        'Blinkit',
        'Zepto',
        'Swiggy Instamart'
      ]
      setTrustedByLabel('TRUSTED BY')
      setTrustedByPartners(defaults)
      showToast('Reset trusted partners to defaults!')
    }
  }

  const handleSaveTrustedBySettings = () => {
    try {
      const updatedSettings = {
        ...storeSettings,
        trustedByLabel: trustedByLabel,
        trustedByPartners: trustedByPartners
      }
      setStoreSettings(updatedSettings)
      localStorage.setItem('enquiry_admin_store_settings', JSON.stringify(updatedSettings))
      localStorage.setItem('enquiry_admin_trusted_partners', JSON.stringify(trustedByPartners))
      apiService.updateSettings(updatedSettings)
      window.dispatchEvent(new Event('storage'))
      showToast('Trusted By partners saved successfully!')
    } catch (err) {
      showToast('Failed to save trusted partners', 'warning')
    }
  }

  // Popular Products Carousel Handlers
  const handleAddPopularProductClick = () => {
    setEditingPopularItem(null)
    setPopularForm({
      name: '',
      category: 'MIX MASALA',
      image: '/garam_masala.png',
      slug: '',
      pdfUrl: '',
      whatsappNumber: storeSettings.whatsappNumber || '+919876543210'
    })
    setPopularImageSourceType('upload')
    setPopularModalOpen(true)
  }

  const handleEditPopularProductClick = (item) => {
    setEditingPopularItem(item)
    setPopularForm({
      name: item.name || '',
      category: item.category || 'MIX MASALA',
      image: item.image || '',
      slug: item.slug || '',
      pdfUrl: item.pdfUrl || '',
      whatsappNumber: item.whatsappNumber || storeSettings.whatsappNumber || '+919876543210'
    })
    setPopularImageSourceType(item.image && (item.image.startsWith('http') || item.image.startsWith('//')) ? 'url' : 'upload')
    setPopularModalOpen(true)
  }

  const handlePopularImageFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'warning')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setPopularForm((prev) => ({ ...prev, image: reader.result }))
      showToast(`Selected image: ${file.name}`)
    }
    reader.readAsDataURL(file)
  }

  const handlePopularFormSubmit = (e) => {
    e.preventDefault()
    if (!popularForm.name.trim()) {
      showToast('Please enter product name', 'warning')
      return
    }

    const slug = popularForm.slug.trim() || popularForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    if (editingPopularItem) {
      const updated = popularProducts.map((p) =>
        p.id === editingPopularItem.id
          ? {
              ...p,
              name: popularForm.name.trim(),
              category: popularForm.category.trim() || 'MIX MASALA',
              image: popularForm.image || '/garam_masala.png',
              slug: slug,
              pdfUrl: popularForm.pdfUrl.trim(),
              whatsappNumber: popularForm.whatsappNumber.trim()
            }
          : p
      )
      setPopularProducts(updated)
      showToast('Popular product updated successfully!')
    } else {
      const newItem = {
        id: Date.now(),
        name: popularForm.name.trim(),
        category: popularForm.category.trim() || 'MIX MASALA',
        image: popularForm.image || '/garam_masala.png',
        slug: slug,
        pdfUrl: popularForm.pdfUrl.trim(),
        whatsappNumber: popularForm.whatsappNumber.trim()
      }
      setPopularProducts([...popularProducts, newItem])
      showToast('New popular product added to carousel!')
    }
    setPopularModalOpen(false)
  }

  const handleDeletePopularProduct = (id) => {
    if (popularProducts.length <= 1) {
      showToast('You must keep at least one popular product in carousel!', 'warning')
      setDeletePopularId(null)
      return
    }
    const filtered = popularProducts.filter((p) => p.id !== id)
    setPopularProducts(filtered)
    setDeletePopularId(null)
    showToast('Popular product removed!')
  }

  const handleMovePopularProduct = (index, direction) => {
    const targetIdx = index + direction
    if (targetIdx < 0 || targetIdx >= popularProducts.length) return
    const reordered = [...popularProducts]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIdx, 0, moved)
    setPopularProducts(reordered)
  }

  const handleResetPopularDefaults = () => {
    const isBeautyActive = (storeSettings.activeHomepage || 'home1') === 'home2'
    if (window.confirm(`Reset Popular Products Carousel to default items and settings for ${isBeautyActive ? 'Beauty' : 'Masala'}?`)) {
      if (isBeautyActive) {
        setPopularProducts(defaultBeautyPopularItems)
        setPopularMeta({
          subtitle: '— MOST LOVED BEAUTY',
          titleMain: 'Popular',
          titleHighlight: 'Products',
          desc: 'Explore our most-loved skincare, haircare, and beauty essentials, trusted by thousands of glowing customers.',
          browseText: 'Browse Beauty Collection',
          browseLink: '/product',
          autoPlay: true,
          interval: 3,
          showEnquire: true,
          showBulk: true,
          showPdf: true
        })
        localStorage.setItem('enquiry_admin_popular_products_beauty', JSON.stringify(defaultBeautyPopularItems))
      } else {
        setPopularProducts(defaultPopularItems)
        setPopularMeta({
          subtitle: '— TRENDING NOW',
          titleMain: 'Popular',
          titleHighlight: 'Products',
          desc: 'Explore our most-loved items, trusted by thousands of happy customers across the country.',
          browseText: 'Browse All Products',
          browseLink: '/product',
          autoPlay: true,
          interval: 3,
          showEnquire: true,
          showBulk: true,
          showPdf: true
        })
        localStorage.setItem('enquiry_admin_popular_products', JSON.stringify(defaultPopularItems))
      }
      showToast(`Reset Popular Products Carousel to defaults for ${isBeautyActive ? 'Beauty' : 'Masala'}!`)
    }
  }

  const handleSavePopularSettings = () => {
    try {
      const isBeautyActive = (storeSettings.activeHomepage || 'home1') === 'home2'
      const updatedSettings = isBeautyActive
        ? {
            ...storeSettings,
            popularProductsSubtitleBeauty: popularMeta.subtitle,
            popularProductsTitleMainBeauty: popularMeta.titleMain,
            popularProductsTitleHighlightBeauty: popularMeta.titleHighlight,
            popularProductsDescBeauty: popularMeta.desc,
            popularProductsBrowseTextBeauty: popularMeta.browseText,
            popularProductsBrowseLinkBeauty: popularMeta.browseLink,
            popularProductsAutoPlay: popularMeta.autoPlay,
            popularProductsInterval: popularMeta.interval,
            popularProductsShowEnquire: popularMeta.showEnquire,
            popularProductsShowBulk: popularMeta.showBulk,
            popularProductsShowPdf: popularMeta.showPdf,
            popularProductsListBeauty: popularProducts
          }
        : {
            ...storeSettings,
            popularProductsSubtitle: popularMeta.subtitle,
            popularProductsTitleMain: popularMeta.titleMain,
            popularProductsTitleHighlight: popularMeta.titleHighlight,
            popularProductsDesc: popularMeta.desc,
            popularProductsBrowseText: popularMeta.browseText,
            popularProductsBrowseLink: popularMeta.browseLink,
            popularProductsAutoPlay: popularMeta.autoPlay,
            popularProductsInterval: popularMeta.interval,
            popularProductsShowEnquire: popularMeta.showEnquire,
            popularProductsShowBulk: popularMeta.showBulk,
            popularProductsShowPdf: popularMeta.showPdf,
            popularProductsList: popularProducts
          }
      setStoreSettings(updatedSettings)
      localStorage.setItem('enquiry_admin_store_settings', JSON.stringify(updatedSettings))
      if (isBeautyActive) {
        localStorage.setItem('enquiry_admin_popular_products_beauty', JSON.stringify(popularProducts))
      } else {
        localStorage.setItem('enquiry_admin_popular_products', JSON.stringify(popularProducts))
      }
      apiService.updateSettings(updatedSettings)
      window.dispatchEvent(new Event('storage'))
      showToast(`Popular Products Carousel settings saved successfully for ${isBeautyActive ? 'Beauty' : 'Masala'}!`)
    } catch (err) {
      showToast('Failed to save popular products settings', 'warning')
    }
  }

  // Save general homepage settings
  const handleSaveAll = () => {
    try {
      const isBeautyActive = (storeSettings.activeHomepage || 'home1') === 'home2'
      const mergedSettings = isBeautyActive
        ? {
            ...storeSettings,
            homeAboutSubtitleBeauty: aboutForm.subtitle,
            homeAboutTitleBeauty: aboutForm.title,
            homeAboutDesc1Beauty: aboutForm.desc1,
            homeAboutDesc2Beauty: aboutForm.desc2,
            homeAboutImageBeauty: aboutForm.image,
            homeAboutBadge1NumberBeauty: aboutForm.b1Num,
            homeAboutBadge1LabelBeauty: aboutForm.b1Lbl,
            homeAboutBadge2NumberBeauty: aboutForm.b2Num,
            homeAboutBadge2LabelBeauty: aboutForm.b2Lbl,
            homeAboutBtnTextBeauty: aboutForm.btnText,
            homeAboutBtnLinkBeauty: aboutForm.btnLink,
            faqSubtitle: faqMeta.subtitle,
            faqTitle: faqMeta.title,
            faqContactPrompt: faqMeta.contactPrompt,
            faqContactBtnText: faqMeta.contactBtnText,
            faqs: faqs,
            whyChooseTag: whyChooseMeta.tag,
            whyChooseTitle: whyChooseMeta.title,
            whyChooseSubtitle: whyChooseMeta.subtitle,
            whyChooseFeatures: whyChooseList,
            reviewTag: reviewMeta.tag,
            reviewTitle: reviewMeta.title,
            reviewsList: reviewsList,
            trustedByLabel: trustedByLabel,
            trustedByPartners: trustedByPartners,
            popularProductsSubtitleBeauty: popularMeta.subtitle,
            popularProductsTitleMainBeauty: popularMeta.titleMain,
            popularProductsTitleHighlightBeauty: popularMeta.titleHighlight,
            popularProductsDescBeauty: popularMeta.desc,
            popularProductsBrowseTextBeauty: popularMeta.browseText,
            popularProductsBrowseLinkBeauty: popularMeta.browseLink,
            popularProductsAutoPlay: popularMeta.autoPlay,
            popularProductsInterval: popularMeta.interval,
            popularProductsShowEnquire: popularMeta.showEnquire,
            popularProductsShowBulk: popularMeta.showBulk,
            popularProductsShowPdf: popularMeta.showPdf,
            popularProductsListBeauty: popularProducts
          }
        : {
            ...storeSettings,
            homeAboutSubtitle: aboutForm.subtitle,
            homeAboutTitle: aboutForm.title,
            homeAboutDesc1: aboutForm.desc1,
            homeAboutDesc2: aboutForm.desc2,
            homeAboutImage: aboutForm.image,
            homeAboutBadge1Number: aboutForm.b1Num,
            homeAboutBadge1Label: aboutForm.b1Lbl,
            homeAboutBadge2Number: aboutForm.b2Num,
            homeAboutBadge2Label: aboutForm.b2Lbl,
            homeAboutBtnText: aboutForm.btnText,
            homeAboutBtnLink: aboutForm.btnLink,
            faqSubtitle: faqMeta.subtitle,
            faqTitle: faqMeta.title,
            faqContactPrompt: faqMeta.contactPrompt,
            faqContactBtnText: faqMeta.contactBtnText,
            faqs: faqs,
            whyChooseTag: whyChooseMeta.tag,
            whyChooseTitle: whyChooseMeta.title,
            whyChooseSubtitle: whyChooseMeta.subtitle,
            whyChooseFeatures: whyChooseList,
            reviewTag: reviewMeta.tag,
            reviewTitle: reviewMeta.title,
            reviewsList: reviewsList,
            trustedByLabel: trustedByLabel,
            trustedByPartners: trustedByPartners,
            popularProductsSubtitle: popularMeta.subtitle,
            popularProductsTitleMain: popularMeta.titleMain,
            popularProductsTitleHighlight: popularMeta.titleHighlight,
            popularProductsDesc: popularMeta.desc,
            popularProductsBrowseText: popularMeta.browseText,
            popularProductsBrowseLink: popularMeta.browseLink,
            popularProductsAutoPlay: popularMeta.autoPlay,
            popularProductsInterval: popularMeta.interval,
            popularProductsShowEnquire: popularMeta.showEnquire,
            popularProductsShowBulk: popularMeta.showBulk,
            popularProductsShowPdf: popularMeta.showPdf,
            popularProductsList: popularProducts
          }

      setStoreSettings(mergedSettings)
      localStorage.setItem('enquiry_admin_store_settings', JSON.stringify(mergedSettings))
      localStorage.setItem('enquiry_admin_faqs', JSON.stringify(faqs))
      localStorage.setItem('enquiry_admin_why_choose', JSON.stringify(whyChooseList))
      localStorage.setItem('enquiry_admin_reviews', JSON.stringify(reviewsList))
      localStorage.setItem('enquiry_admin_trusted_partners', JSON.stringify(trustedByPartners))
      if (isBeautyActive) {
        localStorage.setItem('enquiry_admin_popular_products_beauty', JSON.stringify(popularProducts))
      } else {
        localStorage.setItem('enquiry_admin_popular_products', JSON.stringify(popularProducts))
      }
      localStorage.setItem('enquiry_admin_section_visibility', JSON.stringify(sectionVisibility))
      apiService.updateSettings(mergedSettings)
      window.dispatchEvent(new Event('storage'))
      showToast('All homepage sections and settings saved successfully!')
    } catch {
      showToast('Saved homepage settings!')
    }
  }

  const handleSelectHomepage = (homepageKey) => {
    const updated = { ...storeSettings, activeHomepage: homepageKey }
    setStoreSettings(updated)
    try {
      sessionStorage.setItem('active_homepage', homepageKey)
    } catch (e) {}
    localStorage.setItem('enquiry_admin_store_settings', JSON.stringify(updated))

    // 1. Automatically switch active hero banner carousel images to match selected theme (Masala vs Beauty)
    const themeSlides = homepageKey === 'home2' ? beautyHeroImages : defaultHeroImages
    setHeroSlides(themeSlides)
    localStorage.setItem('enquiry_admin_hero_slides', JSON.stringify(themeSlides))

    // 2. Automatically switch About Company / Who We Are form to match selected theme
    if (homepageKey === 'home2') {
      setAboutForm({
        subtitle: updated.homeAboutSubtitleBeauty || '— WHO WE ARE',
        title: updated.homeAboutTitleBeauty || 'About Our Beauty Care',
        desc1: updated.homeAboutDesc1Beauty || 'Established in 2012, we are dedicated to crafting dermatologically-tested, organic, and cruelty-free skincare, haircare, and cosmetic solutions. Our commitment to pure ingredients, innovative formulations, and radiant skin health has made us a trusted beauty choice for thousands.',
        desc2: updated.homeAboutDesc2Beauty || 'Every serum, hydrating gel, and botanical elixir in our collection is carefully formulated with clean, active ingredients to nourish your skin, enhance natural glow, and elevate your daily self-care ritual.',
        image: updated.homeAboutImageBeauty || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
        b1Num: updated.homeAboutBadge1NumberBeauty || '12+',
        b1Lbl: updated.homeAboutBadge1LabelBeauty || 'YEARS IN BEAUTY',
        b2Num: updated.homeAboutBadge2NumberBeauty || '100%',
        b2Lbl: updated.homeAboutBadge2LabelBeauty || 'CRUELTY FREE & VEGAN',
        btnText: updated.homeAboutBtnTextBeauty || 'About More',
        btnLink: updated.homeAboutBtnLinkBeauty || '/about-company'
      })
      setPopularMeta({
        subtitle: updated.popularProductsSubtitleBeauty || '— MOST LOVED BEAUTY',
        titleMain: updated.popularProductsTitleMainBeauty !== undefined ? updated.popularProductsTitleMainBeauty : 'Popular',
        titleHighlight: updated.popularProductsTitleHighlightBeauty !== undefined ? updated.popularProductsTitleHighlightBeauty : 'Products',
        desc: updated.popularProductsDescBeauty || 'Explore our most-loved skincare, haircare, and beauty essentials, trusted by thousands of glowing customers.',
        browseText: updated.popularProductsBrowseTextBeauty || 'Browse Beauty Collection',
        browseLink: updated.popularProductsBrowseLinkBeauty || '/product',
        autoPlay: updated.popularProductsAutoPlay !== false,
        interval: Number(updated.popularProductsInterval) || 3,
        showEnquire: updated.popularProductsShowEnquire !== false,
        showBulk: updated.popularProductsShowBulk !== false,
        showPdf: updated.popularProductsShowPdf !== false
      })
      try {
        const savedBeautyPop = localStorage.getItem('enquiry_admin_popular_products_beauty')
        if (savedBeautyPop) {
          setPopularProducts(JSON.parse(savedBeautyPop))
        } else if (updated.popularProductsListBeauty && updated.popularProductsListBeauty.length > 0) {
          setPopularProducts(updated.popularProductsListBeauty)
        } else {
          setPopularProducts(defaultBeautyPopularItems)
          localStorage.setItem('enquiry_admin_popular_products_beauty', JSON.stringify(defaultBeautyPopularItems))
        }
      } catch {}
    } else {
      setAboutForm({
        subtitle: updated.homeAboutSubtitle || '— WHO WE ARE',
        title: updated.homeAboutTitle || 'About Our Company',
        desc1: updated.homeAboutDesc1 || 'Established in 2012, we have grown from a small local business into a trusted national brand. Our commitment to quality, innovation, and customer satisfaction has made us the preferred choice for thousands of customers across the country.',
        desc2: updated.homeAboutDesc2 || 'Every product in our catalogue is carefully selected and quality-checked to ensure it meets our high standards. We believe that great products and great service go hand in hand.',
        image: updated.homeAboutImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        b1Num: updated.homeAboutBadge1Number || '12+',
        b1Lbl: updated.homeAboutBadge1Label || 'YEARS ESTABLISHED',
        b2Num: updated.homeAboutBadge2Number || '35+',
        b2Lbl: updated.homeAboutBadge2Label || 'TEAM MEMBERS',
        btnText: updated.homeAboutBtnText || 'About More',
        btnLink: updated.homeAboutBtnLink || '/about-company'
      })
      setPopularMeta({
        subtitle: updated.popularProductsSubtitle || '— TRENDING NOW',
        titleMain: updated.popularProductsTitleMain !== undefined ? updated.popularProductsTitleMain : 'Popular',
        titleHighlight: updated.popularProductsTitleHighlight !== undefined ? updated.popularProductsTitleHighlight : 'Products',
        desc: updated.popularProductsDesc || 'Explore our most-loved items, trusted by thousands of happy customers across the country.',
        browseText: updated.popularProductsBrowseText || 'Browse All Products',
        browseLink: updated.popularProductsBrowseLink || '/product',
        autoPlay: updated.popularProductsAutoPlay !== false,
        interval: Number(updated.popularProductsInterval) || 3,
        showEnquire: updated.popularProductsShowEnquire !== false,
        showBulk: updated.popularProductsShowBulk !== false,
        showPdf: updated.popularProductsShowPdf !== false
      })
      try {
        const savedPop = localStorage.getItem('enquiry_admin_popular_products')
        if (savedPop) {
          setPopularProducts(JSON.parse(savedPop))
        } else if (updated.popularProductsList && updated.popularProductsList.length > 0) {
          setPopularProducts(updated.popularProductsList)
        } else {
          setPopularProducts(defaultPopularItems)
        }
      } catch {}
    }

    // 3. Dispatch events and persist
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent('homepageChanged', { detail: homepageKey }))
    apiService.updateSettings(updated)
    apiService.updateHeroSlides(themeSlides)
    const label = homepageKey === 'home2' ? 'Homepage 2 (Beauty Products)' : 'Homepage 1 (Masala Products)'
    showToast(`Set ${label} as default active homepage!`)
  }

  return (
    <div className="homepage-settings-container">

      {/* 0. HOMEPAGE VERSION SELECTION */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header" style={{ marginBottom: '14px' }}>
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}>
              <FiEye className="card-title-icon" size={20} />
            </div>
            <div>
              <div className="card-title-row">
                <h2 className="card-title">Select Homepage</h2>
                <span className="live-count-badge" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                  {(storeSettings.activeHomepage || 'home1') === 'home2' ? 'Homepage 2 (Beauty Products) Active' : 'Homepage 1 (Masala Products) Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
          {/* Option 1: Homepage 1 */}
          <div
            onClick={() => handleSelectHomepage('home1')}
            style={{
              padding: '18px 20px',
              borderRadius: '14px',
              border: (storeSettings.activeHomepage || 'home1') === 'home1' ? '2px solid #6366F1' : '1px solid var(--admin-card-border)',
              backgroundColor: (storeSettings.activeHomepage || 'home1') === 'home1' ? 'rgba(99, 102, 241, 0.03)' : '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  name="activeHomepage"
                  checked={(storeSettings.activeHomepage || 'home1') === 'home1'}
                  onChange={() => handleSelectHomepage('home1')}
                  style={{ width: '18px', height: '18px', accentColor: '#6366F1', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--admin-text-main)' }}>
                  Homepage 1 (Masala Products)
                </span>
              </div>
              {(storeSettings.activeHomepage || 'home1') === 'home1' && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#6366F1', color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>
                  ACTIVE
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--admin-text-muted)', margin: 0, lineHeight: 1.4 }}>
              Spices & Masala products enquiry website layout.
            </p>
          </div>

          {/* Option 2: Homepage 2 */}
          <div
            onClick={() => handleSelectHomepage('home2')}
            style={{
              padding: '18px 20px',
              borderRadius: '14px',
              border: (storeSettings.activeHomepage || 'home1') === 'home2' ? '2px solid #6366F1' : '1px solid var(--admin-card-border)',
              backgroundColor: (storeSettings.activeHomepage || 'home1') === 'home2' ? 'rgba(99, 102, 241, 0.03)' : '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  name="activeHomepage"
                  checked={(storeSettings.activeHomepage || 'home1') === 'home2'}
                  onChange={() => handleSelectHomepage('home2')}
                  style={{ width: '18px', height: '18px', accentColor: '#6366F1', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--admin-text-main)' }}>
                  Homepage 2 (Beauty Products)
                </span>
              </div>
              {(storeSettings.activeHomepage || 'home1') === 'home2' && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#6366F1', color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>
                  ACTIVE
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--admin-text-muted)', margin: 0, lineHeight: 1.4 }}>
              Beauty & Skincare products enquiry website layout.
            </p>
          </div>
        </div>
      </div>

      {/* 1. HERO SLIDER BANNER MANAGEMENT */}
      <div className="admin-card">
        <div className="admin-card-header banner-section-header">
          <div className="card-title-group">
            <div className="card-title-icon-wrapper">
              <FiSliders className="card-title-icon" size={20} />
            </div>
            <div>
              <div className="card-title-row">
                <h2 className="card-title">Hero Banner Carousel</h2>
                <span className="live-count-badge">{heroSlides.length} Banners</span>
              </div>
              <p className="card-subtitle">
                Curate high-converting hero banners, promotional slides, and seasonal hero media.
              </p>
            </div>
          </div>
          <div className="banner-header-actions">
            <div className="banner-view-toggle">
              <button
                type="button"
                className={`banner-toggle-btn ${bannerViewMode === 'list' ? 'active' : ''}`}
                onClick={() => setBannerViewMode('list')}
                title="List View"
              >
                <FiList size={14} /> List View
              </button>
              <button
                type="button"
                className={`banner-toggle-btn ${bannerViewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setBannerViewMode('grid')}
                title="Cards View"
              >
                <FiGrid size={14} /> Cards
              </button>
            </div>
            <button className="btn-secondary banner-add-btn" onClick={handleAddSlideClick}>
              <FiPlus size={16} /> Add Hero Banner
            </button>
          </div>
        </div>

        {bannerViewMode === 'list' ? (
          <>
            {/* Desktop Table View */}
            <div className="banner-table-wrapper banner-desktop-only">
              <table className="banner-table">
                <thead>
                  <tr>
                    <th className="banner-col-order">Slide #</th>
                    <th className="banner-col-media">Banner Media</th>
                    <th className="banner-col-title">Headline & Title</th>
                    <th className="banner-col-desc">Subtitle / Description</th>
                    <th className="banner-col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {heroSlides.length > 0 ? (
                    heroSlides.map((slide, index) => (
                      <tr key={slide.id || index}>
                        {/* Slide # */}
                        <td className="banner-col-order">
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 9px',
                              borderRadius: '12px',
                              backgroundColor: '#EEF2FF',
                              color: '#4F46E5',
                              fontWeight: 800,
                              fontSize: '0.74rem',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            #{index + 1}
                          </span>
                        </td>

                        {/* Banner Preview Thumbnail */}
                        <td className="banner-col-media">
                          <div
                            style={{
                              width: '96px',
                              height: '50px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: '1px solid #E2E8F0',
                              backgroundColor: '#F1F5F9',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <img
                              src={slide.url}
                              alt={slide.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                              }}
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src =
                                  'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80'
                              }}
                            />
                          </div>
                        </td>

                        {/* Headline & Title */}
                        <td className="banner-col-title">
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              color: 'var(--admin-text-main)',
                              lineHeight: 1.3,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={slide.title}
                          >
                            {slide.title}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                            ID: {slide.id || index + 1}
                          </span>
                        </td>

                        {/* Subtitle / Description */}
                        <td className="banner-col-desc">
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: '#64748B',
                              lineHeight: 1.4,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={slide.subtitle}
                          >
                            {slide.subtitle || '—'}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="banner-col-actions">
                          {deleteSlideId === slide.id ? (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: '#FEF2F2',
                                border: '1px solid #FCA5A5',
                                borderRadius: '6px',
                                padding: '2px 4px'
                              }}
                            >
                              <button
                                type="button"
                                title="Confirm Delete"
                                style={{
                                  backgroundColor: '#EF4444',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '3px 6px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                                onClick={() => handleDeleteSlide(slide.id)}
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                title="Cancel"
                                style={{
                                  backgroundColor: '#FFFFFF',
                                  color: '#475569',
                                  border: '1px solid #CBD5E1',
                                  borderRadius: '4px',
                                  padding: '3px 5px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                                onClick={() => setDeleteSlideId(null)}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                              <button
                                type="button"
                                className="btn-icon"
                                title="Edit Banner"
                                onClick={() => handleEditSlideClick(slide)}
                                style={{ width: '28px', height: '28px', padding: 0 }}
                              >
                                <FiEdit2 size={13} />
                              </button>
                              <button
                                type="button"
                                className="btn-icon delete"
                                title="Delete Banner"
                                onClick={() => setDeleteSlideId(slide.id)}
                                style={{ width: '28px', height: '28px', padding: 0 }}
                              >
                                <FiTrash2 size={13} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B' }}>
                        No hero banners configured. Click "+ Add Hero Banner" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards List View */}
            <div className="banner-mobile-list">
              {heroSlides.length > 0 ? (
                heroSlides.map((slide, index) => (
                  <div className="banner-mobile-card" key={slide.id || index}>
                    <div className="banner-mobile-card-header">
                      <div className="banner-mobile-card-meta">
                        <span className="banner-mobile-order-badge">#{index + 1}</span>
                        <span className="banner-mobile-id-badge">ID: {slide.id || index + 1}</span>
                      </div>
                      <div className="banner-mobile-card-actions">
                        {deleteSlideId === slide.id ? (
                          <div className="banner-mobile-confirm-delete">
                            <span className="banner-confirm-text">Delete?</span>
                            <button
                              type="button"
                              className="banner-confirm-delete-btn"
                              onClick={() => handleDeleteSlide(slide.id)}
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              className="banner-cancel-delete-btn"
                              onClick={() => setDeleteSlideId(null)}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="banner-mobile-action-btns">
                            <button
                              type="button"
                              className="btn-icon"
                              title="Edit Banner"
                              onClick={() => handleEditSlideClick(slide)}
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon delete"
                              title="Delete Banner"
                              onClick={() => setDeleteSlideId(slide.id)}
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="banner-mobile-card-body">
                      <div className="banner-mobile-thumb-wrap">
                        <img
                          src={slide.url}
                          alt={slide.title}
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src =
                              'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80'
                          }}
                        />
                      </div>
                      <div className="banner-mobile-details">
                        <h4 className="banner-mobile-title">{slide.title}</h4>
                        <p className="banner-mobile-desc">{slide.subtitle || '—'}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="banner-mobile-empty">
                  No hero banners configured. Click "+ Add Hero Banner" to create one.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="banners-grid">
            {heroSlides.map((slide, index) => (
              <div className="banner-item-card" key={slide.id || index}>
                <div className="banner-img-wrap">
                  <span className="banner-order-badge">Slide #{index + 1}</span>
                  <img
                    src={slide.url}
                    alt={slide.title}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src =
                        'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80'
                    }}
                  />
                </div>
                <div className="banner-content">
                  <div className="banner-title">{slide.title}</div>
                  <div className="banner-sub">{slide.subtitle}</div>
                  <div className="banner-actions">
                    {deleteSlideId === slide.id ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#FEF2F2',
                          border: '1px solid #FCA5A5',
                          borderRadius: '6px',
                          padding: '3px 6px'
                        }}
                      >
                        <span style={{ fontSize: '0.74rem', color: '#991B1B', fontWeight: 600 }}>
                          Delete?
                        </span>
                        <button
                          type="button"
                          style={{
                            backgroundColor: '#EF4444',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          onClick={() => handleDeleteSlide(slide.id)}
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          style={{
                            backgroundColor: '#FFFFFF',
                            color: '#475569',
                            border: '1px solid #CBD5E1',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          onClick={() => setDeleteSlideId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          className="btn-icon"
                          title="Edit Banner"
                          onClick={() => handleEditSlideClick(slide)}
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          className="btn-icon delete"
                          title="Delete Banner"
                          onClick={() => setDeleteSlideId(slide.id)}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 1.5. TRUSTED BY PARTNERS TICKER MANAGEMENT */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>
              <Handshake size={20} />
            </div>
            <div>
              <div className="card-title-row">
                <h2 className="card-title">Trusted By Retail Partners Ticker</h2>
                <span className="live-count-badge" style={{ backgroundColor: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD' }}>
                  {trustedByPartners.length} Brands
                </span>
              </div>
              <p className="card-subtitle">
                Manage the retail partner marquee ticker bar displayed right below the hero carousel.
              </p>
            </div>
          </div>
          <div className="card-header-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetTrustedByDefaults}
              title="Reset partner brands to defaults"
            >
              <FiRotateCcw size={14} /> Reset Defaults
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveTrustedBySettings}
              style={{ backgroundColor: '#0284C7', borderColor: '#0284C7' }}
            >
              <FiSave size={16} /> Save Partners
            </button>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="form-grid" style={{ marginBottom: '16px' }}>
          {/* Label Input */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>
              Ticker Section Label
            </label>
            <input
              type="text"
              className="form-input"
              value={trustedByLabel}
              onChange={(e) => setTrustedByLabel(e.target.value)}
              placeholder="e.g. TRUSTED BY"
            />
          </div>

          {/* Quick Add Partner */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>
              Add Partner Brand / Retailer
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                value={newPartnerInput}
                onChange={(e) => setNewPartnerInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddPartner()
                  }
                }}
                placeholder="e.g. Reliance Retail, Big Basket..."
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleAddPartner}
                className="btn-primary"
                style={{ backgroundColor: '#0284C7', borderColor: '#0284C7', padding: '0 16px', flexShrink: 0 }}
              >
                <FiPlus size={16} /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Partner Tag Pills */}
        <div style={{ marginBottom: '20px' }}>
          <label className="form-label" style={{ fontWeight: 600, marginBottom: '8px' }}>
            Current Active Partner Brands (Click × to remove):
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            {trustedByPartners.map((partner, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '20px',
                  padding: '5px 12px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#1E293B',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                {partner}
                <button
                  type="button"
                  onClick={() => handleRemovePartner(idx)}
                  title={`Remove ${partner}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#F1F5F9',
                    color: '#64748B',
                    cursor: 'pointer',
                    fontSize: '12px',
                    lineHeight: 1,
                    padding: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FEE2E2'
                    e.currentTarget.style.color = '#DC2626'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F1F5F9'
                    e.currentTarget.style.color = '#64748B'
                  }}
                >
                  <FiX size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Live Storefront Ticker Preview matching user's screenshot */}
        <div>
          <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px' }}>
            Live Ticker Bar Preview:
          </label>
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: '#EDF5FD',
              borderRadius: '16px',
              border: '1px solid #D6E8F9',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
            }}
          >
            {/* Left Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingRight: '20px', flexShrink: 0 }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#334155', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {trustedByLabel || 'TRUSTED BY'}
              </span>
              <span style={{ width: '1px', height: '18px', backgroundColor: '#94A3B8' }} />
            </div>

            {/* Marquee Ticker Track */}
            <div style={{ overflow: 'hidden', width: '100%', display: 'flex' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '36px',
                  whiteSpace: 'nowrap'
                }}
              >
                {trustedByPartners.map((p, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#1E293B',
                      letterSpacing: '-0.2px'
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POPULAR PRODUCTS COVERFLOW CAROUSEL MANAGEMENT */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
              <FiShoppingBag className="card-title-icon" size={20} />
            </div>
            <div>
              <div className="card-title-row">
                <h2 className="card-title">Popular Products Coverflow Carousel</h2>
                <span className="live-count-badge" style={{ backgroundColor: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD' }}>
                  {popularProducts.length} {(storeSettings.activeHomepage || 'home1') === 'home2' ? 'Beauty Products' : 'Trending Products'}
                </span>
                <span className="live-count-badge" style={{ backgroundColor: (storeSettings.activeHomepage || 'home1') === 'home2' ? '#FDF2F8' : '#EEF2FF', color: (storeSettings.activeHomepage || 'home1') === 'home2' ? '#DB2777' : '#4F46E5', border: `1px solid ${(storeSettings.activeHomepage || 'home1') === 'home2' ? '#FBCFE8' : '#C7D2FE'}` }}>
                  {(storeSettings.activeHomepage || 'home1') === 'home2' ? 'Homepage 2 (Beauty)' : 'Homepage 1 (Masala)'}
                </span>
              </div>
              <p className="card-subtitle">
                Manage the "— TRENDING NOW / Popular Products" 3D coverflow carousel, product cards, WhatsApp bulk order action, and catalog PDF badges.
              </p>
            </div>
          </div>
          <div className="card-header-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetPopularDefaults}
              title="Reset Popular Products to default items and settings"
            >
              <FiRotateCcw size={14} /> Reset Defaults
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleAddPopularProductClick}
              style={{ backgroundColor: '#0284C7', borderColor: '#0284C7' }}
            >
              <FiPlus size={16} /> Add Product
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSavePopularSettings}
              style={{ backgroundColor: '#059669', borderColor: '#059669' }}
            >
              <FiSave size={16} /> Save Changes
            </button>
          </div>
        </div>

        {/* Section Headings & Carousel Settings in 2 sub-boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', marginBottom: '20px' }}>
          {/* Box 1: Headings & Texts */}
          <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--admin-card-border)' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--admin-text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiEdit2 size={14} color="#0284C7" /> Section Headings & Action Link
            </div>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Subtitle Tag</label>
              <input
                type="text"
                className="form-input"
                value={popularMeta.subtitle}
                onChange={(e) => setPopularMeta({ ...popularMeta, subtitle: e.target.value })}
                placeholder="e.g. — TRENDING NOW"
              />
            </div>
            <div className="form-row" style={{ gap: '12px', marginBottom: '10px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Title (Main)</label>
                <input
                  type="text"
                  className="form-input"
                  value={popularMeta.titleMain}
                  onChange={(e) => setPopularMeta({ ...popularMeta, titleMain: e.target.value })}
                  placeholder="e.g. Popular"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Title (Gold Accent)</label>
                <input
                  type="text"
                  className="form-input"
                  value={popularMeta.titleHighlight}
                  onChange={(e) => setPopularMeta({ ...popularMeta, titleHighlight: e.target.value })}
                  placeholder="e.g. Products"
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Description Text</label>
              <textarea
                className="form-input"
                rows={2}
                value={popularMeta.desc}
                onChange={(e) => setPopularMeta({ ...popularMeta, desc: e.target.value })}
                placeholder="Explore our most-loved items..."
              />
            </div>
            <div className="form-row" style={{ gap: '12px' }}>
              <div className="form-group" style={{ flex: 1.2 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>"Browse All" Button Text</label>
                <input
                  type="text"
                  className="form-input"
                  value={popularMeta.browseText}
                  onChange={(e) => setPopularMeta({ ...popularMeta, browseText: e.target.value })}
                  placeholder="e.g. Browse All Products"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Target URL Link</label>
                <input
                  type="text"
                  className="form-input"
                  value={popularMeta.browseLink}
                  onChange={(e) => setPopularMeta({ ...popularMeta, browseLink: e.target.value })}
                  placeholder="e.g. /product"
                />
              </div>
            </div>
          </div>

          {/* Box 2: Carousel Behavior & Buttons Controls */}
          <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--admin-card-border)' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--admin-text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiSliders size={14} color="#0284C7" /> Coverflow Animation & Button Displays
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Auto-Play Switch */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>Auto-Play Coverflow</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Automatically cycle through items every few seconds</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={popularMeta.autoPlay}
                    onChange={(e) => setPopularMeta({ ...popularMeta, autoPlay: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {/* Rotation Interval */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>Rotation Speed</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Seconds each product card remains centered</div>
                </div>
                <select
                  className="form-input"
                  style={{ width: '120px', padding: '4px 8px', fontSize: '0.85rem' }}
                  value={popularMeta.interval}
                  onChange={(e) => setPopularMeta({ ...popularMeta, interval: Number(e.target.value) })}
                >
                  <option value={2}>2 Seconds</option>
                  <option value={3}>3 Seconds (Default)</option>
                  <option value={4}>4 Seconds</option>
                  <option value={5}>5 Seconds</option>
                </select>
              </div>

              {/* Show Enquire Now Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>Show "Enquire Now" Pill</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Triggers enquiry popup form for modal submission</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={popularMeta.showEnquire}
                    onChange={(e) => setPopularMeta({ ...popularMeta, showEnquire: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {/* Show Bulk Enquire WhatsApp Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>Show "Bulk Enquire" (WhatsApp)</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Opens direct WhatsApp message chat with prefilled product enquiry</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={popularMeta.showBulk}
                    onChange={(e) => setPopularMeta({ ...popularMeta, showBulk: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {/* Show PDF Catalog Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>Show PDF Catalog Badge</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Displays red PDF icon overlay on product images</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={popularMeta.showPdf}
                    onChange={(e) => setPopularMeta({ ...popularMeta, showPdf: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Live Interactive Storefront Preview */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Live Storefront Preview (Interactive 3D Coverflow)
            </span>
            <span style={{ fontSize: '0.78rem', color: '#0284C7', fontWeight: 600 }}>
              Showing {popularProducts.length} items • Center index: #{popularPreviewIndex + 1}
            </span>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '36px 20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Header in Preview */}
            <div style={{ marginBottom: '28px' }}>
              <span style={{ display: 'inline-block', fontSize: '13px', fontWeight: 800, color: '#475569', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                {popularMeta.subtitle || '— TRENDING NOW'}
              </span>
              <h3 style={{ fontSize: '2.2rem', fontFamily: 'serif', fontWeight: 700, color: '#0F172A', margin: '0 0 10px 0' }}>
                {popularMeta.titleMain}{' '}
                <span style={{ color: '#D97706' }}>{popularMeta.titleHighlight}</span>
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#64748B', maxWidth: '640px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
                {popularMeta.desc}
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', borderBottom: '2px solid #D97706', paddingBottom: '2px' }}>
                {popularMeta.browseText} →
              </div>
            </div>

            {/* Live Coverflow Cards Container */}
            <div style={{ position: 'relative', maxWidth: '820px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Prev Arrow */}
              <button
                type="button"
                onClick={() => setPopularPreviewIndex((prev) => (prev - 1 + popularProducts.length) % popularProducts.length)}
                style={{
                  position: 'absolute',
                  left: '10px',
                  zIndex: 10,
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1E293B',
                  transition: 'all 0.2s ease'
                }}
              >
                <FiArrowLeft size={18} />
              </button>

              {/* Coverflow Preview Cards */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', width: '100%', overflow: 'hidden', padding: '10px 0' }}>
                {popularProducts.map((prod, idx) => {
                  const total = popularProducts.length
                  const diff = (idx - popularPreviewIndex + total) % total
                  const isCenter = diff === 0
                  const isPrev = diff === total - 1
                  const isNext = diff === 1

                  if (!isCenter && !isPrev && !isNext) return null

                  return (
                    <div
                      key={prod.id || idx}
                      onClick={() => setPopularPreviewIndex(idx)}
                      style={{
                        flex: isCenter ? '0 0 460px' : '0 0 260px',
                        transform: isCenter ? 'scale(1)' : 'scale(0.88)',
                        opacity: isCenter ? 1 : 0.45,
                        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                        padding: '16px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '20px',
                        border: isCenter ? '2px solid #00E5FF' : '1px solid #E2E8F0',
                        boxShadow: isCenter ? '0 12px 32px rgba(0, 229, 255, 0.25)' : '0 4px 14px rgba(0,0,0,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      {/* Product Image Box */}
                      <div style={{ position: 'relative', width: isCenter ? '90px' : '70px', height: isCenter ? '90px' : '70px', flexShrink: 0, borderRadius: '14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                        <img
                          src={prod.image}
                          alt={prod.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = '/garam_masala.png'
                          }}
                        />
                        {popularMeta.showPdf && (
                          <div style={{ position: 'absolute', bottom: '4px', right: '4px', backgroundColor: '#FFFFFF', borderRadius: '50%', padding: '3px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', display: 'flex' }}>
                            <FaFilePdf size={12} color="#E11D48" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                          {prod.category}
                        </span>
                        <h4 style={{ fontSize: isCenter ? '1.05rem' : '0.9rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prod.name}
                        </h4>

                        {/* Action buttons (only displayed clearly on center card or if requested) */}
                        {isCenter && (popularMeta.showEnquire || popularMeta.showBulk) && (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {popularMeta.showEnquire && (
                              <button
                                type="button"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '6px 14px',
                                  backgroundColor: '#1E293B',
                                  color: '#FFFFFF',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  borderRadius: '20px',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                Enquire Now
                              </button>
                            )}
                            {popularMeta.showBulk && (
                              <button
                                type="button"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '6px 14px',
                                  backgroundColor: '#22C55E',
                                  color: '#FFFFFF',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  borderRadius: '20px',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                <FaWhatsapp size={14} /> Bulk Enquire
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Next Arrow */}
              <button
                type="button"
                onClick={() => setPopularPreviewIndex((prev) => (prev + 1) % popularProducts.length)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  zIndex: 10,
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1E293B',
                  transition: 'all 0.2s ease'
                }}
              >
                <FiArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Products List Table & Item Controls */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--admin-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiPackage size={16} color="#0284C7" /> Coverflow Carousel Products ({popularProducts.length})
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
              Use arrows to adjust the carousel order
            </span>
          </div>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid var(--admin-card-border)', borderRadius: '12px', background: '#FFFFFF' }}>
            <table className="admin-table" style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--admin-card-border)', fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 14px', width: '90px' }}>Order</th>
                  <th style={{ padding: '12px 14px', width: '70px' }}>Image</th>
                  <th style={{ padding: '12px 14px' }}>Product Name</th>
                  <th style={{ padding: '12px 14px' }}>Category</th>
                  <th style={{ padding: '12px 14px' }}>WhatsApp Number</th>
                  <th style={{ padding: '12px 14px', width: '110px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {popularProducts.map((prod, index) => (
                  <tr key={prod.id || index} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    {/* Order Controls */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', minWidth: '18px' }}>
                          #{index + 1}
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMovePopularProduct(index, -1)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: index === 0 ? 'not-allowed' : 'pointer',
                              color: index === 0 ? '#CBD5E1' : '#475569',
                              padding: '1px 3px'
                            }}
                            title="Move up"
                          >
                            <FiChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={index === popularProducts.length - 1}
                            onClick={() => handleMovePopularProduct(index, 1)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: index === popularProducts.length - 1 ? 'not-allowed' : 'pointer',
                              color: index === popularProducts.length - 1 ? '#CBD5E1' : '#475569',
                              padding: '1px 3px'
                            }}
                            title="Move down"
                          >
                            <FiChevronDown size={14} />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Image Thumbnail */}
                    <td style={{ padding: '10px 14px' }}>
                      <img
                        src={prod.image}
                        alt={prod.name}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '1px solid #E2E8F0'
                        }}
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = '/garam_masala.png'
                        }}
                      />
                    </td>

                    {/* Name */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--admin-text-main)', fontSize: '0.9rem' }}>
                        {prod.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        slug: /{prod.slug || prod.id}
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          backgroundColor: '#F1F5F9',
                          color: '#334155'
                        }}
                      >
                        {prod.category}
                      </span>
                    </td>

                    {/* WhatsApp Contact */}
                    <td style={{ padding: '10px 14px', fontSize: '0.84rem', color: '#475569' }}>
                      {prod.whatsappNumber || storeSettings.whatsappNumber || '+919876543210'}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleEditPopularProductClick(prod)}
                          title="Edit product card"
                          style={{ color: '#0284C7' }}
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => setDeletePopularId(prod.id)}
                          title="Delete product"
                          style={{ color: '#EF4444' }}
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. ABOUT COMPANY ("WHO WE ARE") SHOWCASE */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <FiAward className="card-title-icon" size={20} />
            </div>
            <div>
              <div className="card-title-row">
                <h2 className="card-title">About Company ("Who We Are") Showcase</h2>
                <span className="live-count-badge" style={{ backgroundColor: (storeSettings.activeHomepage || 'home1') === 'home2' ? '#FDF2F8' : '#FEF3C7', color: (storeSettings.activeHomepage || 'home1') === 'home2' ? '#DB2777' : '#B45309', border: `1px solid ${(storeSettings.activeHomepage || 'home1') === 'home2' ? '#FBCFE8' : '#FDE68A'}` }}>
                  {(storeSettings.activeHomepage || 'home1') === 'home2' ? 'Homepage 2 (Beauty Care)' : 'Homepage 1 (Masala Company)'}
                </span>
              </div>
              <p className="card-subtitle">
                Customize the showcase image, stats badges, heading titles, story paragraphs, and call-to-action button.
              </p>
            </div>
          </div>
          <div className="card-header-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetAboutDefaults}
              title="Reset About Company Showcase to default values"
            >
              <FiRotateCcw size={14} /> Reset Defaults
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveAboutSection}
              style={{ backgroundColor: '#D97706', borderColor: '#D97706' }}
            >
              <FiSave size={16} /> Save About Section
            </button>
          </div>
        </div>

        {/* Section Tag & Main Title */}
        <div className="form-row" style={{ gap: '16px', marginBottom: '14px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Subtitle Tag</label>
            <input
              type="text"
              className="form-input"
              value={aboutForm.subtitle}
              onChange={(e) => setAboutForm({ ...aboutForm, subtitle: e.target.value })}
              placeholder="e.g. — WHO WE ARE"
            />
          </div>
          <div className="form-group" style={{ flex: 1.5 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Main Heading Title</label>
            <input
              type="text"
              className="form-input"
              value={aboutForm.title}
              onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
              placeholder="e.g. About Our Company"
            />
          </div>
        </div>

        {/* Showcase Image Upload / URL Controls */}
        <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--admin-card-border)', marginBottom: '16px' }}>
          <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiImage size={15} color="#4F46E5" /> Showcase Image (Left Column)
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{
                flex: 1,
                justifyContent: 'center',
                fontSize: '0.8rem',
                padding: '6px 10px',
                backgroundColor: aboutImageSourceType === 'upload' ? '#EEF2FF' : '#FFFFFF',
                borderColor: aboutImageSourceType === 'upload' ? '#6366F1' : 'var(--admin-card-border)',
                color: aboutImageSourceType === 'upload' ? '#4F46E5' : 'var(--admin-text-main)',
                fontWeight: 700
              }}
              onClick={() => setAboutImageSourceType('upload')}
            >
              <FiUploadCloud size={15} /> Upload Image File
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{
                flex: 1,
                justifyContent: 'center',
                fontSize: '0.8rem',
                padding: '6px 10px',
                backgroundColor: aboutImageSourceType === 'url' ? '#EEF2FF' : '#FFFFFF',
                borderColor: aboutImageSourceType === 'url' ? '#6366F1' : 'var(--admin-card-border)',
                color: aboutImageSourceType === 'url' ? '#4F46E5' : 'var(--admin-text-main)',
                fontWeight: 700
              }}
              onClick={() => setAboutImageSourceType('url')}
            >
              <FiLink size={15} /> Paste Image URL
            </button>
          </div>

          {aboutImageSourceType === 'upload' ? (
            <input
              type="file"
              accept="image/*"
              className="form-input"
              style={{ padding: '7px 10px', background: '#FFFFFF', cursor: 'pointer' }}
              onChange={handleAboutImageFileSelect}
            />
          ) : (
            <input
              type="url"
              className="form-input"
              value={aboutForm.image}
              onChange={(e) => setAboutForm({ ...aboutForm, image: e.target.value })}
              placeholder="https://example.com/showcase.jpg"
            />
          )}
        </div>

        {/* 2 Glassmorphism Badges Controls */}
        <div style={{ padding: '16px', background: '#FFFBEB', borderRadius: '12px', border: '1px solid #FDE68A', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#92400E', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiAward size={15} /> Overlay Badges (Display on Showcase Image)
          </div>
          <div className="form-row" style={{ gap: '16px', marginBottom: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" style={{ fontWeight: 600, color: '#78350F' }}>
                Badge 1 Stat (Top-Left)
              </label>
              <input
                type="text"
                className="form-input"
                value={aboutForm.b1Num}
                onChange={(e) => setAboutForm({ ...aboutForm, b1Num: e.target.value })}
                placeholder="e.g. 12+"
              />
            </div>
            <div className="form-group" style={{ flex: 1.5 }}>
              <label className="form-label" style={{ fontWeight: 600, color: '#78350F' }}>
                Badge 1 Label Text
              </label>
              <input
                type="text"
                className="form-input"
                value={aboutForm.b1Lbl}
                onChange={(e) => setAboutForm({ ...aboutForm, b1Lbl: e.target.value })}
                placeholder="e.g. YEARS ESTABLISHED"
              />
            </div>
          </div>
          <div className="form-row" style={{ gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" style={{ fontWeight: 600, color: '#78350F' }}>
                Badge 2 Stat (Bottom-Right)
              </label>
              <input
                type="text"
                className="form-input"
                value={aboutForm.b2Num}
                onChange={(e) => setAboutForm({ ...aboutForm, b2Num: e.target.value })}
                placeholder="e.g. 35+"
              />
            </div>
            <div className="form-group" style={{ flex: 1.5 }}>
              <label className="form-label" style={{ fontWeight: 600, color: '#78350F' }}>
                Badge 2 Label Text
              </label>
              <input
                type="text"
                className="form-input"
                value={aboutForm.b2Lbl}
                onChange={(e) => setAboutForm({ ...aboutForm, b2Lbl: e.target.value })}
                placeholder="e.g. TEAM MEMBERS"
              />
            </div>
          </div>
        </div>

        {/* Story Description Paragraphs */}
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label className="form-label" style={{ fontWeight: 600 }}>Story Paragraph 1</label>
          <textarea
            rows={3}
            className="form-textarea"
            style={{ padding: '8px 12px', minHeight: '65px' }}
            value={aboutForm.desc1}
            onChange={(e) => setAboutForm({ ...aboutForm, desc1: e.target.value })}
            placeholder="First descriptive paragraph..."
          />
        </div>

        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label" style={{ fontWeight: 600 }}>Story Paragraph 2</label>
          <textarea
            rows={3}
            className="form-textarea"
            style={{ padding: '8px 12px', minHeight: '65px' }}
            value={aboutForm.desc2}
            onChange={(e) => setAboutForm({ ...aboutForm, desc2: e.target.value })}
            placeholder="Second descriptive paragraph..."
          />
        </div>

        {/* CTA Button Text & Destination Link */}
        <div className="form-row" style={{ gap: '16px', marginBottom: '20px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>CTA Button Text</label>
            <input
              type="text"
              className="form-input"
              value={aboutForm.btnText}
              onChange={(e) => setAboutForm({ ...aboutForm, btnText: e.target.value })}
              placeholder="e.g. About More"
            />
          </div>
          <div className="form-group" style={{ flex: 1.5 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Button Link Destination</label>
            <input
              type="text"
              className="form-input"
              value={aboutForm.btnLink}
              onChange={(e) => setAboutForm({ ...aboutForm, btnLink: e.target.value })}
              placeholder="e.g. /about-company"
            />
          </div>
        </div>

        {/* LIVE ABOUT COMPANY SECTION PREVIEW */}
        <div style={{ marginTop: '14px', marginBottom: '16px' }}>
          <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px' }}>
            Live About Company Showcase Preview:
          </label>
          <div
            style={{
              backgroundColor: '#FAF5EE',
              borderRadius: '16px',
              padding: '24px 20px',
              border: '1px solid #E5DCCE',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: '24px',
              alignItems: 'center'
            }}
          >
            {/* Image with Glass Badges Preview */}
            <div style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
              <img
                src={aboutForm.image}
                alt="About Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
                }}
              />
              {/* Badge 1 */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 10px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid rgba(255,255,255,0.8)'
                }}
              >
                <FiAward size={16} color="#B45309" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#1E293B', lineHeight: 1 }}>{aboutForm.b1Num || '12+'}</div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>{aboutForm.b1Lbl || 'YEARS ESTABLISHED'}</div>
                </div>
              </div>
              {/* Badge 2 */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  background: 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 10px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid rgba(255,255,255,0.8)'
                }}
              >
                <FiUsers size={16} color="#4F46E5" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#1E293B', lineHeight: 1 }}>{aboutForm.b2Num || '35+'}</div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>{aboutForm.b2Lbl || 'TEAM MEMBERS'}</div>
                </div>
              </div>
            </div>

            {/* Text Preview */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                {aboutForm.subtitle || '— WHO WE ARE'}
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
                {aboutForm.title || 'About Our Company'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, margin: '0 0 8px 0' }}>
                {aboutForm.desc1}
              </p>
              <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, margin: '0 0 12px 0' }}>
                {aboutForm.desc2}
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#1E293B', color: '#FFFFFF', padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>
                {aboutForm.btnText || 'About More'} <FiArrowRight size={13} />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSaveAboutSection}
            style={{ padding: '9px 22px', fontSize: '0.88rem', fontWeight: 700, backgroundColor: '#D97706', borderColor: '#D97706' }}
          >
            <FiSave size={16} /> Save About Section
          </button>
        </div>
      </div>

      {/* 3. WHY CHOOSE US SECTION MANAGEMENT */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
              <ShieldCheck className="card-title-icon" size={20} />
            </div>
            <div>
              <div className="card-title-row">
                <h2 className="card-title">Why Choose Us Section Management</h2>
                <span className="live-count-badge" style={{ backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }}>
                  {whyChooseList.length} Highlights
                </span>
              </div>
              <p className="card-subtitle">
                Customize the Why Choose Us header titles, icons, and highlight cards shown on the homepage.
              </p>
            </div>
          </div>
          <div className="card-header-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetWhyChooseDefaults}
              title="Reset Why Choose Us to default values"
            >
              <FiRotateCcw size={14} /> Reset Defaults
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleAddWhyChooseClick}
              style={{ backgroundColor: '#B45309', borderColor: '#B45309' }}
            >
              <FiPlus size={16} /> Add Feature Card
            </button>
          </div>
        </div>

        {/* Section Headings Form */}
        <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--admin-card-border)', marginBottom: '18px' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--admin-text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiEdit2 size={14} color="#B45309" /> Section Headings & Subtitle
          </div>
          <div className="form-row" style={{ gap: '16px', marginBottom: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Subtitle Tag</label>
              <input
                type="text"
                className="form-input"
                value={whyChooseMeta.tag}
                onChange={(e) => setWhyChooseMeta({ ...whyChooseMeta, tag: e.target.value })}
                placeholder="e.g. • WHY CHOOSE US •"
              />
            </div>
            <div className="form-group" style={{ flex: 1.5 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Main Title</label>
              <input
                type="text"
                className="form-input"
                value={whyChooseMeta.title}
                onChange={(e) => setWhyChooseMeta({ ...whyChooseMeta, title: e.target.value })}
                placeholder="e.g. Why Choose Us"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Section Subtitle</label>
            <input
              type="text"
              className="form-input"
              value={whyChooseMeta.subtitle}
              onChange={(e) => setWhyChooseMeta({ ...whyChooseMeta, subtitle: e.target.value })}
              placeholder="e.g. Our Commitment to Quality, Purity & Customer Satisfaction"
            />
          </div>
        </div>

        {/* Configured Feature Cards List */}
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label className="form-label" style={{ margin: 0, fontWeight: 700, color: 'var(--admin-text-main)' }}>
            Configured Feature Cards ({whyChooseList.length}):
          </label>
          <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
            Click Edit to modify the title, description, or icon.
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '12px', marginBottom: '20px' }}>
          {whyChooseList.map((item, index) => (
            <div
              key={item.id || index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid var(--admin-card-border)',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#FEF3C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {renderWhyChooseIcon(item.icon, 18, '#92400E')}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--admin-text-main)', marginBottom: '3px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', lineHeight: 1.4 }}>
                    {item.description}
                  </div>
                  <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.7rem', fontWeight: 600, color: '#92400E', backgroundColor: '#FFFBEB', padding: '1px 6px', borderRadius: '4px' }}>
                    Icon: {item.icon || 'ShieldCheck'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <button
                  type="button"
                  className="btn-icon"
                  title="Edit Feature"
                  onClick={() => handleEditWhyChooseClick(item)}
                >
                  <FiEdit2 size={14} />
                </button>

                {deleteWhyChooseId === item.id ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      borderRadius: '6px',
                      padding: '2px 5px'
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', color: '#991B1B', fontWeight: 700 }}>
                      Del?
                    </span>
                    <button
                      type="button"
                      style={{
                        backgroundColor: '#EF4444',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      onClick={() => handleDeleteWhyChooseItem(item.id)}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      style={{
                        backgroundColor: '#FFFFFF',
                        color: '#475569',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
                        padding: '2px 4px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={() => setDeleteWhyChooseId(null)}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-icon delete"
                    title="Delete Feature"
                    onClick={() => setDeleteWhyChooseId(item.id)}
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* LIVE WHY CHOOSE US SECTION PREVIEW (Matching user's screenshot) */}
        <div style={{ marginTop: '16px', marginBottom: '16px' }}>
          <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px' }}>
            Live Why Choose Us Preview (Capsule Section):
          </label>
          <div
            style={{
              backgroundColor: '#F9F6F0',
              borderRadius: '16px',
              padding: '32px 20px',
              border: '1px solid #E5DCCE',
              textAlign: 'center'
            }}
          >
            {/* Header */}
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', letterSpacing: '1.2px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              {whyChooseMeta.tag || '• WHY CHOOSE US •'}
            </span>
            <h2 style={{ fontFamily: 'serif', fontSize: '1.8rem', color: '#1B3B2B', margin: '0 0 6px 0', fontWeight: 700 }}>
              {whyChooseMeta.title || 'Why Choose Us'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#52665B', margin: '0 0 24px 0' }}>
              {whyChooseMeta.subtitle || 'Our Commitment to Your Perfect Beauty Experience'}
            </p>

            {/* White Capsule Frame Container */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                padding: '28px 20px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
                border: '1px solid #ECE7DE',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                gap: '16px',
                alignItems: 'stretch'
              }}
            >
              {whyChooseList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '0 12px',
                    position: 'relative'
                  }}
                >
                  {/* Icon Circle */}
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: '#F7F0E6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px'
                    }}
                  >
                    {renderWhyChooseIcon(item.icon, 24, '#8C5E37')}
                  </div>

                  <h3 style={{ fontFamily: 'serif', fontSize: '1.05rem', fontWeight: 700, color: '#1B3B2B', margin: '0 0 8px 0' }}>
                    {item.title}
                  </h3>
                  <div style={{ width: '28px', height: '2px', backgroundColor: '#C8A97E', marginBottom: '10px' }} />
                  <p style={{ fontSize: '0.8rem', color: '#5B6B62', lineHeight: 1.5, margin: 0 }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSaveWhyChooseSettings}
            style={{ padding: '9px 22px', fontSize: '0.88rem', fontWeight: 700, backgroundColor: '#B45309', borderColor: '#B45309' }}
          >
            <FiSave size={16} /> Save Why Choose Us
          </button>
        </div>
      </div>

      {/* 3.5. CUSTOMER REVIEWS ("WHAT THEY SAY ABOUT US") MANAGEMENT */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header">
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
              <MessageSquareQuote size={20} />
            </div>
            <div>
              <h2 className="card-title">Customer Reviews & Testimonials</h2>
              <p className="card-subtitle">
                Manage the "What They Say About Us" customer testimonial cards, ratings, badges, and avatar photos.
              </p>
            </div>
          </div>
          <div className="card-header-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetReviewDefaults}
              title="Reset reviews to defaults"
            >
              <FiRotateCcw size={14} /> Reset Defaults
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleAddReviewClick}
              style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
            >
              <FiPlus size={16} /> Add Review
            </button>
          </div>
        </div>

        {/* Section Heading & Tagline Inputs */}
        <div className="form-grid" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>
              Section Subtitle Tag
            </label>
            <input
              type="text"
              className="form-input"
              value={reviewMeta.tag}
              onChange={(e) => setReviewMeta({ ...reviewMeta, tag: e.target.value })}
              placeholder="e.g. — CUSTOMER LOVE"
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>
              Section Main Heading Title
            </label>
            <input
              type="text"
              className="form-input"
              value={reviewMeta.title}
              onChange={(e) => setReviewMeta({ ...reviewMeta, title: e.target.value })}
              placeholder="e.g. What They Say About Us"
            />
          </div>
        </div>

        {/* Existing Reviews List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
            Testimonial Cards ({reviewsList.length})
          </label>

          {reviewsList.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: '#FAFAF9',
                border: '1px solid #E7E5E4',
                borderRadius: '12px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={item.name}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                    border: '2px solid #FFFFFF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                  }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--admin-text-main)' }}>
                      {item.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#2D6A4F',
                        backgroundColor: 'rgba(82, 183, 136, 0.15)',
                        padding: '1px 8px',
                        borderRadius: '12px',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {item.category || 'TRUST & QUALITY'}
                    </span>
                    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                      {[...Array(5)].map((_, i) => (
                        <LucideStar
                          key={i}
                          size={12}
                          color="#F59E0B"
                          fill={i < (item.rating || 5) ? '#F59E0B' : 'transparent'}
                        />
                      ))}
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D97706', marginLeft: '3px' }}>
                        {item.rating || 5}.0
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--admin-text-muted)',
                      fontStyle: 'italic',
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    "{item.review}"
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#78716C', marginTop: '2px' }}>
                    {item.verified || 'Verified Buyer'} · {item.location || 'India'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <button
                  type="button"
                  className="btn-icon"
                  title="Edit Review"
                  onClick={() => handleEditReviewClick(item)}
                >
                  <FiEdit2 size={14} />
                </button>

                {deleteReviewId === item.id ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      borderRadius: '6px',
                      padding: '2px 5px'
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', color: '#991B1B', fontWeight: 700 }}>
                      Del?
                    </span>
                    <button
                      type="button"
                      style={{
                        backgroundColor: '#EF4444',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      onClick={() => handleDeleteReviewItem(item.id)}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      style={{
                        backgroundColor: '#FFFFFF',
                        color: '#475569',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
                        padding: '2px 4px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={() => setDeleteReviewId(null)}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-icon delete"
                    title="Delete Review"
                    onClick={() => setDeleteReviewId(item.id)}
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* LIVE STOREFRONT PREVIEW (Matching user's screenshot) */}
        <div style={{ marginTop: '16px', marginBottom: '16px' }}>
          <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px' }}>
            Live Reviews Storefront Preview:
          </label>
          <div
            style={{
              backgroundColor: '#FAF5EE',
              borderRadius: '20px',
              padding: '36px 24px',
              border: '1px solid #E8DFD3',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  color: '#64748B',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '8px'
                }}
              >
                {reviewMeta.tag || '— CUSTOMER LOVE'}
              </span>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#12213D', margin: 0, letterSpacing: '-0.5px' }}>
                {reviewMeta.title?.includes('About Us') ? (
                  <>
                    {reviewMeta.title.split('About Us')[0]}
                    <span style={{ color: '#4A7BB0' }}>About Us</span>
                    {reviewMeta.title.split('About Us').slice(1).join('About Us')}
                  </>
                ) : (
                  reviewMeta.title || 'What They Say About Us'
                )}
              </h2>
            </div>

            {/* Horizontal Cards Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
                gap: '18px'
              }}
            >
              {reviewsList.slice(0, 3).map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    border: '1.5px solid #E3D8CC',
                    padding: '22px 20px',
                    boxShadow: '0 8px 24px rgba(47, 39, 32, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '16px',
                      fontFamily: 'serif',
                      fontSize: '44px',
                      color: 'rgba(18, 33, 61, 0.08)',
                      pointerEvents: 'none'
                    }}
                  >
                    “
                  </div>

                  <div>
                    {/* Top Row: Category Tag & Stars */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          color: '#2D6A4F',
                          backgroundColor: 'rgba(82, 183, 136, 0.12)',
                          border: '1px solid rgba(82, 183, 136, 0.2)',
                          padding: '3px 12px',
                          borderRadius: '16px',
                          letterSpacing: '0.8px',
                          textTransform: 'uppercase'
                        }}
                      >
                        {item.category || 'TRUST & QUALITY'}
                      </span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <LucideStar
                            key={i}
                            size={13}
                            color="#F59E0B"
                            fill={i < (item.rating || 5) ? '#F59E0B' : 'transparent'}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Body */}
                    <p style={{ fontSize: '0.86rem', lineHeight: 1.6, color: '#334155', fontStyle: 'italic', margin: '0 0 18px 0' }}>
                      "{item.review}"
                    </p>
                  </div>

                  {/* Bottom Row: Author & Rating Pill */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                        alt={item.name}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #FFFFFF',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                        }}
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                        }}
                      />
                      <div>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                          {item.name}
                        </h4>
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {item.verified || 'Verified Buyer'} · {item.location || 'India'}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        backgroundColor: '#FEF3C7',
                        border: '1px solid #FDE68A',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#B45309'
                      }}
                    >
                      <LucideStar size={11} color="#F59E0B" fill="#F59E0B" />
                      <span>{item.rating || 5}.0 ★</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSaveReviewSettings}
            style={{ padding: '9px 22px', fontSize: '0.88rem', fontWeight: 700, backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
          >
            <FiSave size={16} /> Save Customer Reviews
          </button>
        </div>
      </div>


      {/* 4. SECTION VISIBILITY TOGGLES */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="card-title-group">
            <div className="card-title-icon-wrapper">
              <FiEye className="card-title-icon" size={20} />
            </div>
            <div>
              <h2 className="card-title">Section Visibility Controls</h2>
              <p className="card-subtitle">
                Toggle dynamic homepage layout sections and storefront content blocks.
              </p>
            </div>
          </div>
        </div>

        <div className="toggle-row-list">
          <div className="toggle-item">
            <div className="toggle-label-group">
              <span className="toggle-title">Hero Carousel Slider</span>
              <span className="toggle-desc">Top main carousel banner section</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={!!sectionVisibility.heroSlider}
                onChange={() => handleToggleSection('heroSlider')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-item">
            <div className="toggle-label-group">
              <span className="toggle-title">Trusted By Partners Ticker</span>
              <span className="toggle-desc">Horizontal scrolling partner marquee right below hero banner</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={sectionVisibility.trustedBy !== false}
                onChange={() => handleToggleSection('trustedBy')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-item">
            <div className="toggle-label-group">
              <span className="toggle-title">Featured Products Grid</span>
              <span className="toggle-desc">Showcase top recommended spice items</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={!!sectionVisibility.featuredProducts}
                onChange={() => handleToggleSection('featuredProducts')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-item">
            <div className="toggle-label-group">
              <span className="toggle-title">Popular Products Coverflow Carousel</span>
              <span className="toggle-desc">Trending items 3D interactive coverflow carousel</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={sectionVisibility.popularProducts !== false}
                onChange={() => handleToggleSection('popularProducts')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-item">
            <div className="toggle-label-group">
              <span className="toggle-title">Why Choose Us Section</span>
              <span className="toggle-desc">Highlight organic quality & fast delivery metrics</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={!!sectionVisibility.whyChoose}
                onChange={() => handleToggleSection('whyChoose')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-item">
            <div className="toggle-label-group">
              <span className="toggle-title">Customer Video & Text Reviews</span>
              <span className="toggle-desc">Display social proof & customer ratings</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={!!sectionVisibility.reviews}
                onChange={() => handleToggleSection('reviews')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-item">
            <div className="toggle-label-group">
              <span className="toggle-title">Frequently Asked Questions (FAQ)</span>
              <span className="toggle-desc">Accordion view of customer common questions</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={!!sectionVisibility.faq}
                onChange={() => handleToggleSection('faq')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-item">
            <div className="toggle-label-group">
              <span className="toggle-title">Latest Articles / Blog Grid</span>
              <span className="toggle-desc">Recent recipe guides & spice tips</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={!!sectionVisibility.blogs}
                onChange={() => handleToggleSection('blogs')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. FREQUENTLY ASKED QUESTIONS (FAQ) MANAGEMENT */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
              <FiHelpCircle className="card-title-icon" size={20} />
            </div>
            <div>
              <div className="card-title-row">
                <h2 className="card-title">Frequently Asked Questions (FAQ)</h2>
                <span className="live-count-badge" style={{ backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }}>
                  {faqs.length} Questions
                </span>
              </div>
              <p className="card-subtitle">
                Add, edit, reorder questions & answers, or customize FAQ headings and support contact prompts.
              </p>
            </div>
          </div>
          <div className="card-header-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetFaqs}
              title="Reset questions to defaults"
            >
              <FiRotateCcw size={14} /> Reset Defaults
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleAddFaqClick}
              style={{ backgroundColor: '#059669', borderColor: '#059669' }}
            >
              <FiPlus size={16} /> Add FAQ Question
            </button>
          </div>
        </div>

        {/* FAQ Section Headings Customization */}
        <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--admin-card-border)', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--admin-text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiEdit2 size={14} color="#059669" /> Section Headings & Support Link Configuration
          </div>
          <div className="form-row" style={{ gap: '16px', marginBottom: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Subtitle Tag</label>
              <input
                type="text"
                className="form-input"
                value={faqMeta.subtitle}
                onChange={(e) => setFaqMeta({ ...faqMeta, subtitle: e.target.value })}
                placeholder="e.g. COMMON QUESTIONS"
              />
            </div>
            <div className="form-group" style={{ flex: 1.5 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Main Heading</label>
              <input
                type="text"
                className="form-input"
                value={faqMeta.title}
                onChange={(e) => setFaqMeta({ ...faqMeta, title: e.target.value })}
                placeholder="e.g. Frequently asked questions."
              />
            </div>
          </div>
          <div className="form-row" style={{ gap: '16px' }}>
            <div className="form-group" style={{ flex: 1.5 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Support Prompt Text</label>
              <input
                type="text"
                className="form-input"
                value={faqMeta.contactPrompt}
                onChange={(e) => setFaqMeta({ ...faqMeta, contactPrompt: e.target.value })}
                placeholder="e.g. Can't find what you're looking for?"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Support Button / Link Text</label>
              <input
                type="text"
                className="form-input"
                value={faqMeta.contactBtnText}
                onChange={(e) => setFaqMeta({ ...faqMeta, contactBtnText: e.target.value })}
                placeholder="e.g. Contact support"
              />
            </div>
          </div>
        </div>

        {/* FAQ Items Interactive List */}
        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label className="form-label" style={{ margin: 0, fontWeight: 700, color: 'var(--admin-text-main)' }}>
            Configured FAQ Questions & Answers ({faqs.length}):
          </label>
          <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
            Use the arrows to reorder questions on the homepage.
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {faqs.map((faq, index) => (
            <div
              key={faq.id || index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid var(--admin-card-border)',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                gap: '12px'
              }}
            >
              {/* Left: Number and Q/A preview */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '8px',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  #{index + 1}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      color: 'var(--admin-text-main)',
                      marginBottom: '3px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={faq.question}
                  >
                    {faq.question}
                  </div>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--admin-text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.4
                    }}
                    title={faq.answer}
                  >
                    {faq.answer}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                {/* Reorder Buttons */}
                <button
                  type="button"
                  className="btn-icon"
                  title="Move Up"
                  disabled={index === 0}
                  onClick={() => handleMoveFaq(index, 'up')}
                  style={{ opacity: index === 0 ? 0.35 : 1, cursor: index === 0 ? 'not-allowed' : 'pointer' }}
                >
                  <FiArrowUp size={14} />
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  title="Move Down"
                  disabled={index === faqs.length - 1}
                  onClick={() => handleMoveFaq(index, 'down')}
                  style={{ opacity: index === faqs.length - 1 ? 0.35 : 1, cursor: index === faqs.length - 1 ? 'not-allowed' : 'pointer' }}
                >
                  <FiArrowDown size={14} />
                </button>

                {/* Edit Button */}
                <button
                  type="button"
                  className="btn-icon"
                  title="Edit FAQ"
                  onClick={() => handleEditFaqClick(faq)}
                >
                  <FiEdit2 size={14} />
                </button>

                {/* Delete Button with Confirmation */}
                {deleteFaqId === faq.id ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      borderRadius: '6px',
                      padding: '2px 6px'
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', color: '#991B1B', fontWeight: 700 }}>
                      Delete?
                    </span>
                    <button
                      type="button"
                      style={{
                        backgroundColor: '#EF4444',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 7px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      onClick={() => handleDeleteFaq(faq.id)}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      style={{
                        backgroundColor: '#FFFFFF',
                        color: '#475569',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
                        padding: '2px 5px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={() => setDeleteFaqId(null)}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-icon delete"
                    title="Delete Question"
                    onClick={() => setDeleteFaqId(faq.id)}
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* LIVE FAQ PREVIEW BOX */}
        <div style={{ marginTop: '20px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
              Live FAQ Section Preview (Interactive Accordion):
            </label>
            <span style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 600, backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
              ✓ Click questions below to test open/close animation
            </span>
          </div>

          <div
            style={{
              backgroundColor: '#f9f6f0',
              borderRadius: '16px',
              padding: '28px 24px',
              border: '1px solid #e7ded0',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '28px', alignItems: 'flex-start' }}>
              {/* Left Column Preview */}
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#244232',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '10px'
                  }}
                >
                  {faqMeta.subtitle || 'COMMON QUESTIONS'}
                </span>
                <h3
                  style={{
                    fontFamily: 'serif',
                    fontSize: '1.5rem',
                    color: '#1a3325',
                    lineHeight: 1.15,
                    marginBottom: '16px',
                    fontWeight: 700,
                    whiteSpace: 'pre-line'
                  }}
                >
                  {faqMeta.title || 'Frequently asked questions.'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#4a5568', margin: 0 }}>
                  {faqMeta.contactPrompt || "Can't find what you're looking for?"}{' '}
                  <span
                    style={{
                      color: '#0d6efd',
                      fontWeight: 600,
                      backgroundColor: 'rgba(13, 110, 253, 0.1)',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      display: 'inline-block',
                      marginTop: '4px'
                    }}
                  >
                    {faqMeta.contactBtnText || 'Contact support'}
                  </span>
                </p>
              </div>

              {/* Right Column Accordion Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {faqs.map((item, idx) => {
                  const isOpen = previewFaqOpenId === (item.id || idx)
                  return (
                    <div
                      key={item.id || idx}
                      style={{
                        backgroundColor: '#ebe4d8',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setPreviewFaqOpenId(isOpen ? null : (item.id || idx))}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#244232' }}>
                          {item.question}
                        </span>
                        {isOpen ? <FiChevronUp size={16} color="#244232" /> : <FiChevronDown size={16} color="#244232" />}
                      </button>
                      {isOpen && (
                        <div style={{ padding: '0 16px 14px 16px', fontSize: '0.82rem', color: '#4a5568', lineHeight: 1.5 }}>
                          {item.answer}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Save FAQ Changes Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSaveFaqSettings}
            style={{ padding: '9px 22px', fontSize: '0.88rem', fontWeight: 700, backgroundColor: '#059669', borderColor: '#059669' }}
          >
            <FiSave size={16} /> Save FAQ Settings
          </button>
        </div>
      </div>

      {/* 4. HEADER LOGO & THEME CUSTOMIZATION */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ backgroundColor: '#EEF2FF' }}>
              <FiImage className="card-title-icon" size={20} color="#4F46E5" />
            </div>
            <div>
              <h2 className="card-title">Header Logo Settings</h2>
              <p className="card-subtitle">
                Enter logo name or upload a logo image. Click "Save Changes" to update the header logo.
              </p>
            </div>
          </div>
        </div>

        {/* Simple Logo Inputs Row */}
        <div className="form-row" style={{ gap: '20px', alignItems: 'flex-start', marginBottom: '16px' }}>
          {/* Logo Name Input */}
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Logo Name / Brand Text</label>
            <input
              type="text"
              className="form-input"
              value={logoTextDraft}
              onChange={(e) => setLogoTextDraft(e.target.value)}
              placeholder="e.g. QuickEnquiry"
            />
          </div>

          {/* Upload Logo Image & Action Controls */}
          <div className="form-group" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="form-label" style={{ fontWeight: 600, margin: 0 }}>Upload Logo Image</label>
              {logoUrlDraft && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '3px 9px', color: '#4F46E5', borderColor: '#A5B4FC' }}
                    onClick={() => setCropModalOpen(true)}
                    title="Crop / Cut unwanted borders of image"
                  >
                    <FiCrop size={14} /> Cut / Crop Image
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '3px 9px', color: '#EF4444', borderColor: '#FCA5A5' }}
                    onClick={() => setLogoUrlDraft('')}
                    title="Remove uploaded image"
                  >
                    <FiTrash size={14} /> Cut / Remove
                  </button>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="form-input"
              style={{ padding: '7px 10px', background: '#FFFFFF', cursor: 'pointer' }}
              onChange={handleLogoFileSelect}
            />
          </div>
        </div>

        {/* Live Logo Preview Box (Real-time draft preview) */}
        <div style={{ marginTop: '10px', marginBottom: '18px' }}>
          <label className="form-label" style={{ marginBottom: '6px', fontWeight: 600, color: 'var(--admin-text-main)' }}>
            Header Logo Live Preview (Before Saving):
          </label>
          <div
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              background: storeSettings.topbarBgColor || '#E0F2FE',
              color: storeSettings.topbarTextColor || '#1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid var(--admin-card-border)',
              transition: 'all 0.25s ease'
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'inherit', opacity: 0.7 }}>
              *Welcome <span style={{ textDecoration: 'underline' }}>Enquiry Now</span> *
            </span>

            {/* Dynamic Draft Logo Live Preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {logoUrlDraft ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={logoUrlDraft}
                    alt={logoTextDraft || 'QuickEnquiry'}
                    style={{ maxHeight: '38px', objectFit: 'contain' }}
                  />
                  {logoTextDraft && (
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'inherit' }}>
                      {logoTextDraft}
                    </span>
                  )}
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '3px 8px', fontSize: '0.72rem', color: '#4F46E5', borderColor: '#A5B4FC', background: '#FFFFFF', marginLeft: '4px' }}
                    onClick={() => setCropModalOpen(true)}
                  >
                    <FiCrop size={12} /> Crop
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '3px 8px', fontSize: '0.72rem', color: '#EF4444', borderColor: '#FCA5A5', background: '#FFFFFF' }}
                    onClick={() => setLogoUrlDraft('')}
                  >
                    <FiTrash size={12} /> Cut Image
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCommentDots style={{ fontSize: '22px', color: '#86d2a3' }} />
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'inherit' }}>
                    {logoTextDraft || 'QuickEnquiry'}
                  </span>
                </div>
              )}
            </div>

            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'inherit', opacity: 0.7 }}>
              Search... 🔍
            </span>
          </div>
        </div>

        {/* Save Logo Changes Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSaveLogo}
            style={{ padding: '9px 22px', fontSize: '0.88rem', fontWeight: 700 }}
          >
            <FiSave size={16} /> Save Changes
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: 'var(--admin-card-border)', margin: '20px 0' }} />

        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '4px', height: '22px', borderRadius: '4px', background: 'linear-gradient(180deg, #6366F1 0%, #4338CA 100%)', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0, color: '#1E1B4B', background: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Header Topbar Theme & Colors
            </h3>
            <p className="card-subtitle" style={{ margin: '2px 0 0 0' }}>
              Customize topbar background color and text color.
            </p>
          </div>
        </div>

        {/* Custom Color Pickers with Dropdown Select & Direct Text Input */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>
              Top Bar Background Color
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="color"
                value={parseCssColorToHex(storeSettings.topbarBgColor, '#E0F2FE')}
                onChange={(e) =>
                  setStoreSettings({ ...storeSettings, topbarBgColor: e.target.value })
                }
                title="Click to open color picker"
                style={{ width: '42px', height: '42px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 }}
              />
              <input
                type="text"
                className="form-input"
                value={storeSettings.topbarBgColor || '#E0F2FE'}
                onChange={(e) =>
                  setStoreSettings({ ...storeSettings, topbarBgColor: e.target.value })
                }
                placeholder="Type name (red, blue) or #hex"
                style={{ flex: 1 }}
              />
              <select
                className="form-input"
                value={COLOR_PRESET_OPTIONS.some(c => c.value === storeSettings.topbarBgColor?.toLowerCase()) ? storeSettings.topbarBgColor.toLowerCase() : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setStoreSettings({ ...storeSettings, topbarBgColor: e.target.value })
                  }
                }}
                style={{ width: '180px', flexShrink: 0, cursor: 'pointer' }}
              >
                {COLOR_PRESET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>
              Top Bar Text & Link Color
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="color"
                value={parseCssColorToHex(storeSettings.topbarTextColor, '#1E293B')}
                onChange={(e) =>
                  setStoreSettings({ ...storeSettings, topbarTextColor: e.target.value })
                }
                title="Click to open color picker"
                style={{ width: '42px', height: '42px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 }}
              />
              <input
                type="text"
                className="form-input"
                value={storeSettings.topbarTextColor || '#1E293B'}
                onChange={(e) =>
                  setStoreSettings({ ...storeSettings, topbarTextColor: e.target.value })
                }
                placeholder="Type name (white, black) or #hex"
                style={{ flex: 1 }}
              />
              <select
                className="form-input"
                value={COLOR_PRESET_OPTIONS.some(c => c.value === storeSettings.topbarTextColor?.toLowerCase()) ? storeSettings.topbarTextColor.toLowerCase() : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setStoreSettings({ ...storeSettings, topbarTextColor: e.target.value })
                  }
                }}
                style={{ width: '180px', flexShrink: 0, cursor: 'pointer' }}
              >
                {COLOR_PRESET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Topbar Color & Logo Preview Box */}
        <div style={{ marginTop: '14px' }}>
          <label className="form-label" style={{ marginBottom: '6px' }}>
            Live Header Topbar & Logo Preview:
          </label>
          <div
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              background: storeSettings.topbarBgColor || '#E0F2FE',
              color: storeSettings.topbarTextColor || '#1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid var(--admin-card-border)',
              transition: 'all 0.25s ease'
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'inherit' }}>
              *Welcome <span style={{ textDecoration: 'underline' }}>Enquiry Now</span> *
            </span>

            {/* Dynamic Logo Live Preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              {storeSettings.logoUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src={storeSettings.logoUrl}
                    alt={storeSettings.logoText || 'QuickEnquiry'}
                    style={{ maxHeight: '36px', objectFit: 'contain' }}
                  />
                  {storeSettings.logoText && (
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'inherit' }}>
                      {storeSettings.logoText}
                    </span>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCommentDots style={{ fontSize: '22px', color: '#86d2a3' }} />
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'inherit' }}>
                    {storeSettings.logoText || 'QuickEnquiry'}
                  </span>
                </div>
              )}
            </div>

            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'inherit' }}>
              Search... 🔍
            </span>
          </div>
        </div>

        {/* Save Theme & Colors Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSaveThemeColors}
            style={{ padding: '9px 22px', fontSize: '0.88rem', fontWeight: 700 }}
          >
            <FiSave size={16} /> Save Changes
          </button>
        </div>
      </div>

      {/* BOTTOM ACTION SAVE BAR */}
      <div
        className="admin-card"
        style={{
          marginTop: '24px',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFDF9',
          border: '1px solid var(--admin-card-border)',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div>
          <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
            Save Storefront Configuration
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
            Apply and persist all changes made to hero banners, section visibility, and topbar theme colors.
          </div>
        </div>

        <button className="btn-primary" onClick={handleSaveAll} style={{ padding: '10px 22px', fontSize: '0.9rem' }}>
          <FiSave size={16} /> Save All Settings
        </button>
      </div>
      {modalOpen &&
        createPortal(
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">
                  {editingSlide ? 'Edit Hero Banner Slide' : 'Add New Hero Banner Slide'}
                </h3>
                <button className="btn-icon" onClick={() => setModalOpen(false)} aria-label="Close">
                  <FiX size={18} />
                </button>
              </div>
              <form onSubmit={handleSlideFormSubmit}>
                <div className="modal-body" style={{ padding: '14px 18px' }}>
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label className="form-label" style={{ marginBottom: '4px' }}>Banner Headline Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '8px 12px' }}
                      value={slideForm.title}
                      onChange={(e) =>
                        setSlideForm({ ...slideForm, title: e.target.value })
                      }
                      placeholder="e.g. Pure Turmeric Powder"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label className="form-label" style={{ marginBottom: '4px' }}>Subhead Description</label>
                    <textarea
                      rows={2}
                      className="form-textarea"
                      style={{ minHeight: '50px', padding: '8px 12px', resize: 'vertical' }}
                      value={slideForm.subtitle}
                      onChange={(e) =>
                        setSlideForm({ ...slideForm, subtitle: e.target.value })
                      }
                      placeholder="Brief description highlight..."
                    />
                  </div>

                  {/* Dual Image Input Mode: File Upload vs URL Link */}
                  <div className="form-group" style={{ marginBottom: '4px' }}>
                    <label className="form-label" style={{ marginBottom: '4px' }}>Banner Background Image *</label>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          padding: '6px 10px',
                          backgroundColor:
                            imageSourceType === 'upload' ? '#EEF2FF' : '#FAF6F0',
                          borderColor:
                            imageSourceType === 'upload' ? '#6366F1' : 'var(--admin-card-border)',
                          color: imageSourceType === 'upload' ? '#4F46E5' : 'var(--admin-text-main)',
                          fontWeight: 700
                        }}
                        onClick={() => setImageSourceType('upload')}
                      >
                        <FiUploadCloud size={15} /> Upload Image File
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          padding: '6px 10px',
                          backgroundColor:
                            imageSourceType === 'url' ? '#EEF2FF' : '#FAF6F0',
                          borderColor:
                            imageSourceType === 'url' ? '#6366F1' : 'var(--admin-card-border)',
                          color: imageSourceType === 'url' ? '#4F46E5' : 'var(--admin-text-main)',
                          fontWeight: 700
                        }}
                        onClick={() => setImageSourceType('url')}
                      >
                        <FiLink size={15} /> Paste Image URL Link
                      </button>
                    </div>

                    {imageSourceType === 'upload' ? (
                      <div
                        style={{
                          border: slideForm.url ? '2px solid #10B981' : '2px dashed var(--admin-card-border)',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          backgroundColor: slideForm.url ? '#ECFDF5' : '#FAF6F0',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => document.getElementById('hero-slide-file-input').click()}
                      >
                        <input
                          id="hero-slide-file-input"
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleFileUpload}
                        />
                        {slideForm.url ? (
                          <>
                            <FiCheckCircle size={18} color="#10B981" />
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#059669' }}>
                              Selected: {uploadedFileName || 'Image File Loaded ✓'}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#64748B', marginLeft: '6px' }}>(Click to change)</span>
                          </>
                        ) : (
                          <>
                            <FiUploadCloud size={18} color="#6366F1" />
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                              Click to select image file from device (JPG, PNG, WEBP)
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <input
                        type="url"
                        className="form-input"
                        style={{ padding: '8px 12px' }}
                        value={slideForm.url}
                        onChange={(e) =>
                          setSlideForm({ ...slideForm, url: e.target.value })
                        }
                        placeholder="https://images.unsplash.com/..."
                        required={imageSourceType === 'url'}
                      />
                    )}

                    {/* Compact Image Thumbnail Preview */}
                    {slideForm.url && (
                      <div
                        style={{
                          marginTop: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '6px 10px',
                          backgroundColor: '#FAF6F0',
                          border: '1px solid var(--admin-card-border)',
                          borderRadius: '8px'
                        }}
                      >
                        <img
                          src={slideForm.url}
                          alt="Uploaded Preview"
                          style={{
                            width: '54px',
                            height: '38px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid var(--admin-card-border)'
                          }}
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.style.display = 'none'
                          }}
                        />
                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-main)', fontWeight: 600 }}>
                          Image Preview Ready
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <FiCheck size={16} /> Save Slide
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* EASY MOUSE SELECTION CROPPER MODAL */}
      {cropModalOpen &&
        createPortal(
          <div
            className="modal-overlay"
            onClick={() => setCropModalOpen(false)}
            onMouseMove={handleDragMove}
            onMouseUp={handleEndDrag}
            onTouchMove={handleDragMove}
            onTouchEnd={handleEndDrag}
          >
            <div className="modal-content" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiCrop size={18} color="#6366F1" /> Crop Logo Image
                </h3>
                <button className="btn-icon" onClick={() => setCropModalOpen(false)} aria-label="Close">
                  <FiX size={18} />
                </button>
              </div>

              <div className="modal-body" style={{ padding: '16px 20px' }}>
                <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0 0 14px 0' }}>
                  Drag the box or corner handles with your mouse pointer to select the crop area.
                </p>

                {/* Main Interactive Crop Container */}
                <div
                  ref={cropContainerRef}
                  style={{
                    width: '100%',
                    height: '280px',
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none',
                    touchAction: 'none'
                  }}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleEndDrag}
                >
                  <img
                    src={logoUrlDraft}
                    alt="Crop Target"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Resizable & Draggable Crop Selection Box */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${cropBox.x}%`,
                      top: `${cropBox.y}%`,
                      width: `${cropBox.width}%`,
                      height: `${cropBox.height}%`,
                      border: '2px solid #38BDF8',
                      boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)',
                      cursor: 'move',
                      boxSizing: 'border-box'
                    }}
                    onMouseDown={(e) => handleStartDrag('move', e)}
                    onTouchStart={(e) => handleStartDrag('move', e)}
                  >
                    {/* Corner Drag Handles */}
                    {/* Top-Left Handle */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-7px',
                        left: '-7px',
                        width: '14px',
                        height: '14px',
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #0284C7',
                        borderRadius: '50%',
                        cursor: 'nwse-resize',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                      }}
                      onMouseDown={(e) => handleStartDrag('tl', e)}
                      onTouchStart={(e) => handleStartDrag('tl', e)}
                    />

                    {/* Top-Right Handle */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-7px',
                        right: '-7px',
                        width: '14px',
                        height: '14px',
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #0284C7',
                        borderRadius: '50%',
                        cursor: 'nesw-resize',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                      }}
                      onMouseDown={(e) => handleStartDrag('tr', e)}
                      onTouchStart={(e) => handleStartDrag('tr', e)}
                    />

                    {/* Bottom-Left Handle */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-7px',
                        left: '-7px',
                        width: '14px',
                        height: '14px',
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #0284C7',
                        borderRadius: '50%',
                        cursor: 'nesw-resize',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                      }}
                      onMouseDown={(e) => handleStartDrag('bl', e)}
                      onTouchStart={(e) => handleStartDrag('bl', e)}
                    />

                    {/* Bottom-Right Handle */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-7px',
                        right: '-7px',
                        width: '14px',
                        height: '14px',
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #0284C7',
                        borderRadius: '50%',
                        cursor: 'nwse-resize',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                      }}
                      onMouseDown={(e) => handleStartDrag('br', e)}
                      onTouchStart={(e) => handleStartDrag('br', e)}
                    />
                  </div>
                </div>

                {/* Quick Presets Bar */}
                <div style={{ marginTop: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Quick Presets:</span>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '3px 10px' }}
                    onClick={() => setCropBox({ x: 5, y: 5, width: 90, height: 90 })}
                  >
                    Reset Full
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '3px 10px' }}
                    onClick={() => setCropBox({ x: 25, y: 10, width: 50, height: 80 })}
                  >
                    Square 1:1
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '3px 10px' }}
                    onClick={() => setCropBox({ x: 5, y: 25, width: 90, height: 50 })}
                  >
                    Header Banner
                  </button>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setCropModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="btn-primary" onClick={handleApplyCrop}>
                  <FiCheck size={16} /> Apply Crop
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* FAQ ADD / EDIT MODAL */}
      {faqModalOpen &&
        createPortal(
          <div className="modal-overlay" onClick={() => setFaqModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
              <div className="modal-header">
                <h3 className="modal-title">
                  {editingFaq ? 'Edit FAQ Item' : 'Add New FAQ Question'}
                </h3>
                <button className="btn-icon" onClick={() => setFaqModalOpen(false)} aria-label="Close">
                  <FiX size={18} />
                </button>
              </div>
              <form onSubmit={handleFaqFormSubmit}>
                <div className="modal-body" style={{ padding: '16px 20px' }}>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>
                      Question Title *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={faqForm.question}
                      onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                      placeholder="e.g. How can I submit an enquiry?"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>
                      Detailed Answer *
                    </label>
                    <textarea
                      rows={4}
                      className="form-textarea"
                      style={{ padding: '10px 12px', minHeight: '95px', resize: 'vertical' }}
                      value={faqForm.answer}
                      onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                      placeholder="e.g. You can submit an enquiry by filling out the enquiry form on our website..."
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: '12px 20px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setFaqModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ backgroundColor: '#059669', borderColor: '#059669' }}>
                    <FiCheck size={16} /> {editingFaq ? 'Update FAQ' : 'Add Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* WHY CHOOSE US ADD / EDIT MODAL */}
      {whyChooseModalOpen &&
        createPortal(
          <div className="modal-overlay" onClick={() => setWhyChooseModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
              <div className="modal-header">
                <h3 className="modal-title">
                  {editingWhyChooseItem ? 'Edit Why Choose Us Feature' : 'Add New Feature Highlight'}
                </h3>
                <button className="btn-icon" onClick={() => setWhyChooseModalOpen(false)} aria-label="Close">
                  <FiX size={18} />
                </button>
              </div>
              <form onSubmit={handleWhyChooseFormSubmit}>
                <div className="modal-body" style={{ padding: '16px 20px' }}>
                  {/* Feature Title */}
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>
                      Feature Title *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={whyChooseForm.title}
                      onChange={(e) => setWhyChooseForm({ ...whyChooseForm, title: e.target.value })}
                      placeholder="e.g. Trusted by Partners"
                      required
                    />
                  </div>

                  {/* Icon Selector */}
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>
                      Badge Icon *
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          backgroundColor: '#FEF3C7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: '1px solid #FDE68A'
                        }}
                      >
                        {renderWhyChooseIcon(whyChooseForm.icon, 22, '#92400E')}
                      </div>
                      <select
                        className="form-input"
                        value={whyChooseForm.icon}
                        onChange={(e) => setWhyChooseForm({ ...whyChooseForm, icon: e.target.value })}
                        style={{ flex: 1, cursor: 'pointer' }}
                      >
                        {WHY_CHOOSE_ICON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>
                      Description *
                    </label>
                    <textarea
                      rows={3}
                      className="form-textarea"
                      style={{ padding: '10px 12px', minHeight: '85px', resize: 'vertical' }}
                      value={whyChooseForm.description}
                      onChange={(e) => setWhyChooseForm({ ...whyChooseForm, description: e.target.value })}
                      placeholder="e.g. We are the preferred choice of distributors, wholesalers and retailers across the country."
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: '12px 20px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setWhyChooseModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ backgroundColor: '#B45309', borderColor: '#B45309' }}>
                    <FiCheck size={16} /> {editingWhyChooseItem ? 'Update Feature' : 'Add Feature'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* CUSTOMER REVIEWS ADD / EDIT MODAL */}
      {reviewModalOpen &&
        createPortal(
          <div className="modal-overlay" onClick={() => setReviewModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
              <div className="modal-header">
                <h3 className="modal-title">
                  {editingReview ? 'Edit Customer Review' : 'Add New Customer Review'}
                </h3>
                <button className="btn-icon" onClick={() => setReviewModalOpen(false)} aria-label="Close">
                  <FiX size={18} />
                </button>
              </div>
              <form onSubmit={handleReviewFormSubmit}>
                <div className="modal-body" style={{ padding: '16px 20px' }}>
                  <div className="form-grid" style={{ marginBottom: '12px' }}>
                    {/* Reviewer Name */}
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>
                        Customer / Reviewer Name *
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                        placeholder="e.g. Vikram Singh"
                        required
                      />
                    </div>

                    {/* Tag / Category Badge */}
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>
                        Category Pill Badge *
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={reviewForm.category}
                        onChange={(e) => setReviewForm({ ...reviewForm, category: e.target.value })}
                        placeholder="e.g. NATIONAL IMPACT, TRUST & QUALITY"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid" style={{ marginBottom: '12px' }}>
                    {/* Star Rating */}
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>
                        Star Rating
                      </label>
                      <select
                        className="form-input"
                        value={reviewForm.rating}
                        onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ 5 Stars (Excellent)</option>
                        <option value={4}>⭐⭐⭐⭐ 4 Stars (Very Good)</option>
                        <option value={3}>⭐⭐⭐ 3 Stars (Good)</option>
                        <option value={2}>⭐⭐ 2 Stars (Fair)</option>
                        <option value={1}>⭐ 1 Star (Poor)</option>
                      </select>
                    </div>

                    {/* City / Location */}
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>
                        City / Location
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={reviewForm.location}
                        onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                        placeholder="e.g. Jaipur, Mumbai, Delhi"
                      />
                    </div>
                  </div>

                  {/* Verification Tag */}
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>
                      Verification Badge Text
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={reviewForm.verified}
                      onChange={(e) => setReviewForm({ ...reviewForm, verified: e.target.value })}
                      placeholder="e.g. Verified Buyer, Wholesale Client"
                    />
                  </div>

                  {/* Testimonial Quote */}
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>
                      Testimonial Quote *
                    </label>
                    <textarea
                      rows={3}
                      className="form-textarea"
                      style={{ padding: '10px 12px', minHeight: '80px', resize: 'vertical' }}
                      value={reviewForm.review}
                      onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                      placeholder="e.g. Excellent experience from ordering to delivery. The product quality is premium and the customer support team is very helpful."
                      required
                    />
                  </div>

                  {/* Reviewer Avatar Image */}
                  <div className="form-group" style={{ marginBottom: '6px' }}>
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>
                      Reviewer Avatar Photo
                    </label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          padding: '6px 10px',
                          backgroundColor: reviewImageSourceType === 'upload' ? '#EEF2FF' : '#FAF6F0',
                          borderColor: reviewImageSourceType === 'upload' ? '#4F46E5' : 'var(--admin-card-border)',
                          color: reviewImageSourceType === 'upload' ? '#4F46E5' : 'var(--admin-text-main)',
                          fontWeight: 700
                        }}
                        onClick={() => setReviewImageSourceType('upload')}
                      >
                        <FiUploadCloud size={14} /> Upload Avatar Photo
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          padding: '6px 10px',
                          backgroundColor: reviewImageSourceType === 'url' ? '#EEF2FF' : '#FAF6F0',
                          borderColor: reviewImageSourceType === 'url' ? '#4F46E5' : 'var(--admin-card-border)',
                          color: reviewImageSourceType === 'url' ? '#4F46E5' : 'var(--admin-text-main)',
                          fontWeight: 700
                        }}
                        onClick={() => setReviewImageSourceType('url')}
                      >
                        <FiLink size={14} /> Photo Web URL
                      </button>
                    </div>

                    {reviewImageSourceType === 'upload' ? (
                      <div className="upload-dropzone" style={{ padding: '12px' }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleReviewAvatarFileSelect}
                          id="reviewAvatarFileInput"
                          style={{ display: 'none' }}
                        />
                        <label
                          htmlFor="reviewAvatarFileInput"
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: '#4F46E5',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                          }}
                        >
                          <FiImage size={18} /> Click here to select image file
                        </label>
                      </div>
                    ) : (
                      <input
                        type="url"
                        className="form-input"
                        value={reviewForm.image}
                        onChange={(e) => setReviewForm({ ...reviewForm, image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                      />
                    )}

                    {/* Thumbnail Preview */}
                    {reviewForm.image && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <img
                          src={reviewForm.image}
                          alt="Avatar preview"
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1.5px solid #CBD5E1'
                          }}
                        />
                        <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                          Avatar photo preview
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: '12px 20px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setReviewModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}>
                    <FiCheck size={16} /> {editingReview ? 'Update Review' : 'Add Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* POPULAR PRODUCT ADD / EDIT MODAL */}
      {popularModalOpen &&
        createPortal(
          <div className="modal-overlay" style={{ zIndex: 10000 }}>
            <div className="modal-card" style={{ maxWidth: '520px', width: '90%' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid var(--admin-card-border)', padding: '16px 20px' }}>
                <div>
                  <h3 className="modal-title" style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                    {editingPopularItem ? 'Edit Popular Product' : 'Add Popular Product'}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0 0' }}>
                    Configure the product card shown in the 3D coverflow carousel.
                  </p>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setPopularModalOpen(false)}
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handlePopularFormSubmit}>
                <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Product Name */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Product Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={popularForm.name}
                      onChange={(e) => setPopularForm({ ...popularForm, name: e.target.value })}
                      placeholder="e.g. Kitchen King Masala"
                    />
                  </div>

                  {/* Category & Slug */}
                  <div className="form-row" style={{ gap: '12px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>Category</label>
                      <input
                        type="text"
                        className="form-input"
                        value={popularForm.category}
                        onChange={(e) => setPopularForm({ ...popularForm, category: e.target.value })}
                        placeholder="e.g. MIX MASALA"
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>Page Slug</label>
                      <input
                        type="text"
                        className="form-input"
                        value={popularForm.slug}
                        onChange={(e) => setPopularForm({ ...popularForm, slug: e.target.value })}
                        placeholder="e.g. kitchen-king-masala"
                      />
                    </div>
                  </div>

                  {/* WhatsApp Bulk Number & PDF URL */}
                  <div className="form-row" style={{ gap: '12px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>WhatsApp Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={popularForm.whatsappNumber}
                        onChange={(e) => setPopularForm({ ...popularForm, whatsappNumber: e.target.value })}
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>Catalog PDF URL</label>
                      <input
                        type="text"
                        className="form-input"
                        value={popularForm.pdfUrl}
                        onChange={(e) => setPopularForm({ ...popularForm, pdfUrl: e.target.value })}
                        placeholder="https://.../catalog.pdf"
                      />
                    </div>
                  </div>

                  {/* Product Image */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Product Image</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Square format recommended</span>
                    </label>

                    {/* Image Source Mode Tabs */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <button
                        type="button"
                        style={{
                          flex: 1,
                          padding: '6px',
                          borderRadius: '6px',
                          border: popularImageSourceType === 'upload' ? '1.5px solid #0284C7' : '1px solid #CBD5E1',
                          backgroundColor: popularImageSourceType === 'upload' ? '#F0F9FF' : '#FFFFFF',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          color: popularImageSourceType === 'upload' ? '#0284C7' : 'var(--admin-text-main)',
                          fontWeight: 700
                        }}
                        onClick={() => setPopularImageSourceType('upload')}
                      >
                        <FiUploadCloud size={14} /> Upload Image File
                      </button>
                      <button
                        type="button"
                        style={{
                          flex: 1,
                          padding: '6px',
                          borderRadius: '6px',
                          border: popularImageSourceType === 'url' ? '1.5px solid #0284C7' : '1px solid #CBD5E1',
                          backgroundColor: popularImageSourceType === 'url' ? '#F0F9FF' : '#FFFFFF',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          color: popularImageSourceType === 'url' ? '#0284C7' : 'var(--admin-text-main)',
                          fontWeight: 700
                        }}
                        onClick={() => setPopularImageSourceType('url')}
                      >
                        <FiLink size={14} /> Image Web URL
                      </button>
                    </div>

                    {popularImageSourceType === 'upload' ? (
                      <div className="upload-dropzone" style={{ padding: '12px' }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePopularImageFileSelect}
                          id="popularProductFileInput"
                          style={{ display: 'none' }}
                        />
                        <label
                          htmlFor="popularProductFileInput"
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: '#0284C7',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                          }}
                        >
                          <FiImage size={18} /> Click here to select image file
                        </label>
                      </div>
                    ) : (
                      <input
                        type="url"
                        className="form-input"
                        value={popularForm.image}
                        onChange={(e) => setPopularForm({ ...popularForm, image: e.target.value })}
                        placeholder="https://images.unsplash.com/... or /garam_masala.png"
                      />
                    )}

                    {/* Thumbnail Preview */}
                    {popularForm.image && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <img
                          src={popularForm.image}
                          alt="Product preview"
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            border: '1.5px solid #CBD5E1'
                          }}
                        />
                        <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                          Product image preview
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: '12px 20px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setPopularModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ backgroundColor: '#0284C7', borderColor: '#0284C7' }}>
                    <FiCheck size={16} /> {editingPopularItem ? 'Update Product' : 'Add to Carousel'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* POPULAR PRODUCT DELETE CONFIRMATION MODAL */}
      {deletePopularId !== null &&
        createPortal(
          <div className="modal-overlay" style={{ zIndex: 10000 }}>
            <div className="modal-card" style={{ maxWidth: '400px' }}>
              <div className="modal-header">
                <h3 className="modal-title" style={{ color: '#EF4444' }}>Delete Popular Product?</h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setDeletePopularId(null)}
                >
                  <FiX size={18} />
                </button>
              </div>
              <div className="modal-body" style={{ padding: '16px 20px' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>
                  Are you sure you want to remove this product from the Popular Products Coverflow Carousel? This action can be undone by resetting defaults.
                </p>
              </div>
              <div className="modal-footer" style={{ padding: '12px 20px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setDeletePopularId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ backgroundColor: '#EF4444', borderColor: '#EF4444' }}
                  onClick={() => handleDeletePopularProduct(deletePopularId)}
                >
                  <FiTrash2 size={16} /> Yes, Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default React.memo(HomepageSettings)

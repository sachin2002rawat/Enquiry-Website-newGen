import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiClock, 
  FiStar, 
  FiCheckCircle, 
  FiMessageSquare
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import ProductNavbar from '../components/ProductNavbar'
import Footer from '../components/Footer'
import ScrollReveal from '../components/ScrollReveal'
import { useActiveHomepage } from '../hooks/useActiveHomepage'
import { useLiveBlogs } from '../hooks/useLiveBlogs'
import { useEnquiryModal } from '../context/EnquiryModalContext'
import { apiService } from '../api/apiService'
import { getWhatsAppUrl } from '../utils/whatsappHelper'
import { getCategoryName } from '../utils/categoryHelper'
import { getFullImageUrl } from '../utils/imageUrl'
import './BlogDetail.css'

export { getFullImageUrl }

const BlogDetail = () => {
  const { id } = useParams()
  const { openEnquiryModal } = useEnquiryModal()
  const activeHomepage = useActiveHomepage()
  const { blogs, blogSettings } = useLiveBlogs()

  // Dynamic Contact State (WhatsApp number/link & website enquiry email)
  const [contactSettings, setContactSettings] = useState(() => {
    let whatsappNum = '+91 9555140701'
    let whatsappLinkType = 'number'
    let whatsappCustomUrl = ''
    let email = 'info@enquirybrand.com'

    try {
      const storeSaved = localStorage.getItem('enquiry_admin_store_settings')
      if (storeSaved) {
        const p = JSON.parse(storeSaved)
        if (p.whatsappNumber) whatsappNum = p.whatsappNumber
        if (p.whatsappLinkType) whatsappLinkType = p.whatsappLinkType
        if (p.whatsappCustomUrl) whatsappCustomUrl = p.whatsappCustomUrl
        if (p.footerEmail || p.companyEmail) email = p.footerEmail || p.companyEmail
      }
      const footerSaved = localStorage.getItem('enquiry_admin_footer_settings')
      if (footerSaved) {
        const f = JSON.parse(footerSaved)
        if (f.footerEmail) email = f.footerEmail
        if (f.footerPhone && !whatsappNum) whatsappNum = f.footerPhone
      }
    } catch {}

    return {
      whatsappNumber: whatsappNum,
      whatsappLinkType,
      whatsappCustomUrl,
      email
    }
  })

  // Synchronize contact settings with backend and localStorage
  useEffect(() => {
    let isMounted = true

    const fetchLiveContact = async () => {
      try {
        const [waData, settingsData] = await Promise.all([
          apiService.getWhatsappSettings().catch(() => null),
          apiService.getSettings().catch(() => null)
        ])

        if (isMounted) {
          setContactSettings((prev) => ({
            whatsappNumber: waData?.whatsappNumber || settingsData?.whatsappNumber || prev.whatsappNumber,
            whatsappLinkType: waData?.whatsappLinkType || settingsData?.whatsappLinkType || prev.whatsappLinkType,
            whatsappCustomUrl: waData?.whatsappCustomUrl !== undefined ? waData.whatsappCustomUrl : (settingsData?.whatsappCustomUrl || prev.whatsappCustomUrl),
            email: settingsData?.footerEmail || settingsData?.companyEmail || prev.email
          }))
        }
      } catch {}
    }

    fetchLiveContact()

    const handleSync = () => {
      try {
        let whatsappNum = ''
        let whatsappLinkType = 'number'
        let whatsappCustomUrl = ''
        let email = ''

        const storeSaved = localStorage.getItem('enquiry_admin_store_settings')
        if (storeSaved) {
          const p = JSON.parse(storeSaved)
          if (p.whatsappNumber) whatsappNum = p.whatsappNumber
          if (p.whatsappLinkType) whatsappLinkType = p.whatsappLinkType
          if (p.whatsappCustomUrl) whatsappCustomUrl = p.whatsappCustomUrl
          if (p.footerEmail || p.companyEmail) email = p.footerEmail || p.companyEmail
        }
        const footerSaved = localStorage.getItem('enquiry_admin_footer_settings')
        if (footerSaved) {
          const f = JSON.parse(footerSaved)
          if (f.footerEmail) email = f.footerEmail
          if (f.footerPhone && !whatsappNum) whatsappNum = f.footerPhone
        }

        setContactSettings((prev) => ({
          whatsappNumber: whatsappNum || prev.whatsappNumber,
          whatsappLinkType: whatsappLinkType || prev.whatsappLinkType,
          whatsappCustomUrl: whatsappCustomUrl || prev.whatsappCustomUrl,
          email: email || prev.email
        }))
      } catch {}
    }

    window.addEventListener('storage', handleSync)
    return () => {
      isMounted = false
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // 1. Choose article dataset strictly matching the active homepage
  const activeDataset = useMemo(() => {
    if (activeHomepage === 'home2') {
      return (blogs || []).filter(
        b => b.targetHomepage === 'home2' || b.targetHomepage === 'all'
      )
    }

    return (blogs || []).filter(
      b => b.targetHomepage === 'home1' || b.targetHomepage === 'all' || !b.targetHomepage
    )
  }, [activeHomepage, blogs])

  // 2. Find matching article strictly within blogs dataset
  const article = useMemo(() => {
    if (!blogs || blogs.length === 0) {
      return null
    }
    const found = (blogs || []).find(
      p => String(p._id) === String(id) || String(p.id) === String(id) || p.slug === id
    )
    return found || null
  }, [blogs, id])

  // 3. Get 3 related articles strictly from active dataset
  const relatedArticles = useMemo(() => {
    if (!activeDataset || !article) return []
    return activeDataset
      .filter(p => String(p._id || p.id) !== String(article._id || article.id))
      .slice(0, 3)
  }, [activeDataset, article])

  // Scroll to top on mount or ID change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!article) {
    return (
      <div className="blog-detail-page">
        <ProductNavbar />
        <div style={{ maxWidth: '800px', margin: '80px auto', textAlign: 'center', padding: '40px 20px' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#1E293B', marginBottom: '12px' }}>Blog Article Not Found</h2>
          <p style={{ color: '#64748B', marginBottom: '24px' }}>The requested article does not exist or may have been removed.</p>
          <Link to="/blog" style={{ padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#4F46E5', color: '#ffffff', fontWeight: 600 }}>
            <FiArrowLeft size={16} /> Back to All Articles
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const defaultImageFallback = activeHomepage === 'home2'
    ? 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
    : '/premium_spices.png'

  const articleTitle = article.title || article.name || 'Product Article'
  const categoryLabel = getCategoryName(article.category) || 'FEATURED ARTICLE'
  const articleImage = getFullImageUrl(article.image) || defaultImageFallback

  // Dynamic Key Highlights callout points (editable per blog in Admin)
  const highlightsList = useMemo(() => {
    if (Array.isArray(article.keyHighlights) && article.keyHighlights.length > 0) {
      return article.keyHighlights
    }
    return [
      '100% Authentic quality sourced directly from trusted organic farms.',
      article.description || 'Premium curated culinary ingredients.',
      'Processed under strict ISO-certified hygienic standards with zero artificial additives.'
    ]
  }, [article])

  // Dynamic Body Paragraphs (editable per blog in Admin)
  const paragraphsList = useMemo(() => {
    if (Array.isArray(article.fullDescription) && article.fullDescription.length > 0) {
      return article.fullDescription
    }
    return [
      article.description || 'Our dedicated research and culinary experts bring you authentic, wholesome recipes and nutrition guides.',
      'Every batch undergoes rigorous quality assurance tests to ensure optimal flavor, aroma, and essential nutrient retention. Trusted by thousands of households, distributors, and food processing partners nationwide.'
    ]
  }, [article])

  // Dynamic Why Choose Us sidebar points (editable in Admin Blog Settings)
  const whyChooseHighlights = useMemo(() => {
    if (activeHomepage === 'home2') {
      return blogSettings?.whyChooseHighlightsBeauty || [
        { title: '100% Clean & Botanical:', desc: 'Cruelty-free organic actives.' },
        { title: 'Dermatologist Tested:', desc: 'Gentle and safe for all skin types.' },
        { title: 'Sustainable Packaging:', desc: 'Recyclable eco-friendly materials.' }
      ]
    }
    return blogSettings?.whyChooseHighlightsMasala || [
      { title: '100% Pure & Fresh:', desc: 'Direct farm sourcing.' },
      { title: 'Fast Nationwide Shipping:', desc: 'Secure packaging.' },
      { title: 'Verified Export Standards:', desc: 'Certified processing.' }
    ]
  }, [activeHomepage, blogSettings])

  return (
    <div className="blog-detail-page">
      {/* Top Navbar */}
      <ProductNavbar />

      {/* Hero Header Section - Combined 2-Column Single Row Layout */}
      <ScrollReveal variant="up">
        <section className="blog-detail-hero-section">
          <div className="blog-detail-hero-container">
            
            <div className="blog-detail-hero-row">
            {/* Left Column: Content */}
            <div className="blog-detail-hero-left">
              {/* Top Bar with Back Button & Category */}
              <div className="blog-detail-top-nav">
                <Link to="/blog" className="back-to-blogs-btn">
                  <FiArrowLeft size={16} /> Back to All Articles
                </Link>
                <span className="blog-detail-category-badge">
                  {categoryLabel}
                </span>
              </div>

              {/* Article Title */}
              <h1 className="blog-detail-title">{articleTitle}</h1>

              {/* Short Description */}
              {article.description && (
                <p className="blog-detail-hero-desc">
                  {article.description}
                </p>
              )}

              {/* Metadata: Date, Read Time, Rating */}
              <div className="blog-detail-meta">
                <div className="blog-detail-meta-item">
                  <FiCalendar size={15} /> {article.date || 'Updated August 2026'}
                </div>
                <div className="blog-detail-meta-item">
                  <FiClock size={15} /> {article.readTime || '5 min read'}
                </div>
                <div className="blog-detail-meta-item rating-item">
                  <FiStar size={15} fill="#f59e0b" color="#f59e0b" /> {article.rating || 4.9} ({article.reviewsCount || 215} Customer Reviews)
                </div>
              </div>
            </div>

            {/* Right Column: Featured Image */}
            <div className="blog-detail-hero-right">
              <div className="blog-detail-cover-wrapper">
                <img
                  src={articleImage}
                  alt={articleTitle}
                  className="blog-detail-cover-img"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = defaultImageFallback
                  }}
                />
              </div>
            </div>
          </div>

        </div>
      </section>
      </ScrollReveal>

      {/* Main Content Section */}
      <ScrollReveal variant="up">
        <section className="blog-detail-main-section">
          {/* 2-Column Grid */}
          <div className="blog-detail-grid">
            
            {/* Main Article Content Column */}
            <div className="blog-detail-content-col">
              
              {/* Key Highlights Callout Box */}
              <div className="blog-key-highlights-box">
                <h3 className="blog-key-highlights-title">
                  <FiCheckCircle color="#166534" size={20} /> Key Highlights & Summary
                </h3>
                <ul className="blog-key-highlights-list">
                  {highlightsList.map((hl, index) => (
                    <li key={index}>
                      <FiCheckCircle size={16} /> 
                      {hl}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Paragraphs Content */}
              {paragraphsList.map((paragraph, idx) => (
                <p key={idx} className="blog-detail-paragraph">
                  {paragraph}
                </p>
              ))}

              {/* Product Specifications & Details Card */}
              <div className="blog-specs-card">
                <h3 className="blog-specs-title">Product Specifications</h3>
                <div className="blog-specs-grid">
                  <div className="blog-spec-item">
                    <div className="blog-spec-label">SKU Code</div>
                    <div className="blog-spec-value">{article.sku || 'SKU-8829-EX'}</div>
                  </div>
                  <div className="blog-spec-item">
                    <div className="blog-spec-label">Net Weight</div>
                    <div className="blog-spec-value">{article.netWeight || article.weight || '200g / Pack'}</div>
                  </div>
                  <div className="blog-spec-item">
                    <div className="blog-spec-label">Min Order Qty</div>
                    <div className="blog-spec-value">{article.minOrderQty || '50 Units'}</div>
                  </div>
                  <div className="blog-spec-item">
                    <div className="blog-spec-label">Availability</div>
                    <div className="blog-spec-value" style={{ color: '#166534' }}>{article.availability || 'In Stock'}</div>
                  </div>
                </div>
              </div>

              {/* Inline Enquiry Banner */}
              <div className="blog-enquiry-banner">
                <div className="blog-enquiry-text">
                  <h4>{blogSettings?.enquiryBannerTitle || 'Interested in Bulk Orders?'}</h4>
                  <p>{blogSettings?.enquiryBannerSubtitle || 'Send an instant enquiry for wholesale pricing & custom packaging.'}</p>
                </div>
                <div className="blog-enquiry-actions">
                  <a 
                    href={(() => {
                      const email = contactSettings.email || 'info@enquirybrand.com'
                      const subject = encodeURIComponent(`Bulk Order Enquiry: ${articleTitle}`)
                      const body = encodeURIComponent(
                        `Dear Sales & Enquiries Team,\n\nI am interested in bulk ordering / wholesale for "${articleTitle}"${article?.sku ? ` (SKU: ${article.sku})` : ''}.\n\nPlease provide quotation and availability details:\n- Product / Article: ${articleTitle}\n- Target Quantity: ${article?.minOrderQty || '50 Units'}\n- Packaging: Wholesale / Custom Packaging\n\nLooking forward to your response.\n\nBest regards.`
                      )
                      return `mailto:${email}?subject=${subject}&body=${body}`
                    })()}
                    className="blog-enquire-now-btn"
                    title={`Send enquiry email to ${contactSettings.email || 'info@enquirybrand.com'}`}
                  >
                    <FiMessageSquare size={16} /> {blogSettings?.enquiryButtonText || 'Send Enquiry'}
                  </a>
                  <a
                    href={(() => {
                      const target = (contactSettings.whatsappLinkType === 'custom_link' && contactSettings.whatsappCustomUrl)
                        ? contactSettings.whatsappCustomUrl
                        : (contactSettings.whatsappNumber || '+91 9555140701')
                      return getWhatsAppUrl(
                        target, 
                        `Hi! I would like to make an enquiry regarding "${articleTitle}"${article?.sku ? ` (SKU: ${article.sku})` : ''}. Please share pricing and bulk details.`
                      )
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="blog-whatsapp-btn"
                    title={`Contact on WhatsApp: ${contactSettings.whatsappNumber || '+91 9555140701'}`}
                  >
                    <FaWhatsapp size={18} /> {blogSettings?.whatsappButtonText || 'WhatsApp'}
                  </a>
                </div>
              </div>

            </div>

            {/* Sidebar Column */}
            <aside className="blog-detail-sidebar">
              
              {/* Trending / Recommended Articles Widget */}
              <div className="blog-sidebar-widget">
                <h3 className="blog-widget-title">Related Articles</h3>
                <div className="blog-related-list">
                  {relatedArticles.map((item, idx) => {
                    const relId = item._id || item.id || idx
                    const relTitle = item.title || item.name || 'Related Article'
                    const relCat = getCategoryName(item.category) || 'Product'
                    const relImg = getFullImageUrl(item.image) || defaultImageFallback

                    return (
                      <Link 
                        key={relId} 
                        to={`/blog/${relId}`} 
                        className="blog-related-card"
                      >
                        <img
                          src={relImg}
                          alt={relTitle}
                          className="blog-related-thumb"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = defaultImageFallback
                          }}
                        />
                        <div className="blog-related-info">
                          <span className="blog-related-cat">{relCat}</span>
                          <h4 className="blog-related-title">{relTitle}</h4>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Quality Commitment Widget */}
              <div className="blog-sidebar-widget" style={{ background: '#f1e7dd', borderColor: '#e3d6c8' }}>
                <h3 className="blog-widget-title" style={{ borderColor: '#d9cbbe' }}>
                  {blogSettings?.whyChooseTitle || 'Why Choose Us?'}
                </h3>
                <ul className="blog-key-highlights-list" style={{ gap: '12px' }}>
                  {whyChooseHighlights.map((point, index) => (
                    <li key={index}>
                      <FiCheckCircle color="#166534" size={16} />
                      <strong>{point.title}</strong> {point.desc}
                    </li>
                  ))}
                </ul>
              </div>

            </aside>

          </div>

        </section>
      </ScrollReveal>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default React.memo(BlogDetail)

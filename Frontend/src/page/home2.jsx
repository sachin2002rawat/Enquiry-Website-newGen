import React, { Suspense, lazy, useState, useEffect, useMemo } from 'react'
import Topbar from '../components/Topbar'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import CompanySection from '../components/CompanySection'
import ShopCategory from '../components/ShopCategory'
import ScrollReveal from '../components/ScrollReveal'
import beautyProductsData from '../BeautyProductsData.json'
import beautyHeroImages from '../BeautyHeroImage.json'
import beautyReviews from '../BeautyReview.json'
import beautyFeatures from '../BeautyWhyChoose.json'
import useLiveProducts from '../hooks/useLiveProducts'
import { getCategoryName } from '../utils/categoryHelper'

// Lazy load below-the-fold components for performance
const WideRangeProducts = lazy(() => import('../components/WideRangeProducts'))
const PopularProduct = lazy(() => import('../components/Product/PopularProduct'))
const ContactUs = lazy(() => import('../components/ContactUs'))
const AboutCompany = lazy(() => import('../components/AboutCompany'))
const Review = lazy(() => import('../components/Review'))
const FAQ = lazy(() => import('../components/FAQ'))
const VideoReviewScroller = lazy(() => import('../components/VideoReviewScroller'))
const LatestArticle = lazy(() => import('../components/LatestArticle'))
const Feature = lazy(() => import('../components/Feature'))
const Footer = lazy(() => import('../components/Footer'))

const LOCAL_KEY_VISIBILITY = 'enquiry_admin_section_visibility'

const SectionLoader = () => (
  <div style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{
      width: '28px',
      height: '28px',
      border: '3px solid #e2e8f0',
      borderTopColor: '#12213d',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite'
    }} />
  </div>
)

const Home2 = () => {
  const [liveProducts] = useLiveProducts()

  // Read section visibility settings from LocalStorage
  const [visibility, setVisibility] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_VISIBILITY)
      return saved
        ? JSON.parse(saved)
        : {
            heroSlider: true,
            featuredProducts: true,
            whyChoose: true,
            reviews: true,
            faq: true,
            blogs: true
          }
    } catch {
      return {
        heroSlider: true,
        featuredProducts: true,
        whyChoose: true,
        reviews: true,
        faq: true,
        blogs: true
      }
    }
  })

  // Compute live beauty products combined with admin additions and updates
  const liveBeautyProducts = useMemo(() => {
    const liveBeauty = liveProducts.filter((p) => {
      const cat = getCategoryName(p.category).toUpperCase()
      return /SKIN|HAIR|FACE|BODY|BEAUTY|COSMETIC|SERUM|CREAM|LOTION|OIL/i.test(cat) ||
             /SERUM|CREAM|LOTION|CLEANSER|LIPSTICK|TONER|MOISTURIZER/i.test(p.name || '')
    })

    if (liveBeauty.length > 0) {
      const existingIds = new Set(liveBeauty.map((p) => String(p._id || p.id || p.slug)))
      const remaining = beautyProductsData.filter((p) => !existingIds.has(String(p.id || p.slug)))
      return [...liveBeauty, ...remaining]
    }

    return beautyProductsData.map((item) => {
      const match = liveProducts.find((p) =>
        (p._id && item._id && String(p._id) === String(item._id)) ||
        (p.id !== undefined && item.id !== undefined && String(p.id) === String(item.id)) ||
        (p.slug && item.slug && p.slug === item.slug) ||
        (p.name && item.name && p.name.toLowerCase() === item.name.toLowerCase())
      )
      return match ? { ...item, ...match } : item
    })
  }, [liveProducts])

  useEffect(() => {
    try {
      sessionStorage.setItem('active_homepage', 'home2')
    } catch (e) {}

    const handleSync = () => {
      try {
        const savedVis = localStorage.getItem(LOCAL_KEY_VISIBILITY)
        if (savedVis) setVisibility(JSON.parse(savedVis))
      } catch (e) {
        // ignore
      }
    }

    window.addEventListener('storage', handleSync)
    const interval = setInterval(handleSync, 800)

    return () => {
      window.removeEventListener('storage', handleSync)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="header-wrapper">
      <Topbar />
      <Navbar />
      {visibility.heroSlider !== false && <Hero data={beautyHeroImages} />}
      {visibility.trustedBy !== false && (
        <ScrollReveal variant="up"><CompanySection isBeauty={true} /></ScrollReveal>
      )}
      {visibility.featuredProducts !== false && (
        <ScrollReveal variant="up"><WideRangeProducts data={liveBeautyProducts} isBeauty={true} /></ScrollReveal>
      )}
      <ScrollReveal variant="up"><ShopCategory data={liveBeautyProducts} isBeauty={true} /></ScrollReveal>
      
      <Suspense fallback={<SectionLoader />}>
        {/* Popular Products Coverflow Carousel */}
        {visibility.popularProducts !== false && (
          <ScrollReveal variant="up"><PopularProduct data={liveBeautyProducts} isBeauty={true} /></ScrollReveal>
        )}
        {visibility.whyChoose !== false && (
          <ScrollReveal variant="up"><AboutCompany isBeauty={true} /></ScrollReveal>
        )}
        {visibility.reviews !== false && (
          <ScrollReveal variant="up"><Review data={beautyReviews} isBeauty={true} /></ScrollReveal>
        )}
        {visibility.faq !== false && (
          <ScrollReveal variant="up"><FAQ isBeauty={true} /></ScrollReveal>
        )}
        {visibility.reviews !== false && (
          <ScrollReveal variant="up"><VideoReviewScroller /></ScrollReveal>
        )}
        {visibility.blogs !== false && (
          <LatestArticle isBeauty={true} />
        )}
        {visibility.whyChoose !== false && (
          <ScrollReveal variant="up"><Feature data={beautyFeatures} isBeauty={true} /></ScrollReveal>
        )}
        <Footer />
      </Suspense>
    </div>
  )
}

export default Home2

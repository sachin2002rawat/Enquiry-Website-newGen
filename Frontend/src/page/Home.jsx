import React, { Suspense, lazy, useState, useEffect } from 'react'
import Topbar from '../components/Topbar'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import CompanySection from '../components/CompanySection'
import ShopCategory from '../components/ShopCategory'
import ScrollReveal from '../components/ScrollReveal'
import defaultHeroImages from '../HeroImage.json'
import useLiveProducts from '../hooks/useLiveProducts'
import useLiveCategories from '../hooks/useLiveCategories'

// Lazy load below-the-fold components for performance
const WideRangeProducts = lazy(() => import('../components/WideRangeProducts'))
const PopularProduct = lazy(() => import('../components/Product/PopularProduct'))
const ContactUs = lazy(() => import('../components/ContactUs'))
const AboutCompany = lazy(() => import('../components/AboutCompany'))
const Review = lazy(() => import('../components/Review'))
const FAQ = lazy(() => import('../components/FAQ'))
const LatestArticle = lazy(() => import('../components/LatestArticle'))
const Feature = lazy(() => import('../components/Feature'))
const Footer = lazy(() => import('../components/Footer'))

const LOCAL_KEY_VISIBILITY = 'enquiry_admin_section_visibility'
const LOCAL_KEY_HERO = 'enquiry_admin_hero_slides'

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

const Home = () => {
  const [liveProducts] = useLiveProducts()
  const [liveCategories] = useLiveCategories()

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

  const isBeautySlideList = (slides) => {
    if (!Array.isArray(slides) || slides.length === 0) return false
    return slides.some(s => s && s.title && (
      s.title.includes('Vitamin C') ||
      s.title.includes('Rosewater') ||
      s.title.includes('Argan') ||
      s.title.includes('Lipstick') ||
      s.title.includes('Detox Mask') ||
      s.title.includes('Beauty') ||
      s.title.includes('Elixir')
    ))
  }

  // Read admin hero slides if customized
  const [heroSlides, setHeroSlides] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_HERO)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && !isBeautySlideList(parsed)) {
          return parsed
        }
      }
    } catch {
      // fallback
    }
    return defaultHeroImages
  })

  // Sync state in real time with localStorage changes from Admin tab
  useEffect(() => {
    try {
      sessionStorage.setItem('active_homepage', 'home1')
    } catch (e) {}

    const handleSync = () => {
      try {
        const savedVis = localStorage.getItem(LOCAL_KEY_VISIBILITY)
        if (savedVis) setVisibility(JSON.parse(savedVis))

        const savedHero = localStorage.getItem(LOCAL_KEY_HERO)
        if (savedHero) {
          const parsed = JSON.parse(savedHero)
          if (Array.isArray(parsed)) {
            setHeroSlides(isBeautySlideList(parsed) ? defaultHeroImages : parsed)
          }
        }
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

      {/* Hero Carousel Banner Section */}
      {visibility.heroSlider !== false && <Hero data={heroSlides} />}

      {/* 2. Trusted By Retail Partners */}
      {visibility.trustedBy !== false && (
        <ScrollReveal variant="up"><CompanySection /></ScrollReveal>
      )}

      {/* Featured Products Section */}
      {visibility.featuredProducts !== false && (
        <ScrollReveal variant="up"><WideRangeProducts data={liveProducts} /></ScrollReveal>
      )}

      <ScrollReveal variant="up"><ShopCategory categories={liveCategories} /></ScrollReveal>
      
      <Suspense fallback={<SectionLoader />}>
        {/* Popular Products Coverflow Carousel */}
        {visibility.popularProducts !== false && (
          <ScrollReveal variant="up"><PopularProduct data={liveProducts} /></ScrollReveal>
        )}

        {/* Why Choose Us Section */}
        {visibility.whyChoose !== false && (
          <ScrollReveal variant="up"><AboutCompany /></ScrollReveal>
        )}

        {/* Customer Reviews Section */}
        {visibility.reviews !== false && (
          <ScrollReveal variant="up"><Review /></ScrollReveal>
        )}

        {/* FAQ Accordion Section */}
        {visibility.faq !== false && (
          <ScrollReveal variant="up"><FAQ /></ScrollReveal>
        )}

        {/* Latest Articles / Blog Grid Section */}
        {visibility.blogs !== false && (
          <LatestArticle />
        )}

        {/* Why Choose Feature Highlight */}
        {visibility.whyChoose !== false && (
          <ScrollReveal variant="up"><Feature /></ScrollReveal>
        )}

        <Footer />
      </Suspense>
    </div>
  )
}

export default Home


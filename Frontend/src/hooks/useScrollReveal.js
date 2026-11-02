import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * useScrollReveal Hook
 * Automatically attaches an IntersectionObserver to all sections and marked components 
 * across the entire application to trigger entrance animations on scroll.
 */
export const useScrollReveal = () => {
  const location = useLocation()

  useEffect(() => {
    // Select all sections and elements configured for scroll animation
    const elements = document.querySelectorAll(
      'section, .animate-on-scroll, .shop-category-section, .popular-products-section, .about-company-container, .review-section, .faq-section, .latest-article-section, .feature-section, .contact-us-section, .wide-range-section, .company-section, .about-hero-clean, .about-relationship-section, .about-dna-values-section, .about-mission-vision-section, .blog-hero-section, .blog-grid-section, .blog-detail-hero-section, .blog-detail-main-section, .contact-hero-section, .enquiry-card'
    )

    if (!elements || elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.06,
        rootMargin: '0px 0px -40px 0px'
      }
    )

    // Reset visibility state on route change to trigger animation
    elements.forEach((el) => {
      if (!el.classList.contains('animate-on-scroll')) {
        el.classList.add('animate-on-scroll')
      }

      const rect = el.getBoundingClientRect()
      // If element is near top of screen on page load, trigger entrance animation with smooth timeout
      if (rect.top < window.innerHeight - 40 && rect.bottom > 0) {
        setTimeout(() => {
          el.classList.add('is-visible')
        }, 80)
      } else {
        observer.observe(el)
      }
    })

    return () => {
      elements.forEach((el) => observer.unobserve(el))
    }
  }, [location.pathname])
}

export default useScrollReveal

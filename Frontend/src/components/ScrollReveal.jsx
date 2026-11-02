import React, { useEffect, useRef } from 'react'

/**
 * ScrollReveal Component
 * Wraps any component or section to trigger a smooth entrance animation 
 * when it is scrolled into the viewport.
 */
const ScrollReveal = ({ 
  children, 
  variant = 'up', // 'up' | 'left' | 'right' | 'zoom' | 'fade'
  delay = 0, 
  duration = 750,
  className = '' 
}) => {
  const domRef = useRef(null)

  useEffect(() => {
    if (!children) return
    const el = domRef.current
    if (!el) return

    // Immediately reveal if already visible in viewport on mount
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('is-visible')
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)

    return () => {
      if (el) observer.unobserve(el)
    }
  }, [])

  const variantClass = variant !== 'up' ? `animate-${variant}` : ''

  if (!children) return null

  return (
    <div
      ref={domRef}
      className={`animate-on-scroll ${variantClass} ${className}`.trim()}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  )
}

export default ScrollReveal

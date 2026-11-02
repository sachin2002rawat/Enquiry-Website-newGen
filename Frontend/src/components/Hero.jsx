import React, { useState, useEffect, useRef } from 'react'
import { FiChevronLeft, FiChevronRight, FiPause } from 'react-icons/fi'
import defaultHeroImages from '../HeroImage.json'

const Hero = ({ data }) => {
  const heroImages = data && data.length > 0 ? data : defaultHeroImages
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef(null)

  // Auto-slide interval (changes image every 3.5 seconds)
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
      }, 3500)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPaused])

  // Move to previous image
  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
    )
  }

  // Move to next image
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
  }

  // Current active slide object
  const currentSlide = heroImages[currentIndex]

  return (
    <section className="hero-section">
      <div
        className="hero-carousel"
        onMouseEnter={() => setIsPaused(true)}  /* Stop image slide change on hover */
        onMouseLeave={() => setIsPaused(false)} /* Resume image slide change on mouse leave */
      >
        {/* Main Hero Slides with cross-fade transition */}
        {heroImages.map((slide, index) => {
          const isActive = index === currentIndex
          return (
            <div
              key={slide.id || index}
              className={`hero-slide ${isActive ? 'active' : ''}`}
            >
              <img
                src={slide.url}
                alt={slide.title}
                className="hero-image"
              />
              <div className="hero-overlay">
                <div className="hero-caption">
                  <span className="hero-badge">
                    Featured {index + 1} / {heroImages.length}
                  </span>
                  <h1 className="hero-title">{slide.title}</h1>
                  <p className="hero-subtitle">{slide.subtitle}</p>
                </div>
              </div>
            </div>
          )
        })}

        {/* Left Arrow */}
        <button
          type="button"
          className="carousel-arrow left-arrow"
          onClick={handlePrev}
          aria-label="Previous Slide"
        >
          <FiChevronLeft size={24} />
        </button>

        {/* Right Arrow */}
        <button
          type="button"
          className="carousel-arrow right-arrow"
          onClick={handleNext}
          aria-label="Next Slide"
        >
          <FiChevronRight size={24} />
        </button>

        {/* Hover Pause Indicator */}
        {isPaused && (
          <div className="pause-badge">
            <FiPause size={12} /> Paused
          </div>
        )}

        {/* Slide Pagination Dots */}
        <div className="carousel-dots">
          {heroImages.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero



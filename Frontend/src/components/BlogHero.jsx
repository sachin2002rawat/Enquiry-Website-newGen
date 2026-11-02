import React from 'react'
import { Link } from 'react-router-dom'
import { Edit3, Home } from 'lucide-react'
import { useLiveBlogs } from '../hooks/useLiveBlogs'
import './BlogHero.css'

const BlogHero = () => {
  const { blogSettings } = useLiveBlogs()

  const heroTag = blogSettings?.heroTag || 'Our Blog'
  const heroTitle = blogSettings?.heroTitle || 'The Latest Articles & Insights'
  const heroSubtitle = blogSettings?.heroSubtitle || 'Explore expert tips, inspiring stories, and the latest insights from our blog to help you grow, learn, and stay motivated.'
  const breadcrumb = blogSettings?.breadcrumbText || 'Blog'

  // Format title highlight if it contains "Articles & Insights" or similar
  const renderTitle = () => {
    if (heroTitle.includes('Articles & Insights')) {
      const parts = heroTitle.split('Articles & Insights')
      return (
        <>
          {parts[0]}<span className="title-highlight">Articles & Insights</span>{parts[1] || ''}
        </>
      )
    }
    return heroTitle
  }

  return (
    <section className="blog-hero-section">
      {/* Radial Faded Dot Matrix Pattern */}
      <div className="blog-hero-grid-pattern"></div>
      
      {/* Dual Glowing Aurora Light Orbs */}
      <div className="blog-hero-glow-cyan"></div>
      <div className="blog-hero-glow-indigo"></div>

      <div className="blog-hero-container">
        {/* Top Tag */}
        <div className="blog-hero-tag">
          <Edit3 size={14} />
          <span>{heroTag}</span>
        </div>

        {/* Main Heading */}
        <h1 className="blog-hero-title">
          {renderTitle()}
        </h1>

        {/* Subtitle Description */}
        <p className="blog-hero-subtitle">
          {heroSubtitle}
        </p>

        {/* Breadcrumb Tag */}
        <div className="blog-hero-breadcrumb">
          <Link to="/">
            <Home size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            Home
          </Link>
          <span className="sep">•</span>
          <span className="current">{breadcrumb}</span>
        </div>
      </div>
    </section>
  )
}

export default React.memo(BlogHero)

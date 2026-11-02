import React from 'react'
import ProductNavbar from '../components/ProductNavbar'
import BlogHero from '../components/BlogHero'
import BlogGrid from '../components/BlogGrid'
import Footer from '../components/Footer'
import ScrollReveal from '../components/ScrollReveal'

const Blog = () => {
  return (
    
    <div className="blog-page">
      {/* Existing Header/Navbar */}
      <ProductNavbar />

      {/* Hero Header matching reference screenshot design */}
      <ScrollReveal variant="up"><BlogHero /></ScrollReveal>

      {/* Blog Articles Collection Grid */}
      <ScrollReveal variant="up"><BlogGrid /></ScrollReveal>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Blog

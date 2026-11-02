import React from 'react'
import ProductNavbar from '../components/ProductNavbar'
import ContactHero from '../components/ContactHero'
import ContactCards from '../components/ContactCards'
import BranchLocations from '../components/BranchLocations'
import LocateMapSection from '../components/LocateMapSection'
import ContactUs from '../components/ContactUs'
import Footer from '../components/Footer'
import ScrollReveal from '../components/ScrollReveal'

const Contact = () => {
  return (
    <div className="contact-page">
      <ProductNavbar />
      <ScrollReveal variant="up"><ContactHero /></ScrollReveal>
      <ScrollReveal variant="up"><ContactCards /></ScrollReveal>
      <ScrollReveal variant="up"><BranchLocations /></ScrollReveal>
      <ScrollReveal variant="up"><ContactUs /></ScrollReveal>
      <ScrollReveal variant="up"><LocateMapSection /></ScrollReveal>
      <Footer />
    </div>
  )
}

export default Contact

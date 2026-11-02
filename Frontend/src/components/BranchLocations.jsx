import React, { useState } from 'react'
import { 
  FiMapPin, 
  FiClock, 
  FiPhoneCall, 
  FiMap, 
  FiStar, 
  FiX, 
  FiExternalLink,
  FiPackage,
  FiShield,
  FiZap,
  FiSend
} from 'react-icons/fi'
import ScrollReveal from './ScrollReveal'
import './BranchLocations.css'

const headquartersData = {
  id: 'delhi',
  city: 'Delhi',
  badge: 'headquarters',
  badgeIcon: <FiStar size={12} fill="#ffffff" color="#ffffff" />,
  address: 'Office No. 12, 2nd Floor, Main Market, New Delhi - 110001',
  hoursMonFri: 'Mon – Fri: 9:00 AM – 6:00 PM',
  hoursSat: 'Sat: 9:00 AM – 2:00 PM',
  phone: '011-12345678',
  mapUrl: 'https://maps.google.com/?q=Main+Market+New+Delhi',
  mapEmbedUrl: 'https://maps.google.com/maps?q=Main%20Market%20New%20Delhi&t=&z=14&ie=UTF8&iwloc=&output=embed'
}

const BranchLocations = () => {
  const [showMapModal, setShowMapModal] = useState(false)

  const handleOpenMap = (e) => {
    e.preventDefault()
    setShowMapModal(true)
  }

  const handleCloseMap = () => {
    setShowMapModal(false)
  }

  const handleScrollToForm = () => {
    const element = document.querySelector('.contact-us-modern-section') || document.querySelector('.contact-us-section')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="branch-locations-section">
      <div className="branch-locations-container">
        
        {/* Top Section Header */}
        <ScrollReveal variant="up" duration={600}>
          <div className="branch-header-row">
            <div className="branch-header-left">
              <div className="branch-subtag">
                <span className="subtag-line"></span>
                OUR LOCATIONS
              </div>
              <h2 className="branch-main-title">
                FIND OUR <span className="title-light">HEADQUARTERS</span>
              </h2>
            </div>

            <div className="branch-header-right">
              <p className="branch-header-desc">
                Visit our official corporate headquarters or submit a product inquiry online. Our specialized team is ready to assist you.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* 2-Column Split Layout: Card on Left, Product Enquiry Content on Right */}
        <div className="branch-split-layout">
          
          {/* LEFT COLUMN: Headquarters Card */}
          <div className="branch-split-left">
            <ScrollReveal variant="left" delay={100} duration={650}>
              <div className="branch-location-card headquarters-single-card">
                
                {/* Dark Navy Blue Header Banner */}
                <div className="branch-card-header">
                  <span className="branch-badge">
                    {headquartersData.badgeIcon} {headquartersData.badge}
                  </span>
                  <div className="branch-city-pill">
                    {headquartersData.city}
                  </div>
                </div>

                {/* Card White Body Content */}
                <div className="branch-card-body">
                  
                  {/* Address Row */}
                  <div className="branch-row">
                    <div className="branch-icon-box">
                      <FiMapPin className="row-icon" />
                    </div>
                    <div className="branch-info-col">
                      <span className="branch-row-label">ADDRESS</span>
                      <p className="branch-row-val">{headquartersData.address}</p>
                    </div>
                  </div>

                  <div className="branch-divider"></div>

                  {/* Business Hours Row */}
                  <div className="branch-row">
                    <div className="branch-icon-box">
                      <FiClock className="row-icon" />
                    </div>
                    <div className="branch-info-col">
                      <span className="branch-row-label">BUSINESS HOURS</span>
                      <p className="branch-row-val">{headquartersData.hoursMonFri}</p>
                      <p className="branch-row-val">{headquartersData.hoursSat}</p>
                    </div>
                  </div>

                  <div className="branch-divider"></div>

                  {/* Phone Row */}
                  <div className="branch-row">
                    <div className="branch-icon-box">
                      <FiPhoneCall className="row-icon" />
                    </div>
                    <div className="branch-info-col">
                      <span className="branch-row-label">PHONE</span>
                      <a href={`tel:${headquartersData.phone}`} className="branch-phone-link">
                        {headquartersData.phone}
                      </a>
                    </div>
                  </div>

                  {/* View on Map Button */}
                  <button 
                    type="button" 
                    onClick={handleOpenMap} 
                    className="branch-map-button"
                  >
                    <FiMap size={18} /> View on Map
                  </button>

                </div>

              </div>
            </ScrollReveal>
          </div>

          {/* RIGHT COLUMN: Product Enquiry & Consultation Content */}
          <div className="branch-split-right">
            <ScrollReveal variant="right" delay={200} duration={650}>
              <div className="enquiry-content-card">
                
                <div className="enquiry-card-header">
                  <span className="enquiry-badge">PRODUCT ENQUIRIES & WHOLESALE</span>
                  <h3 className="enquiry-card-title">
                    Direct Consultation & Custom Quotes
                  </h3>
                  <p className="enquiry-card-desc">
                    Looking for bulk pricing, product testing certificates, or custom supply chain agreements? Visit our Delhi headquarters or connect with our product specialists today.
                  </p>
                </div>

                {/* Feature Value Props List */}
                <div className="enquiry-features-list">
                  
                  <div className="enquiry-feature-item">
                    <div className="feature-icon-box">
                      <FiPackage size={20} />
                    </div>
                    <div>
                      <h4 className="feature-title">Bulk Order & Wholesale Quotes</h4>
                      <p className="feature-desc">
                        Get volume discount structures and instant price estimates tailored to your project requirements.
                      </p>
                    </div>
                  </div>

                  <div className="enquiry-feature-item">
                    <div className="feature-icon-box">
                      <FiShield size={20} />
                    </div>
                    <div>
                      <h4 className="feature-title">Live Product Quality Inspection</h4>
                      <p className="feature-desc">
                        Examine material purity, product samples, and compliance documentation in person at our executive office.
                      </p>
                    </div>
                  </div>

                  <div className="enquiry-feature-item">
                    <div className="feature-icon-box">
                      <FiZap size={20} />
                    </div>
                    <div>
                      <h4 className="feature-title">Fast Quote Turnaround</h4>
                      <p className="feature-desc">
                        All product inquiries submitted via phone, email, or visit receive priority response within 1 hour.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Action CTA Bar */}
                <div className="enquiry-cta-bar">
                  <button onClick={handleScrollToForm} className="enquiry-btn-primary">
                    <FiSend size={16} /> Submit Product Inquiry
                  </button>
                  <a href="tel:01112345678" className="enquiry-btn-secondary">
                    <FiPhoneCall size={16} /> Call Sales Desk
                  </a>
                </div>

              </div>
            </ScrollReveal>
          </div>

        </div>

      </div>

      {/* Interactive Map Modal View Popup */}
      {showMapModal && (
        <div className="map-modal-backdrop" onClick={handleCloseMap}>
          <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="map-modal-header">
              <div className="modal-title-group">
                <FiMapPin className="modal-pin-icon" />
                <div>
                  <h4 className="modal-title">Delhi Headquarters Map</h4>
                  <p className="modal-sub">{headquartersData.address}</p>
                </div>
              </div>
              <button onClick={handleCloseMap} className="modal-close-btn">
                <FiX size={20} />
              </button>
            </div>

            <div className="map-iframe-wrapper">
              <iframe 
                title="Headquarters Location Map" 
                src={headquartersData.mapEmbedUrl}
                width="100%" 
                height="380" 
                style={{ border: 0, borderRadius: '16px' }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="map-modal-footer">
              <a 
                href={headquartersData.mapUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="modal-external-link-btn"
              >
                Open in Google Maps <FiExternalLink size={14} />
              </a>
              <button onClick={handleCloseMap} className="modal-done-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default BranchLocations

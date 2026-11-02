import React, { useState } from 'react'
import { FiMapPin, FiExternalLink, FiNavigation } from 'react-icons/fi'
import ScrollReveal from './ScrollReveal'
import './LocateMapSection.css'

const mapLocations = [
  {
    id: 'delhi',
    name: 'Delhi',
    heading: 'WorkDesk — Delhi',
    address: 'Office No. 12, 2nd Floor, Main Market',
    fullLocation: 'Delhi, India',
    embedUrl: 'https://maps.google.com/maps?q=Main%20Market%20New%20Delhi&t=&z=13&ie=UTF8&iwloc=&output=embed',
    directUrl: 'https://maps.google.com/?q=Main+Market+New+Delhi'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    heading: 'WorkDesk — Mumbai',
    address: 'Suite 405, Business Park, Lower Parel',
    fullLocation: 'Mumbai, Maharashtra, India',
    embedUrl: 'https://maps.google.com/maps?q=Lower%20Parel%20Mumbai&t=&z=13&ie=UTF8&iwloc=&output=embed',
    directUrl: 'https://maps.google.com/?q=Lower+Parel+Mumbai'
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    heading: 'WorkDesk — Bengaluru',
    address: 'Plot 88, Electronic City Phase 1',
    fullLocation: 'Bengaluru, Karnataka, India',
    embedUrl: 'https://maps.google.com/maps?q=Electronic%20City%20Bengaluru&t=&z=13&ie=UTF8&iwloc=&output=embed',
    directUrl: 'https://maps.google.com/?q=Electronic+City+Bengaluru'
  }
]

const LocateMapSection = () => {
  const [selectedLocation, setSelectedLocation] = useState(mapLocations[0])

  return (
    <section className="locate-map-section">
      <div className="locate-map-container">
        
        {/* Header matching screenshot */}
        <ScrollReveal variant="up" duration={600}>
          <div className="locate-header">
            <div className="locate-subtag">
              <span className="subtag-dash"></span>
              FIND US
            </div>
            <h2 className="locate-main-title">
              LOCATE OUR <span className="title-light">BRANCHES</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Location Selector Pills */}
        <div className="location-pills-row">
          {mapLocations.map((loc) => (
            <button
              key={loc.id}
              className={`location-pill-btn ${selectedLocation.id === loc.id ? 'active' : ''}`}
              onClick={() => setSelectedLocation(loc)}
            >
              <FiMapPin className="pill-pin-icon" /> {loc.name}
            </button>
          ))}
        </div>

        {/* Interactive Map Box matching screenshot */}
        <ScrollReveal variant="up" delay={150} duration={650}>
          <div className="map-display-box">
            
            {/* Embedded Google Map Canvas */}
            <iframe
              title={`Map of ${selectedLocation.heading}`}
              src={selectedLocation.embedUrl}
              width="100%"
              height="490"
              style={{ border: 0, borderRadius: '24px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>

            {/* Top-Left Floating Info Card Overlay inside Map */}
            <div className="map-top-overlay-card">
              <div className="top-overlay-info">
                <span className="top-overlay-city">{selectedLocation.name}</span>
                <span className="top-overlay-loc">{selectedLocation.fullLocation}</span>
              </div>
              <div className="top-overlay-actions">
                <a 
                  href={selectedLocation.directUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="overlay-action-btn"
                  title="Open in Google Maps"
                >
                  <FiExternalLink size={15} />
                </a>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedLocation.address)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="overlay-action-btn primary"
                  title="Get Directions"
                >
                  <FiNavigation size={15} />
                </a>
              </div>
            </div>

            {/* Bottom-Left Floating WorkDesk Card Overlay matching screenshot */}
            <div className="map-bottom-overlay-card">
              <h4 className="bottom-card-title">{selectedLocation.heading}</h4>
              <p className="bottom-card-address">{selectedLocation.address}</p>
            </div>

          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}

export default LocateMapSection

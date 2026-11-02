import React from 'react'
import { FiMail, FiPhoneCall, FiSend, FiClock } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import './ContactHero.css'

const ContactHero = () => {
  const handleScrollToForm = () => {
    const element = document.querySelector('.contact-us-section')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="contact-hero-section">
      <div className="contact-hero-container">
        
        {/* Warm ceiling spotlight glow effect at the top */}
        <div className="wall-spotlight-glow"></div>

        {/* Floating Online Support Status Badge */}
        <div className="hero-status-floating-card">
          <div className="status-avatar-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80" 
              alt="Customer support specialist" 
            />
            <span className="online-indicator"></span>
          </div>
          <div className="status-info">
            <span className="status-heading">We're Online Now</span>
            <span className="status-sub">Ready to assist you</span>
          </div>
        </div>

        <div className="wall-inner-content">
          
          {/* Top Tag Badge */}
          <div className="contact-hero-tag">
            <span className="tag-pulse"></span>
            24/7 SUPPORT AVAILABLE
          </div>

          {/* Headline */}
          <h1 className="contact-hero-title">GET IN TOUCH</h1>

          {/* Subtitle */}
          <p className="contact-hero-subtitle">
            Whether you have a question, need a custom solution, or just want to chat, we're here for you.
          </p>

          {/* Center Hand & Paper Airplane Line Art Illustration */}
          <div className="contact-illustration-container">
            <svg 
              className="paper-plane-svg" 
              viewBox="0 0 500 360" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Motion trails behind the plane */}
              <path d="M 120 210 C 160 200 210 185 260 170" stroke="#334155" strokeWidth="2.5" strokeDasharray="7 7" strokeLinecap="round" opacity="0.65"/>
              <path d="M 100 235 C 150 225 200 210 260 190" stroke="#334155" strokeWidth="2.5" strokeDasharray="7 7" strokeLinecap="round" opacity="0.65"/>
              <path d="M 130 260 C 180 250 230 235 280 215" stroke="#334155" strokeWidth="2.5" strokeDasharray="7 7" strokeLinecap="round" opacity="0.65"/>

              {/* Hand line art (wrist to fingers holding/releasing) */}
              <path 
                d="M 60 280 C 80 260 110 245 140 248 C 175 252 205 240 245 220 C 270 208 285 218 265 235 C 235 258 200 268 170 260 C 135 252 105 275 80 305 Z" 
                stroke="#0f172a" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                fill="#ffffff"
                fillOpacity="0.5"
              />
              
              {/* Palm outline & Thumb curve */}
              <path d="M 80 305 C 120 345 170 350 235 325 C 275 310 295 275 275 240" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 125 343 C 150 360 185 365 215 355" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round"/>

              {/* Paper Airplane (angled dynamically) */}
              <g className="floating-paper-plane-group">
                {/* Plane main wings & crease */}
                <path d="M 260 170 L 390 115 L 295 200 L 260 170 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" strokeLinejoin="round"/>
                <path d="M 295 200 L 390 115 L 245 152 L 295 200 Z" fill="#f1f5f9" stroke="#0f172a" strokeWidth="3.5" strokeLinejoin="round"/>
                <path d="M 295 200 L 310 235 L 330 188 Z" fill="#cbd5e1" stroke="#0f172a" strokeWidth="3" strokeLinejoin="round"/>

                {/* Mail Envelope Icon attached to paper plane */}
                <g className="plane-mail-box">
                  <rect x="308" y="132" width="52" height="36" rx="5" fill="#ffffff" stroke="#0f172a" strokeWidth="3"/>
                  <path d="M 308 132 L 334 154 L 360 132" stroke="#0f172a" strokeWidth="3" strokeLinejoin="round"/>
                </g>
              </g>
            </svg>
          </div>

          {/* Action CTA Buttons */}
          <div className="contact-hero-cta-group">
            <button onClick={handleScrollToForm} className="contact-cta-primary">
              <FiSend size={18} /> Send Us a Message
            </button>
            <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className="contact-cta-whatsapp">
              <FaWhatsapp size={20} /> Live WhatsApp Chat
            </a>
          </div>

          {/* Bottom Information Badges */}
          <div className="contact-hero-info-grid">
            <div className="info-chip">
              <FiMail className="chip-icon" />
              <div>
                <div className="chip-title">Direct Email</div>
                <div className="chip-text">contact@company.com</div>
              </div>
            </div>
            <div className="info-chip">
              <FiClock className="chip-icon" />
              <div>
                <div className="chip-title">Fast Response</div>
                <div className="chip-text">Replies within 15 mins</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

export default ContactHero

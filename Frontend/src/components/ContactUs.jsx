import React, { useState } from 'react'
import { 
  FiPhoneCall, 
  FiMail, 
  FiMapPin, 
  FiSend, 
  FiArrowRight, 
  FiCheckCircle 
} from 'react-icons/fi'
import { 
  FaFacebookF, 
  FaInstagram, 
  FaTwitter, 
  FaLinkedinIn, 
  FaYoutube 
} from 'react-icons/fa'
import './ContactUs.css'

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: ''
      })
    }, 4000)
  }

  return (
    <section className="contact-us-modern-section">
      <div className="contact-us-modern-container">
        
        {/* LEFT PANEL: Glassmorphic Contact Information */}
        <div className="contact-info-glass-panel">
          
          <div className="glass-panel-header">
            <h2 className="info-panel-title">Contact Information</h2>
            <p className="info-panel-sub">
              Fill up the form and our team will get back to you within 24 hours.
            </p>
          </div>

          <div className="info-items-list">
            
            {/* Phone Item */}
            <div className="info-item-row">
              <div className="info-icon-square">
                <FiPhoneCall size={18} />
              </div>
              <div className="info-content-col">
                <span className="info-item-label">PHONE NUMBER</span>
                <div className="info-numbers-group">
                  <a href="tel:9876543210" className="info-link">9876543210</a>
                  <a href="tel:9876543210" className="info-link">9876543210</a>
                  <a href="tel:01204567890" className="info-link">0120-4567890</a>
                </div>
              </div>
            </div>

            {/* Email Item */}
            <div className="info-item-row">
              <div className="info-icon-square">
                <FiMail size={18} />
              </div>
              <div className="info-content-col">
                <span className="info-item-label">EMAIL ADDRESS</span>
                <a href="mailto:example@gmail.com" className="info-link">
                  example@gmail.com
                </a>
              </div>
            </div>

            {/* Address Item */}
            <div className="info-item-row">
              <div className="info-icon-square">
                <FiMapPin size={18} />
              </div>
              <div className="info-content-col">
                <span className="info-item-label">HEAD OFFICE</span>
                <p className="info-text-val">Office No. 12, 2nd Floor, Main Market</p>
              </div>
            </div>

          </div>

          <div className="info-panel-divider"></div>

          {/* Business Hours */}
          <div className="business-hours-block">
            <span className="info-item-label">BUSINESS HOURS</span>
            
            <div className="hours-row">
              <span className="hours-day">Monday – Friday</span>
              <span className="hours-time">9:00 AM – 6:00 PM</span>
            </div>

            <div className="hours-row">
              <span className="hours-day">Saturday</span>
              <span className="hours-time">9:00 AM – 2:00 PM</span>
            </div>

            <div className="hours-row">
              <span className="hours-day">Sunday</span>
              <span className="hours-closed-badge">Closed</span>
            </div>
          </div>
 
          {/* Social Icons Row */}
          <div className="social-icons-row">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-btn">
              <FaFacebookF size={14} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-btn">
              <FaInstagram size={14} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-btn">
              <FaTwitter size={14} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-btn">
              <FaLinkedinIn size={14} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-btn">
              <FaYoutube size={14} />
            </a>
          </div>

        </div>

        {/* RIGHT PANEL: Send us a Message Form Card */}
        <div className="contact-form-white-card">
          
          <div className="form-card-header">
            <div className="form-subtag">
              <span className="form-subtag-dash"></span> GET IN TOUCH
            </div>
            <h2 className="form-main-title">Send us a Message</h2>
            <p className="form-main-sub">
              Have a question or a bulk order enquiry? Fill in the form and we'll be in touch.
            </p>
          </div>

          {isSubmitted ? (
            <div className="form-success-banner">
              <FiCheckCircle size={48} className="success-icon" />
              <h3>Message Sent Successfully!</h3>
              <p>Thank you for reaching out. Our support team will get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form-grid">
              
              {/* Row 1: First Name & Last Name */}
              <div className="form-group">
                <label htmlFor="firstName">FIRST NAME <span className="req">*</span></label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  placeholder="Your first name" 
                  value={formData.firstName}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">LAST NAME <span className="req">*</span></label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName" 
                  placeholder="Your last name" 
                  value={formData.lastName}
                  onChange={handleChange}
                  required 
                />
              </div>

              {/* Row 2: Email Address & Phone Number */}
              <div className="form-group">
                <label htmlFor="email">EMAIL ADDRESS <span className="req">*</span></label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  placeholder="you@example.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">PHONE NUMBER</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  placeholder="+91 XXXXX XXXXX" 
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Row 3: Message Textarea */}
              <div className="form-group full-width">
                <label htmlFor="message">MESSAGE <span className="req">*</span></label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows="5"
                  placeholder="Tell us how we can help you..." 
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              {/* Row 4: Submit Button */}
              <div className="form-group full-width">
                <button type="submit" className="form-submit-btn">
                  <FiSend size={16} /> Send Message <FiArrowRight size={16} />
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </section>
  )
}

export default ContactUs

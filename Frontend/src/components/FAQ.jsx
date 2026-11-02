import React, { useState, useEffect } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import defaultFaqData from '../Faq.json'
import { apiService } from '../api/apiService'

const LOCAL_KEY_FAQS = 'enquiry_admin_faqs'
const LOCAL_KEY_SETTINGS = 'enquiry_admin_store_settings'

const FAQ = ({ isBeauty = false }) => {
  // All FAQ items closed by default
  const [openId, setOpenId] = useState(null)

  // Dynamic FAQ list state
  const [faqList, setFaqList] = useState(() => {
    try {
      const savedFaqs = localStorage.getItem(LOCAL_KEY_FAQS)
      if (savedFaqs) {
        const parsed = JSON.parse(savedFaqs)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      const savedSettings = localStorage.getItem(LOCAL_KEY_SETTINGS)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        if (Array.isArray(parsed.faqs) && parsed.faqs.length > 0) return parsed.faqs
      }
      return defaultFaqData
    } catch {
      return defaultFaqData
    }
  })

  // Dynamic FAQ section titles & contact prompt
  const [meta, setMeta] = useState(() => {
    try {
      const savedSettings = localStorage.getItem(LOCAL_KEY_SETTINGS)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        return {
          subtitle: parsed.faqSubtitle || 'COMMON QUESTIONS',
          title: parsed.faqTitle || 'Frequently asked questions.',
          contactPrompt: parsed.faqContactPrompt || "Can't find what you're looking for?",
          contactBtnText: parsed.faqContactBtnText || 'Contact support'
        }
      }
    } catch {}
    return {
      subtitle: 'COMMON QUESTIONS',
      title: 'Frequently asked questions.',
      contactPrompt: "Can't find what you're looking for?",
      contactBtnText: 'Contact support'
    }
  })

  // Live synchronizer with localStorage changes from Admin
  useEffect(() => {
    const handleSync = () => {
      try {
        const savedFaqs = localStorage.getItem(LOCAL_KEY_FAQS)
        if (savedFaqs) {
          const parsed = JSON.parse(savedFaqs)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFaqList(parsed)
          }
        }
        const savedSettings = localStorage.getItem(LOCAL_KEY_SETTINGS)
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          if (!savedFaqs && Array.isArray(parsed.faqs) && parsed.faqs.length > 0) {
            setFaqList(parsed.faqs)
          }
          setMeta({
            subtitle: parsed.faqSubtitle || 'COMMON QUESTIONS',
            title: parsed.faqTitle || 'Frequently asked questions.',
            contactPrompt: parsed.faqContactPrompt || "Can't find what you're looking for?",
            contactBtnText: parsed.faqContactBtnText || 'Contact support'
          })
        }
      } catch {}
    }

    window.addEventListener('storage', handleSync)
    return () => window.removeEventListener('storage', handleSync)
  }, [])

  // Sync with MongoDB backend if available
  useEffect(() => {
    let isMounted = true
    const fetchRemoteSettings = async () => {
      try {
        const dbSettings = await apiService.getSettings()
        if (dbSettings && isMounted) {
          if (Array.isArray(dbSettings.faqs) && dbSettings.faqs.length > 0) {
            setFaqList(dbSettings.faqs)
          }
          setMeta({
            subtitle: dbSettings.faqSubtitle || 'COMMON QUESTIONS',
            title: dbSettings.faqTitle || 'Frequently asked questions.',
            contactPrompt: dbSettings.faqContactPrompt || "Can't find what you're looking for?",
            contactBtnText: dbSettings.faqContactBtnText || 'Contact support'
          })
        }
      } catch {}
    }
    fetchRemoteSettings()
    return () => {
      isMounted = false
    }
  }, [])

  const toggleFaq = (id) => {
    setOpenId(prev => (prev === id ? null : id))
  }

  const handleContactSupport = () => {
    const contactSection = document.querySelector('.contact-us-section')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' })
    } else {
      alert('Opening Support & Enquiry...')
    }
  }

  // Render main heading with line breaks support
  const renderHeading = (titleStr) => {
    if (!titleStr) return 'Frequently asked questions.'
    if (titleStr.includes('\n')) {
      return titleStr.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < titleStr.split('\n').length - 1 && <br />}
        </React.Fragment>
      ))
    }
    // Default 2-line break if matching standard phrase
    if (titleStr.toLowerCase().startsWith('frequently asked questions')) {
      return (
        <>
          Frequently <br />
          asked questions.
        </>
      )
    }
    return titleStr
  }

  return (
    <section className="faq-section">
      {/* Abstract contour wireframe SVG background overlay */}
      <div className="faq-contour-bg"></div>

      <div className="faq-layout-container">
        
        {/* LEFT COLUMN: Subtitle Tag, Main Serif Heading, & Contact Support Link */}
        <div className="faq-left-column">
          <span className="faq-subtitle-tag">{meta.subtitle}</span>
          
          <h2 className="faq-main-heading">
            {renderHeading(meta.title)}
          </h2>

          <p className="faq-support-prompt">
            {meta.contactPrompt}{' '}
            <span 
              className="faq-contact-highlight" 
              onClick={handleContactSupport}
              role="button"
              tabIndex={0}
            >
              {meta.contactBtnText}
            </span>
          </p>
        </div>

        {/* RIGHT COLUMN: Accordion Cards Stack */}
        <div className="faq-right-column">
          {faqList.map((item, index) => {
            const itemId = item.id || index + 1
            const isOpen = openId === itemId

            return (
              <div 
                key={itemId} 
                className={`faq-pill-card ${isOpen ? 'open-pill' : ''} ${isBeauty ? 'beauty-faq-pill' : ''}`}
                style={isBeauty ? { animationDelay: `${index * 0.1}s` } : {}}
              >
                {/* Accordion Question Header Bar */}
                <button 
                  type="button" 
                  className="faq-pill-header" 
                  onClick={() => toggleFaq(itemId)}
                  aria-expanded={isOpen}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isBeauty && (
                      <span className="faq-number-badge">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    )}
                    <span className="faq-question-title">{item.question}</span>
                  </div>
                  <div className="faq-chevron">
                    <FiChevronDown size={20} />
                  </div>
                </button>

                {/* Accordion Answer Body */}
                {isOpen && (
                  <div className="faq-answer-container">
                    <p className="faq-answer-text">{item.answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

export default FAQ

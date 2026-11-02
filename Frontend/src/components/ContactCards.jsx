import React from 'react'
import { FiMapPin, FiPhoneCall, FiMail, FiExternalLink } from 'react-icons/fi'
import ScrollReveal from './ScrollReveal'
import './ContactCards.css'

const ContactCards = () => {
  const cardsData = [
    {
      id: 'office',
      icon: <FiMapPin className="card-header-icon" />,
      title: 'Our Head Office',
      subtitle: 'Office No. 12, 2nd Floor, Main Market',
      actionText: 'View on Map',
      actionLink: 'https://maps.google.com',
      delay: 0
    },
    {
      id: 'phone',
      icon: <FiPhoneCall className="card-header-icon" />,
      title: 'Call Us Directly',
      timings: [
        'Mon–Fri: 9:00 AM – 6:00 PM IST',
        'Sat: 9:00 AM – 2:00 PM IST'
      ],
      phoneNumbers: [
        '9876543210',
        '9876543210',
        '0120-4567890'
      ],
      delay: 150
    },
    {
      id: 'email',
      icon: <FiMail className="card-header-icon" />,
      title: 'Email Us',
      description: 'We respond to all enquiries within 24 business hours. For urgent matters, please call us.',
      email: 'example@gmail.com',
      delay: 300
    }
  ]

  return (
    <section className="contact-cards-section">
      <div className="contact-cards-container">
        {cardsData.map((card) => (
          <ScrollReveal key={card.id} variant="up" delay={card.delay} duration={700}>
            <div className="contact-info-card">
              {/* Soft decorative accent circle in bottom right */}
              <div className="card-bg-circle"></div>

              {/* Blue Icon Square */}
              <div className="card-icon-wrapper">
                {card.icon}
              </div>

              {/* Card Title */}
              <h3 className="card-title">{card.title}</h3>

              {/* Card Content body */}
              {card.id === 'office' && (
                <div className="card-body">
                  <p className="card-text-muted">{card.subtitle}</p>
                  <a 
                    href={card.actionLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="card-action-link"
                  >
                    <FiExternalLink className="link-arrow-icon" /> {card.actionText}
                  </a>
                </div>
              )}

              {card.id === 'phone' && (
                <div className="card-body">
                  <div className="card-timing-group">
                    {card.timings.map((time, idx) => (
                      <p key={idx} className="card-text-muted">{time}</p>
                    ))}
                  </div>
                  <div className="card-numbers-group">
                    {card.phoneNumbers.map((phone, idx) => (
                      <a key={idx} href={`tel:${phone.replace(/\s+/g, '')}`} className="card-phone-link">
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {card.id === 'email' && (
                <div className="card-body">
                  <p className="card-text-muted card-desc">{card.description}</p>
                  <a href={`mailto:${card.email}`} className="card-email-link">
                    {card.email}
                  </a>
                </div>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

export default ContactCards

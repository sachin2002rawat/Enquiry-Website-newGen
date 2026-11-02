import React, { useState } from 'react';
import './SecondHero.css';
import { 
  Pencil, 
  Mail, 
  Smartphone, 
  ArrowRight, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  PhoneCall,
  User
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { apiService } from '../../api/apiService';
import { openWhatsApp } from '../../utils/whatsappHelper';

// =========================================================================
// HARDCODED STATIC DATA (Freshers: Easy to edit or replace with dynamic API data later)
// =========================================================================
const HARDCODED_SECOND_HERO = {
  title: "Product Description",
  paragraphs: [
    "Our product is a masterpiece of authentic Indian culinary heritage, crafted from 100% natural, premium ingredients blended with time-honored aromatic spices.",
    "Each pack delivers a rich, authentic taste profile with high quality, natural goodness, zero synthetic colors, and minimal artificial processing. Perfectly formulated for everyday cooking.",
    "Made with natural ingredients and free from chemical preservatives, maintaining peak aroma, vibrant natural color, and essential volatile oils.",
    "Ideal for home chefs, health-conscious consumers, hotel kitchens, and commercial buyers looking for dependable quality and authentic flavor.",
    "Sourced sustainably and packed using advanced freshness-seal technology to ensure maximum shelf life and flavor retention from our kitchen to yours."
  ],
  formTitle: "Buying Requirement Details",
  formSubtitle: "Have questions? We're here to help you 24/7",
  phoneNumber: "+91 98765 43210",
  supportEmail: "support@quickenquiry.com"
};

const SecondHero = ({ product }) => {
  // Use dynamic fullDescription array if available, otherwise construct tailored product paragraphs
  const displayParagraphs = Array.isArray(product?.fullDescription) && product.fullDescription.length > 0
    ? product.fullDescription
    : [
        product?.description || HARDCODED_SECOND_HERO.paragraphs[0],
        `Our ${product?.name || 'product'} is crafted to meet international food safety standards, delivering uncompromised quality and authentic flavor in every pack.`,
        `Hygienically processed without synthetic additives or artificial preservatives to maintain natural taste, color, and nutritional value.`,
        `Ideal for household cooking, restaurants, hotel chains, and commercial food distributors seeking dependable supply.`,
        "Sourced sustainably and packed using advanced moisture-barrier packaging to ensure maximum freshness from our facility to your doorstep."
      ];

  // Simple form input state variables for beginners
  const [name, setName] = useState('');
  const [inquiryText, setInquiryText] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Simple form submit handler
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!phone.trim() && !email.trim()) {
      alert('Please enter your Mobile Number or Email Address.');
      return;
    }

    setIsSubmitting(true);
    const targetProduct = product?.name || product?.title || 'Product Enquiry';
    const payload = {
      name: name.trim() || (email ? email.split('@')[0] : (phone || 'Valued Customer')),
      phone: phone.trim(),
      email: email.trim(),
      message: inquiryText.trim(),
      productName: targetProduct,
      source: 'Website'
    };

    try {
      const res = await apiService.submitEnquiry(payload);
      if (res && res.success) {
        const savedEnquiry = res.data || {
          _id: `enq-${Date.now()}`,
          id: Date.now(),
          ...payload,
          status: 'New',
          createdAt: new Date().toISOString()
        };

        try {
          const stored = localStorage.getItem('enquiry_admin_customer_enquiries');
          const list = stored ? JSON.parse(stored) : [];
          localStorage.setItem('enquiry_admin_customer_enquiries', JSON.stringify([savedEnquiry, ...list]));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('enquiry_created', { detail: savedEnquiry }));
        } catch {}

        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setName('');
          setInquiryText('');
          setEmail('');
          setPhone('');
        }, 3000);
      } else {
        alert(res?.message || 'Failed to submit enquiry. Please check your information and try again.');
      }
    } catch (err) {
      console.error('Enquiry submission error:', err);
      alert('An error occurred while submitting enquiry. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="second-hero-section">
      <div className="sh-container-wrapper">
        <div className="sh-grid-container">
        
        {/* =================================================================
           LEFT SIDE: PRODUCT DESCRIPTION & FEATURE BANNER
           ================================================================= */}
        <div className="sh-desc-card">
          
          <h2 className="sh-desc-title">{HARDCODED_SECOND_HERO.title}</h2>
          <div className="sh-heading-divider"></div>

          {/* Description Paragraphs */}
          <div className="sh-desc-content">
            {displayParagraphs.map((text, index) => (
              <p key={index} className="sh-desc-paragraph">
                {text}
              </p>
            ))}
          </div>

          {/* Bottom Feature Highlights Bar */}
          <div className="sh-feature-banner">
            
            <div className="sh-feature-item">
              <Truck size={22} className="sh-feature-icon" />
              <span className="sh-feature-text-title">Free Delivery</span>
              <span className="sh-feature-text-sub">On orders above ₹999</span>
            </div>

            <div className="sh-feature-item">
              <RotateCcw size={22} className="sh-feature-icon" />
              <span className="sh-feature-text-title">Easy Returns</span>
              <span className="sh-feature-text-sub">30-day hassle-free</span>
            </div>

            <div className="sh-feature-item">
              <ShieldCheck size={22} className="sh-feature-icon" />
              <span className="sh-feature-text-title">Secure Payment</span>
              <span className="sh-feature-text-sub">100% safe checkout</span>
            </div>

          </div>

        </div>

        {/* =================================================================
           RIGHT SIDE: BUYING REQUIREMENT DETAILS FORM & CONTACT
           ================================================================= */}
        <div className="sh-right-column">
          
          {/* Main Form Box */}
          <div className="sh-form-card">
            
            {/* Form Header */}
            <div className="sh-form-header">
              <h3 className="sh-form-title">{HARDCODED_SECOND_HERO.formTitle}</h3>
              <p className="sh-form-subtitle">{HARDCODED_SECOND_HERO.formSubtitle}</p>
              <div className="sh-accent-bar"></div>
            </div>

            {/* Form Inputs */}
            <form className="sh-form-element" onSubmit={handleFormSubmit}>
              
              {/* 1. Customer Name Input */}
              <div className="sh-input-wrapper">
                <input
                  type="text"
                  className="sh-input"
                  placeholder="Customer Name*"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <User size={18} className="sh-input-icon" />
              </div>

              {/* 2. Inquiry Textarea Input */}
              <div className="sh-textarea-wrapper">
                <textarea
                  className="sh-textarea"
                  placeholder="Request If Any In Your Inquiry*"
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  required
                />
                <Pencil size={16} className="sh-textarea-icon" />
              </div>

              {/* 2. Email Address Input */}
              <div className="sh-input-wrapper">
                <input
                  type="email"
                  className="sh-input"
                  placeholder="Email Address*"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={18} className="sh-input-icon" />
              </div>

              {/* 3. Phone Number Input */}
              <div className="sh-input-wrapper">
                <input
                  type="tel"
                  className="sh-input"
                  placeholder="Phone Number*"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <Smartphone size={18} className="sh-input-icon" />
              </div>

              {/* 4. Send Inquiry Button */}
              <button type="submit" className="sh-submit-btn">
                <span>SEND INQUIRY</span>
                <ArrowRight size={18} />
              </button>

            </form>

            {/* Consent Notice */}
            <p className="sh-consent-text">
              By sending, you consent to us contacting you regarding inquiry.
            </p>

          </div>

          {/* Quick Contact Buttons Row */}
          <div className="sh-quick-contact-row">
            
            <button 
              type="button" 
              className="sh-contact-pill"
              onClick={() => alert(`Calling ${HARDCODED_SECOND_HERO.phoneNumber}`)}
            >
              <PhoneCall size={14} className="sh-icon-call" />
              <span>CALL US</span>
            </button>

            <button 
              type="button" 
              className="sh-contact-pill"
              onClick={() => {
                let num = '+91 9876543210';
                try {
                  const saved = localStorage.getItem('enquiry_admin_store_settings');
                  if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.whatsappNumber) num = parsed.whatsappNumber;
                  }
                } catch {}
                openWhatsApp(num, `Hi, I have an inquiry about ${product?.name || 'your products'}`);
              }}
            >
              <FaWhatsapp size={15} className="sh-icon-wa" />
              <span>WHATSAPP</span>
            </button>

            <button 
              type="button" 
              className="sh-contact-pill"
              onClick={() => alert(`Emailing ${HARDCODED_SECOND_HERO.supportEmail}`)}
            >
              <Mail size={14} className="sh-icon-email" />
              <span>EMAIL US</span>
            </button>

          </div>

        </div>
      </div>
    </div>
  </section>
  );
};

export default SecondHero;

import mongoose from 'mongoose'

const companySettingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: 'QuickEnquiry' },
    tagline: { type: String, default: '100% Organic & Stone Ground Spices' },
    foundedYear: { type: String, default: '2014' },
    whatsappNumber: { type: String, default: '+91 9876543210' },
    whatsappLinkType: { type: String, default: 'number' }, // 'number' | 'custom_link'
    whatsappCustomUrl: { type: String, default: '' },
    whatsappMessage: { type: String, default: 'Hello! I would like to make an enquiry.' },
    whatsappEnabled: { type: Boolean, default: true },
    whatsappTooltipText: { type: String, default: 'Chat with Us' },
    contactEmail: { type: String, default: '' },
    officeAddress: { type: String, default: 'Sector 62, Business Park, Noida, UP - 201309' },

    // Active Homepage Layout ('home1' | 'home2')
    activeHomepage: { type: String, default: 'home1' },

    // Header Topbar Styling Settings
    topbarBgColor: { type: String, default: '#E0F2FE' },
    topbarTextColor: { type: String, default: '#1E293B' },
    announcementText: { type: String, default: 'Free Shipping on orders over ₹499 | Premium Stone Ground Spices' },
    logoType: { type: String, default: 'icon' },
    logoText: { type: String, default: 'QuickEnquiry' },
    logoUrl: { type: String, default: '' },
    logoIconColor: { type: String, default: '#86d2a3' },

    // About Hero Section
    aboutBadge: { type: String, default: 'ABOUT QUICKENQUIRY' },
    aboutTitle: { type: String, default: 'Empowering Businesses with Seamless Product Enquiry & Trade' },
    aboutDesc: { type: String, default: 'QuickEnquiry is a premier B2B and B2C digital enquiry platform dedicated to connecting buyers directly with verified manufacturers.' },

    // Trust Stats
    statYears: { type: String, default: '12+' },
    statYearsLabel: { type: String, default: 'Years Market Trust' },
    statEnquiries: { type: String, default: '50k+' },
    statEnquiriesLabel: { type: String, default: 'Enquiries Fulfilled' },
    statSatisfaction: { type: String, default: '98.6%' },
    statSatisfactionLabel: { type: String, default: 'Customer Satisfaction' },
    statCategories: { type: String, default: '100+' },
    statCategoriesLabel: { type: String, default: 'Product Categories' },

    // Building Excellence / Story Section
    storySubtitle: { type: String, default: '— BUILDING EXCELLENCE' },
    storyTitle: { type: String, default: 'One Relationship at a Time' },
    storyImageUrl: { type: String, default: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80' },
    storyParagraph1: { type: String, default: 'Founded with a clear vision and unwavering commitment, we have grown into a trusted partner for thousands of clients across the country.' },
    storyParagraph2: { type: String, default: 'From our very first day, we believed that exceptional service is not a luxury — it is a standard.' },

    // Mission & Vision
    missionHeading: { type: String, default: 'Empowering Businesses & Delivering Excellence' },
    missionText: { type: String, default: 'Our mission is to deliver exceptional, personalised services that solve real problems, create genuine value, and help each client grow with confidence.' },
    missionPoints: {
      type: [String],
      default: [
        'Deliver measurable results with every engagement',
        'Foster long-term partnerships built on trust',
        'Continuously improve through client feedback',
        'Make excellence accessible to businesses of all sizes'
      ]
    },
    missionPoint1: { type: String, default: 'Deliver measurable results with every engagement' },
    missionPoint2: { type: String, default: 'Foster long-term partnerships built on trust' },
    missionPoint3: { type: String, default: 'Continuously improve through client feedback' },
    missionPoint4: { type: String, default: 'Make excellence accessible to businesses of all sizes' },

    visionHeading: { type: String, default: 'A Future Where Quality Is Never Compromised' },
    visionText: { type: String, default: 'We envision a world where every individual and organisation has access to world-class service — regardless of size or scale.' },
    visionPoints: {
      type: [String],
      default: [
        'Become the most trusted name in our industry',
        'Lead innovation without losing the human touch',
        'Scale our impact across communities and sectors',
        'Build a legacy of excellence for future generations'
      ]
    },
    visionPoint1: { type: String, default: 'Become the most trusted name in our industry' },
    visionPoint2: { type: String, default: 'Lead innovation without losing the human touch' },
    visionPoint3: { type: String, default: 'Scale our impact across communities and sectors' },
    visionPoint4: { type: String, default: 'Build a legacy of excellence for future generations' },

    // Our DNA Core Values
    dnaSubtitle: { type: String, default: '— OUR DNA —' },
    dnaTitle: { type: String, default: 'The Values That Define Us' },
    dnaCards: {
      type: [
        {
          title: { type: String },
          desc: { type: String }
        }
      ],
      default: [
        {
          title: 'Integrity',
          desc: 'We say what we mean and do what we say. Honesty is the foundation of every relationship we build.'
        },
        {
          title: 'Innovation',
          desc: 'We embrace change, challenge convention, and constantly seek better ways to serve our clients.'
        },
        {
          title: 'Empathy',
          desc: 'We understand that behind every enquiry is a person. Compassion shapes every interaction we have.'
        },
        {
          title: 'Excellence',
          desc: 'Good enough is never enough. We hold ourselves to the highest standard in every single task.'
        }
      ]
    },
    dnaCard1Title: { type: String, default: 'Integrity' },
    dnaCard1Desc: { type: String, default: 'We say what we mean and do what we say. Honesty is the foundation of every relationship we build.' },
    dnaCard2Title: { type: String, default: 'Innovation' },
    dnaCard2Desc: { type: String, default: 'We embrace change, challenge convention, and constantly seek better ways to serve our clients.' },
    dnaCard3Title: { type: String, default: 'Empathy' },
    dnaCard3Desc: { type: String, default: 'We understand that behind every enquiry is a person. Compassion shapes every interaction we have.' },
    dnaCard4Title: { type: String, default: 'Excellence' },
    dnaCard4Desc: { type: String, default: 'Good enough is never enough. We hold ourselves to the highest standard in every single task.' },

    // FAQ Section Settings & Items
    faqSubtitle: { type: String, default: 'COMMON QUESTIONS' },
    faqTitle: { type: String, default: 'Frequently asked questions.' },
    faqContactPrompt: { type: String, default: "Can't find what you're looking for?" },
    faqContactBtnText: { type: String, default: 'Contact support' },
    faqs: {
      type: [
        {
          id: { type: Number },
          question: { type: String },
          answer: { type: String }
        }
      ],
      default: [
        {
          id: 1,
          question: 'How can I submit an enquiry?',
          answer: 'You can submit an enquiry by filling out the enquiry form on our website. Our team will review your request and get back to you shortly.'
        },
        {
          id: 2,
          question: 'How long does it take to receive a response?',
          answer: 'Our team typically responds to enquiries within 24 to 48 business hours.'
        },
        {
          id: 3,
          question: 'Can I contact your team directly?',
          answer: 'Yes, you can contact our team through phone, email, or WhatsApp during our business hours.'
        },
        {
          id: 4,
          question: 'Do you handle business and bulk enquiries?',
          answer: 'Yes, we welcome business, wholesale, partnership, and bulk enquiries. Please provide your requirements through the enquiry form.'
        },
        {
          id: 5,
          question: 'Can I request more information about your company?',
          answer: 'Absolutely. Submit your enquiry with your requirements, and our team will provide the relevant information and assistance.'
        }
      ]
    },

    // Homepage "About Company / Who We Are" Section
    homeAboutSubtitle: { type: String, default: '— WHO WE ARE' },
    homeAboutTitle: { type: String, default: 'About Our Company' },
    homeAboutDesc1: {
      type: String,
      default:
        'Established in 2012, we have grown from a small local business into a trusted national brand. Our commitment to quality, innovation, and customer satisfaction has made us the preferred choice for thousands of customers across the country.'
    },
    homeAboutDesc2: {
      type: String,
      default:
        'Every product in our catalogue is carefully selected and quality-checked to ensure it meets our high standards. We believe that great products and great service go hand in hand.'
    },
    homeAboutImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
    },
    homeAboutBadge1Number: { type: String, default: '12+' },
    homeAboutBadge1Label: { type: String, default: 'YEARS ESTABLISHED' },
    homeAboutBadge2Number: { type: String, default: '35+' },
    homeAboutBadge2Label: { type: String, default: 'TEAM MEMBERS' },
    homeAboutBtnText: { type: String, default: 'About More' },
    homeAboutBtnLink: { type: String, default: '/about-company' },

    // Homepage "Why Choose Us" Feature Highlights Section
    whyChooseTag: { type: String, default: '• WHY CHOOSE US •' },
    whyChooseTitle: { type: String, default: 'Why Choose Us' },
    whyChooseSubtitle: { type: String, default: 'Our Commitment to Quality, Purity & Customer Satisfaction' },
    whyChooseFeatures: {
      type: [
        {
          id: { type: Number },
          title: { type: String },
          description: { type: String },
          icon: { type: String, default: 'ShieldCheck' }
        }
      ],
      default: [
        {
          id: 1,
          title: 'Trusted by Partners',
          description: 'We are the preferred choice of distributors, wholesalers and retailers across the country.',
          icon: 'ShieldCheck'
        },
        {
          id: 2,
          title: 'Quality Tested',
          description: 'Every batch undergoes strict quality checks to meet international standards.',
          icon: 'Sparkles'
        },
        {
          id: 3,
          title: 'Best Prices',
          description: 'We offer competitive pricing without compromising on quality.',
          icon: 'Heart'
        },
        {
          id: 4,
          title: 'Help Center',
          description: 'Our dedicated support team is available 24/7 to assist you at every step.',
          icon: 'UserCheck'
        }
      ]
    },

    // Homepage "What They Say About Us" Reviews Section
    reviewTag: { type: String, default: '— CUSTOMER LOVE' },
    reviewTitle: { type: String, default: 'What They Say About Us' },
    reviewsList: {
      type: [
        {
          id: { type: Number },
          category: { type: String, default: 'TRUST & QUALITY' },
          rating: { type: Number, default: 5 },
          review: { type: String },
          name: { type: String },
          verified: { type: String, default: 'Verified Buyer' },
          location: { type: String, default: 'India' },
          image: { type: String }
        }
      ],
      default: [
        {
          id: 1,
          category: 'NATIONAL IMPACT',
          rating: 5,
          review: 'Excellent experience from ordering to delivery. The product quality is premium and the customer support team is very helpful.',
          name: 'Vikram Singh',
          verified: 'Verified Buyer',
          location: 'Jaipur',
          image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'
        },
        {
          id: 2,
          category: 'TRUST & QUALITY',
          rating: 5,
          review: 'I really liked the authentic taste and freshness of the products. Great packaging and a smooth shopping experience.',
          name: 'Neha Kapoor',
          verified: 'Verified Buyer',
          location: 'Chandigarh',
          image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
        },
        {
          id: 3,
          category: 'FRESHNESS',
          rating: 5,
          review: 'The freshness and aroma of the spices are outstanding. The quality feels premium and the delivery was quick.',
          name: 'Arjun Malhotra',
          verified: 'Verified Buyer',
          location: 'Hyderabad',
          image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=200&q=80'
        },
        {
          id: 4,
          category: 'CUSTOMER SATISFACTION',
          rating: 5,
          review: 'The spices have authentic flavor and excellent aroma. I have already recommended these products to my family and friends.',
          name: 'Rahul Mehta',
          verified: 'Verified Buyer',
          location: 'Bangalore',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
        }
      ]
    },

    // Homepage "Trusted By" Partner Brands Ticker Section
    trustedByLabel: { type: String, default: 'TRUSTED BY' },
    trustedByPartners: {
      type: [String],
      default: [
        'Reliance Retail',
        'Big Basket',
        'D-Mart',
        'Amazon Fresh',
        'Flipkart',
        'Jiomart',
        'Blinkit',
        'Zepto',
        'Swiggy Instamart'
      ]
    },

    // Homepage "Popular Products" Coverflow Carousel Section
    popularProductsSubtitle: { type: String, default: '— TRENDING NOW' },
    popularProductsTitleMain: { type: String, default: 'Popular' },
    popularProductsTitleHighlight: { type: String, default: 'Products' },
    popularProductsDesc: {
      type: String,
      default: 'Explore our most-loved items, trusted by thousands of happy customers across the country.'
    },
    popularProductsBrowseText: { type: String, default: 'Browse All Products' },
    popularProductsBrowseLink: { type: String, default: '/product' },
    popularProductsAutoPlay: { type: Boolean, default: true },
    popularProductsInterval: { type: Number, default: 3 },
    popularProductsShowEnquire: { type: Boolean, default: true },
    popularProductsShowBulk: { type: Boolean, default: true },
    popularProductsShowPdf: { type: Boolean, default: true },
    popularProductsList: {
      type: [
        { 
          id: { type: Number },
          name: { type: String },
          category: { type: String },
          image: { type: String },
          slug: { type: String },
          pdfUrl: { type: String, default: '' },
          whatsappNumber: { type: String, default: '' }
        }
      ],
      default: [
        {
          id: 13,
          slug: 'chaat-masala',
          name: 'Chaat Masala',
          category: 'MIX MASALA',
          image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
          pdfUrl: '',
          whatsappNumber: '+919876543210'
        },
        {
          id: 14,
          slug: 'kitchen-king-masala',
          name: 'Kitchen King Masala',
          category: 'MIX MASALA',
          image: '/garam_masala.png',
          pdfUrl: '',
          whatsappNumber: '+919876543210'
        },
        {
          id: 15,
          slug: 'pav-bhaji-masala',
          name: 'Pav Bhaji Masala',
          category: 'MIX MASALA',
          image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
          pdfUrl: '',
          whatsappNumber: '+919876543210'
        },
        {
          id: 16,
          slug: 'biryani-masala',
          name: 'Biryani Masala',
          category: 'MIX MASALA',
          image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
          pdfUrl: '',
          whatsappNumber: '+919876543210'
        },
        {
          id: 1,
          slug: 'garam-masala',
          name: 'Garam Masala',
          category: 'PURE SPICES',
          image: '/garam_masala.png',
          pdfUrl: '',
          whatsappNumber: '+919876543210'
        }
      ]
    },

    // Footer Configuration
    footerBrandName: { type: String, default: 'QuickEnquiry' },
    footerBrandDesc: {
      type: String,
      default: 'Dedicated to pure customer service since 2012. Our commitment is quality and innovation.'
    },
    footerLearnBtnText: { type: String, default: 'Learn More' },
    footerLearnBtnLink: { type: String, default: '/about-company' },
    footerSocialFacebook: { type: String, default: 'https://facebook.com' },
    footerSocialTwitter: { type: String, default: 'https://twitter.com' },
    footerSocialInstagram: { type: String, default: 'https://instagram.com' },
    footerSocialLinkedin: { type: String, default: 'https://linkedin.com' },
    footerSocialYoutube: { type: String, default: 'https://youtube.com' },
    footerCol1Title: { type: String, default: 'CATEGORY' },
    footerCol1Links: {
      type: [{ label: String, url: String }],
      default: [
        { label: 'Edible Oils', url: '#category' },
        { label: 'Mix Masala', url: '#category' },
        { label: 'Soya Chunks', url: '#category' },
        { label: 'Pure Spices', url: '#category' }
      ]
    },
    footerCol2Title: { type: String, default: 'OTHER LINKS' },
    footerCol2Links: {
      type: [{ label: String, url: String }],
      default: [
        { label: 'Help & Support', url: '#links' },
        { label: 'Blog & Articles', url: '#links' },
        { label: 'Privacy Policy', url: '#links' },
        { label: "T&C's", url: '#links' }
      ]
    },
    footerShowBadges: { type: Boolean, default: true },
    footerBadge1Text: { type: String, default: 'ISO 22000' },
    footerBadge2Text: { type: String, default: 'fssai' },
    footerBadge3Sub: { type: String, default: 'Appoint Distributors' },
    footerBadge3Main: { type: String, default: 'TRUSTED PARTNER' },
    footerConnectTitle: { type: String, default: 'CONNECT WITH US' },
    footerPhone: { type: String, default: '+91 9876543210' },
    footerEmail: { type: String, default: 'info@quick-enquiry.co' },
    footerAddress: { type: String, default: 'Suite 300, London, UK' },
    footerCopyright: {
      type: String,
      default: '©2025 QuickEnquiry. London, UK. All materials are protected. Crafted with ♡ by Appoint Distributors.'
    },

    // Outbound SMTP & Email Delivery Settings
    smtp: {
      enabled: { type: Boolean, default: true },
      provider: { type: String, default: 'gmail' },
      host: { type: String, default: 'smtp.gmail.com' },
      port: { type: Number, default: 587 },
      encryption: { type: String, default: 'TLS' },
      user: { type: String, default: '' },
      password: { type: String, default: '' },
      fromName: { type: String, default: 'QuickEnquiry' },
      fromEmail: { type: String, default: '' },
      replyTo: { type: String, default: '' },
      adminRecipient: { type: String, default: '' },
      notifyOnNewEnquiry: { type: Boolean, default: true },
      sendCustomerReceipt: { type: Boolean, default: true },
      lowStockAlert: { type: Boolean, default: false }
    },

    // Cloudinary Media Configuration
    cloudinary: {
      enabled: { type: Boolean, default: true },
      cloudName: { type: String, default: '' },
      apiKey: { type: String, default: '' },
      apiSecret: { type: String, default: '' },
      folder: { type: String, default: 'enquiry_products' }
    }
  },
  { timestamps: true }
)

const CompanySettings = mongoose.model('CompanySettings', companySettingsSchema)

export default CompanySettings

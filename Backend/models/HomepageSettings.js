import mongoose from 'mongoose'

const homepageSettingsSchema = new mongoose.Schema(
  {
    activeHomepage: { type: String, default: 'home1' },
    topbarBgColor: { type: String, default: '#E0F2FE' },
    topbarTextColor: { type: String, default: '#1E293B' },
    announcementText: { type: String, default: 'Free Shipping on orders over ₹499 | Premium Stone Ground Spices' },

    // About Section
    homeAboutSubtitle: { type: String, default: '— WHO WE ARE' },
    homeAboutTitle: { type: String, default: 'About Our Company' },
    homeAboutDesc1: { type: String, default: 'Established in 2012, we have grown from a small local business into a trusted national brand.' },
    homeAboutDesc2: { type: String, default: 'Every product in our catalogue is carefully selected and quality-checked to ensure it meets our high standards.' },
    homeAboutImage: { type: String, default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80' },
    homeAboutBadge1Number: { type: String, default: '12+' },
    homeAboutBadge1Label: { type: String, default: 'YEARS ESTABLISHED' },
    homeAboutBadge2Number: { type: String, default: '35+' },
    homeAboutBadge2Label: { type: String, default: 'TEAM MEMBERS' },
    homeAboutBtnText: { type: String, default: 'About More' },
    homeAboutBtnLink: { type: String, default: '/about-company' },

    // About Section (Beauty - Homepage 2)
    homeAboutSubtitleBeauty: { type: String, default: '— WHO WE ARE' },
    homeAboutTitleBeauty: { type: String, default: 'About Our Beauty Care' },
    homeAboutDesc1Beauty: { type: String, default: 'Established in 2012, we are dedicated to crafting dermatologically-tested, organic, and cruelty-free skincare, haircare, and cosmetic solutions.' },
    homeAboutDesc2Beauty: { type: String, default: 'Every serum, hydrating gel, and botanical elixir in our collection is carefully formulated with clean, active ingredients.' },
    homeAboutImageBeauty: { type: String, default: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80' },
    homeAboutBadge1NumberBeauty: { type: String, default: '12+' },
    homeAboutBadge1LabelBeauty: { type: String, default: 'YEARS IN BEAUTY' },
    homeAboutBadge2NumberBeauty: { type: String, default: '100%' },
    homeAboutBadge2LabelBeauty: { type: String, default: 'CRUELTY FREE & VEGAN' },
    homeAboutBtnTextBeauty: { type: String, default: 'About More' },
    homeAboutBtnLinkBeauty: { type: String, default: '/about-company' },

    // FAQs
    faqSubtitle: { type: String, default: 'COMMON QUESTIONS' },
    faqTitle: { type: String, default: 'Frequently asked questions.' },
    faqContactPrompt: { type: String, default: "Can't find what you're looking for?" },
    faqContactBtnText: { type: String, default: 'Contact support' },
    faqs: { type: Array, default: [] },

    // Why Choose Us
    whyChooseTag: { type: String, default: '• WHY CHOOSE US •' },
    whyChooseTitle: { type: String, default: 'Why Choose Us' },
    whyChooseSubtitle: { type: String, default: 'Our Commitment to Quality, Purity & Customer Satisfaction' },
    whyChooseFeatures: { type: Array, default: [] },

    // Reviews
    reviewTag: { type: String, default: '— CUSTOMER LOVE' },
    reviewTitle: { type: String, default: 'What They Say About Us' },
    reviewsList: { type: Array, default: [] },

    // Trusted By
    trustedByLabel: { type: String, default: 'TRUSTED BY' },
    trustedByPartners: { type: Array, default: [] },

    // Popular Products 
    popularProductsSubtitle: { type: String, default: 'POPULAR PRODUCTS' },
    popularProductsTitleMain: { type: String, default: 'Explore Our Most Loved' },
    popularProductsTitleHighlight: { type: String, default: 'Spices' },
    popularProductsDesc: { type: String, default: 'Discover our top-rated authentic spices loved by thousands of homes.' },
    popularProductsBrowseText: { type: String, default: 'Browse All Products' },
    popularProductsBrowseLink: { type: String, default: '/products' },
    popularProductsAutoPlay: { type: Boolean, default: true },
    popularProductsInterval: { type: Number, default: 3500 },
    popularProductsShowEnquire: { type: Boolean, default: true },
    popularProductsShowBulk: { type: Boolean, default: true },
    popularProductsShowPdf: { type: Boolean, default: true },
    popularProductsList: { type: Array, default: [] },

    // Popular Products (Beauty - Homepage 2)
    popularProductsSubtitleBeauty: { type: String, default: '— MOST LOVED BEAUTY' },
    popularProductsTitleMainBeauty: { type: String, default: 'Popular' },
    popularProductsTitleHighlightBeauty: { type: String, default: 'Products' },
    popularProductsDescBeauty: { type: String, default: 'Explore our most-loved skincare, haircare, and beauty essentials, trusted by thousands of glowing customers.' },
    popularProductsBrowseTextBeauty: { type: String, default: 'Browse Beauty Collection' },
    popularProductsBrowseLinkBeauty: { type: String, default: '/product' },
    popularProductsListBeauty: { type: Array, default: [] },

    // Section Visibility
    sectionVisibility: { type: Object, default: {} }
  },
  {
    timestamps: true,
    collection: 'homepagesettings',
    strict: false
  }
)

const HomepageSettings = mongoose.model('HomepageSettings', homepageSettingsSchema)
export default HomepageSettings

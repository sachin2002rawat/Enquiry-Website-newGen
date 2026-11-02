import mongoose from 'mongoose'
import dotenv from 'dotenv'
import CompanySettings from '../models/CompanySettings.js'
import HomepageSettings from '../models/HomepageSettings.js'
import FooterSettings from '../models/FooterSettings.js'

dotenv.config()
const uri = process.env.MONGO_URI || process.env.MONGODB_URI
await mongoose.connect(uri)

const company = await CompanySettings.findOne()
const companyObj = company ? (company.toObject ? company.toObject() : company) : {}

// 1. Seed HomepageSettings
let homeDoc = await HomepageSettings.findOne()
if (!homeDoc) {
  homeDoc = await HomepageSettings.create({
    activeHomepage: companyObj.activeHomepage || 'home1',
    topbarBgColor: companyObj.topbarBgColor || '#E0F2FE',
    topbarTextColor: companyObj.topbarTextColor || '#1E293B',
    announcementText: companyObj.announcementText || 'Free Shipping on orders over ₹499 | Premium Stone Ground Spices',
    homeAboutSubtitle: companyObj.homeAboutSubtitle || '— WHO WE ARE',
    homeAboutTitle: companyObj.homeAboutTitle || 'About Our Company',
    homeAboutDesc1: companyObj.homeAboutDesc1 || 'Established in 2012, we have grown from a small local business into a trusted national brand.',
    homeAboutDesc2: companyObj.homeAboutDesc2 || 'Every product in our catalogue is carefully selected and quality-checked to ensure it meets our high standards.',
    homeAboutImage: companyObj.homeAboutImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    homeAboutBadge1Number: companyObj.homeAboutBadge1Number || '12+',
    homeAboutBadge1Label: companyObj.homeAboutBadge1Label || 'YEARS ESTABLISHED',
    homeAboutBadge2Number: companyObj.homeAboutBadge2Number || '35+',
    homeAboutBadge2Label: companyObj.homeAboutBadge2Label || 'TEAM MEMBERS',
    homeAboutBtnText: companyObj.homeAboutBtnText || 'About More',
    homeAboutBtnLink: companyObj.homeAboutBtnLink || '/about-company',
    faqSubtitle: companyObj.faqSubtitle || 'COMMON QUESTIONS',
    faqTitle: companyObj.faqTitle || 'Frequently asked questions.',
    faqContactPrompt: companyObj.faqContactPrompt || "Can't find what you're looking for?",
    faqContactBtnText: companyObj.faqContactBtnText || 'Contact support',
    faqs: companyObj.faqs || [],
    whyChooseTag: companyObj.whyChooseTag || '• WHY CHOOSE US •',
    whyChooseTitle: companyObj.whyChooseTitle || 'Why Choose Us',
    whyChooseSubtitle: companyObj.whyChooseSubtitle || 'Our Commitment to Quality, Purity & Customer Satisfaction',
    whyChooseFeatures: companyObj.whyChooseFeatures || [],
    reviewTag: companyObj.reviewTag || '— CUSTOMER LOVE',
    reviewTitle: companyObj.reviewTitle || 'What They Say About Us',
    reviewsList: companyObj.reviewsList || [],
    trustedByLabel: companyObj.trustedByLabel || 'TRUSTED BY',
    trustedByPartners: companyObj.trustedByPartners || [],
    popularProductsSubtitle: companyObj.popularProductsSubtitle || 'POPULAR PRODUCTS',
    popularProductsTitleMain: companyObj.popularProductsTitleMain || 'Explore Our Most Loved',
    popularProductsTitleHighlight: companyObj.popularProductsTitleHighlight || 'Spices',
    popularProductsDesc: companyObj.popularProductsDesc || 'Discover our top-rated authentic spices loved by thousands of homes.',
    popularProductsBrowseText: companyObj.popularProductsBrowseText || 'Browse All Products',
    popularProductsBrowseLink: companyObj.popularProductsBrowseLink || '/products',
    popularProductsAutoPlay: companyObj.popularProductsAutoPlay !== false,
    popularProductsInterval: companyObj.popularProductsInterval || 3500,
    popularProductsShowEnquire: companyObj.popularProductsShowEnquire !== false,
    popularProductsShowBulk: companyObj.popularProductsShowBulk !== false,
    popularProductsShowPdf: companyObj.popularProductsShowPdf !== false,
    popularProductsList: companyObj.popularProductsList || [],
    sectionVisibility: companyObj.sectionVisibility || {}
  })
  console.log('✅ Created homepagesettings collection & document')
} else {
  console.log('ℹ️ homepagesettings already exists')
}

// 2. Seed FooterSettings
let footerDoc = await FooterSettings.findOne()
if (!footerDoc) {
  footerDoc = await FooterSettings.create({
    footerBgColor: companyObj.footerBgColor || '#0B132B',
    footerTextColor: companyObj.footerTextColor || '#E2E8F0',
    footerDescription: companyObj.footerDescription || 'Connecting buyers directly with verified manufacturers, suppliers, and distributors.',
    footerCopyrightText: companyObj.footerCopyrightText || '© 2026 QuickEnquiry. All rights reserved.',
    footerPhone: companyObj.footerPhone || companyObj.companyPhone || '+91 9555140701',
    footerEmail: companyObj.footerEmail || companyObj.contactEmail || 'info@enquirybrand.com',
    footerAddress: companyObj.footerAddress || companyObj.officeAddress || 'Sector 62, Business Park, Noida, UP - 201309',
    footerSocialLinks: companyObj.footerSocialLinks || {},
    footerCategoryLinks: companyObj.footerCategoryLinks || [],
    footerQuickLinks: companyObj.footerQuickLinks || [],
    footerCertifications: companyObj.footerCertifications || []
  })
  console.log('✅ Created footersettings collection & document')
} else {
  console.log('ℹ️ footersettings already exists')
}

const collections = await mongoose.connection.db.listCollections().toArray()
console.log('ALL DB COLLECTIONS NOW:', collections.map(c => c.name))
process.exit(0)

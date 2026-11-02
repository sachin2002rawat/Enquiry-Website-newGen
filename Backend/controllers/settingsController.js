import CompanySettings from '../models/CompanySettings.js'
import SmtpSettings from '../models/SmtpSettings.js'
import CloudinarySettings from '../models/CloudinarySettings.js'
import WhatsAppSettings from '../models/WhatsAppSettings.js'
import HomepageSettings from '../models/HomepageSettings.js'
import FooterSettings from '../models/FooterSettings.js'
import { testCloudinaryConfig, getActiveCloudinaryConfig } from '../config/cloudinary.js'

// @desc    Get company and store settings (consolidated)
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    let settings = await CompanySettings.findOne()
    if (!settings) {
      settings = await CompanySettings.create({})
    }

    const settingsObj = settings.toObject ? settings.toObject() : { ...settings }

    // Dynamically merge latest data from all dedicated collections
    const [smtpDoc, cloudDoc, waDoc, homeDoc, footerDoc] = await Promise.all([
      SmtpSettings.findOne(),
      CloudinarySettings.findOne(),
      WhatsAppSettings.findOne(),
      HomepageSettings.findOne(),
      FooterSettings.findOne()
    ])

    if (homeDoc) Object.assign(settingsObj, homeDoc.toObject ? homeDoc.toObject() : homeDoc)
    if (footerDoc) Object.assign(settingsObj, footerDoc.toObject ? footerDoc.toObject() : footerDoc)
    if (smtpDoc) {
      const safeSmtp = smtpDoc.toObject ? smtpDoc.toObject() : { ...smtpDoc }
      if (safeSmtp.password) {
        safeSmtp.password = '••••••••••••••••'
      }
      settingsObj.smtp = safeSmtp
    }
    if (cloudDoc) settingsObj.cloudinary = cloudDoc
    if (waDoc) {
      settingsObj.whatsappNumber = waDoc.whatsappNumber
      settingsObj.whatsappLinkType = waDoc.whatsappLinkType
      settingsObj.whatsappCustomUrl = waDoc.whatsappCustomUrl
      settingsObj.whatsappMessage = waDoc.whatsappMessage
      settingsObj.whatsappEnabled = waDoc.whatsappEnabled
      settingsObj.whatsappTooltipText = waDoc.whatsappTooltipText
    }

    res.status(200).json({ success: true, data: settingsObj })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Update company and store settings
// @route   PUT /api/settings
// @access  Public / Admin
export const updateSettings = async (req, res) => {
  try {
    let settings = await CompanySettings.findOne()
    const updateData = { ...req.body }

    // 1. If SMTP settings are provided, save to dedicated smtpsettings collection
    if (updateData.smtp) {
      const existingSmtp = (await SmtpSettings.findOne()) || settings?.smtp || {}
      
      if (!updateData.smtp.password || updateData.smtp.password === '••••••••••••••••') {
        updateData.smtp.password = existingSmtp.password || process.env.SMTP_PASS || ''
      }

      if (updateData.smtp.user) {
        updateData.smtp.user = updateData.smtp.user.trim()
      }

      const isPlaceholder = (val) => !val || String(val).includes('quick-enquiry.co') || String(val).includes('yourdomain.com')

      if (updateData.smtp.adminRecipient && !isPlaceholder(updateData.smtp.adminRecipient)) {
        updateData.smtp.adminRecipient = updateData.smtp.adminRecipient.trim()
      } else if (updateData.smtp.replyTo && !isPlaceholder(updateData.smtp.replyTo)) {
        updateData.smtp.adminRecipient = updateData.smtp.replyTo.trim()
      } else if (updateData.smtp.user) {
        updateData.smtp.adminRecipient = updateData.smtp.user.trim()
      }

      if (updateData.smtp.replyTo && !isPlaceholder(updateData.smtp.replyTo)) {
        updateData.smtp.replyTo = updateData.smtp.replyTo.trim()
      } else if (updateData.smtp.adminRecipient && !isPlaceholder(updateData.smtp.adminRecipient)) {
        updateData.smtp.replyTo = updateData.smtp.adminRecipient.trim()
      } else if (updateData.smtp.user) {
        updateData.smtp.replyTo = updateData.smtp.user.trim()
      }

      if (updateData.smtp.fromEmail && !isPlaceholder(updateData.smtp.fromEmail)) {
        updateData.smtp.fromEmail = updateData.smtp.fromEmail.trim()
      } else if (updateData.smtp.user) {
        updateData.smtp.fromEmail = updateData.smtp.user.trim()
      }

      if (updateData.smtp.adminRecipient && !isPlaceholder(updateData.smtp.adminRecipient)) {
        updateData.contactEmail = updateData.smtp.adminRecipient
      } else if (updateData.smtp.replyTo && !isPlaceholder(updateData.smtp.replyTo)) {
        updateData.contactEmail = updateData.smtp.replyTo
      } else if (updateData.smtp.user) {
        updateData.contactEmail = updateData.smtp.user.trim()
      }

      await SmtpSettings.findOneAndUpdate(
        {},
        { $set: updateData.smtp },
        { upsert: true, new: true, runValidators: true }
      )
    }

    // 2. If Cloudinary settings are provided, save to dedicated cloudinarysettings collection
    if (updateData.cloudinary) {
      await CloudinarySettings.findOneAndUpdate(
        {},
        { $set: updateData.cloudinary },
        { upsert: true, new: true, runValidators: true }
      )
    }

    // 3. If WhatsApp settings are provided, save to dedicated whatsappsettings collection
    const waKeys = ['whatsappNumber', 'whatsappLinkType', 'whatsappCustomUrl', 'whatsappMessage', 'whatsappEnabled', 'whatsappTooltipText']
    const waData = {}
    waKeys.forEach(k => {
      if (updateData[k] !== undefined) waData[k] = updateData[k]
    })
    if (Object.keys(waData).length > 0) {
      await WhatsAppSettings.findOneAndUpdate(
        {},
        { $set: waData },
        { upsert: true, new: true, runValidators: true }
      )
    }

    // 4. If Homepage settings are provided, save to dedicated homepagesettings collection
    const homepageKeys = [
      'activeHomepage', 'topbarBgColor', 'topbarTextColor', 'announcementText',
      'homeAboutSubtitle', 'homeAboutTitle', 'homeAboutDesc1', 'homeAboutDesc2', 'homeAboutImage',
      'homeAboutBadge1Number', 'homeAboutBadge1Label', 'homeAboutBadge2Number', 'homeAboutBadge2Label',
      'homeAboutBtnText', 'homeAboutBtnLink', 'faqSubtitle', 'faqTitle', 'faqContactPrompt',
      'faqContactBtnText', 'faqs', 'whyChooseTag', 'whyChooseTitle', 'whyChooseSubtitle',
      'whyChooseFeatures', 'reviewTag', 'reviewTitle', 'reviewsList', 'trustedByLabel',
      'trustedByPartners', 'popularProductsSubtitle', 'popularProductsTitleMain',
      'popularProductsTitleHighlight', 'popularProductsDesc', 'popularProductsBrowseText',
      'popularProductsBrowseLink', 'popularProductsAutoPlay', 'popularProductsInterval',
      'popularProductsShowEnquire', 'popularProductsShowBulk', 'popularProductsShowPdf',
      'popularProductsList', 'sectionVisibility'
    ]
    const homeUpdate = {}
    homepageKeys.forEach(k => {
      if (updateData[k] !== undefined) homeUpdate[k] = updateData[k]
    })
    if (Object.keys(homeUpdate).length > 0) {
      await HomepageSettings.findOneAndUpdate(
        {},
        { $set: homeUpdate },
        { upsert: true, new: true }
      )
    }

    // 5. If Footer settings are provided, save to dedicated footersettings collection
    const footerKeys = [
      'footerBgColor', 'footerTextColor', 'footerDescription', 'footerCopyrightText',
      'footerPhone', 'footerEmail', 'footerAddress', 'footerSocialLinks',
      'footerCategoryLinks', 'footerQuickLinks', 'footerCertifications'
    ]
    const footerUpdate = {}
    footerKeys.forEach(k => {
      if (updateData[k] !== undefined) footerUpdate[k] = updateData[k]
    })
    if (Object.keys(footerUpdate).length > 0) {
      await FooterSettings.findOneAndUpdate(
        {},
        { $set: footerUpdate },
        { upsert: true, new: true }
      )
    }

    // 6. Update CompanySettings collection
    if (!settings) {
      settings = await CompanySettings.create(updateData)
    } else {
      settings = await CompanySettings.findByIdAndUpdate(
        settings._id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
    }

    res.status(200).json({ success: true, message: 'Settings updated successfully across collections', data: settings })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ==========================================
// DEDICATED HOMEPAGE SETTINGS CONTROLLERS
// ==========================================
export const getHomepageSettings = async (req, res) => {
  try {
    let doc = await HomepageSettings.findOne()
    if (!doc) {
      doc = await HomepageSettings.create({})
    }
    res.status(200).json({ success: true, data: doc })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updateHomepageSettings = async (req, res) => {
  try {
    const doc = await HomepageSettings.findOneAndUpdate(
      {},
      { $set: req.body },
      { upsert: true, new: true }
    )
    await CompanySettings.findOneAndUpdate({}, { $set: req.body }, { upsert: true })
    res.status(200).json({ success: true, message: 'Homepage settings updated successfully in homepagesettings', data: doc })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ==========================================
// DEDICATED FOOTER SETTINGS CONTROLLERS
// ==========================================
export const getFooterSettings = async (req, res) => {
  try {
    let doc = await FooterSettings.findOne()
    if (!doc) {
      doc = await FooterSettings.create({})
    }
    res.status(200).json({ success: true, data: doc })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updateFooterSettings = async (req, res) => {
  try {
    const doc = await FooterSettings.findOneAndUpdate(
      {},
      { $set: req.body },
      { upsert: true, new: true }
    )
    await CompanySettings.findOneAndUpdate({}, { $set: req.body }, { upsert: true })
    res.status(200).json({ success: true, message: 'Footer settings updated successfully in footersettings', data: doc })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ==========================================
// DEDICATED COMPANY SETTINGS CONTROLLERS
// ==========================================
export const getCompanySettings = async (req, res) => {
  try {
    let doc = await CompanySettings.findOne()
    if (!doc) {
      doc = await CompanySettings.create({})
    }
    res.status(200).json({ success: true, data: doc })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updateCompanySettings = async (req, res) => {
  try {
    const doc = await CompanySettings.findOneAndUpdate(
      {},
      { $set: req.body },
      { upsert: true, new: true, runValidators: true }
    )
    res.status(200).json({ success: true, message: 'Company settings updated successfully in companysettings', data: doc })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ==========================================
// DEDICATED WHATSAPP SETTINGS CONTROLLERS
// ==========================================
export const getWhatsappSettings = async (req, res) => {
  try {
    let waDoc = await WhatsAppSettings.findOne()
    if (!waDoc) {
      const company = await CompanySettings.findOne()
      waDoc = await WhatsAppSettings.create({
        whatsappNumber: company?.whatsappNumber || '+91 9555140701',
        whatsappLinkType: company?.whatsappLinkType || 'number',
        whatsappCustomUrl: company?.whatsappCustomUrl || '',
        whatsappMessage: company?.whatsappMessage || 'Hello! I would like to make an enquiry.',
        whatsappEnabled: company?.whatsappEnabled !== false,
        whatsappTooltipText: company?.whatsappTooltipText || 'Chat with Us'
      })
    }
    res.status(200).json({
      success: true,
      data: {
        whatsappNumber: waDoc.whatsappNumber,
        whatsappLinkType: waDoc.whatsappLinkType,
        whatsappCustomUrl: waDoc.whatsappCustomUrl,
        whatsappMessage: waDoc.whatsappMessage,
        whatsappEnabled: waDoc.whatsappEnabled,
        whatsappTooltipText: waDoc.whatsappTooltipText
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updateWhatsappSettings = async (req, res) => {
  try {
    const {
      whatsappNumber,
      whatsappLinkType,
      whatsappCustomUrl,
      whatsappMessage,
      whatsappEnabled,
      whatsappTooltipText
    } = req.body

    const updateData = {}
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber
    if (whatsappLinkType !== undefined) updateData.whatsappLinkType = whatsappLinkType
    if (whatsappCustomUrl !== undefined) updateData.whatsappCustomUrl = whatsappCustomUrl
    if (whatsappMessage !== undefined) updateData.whatsappMessage = whatsappMessage
    if (whatsappEnabled !== undefined) updateData.whatsappEnabled = whatsappEnabled
    if (whatsappTooltipText !== undefined) updateData.whatsappTooltipText = whatsappTooltipText

    const waDoc = await WhatsAppSettings.findOneAndUpdate(
      {},
      { $set: updateData },
      { upsert: true, new: true, runValidators: true }
    )

    await CompanySettings.findOneAndUpdate({}, { $set: updateData }, { upsert: true })

    res.status(200).json({
      success: true,
      message: 'WhatsApp settings updated successfully in whatsappsettings',
      data: waDoc
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ==========================================
// DEDICATED SMTP SETTINGS CONTROLLERS
// ==========================================
export const getSmtpSettings = async (req, res) => {
  try {
    let smtpDoc = await SmtpSettings.findOne()
    if (!smtpDoc) {
      const company = await CompanySettings.findOne()
      smtpDoc = await SmtpSettings.create(company?.smtp || {})
    }
    const safeSmtp = smtpDoc.toObject ? smtpDoc.toObject() : { ...smtpDoc }
    if (safeSmtp.password) {
      safeSmtp.password = '••••••••••••••••'
    }
    res.status(200).json({ success: true, data: safeSmtp })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updateSmtpSettings = async (req, res) => {
  try {
    const updateData = { ...req.body }
    const existing = await SmtpSettings.findOne()
    if (!updateData.password || updateData.password === '••••••••••••••••') {
      updateData.password = existing?.password || process.env.SMTP_PASS || ''
    }
    const smtpDoc = await SmtpSettings.findOneAndUpdate(
      {},
      { $set: updateData },
      { upsert: true, new: true, runValidators: true }
    )
    const compUpdate = { smtp: updateData }
    if (updateData.adminRecipient) {
      compUpdate.contactEmail = updateData.adminRecipient
    } else if (updateData.replyTo) {
      compUpdate.contactEmail = updateData.replyTo
    }
    await CompanySettings.findOneAndUpdate({}, { $set: compUpdate }, { upsert: true })
    res.status(200).json({ success: true, message: 'SMTP settings updated successfully in smtpsettings', data: smtpDoc })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ==========================================
// DEDICATED CLOUDINARY SETTINGS CONTROLLERS
// ==========================================
export const getCloudinarySettings = async (req, res) => {
  try {
    let cloudDoc = await CloudinarySettings.findOne()
    if (!cloudDoc) {
      const company = await CompanySettings.findOne()
      cloudDoc = await CloudinarySettings.create(company?.cloudinary || {})
    }
    res.status(200).json({ success: true, data: cloudDoc })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updateCloudinarySettings = async (req, res) => {
  try {
    const cloudDoc = await CloudinarySettings.findOneAndUpdate(
      {},
      { $set: req.body },
      { upsert: true, new: true, runValidators: true }
    )
    await CompanySettings.findOneAndUpdate({}, { $set: { cloudinary: req.body } }, { upsert: true })
    res.status(200).json({ success: true, message: 'Cloudinary settings updated successfully in cloudinarysettings', data: cloudDoc })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ==========================================
// TEST CLOUDINARY CONFIGURATION
// ==========================================
export const testCloudinarySettings = async (req, res) => {
  try {
    const { cloudName, apiKey, apiSecret } = req.body
    let creds = { cloudName, apiKey, apiSecret }

    if (!creds.cloudName || !creds.apiKey || !creds.apiSecret) {
      const active = await getActiveCloudinaryConfig()
      if (active) creds = active
    }

    const result = await testCloudinaryConfig(creds)
    if (result.success) {
      return res.status(200).json(result)
    } else {
      return res.status(400).json(result)
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

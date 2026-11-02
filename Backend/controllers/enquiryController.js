import Enquiry from '../models/Enquiry.js'
import { sendEnquiryNotificationEmail, sendTestSmtpEmail } from '../utils/emailService.js'

// @desc    Submit new enquiry & trigger Nodemailer notification
// @route   POST /api/enquiries
// @access  Public
export const createEnquiry = async (req, res) => {
  try {
    const { name, email, phone, productName, message, request, source } = req.body

    const cleanPhone = (phone || '').trim()
    const cleanEmail = (email || '').trim()
    const enquiryMessage = (message || request || '').trim()

    // Must provide either phone number or email address
    if (!cleanPhone && !cleanEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least a Mobile Number or Email Address for enquiry.'
      })
    }

    const customerName = (name && name.trim()) || (cleanEmail ? cleanEmail.split('@')[0] : '') || cleanPhone || 'Valued Customer'
    const targetProduct = (productName && productName.trim()) || 'General Buying Requirement'

    // 1. Create and save enquiry to MongoDB
    const enquiry = await Enquiry.create({
      name: customerName,
      email: cleanEmail,
      phone: cleanPhone,
      productName: targetProduct,
      message: enquiryMessage,
      source: source || (targetProduct.toLowerCase().includes('whatsapp') ? 'WhatsApp' : 'Website'),
      status: 'New'
    })

    // 2. Trigger Nodemailer email notification in background safely (non-blocking for fast UI response)
    sendEnquiryNotificationEmail(enquiry)
      .then((status) => {
        console.log('✅ [enquiryController] Email notification dispatched:', status?.success ? 'Success' : status?.error)
      })
      .catch((mailErr) => {
        console.error('❌ [enquiryController] Background Nodemailer dispatch error:', mailErr.message)
      })

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully! Our expert will contact you soon.',
      data: enquiry
    })
  } catch (error) {
    console.error('❌ [enquiryController] createEnquiry error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get all enquiries
// @route   GET /api/enquiries
// @access  Public / Admin
export const getEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({}).sort({ createdAt: -1 })
    res.status(200).json({ success: true, count: enquiries.length, data: enquiries })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Update enquiry status
// @route   PUT /api/enquiries/:id
// @access  Public / Admin
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const enquiry = await Enquiry.findByIdAndUpdate(id, { status }, { new: true })
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' })
    }

    res.status(200).json({ success: true, message: 'Enquiry status updated successfully', data: enquiry })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Delete single enquiry
// @route   DELETE /api/enquiries/:id
// @access  Public / Admin
export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Enquiry.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' })
    }

    res.status(200).json({ success: true, message: 'Enquiry deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Send test email to verify SMTP configuration
// @route   POST /api/enquiries/test-smtp
// @access  Public / Admin
export const testSmtpConnection = async (req, res) => {
  try {
    const result = await sendTestSmtpEmail(req.body)
    if (result.success) {
      return res.status(200).json({ success: true, message: result.message })
    } else {
      return res.status(400).json({ success: false, message: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

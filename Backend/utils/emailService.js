import nodemailer from 'nodemailer'
import CompanySettings from '../models/CompanySettings.js'
import SmtpSettings from '../models/SmtpSettings.js'

/**
 * Helper to retrieve active SMTP configuration
 * Priority: 1. MongoDB SmtpSettings collection -> 2. MongoDB CompanySettings.smtp -> 3. Environment Variables
 */
export const getActiveSmtpConfig = async () => {
  try {
    const smtpDoc = await SmtpSettings.findOne()
    const companySettings = await CompanySettings.findOne()

    const rawSmtp = (smtpDoc && smtpDoc.enabled && smtpDoc.host)
      ? smtpDoc
      : (companySettings && companySettings.smtp && companySettings.smtp.enabled && companySettings.smtp.host)
        ? companySettings.smtp
        : null

    if (rawSmtp) {
      const smtpUser = (rawSmtp.user || '').trim()
      const smtpPass = (rawSmtp.password && rawSmtp.password !== '••••••••••••••••')
        ? rawSmtp.password
        : (process.env.SMTP_PASS || '')
      const smtpHost = (rawSmtp.host || '').trim()
      const smtpPort = Number(rawSmtp.port) || 587

      // Dynamically extract values configured from Frontend Admin Panel
      const fromName = (rawSmtp.fromName || companySettings?.companyName || 'QuickEnquiry')
        .replace(/\s*Notifications\s*$/i, '')
        .trim() || 'QuickEnquiry'

      const fromEmail = (rawSmtp.fromEmail || smtpUser || process.env.SMTP_FROM_EMAIL || '').trim()

      // Dynamically collect all configured admin / store owner recipient addresses
      const rawRecipient = (rawSmtp.adminRecipient || '').trim()
      const rawReplyTo = (rawSmtp.replyTo || '').trim()
      const rawContact = (companySettings?.contactEmail || '').trim()

      const recipientsSet = new Set()
      if (rawRecipient && !rawRecipient.includes('quick-enquiry.co')) {
        recipientsSet.add(rawRecipient)
      }
      if (rawReplyTo && !rawReplyTo.includes('quick-enquiry.co')) {
        recipientsSet.add(rawReplyTo)
      }
      if (rawContact && !rawContact.includes('quick-enquiry.co')) {
        recipientsSet.add(rawContact)
      }
      // If no custom recipient was specified, fallback to SMTP login user
      if (recipientsSet.size === 0 && smtpUser) {
        recipientsSet.add(smtpUser)
      }
      if (recipientsSet.size === 0 && process.env.ADMIN_NOTIFICATION_EMAIL) {
        recipientsSet.add(process.env.ADMIN_NOTIFICATION_EMAIL.trim())
      }

      const adminRecipient = Array.from(recipientsSet).join(', ')
      const replyTo = rawReplyTo || rawRecipient || adminRecipient || fromEmail

      return {
        enabled: Boolean(rawSmtp.enabled),
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465 || rawSmtp.encryption === 'SSL',
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        fromName,
        companyName: companySettings?.companyName || fromName,
        fromEmail,
        replyTo,
        adminRecipient,
        notifyOnNewEnquiry: rawSmtp.notifyOnNewEnquiry !== false,
        sendCustomerReceipt: rawSmtp.sendCustomerReceipt !== false
      }
    }
  } catch (err) {
    console.warn('[emailService] Could not load DB SMTP settings:', err.message)
  }

  // Fallback to Environment Variables only if defined
  const envHost = process.env.SMTP_HOST
  const envUser = process.env.SMTP_USER
  const envPass = process.env.SMTP_PASS

  if (envHost && envUser && envPass) {
    return {
      enabled: true,
      host: envHost,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: envUser,
        pass: envPass
      },
      fromName: process.env.SMTP_FROM_NAME || 'QuickEnquiry',
      companyName: process.env.COMPANY_NAME || 'QuickEnquiry',
      fromEmail: process.env.SMTP_FROM_EMAIL || envUser,
      replyTo: process.env.SMTP_REPLY_TO || envUser,
      adminRecipient: process.env.ADMIN_NOTIFICATION_EMAIL || envUser,
      notifyOnNewEnquiry: true,
      sendCustomerReceipt: true
    }
  }

  return null
}

/**
 * Creates Nodemailer Transporter
 */
export const createTransporter = (config) => {
  if (!config || !config.host) return null

  return nodemailer.createTransport({
    host: config.host,
    port: Number(config.port) || 587,
    secure: Boolean(config.secure),
    auth: {
      user: config.auth?.user || config.user,
      pass: config.auth?.pass || config.password
    },
    tls: {
      rejectUnauthorized: false // Avoid self-signed cert rejection in development
    }
  })
}

/**
 * Sends Email Notification when a New Enquiry is submitted
 */
export const sendEnquiryNotificationEmail = async (enquiry) => {
  const result = {
    success: false,
    companyEmail: { sent: false, error: null },
    customerEmail: { sent: false, error: null, skipped: false, reason: null }
  }

  try {
    const config = await getActiveSmtpConfig()
    if (!config || !config.enabled) {
      console.log('ℹ️ [emailService] SMTP is not configured or disabled. Enquiry saved in DB without email dispatch.')
      result.companyEmail.error = 'SMTP not configured or disabled'
      result.customerEmail.error = 'SMTP not configured or disabled'
      return result
    }

    const transporter = createTransporter(config)
    if (!transporter) {
      result.companyEmail.error = 'Transporter creation failed'
      result.customerEmail.error = 'Transporter creation failed'
      return result
    }

    const customerName = enquiry.name && enquiry.name !== 'Valued Customer' ? enquiry.name : (enquiry.phone || 'New Customer')
    const customerPhone = enquiry.phone || 'Not provided'
    const customerEmail = enquiry.email || 'Not provided'
    const productName = enquiry.productName || 'General Product Enquiry'
    const enquiryMessage = enquiry.message || 'No additional message provided.'
    const dateFormatted = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })

    const cleanPhone = (enquiry.phone || '').replace(/[^0-9]/g, '')
    const whatsappLink = cleanPhone ? `https://wa.me/${cleanPhone}` : 'https://wa.me/'

    // =========================================================================
    // 1. Send Admin Notification Email
    // =========================================================================
    if (config.notifyOnNewEnquiry) {
      try {
        const adminMailOptions = {
          from: `"${config.fromName}" <${config.fromEmail}>`,
          to: config.adminRecipient,
          replyTo: enquiry.email || config.fromEmail,
          subject: `New Lead: ${productName} (${customerPhone})`,
          headers: {
            'X-Priority': '3',
            'Importance': 'Normal',
            'Auto-Submitted': 'auto-generated',
            'X-Auto-Response-Suppress': 'All'
          },
          text: `NEW LEAD RECEIVED - QuickEnquiry
==================================================
Product Inquired : ${productName}
Customer Name    : ${customerName}
Mobile Number    : ${customerPhone}
Email Address    : ${customerEmail}
Status           : NEW ENQUIRY
Date             : ${dateFormatted}

Customer Message / Requirement:
${enquiryMessage}
==================================================
This notification was generated automatically by QuickEnquiry Lead Engine.`,
          html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Lead Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 620px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 24px 30px; text-align: left;">
              <span style="display: inline-block; background: #38bdf8; color: #0f172a; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; margin-bottom: 8px;">NEW LEAD RECEIVED</span>
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Buying Requirement Details</h1>
              <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">QuickEnquiry Instant Lead Alert &bull; ${dateFormatted}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 30px;">
              <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Product Inquired</span>
                <div style="font-size: 18px; font-weight: 800; color: #1e293b; margin-top: 2px;">${productName}</div>
              </div>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 14px; width: 35%;">Mobile Number:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 15px; font-weight: 700;">
                    <a href="tel:${customerPhone}" style="color: #2563eb; text-decoration: none;">${customerPhone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 14px;">Email Address:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 15px; font-weight: 600;">
                    ${enquiry.email ? `<a href="mailto:${customerEmail}" style="color: #2563eb; text-decoration: none;">${customerEmail}</a>` : '<span style="color: #94a3b8;">Not provided</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 14px;">Customer Name:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 15px; font-weight: 600;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 14px;">Status:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="background: #e0f2fe; color: #0284c7; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">NEW ENQUIRY</span>
                  </td>
                </tr>
              </table>

              <div style="margin-bottom: 28px;">
                <span style="display: block; font-size: 13px; color: #64748b; font-weight: 700; margin-bottom: 8px; text-transform: uppercase;">Customer Message / Requirement:</span>
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${enquiryMessage}</div>
              </div>

              <div style="text-align: center; padding-top: 10px;">
                <a href="${whatsappLink}" target="_blank" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 2px 6px rgba(37,211,102,0.3);">
                  Chat on WhatsApp
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 30px; text-align: center; color: #94a3b8; font-size: 12px;">
              This notification was generated automatically by QuickEnquiry Lead Engine.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
        }

        const adminInfo = await transporter.sendMail(adminMailOptions)
        result.companyEmail.sent = true
        result.companyEmail.messageId = adminInfo.messageId
        result.companyEmail.recipient = config.adminRecipient
        console.log(`✅ [emailService] Admin lead notification delivered to: ${config.adminRecipient} (${adminInfo.messageId})`)
      } catch (adminErr) {
        result.companyEmail.error = adminErr.message
        console.error('❌ [emailService] Admin email dispatch failed:', adminErr.message)
      }
    } else {
      result.companyEmail.skipped = true
      result.companyEmail.reason = 'Admin notification disabled in settings'
    }

    // =========================================================================
    // 2. Send Customer Confirmation Email (Separate confirmation email)
    // =========================================================================
    const cleanCustomerEmail = (enquiry.email || '').trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (cleanCustomerEmail && emailRegex.test(cleanCustomerEmail)) {
      try {
        // Clean company display name (avoid "Notifications" suffix which triggers spam scoring)
        const companyDisplayName = (config.companyName || config.fromName || 'QuickEnquiry')
          .replace(/\s*Notifications\s*$/i, '')
          .trim() || 'QuickEnquiry'

        // Align reply-to with user's business contact email configured in frontend (e.g. saar2002rawat@gmail.com)
        const replyEmailAddress = config.replyTo || config.adminRecipient || config.fromEmail

        const customerMailOptions = {
          from: `"${companyDisplayName}" <${config.fromEmail}>`,
          to: cleanCustomerEmail,
          replyTo: replyEmailAddress,
          subject: `Thank you for your enquiry - ${productName}`,
          headers: {
            'X-Priority': '3',
            'Importance': 'Normal',
            'Auto-Submitted': 'auto-generated',
            'X-Auto-Response-Suppress': 'All'
          },
          text: `Dear ${customerName},

Thank you for contacting ${companyDisplayName}! We have successfully received your enquiry for ${productName}.

Enquiry Details:
--------------------------------------------------
Product Inquired : ${productName}
Mobile Number    : ${customerPhone}
Email Address    : ${cleanCustomerEmail}
${enquiryMessage ? `Your Message     : ${enquiryMessage}\n` : ''}Date Submitted   : ${dateFormatted}
--------------------------------------------------

What happens next?
Our team is reviewing your requirement and will reach out to you directly via Call or WhatsApp on ${customerPhone} with pricing, catalogue details, and delivery information.

If you have any questions or wish to provide additional details, you can reply directly to this email at ${replyEmailAddress}.

Warm regards,
${companyDisplayName}

--------------------------------------------------
Note: You received this automated confirmation because an enquiry was submitted on our website using this email address (${cleanCustomerEmail}). If you did not make this request, please disregard this email.`,
          html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Enquiry Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: #047857; padding: 26px 30px; text-align: left;">
              <div style="display: inline-block; background-color: #d1fae5; color: #065f46; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 4px 12px; border-radius: 16px; margin-bottom: 8px;">
                Enquiry Confirmation
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; line-height: 1.3;">
                Thank You for Your Enquiry
              </h1>
              <p style="color: #a7f3d0; margin: 6px 0 0; font-size: 13px; line-height: 1.4;">
                We have received your requirement. Our team will contact you shortly.
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 28px 30px;">
              <p style="font-size: 15px; color: #1e293b; margin: 0 0 12px; line-height: 1.5;">
                Dear <strong>${customerName}</strong>,
              </p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
                Thank you for your interest! We have received your inquiry for <strong>${productName}</strong>. Our specialist is reviewing your requirement and will contact you directly with pricing, specifications, and delivery information.
              </p>

              <!-- Enquiry Summary Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 22px;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <div style="font-size: 12px; font-weight: 700; color: #047857; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                      Summary of Your Submitted Enquiry:
                    </div>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; width: 38%; vertical-align: top;">Product Inquired:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${productName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; vertical-align: top;">Your Mobile Number:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${customerPhone}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; vertical-align: top;">Your Email Address:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${cleanCustomerEmail}</td>
                      </tr>
                      ${enquiryMessage ? `
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; vertical-align: top;">Your Message:</td>
                        <td style="padding: 6px 0; color: #334155; font-size: 13px; line-height: 1.5;">${enquiryMessage}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; vertical-align: top;">Date Submitted:</td>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">${dateFormatted}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What Next Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; margin-bottom: 22px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <div style="font-size: 13px; font-weight: 700; color: #065f46; margin-bottom: 4px;">What happens next?</div>
                    <div style="font-size: 13px; color: #047857; line-height: 1.5;">
                      Our product expert will reach out to you directly via Call or WhatsApp on <strong>${customerPhone}</strong>.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- WhatsApp CTA -->
              <div style="text-align: center; padding-top: 4px;">
                <p style="font-size: 13px; color: #64748b; margin: 0 0 12px;">
                  Need an instant response? You can also message us directly:
                </p>
                <a href="${whatsappLink}" target="_blank" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 11px 24px; border-radius: 6px; font-weight: 700; font-size: 14px;">
                  Chat with Us on WhatsApp
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer / Anti-Spam Compliance -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
              <div>Thank you for choosing <strong>${companyDisplayName}</strong>.</div>
              <div style="margin-top: 4px;">
                Questions? Reply directly to this email or write to <a href="mailto:${replyEmailAddress}" style="color: #059669; text-decoration: underline;">${replyEmailAddress}</a>
              </div>
              <div style="margin-top: 10px; font-size: 11px; color: #94a3b8;">
                You received this automated confirmation because an enquiry was submitted on our website with this email address. If you did not make this enquiry, please disregard this email.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
        }

        const customerInfo = await transporter.sendMail(customerMailOptions)
        result.customerEmail.sent = true
        result.customerEmail.messageId = customerInfo.messageId
        result.customerEmail.recipient = cleanCustomerEmail
        console.log(`✅ [emailService] Customer confirmation receipt delivered to: ${cleanCustomerEmail} (${customerInfo.messageId})`)
      } catch (custErr) {
        result.customerEmail.error = custErr.message
        console.error('❌ [emailService] Customer confirmation email dispatch failed:', custErr.message)
      }
    } else {
      result.customerEmail.skipped = true
      result.customerEmail.reason = cleanCustomerEmail ? 'Invalid email format' : 'No customer email provided'
      console.log(`ℹ️ [emailService] Customer confirmation skipped: ${result.customerEmail.reason}`)
    }

    result.success = result.companyEmail.sent || result.customerEmail.sent
    return result
  } catch (error) {
    console.error('❌ [emailService] Failed to send enquiry email via Nodemailer:', error.message)
    result.error = error.message
    return result
  }
}

/**
 * Sends Test Email to verify SMTP configuration from Admin Panel
 */
export const sendTestSmtpEmail = async ({ host, port, user, password, encryption, to, testEmail, fromEmail, fromName }) => {
  try {
    let activeHost = (host || '').trim()
    let activeUser = (user || '').trim()
    let activePass = (password && password !== '••••••••••••••••') ? password.trim() : ''
    let activePort = Number(port) || 587
    let activeEncryption = encryption || 'TLS'

    // If password or credentials are not in request body, retrieve stored configuration from DB
    if (!activePass || !activeHost || !activeUser) {
      const dbSmtp = await SmtpSettings.findOne()
      if (dbSmtp) {
        if (!activeHost) activeHost = (dbSmtp.host || '').trim()
        if (!activeUser) activeUser = (dbSmtp.user || '').trim()
        if (!activePass) activePass = (dbSmtp.password || '').trim()
        if (!port) activePort = Number(dbSmtp.port) || 587
        if (!encryption) activeEncryption = dbSmtp.encryption || 'TLS'
      }
    }

    if (!activeHost) activeHost = process.env.SMTP_HOST || 'smtp.gmail.com'
    if (!activeUser) activeUser = process.env.SMTP_USER || ''
    if (!activePass) activePass = process.env.SMTP_PASS || ''

    if (!activeHost || !activeUser || !activePass) {
      throw new Error('Host, Username, and Password / App Password are required to test SMTP connection.')
    }

    const testTransporter = nodemailer.createTransport({
      host: activeHost,
      port: activePort,
      secure: activePort === 465 || activeEncryption === 'SSL',
      auth: { user: activeUser, pass: activePass },
      tls: { rejectUnauthorized: false }
    })

    // Verify connection credentials with server
    await testTransporter.verify()

    const recipient = to || testEmail || activeUser
    const sender = fromEmail || activeUser
    const senderName = fromName || 'QuickEnquiry Mailer'

    const testMail = {
      from: `"${senderName}" <${sender}>`,
      to: recipient,
      subject: `✅ SMTP Verification Success: QuickEnquiry (${activeHost})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 520px;">
          <h2 style="color: #059669; margin-top: 0;">🎉 SMTP Connection Verified!</h2>
          <p style="color: #334155; font-size: 14px;">
            Your Nodemailer SMTP server connection is working properly on <strong>${activeHost}:${activePort}</strong>.
          </p>
          <div style="background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 13px; color: #475569;">
            <div><strong>Host:</strong> ${activeHost}</div>
            <div><strong>Port:</strong> ${activePort} (${activeEncryption})</div>
            <div><strong>Sender / User:</strong> ${activeUser}</div>
            <div><strong>Recipient:</strong> ${recipient}</div>
            <div><strong>Timestamp:</strong> ${new Date().toISOString()}</div>
          </div>
        </div>
      `
    }

    const info = await testTransporter.sendMail(testMail)
    return { success: true, message: `Test email delivered successfully to ${recipient}!`, info }
  } catch (err) {
    console.error('❌ [emailService] SMTP Verification failed:', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * WhatsApp Helper Utilities
 * Cleans phone numbers, formats WhatsApp URLs and handles window redirects.
 * Supports both Phone Numbers (wa.me/<number>) and Direct Custom WhatsApp Links (https://wa.me/..., chat.whatsapp.com/..., etc.)
 */

export const sanitizeWhatsAppNumber = (rawNumber = '') => {
  if (!rawNumber) return ''
  // Strip all non-digit characters
  const digits = String(rawNumber).replace(/\D/g, '')

  if (!digits) return ''

  // If 10 digits provided (standard mobile number without country code), prepend standard 91
  if (digits.length === 10) {
    return `91${digits}`
  }

  // If starts with 0 and length is 11 (e.g. 09876543210), replace leading 0 with 91
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`
  }

  return digits
}

/**
 * Checks if a string is a custom URL or WhatsApp web link
 */
export const isWhatsAppUrl = (input = '') => {
  if (!input) return false
  const trimmed = String(input).trim().toLowerCase()
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('wa.me/') ||
    trimmed.includes('whatsapp.com')
  )
}

/**
 * Generates the redirect URL from either a phone number or a direct custom link
 */
export const getWhatsAppUrl = (rawTarget = '', message = 'Hello! I would like to make an enquiry.') => {
  if (!rawTarget) {
    return message ? `https://wa.me/?text=${encodeURIComponent(message)}` : 'https://wa.me/'
  }

  const trimmed = String(rawTarget).trim()

  // 1. If it is already a direct custom WhatsApp URL (wa.me link, chat.whatsapp.com invite, etc.)
  if (isWhatsAppUrl(trimmed)) {
    let fullUrl = trimmed
    if (trimmed.startsWith('wa.me/')) {
      fullUrl = `https://${trimmed}`
    } else if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      fullUrl = `https://${trimmed}`
    }

    // If message is provided and it's a wa.me link without an existing text parameter, append text
    if (message && fullUrl.includes('wa.me') && !fullUrl.includes('text=')) {
      const sep = fullUrl.includes('?') ? '&' : '?'
      fullUrl = `${fullUrl}${sep}text=${encodeURIComponent(message)}`
    }
    return fullUrl
  }

  // 2. Otherwise treat as phone number
  const cleanNumber = sanitizeWhatsAppNumber(trimmed)
  if (!cleanNumber) {
    return message ? `https://wa.me/?text=${encodeURIComponent(message)}` : 'https://wa.me/'
  }
  const textQuery = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${cleanNumber}${textQuery}`
}

export const openWhatsApp = (rawTarget, message) => {
  const url = getWhatsAppUrl(rawTarget, message)
  window.open(url, '_blank', 'noopener,noreferrer')
}

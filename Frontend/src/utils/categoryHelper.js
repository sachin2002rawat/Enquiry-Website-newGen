/**
 * Category Helper Utilities for Enquiry Website MERN Stack
 * Safely extracts category name, ID, and slug from either populated Category object,
 * plain object, or legacy string.
 */

export const getCategoryName = (category) => {
  if (!category) return ''
  if (typeof category === 'object') {
    return category.name || category.title || ''
  }
  const str = String(category).trim()
  if (str.match(/^[0-9a-fA-F]{24}$/)) {
    try {
      const saved = localStorage.getItem('enquiry_admin_categories')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          const match = parsed.find((c) => String(c._id) === str || String(c.id) === str)
          if (match && match.name) return match.name
        }
      }
    } catch {}
  }
  return str
}

export const getCategoryId = (category) => {
  if (!category) return ''
  if (typeof category === 'object') {
    return category._id || category.id || ''
  }
  return String(category)
}

export const getCategorySlug = (category) => {
  if (!category) return ''
  if (typeof category === 'object') {
    return (
      category.slug ||
      (category.name
        ? category.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
        : '')
    )
  }
  return String(category).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
}

export const getCategoryImage = (category, fallback = '/garam_masala.png') => {
  if (!category) return fallback
  if (typeof category === 'object') {
    return category.image || fallback
  }
  return fallback
}

export default {
  getCategoryName,
  getCategoryId,
  getCategorySlug,
  getCategoryImage
}

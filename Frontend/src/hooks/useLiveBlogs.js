import { useState, useEffect } from 'react'
import { apiService } from '../api/apiService'

export const LOCAL_KEY_BLOGS = 'enquiry_admin_blogs'
export const LOCAL_KEY_BLOG_SETTINGS = 'enquiry_admin_blog_settings'

// Default blog list is empty — blogs are created manually through Blog Management
export const getDefaultBlogs = () => []

export const getDefaultBlogSettings = () => ({
  heroTag: 'Our Blog',
  heroTitle: 'The Latest Articles & Insights',
  heroSubtitle: 'Explore expert tips, inspiring stories, and the latest insights from our blog to help you grow, learn, and stay motivated.',
  breadcrumbText: 'Blog',
  enquiryBannerTitle: 'Interested in Bulk Orders?',
  enquiryBannerSubtitle: 'Send an instant enquiry for wholesale pricing & custom packaging.',
  enquiryButtonText: 'Send Enquiry',
  whatsappButtonText: 'WhatsApp',
  whyChooseTitle: 'Why Choose Us?',
  whyChooseHighlightsMasala: [
    { title: '100% Pure & Fresh:', desc: 'Direct farm sourcing.' },
    { title: 'Fast Nationwide Shipping:', desc: 'Secure packaging.' },
    { title: 'Verified Export Standards:', desc: 'Certified processing.' }
  ],
  whyChooseHighlightsBeauty: [
    { title: '100% Clean & Botanical:', desc: 'Cruelty-free organic actives.' },
    { title: 'Dermatologist Tested:', desc: 'Gentle and safe for all skin types.' },
    { title: 'Sustainable Packaging:', desc: 'Recyclable eco-friendly materials.' }
  ]
})

export const getStoredBlogs = () => {
  try {
    const saved = localStorage.getItem(LOCAL_KEY_BLOGS)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        // Discard any legacy auto-converted products from previous sessions
        const clean = parsed.filter(item => {
          if (!item) return false
          const idStr = String(item._id || item.id || '')
          return !idStr.startsWith('seed-masala-') && !idStr.startsWith('seed-beauty-')
        })
        return clean
      }
    }
  } catch (err) {
    console.warn('[useLiveBlogs] Error reading stored blogs:', err)
  }
  return []
}

export const getStoredBlogSettings = () => {
  try {
    const saved = localStorage.getItem(LOCAL_KEY_BLOG_SETTINGS)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed === 'object') {
        return { ...getDefaultBlogSettings(), ...parsed }
      }
    }
  } catch (err) {
    console.warn('[useLiveBlogs] Error reading stored blog settings:', err)
  }
  return getDefaultBlogSettings()
}

export const broadcastBlogsUpdate = (blogs) => {
  if (!Array.isArray(blogs)) return
  try {
    localStorage.setItem(LOCAL_KEY_BLOGS, JSON.stringify(blogs))
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent('enquiry_blogs_updated', { detail: blogs }))
  } catch (err) {
    console.warn('[useLiveBlogs] Error broadcasting blogs:', err)
  }
}

export const broadcastBlogSettingsUpdate = (settings) => {
  if (!settings || typeof settings !== 'object') return
  try {
    localStorage.setItem(LOCAL_KEY_BLOG_SETTINGS, JSON.stringify(settings))
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent('enquiry_blog_settings_updated', { detail: settings }))
  } catch (err) {
    console.warn('[useLiveBlogs] Error broadcasting blog settings:', err)
  }
}

export const useLiveBlogs = () => {
  const [blogs, setBlogs] = useState(getStoredBlogs)
  const [blogSettings, setBlogSettings] = useState(getStoredBlogSettings)

  useEffect(() => {
    let isMounted = true

    // Fetch live blogs and settings from dedicated MongoDB backend API
    const fetchFromBackend = async () => {
      try {
        const [dbBlogs, dbSettings] = await Promise.all([
          apiService.getBlogs(),
          apiService.getBlogSettings()
        ])

        if (isMounted) {
          if (Array.isArray(dbBlogs)) {
            // Filter out any legacy seed-masala items if backend somehow has them
            const clean = dbBlogs.filter(item => {
              if (!item) return false
              const idStr = String(item._id || item.id || '')
              return !idStr.startsWith('seed-masala-') && !idStr.startsWith('seed-beauty-')
            })
            setBlogs(clean)
            try {
              localStorage.setItem(LOCAL_KEY_BLOGS, JSON.stringify(clean))
            } catch {}
          }
          if (dbSettings && typeof dbSettings === 'object') {
            const merged = { ...getDefaultBlogSettings(), ...dbSettings }
            setBlogSettings(merged)
            try {
              localStorage.setItem(LOCAL_KEY_BLOG_SETTINGS, JSON.stringify(merged))
            } catch {}
          }
        }
      } catch (err) {
        // Fallback silently to client state
      }
    }

    fetchFromBackend()

    const handleStorage = () => {
      setBlogs(getStoredBlogs())
      setBlogSettings(getStoredBlogSettings())
    }

    const handleCustomBlogs = (e) => {
      if (Array.isArray(e.detail)) setBlogs(e.detail)
    }

    const handleCustomSettings = (e) => {
      if (e.detail && typeof e.detail === 'object') setBlogSettings(e.detail)
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('enquiry_blogs_updated', handleCustomBlogs)
    window.addEventListener('enquiry_blog_settings_updated', handleCustomSettings)

    const interval = setInterval(() => {
      handleStorage()
    }, 4000)

    return () => {
      isMounted = false
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('enquiry_blogs_updated', handleCustomBlogs)
      window.removeEventListener('enquiry_blog_settings_updated', handleCustomSettings)
      clearInterval(interval)
    }
  }, [])

  return {
    blogs,
    setBlogs,
    blogSettings,
    setBlogSettings,
    broadcastBlogsUpdate,
    broadcastBlogSettingsUpdate
  }
}

export default useLiveBlogs

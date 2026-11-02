import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../api/apiService'

export const LOCAL_KEY_CATEGORIES = 'enquiry_admin_categories'

export const defaultCategories = [
  {
   
    _id: 'cat_pulses',
    name: 'PULSES',
    slug: 'pulses',
    description: 'Premium selection of pulses products crafted for authentic taste and quality.',
    image: 'https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=800&q=80',
    productCount: 4
  },
  {
    _id: 'cat_rice',
    name: 'RICE',
    slug: 'rice',
    description: 'Premium selection of rice products crafted for authentic taste and quality.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    productCount: 2
  },
  {
    _id: 'cat_whole_spices',
    name: 'WHOLE SPICES',
    slug: 'whole-spices',
    description: 'Premium selection of whole spices products crafted for authentic taste and quality.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    productCount: 5
  },
  {
    _id: 'cat_mix_masala',
    name: 'MIX MASALA',
    slug: 'mix-masala',
    description: 'Premium selection of mix masala products crafted for authentic taste and quality.',
    image: '/garam_masala.png',
    productCount: 4
  },
  {
    _id: 'cat_soya_chunks',
    name: 'SOYA CHUNKS',
    slug: 'soya-chunks',
    description: 'Premium selection of soya chunks products crafted for authentic taste and quality.',
    image: '/masala_tofu.png',
    productCount: 2
  },
  {
    _id: 'cat_pure_spices',
    name: 'PURE SPICES',
    slug: 'pure-spices',
    description: '100% natural stone-ground spices preserved for authentic aroma.',
    image: '/premium_spices.png',
    productCount: 6
  },
  {
    _id: 'cat_edible_oils',
    name: 'EDIBLE OILS',
    slug: 'edible-oils',
    description: 'Cold-pressed and refined healthy cooking oils.',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    productCount: 3
  }
]

export const getStoredCategories = () => {
  try {
    const saved = localStorage.getItem(LOCAL_KEY_CATEGORIES)
    if (saved !== null) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (err) {
    console.warn('[useLiveCategories] Error parsing stored categories:', err)
  }
  return defaultCategories
}

export const broadcastCategoryUpdate = (newCategories) => {
  if (!Array.isArray(newCategories)) return
  try {
    localStorage.setItem(LOCAL_KEY_CATEGORIES, JSON.stringify(newCategories))
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent('enquiry_categories_updated', { detail: newCategories }))
  } catch (err) {
    console.warn('[useLiveCategories] Error saving categories to storage:', err)
  }
}

export const useLiveCategories = () => {
  const [categories, setCategories] = useState(getStoredCategories)

  const fetchFromBackend = useCallback(async () => {
    try {
      const dbCategories = await apiService.getCategories()
      if (Array.isArray(dbCategories)) {
        setCategories((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(dbCategories)) return prev
          return dbCategories
        })
        try {
          const saved = localStorage.getItem(LOCAL_KEY_CATEGORIES)
          if (saved !== JSON.stringify(dbCategories)) {
            localStorage.setItem(LOCAL_KEY_CATEGORIES, JSON.stringify(dbCategories))
            window.dispatchEvent(new CustomEvent('enquiry_categories_updated', { detail: dbCategories }))
          }
        } catch {}
      }
    } catch {
      // Fallback silently to client state
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    fetchFromBackend()

    const handleSync = () => {
      const current = getStoredCategories()
      if (isMounted) {
        setCategories((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(current)) return prev
          return current
        })
      }
    }

    const handleCustomEvent = (e) => {
      if (isMounted && e.detail && Array.isArray(e.detail)) {
        setCategories((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(e.detail)) return prev
          return e.detail
        })
      }
    }

    window.addEventListener('storage', handleSync)
    window.addEventListener('enquiry_categories_updated', handleCustomEvent)
    window.addEventListener('focus', fetchFromBackend)

    const interval = setInterval(() => {
      fetchFromBackend()
    }, 4000)

    return () => {
      isMounted = false
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('enquiry_categories_updated', handleCustomEvent)
      window.removeEventListener('focus', fetchFromBackend)
      clearInterval(interval)
    }
  }, [fetchFromBackend])

  return [categories, setCategories, fetchFromBackend]
}

export default useLiveCategories

import { useState, useEffect } from 'react'
import defaultProducts from '../ProductsData.json'
import { apiService } from '../api/apiService'

export const LOCAL_KEY_PRODUCTS = 'enquiry_admin_products'

// Helper function to load products from localStorage with safe fallback
export const getStoredProducts = () => {
  try {
    const saved = localStorage.getItem(LOCAL_KEY_PRODUCTS)
    if (saved !== null) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (err) {
    console.warn('[useLiveProducts] Error parsing stored products:', err)
  }
  return defaultProducts
}

// Global dispatcher to broadcast product changes across components and tabs
export const broadcastProductUpdate = (newProducts) => {
  if (!Array.isArray(newProducts)) return
  try {
    localStorage.setItem(LOCAL_KEY_PRODUCTS, JSON.stringify(newProducts))
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent('enquiry_products_updated', { detail: newProducts }))
  } catch (err) {
    console.warn('[useLiveProducts] Storage quota exceeded saving products:', err.message)
    try {
      const lightProducts = newProducts.map((p) => {
        if (p && p.image && String(p.image).length > 2000) {
          return { ...p, image: '' }
        }
        return p
      })
      localStorage.setItem(LOCAL_KEY_PRODUCTS, JSON.stringify(lightProducts))
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new CustomEvent('enquiry_products_updated', { detail: newProducts }))
    } catch {
      try { localStorage.removeItem(LOCAL_KEY_PRODUCTS) } catch {}
    }
  }
}

/**
 * Custom React hook that supplies live product data synchronized in real-time
 * with Admin Panel changes, localStorage, and MongoDB backend.
 */
export const useLiveProducts = () => {
  const [products, setProducts] = useState(getStoredProducts)

  useEffect(() => {
    let isMounted = true

    // 1. Sync with backend API
    const fetchFromBackend = async () => {
      try {
        const dbProducts = await apiService.getProducts()
        if (isMounted && Array.isArray(dbProducts)) {
          setProducts(dbProducts)
          try {
            localStorage.setItem(LOCAL_KEY_PRODUCTS, JSON.stringify(dbProducts))
          } catch (storageErr) {
            console.warn('[useLiveProducts] Quota exceeded saving products:', storageErr.message)
            try {
              const lightProducts = dbProducts.map((p) => {
                if (p && p.image && String(p.image).length > 2000) {
                  return { ...p, image: '' }
                }
                return p
              })
              localStorage.setItem(LOCAL_KEY_PRODUCTS, JSON.stringify(lightProducts))
            } catch {
              try { localStorage.removeItem(LOCAL_KEY_PRODUCTS) } catch {}
            }
          }
        }
      } catch (err) {
        // Fallback silently to client state
      } 
    }

    fetchFromBackend()

    // 2. Real-time synchronizer for storage and custom events
    const handleSync = () => {
      const current = getStoredProducts()
      if (isMounted) {
        setProducts((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(current)) return prev
          return current
        })
      }   
    }

    const handleCustomEvent = (e) => {
      if (isMounted && e.detail && Array.isArray(e.detail)) {
        setProducts((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(e.detail)) return prev
          return e.detail
        })
      }
    }

    const handleFocus = () => {
      handleSync()
      fetchFromBackend()
    }

    window.addEventListener('storage', handleSync)
    window.addEventListener('enquiry_products_updated', handleCustomEvent)
    window.addEventListener('focus', handleFocus)

    // Poll periodically to catch in-memory changes across admin tabs and backend database
    const interval = setInterval(() => {
      handleSync()
      fetchFromBackend()
    }, 3000)

    return () => {
      isMounted = false
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('enquiry_products_updated', handleCustomEvent)
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
    }
  }, [])

  return [products, broadcastProductUpdate]
}

export default useLiveProducts

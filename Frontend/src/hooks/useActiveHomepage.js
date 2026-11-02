import { useState, useEffect } from 'react'

/**
 * Returns current active homepage key ('home1' or 'home2').
 * Checks URL query param, sessionStorage (navigated from specific homepage),
 * and admin store settings in localStorage. Defaults to 'home1'.
 */
export const getStoredActiveHomepage = () => {
  try {
    // 1. Check URL query param e.g. ?home=home1 or ?home=home2
    if (typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search)
      const homeParam = params.get('home')
      if (homeParam === 'home1' || homeParam === 'home2') {
        return homeParam
      }
    }

    // 2. Check sessionStorage if user navigated from /home1 or /home2
    const sessionVal = sessionStorage.getItem('active_homepage')
    if (sessionVal === 'home1' || sessionVal === 'home2') {
      return sessionVal
    }

    // 3. Check localStorage store settings (canonical admin setting)
    const saved = localStorage.getItem('enquiry_admin_store_settings')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.activeHomepage === 'home1' || parsed.activeHomepage === 'home2') {
        return parsed.activeHomepage
      }
    }
  } catch (err) {
    console.warn('[useActiveHomepage] Error retrieving active homepage:', err)
  }
  return 'home1'
}

/**
 * React hook that reactively tracks the current active homepage.
 */
export const useActiveHomepage = () => {
  const [activeHomepage, setActiveHomepage] = useState(getStoredActiveHomepage)

  useEffect(() => {
    const updateHomepage = () => {
      setActiveHomepage(getStoredActiveHomepage())
    }

    const handleCustomEvent = (e) => {
      if (e && e.detail && (e.detail === 'home1' || e.detail === 'home2')) {
        setActiveHomepage(e.detail)
      } else {
        updateHomepage()
      }
    }

    window.addEventListener('storage', updateHomepage)
    window.addEventListener('homepageChanged', handleCustomEvent)
    const interval = setInterval(updateHomepage, 500)

    return () => {
      window.removeEventListener('storage', updateHomepage)
      window.removeEventListener('homepageChanged', handleCustomEvent)
      clearInterval(interval)
    }
  }, [])

  return activeHomepage
}

export default useActiveHomepage

import { API_BASE_URL, BACKEND_URL, getApiUrl, apiClient } from '../config/api'

/**
 * Frontend API Service Layer for Enquiry Website MERN Stack
 * Communicates with Node.js Express Backend via centralized API client.
 * Features automatic fallback to localStorage/default JSONs if backend server is offline.
 */

// Helper for HTTP requests using universal apiClient
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const data = await apiClient(endpoint, options)
    if (!data || data.isOffline) {
      console.warn(`[apiService] Backend unreachable at ${endpoint}, falling back to local client state`)
      return null
    }
    return data
  } catch (error) {
    console.warn(`[apiService] Backend error at ${endpoint}, falling back to local client state:`, error.message)
    return null
  }
}

export const apiService = {
  // Check backend server health
  checkHealth: async () => {
    return await fetchAPI('/health')
  },

  // Products API
  getProducts: async () => {
    const data = await fetchAPI('/products')
    return data && data.success ? data.data : null
  },

  createProduct: async (productData) => {
    return await fetchAPI('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    })
  },

  updateProduct: async (id, productData) => {
    return await fetchAPI(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    })
  },

  deleteProduct: async (id) => {
    return await fetchAPI(`/products/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    })
  },

  getProductById: async (id) => {
    const data = await fetchAPI(`/products/${encodeURIComponent(id)}`)
    return data && data.success ? data.data : null
  },

  getProductBySlug: async (slug) => {
    const data = await fetchAPI(`/products/slug/${encodeURIComponent(slug)}`)
    return data && data.success ? data.data : null
  },

  generateProductSeo: async (productInfo) => {
    return await fetchAPI('/products/seo/generate', {
      method: 'POST',
      body: JSON.stringify(productInfo)
    })
  },

  getProductSitemap: async () => {
    const data = await fetchAPI('/products/seo/sitemap')
    return data && data.success ? data.data : []
  },

  // Categories API (MongoDB)
  getCategories: async () => {
    const data = await fetchAPI('/categories')
    return data && data.success ? data.data : null
  },

  getCategoryBySlug: async (slugOrId) => {
    const data = await fetchAPI(`/categories/${encodeURIComponent(slugOrId)}`)
    return data && data.success ? data.data : null
  },

  createCategory: async (categoryData) => {
    return await fetchAPI('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    })
  },

  updateCategory: async (id, categoryData) => {
    return await fetchAPI(`/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    })
  },

  deleteCategory: async (id) => {
    return await fetchAPI(`/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    })
  },

  // Settings API
  getSettings: async () => {
    const data = await fetchAPI('/settings')
    return data && data.success ? data.data : null
  },

  updateSettings: async (settingsData) => {
    return await fetchAPI('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    })
  },

  // Homepage Specific Settings API
  getHomepageSettings: async () => {
    const data = await fetchAPI('/settings/homepage')
    return data && data.success ? data.data : null
  },

  updateHomepageSettings: async (homepageData) => {
    return await fetchAPI('/settings/homepage', {
      method: 'PUT',
      body: JSON.stringify(homepageData)
    })
  },

  // Footer Specific Settings API
  getFooterSettings: async () => {
    const data = await fetchAPI('/settings/footer')
    return data && data.success ? data.data : null
  },

  updateFooterSettings: async (footerData) => {
    return await fetchAPI('/settings/footer', {
      method: 'PUT',
      body: JSON.stringify(footerData)
    })
  },

  // Company Specific Settings API
  getCompanySettings: async () => {
    const data = await fetchAPI('/settings/company')
    return data && data.success ? data.data : null
  },

  updateCompanySettings: async (companyData) => {
    return await fetchAPI('/settings/company', {
      method: 'PUT',
      body: JSON.stringify(companyData)
    })
  },

  // WhatsApp Specific Settings API
  getWhatsappSettings: async () => {
    const data = await fetchAPI('/settings/whatsapp')
    return data && data.success ? data.data : null
  },

  updateWhatsappSettings: async (whatsappData) => {
    return await fetchAPI('/settings/whatsapp', {
      method: 'PUT',
      body: JSON.stringify(whatsappData)
    })
  },

  // SMTP Settings API
  getSmtpSettings: async () => {
    const data = await fetchAPI('/settings/smtp')
    return data && data.success ? data.data : null
  },

  updateSmtpSettings: async (smtpData) => {
    return await fetchAPI('/settings/smtp', {
      method: 'PUT',
      body: JSON.stringify(smtpData)
    })
  },

  // Cloudinary Settings API
  getCloudinarySettings: async () => {
    const data = await fetchAPI('/settings/cloudinary')
    return data && data.success ? data.data : null
  },

  updateCloudinarySettings: async (cloudinaryData) => {
    return await fetchAPI('/settings/cloudinary', {
      method: 'PUT',
      body: JSON.stringify(cloudinaryData)
    })
  },

  // Enquiries API
  submitEnquiry: async (enquiryData) => {
    return await apiClient('/enquiries', {
      method: 'POST',
      body: JSON.stringify(enquiryData)
    })
  },

  getEnquiries: async () => {
    const data = await fetchAPI('/enquiries')
    return data && data.success ? data.data : null
  },

  updateEnquiryStatus: async (id, status) => {
    return await apiClient(`/enquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  },

  deleteEnquiry: async (id) => {
    return await apiClient(`/enquiries/${id}`, {
      method: 'DELETE'
    })
  },

  testSmtp: async (smtpConfig) => {
    return await apiClient('/enquiries/test-smtp', {
      method: 'POST',
      body: JSON.stringify(smtpConfig)
    })
  },

  testCloudinary: async (cloudinaryConfig) => {
    return await fetchAPI('/settings/test-cloudinary', {
      method: 'POST',
      body: JSON.stringify(cloudinaryConfig)
    })
  },

  // Hero Slides API
  getHeroSlides: async () => {
    const data = await fetchAPI('/hero-slides')
    return data && data.success ? data.data : null
  },

  updateHeroSlides: async (slides) => {
    return await fetchAPI('/hero-slides', {
      method: 'PUT',
      body: JSON.stringify({ slides })
    })
  },

  // Image Upload API (Cloudinary + Multer)
  uploadImage: async (file) => {
    try {
      const formData = new FormData()
      formData.append('image', file)

      const result = await apiClient('/upload', {
        method: 'POST',
        body: formData
      })
      if (!result || !result.success) {
        throw new Error(result?.message || 'Upload failed')
      }
      return result
    } catch (error) {
      console.warn('[apiService] Cloudinary/Multer upload warning:', error.message)
      return null
    }
  },

  // Blog Articles & Settings API
  getBlogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const endpoint = query ? `/blogs?${query}` : '/blogs'
    const data = await fetchAPI(endpoint)
    return data && data.success ? data.data : null
  },

  getBlogById: async (id) => {
    const data = await fetchAPI(`/blogs/${id}`)
    return data && data.success ? data.data : null
  },

  createBlog: async (blogData) => {
    return await fetchAPI('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData)
    })
  },

  updateBlog: async (id, blogData) => {
    return await fetchAPI(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData)
    })
  },

  deleteBlog: async (id) => {
    return await fetchAPI(`/blogs/${id}`, {
      method: 'DELETE'
    })
  },

  getBlogSettings: async () => {
    const data = await fetchAPI('/blogs/settings')
    return data && data.success ? data.data : null
  },

  updateBlogSettings: async (settingsData) => {
    return await fetchAPI('/blogs/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    })
  },

  // =========================================================================
  // ADMIN AUTHENTICATION & SESSION APIS
  // =========================================================================
  adminLogin: async (credentials) => {
    return await apiClient('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      timeout: 30000
    })
  },

  adminLogout: async () => {
    return await apiClient('/admin/auth/logout', {
      method: 'POST'
    })
  },

  adminGetMe: async () => {
    return await apiClient('/admin/auth/me')
  },

  adminUpdateProfile: async (profileData) => {
    return await apiClient('/admin/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
  },

  // =========================================================================
  // SUPER ADMIN USER MANAGEMENT APIS
  // =========================================================================
  adminGetAll: async (params = {}) => {
    const searchParams = new URLSearchParams()
    if (params.search) searchParams.set('search', params.search)
    if (params.role) searchParams.set('role', params.role)
    if (params.status) searchParams.set('status', params.status)
    if (params.page) searchParams.set('page', params.page)
    if (params.limit) searchParams.set('limit', params.limit)
    const qs = searchParams.toString()
    return await apiClient(`/admin/all${qs ? `?${qs}` : ''}`)
  },

  adminCreate: async (adminData) => {
    return await apiClient('/admin/create', {
      method: 'POST',
      body: JSON.stringify(adminData)
    })
  },

  adminUpdate: async (id, adminData) => {
    return await apiClient(`/admin/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(adminData)
    })
  },

  adminToggleStatus: async (id) => {
    return await apiClient(`/admin/${encodeURIComponent(id)}/status`, {
      method: 'PATCH'
    })
  },

  adminUpdatePermissions: async (id, permissions) => {
    return await apiClient(`/admin/${encodeURIComponent(id)}/permissions`, {
      method: 'PATCH',
      body: JSON.stringify({ permissions })
    })
  },

  adminResetPassword: async (id, newPassword) => {
    return await apiClient(`/admin/${encodeURIComponent(id)}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    })
  },

  adminDelete: async (id) => {
    return await apiClient(`/admin/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    })
  }
}

export default apiService

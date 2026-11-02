import React, { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import productsData from '../ProductsData.json'
import categoryDataMap from '../CategoryProductsData.json'
import beautyProductsData from '../BeautyProductsData.json'
import ProductNavbar from '../components/ProductNavbar'
import ProductDetailNavbar from '../components/ProductDeatils/ProductDetailNavbar'
import ProductHero from '../components/ProductDeatils/ProductHero'
import SecondHero from '../components/ProductDeatils/SecondHero'
import RelatedProduct from '../components/ProductDeatils/RelatedProduct'
import Footer from '../components/Footer'
import { apiService } from '../api/apiService'
import useLiveProducts from '../hooks/useLiveProducts'

// Combine main catalog, category variant catalog, and beauty catalog into one search pool
const categoryVariantProducts = Object.values(categoryDataMap).flatMap((group) => group.products || []);

const ProductDetails = () => {
  const { id } = useParams()
  const [liveProducts] = useLiveProducts()
  const [apiProduct, setApiProduct] = useState(null)

  const paramLower = id ? decodeURIComponent(id).toLowerCase().trim() : ''

  // 1. Fetch live product from MongoDB API by slug or ID
  useEffect(() => {
    let isMounted = true
    if (id && apiService && typeof apiService.getProductById === 'function') {
      apiService.getProductById(id).then((res) => {
        if (isMounted && res) {
          setApiProduct(res)
        }
      }).catch(() => {
        // Fallback silently to client catalog
      })
    }
    return () => {
      isMounted = false
    }
  }, [id])

  // 2. Find matching product by slug, ID, or normalized product name across live catalog
  const localProduct = useMemo(() => {
    if (!id) return liveProducts[0] || productsData[0]

    const allCatalog = [...liveProducts, ...categoryVariantProducts, ...beautyProductsData]

    return allCatalog.find((p) => {
      if (!p) return false
      const pSlug = p.slug ? String(p.slug).toLowerCase().trim() : ''
      const pId = p.id !== undefined && p.id !== null ? String(p.id).toLowerCase().trim() : ''
      const pMongoId = p._id ? String(p._id).toLowerCase().trim() : ''
      const pName = (p.name || p.title || '').toLowerCase().trim()
      const pNameSlug = pName.replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-')

      return (
        pSlug === paramLower ||
        pId === paramLower ||
        pMongoId === paramLower ||
        pNameSlug === paramLower ||
        pName === paramLower.replace(/-/g, ' ') ||
        (pSlug && paramLower.includes(pSlug))
      )
    })
  }, [id, paramLower, liveProducts])

  // Merge any live updates from liveProducts (e.g. availability, title, price, images)
  const activeProduct = useMemo(() => {
    const base = apiProduct || localProduct
    if (!base) return null
    const liveMatch = liveProducts.find((lp) =>
      (lp._id && base._id && String(lp._id) === String(base._id)) ||
      (lp.id !== undefined && base.id !== undefined && String(lp.id) === String(base.id)) ||
      (lp.slug && base.slug && lp.slug === base.slug) ||
      (lp.name && base.name && lp.name.toLowerCase() === (base.name || base.title || '').toLowerCase())
    )
    return liveMatch ? { ...base, ...liveMatch } : base
  }, [apiProduct, localProduct, liveProducts])

  // 3. Scroll to top only on product route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  // 4. Apply dynamic SEO metadata tags without scrolling
  useEffect(() => {
    if (activeProduct) {
      document.title = activeProduct.seoTitle || `${activeProduct.name || activeProduct.title || 'Product'} | QuickEnquiry`

      if (activeProduct.metaDescription) {
        let metaDesc = document.querySelector('meta[name="description"]')
        if (!metaDesc) {
          metaDesc = document.createElement('meta')
          metaDesc.name = 'description'
          document.head.appendChild(metaDesc)
        }
        metaDesc.content = activeProduct.metaDescription
      }

      if (activeProduct.metaKeywords) {
        let metaKeys = document.querySelector('meta[name="keywords"]')
        if (!metaKeys) {
          metaKeys = document.createElement('meta')
          metaKeys.name = 'keywords'
          document.head.appendChild(metaKeys)
        }
        metaKeys.content = activeProduct.metaKeywords
      }
    }
  }, [activeProduct])

  // Handle invalid product ID gracefully
  if (id && !activeProduct) {
    return (
      <div>
        <ProductNavbar />
        <nav/>
        <div style={{ 
          textAlign: 'center',
          padding: '100px 20px', 
          minHeight: '60vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #FFF4EC 0%, #FDF8F3 100%)'
        }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>
            Product Not Found
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '28px', maxWidth: '450px' }}>
            The requested product could not be found. It may have been removed or the URL might be invalid.
          </p>
          <Link 
            to="/product" 
            style={{ 
              padding: '12px 28px', 
              background: '#2563eb', 
              color: '#ffffff', 
              borderRadius: '999px', 
              textDecoration: 'none', 
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
            }}
          >
            Back to All Products
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div>
      <ProductNavbar />
      <ProductDetailNavbar product={activeProduct} />   
      <ProductHero product={activeProduct} />
      <RelatedProduct currentProduct={activeProduct} />
      <Footer /> 
    </div>
  )
}

export default ProductDetails
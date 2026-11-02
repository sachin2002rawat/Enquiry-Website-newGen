import React, { createContext, useContext, useState } from 'react'

const EnquiryModalContext = createContext()

export const EnquiryModalProvider = ({ children }) => {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState('')

  const openEnquiryModal = (productName = '') => {
    if (typeof productName === 'string' && productName.trim()) {
      setSelectedProduct(productName.trim())
    } else {
      setSelectedProduct('')
    }
    setIsEnquiryOpen(true)
  }
 
  const closeEnquiryModal = () => {
    setIsEnquiryOpen(false)
    setSelectedProduct('')
  }

  React.useEffect(() => {
    const handleOpenEvent = (e) => {
      const prod = e?.detail?.productName || (typeof e?.detail === 'string' ? e.detail : '')
      openEnquiryModal(prod)
    }
    const handleCloseEvent = () => {
      closeEnquiryModal()
    }

    window.addEventListener('open_enquiry_modal', handleOpenEvent)
    window.addEventListener('openEnquiryModal', handleOpenEvent)
    window.addEventListener('close_enquiry_modal', handleCloseEvent)

    return () => {
      window.removeEventListener('open_enquiry_modal', handleOpenEvent)
      window.removeEventListener('openEnquiryModal', handleOpenEvent)
      window.removeEventListener('close_enquiry_modal', handleCloseEvent)
    }
  }, [])

  return (
    <EnquiryModalContext.Provider
      value={{
        isEnquiryOpen,
        selectedProduct,
        openEnquiryModal,
        openModal: openEnquiryModal,
        closeEnquiryModal
      }}
    >
      {children}
    </EnquiryModalContext.Provider>
  )
}

export const useEnquiryModal = () => {
  const context = useContext(EnquiryModalContext)
  if (!context) {
    return {
      isEnquiryOpen: false,
      selectedProduct: '',
      openEnquiryModal: () => {},
      openModal: () => {},
      closeEnquiryModal: () => {}
    }
  }
  return context
}

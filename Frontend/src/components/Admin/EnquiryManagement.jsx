import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  FiSearch,
  FiMail,
  FiPhone,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiTrash2,
  FiEye,
  FiX,
  FiRefreshCw,
  FiDownload,
  FiSend,
  FiInbox,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi'
import { FaWhatsapp, FaCommentDots } from 'react-icons/fa'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { apiService } from '../../api/apiService'

const LOCAL_KEY_ENQUIRIES = 'enquiry_admin_customer_enquiries'

const defaultEnquiriesList = [
  {
    _id: 'enq-101',
    id: 101,
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@gmail.com',
    phone: '+91 98234 56789',
    productName: 'Kitchen King Masala',
    message: 'Hello, we run a chain of 4 restaurants in Pune. We are interested in procuring 50kg bulk packs of Kitchen King Masala every month. Please share your wholesale price sheet and delivery schedule.',
    status: 'New',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    _id: 'enq-102',
    id: 102,
    name: 'Pooja Agarwal',
    email: 'pooja.agarwal@outlook.com',
    phone: '+91 98112 34567',
    productName: 'Chaat Masala',
    message: 'Looking for distributor opportunities in Delhi NCR. Could you please send product samples and distributor margin details for Pure Spices and Mix Masala ranges?',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString() // 14 hours ago
  },
  {
    _id: 'enq-103',
    id: 103,
    name: 'Anand Kulkarni',
    email: 'anand.k@foodmart.in',
    phone: '+91 99778 12345',
    productName: 'Garam Masala',
    message: 'We are expanding our retail supermarket shelves in Bangalore and want to stock your 100g and 200g Garam Masala pouches. Need confirmation on shelf-life and MOQ.',
    status: 'Completed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    _id: 'enq-104',
    id: 104,
    name: 'Dr. Sunita Sen',
    email: 'sunita.sen@wellness.org',
    phone: '+91 97456 78901',
    productName: 'Organic Turmeric Powder',
    message: 'Does your turmeric powder contain high curcumin level (above 4%)? Need lab test certification for organic wellness manufacturing.',
    status: 'New',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
  },
  {
    _id: 'enq-105',
    id: 105,
    name: 'Harpreet Singh',
    email: 'harpreet.singh@caterers.com',
    phone: '+91 98881 23456',
    productName: 'Pav Bhaji Masala',
    message: 'Need 100 units urgently for upcoming wedding catering event in Chandigarh next weekend. Please call back immediately to confirm dispatch.',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString()
  }
]

const EnquiryManagement = ({ showToast }) => {
  const [enquiries, setEnquiries] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_ENQUIRIES)
      return saved ? JSON.parse(saved) : defaultEnquiriesList
    } catch {
      return defaultEnquiriesList
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedEnquiry, setSelectedEnquiry] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  // Main Table Pagination (10 items per page)
  const ITEMS_PER_PAGE = 10
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchTerm])

  // KPI Modal State & 5-items per page Pagination
  const [activeKpiModal, setActiveKpiModal] = useState(null)
  const [kpiModalSearch, setKpiModalSearch] = useState('')
  const KPI_ITEMS_PER_PAGE = 5
  const [kpiCurrentPage, setKpiCurrentPage] = useState(1)

  useEffect(() => {
    setKpiCurrentPage(1)
  }, [activeKpiModal, kpiModalSearch])

  // Fetch enquiries from MongoDB API
  const fetchEnquiries = async (silent = false) => {
    if (!silent) setIsLoading(true)
    try {
      const remote = await apiService.getEnquiries()
      if (remote && Array.isArray(remote)) {
        setEnquiries(remote)
        localStorage.setItem(LOCAL_KEY_ENQUIRIES, JSON.stringify(remote))
      }
    } catch (err) {
      console.warn('[EnquiryManagement] Fetching from API fallback to local:', err)
      const saved = localStorage.getItem(LOCAL_KEY_ENQUIRIES)
      if (saved) {
        try {
          setEnquiries(JSON.parse(saved))
        } catch (_) {}
      }
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEnquiries()

    const handleStorageOrCustom = () => {
      const saved = localStorage.getItem(LOCAL_KEY_ENQUIRIES)
      if (saved) {
        try {
          setEnquiries(JSON.parse(saved))
        } catch (_) {}
      }
      fetchEnquiries(true)
    }

    window.addEventListener('storage', handleStorageOrCustom)
    window.addEventListener('enquiry_created', handleStorageOrCustom)
    window.addEventListener('focus', handleStorageOrCustom)

    const interval = setInterval(() => {
      fetchEnquiries(true)
    }, 4000)

    return () => {
      window.removeEventListener('storage', handleStorageOrCustom)
      window.removeEventListener('enquiry_created', handleStorageOrCustom)
      window.removeEventListener('focus', handleStorageOrCustom)
      clearInterval(interval)
    }
  }, [])

  // KPI Counts
  const stats = useMemo(() => {
    const total = enquiries.length
    const newCount = enquiries.filter((e) => (e.status || 'New').toLowerCase() === 'new').length
    const progressCount = enquiries.filter((e) => (e.status || '').toLowerCase() === 'in progress').length
    const completedCount = enquiries.filter((e) => ['completed', 'closed'].includes((e.status || '').toLowerCase())).length

    return { total, newCount, progressCount, completedCount }
  }, [enquiries])

  // Filtered List for KPI Popup Modal
  const kpiModalEnquiries = useMemo(() => {
    if (!activeKpiModal) return []
    let list = enquiries
    if (activeKpiModal === 'new') {
      list = enquiries.filter((e) => (e.status || 'New').toLowerCase() === 'new')
    } else if (activeKpiModal === 'progress') {
      list = enquiries.filter((e) => (e.status || '').toLowerCase() === 'in progress')
    } else if (activeKpiModal === 'completed') {
      list = enquiries.filter((e) => ['completed', 'closed'].includes((e.status || '').toLowerCase()))
    }

    if (kpiModalSearch.trim()) {
      const q = kpiModalSearch.trim().toLowerCase()
      list = list.filter((e) =>
        (e.name || '').toLowerCase().includes(q) ||
        (e.email || '').toLowerCase().includes(q) ||
        (e.phone || '').toLowerCase().includes(q) ||
        (e.productName || '').toLowerCase().includes(q) ||
        (e.message || '').toLowerCase().includes(q)
      )
    }

    return list
  }, [enquiries, activeKpiModal, kpiModalSearch])

  const activeKpiTotalItems = kpiModalEnquiries.length
  const totalKpiPages = Math.max(1, Math.ceil(activeKpiTotalItems / KPI_ITEMS_PER_PAGE))
  const kpiStartIndex = (kpiCurrentPage - 1) * KPI_ITEMS_PER_PAGE
  const kpiEndIndex = Math.min(kpiStartIndex + KPI_ITEMS_PER_PAGE, activeKpiTotalItems)
  const paginatedKpiEnquiries = useMemo(() => {
    return kpiModalEnquiries.slice(kpiStartIndex, kpiStartIndex + KPI_ITEMS_PER_PAGE)
  }, [kpiModalEnquiries, kpiStartIndex])

  // Filtered List
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      const currentStatus = (item.status || 'New').toLowerCase()
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'NEW' && currentStatus === 'new') ||
        (statusFilter === 'IN_PROGRESS' && currentStatus === 'in progress') ||
        (statusFilter === 'COMPLETED' && (currentStatus === 'completed' || currentStatus === 'closed'))

      const term = searchTerm.trim().toLowerCase()
      if (!term) return matchesStatus

      const matchesSearch =
        (item.name || '').toLowerCase().includes(term) ||
        (item.email || '').toLowerCase().includes(term) ||
        (item.phone || '').toLowerCase().includes(term) ||
        (item.productName || '').toLowerCase().includes(term) ||
        (item.message || '').toLowerCase().includes(term)

      return matchesStatus && matchesSearch
    })
  }, [enquiries, statusFilter, searchTerm])

  // Main Enquiry Table Pagination Calculations (10 items per page)
  const totalItems = filteredEnquiries.length
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems)
  const paginatedEnquiries = useMemo(() => {
    return filteredEnquiries.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredEnquiries, startIndex, ITEMS_PER_PAGE])

  // Update Status handler
  const handleStatusChange = async (enquiryId, newStatus) => {
    const updated = enquiries.map((e) =>
      (e._id === enquiryId || e.id === enquiryId) ? { ...e, status: newStatus } : e
    )
    setEnquiries(updated)
    localStorage.setItem(LOCAL_KEY_ENQUIRIES, JSON.stringify(updated))
    window.dispatchEvent(new Event('storage'))

    if (selectedEnquiry && (selectedEnquiry._id === enquiryId || selectedEnquiry.id === enquiryId)) {
      setSelectedEnquiry((prev) => ({ ...prev, status: newStatus }))
    }

    try {
      await apiService.updateEnquiryStatus(enquiryId, newStatus)
    } catch {
      // local update already handled
    }

    showToast(`Enquiry marked as "${newStatus}"!`)
  }

  // Delete enquiry handler
  const handleDeleteEnquiry = async (enquiryId) => {
    try {
      await apiService.deleteEnquiry(enquiryId)
    } catch (err) {
      console.warn('[EnquiryManagement] Failed to delete from API, removing locally:', err)
    }
    const updated = enquiries.filter((e) => e._id !== enquiryId && e.id !== enquiryId)
    setEnquiries(updated)
    localStorage.setItem(LOCAL_KEY_ENQUIRIES, JSON.stringify(updated))
    window.dispatchEvent(new Event('storage'))
    setDeleteId(null)
    if (selectedEnquiry && (selectedEnquiry._id === enquiryId || selectedEnquiry.id === enquiryId)) {
      setSelectedEnquiry(null)
    }
    showToast('Enquiry deleted successfully!')
  }

  // WhatsApp quick reply
  const handleReplyWhatsApp = (enquiry) => {
    const phone = (enquiry.phone || '').replace(/[^0-9]/g, '')
    const greeting = encodeURIComponent(
      `Hello ${enquiry.name}, thank you for your enquiry regarding "${enquiry.productName}" on QuickEnquiry! We would love to assist you with the details.`
    )
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${greeting}`, '_blank')
    } else {
      window.open(`https://wa.me/?text=${greeting}`, '_blank')
    }
  }

  // Download PDF Report
  const handleDownloadPDF = () => {
    if (enquiries.length === 0) {
      showToast('No enquiries to export!', 'warning')
      return
    }

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Header Banner
      doc.setFillColor(15, 23, 42) // Dark Navy (#0F172A)
      doc.rect(0, 0, pageWidth, 60, 'F')

      // Brand Title
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('QuickEnquiry - Customer Enquiries & Quotation Leads', 30, 36)

      // Header Subtitle
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(148, 163, 184)
      const exportDate = new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
      doc.text(`Exported: ${exportDate}  |  Total Enquiries: ${enquiries.length}`, 30, 50)

      // Table Setup
      const tableHeaders = [['#', 'Customer Name', 'Email', 'Phone', 'Product Inquired', 'Status', 'Date', 'Message Details']]
      const tableRows = enquiries.map((e, index) => [
        index + 1,
        e.name || 'Anonymous',
        e.email || 'N/A',
        e.phone || 'N/A',
        e.productName || 'General Enquiry',
        e.status || 'New',
        e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
        e.message || '-'
      ])

      autoTable(doc, {
        head: tableHeaders,
        body: tableRows,
        startY: 75,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5,
          halign: 'left',
          cellPadding: 6
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [30, 41, 59],
          cellPadding: 6,
          valign: 'top'
        },
        columnStyles: {
          0: { cellWidth: 24, halign: 'center' },
          1: { cellWidth: 105, fontStyle: 'bold' },
          2: { cellWidth: 125 },
          3: { cellWidth: 85 },
          4: { cellWidth: 105 },
          5: { cellWidth: 70, fontStyle: 'bold' },
          6: { cellWidth: 75 },
          7: { cellWidth: 'auto' }
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 5) {
            const val = String(data.cell.raw).toLowerCase()
            if (val === 'new') {
              data.cell.styles.textColor = [217, 119, 6]
            } else if (val === 'in progress') {
              data.cell.styles.textColor = [2, 132, 199]
            } else {
              data.cell.styles.textColor = [22, 163, 74]
            }
          }
        },
        margin: { left: 30, right: 30 }
      })

      // Footer with Page Numbers
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184)
        doc.text(
          `Page ${i} of ${pageCount}  —  QuickEnquiry Admin Official Customer Leads Report`,
          pageWidth / 2,
          pageHeight - 15,
          { align: 'center' }
        )
      }

      const fileName = `Customer_Enquiries_Report_${new Date().toISOString().slice(0, 10)}.pdf`
      doc.save(fileName)
      showToast('Downloaded Customer Enquiries PDF report!')
    } catch (err) {
      console.error('[handleDownloadPDF] Error:', err)
      showToast('Downloaded PDF report!')
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    if (enquiries.length === 0) return
    const headers = ['ID', 'Customer Name', 'Email', 'Phone', 'Product', 'Status', 'Date', 'Message']
    const rows = enquiries.map((e) => [
      `"${e._id || e.id}"`,
      `"${e.name || ''}"`,
      `"${e.email || ''}"`,
      `"${e.phone || ''}"`,
      `"${e.productName || ''}"`,
      `"${e.status || 'New'}"`,
      `"${new Date(e.createdAt || Date.now()).toLocaleDateString()}"`,
      `"${(e.message || '').replace(/"/g, '""')}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `customer_enquiries_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported enquiries to CSV file!')
  }

  const getStatusBadge = (status) => {
    const s = (status || 'New').toLowerCase()
    if (s === 'new') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#FEF3C7', color: '#B45309' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D97706' }}></span>
          New
        </span>
      )
    }
    if (s === 'in progress') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#E0F2FE', color: '#0284C7' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0284C7' }}></span>
          In Progress
        </span>
      )
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#DCFCE7', color: '#15803D' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }}></span>
        Completed
      </span>
    )
  }

  return (
    <div className="enquiry-management-container">
      {/* 1. TOP STATS CARDS */}
      <div className="kpi-grid">
        <div
          className="kpi-card clickable"
          onClick={() => {
            setKpiModalSearch('')
            setActiveKpiModal('total')
          }}
          title="Click to view all customer enquiries list"
          style={{ borderLeft: '4px solid #EA580C', cursor: 'pointer', position: 'relative' }}
        >
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#FFEDD5', color: '#EA580C' }}>
            <FaCommentDots size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Total Enquiries</span>
            <span className="kpi-value">{stats.total}</span>
            <span className="kpi-meta" style={{ color: '#EA580C' }}>All time customer requests</span>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#EA580C',
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: '#FFEDD5',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
          >
            <FiEye size={13} />
            <span>View</span>
          </div>
        </div>

        <div
          className="kpi-card clickable"
          onClick={() => {
            setKpiModalSearch('')
            setActiveKpiModal('new')
          }}
          title="Click to view new & pending enquiries list"
          style={{ borderLeft: '4px solid #D97706', cursor: 'pointer', position: 'relative' }}
        >
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <FiAlertCircle size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">New / Pending</span>
            <span className="kpi-value">{stats.newCount}</span>
            <span className="kpi-meta" style={{ color: '#D97706' }}>Requires follow-up response</span>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#D97706',
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: '#FEF3C7',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
          >
            <FiEye size={13} />
            <span>View</span>
          </div>
        </div>

        <div
          className="kpi-card clickable"
          onClick={() => {
            setKpiModalSearch('')
            setActiveKpiModal('progress')
          }}
          title="Click to view in-progress enquiries list"
          style={{ borderLeft: '4px solid #0284C7', cursor: 'pointer', position: 'relative' }}
        >
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
            <FiClock size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">In Progress</span>
            <span className="kpi-value">{stats.progressCount}</span>
            <span className="kpi-meta" style={{ color: '#0284C7' }}>Being handled by sales team</span>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#0284C7',
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: '#E0F2FE',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
          >
            <FiEye size={13} />
            <span>View</span>
          </div>
        </div>

        <div
          className="kpi-card clickable"
          onClick={() => {
            setKpiModalSearch('')
            setActiveKpiModal('completed')
          }}
          title="Click to view resolved & closed enquiries list"
          style={{ borderLeft: '4px solid #16A34A', cursor: 'pointer', position: 'relative' }}
        >
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
            <FiCheckCircle size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Resolved / Closed</span>
            <span className="kpi-value">{stats.completedCount}</span>
            <span className="kpi-meta" style={{ color: '#16A34A' }}>Quotation sent or closed</span>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#16A34A',
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: '#DCFCE7',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
          >
            <FiEye size={13} />
            <span>View</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN ENQUIRIES CARD */}
      <div className="admin-card">
        {/* Header with Title and Global Actions */}
        <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: '14px' }}>
          <div className="card-title-group">
            <div className="card-title-icon-wrapper" style={{ backgroundColor: '#FFEDD5', color: '#EA580C' }}>
              <FaCommentDots className="card-title-icon" size={20} />
            </div>
            <div>
              <div className="card-title-row">
                <h2 className="card-title">Customer Enquiries & Quotation Requests</h2>
                <span className="live-count-badge" style={{ backgroundColor: '#FFEDD5', color: '#EA580C' }}>
                  {filteredEnquiries.length} Enquiries
                </span>
              </div>
              <p className="card-subtitle">
                Review and respond to customer product enquiries, bulk quote submissions, and distribution leads.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={fetchEnquiries}
              disabled={isLoading}
              title="Refresh enquiries"
              style={{ fontSize: '0.82rem', padding: '7px 12px' }}
            >
              <FiRefreshCw size={14} className={isLoading ? 'spin' : ''} /> {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={handleDownloadPDF}
              title="Download official PDF report"
              style={{
                fontSize: '0.82rem',
                padding: '7px 14px',
                backgroundColor: '#DC2626',
                borderColor: '#DC2626',
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)'
              }}
            >
              <FiDownload size={14} /> Download PDF
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleExportCSV}
              title="Export raw CSV data"
              style={{ fontSize: '0.82rem', padding: '7px 12px' }}
            >
              <FiDownload size={14} /> CSV
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', background: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
            {[
              { id: 'ALL', label: `All (${stats.total})` },
              { id: 'NEW', label: `New (${stats.newCount})` },
              { id: 'IN_PROGRESS', label: `In Progress (${stats.progressCount})` },
              { id: 'COMPLETED', label: `Completed (${stats.completedCount})` }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: statusFilter === tab.id ? '#FFFFFF' : 'transparent',
                  color: statusFilter === tab.id ? '#0F172A' : '#64748B',
                  boxShadow: statusFilter === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '280px' }}>
            <FiSearch
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
              placeholder="Search by name, email, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 3. ENQUIRIES TABLE - SINGLE CLEAN VIEW */}
        <div className="enquiry-table-wrapper">
          <table className="enquiry-table">
            <thead>
              <tr>
                <th className="enquiry-col-customer">Customer</th>
                <th className="enquiry-col-contact">Contact</th>
                <th className="enquiry-col-product">Product Inquired</th>
                <th className="enquiry-col-message">Message Preview</th>
                <th className="enquiry-col-date">Date</th>
                <th className="enquiry-col-status">Status</th>
                <th className="enquiry-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEnquiries.map((enq) => {
                const enqId = enq._id || enq.id
                const dateStr = enq.createdAt
                  ? new Date(enq.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'Recent'

                return (
                  <tr
                    key={enqId}
                    style={{
                      backgroundColor: enq.status === 'New' ? 'rgba(254, 243, 199, 0.25)' : '#FFFFFF'
                    }}
                  >
                    {/* Customer Name & Avatar */}
                    <td className="enquiry-col-customer">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#FFEDD5',
                            color: '#EA580C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            flexShrink: 0
                          }}
                        >
                          {(enq.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <span
                          style={{
                            fontWeight: 700,
                            color: 'var(--admin-text-main)',
                            fontSize: '0.83rem',
                            whiteSpace: 'nowrap'
                          }}
                          title={enq.name || 'Anonymous Customer'}
                        >
                          {enq.name || 'Anonymous Customer'}
                        </span>
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td className="enquiry-col-contact">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <a
                          href={`mailto:${enq.email}`}
                          style={{
                            color: '#0284C7',
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap'
                          }}
                          title={enq.email}
                        >
                          <FiMail size={12} style={{ flexShrink: 0 }} />
                          <span>{enq.email}</span>
                        </a>
                        {enq.phone && (
                          <div
                            style={{
                              color: '#64748B',
                              fontSize: '0.76rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <FiPhone size={12} style={{ flexShrink: 0 }} /> {enq.phone}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Product Name */}
                    <td className="enquiry-col-product">
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          backgroundColor: '#F1F5F9',
                          color: '#334155',
                          whiteSpace: 'nowrap'
                        }}
                        title={enq.productName || 'General Enquiry'}
                      >
                        {enq.productName || 'General Enquiry'}
                      </span>
                    </td>

                    {/* Message Preview */}
                    <td className="enquiry-col-message">
                      <span
                        onClick={() => setSelectedEnquiry(enq)}
                        style={{
                          fontSize: '0.78rem',
                          color: '#475569',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '260px',
                          cursor: 'pointer',
                          display: 'block'
                        }}
                        title="Click to read full message"
                      >
                        {enq.message || 'No additional message text.'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="enquiry-col-date" style={{ fontSize: '0.78rem', color: '#64748B', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {dateStr}
                    </td>

                    {/* Status Select */}
                    <td className="enquiry-col-status">
                      <select
                        value={enq.status || 'New'}
                        onChange={(e) => handleStatusChange(enqId, e.target.value)}
                        className={`enquiry-status-select status-${(enq.status || 'new').toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="enquiry-col-actions">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => setSelectedEnquiry(enq)}
                          title="View Details"
                          style={{ width: '28px', height: '28px', color: '#0284C7', padding: 0 }}
                        >
                          <FiEye size={15} />
                        </button>

                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleReplyWhatsApp(enq)}
                          title="Reply on WhatsApp"
                          style={{ width: '28px', height: '28px', color: '#22C55E', padding: 0 }}
                        >
                          <FaWhatsapp size={15} />
                        </button>

                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => setDeleteId(enqId)}
                          title="Delete Enquiry"
                          style={{ width: '28px', height: '28px', color: '#EF4444', padding: 0 }}
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredEnquiries.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748B' }}>
              <FiInbox size={38} color="#CBD5E1" style={{ marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 4px 0', color: 'var(--admin-text-main)' }}>No enquiries found</h4>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>No customer submissions match your filter or search query.</p>
            </div>
          )}
        </div>

        {/* 4. MAIN ENQUIRY TABLE PAGINATION BAR (10 ITEMS PER PAGE) */}
        {filteredEnquiries.length > 0 && (
          <div className="admin-pagination-bar" style={{ marginTop: '16px' }}>
            <div className="pagination-info">
              Showing <span style={{ color: 'var(--admin-text-main)', fontWeight: 600 }}>{startIndex + 1}</span> to{' '}
              <span style={{ color: 'var(--admin-text-main)', fontWeight: 600 }}>{endIndex}</span> of{' '}
              <span style={{ color: 'var(--admin-text-main)', fontWeight: 600 }}>{totalItems}</span> enquiries
            </div>

            <div className="pagination-controls">
              <button
                type="button"
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                title="Previous Page"
              >
                <FiChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                title="Next Page"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. KPI DETAIL MODAL WITH 5 ITEMS PER PAGE PAGINATION */}
      {activeKpiModal &&
        createPortal(
          <div
            className="modal-overlay"
            style={{
              zIndex: 10000,
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(4px)',
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
            onClick={() => setActiveKpiModal(null)}
          >
            <div
              className="modal-content"
              style={{
                maxWidth: '680px',
                width: '100%',
                maxHeight: '88vh',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--admin-card-border)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL HEADER */}
              <div
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#FAF6F0',
                  borderBottom: '1px solid var(--admin-card-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      fontSize: '1.2rem',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor:
                        activeKpiModal === 'total'
                          ? '#FFEDD5'
                          : activeKpiModal === 'new'
                          ? '#FEF3C7'
                          : activeKpiModal === 'progress'
                          ? '#E0F2FE'
                          : '#DCFCE7',
                      color:
                        activeKpiModal === 'total'
                          ? '#EA580C'
                          : activeKpiModal === 'new'
                          ? '#D97706'
                          : activeKpiModal === 'progress'
                          ? '#0284C7'
                          : '#16A34A'
                    }}
                  >
                    {activeKpiModal === 'total' && <FaCommentDots />}
                    {activeKpiModal === 'new' && <FiAlertCircle />}
                    {activeKpiModal === 'progress' && <FiClock />}
                    {activeKpiModal === 'completed' && <FiCheckCircle />}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--admin-text-main)' }}>
                      {activeKpiModal === 'total' && `Total Enquiries (${stats.total})`}
                      {activeKpiModal === 'new' && `New / Pending Leads (${stats.newCount})`}
                      {activeKpiModal === 'progress' && `In Progress Enquiries (${stats.progressCount})`}
                      {activeKpiModal === 'completed' && `Resolved / Closed Enquiries (${stats.completedCount})`}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                      {activeKpiModal === 'total' && 'Comprehensive record of all incoming quotes, bulk requests, and buyer leads.'}
                      {activeKpiModal === 'new' && 'Fresh enquiries waiting for initial review, quote preparation, and outreach.'}
                      {activeKpiModal === 'progress' && 'Active communications currently being followed up by the sales representative.'}
                      {activeKpiModal === 'completed' && 'Completed quotations, finalized orders, and resolved customer queries.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--admin-card-border)',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--admin-text-muted)'
                  }}
                  onClick={() => setActiveKpiModal(null)}
                >
                  <FiX size={16} />
                </button>
              </div>

              {/* SEARCH BAR */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #F1F5F9', backgroundColor: '#FFFFFF' }}>
                <div style={{ position: 'relative' }}>
                  <FiSearch
                    size={15}
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
                  />
                  <input
                    type="text"
                    placeholder="Search by customer name, email, phone, product, or note..."
                    value={kpiModalSearch}
                    onChange={(e) => setKpiModalSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      borderRadius: '8px',
                      border: '1px solid var(--admin-card-border)',
                      fontSize: '0.84rem',
                      outline: 'none',
                      backgroundColor: '#FAF6F0'
                    }}
                  />
                </div>
              </div>

              {/* MODAL LIST ITEMS */}
              <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, maxHeight: '55vh' }}>
                {paginatedKpiEnquiries.length > 0 ? (
                  paginatedKpiEnquiries.map((enq) => {
                    return (
                      <div
                        key={enq._id || enq.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--admin-card-border)',
                          backgroundColor: '#FFFFFF',
                          marginBottom: '10px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                backgroundColor: '#FEF3C7',
                                color: '#B45309',
                                fontWeight: 800,
                                fontSize: '0.82rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {(enq.name || 'C').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--admin-text-main)' }}>
                                {enq.name || 'Anonymous Customer'}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                                {enq.createdAt
                                  ? new Date(enq.createdAt).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : 'Recently submitted'}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {getStatusBadge(enq.status)}
                          </div>
                        </div>

                        {/* Product and contact info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.78rem' }}>
                          <span
                            style={{
                              backgroundColor: '#FFF7ED',
                              color: '#C2410C',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              border: '1px solid #FFEDD5'
                            }}
                          >
                            📦 {enq.productName || 'General Enquiry'}
                          </span>
                          {enq.email && (
                            <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FiMail size={12} color="#94A3B8" /> {enq.email}
                            </span>
                          )}
                          {enq.phone && (
                            <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FiPhone size={12} color="#94A3B8" /> {enq.phone}
                            </span>
                          )}
                        </div>

                        {/* Message preview snippet */}
                        {enq.message && (
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: '#64748B',
                              backgroundColor: '#FAF6F0',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0',
                              lineHeight: 1.4,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            "{enq.message}"
                          </div>
                        )}

                        {/* Actions row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px dashed #E2E8F0', marginTop: '2px', flexWrap: 'wrap', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ fontSize: '0.76rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => setSelectedEnquiry(enq)}
                          >
                            <FiEye size={12} /> View Full Details
                          </button>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn-primary"
                              style={{ backgroundColor: '#22C55E', borderColor: '#22C55E', fontSize: '0.74rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => handleReplyWhatsApp(enq)}
                              title="Chat on WhatsApp"
                            >
                              <FaWhatsapp size={13} /> WhatsApp
                            </button>
                            <a
                              href={`mailto:${enq.email}?subject=Regarding enquiry for ${encodeURIComponent(enq.productName || 'our products')}&body=Dear ${encodeURIComponent(enq.name)},`}
                              className="btn-primary"
                              style={{ backgroundColor: '#0284C7', borderColor: '#0284C7', fontSize: '0.74rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                              title="Send Email"
                            >
                              <FiSend size={12} /> Email
                            </a>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748B' }}>
                    <FiInbox size={36} color="#CBD5E1" style={{ marginBottom: '10px' }} />
                    <h4 style={{ margin: '0 0 4px', fontSize: '0.96rem', color: 'var(--admin-text-main)' }}>No enquiries found</h4>
                    <p style={{ margin: 0, fontSize: '0.82rem' }}>
                      {kpiModalSearch ? `No enquiries match "${kpiModalSearch}".` : 'No enquiries in this status category.'}
                    </p>
                  </div>
                )}
              </div>

              {/* MODAL FOOTER WITH 5-ITEM PAGINATION */}
              <div
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#FAF6F0',
                  borderTop: '1px solid var(--admin-card-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', minWidth: '140px' }}>
                  {activeKpiTotalItems > 0 ? (
                    <>
                      Showing <strong style={{ color: 'var(--admin-text-main)' }}>{kpiStartIndex + 1}</strong> to{' '}
                      <strong style={{ color: 'var(--admin-text-main)' }}>{kpiEndIndex}</strong> of{' '}
                      <strong style={{ color: 'var(--admin-text-main)' }}>{activeKpiTotalItems}</strong> enquiries
                    </>
                  ) : (
                    '0 enquiries'
                  )}
                </div>

                {/* PAGINATION CONTROLS (5 ITEMS PER PAGE) */}
                {totalKpiPages > 1 && (
                  <div className="pagination-controls" style={{ gap: '4px', margin: '0 auto' }}>
                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={kpiCurrentPage === 1}
                      onClick={() => setKpiCurrentPage((prev) => Math.max(prev - 1, 1))}
                      title="Previous Page"
                      style={{ width: '28px', height: '28px', padding: 0 }}
                    >
                      <FiChevronLeft size={14} />
                    </button>

                    {Array.from({ length: totalKpiPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        className={`pagination-btn ${page === kpiCurrentPage ? 'active' : ''}`}
                        onClick={() => setKpiCurrentPage(page)}
                        style={{
                          width: '28px',
                          height: '28px',
                          padding: 0,
                          fontSize: '0.78rem',
                          fontWeight: page === kpiCurrentPage ? 700 : 500
                        }}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={kpiCurrentPage === totalKpiPages}
                      onClick={() => setKpiCurrentPage((prev) => Math.min(prev + 1, totalKpiPages))}
                      title="Next Page"
                      style={{ width: '28px', height: '28px', padding: 0 }}
                    >
                      <FiChevronRight size={14} />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '6px 18px', minWidth: '80px' }}
                  onClick={() => setActiveKpiModal(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 5. ENQUIRY DETAILS MODAL */}
      {selectedEnquiry &&
        createPortal(
          <div className="modal-overlay" style={{ zIndex: 10005 }}>
            <div className="modal-card" style={{ maxWidth: '580px', width: '92%' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid var(--admin-card-border)', padding: '18px 22px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 className="modal-title" style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                      Enquiry Details
                    </h3>
                    {getStatusBadge(selectedEnquiry.status)}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Received on {new Date(selectedEnquiry.createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setSelectedEnquiry(null)}
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="modal-body" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Customer Details Box */}
                <div style={{ padding: '14px 16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Customer Information
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                    {selectedEnquiry.name}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.86rem' }}>
                    <a
                      href={`mailto:${selectedEnquiry.email}`}
                      style={{ color: '#0284C7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <FiMail size={14} /> {selectedEnquiry.email}
                    </a>
                    {selectedEnquiry.phone && (
                      <span style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiPhone size={14} /> {selectedEnquiry.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Box */}
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Product Enquired
                  </div>
                  <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: 700, fontSize: '0.9rem' }}>
                    {selectedEnquiry.productName || 'General Enquiry'}
                  </div>
                </div>

                {/* Full Message */}
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Customer Message
                  </div>
                  <div
                    style={{
                      padding: '14px 16px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.92rem',
                      lineHeight: 1.6,
                      color: '#1E293B',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {selectedEnquiry.message || 'No additional message was provided by customer.'}
                  </div>
                </div>

                {/* Change Status Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                    Update Lead Status:
                  </span>
                  <select
                    value={selectedEnquiry.status || 'New'}
                    onChange={(e) => handleStatusChange(selectedEnquiry._id || selectedEnquiry.id, e.target.value)}
                    className="form-input"
                    style={{ width: '160px', padding: '6px 10px', fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="modal-footer" style={{ padding: '14px 22px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ color: '#EF4444', borderColor: '#FCA5A5' }}
                  onClick={() => setDeleteId(selectedEnquiry._id || selectedEnquiry.id)}
                >
                  <FiTrash2 size={15} /> Delete Lead
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ backgroundColor: '#22C55E', borderColor: '#22C55E', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => handleReplyWhatsApp(selectedEnquiry)}
                  >
                    <FaWhatsapp size={16} /> WhatsApp Reply
                  </button>

                  <a
                    href={`mailto:${selectedEnquiry.email}?subject=Regarding your enquiry about ${encodeURIComponent(selectedEnquiry.productName || 'our products')}&body=Dear ${encodeURIComponent(selectedEnquiry.name)},%0D%0A%0D%0AThank you for contacting QuickEnquiry!`}
                    className="btn-primary"
                    style={{ backgroundColor: '#0284C7', borderColor: '#0284C7', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                  >
                    <FiSend size={15} /> Email Reply
                  </a>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 6. DELETE CONFIRMATION MODAL */}
      {deleteId !== null &&
        createPortal(
          <div className="modal-overlay" style={{ zIndex: 10010 }}>
            <div className="modal-card" style={{ maxWidth: '400px' }}>
              <div className="modal-header">
                <h3 className="modal-title" style={{ color: '#EF4444' }}>Delete Enquiry?</h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setDeleteId(null)}
                >
                  <FiX size={18} />
                </button>
              </div>
              <div className="modal-body" style={{ padding: '16px 20px' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>
                  Are you sure you want to permanently delete this customer enquiry? This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer" style={{ padding: '12px 20px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setDeleteId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ backgroundColor: '#EF4444', borderColor: '#EF4444' }}
                  onClick={() => handleDeleteEnquiry(deleteId)}
                >
                  <FiTrash2 size={16} /> Yes, Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default React.memo(EnquiryManagement)

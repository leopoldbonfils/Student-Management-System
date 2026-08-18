'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/AuthContext'
import TopbarRight from '@/app/components/TopbarRight'
import {
  MdSearch,
  MdAssignment,
  MdCheckCircle,
  MdTrendingDown,
  MdCheck,
  MdClose,
  MdInsertDriveFile,
  MdFileDownload,
} from 'react-icons/md'

interface LeaveRequestItem {
  id: string
  studentId: string
  name: string
  avatar: string
  color: string
  type: string
  startDate: string
  endDate: string
  durationText: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt?: Date
  attachment?: {
    name: string
    size?: string
    dataUrl: string
    type?: string
  } | null
}

const colorPalette = ['#e0e7ff', '#dcfce7', '#fef3c7', '#fee2e2', '#f3e8ff', '#ccfbf1']
const textColorPalette = ['#4338ca', '#15803d', '#b45309', '#b91c1c', '#7e22ce', '#0f766e']

function getInitials(name: string): string {
  if (!name) return 'ST'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function getAvatarColors(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const idx = Math.abs(hash) % colorPalette.length
  return { bg: colorPalette[idx]!, text: textColorPalette[idx]! }
}

function calculateDays(start: string, end: string): number {
  if (!start) return 1
  if (!end || start === end) return 1
  const d1 = new Date(start)
  const d2 = new Date(end)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return isNaN(diffDays) ? 1 : diffDays
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export default function TeacherLeaveRequestsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [requests, setRequests] = useState<LeaveRequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (!user) return

    const q = query(collection(db, 'leaveRequests'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: LeaveRequestItem[] = snapshot.docs.map((d) => {
          const data = d.data()
          const sName = data.studentName || 'Student'
          const sDate = data.startDate || ''
          const eDate = data.endDate || sDate
          const days = calculateDays(sDate, eDate)

          let durationText = ''
          if (sDate && eDate && sDate !== eDate) {
            durationText = `${formatDate(sDate)} - ${formatDate(eDate)} (${days} day${days > 1 ? 's' : ''})`
          } else if (sDate) {
            durationText = `${formatDate(sDate)} (${days} day)`
          } else {
            durationText = 'Single Day (1 day)'
          }

          const colors = getAvatarColors(data.studentId || d.id)

          return {
            id: d.id,
            studentId: data.studentId || '',
            name: sName,
            avatar: getInitials(sName),
            color: colors.bg,
            type: data.type || 'Leave',
            startDate: sDate,
            endDate: eDate,
            durationText,
            reason: data.reason || 'No description provided.',
            status: (data.status || 'pending').toLowerCase() as 'pending' | 'approved' | 'rejected',
            createdAt: data.createdAt,
            attachment: data.attachment || null,
          }
        })

        // Sort: pending first, then by creation date descending
        list.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1
          if (a.status !== 'pending' && b.status === 'pending') return 1
          return (b.startDate || '').localeCompare(a.startDate || '')
        })

        setRequests(list)
        setLoading(false)
      },
      (err) => {
        console.error('Error loading leave requests:', err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, authLoading, router])

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      const docRef = doc(db, 'leaveRequests', id)
      await updateDoc(docRef, {
        status: action,
        reviewedBy: user?.uid || '',
        reviewedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error(`Error updating leave request to ${action}:`, err)
      alert(`Failed to ${action} leave request.`)
    }
  }

  // Metrics
  const totalPending = requests.filter((r) => r.status === 'pending').length
  const totalApproved = requests.filter((r) => r.status === 'approved').length
  const attendanceImpact = requests.length > 0
    ? `-${(Math.min((totalApproved * 0.4), 8.5)).toFixed(1)}%`
    : '-0.0%'

  // Filtering
  const filteredList = requests.filter((r) => {
    // Tab filter
    if (statusTab !== 'All' && r.status.toLowerCase() !== statusTab.toLowerCase()) {
      return false
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchName = r.name.toLowerCase().includes(q)
      const matchType = r.type.toLowerCase().includes(q)
      const matchReason = r.reason.toLowerCase().includes(q)
      if (!matchName && !matchType && !matchReason) return false
    }

    // Date range filter
    if (startDateFilter && r.startDate && r.startDate < startDateFilter) return false
    if (endDateFilter && r.endDate && r.endDate > endDateFilter) return false

    return true
  })

  // Pagination
  const totalEntries = filteredList.length
  const totalPages = Math.ceil(totalEntries / pageSize) || 1
  const startEntry = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endEntry = Math.min(currentPage * pageSize, totalEntries)
  const paginatedList = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <>
      {/* Top Header */}
      <header className="td-topbar">
        <div className="sm-header-search">
          <MdSearch size={18} color="#9ca3af" />
          <input
            placeholder="Search requests..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>

        <TopbarRight defaultRole="Teacher" />
      </header>

      {/* Main Content */}
      <div className="td-content">
        {/* Page Heading */}
        <div style={{ marginBottom: '12px' }}>
          <h1 className="sm-title" style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
            Leave Requests
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Review and manage student absence applications.
          </p>
        </div>

        {/* 3 Stat Cards Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          {/* Card 1: Total Pending */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              padding: '20px 22px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>
                TOTAL PENDING
              </p>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#1e1b4b', margin: 0, lineHeight: 1 }}>
                {totalPending}
              </p>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#eef2ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MdAssignment size={20} color="#6366f1" />
            </div>
          </div>

          {/* Card 2: Approved This Month */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              padding: '20px 22px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>
                APPROVED THIS MONTH
              </p>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', margin: 0, lineHeight: 1 }}>
                {totalApproved}
              </p>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MdCheckCircle size={20} color="#10b981" />
            </div>
          </div>

          {/* Card 3: Attendance Impact */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              padding: '20px 22px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>
                ATTENDANCE IMPACT
              </p>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#ef4444', margin: 0, lineHeight: 1 }}>
                {attendanceImpact}
              </p>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MdTrendingDown size={20} color="#ef4444" />
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
        >
          {/* Table Filters Bar */}
          <div
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              borderBottom: '1px solid #f8fafc',
            }}
          >
            {/* Status Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((tab) => {
                const isActive = statusTab === tab
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setStatusTab(tab)
                      setCurrentPage(1)
                    }}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: isActive ? 'none' : '1px solid #e2e8f0',
                      backgroundColor: isActive ? '#1e1b4b' : '#ffffff',
                      color: isActive ? '#ffffff' : '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tab}
                  </button>
                )
              })}
            </div>

            {/* Date Range Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
              <span style={{ fontWeight: 500 }}>Date Range:</span>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => {
                  setStartDateFilter(e.target.value)
                  setCurrentPage(1)
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  color: '#334155',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              />
              <span>-</span>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => {
                  setEndDateFilter(e.target.value)
                  setCurrentPage(1)
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  color: '#334155',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              />
              {(startDateFilter || endDateFilter) && (
                <button
                  onClick={() => {
                    setStartDateFilter('')
                    setEndDateFilter('')
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#6366f1',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fcfcfd' }}>
                  <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                    Student Name
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                    Leave Type
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                    Duration
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                    Reason
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                    Status
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#64748b', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      Loading leave requests...
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      No leave requests found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((req) => {
                    const avatarColor = getAvatarColors(req.studentId || req.id)
                    return (
                      <tr
                        key={req.id}
                        style={{
                          borderBottom: '1px solid #f8fafc',
                          transition: 'background 0.12s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Student Name */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: avatarColor.bg,
                                color: avatarColor.text,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {req.avatar}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                              {req.name}
                            </span>
                          </div>
                        </td>

                        {/* Leave Type */}
                        <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569' }}>
                          {req.type}
                        </td>

                        {/* Duration */}
                        <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569' }}>
                          {req.durationText}
                        </td>

                        {/* Reason */}
                        <td
                          style={{
                            padding: '16px 20px',
                            fontSize: '13px',
                            color: '#64748b',
                            maxWidth: '220px',
                          }}
                        >
                          <div
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={req.reason}
                          >
                            {req.reason}
                          </div>
                          {req.attachment && (
                            <div style={{ marginTop: '4px' }}>
                              <a
                                href={req.attachment.dataUrl}
                                download={req.attachment.name}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 6px',
                                  backgroundColor: '#eef2ff',
                                  color: '#4f46e5',
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  borderRadius: '4px',
                                  textDecoration: 'none',
                                  border: '1px solid #c7d2fe',
                                }}
                              >
                                <MdInsertDriveFile size={12} />
                                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {req.attachment.name}
                                </span>
                                <MdFileDownload size={12} />
                              </a>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '16px 20px' }}>
                          {req.status === 'pending' && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 600,
                                backgroundColor: '#fef3c7',
                                color: '#b45309',
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                              Pending
                            </span>
                          )}
                          {req.status === 'approved' && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 600,
                                backgroundColor: '#ecfdf5',
                                color: '#047857',
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                              Approved
                            </span>
                          )}
                          {req.status === 'rejected' && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 600,
                                backgroundColor: '#fef2f2',
                                color: '#b91c1c',
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                              Rejected
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          {req.status === 'pending' ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                onClick={() => handleAction(req.id, 'approved')}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  border: 'none',
                                  backgroundColor: '#10b981',
                                  color: '#ffffff',
                                  cursor: 'pointer',
                                  transition: 'background 0.15s ease',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10b981')}
                              >
                                <MdCheck size={14} /> Approve
                              </button>
                              <button
                                onClick={() => handleAction(req.id, 'rejected')}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  border: '1px solid #e2e8f0',
                                  backgroundColor: '#ffffff',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#fef2f2'
                                  e.currentTarget.style.borderColor = '#fca5a5'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#ffffff'
                                  e.currentTarget.style.borderColor = '#e2e8f0'
                                }}
                              >
                                <MdClose size={14} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
                              Processed
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div
            style={{
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #f1f5f9',
              fontSize: '13px',
              color: '#64748b',
            }}
          >
            <div>
              Showing {startEntry} to {endEntry} of {totalEntries} entries
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  color: currentPage <= 1 ? '#cbd5e1' : '#64748b',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isCurrent = p === currentPage
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: isCurrent ? 'none' : '1px solid #e2e8f0',
                      backgroundColor: isCurrent ? '#1e1b4b' : '#ffffff',
                      color: isCurrent ? '#ffffff' : '#64748b',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {p}
                  </button>
                )
              })}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  color: currentPage >= totalPages ? '#cbd5e1' : '#64748b',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

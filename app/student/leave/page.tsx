'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/AuthContext'
import TopbarRight from '@/app/components/TopbarRight'
import {
  MdSearch,
  MdUploadFile,
  MdChevronLeft,
  MdChevronRight,
  MdVisibility,
  MdCheckCircle,
  MdError,
  MdInsertDriveFile,
  MdClose,
  MdFileDownload,
} from 'react-icons/md'

interface AttachmentData {
  name: string
  size?: string
  dataUrl: string
  type?: string
}

interface PreviousLeaveRequest {
  id: string
  dateRange: string
  duration: string
  type: string
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
  attachment?: AttachmentData | null
}

export default function RequestLeavePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [dayType, setDayType] = useState<'single' | 'multi'>('single')
  const [leaveType, setLeaveType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [attachment, setAttachment] = useState<AttachmentData | null>(null)
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [previousRequests, setPreviousRequests] = useState<PreviousLeaveRequest[]>([])
  const [approvedCount, setApprovedCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [activePage, setPage] = useState(1)
  const [selectedViewRequest, setSelectedViewRequest] = useState<PreviousLeaveRequest | null>(null)
  const pageSize = 5

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file) return
    // 2MB size limit to prevent exceeding Firestore single-doc limits
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('File size exceeds 2MB limit. Please choose a smaller file.')
      return
    }
    setErrorMsg(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      const sizeStr = file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`
      setAttachment({
        name: file.name,
        size: sizeStr,
        dataUrl,
        type: file.type || 'application/octet-stream',
      })
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const removeAttachment = (e: React.MouseEvent) => {
    e.stopPropagation()
    setAttachment(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (!user) return

    const q = query(
      collection(db, 'leaveRequests'),
      where('studentId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: PreviousLeaveRequest[] = []
      let appCount = 0
      let pendCount = 0

      snapshot.forEach(d => {
        const data = d.data()
        const statusNormalized =
          (data.status?.charAt(0).toUpperCase() + data.status?.slice(1).toLowerCase()) as 'Pending' | 'Approved' | 'Rejected'

        if (data.status?.toLowerCase() === 'approved') appCount++
        if (data.status?.toLowerCase() === 'pending') pendCount++

        const isMulti = data.startDate && data.endDate && data.startDate !== data.endDate
        const dateRangeStr = isMulti ? `${data.startDate} - ${data.endDate}` : data.startDate || 'Single Day'

        list.push({
          id: d.id,
          dateRange: dateRangeStr,
          duration: isMulti ? 'Multiple days' : 'Single day',
          type: data.type || 'Personal Reason',
          reason: data.reason || '',
          status: statusNormalized || 'Pending',
          attachment: data.attachment || null,
        })
      })

      setApprovedCount(appCount)
      setPendingCount(pendCount)
      setPreviousRequests(list)
    }, (err) => {
      console.error('Error fetching leave requests:', err)
    })

    return () => unsubscribe()
  }, [user, authLoading, router])

  const handleSubmit = async () => {
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!user) {
      setErrorMsg('You must be signed in to submit a leave request.')
      return
    }
    if (!leaveType) {
      setErrorMsg('Please select a leave type.')
      return
    }
    if (!startDate) {
      setErrorMsg('Please select a start date.')
      return
    }
    if (dayType === 'multi' && !endDate) {
      setErrorMsg('Please select an end date for multi-day leave.')
      return
    }
    if (!reason.trim()) {
      setErrorMsg('Please provide a reason for your absence.')
      return
    }

    setSubmitting(true)
    try {
      await addDoc(collection(db, 'leaveRequests'), {
        studentId: user.uid,
        studentName: profile?.name || user.displayName || 'Student',
        class: profile?.assignedClass || '',
        type: leaveType === 'sick' ? 'Sick Leave' : leaveType === 'academic' ? 'Academic Activity' : leaveType === 'family' ? 'Family Emergency' : 'Personal Reason',
        startDate,
        endDate: dayType === 'multi' ? endDate : startDate,
        reason: reason.trim(),
        attachment: attachment ? {
          name: attachment.name,
          size: attachment.size,
          dataUrl: attachment.dataUrl,
          type: attachment.type,
        } : null,
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        createdAt: serverTimestamp(),
      })

      setSuccessMsg('Leave request submitted successfully for teacher review.')
      setLeaveType('')
      setStartDate('')
      setEndDate('')
      setReason('')
      setAttachment(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: unknown) {
      const error = err as { message?: string }
      console.error('Error creating leave request:', err)
      setErrorMsg(error?.message || 'Failed to submit leave request.')
    } finally {
      setSubmitting(false)
    }
  }

  const totalPages = Math.ceil(previousRequests.length / pageSize) || 1
  const currentPage = Math.min(activePage, totalPages)
  const paginatedRequests = previousRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <>
      {/* Header */}
      <header className="db-header">
        <div className="sl-breadcrumb">
          <span className="sl-brand">EduPortal</span>
          <span className="sl-sep">&rsaquo;</span>
          <span className="sl-crumb">Attendance</span>
          <span className="sl-sep">&rsaquo;</span>
          <span className="sl-crumb sl-crumb-active">Ask Leave</span>
        </div>
        <div className="db-search" style={{ maxWidth: 240 }}>
          <MdSearch size={16} color="#9ca3af" />
          <input type="text" placeholder="Search..." />
        </div>
        <TopbarRight defaultRole="Student" />
      </header>

      {/* Content */}
      <div className="db-content">
        {/* Page heading */}
        <div className="sl-page-head">
          <div>
            <h1 className="sl-title">Submit Leave Request</h1>
            <p className="sl-sub">Fill out the form below to formally request an absence.</p>
          </div>
          <div className="sl-days-badge">
            <MdCheckCircle size={16} color="#10b981" />
            Remaining Personal Days: <strong>{Math.max(0, 5 - approvedCount)}</strong>
          </div>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#ef4444',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            <MdError size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#065f46',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            <MdCheckCircle size={18} color="#10b981" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Two-column layout */}
        <div className="sl-grid">
          {/* Form */}
          <div className="sl-form-card">
            {/* Leave Type */}
            <div className="sl-field">
              <label className="sl-label">Leave Type</label>
              <div className="sl-row">
                <select
                  className="sl-select"
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value)}
                >
                  <option value="">Select reason...</option>
                  <option value="personal">Personal Reason</option>
                  <option value="sick">Sick Leave</option>
                  <option value="academic">Academic Activity</option>
                  <option value="family">Family Emergency</option>
                </select>

                <div className="sl-toggle">
                  <button
                    className={`sl-toggle-btn ${dayType === 'single' ? 'sl-toggle-active' : ''}`}
                    onClick={() => setDayType('single')}
                  >
                    Single Day
                  </button>
                  <button
                    className={`sl-toggle-btn ${dayType === 'multi' ? 'sl-toggle-active' : ''}`}
                    onClick={() => setDayType('multi')}
                  >
                    Multi-Day
                  </button>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="sl-dates-row">
              <div className="sl-field sl-field-half">
                <label className="sl-label">Start Date</label>
                <input
                  type="date"
                  className="sl-input"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              {dayType === 'multi' && (
                <div className="sl-field sl-field-half">
                  <label className="sl-label">End Date <span className="sl-optional">(Optional)</span></label>
                  <input
                    type="date"
                    className="sl-input"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Reason */}
            <div className="sl-field">
              <label className="sl-label">
                Detailed Reason
                <span className="sl-char-count">{reason.length}/500</span>
              </label>
              <textarea
                className="sl-textarea"
                maxLength={500}
                placeholder="Please provide specific details regarding your absence request..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={4}
              />
            </div>

            {/* File Upload */}
            <div className="sl-field">
              <label className="sl-label">Supporting Documents <span className="sl-optional">(Optional)</span></label>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".pdf,image/jpeg,image/png,image/webp,.doc,.docx"
                onChange={handleFileChange}
              />
              {!attachment ? (
                <div
                  className={`sl-upload ${dragging ? 'sl-upload-drag' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => {
                    e.preventDefault()
                    setDragging(false)
                    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0])
                  }}
                >
                  <MdUploadFile size={28} color="#4f46e5" />
                  <p className="sl-upload-text">Click to upload or drag and drop</p>
                  <p className="sl-upload-hint">PDF, JPG, PNG or DOC (Max 2MB)</p>
                </div>
              ) : (
                <div
                  style={{
                    border: '1px solid #c7d2fe',
                    backgroundColor: '#eef2ff',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        backgroundColor: '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      <MdInsertDriveFile size={22} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {attachment.name}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6366f1' }}>
                        {attachment.size} • Attached
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: '5px 10px',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#4f46e5',
                        backgroundColor: '#ffffff',
                        border: '1px solid #c7d2fe',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={removeAttachment}
                      style={{
                        padding: '5px',
                        color: '#ef4444',
                        backgroundColor: '#ffffff',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Remove file"
                    >
                      <MdClose size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="sl-actions">
              <button
                className="sl-cancel-btn"
                onClick={() => {
                  setLeaveType('')
                  setStartDate('')
                  setEndDate('')
                  setReason('')
                  setAttachment(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                  setErrorMsg(null)
                  setSuccessMsg(null)
                }}
              >
                Cancel
              </button>
              <button
                className="sl-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : '▶ Submit Request'}
              </button>
            </div>
          </div>

          {/* Right Panel */}
          <div className="sl-right">
            {/* Leave Policy */}
            <div className="sl-policy-card">
              <div className="sl-policy-head">
                <span className="sl-policy-icon"></span>
                <span className="sl-policy-title">Leave Policy</span>
              </div>
              <ul className="sl-policy-list">
                <li>Requests must be submitted at least <strong>48 hours</strong> in advance for non-emergencies.</li>
                <li>Medical leaves exceeding 3 days require an uploaded doctor&apos;s note.</li>
                <li>Unexcused absences may impact final grades according to syllabus policy.</li>
              </ul>
            </div>

            {/* Semester Summary */}
            <div className="sl-summary-card">
              <p className="sl-summary-title">Semester Summary</p>
              <div className="sl-summary-row">
                <div className="sl-summary-item">
                  <span className="sl-summary-val sl-green">{approvedCount}</span>
                  <span className="sl-summary-sub">APPROVED<br/>Days total</span>
                </div>
                <div className="sl-summary-divider" />
                <div className="sl-summary-item">
                  <span className="sl-summary-val sl-orange">{pendingCount}</span>
                  <span className="sl-summary-sub">PENDING<br/>Request</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Leave Requests */}
        <div className="sl-history-card">
          <div className="sl-history-head">
            <div>
              <h2 className="sl-history-title">Previous Leave Requests</h2>
              <p className="sl-history-sub">History of your submitted absence exemptions.</p>
            </div>
            <button className="sl-filter-btn">▼ Filter</button>
          </div>

          <table className="sl-table">
            <thead>
              <tr>
                <th>Date Range</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {previousRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                    No previous leave requests found.
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <p className="sl-date-main">{req.dateRange}</p>
                      <p className="sl-date-dur">{req.duration}</p>
                    </td>
                    <td>{req.type}</td>
                    <td className="sl-reason-cell">{req.reason}</td>
                    <td>
                      <span className={`sl-badge sl-badge-${req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="sl-action-btn"
                        onClick={() => setSelectedViewRequest(req)}
                        title="View details"
                      >
                        <MdVisibility size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="sl-pagination">
            <span className="sl-page-info">
              Showing {previousRequests.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, previousRequests.length)} of {previousRequests.length} results
            </span>
            <div className="sl-page-btns">
              <button
                className="sl-page-btn"
                disabled={currentPage <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <MdChevronLeft size={18} />
              </button>
              <button
                className="sl-page-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                <MdChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Details Modal */}
      {selectedViewRequest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setSelectedViewRequest(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                Leave Request Details
              </h3>
              <button
                onClick={() => setSelectedViewRequest(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                }}
              >
                <MdClose size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                    Leave Type
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: 600, color: '#111827' }}>
                    {selectedViewRequest.type}
                  </p>
                </div>
                <div>
                  <span className={`sl-badge sl-badge-${selectedViewRequest.status.toLowerCase()}`}>
                    {selectedViewRequest.status}
                  </span>
                </div>
              </div>

              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                  Duration / Date
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#374151' }}>
                  {selectedViewRequest.dateRange} ({selectedViewRequest.duration})
                </p>
              </div>

              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                  Reason
                </p>
                <p
                  style={{
                    margin: '6px 0 0',
                    fontSize: '14px',
                    color: '#374151',
                    backgroundColor: '#f9fafb',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #f3f4f6',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {selectedViewRequest.reason || 'No detailed reason provided.'}
                </p>
              </div>

              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                  Supporting Document
                </p>
                {selectedViewRequest.attachment ? (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '12px 16px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <MdInsertDriveFile size={22} color="#4f46e5" />
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#1e293b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {selectedViewRequest.attachment.name}
                        </p>
                        {selectedViewRequest.attachment.size && (
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                            {selectedViewRequest.attachment.size}
                          </p>
                        )}
                      </div>
                    </div>
                    <a
                      href={selectedViewRequest.attachment.dataUrl}
                      download={selectedViewRequest.attachment.name}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        backgroundColor: '#4f46e5',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        textDecoration: 'none',
                        flexShrink: 0,
                      }}
                    >
                      <MdFileDownload size={15} /> Download
                    </a>
                  </div>
                ) : (
                  <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>
                    No supporting documents attached to this request.
                  </p>
                )}
              </div>
            </div>

            <div
              style={{
                padding: '14px 24px',
                backgroundColor: '#f9fafb',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setSelectedViewRequest(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#374151',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

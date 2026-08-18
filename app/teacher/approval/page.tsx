'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/AuthContext'
import TopbarRight from '@/app/components/TopbarRight'
import {
  MdSearch,
  MdFilterList,
  MdCheckCircle,
  MdCancel,
  MdEvent,
  MdNotifications,
  MdInsertDriveFile,
  MdFileDownload,
} from 'react-icons/md'

interface LeaveRequestItem {
  id: string
  name: string
  avatar: string
  color: string
  type: string
  typeColor: string
  dates: string
  note: string
  status: 'pending' | 'approved' | 'rejected'
  detail: string
  attachment?: {
    name: string
    size?: string
    dataUrl: string
    type?: string
  } | null
  reviewedAt?: Date
}

const colorPalette = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6']

function getInitials(name: string): string {
  if (!name) return 'ST'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function getColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colorPalette[Math.abs(hash) % colorPalette.length]!
}

function getTypeColor(type: string): string {
  switch (type?.toLowerCase()) {
    case 'medical':
    case 'sick leave':
    case 'sick':
      return '#3b82f6'
    case 'family':
    case 'family emergency':
      return '#10b981'
    case 'academic':
    case 'academic activity':
      return '#8b5cf6'
    default:
      return '#f59e0b'
  }
}

export default function ApprovalPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<LeaveRequestItem[]>([])
  const [approved, setApproved] = useState<LeaveRequestItem[]>([])
  const [rejected, setRejected] = useState<LeaveRequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (!user) return

    const q = query(collection(db, 'leaveRequests'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const all: LeaveRequestItem[] = snapshot.docs.map(d => {
        const data = d.data()
        const sName = data.studentName || 'Student'
        const datesFormatted = data.startDate && data.endDate && data.startDate !== data.endDate
          ? `${data.startDate} - ${data.endDate}`
          : data.startDate || 'Single Day'

        return {
          id: d.id,
          name: sName,
          avatar: getInitials(sName),
          color: getColor(data.studentId || d.id),
          type: data.type || 'Leave',
          typeColor: getTypeColor(data.type),
          dates: datesFormatted,
          note: data.reason || 'No description provided.',
          status: (data.status || 'pending').toLowerCase() as 'pending' | 'approved' | 'rejected',
          detail: `${data.type || 'Leave'} • ${datesFormatted}`,
          attachment: data.attachment || null,
        }
      })

      const pendingList = all.filter(r => r.status === 'pending')
      const approvedList = all.filter(r => r.status === 'approved')
      const rejectedList = all.filter(r => r.status === 'rejected')

      setRequests(pendingList)
      setApproved(approvedList)
      setRejected(rejectedList)
      setLoading(false)
    }, (err) => {
      console.error('Error fetching leave requests:', err)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [authLoading, router, user])

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

  const filteredRequests = requests.filter(r =>
    search === '' ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase()) ||
    r.note.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {/* Header */}
      <header className="td-topbar">
        <div className="sm-header-search">
          <MdSearch size={16} color="#9ca3af" />
          <input
            placeholder="Search requests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <TopbarRight defaultRole="Teacher" />
      </header>

      {/* Content */}
      <div className="td-content">
        {/* Page heading */}
        <div className="lr-head-row">
          <div>
            <h1 className="sm-title">Leave Approvals</h1>
            <p className="lr-sub">
              Manage and review <span>student absence</span> requests.
            </p>
          </div>
          <button className="lr-filter-btn">
            <MdFilterList size={16} /> Filter
          </button>
        </div>

        {/* Two-column layout */}
        <div className="lr-grid">
          {/* Pending Approvals */}
          <div className="lr-pending-card">
            <div className="lr-card-header">
              <span className="lr-card-title">
                🕐 Pending Approvals
              </span>
              {requests.length > 0 && (
                <span className="lr-pending-badge">{requests.length} Pending</span>
              )}
            </div>

            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                Loading leave requests...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="lr-empty">
                <MdCheckCircle size={32} color="#10b981" />
                <p>All caught up! No pending requests.</p>
              </div>
            ) : (
              filteredRequests.map((req) => (
                <div key={req.id} className="lr-request-item">
                  <div className="lr-request-top">
                    <div className="lr-student-info">
                      <div className="lr-avatar" style={{ background: req.color }}>
                        {req.avatar}
                      </div>
                      <div>
                        <p className="lr-student-name">{req.name}</p>
                        <div className="lr-meta">
                          <span className="lr-type-badge" style={{ background: `${req.typeColor}20`, color: req.typeColor }}>
                            {req.type}
                          </span>
                          <span className="lr-date">
                            <MdEvent size={12} /> {req.dates}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="lr-note">{req.note}</p>
                  {req.attachment && (
                    <div style={{ margin: '8px 0 12px' }}>
                      <a
                        href={req.attachment.dataUrl}
                        download={req.attachment.name}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          backgroundColor: '#eef2ff',
                          color: '#4f46e5',
                          fontSize: '12px',
                          fontWeight: 500,
                          borderRadius: '6px',
                          textDecoration: 'none',
                          border: '1px solid #c7d2fe',
                        }}
                      >
                        <MdInsertDriveFile size={15} />
                        <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {req.attachment.name}
                        </span>
                        <MdFileDownload size={14} />
                      </a>
                    </div>
                  )}
                  <div className="lr-actions">
                    <button
                      className="lr-approve-btn"
                      onClick={() => handleAction(req.id, 'approved')}
                    >
                      <MdCheckCircle size={15} /> Approve
                    </button>
                    <button
                      className="lr-reject-btn"
                      onClick={() => handleAction(req.id, 'rejected')}
                    >
                      <MdCancel size={15} /> Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right column */}
          <div className="lr-right">
            {/* Recently Approved */}
            <div className="lr-side-card">
              <div className="lr-side-header lr-approved-header">
                <MdCheckCircle size={16} color="#10b981" />
                <span>Recently Approved</span>
              </div>
              {approved.length === 0 ? (
                <p style={{ padding: '16px', fontSize: '13px', color: '#9ca3af', margin: 0 }}>No approved requests yet.</p>
              ) : (
                approved.slice(0, 5).map((a) => (
                  <div key={a.id} className="lr-side-item">
                    <div className="lr-side-avatar" style={{ background: a.color }}>{a.avatar}</div>
                    <div>
                      <p className="lr-side-name">{a.name}</p>
                      <p className="lr-side-detail">{a.detail}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recently Rejected */}
            <div className="lr-side-card">
              <div className="lr-side-header lr-rejected-header">
                <MdCancel size={16} color="#ef4444" />
                <span>Recently Rejected</span>
              </div>
              {rejected.length === 0 ? (
                <p style={{ padding: '16px', fontSize: '13px', color: '#9ca3af', margin: 0 }}>No rejected requests yet.</p>
              ) : (
                rejected.slice(0, 5).map((r) => (
                  <div key={r.id} className="lr-side-item">
                    <div className="lr-side-avatar" style={{ background: r.color }}>{r.avatar}</div>
                    <div>
                      <p className="lr-side-name">{r.name}</p>
                      <p className="lr-side-detail">{r.detail}</p>
                      {r.note && (
                        <p className="lr-side-note">{r.note}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

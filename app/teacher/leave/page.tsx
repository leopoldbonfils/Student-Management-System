'use client'

import React, { useState } from 'react'
import {
  MdSearch, MdFilterList,
  MdCheckCircle, MdCancel, MdEvent
} from 'react-icons/md'

type ReqStatus = 'Pending' | 'Approved' | 'Rejected'

const initialPending = [
  {
    id: 1,
    name: 'Alex Chen',
    avatar: 'AC',
    color: '#6b7280',
    avatarImg: true,
    type: 'Medical',
    typeColor: '#3b82f6',
    dates: 'Oct 24 - Oct 26',
    note: 'Recovering from seasonal flu. Doctor\'s note attached to portal profile.',
    status: 'Pending' as ReqStatus,
  },
  {
    id: 2,
    name: 'Sarah Jenkins',
    avatar: 'SJ',
    color: '#4f46e5',
    avatarImg: false,
    type: 'Family',
    typeColor: '#10b981',
    dates: 'Oct 28 (Half Day)',
    note: 'Attending sister\'s college graduation ceremony in the afternoon.',
    status: 'Pending' as ReqStatus,
  },
]

const approvedList = [
  { name: 'David Kim',    avatar: 'DK', color: '#6366f1', detail: 'Dental Appt • Yesterday' },
  { name: 'Maria Garcia', avatar: 'MG', color: '#10b981', detail: 'Medical • Oct 20' },
]

const rejectedList = [
  { name: 'Tyler Jones', avatar: 'TJ', color: '#ef4444', detail: 'Vacation • Oct 18', note: 'Missing parental form' },
]

export default function TeacherLeaveRequests() {
  const [requests, setRequests]   = useState(initialPending)
  const [approved, setApproved]   = useState(approvedList)
  const [rejected, setRejected]   = useState(rejectedList)

  const handleAction = (id: number, action: 'Approved' | 'Rejected') => {
    const req = requests.find(r => r.id === id)
    if (!req) return

    setRequests(prev => prev.filter(r => r.id !== id))

    const entry = { name: req.name, avatar: req.avatar, color: req.color, detail: `${req.type} • ${req.dates}` }
    if (action === 'Approved') {
      setApproved(prev => [entry, ...prev])
    } else {
      setRejected(prev => [{ ...entry, note: 'Manually rejected' }, ...prev])
    }
  }

  return (
    <>
      {/* Header */}
      <header className="td-topbar">
        <div className="sm-header-search">
          <MdSearch size={16} color="#9ca3af" />
          <input placeholder="Search requests..." />
        </div>
      </header>

      {/* Content */}
      <div className="td-content">
        {/* Page heading */}
        <div className="lr-head-row">
          <div>
            <h1 className="sm-title">Leave Requests</h1>
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

            {requests.length === 0 && (
              <div className="lr-empty">
                <MdCheckCircle size={32} color="#10b981" />
                <p>All caught up! No pending requests.</p>
              </div>
            )}

            {requests.map((req) => (
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
                <div className="lr-actions">
                  <button
                    className="lr-approve-btn"
                    onClick={() => handleAction(req.id, 'Approved')}
                  >
                    <MdCheckCircle size={15} /> Approve
                  </button>
                  <button
                    className="lr-reject-btn"
                    onClick={() => handleAction(req.id, 'Rejected')}
                  >
                    <MdCancel size={15} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right column */}
          <div className="lr-right">
            {/* Recently Approved */}
            <div className="lr-side-card">
              <div className="lr-side-header lr-approved-header">
                <MdCheckCircle size={16} color="#10b981" />
                <span>Recently Approved</span>
              </div>
              {approved.map((a, i) => (
                <div key={i} className="lr-side-item">
                  <div className="lr-side-avatar" style={{ background: a.color }}>{a.avatar}</div>
                  <div>
                    <p className="lr-side-name">{a.name}</p>
                    <p className="lr-side-detail">{a.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recently Rejected */}
            <div className="lr-side-card">
              <div className="lr-side-header lr-rejected-header">
                <MdCancel size={16} color="#ef4444" />
                <span>Recently Rejected</span>
              </div>
              {rejected.map((r, i) => (
                <div key={i} className="lr-side-item">
                  <div className="lr-side-avatar" style={{ background: r.color }}>{r.avatar}</div>
                  <div>
                    <p className="lr-side-name">{r.name}</p>
                    <p className="lr-side-detail">{r.detail}</p>
                    {'note' in r && r.note && (
                      <p className="lr-side-note">{r.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

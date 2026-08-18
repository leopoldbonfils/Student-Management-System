'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { collection, query, where,onSnapshot,} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/AuthContext'
import TopbarRight from '@/app/components/TopbarRight'
import {
  MdSearch,
  MdCheckCircle,
  MdChevronLeft, MdChevronRight
} from 'react-icons/md'

interface AttendanceRecord {
  id: string
  date: string
  class: string
  status: 'Present' | 'Absent' | 'Late'
}

export default function StudentAttendancePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [activePage, setPage] = useState(1)
  const pageSize = 8

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (!user) return

    const q = query(
      collection(db, 'attendance'),
      where('studentId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: AttendanceRecord[] = snapshot.docs.map(doc => {
        const data = doc.data()
        const rawStatus = data.status || 'present'
        const normalizedStatus =
          rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase()

        return {
          id: doc.id,
          date: data.date || '',
          class: data.class || profile?.assignedClass || 'General Class',
          status: normalizedStatus as 'Present' | 'Absent' | 'Late',
        }
      })

      // Sort by date descending
      list.sort((a, b) => b.date.localeCompare(a.date))
      setRecords(list)
      setLoading(false)
    }, (err) => {
      console.error('Error fetching student attendance:', err)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, profile, authLoading, router])

  const totalDays = records.length
  const presentDays = records.filter(r => r.status === 'Present').length
  const absentDays = records.filter(r => r.status === 'Absent').length
  const lateDays = records.filter(r => r.status === 'Late').length
  const attendanceRate = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 100

  const filteredRecords = records.filter(r => {
    const matchesSearch =
      search === '' ||
      r.date.toLowerCase().includes(search.toLowerCase()) ||
      r.class.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === '' || r.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1
  const currentPage = Math.min(activePage, totalPages)
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const getStatusBadge = (status: 'Present' | 'Absent' | 'Late') => {
    if (status === 'Present') {
      return <span className="sl-badge sl-badge-approved">Present</span>
    }
    if (status === 'Absent') {
      return <span className="sl-badge sl-badge-rejected">Absent</span>
    }
    return <span className="sl-badge sl-badge-pending">Late</span>
  }

  return (
    <>
      {/* Header */}
      <header className="db-header">
        <div className="sl-breadcrumb">
          <span className="sl-brand">EduPortal</span>
          <span className="sl-sep">&rsaquo;</span>
          <span className="sl-crumb">Attendance</span>
          <span className="sl-sep">&rsaquo;</span>
          <span className="sl-crumb sl-crumb-active">My Attendance</span>
        </div>
        <div className="db-search" style={{ maxWidth: 240 }}>
          <MdSearch size={16} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search dates, classes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <TopbarRight defaultRole="Student" />
      </header>

      {/* Content */}
      <div className="db-content">
        {/* Page heading */}
        <div className="sl-page-head">
          <div>
            <h1 className="sl-title">My Attendance Record</h1>
            <p className="sl-sub">Review your attendance status marked by your teachers.</p>
          </div>
          <div className="sl-days-badge">
            <MdCheckCircle size={16} color="#10b981" />
            Attendance Rate: <strong>{attendanceRate}%</strong>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="at-stat-card">
            <p className="at-stat-label">Total Days Marked</p>
            <p className="at-stat-val">{totalDays}</p>
          </div>
          <div className="at-stat-card">
            <p className="at-stat-label at-green">Present</p>
            <p className="at-stat-val at-green">{presentDays}</p>
          </div>
          <div className="at-stat-card">
            <p className="at-stat-label at-red">Absent</p>
            <p className="at-stat-val at-red">{absentDays}</p>
          </div>
          <div className="at-stat-card">
            <p className="at-stat-label at-orange">Late</p>
            <p className="at-stat-val at-orange">{lateDays}</p>
          </div>
        </div>

        {/* Attendance History Card */}
        <div className="sl-history-card">
          <div className="sl-history-head">
            <div>
              <h2 className="sl-history-title">Attendance History</h2>
              <p className="sl-history-sub">Detailed log of each day marked by faculty.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                className="sl-select"
                style={{ padding: '6px 12px', fontSize: '13px' }}
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value="present">Present Only</option>
                <option value="absent">Absent Only</option>
                <option value="late">Late Only</option>
              </select>
            </div>
          </div>

          <table className="sl-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Class / Course</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                    Loading attendance records...
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec) => (
                  <tr key={rec.id}>
                    <td>
                      <p className="sl-date-main">{rec.date}</p>
                    </td>
                    <td>{rec.class}</td>
                    <td>{getStatusBadge(rec.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="sl-pagination">
            <span className="sl-page-info">
              Showing {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} results
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
    </>
  )
}

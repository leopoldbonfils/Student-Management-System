'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/AuthContext'
import {
  MdSearch, MdPersonAdd,
  MdChevronLeft, MdChevronRight
} from 'react-icons/md'

interface StudentRecord {
  uid: string
  name: string
  email: string
  studentId: string
  assignedClass: string
  status: string
  attendance: number
  avatar: string
  color: string
}

const colorPalette = ['#10b981', '#f59e0b', '#6366f1', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6']

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

function AttendanceBar({ value }: { value: number }) {
  const color = value >= 90 ? '#10b981' : value >= 80 ? '#f59e0b' : '#ef4444'
  return (
    <div className="sm-att-wrap">
      <span className="sm-att-val" style={{ color }}>{value}%</span>
      <div className="sm-att-track">
        <div className="sm-att-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}

export default function StudentsManagement() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [studentsList, setStudentsList] = useState<StudentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [classFilter, setClass] = useState('')
  const [statusFilter, setStatus] = useState('')
  const [activePage, setPage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (!user) return

    // 1. Listen to all students in Firestore
    const q = query(collection(db, 'users'), where('role', '==', 'student'))
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const rawStudents = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as any[]

      // 2. Fetch attendance data to compute real attendance percentage for each student
      let attendanceMap: Record<string, { present: number; total: number }> = {}
      try {
        const attSnapshot = await getDocs(collection(db, 'attendance'))
        attSnapshot.forEach(doc => {
          const data = doc.data()
          const sId = data.studentId
          if (!attendanceMap[sId]) {
            attendanceMap[sId] = { present: 0, total: 0 }
          }
          attendanceMap[sId]!.total += 1
          if (data.status === 'present') {
            attendanceMap[sId]!.present += 1
          }
        })
      } catch (err) {
        console.error('Error fetching attendance overview:', err)
      }

      const formatted: StudentRecord[] = rawStudents.map((s) => {
        const att = attendanceMap[s.uid]
        const attPercent = att && att.total > 0 ? Math.round((att.present / att.total) * 100) : 100
        return {
          uid: s.uid,
          name: s.name || 'Unnamed Student',
          email: s.email || '',
          studentId: s.studentId || s.uid.slice(0, 8).toUpperCase(),
          assignedClass: s.assignedClass || 'Unassigned',
          status: 'Active',
          attendance: attPercent,
          avatar: getInitials(s.name),
          color: getColor(s.uid),
        }
      })

      setStudentsList(formatted)
      setLoading(false)
    }, (err) => {
      console.error('Error listening to students:', err)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Filter students
  const filteredStudents = studentsList.filter((s) => {
    const matchesSearch =
      search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase())

    const matchesClass =
      classFilter === '' ||
      s.assignedClass.toLowerCase().includes(classFilter.toLowerCase())

    const matchesStatus =
      statusFilter === '' || s.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesClass && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1
  const currentPage = Math.min(activePage, totalPages)
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <>
      {/* Header */}
      <header className="td-topbar">
        <div className="sm-header-search">
          <MdSearch size={16} color="#9ca3af" />
          <input
            placeholder="Search EduPortal..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Content */}
      <div className="td-content">
        {/* Page heading */}
        <div className="sm-page-head">
          <div>
            <h1 className="sm-title">Students Management</h1>
            <p className="sm-sub">Manage and overview student records.</p>
          </div>
          <Link href="/teacher/add-student" style={{ textDecoration: 'none' }}>
            <button className="sm-add-btn">
              <MdPersonAdd size={18} /> + Add Student
            </button>
          </Link>
        </div>

        {/* Two-column: filters + table */}
        <div className="sm-layout">
          {/* Filters panel */}
          <aside className="sm-filters">
            <h2 className="sm-filter-title">Filters</h2>

            <div className="sm-filter-group">
              <label className="sm-filter-label">Search Student</label>
              <div className="sm-filter-search">
                <MdSearch size={14} color="#9ca3af" />
                <input
                  placeholder="Name, ID, Email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="sm-filter-group">
              <label className="sm-filter-label">Class / Course</label>
              <select
                className="sm-filter-select"
                value={classFilter}
                onChange={e => setClass(e.target.value)}
              >
                <option value="">All Classes</option>
                <option value="React Native">React Native</option>
                <option value="Django">Django</option>
                <option value="cybersecurity">cybersecurity</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Grade 10 - Mathematics">Grade 10 - Mathematics</option>
              </select>
            </div>

            <div className="sm-filter-group">
              <label className="sm-filter-label">Status</label>
              <select
                className="sm-filter-select"
                value={statusFilter}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="Warning">Warning</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <div className="sm-filter-actions">
              <button
                className="sm-reset-btn"
                onClick={() => { setSearch(''); setClass(''); setStatus('') }}
              >
                Reset
              </button>
              <button className="sm-apply-btn" onClick={() => setPage(1)}>Apply</button>
            </div>
          </aside>

          {/* Table */}
          <div className="sm-table-card">
            <table className="sm-table">
              <thead>
                <tr>
                  <th>STUDENT NAME</th>
                  <th>ID</th>
                  <th>CLASS</th>
                  <th>ATTENDANCE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                      Loading student records...
                    </td>
                  </tr>
                ) : paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                      No students found.
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((s) => (
                    <tr key={s.uid}>
                      <td>
                        <div className="sm-student-cell">
                          <div className="sm-avatar" style={{ background: s.color }}>
                            {s.avatar}
                          </div>
                          <div>
                            <p className="sm-name">{s.name}</p>
                            <p className="sm-email">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="sm-id">{s.studentId}</td>
                      <td>{s.assignedClass}</td>
                      <td><AttendanceBar value={s.attendance} /></td>
                      <td>
                        <span className={`sm-badge sm-badge-${s.status.toLowerCase()}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="sm-pagination">
              <span className="sm-page-info">
                Showing {filteredStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                {Math.min(currentPage * pageSize, filteredStudents.length)} of{' '}
                <strong>{filteredStudents.length}</strong> results
              </span>
              <div className="sm-page-btns">
                <button
                  className="sm-page-btn"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <MdChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    className={`sm-page-btn ${currentPage === n ? 'sm-page-active' : ''}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  className="sm-page-btn"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  <MdChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

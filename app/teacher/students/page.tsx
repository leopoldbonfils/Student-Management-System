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
  MdChevronLeft, MdChevronRight,
  MdEdit, MdDelete, MdClose,
  MdCheckCircle, MdError, MdWarning
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
  phone?: string
  gender?: string
  dob?: string
  address?: string
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

  // Edit / Delete modal states
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    studentId: '',
    assignedClass: '',
    phone: '',
    gender: '',
    dob: '',
    address: '',
    status: 'Active',
  })
  const [deletingStudent, setDeletingStudent] = useState<StudentRecord | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

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
          status: s.status || 'Active',
          attendance: attPercent,
          avatar: getInitials(s.name),
          color: getColor(s.uid),
          phone: s.phone || '',
          gender: s.gender || '',
          dob: s.dob || '',
          address: s.address || '',
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

  // Open Edit Modal
  const handleOpenEdit = (student: StudentRecord) => {
    setEditingStudent(student)
    setEditForm({
      name: student.name,
      studentId: student.studentId,
      assignedClass: student.assignedClass,
      phone: student.phone || '',
      gender: student.gender || '',
      dob: student.dob || '',
      address: student.address || '',
      status: student.status || 'Active',
    })
  }

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingStudent) return
    if (!editForm.name.trim()) {
      setNotification({ type: 'error', message: 'Student name cannot be empty.' })
      return
    }

    setActionLoading(true)
    try {
      const res = await fetch('/api/update-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: editingStudent.uid,
          ...editForm,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update student.')

      setNotification({ type: 'success', message: `${editForm.name} updated successfully!` })
      setEditingStudent(null)
      setTimeout(() => setNotification(null), 4000)
    } catch (err: any) {
      console.error('Error updating student:', err)
      setNotification({ type: 'error', message: err.message || 'Failed to update student.' })
    } finally {
      setActionLoading(false)
    }
  }

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingStudent) return

    setActionLoading(true)
    try {
      const res = await fetch('/api/delete-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: deletingStudent.uid }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete student.')

      setNotification({ type: 'success', message: `${deletingStudent.name} deleted successfully.` })
      setDeletingStudent(null)
      setTimeout(() => setNotification(null), 4000)
    } catch (err: any) {
      console.error('Error deleting student:', err)
      setNotification({ type: 'error', message: err.message || 'Failed to delete student.' })
    } finally {
      setActionLoading(false)
    }
  }

  // Filter students
  const filteredStudents = studentsList.filter((s) => {
    const matchesSearch =
      search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase())

    const matchesClass = classFilter === '' || s.assignedClass.toLowerCase() === classFilter.toLowerCase()
    const matchesStatus = statusFilter === '' || s.status.toLowerCase() === statusFilter.toLowerCase()

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
        {/* Notifications / Toast */}
        {notification && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: notification.type === 'success' ? '#065f46' : '#991b1b',
            backgroundColor: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${notification.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            padding: '12px 18px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '20px'
          }}>
            {notification.type === 'success' ? (
              <MdCheckCircle size={20} color="#10b981" />
            ) : (
              <MdError size={20} color="#ef4444" />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            >
              <MdClose size={18} />
            </button>
          </div>
        )}

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
                  <th style={{ textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                      Loading student records...
                    </td>
                  </tr>
                ) : paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
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
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            style={{
                              border: '1px solid #c7d2fe',
                              background: '#eef2ff',
                              color: '#4338ca',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '12px',
                              fontWeight: 600,
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.backgroundColor = '#4338ca'
                              e.currentTarget.style.color = '#ffffff'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.backgroundColor = '#eef2ff'
                              e.currentTarget.style.color = '#4338ca'
                            }}
                          >
                            <MdEdit size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setDeletingStudent(s)}
                            style={{
                              border: '1px solid #fecaca',
                              background: '#fef2f2',
                              color: '#dc2626',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '12px',
                              fontWeight: 600,
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.backgroundColor = '#dc2626'
                              e.currentTarget.style.color = '#ffffff'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.backgroundColor = '#fef2f2'
                              e.currentTarget.style.color = '#dc2626'
                            }}
                          >
                            <MdDelete size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
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

      {/* Edit Student Modal */}
      {editingStudent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(2px)',
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Edit Student Details
                </h3>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>
                  {editingStudent.email}
                </p>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
              >
                <MdClose size={20} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="as-input"
                  style={{ width: '100%' }}
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>
                    Student ID
                  </label>
                  <input
                    type="text"
                    className="as-input"
                    style={{ width: '100%' }}
                    value={editForm.studentId}
                    onChange={e => setEditForm({ ...editForm, studentId: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    className="as-select"
                    style={{ width: '100%' }}
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Warning">Warning</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>
                    Assigned Class
                  </label>
                  <select
                    className="as-select"
                    style={{ width: '100%' }}
                    value={editForm.assignedClass}
                    onChange={e => setEditForm({ ...editForm, assignedClass: e.target.value })}
                  >
                    <option value="React Native">React Native</option>
                    <option value="Django">Django</option>
                    <option value="cybersecurity">cybersecurity</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Grade 10 - Mathematics">Grade 10 - Mathematics</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="as-input"
                    style={{ width: '100%' }}
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>
                    Gender
                  </label>
                  <select
                    className="as-select"
                    style={{ width: '100%' }}
                    value={editForm.gender}
                    onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className="as-input"
                    style={{ width: '100%' }}
                    value={editForm.dob}
                    onChange={e => setEditForm({ ...editForm, dob: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>
                  Address
                </label>
                <textarea
                  className="as-textarea"
                  rows={2}
                  style={{ width: '100%' }}
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>
            </div>

            <div style={{
              padding: '12px 20px',
              backgroundColor: '#f9fafb',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
            }}>
              <button
                className="sl-cancel-btn"
                onClick={() => setEditingStudent(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="as-save-btn"
                onClick={handleSaveEdit}
                disabled={actionLoading}
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(2px)',
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            overflow: 'hidden',
            padding: '24px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <MdWarning size={28} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>
              Delete Student?
            </h3>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong>{deletingStudent.name}</strong> ({deletingStudent.email})? This will remove their account, login access, attendance records, and leave requests.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                className="sl-cancel-btn"
                onClick={() => setDeletingStudent(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 18px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dc2626'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ef4444'}
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

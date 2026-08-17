'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/AuthContext'
import { MdSearch, MdSave } from 'react-icons/md'

type AttStatus = 'Present' | 'Absent' | 'Late'

interface StudentAttendanceItem {
  id: string
  studentIdStr: string
  avatar: string
  color: string
  name: string
  assignedClass?: string
  status: AttStatus
}

const colorPalette = ['#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#14b8a6']

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

export default function MarkAttendance() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const todayStr = new Date().toISOString().split('T')[0]!
  const [classVal, setClassVal] = useState('') // Default: All Classes
  const [dateVal, setDateVal] = useState(todayStr)
  const [students, setStudents] = useState<StudentAttendanceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (!user) return

    async function loadAttendanceData() {
      setLoading(true)
      try {
        // 1. Fetch all students from users collection
        const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'))
        const studentSnap = await getDocs(studentsQuery)

        const studentList: { uid: string; name: string; studentId: string; assignedClass?: string }[] = []
        studentSnap.forEach(doc => {
          const data = doc.data()
          studentList.push({
            uid: doc.id,
            name: data.name || 'Student',
            studentId: data.studentId || doc.id.slice(0, 6).toUpperCase(),
            assignedClass: data.assignedClass || 'General',
          })
        })

        // 2. Fetch existing attendance records for the selected date
        const attQuery = query(collection(db, 'attendance'), where('date', '==', dateVal))
        const attSnap = await getDocs(attQuery)
        const attMap: Record<string, AttStatus> = {}
        attSnap.forEach(doc => {
          const data = doc.data()
          if (data.studentId && data.status) {
            const normalized =
              data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase()
            attMap[data.studentId] = normalized as AttStatus
          }
        })

        // Filter by class if specific class chosen, otherwise show all enrolled students
        const filteredByClass = classVal
          ? studentList.filter(s => s.assignedClass?.toLowerCase() === classVal.toLowerCase())
          : studentList

        const finalStudents: StudentAttendanceItem[] = filteredByClass.map(s => {
          const existingStatus = attMap[s.uid]
          return {
            id: s.uid,
            studentIdStr: s.studentId,
            avatar: getInitials(s.name),
            color: getColor(s.uid),
            name: s.name,
            assignedClass: s.assignedClass,
            status: existingStatus || 'Present',
          }
        })

        setStudents(finalStudents)
      } catch (err) {
        console.error('Error loading attendance list:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAttendanceData()
  }, [classVal, dateVal])

  const setStatus = (id: string, status: AttStatus) => {
    setSaved(false)
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s))
  }

  const markAllPresent = () => {
    setSaved(false)
    setStudents(prev => prev.map(s => ({ ...s, status: 'Present' as AttStatus })))
  }

  const handleSaveAttendance = async () => {
    try {
      // Save each student's attendance to Firestore for all students at once
      for (const s of students) {
        if (!s.status) continue
        const docId = `${s.id}_${dateVal}`
        const attRef = doc(db, 'attendance', docId)
        await setDoc(attRef, {
          studentId: s.id,
          studentName: s.name,
          class: s.assignedClass || classVal || 'General',
          date: dateVal,
          status: s.status.toLowerCase(),
          teacherId: user?.uid || '',
          updatedAt: serverTimestamp(),
        }, { merge: true })
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error saving attendance:', err)
      alert('Failed to save attendance.')
    }
  }

  const filteredStudents = students.filter(s =>
    search === '' ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.studentIdStr.toLowerCase().includes(search.toLowerCase()) ||
    (s.assignedClass && s.assignedClass.toLowerCase().includes(search.toLowerCase()))
  )

  const present = students.filter(s => s.status === 'Present').length
  const absent = students.filter(s => s.status === 'Absent').length
  const late = students.filter(s => s.status === 'Late').length
  const totalEnrolled = students.length

  return (
    <>
      {/* Header */}
      <header className="td-topbar">
        <div className="sm-header-search">
          <MdSearch size={16} color="#9ca3af" />
          <input
            placeholder="Search students, classes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Content */}
      <div className="td-content">
        {/* Page heading row */}
        <div className="at-head-row">
          <div>
            <h1 className="sm-title">Mark Attendance</h1>
            <p className="at-sub">Take attendance for all enrolled students at once.</p>
          </div>
          <div className="at-controls">
            <div className="at-control-group">
              <label className="at-ctrl-label">Class</label>
              <select
                className="at-select"
                value={classVal}
                onChange={e => setClassVal(e.target.value)}
              >
                <option value="">All Students</option>
                <option value="React Native">React Native</option>
                <option value="Django">Django</option>
                <option value="cybersecurity">cybersecurity</option>
                <option value="UI/UX Design">UI/UX Design</option>
              </select>
            </div>
            <div className="at-control-group">
              <label className="at-ctrl-label">Date</label>
              <input
                type="date"
                className="at-date-input"
                value={dateVal}
                onChange={e => setDateVal(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="at-stats">
          <div className="at-stat-card">
            <p className="at-stat-label">Total Enrolled</p>
            <p className="at-stat-val">{totalEnrolled}</p>
          </div>
          <div className="at-stat-card">
            <p className="at-stat-label at-green">Present</p>
            <p className="at-stat-val at-green">{present}</p>
          </div>
          <div className="at-stat-card">
            <p className="at-stat-label at-red">Absent</p>
            <p className="at-stat-val at-red">{absent}</p>
          </div>
          <div className="at-stat-card">
            <p className="at-stat-label at-orange">Late/Excused</p>
            <p className="at-stat-val at-orange">{late}</p>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="at-table-card">
          {/* Table header */}
          <div className="at-table-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div className="at-col-id">ID</div>
              <div className="at-col-name">Student Name & Course</div>
            </div>
            <div className="at-col-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button className="at-mark-all" onClick={markAllPresent}>
                Mark All Present
              </button>
              <button
                className={`at-save-btn ${saved ? 'at-saved' : ''}`}
                onClick={handleSaveAttendance}
                disabled={loading || students.length === 0}
                style={{ padding: '6px 14px', fontSize: '12px' }}
              >
                <MdSave size={15} />
                {saved ? 'Saved!' : 'Save Attendance'}
              </button>
            </div>
          </div>

          {/* Scrollable Rows Container */}
          <div className="at-table-body">
            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                Loading attendance records...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                No students found. Add students first using the Add Student page.
              </div>
            ) : (
              filteredStudents.map((s) => (
                <div key={s.id} className="at-row">
                  <div className="at-col-id at-id-text">{s.studentIdStr}</div>
                  <div className="at-col-name">
                    <div className="at-student-cell">
                      <div className="at-avatar" style={{ background: s.color }}>{s.avatar}</div>
                      <div>
                        <span className="at-name">{s.name}</span>
                        {s.assignedClass && (
                          <span style={{
                            display: 'inline-block',
                            marginLeft: '8px',
                            fontSize: '11px',
                            color: '#4f46e5',
                            backgroundColor: '#eef2ff',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 500
                          }}>
                            {s.assignedClass}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="at-col-actions">
                    <div className="at-btn-group">
                      <button
                        className={`at-status-btn ${s.status === 'Present' ? 'at-present-active' : 'at-inactive'}`}
                        onClick={() => setStatus(s.id, 'Present')}
                      >
                        Present
                      </button>
                      <button
                        className={`at-status-btn ${s.status === 'Absent' ? 'at-absent-active' : 'at-inactive'}`}
                        onClick={() => setStatus(s.id, 'Absent')}
                      >
                        Absent
                      </button>
                      <button
                        className={`at-status-btn ${s.status === 'Late' ? 'at-late-active' : 'at-inactive'}`}
                        onClick={() => setStatus(s.id, 'Late')}
                      >
                        Late
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Save button */}
          <div className="at-footer">
            <button
              className={`at-save-btn ${saved ? 'at-saved' : ''}`}
              onClick={handleSaveAttendance}
              disabled={loading || students.length === 0}
            >
              <MdSave size={16} />
              {saved ? 'Saved!' : 'Save Attendance'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

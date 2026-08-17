'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/AuthContext'
import TopbarRight from '@/app/components/TopbarRight'
import {
  MdSearch,
  MdNotifications,
  MdHelpOutline,
  MdFileDownload,
  MdCheckCircle,
  MdEventAvailable,
  MdAssignment,
  MdCancel,
  MdAccessTime,
  MdBadge,
  MdClass,
  MdPerson,
  MdTrendingUp,
} from 'react-icons/md'

interface AttendanceHistoryItem {
  id: string
  date: string
  class: string
  status: 'Present' | 'Absent' | 'Late'
  note: string
}

export default function StudentReportPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [attendanceRate, setAttendanceRate] = useState(100)
  const [totalSessions, setTotalSessions] = useState(0)
  const [presentCount, setPresentCount] = useState(0)
  const [absentCount, setAbsentCount] = useState(0)
  const [lateCount, setLateCount] = useState(0)
  const [leaveCount, setLeaveCount] = useState(0)
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0)
  const [history, setHistory] = useState<AttendanceHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const studentName = profile?.name || user?.displayName || 'Student'
  const studentFirstName = studentName.split(' ')[0] || 'Student'
  const studentId = profile?.studentId || (user?.uid ? `STD-${user.uid.slice(0, 6).toUpperCase()}` : 'STD-2026')
  const assignedClass = profile?.assignedClass || 'React Native'

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (!user) return

    // 1. Fetch Real Attendance records for the authenticated student
    const attQuery = query(collection(db, 'attendance'), where('studentId', '==', user.uid))
    const unsubAtt = onSnapshot(attQuery, (snap) => {
      let p = 0
      let a = 0
      let l = 0
      const records: AttendanceHistoryItem[] = []

      snap.forEach((d) => {
        const data = d.data()
        const rawStatus = (data.status || 'present').toLowerCase()
        let normalizedStatus: 'Present' | 'Absent' | 'Late' = 'Present'

        if (rawStatus === 'present') {
          p++
          normalizedStatus = 'Present'
        } else if (rawStatus === 'absent') {
          a++
          normalizedStatus = 'Absent'
        } else if (rawStatus === 'late') {
          l++
          normalizedStatus = 'Late'
        }

        records.push({
          id: d.id,
          date: data.date || 'Recent',
          class: data.class || profile?.assignedClass || 'General',
          status: normalizedStatus,
          note: normalizedStatus === 'Present'
            ? 'Regular attendance verified'
            : normalizedStatus === 'Late'
            ? 'Late arrival recorded'
            : 'Unexcused absence',
        })
      })

      // Sort by date descending
      records.sort((x, y) => y.date.localeCompare(x.date))

      const total = p + a + l
      setTotalSessions(total)
      setPresentCount(p + l)
      setAbsentCount(a)
      setLateCount(l)
      setHistory(records)

      if (total > 0) {
        setAttendanceRate(Number((((p + l) / total) * 100).toFixed(1)))
      } else {
        setAttendanceRate(100.0)
      }
      setLoading(false)
    })

    // 2. Fetch Real Leave Requests for the authenticated student
    const leaveQuery = query(collection(db, 'leaveRequests'), where('studentId', '==', user.uid))
    const unsubLeave = onSnapshot(leaveQuery, (snap) => {
      let totalLeaves = 0
      let pending = 0

      snap.forEach((d) => {
        const data = d.data()
        totalLeaves++
        if (data.status?.toLowerCase() === 'pending') {
          pending++
        }
      })

      setLeaveCount(totalLeaves)
      setPendingLeaveCount(pending)
    })

    return () => {
      unsubAtt()
      unsubLeave()
    }
  }, [user, profile, authLoading, router])

  const filteredHistory = history.filter(h =>
    search === '' ||
    h.date.toLowerCase().includes(search.toLowerCase()) ||
    h.class.toLowerCase().includes(search.toLowerCase()) ||
    h.status.toLowerCase().includes(search.toLowerCase()) ||
    h.note.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {/* Top Header */}
      <header className="td-topbar">
        <div className="sm-header-search" style={{ width: '260px' }}>
          <MdSearch size={18} color="#9ca3af" />
          <input
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <TopbarRight defaultRole="Student" />
      </header>

      {/* Main Content Area */}
      <div className="td-content" style={{ gap: '18px' }}>
        {/* Page Title & Subtitle + Download PDF Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '4px',
          }}
        >
          <div>
            <h1 className="sm-title" style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
              My Student Report
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                <MdBadge size={16} color="#64748b" /> {studentId}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                <MdClass size={16} color="#64748b" /> Class: {assignedClass}
              </span>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#1e293b',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            <MdFileDownload size={16} />
            <span>Download PDF</span>
          </button>
        </div>

        {/* 4 Summary Stat Cards Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Card 1: ATTENDANCE RATE */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '18px 20px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', margin: 0 }}>
                ATTENDANCE RATE
              </p>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MdCheckCircle size={17} color="#10b981" />
              </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {attendanceRate}
              </span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>%</span>
            </div>

            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <MdTrendingUp size={14} /> {presentCount} of {totalSessions || '0'} sessions attended
            </span>
          </div>

          {/* Card 2: PRESENT SESSIONS */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '18px 20px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', margin: 0 }}>
                SESSIONS PRESENT
              </p>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#eef2ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MdEventAvailable size={17} color="#4338ca" />
              </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {presentCount}
              </span>
              <span style={{ fontSize: '13px', color: '#94a3b8', marginLeft: '4px' }}>days</span>
            </div>

            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
              {lateCount > 0 ? `${lateCount} late arrival(s)` : 'Punctual attendance'}
            </span>
          </div>

          {/* Card 3: ABSENT DAYS */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '18px 20px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', margin: 0 }}>
                TOTAL ABSENCES
              </p>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MdCancel size={17} color="#ef4444" />
              </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {absentCount}
              </span>
              <span style={{ fontSize: '13px', color: '#94a3b8', marginLeft: '4px' }}>days</span>
            </div>

            {/* Attendance Progress bar */}
            <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(attendanceRate, 100)}%`,
                  height: '100%',
                  backgroundColor: '#059669',
                  borderRadius: '2px',
                }}
              />
            </div>
          </div>

          {/* Card 4: LEAVE REQUESTS */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '18px 20px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', margin: 0 }}>
                LEAVE REQUESTS
              </p>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MdAssignment size={17} color="#0284c7" />
              </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {leaveCount}
              </span>
              <span style={{ fontSize: '13px', color: '#94a3b8', marginLeft: '4px' }}>total</span>
            </div>

            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
              {pendingLeaveCount > 0 ? `${pendingLeaveCount} pending review` : 'All applications processed'}
            </span>
          </div>
        </div>

        {/* Middle Section: Attendance Records (Left) + Attendance Trends & Student Details (Right) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '18px',
          }}
        >
          {/* Left: Attendance History Table Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Table Header Row */}
            <div
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Attendance & Activity Log
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {history.length} Total Recorded Sessions
              </span>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fcfcfd' }}>
                    <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      DATE
                    </th>
                    <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      CLASS / COURSE
                    </th>
                    <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>
                      STATUS
                    </th>
                    <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      REMARKS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                        Loading student records...
                      </td>
                    </tr>
                  ) : filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                        No attendance records recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.slice(0, 8).map((rec, idx) => (
                      <tr
                        key={rec.id || idx}
                        style={{
                          borderBottom: idx === filteredHistory.length - 1 ? 'none' : '1px solid #f8fafc',
                          transition: 'background 0.12s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                          {rec.date}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>
                          {rec.class}
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          {rec.status === 'Present' && (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '3px 10px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: 600,
                                backgroundColor: '#ecfdf5',
                                color: '#059669',
                              }}
                            >
                              Present
                            </span>
                          )}
                          {rec.status === 'Late' && (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '3px 10px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: 600,
                                backgroundColor: '#fef3c7',
                                color: '#b45309',
                              }}
                            >
                              Late
                            </span>
                          )}
                          {rec.status === 'Absent' && (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '3px 10px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: 600,
                                backgroundColor: '#fef2f2',
                                color: '#b91c1c',
                              }}
                            >
                              Absent
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b' }}>
                          {rec.note}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Attendance Trends & Student Overview Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Card 1: Attendance Consistency Graph */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '18px 20px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>
                Attendance Consistency
              </h3>

              {/* Chart SVG */}
              <div style={{ position: 'relative', height: '130px', width: '100%' }}>
                <svg width="100%" height="100%" viewBox="0 0 280 130" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                  {/* Grid Lines */}
                  <line x1="30" y1="20" x2="280" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="30" y1="50" x2="280" y2="50" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="30" y1="80" x2="280" y2="80" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="30" y1="105" x2="280" y2="105" stroke="#f1f5f9" strokeDasharray="3 3" />

                  {/* Y-axis Labels */}
                  <text x="0" y="24" fontSize="9" fill="#94a3b8">100%</text>
                  <text x="0" y="54" fontSize="9" fill="#94a3b8">75%</text>
                  <text x="0" y="84" fontSize="9" fill="#94a3b8">50%</text>
                  <text x="0" y="109" fontSize="9" fill="#94a3b8">25%</text>

                  {/* Area Fill */}
                  <path
                    d="M 45 40 Q 95 35 145 30 T 205 25 T 265 20 L 265 105 L 45 105 Z"
                    fill="url(#trendGradient)"
                    opacity="0.15"
                  />

                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4338ca" />
                      <stop offset="100%" stopColor="#4338ca" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Trend Line */}
                  <path
                    d="M 45 40 Q 95 35 145 30 T 205 25 T 265 20"
                    fill="none"
                    stroke="#4338ca"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Points */}
                  <circle cx="45" cy="40" r="3.5" fill="#4338ca" />
                  <circle cx="100" cy="36" r="3.5" fill="#4338ca" />
                  <circle cx="155" cy="30" r="3.5" fill="#4338ca" />
                  <circle cx="210" cy="25" r="3.5" fill="#4338ca" />
                  <circle cx="265" cy="20" r="4.5" fill="#4338ca" stroke="#ffffff" strokeWidth="2" />
                </svg>

                {/* X-axis Month Labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '32px', marginTop: '6px', fontSize: '10px', color: '#94a3b8' }}>
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
                  <span>Week 5</span>
                </div>
              </div>
            </div>

            {/* Card 2: Student Enrollment Status Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '18px 20px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#e0e7ff',
                    color: '#4338ca',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                >
                  {studentFirstName[0]?.toUpperCase() || 'S'}
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    {studentName}
                  </h4>
                  <p style={{ fontSize: '11px', color: '#10b981', margin: 0, fontWeight: 600 }}>
                    Verified Enrolled Student
                  </p>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 4px' }}>
                  Enrolled in <strong>{assignedClass}</strong> program. All attendance records and leave applications are managed live by faculty administration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

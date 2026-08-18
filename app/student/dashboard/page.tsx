'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {collection,query,where,onSnapshot,} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/AuthContext'
import TopbarRight from '@/app/components/TopbarRight'
import {
  MdMenu, MdGroups, MdFlightTakeoff, MdDescription, MdVerified
} from 'react-icons/md'

interface StudentLeaveRecord {
  date: string
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
}

export default function StudentDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [attendancePercent, setAttendancePercent] = useState(100)
  const [leavesTaken, setLeavesTaken] = useState(0)
  const [pendingLeaves, setPendingLeaves] = useState(0)
  const [leaveRequests, setLeaveRequests] = useState<StudentLeaveRecord[]>([])

  const studentName = profile?.name || user?.displayName || 'Student'

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (!user) return

    // 1. Fetch Student Attendance
    const attQuery = query(collection(db, 'attendance'), where('studentId', '==', user.uid))
    const unsubAtt = onSnapshot(attQuery, (snap) => {
      let p = 0
      let a = 0
      let l = 0

      snap.forEach(d => {
        const data = d.data()
        if (data.status === 'present') p++
        else if (data.status === 'absent') a++
        else if (data.status === 'late') l++
      })

      const total = p + a + l
      if (total > 0) {
        setAttendancePercent(Math.round(((p + l) / total) * 100))
      } else {
        setAttendancePercent(100)
      }
    })

    // 2. Fetch Student Leave Requests
    const leaveQuery = query(collection(db, 'leaveRequests'), where('studentId', '==', user.uid))
    const unsubLeave = onSnapshot(leaveQuery, (snap) => {
      const records: StudentLeaveRecord[] = []
      let approvedCount = 0
      let pendingCount = 0

      snap.forEach(d => {
        const data = d.data()
        const statusNormalized =
          (data.status?.charAt(0).toUpperCase() + data.status?.slice(1).toLowerCase()) as 'Pending' | 'Approved' | 'Rejected'

        if (data.status?.toLowerCase() === 'approved') approvedCount++
        if (data.status?.toLowerCase() === 'pending') pendingCount++

        records.push({
          date: data.startDate || 'Recent',
          reason: data.reason || data.type || 'Personal',
          status: statusNormalized || 'Pending',
        })
      })

      setLeavesTaken(approvedCount)
      setPendingLeaves(pendingCount)
      setLeaveRequests(records.slice(0, 5))
    })

    return () => {
      unsubAtt()
      unsubLeave()
    }
  }, [user, authLoading, router])

  const radius = 64
  const strokeWidth = 18
  const circumference = 2 * Math.PI * radius
  const presentFraction = attendancePercent / 100
  const absentFraction = 1 - presentFraction

  const presentDash = circumference * presentFraction
  const absentDash = circumference * absentFraction

  return (
    <>
      {/* Top Header */}
      <header className="s2-topbar">
        <div className="s2-topbar-left">
          <button className="s2-icon-btn">
            <MdMenu size={22} color="#4b5563" />
          </button>
        </div>

        <TopbarRight defaultRole="Student" />
      </header>

      {/* Main Content Area */}
      <div className="s2-content">
        {/* Welcome Section */}
        <div className="s2-welcome-row">
          <h1 className="s2-title">Welcome back, {studentName.split(' ')[0]}!</h1>
          <p className="s2-sub">Here is your academic overview</p>
        </div>

        {/* Top Row: 4 Stat Cards */}
        <div className="s2-stats-grid">
          {/* Card 1: Attendance */}
          <div className="s2-stat-card">
            <div className="s2-stat-icon-wrap s2-icon-green">
              <MdGroups size={24} />
            </div>
            <div className="s2-stat-info">
              <span className="s2-stat-title">Attendance</span>
              <span className="s2-stat-num">{attendancePercent}%</span>
              <span className="s2-stat-sub">Overall Record</span>
            </div>
          </div>

          {/* Card 2: Leaves Taken */}
          <div className="s2-stat-card">
            <div className="s2-stat-icon-wrap s2-icon-purple">
              <MdFlightTakeoff size={24} />
            </div>
            <div className="s2-stat-info">
              <span className="s2-stat-title">Leaves Taken</span>
              <span className="s2-stat-num">{leavesTaken}</span>
              <span className="s2-stat-sub">Approved</span>
            </div>
          </div>

          {/* Card 3: Pending Leaves */}
          <div className="s2-stat-card">
            <div className="s2-stat-icon-wrap s2-icon-amber">
              <MdDescription size={24} />
            </div>
            <div className="s2-stat-info">
              <span className="s2-stat-title">Pending Leaves</span>
              <span className="s2-stat-num">{pendingLeaves}</span>
              <span className="s2-stat-sub">Pending Review</span>
            </div>
          </div>

          {/* Card 4: Academic Standing */}
          <div className="s2-stat-card">
            <div className="s2-stat-icon-wrap s2-icon-blue">
              <MdVerified size={24} />
            </div>
            <div className="s2-stat-info">
              <span className="s2-stat-title">Academic Standing</span>
              <span className="s2-stat-num">Good</span>
              <span className="s2-stat-sub">Active Student</span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Attendance Overview + Recent Leave Request */}
        <div className="s2-bottom-grid">
          {/* Attendance Overview (Donut Chart) */}
          <div className="s2-card">
            <div className="s2-card-head">
              <h2 className="s2-card-title">Attendance Overview</h2>
            </div>

            <div className="s2-donut-layout">
              {/* SVG Donut Ring */}
              <div className="s2-donut-wrap">
                <svg width="170" height="170" viewBox="0 0 170 170">
                  {/* Absent Arc (Red) */}
                  <circle
                    cx="85"
                    cy="85"
                    r={radius}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${absentDash} ${circumference - absentDash}`}
                    strokeDashoffset={-presentDash}
                    transform="rotate(-90 85 85)"
                  />

                  {/* Present Arc (Green) */}
                  <circle
                    cx="85"
                    cy="85"
                    r={radius}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${presentDash} ${circumference - presentDash}`}
                    strokeDashoffset="0"
                    transform="rotate(-90 85 85)"
                  />

                  {/* Center Text */}
                  <text
                    x="85"
                    y="80"
                    textAnchor="middle"
                    fontSize="24"
                    fontWeight="700"
                    fill="#111827"
                  >
                    {attendancePercent}%
                  </text>
                  <text
                    x="85"
                    y="100"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="500"
                    fill="#6b7280"
                  >
                    Present
                  </text>
                </svg>
              </div>

              {/* Legend List */}
              <div className="s2-donut-legend">
                <div className="s2-legend-row">
                  <div className="s2-legend-left">
                    <span className="s2-dot s2-dot-green" />
                    <span className="s2-legend-label">Present</span>
                  </div>
                  <span className="s2-legend-val">{attendancePercent}%</span>
                </div>

                <div className="s2-legend-row">
                  <div className="s2-legend-left">
                    <span className="s2-dot s2-dot-red" />
                    <span className="s2-legend-label">Absent</span>
                  </div>
                  <span className="s2-legend-val">{100 - attendancePercent}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Leave Request */}
          <div className="s2-card">
            <div className="s2-card-head">
              <h2 className="s2-card-title">Recent Leave Request</h2>
            </div>

            <table className="s2-table">
              <tbody>
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                      No leave requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map((row, i) => (
                    <tr key={i}>
                      <td className="s2-date-cell">{row.date}</td>
                      <td className="s2-reason-cell">{row.reason}</td>
                      <td className="s2-status-cell">
                        <span className={`s2-badge s2-badge-${row.status.toLowerCase()}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="s2-view-all">
              <Link href="/student/leave">View All</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

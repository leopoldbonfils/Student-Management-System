'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/AuthContext'
import TopbarRight from '@/app/components/TopbarRight'
import {
  MdGridView, MdCheckCircle, MdCancel, MdDescription,
  MdPersonAdd, MdCheck, MdClose, MdShowChart,
  MdNotifications, MdMenu
} from 'react-icons/md'

interface LeaveRequest {
  id: string
  student: string
  type: string
  date: string
  status: 'Pending' | 'Approved' | 'Rejected'
}

interface AttendanceDayStat {
  day: string
  present: number
  absent: number
}

interface ClassSlice {
  label: string
  percent: number
  color: string
}

const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6']

export default function TeacherDashboard() {
  const { user, profile, loading } = useAuth()
  const [totalStudents, setTotalStudents] = useState<number>(0)
  const [presentToday, setPresentToday] = useState<number>(0)
  const [absentToday, setAbsentToday] = useState<number>(0)
  const [pendingLeavesCount, setPendingLeavesCount] = useState<number>(0)
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [attendanceData, setAttendanceData] = useState<AttendanceDayStat[]>([
    { day: 'Mon', present: 0, absent: 0 },
    { day: 'Tue', present: 0, absent: 0 },
    { day: 'Wed', present: 0, absent: 0 },
    { day: 'Thu', present: 0, absent: 0 },
    { day: 'Fri', present: 0, absent: 0 },
    { day: 'Sat', present: 0, absent: 0 },
  ])
  const [classData, setClassData] = useState<ClassSlice[]>([
    { label: 'React Native', percent: 25, color: '#3b82f6' },
    { label: 'Django', percent: 25, color: '#10b981' },
    { label: 'cybersecurity', percent: 25, color: '#f59e0b' },
    { label: 'UI/UX Design', percent: 25, color: '#8b5cf6' },
  ])

  const router = useRouter()
  const teacherName = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'Teacher'
  const todayStr = new Date().toISOString().split('T')[0]!

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }
    if (!user) return

    // 1. Total Students + Class Breakdown
    const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'))
    const unsubStudents = onSnapshot(studentsQuery, (snap) => {
      const count = snap.size
      setTotalStudents(count)

      const classCountMap: Record<string, number> = {}
      snap.forEach(d => {
        const c = d.data().assignedClass || 'General'
        classCountMap[c] = (classCountMap[c] || 0) + 1
      })

      if (count > 0) {
        const slices: ClassSlice[] = Object.entries(classCountMap).map(([label, cCount], idx) => ({
          label: label.length > 14 ? label.slice(0, 12) + '...' : label,
          percent: Math.round((cCount / count) * 100),
          color: pieColors[idx % pieColors.length]!,
        }))
        setClassData(slices)
      }
    })

    // 2. Pending & Recent Leave Requests
    const leaveQuery = query(collection(db, 'leaveRequests'))
    const unsubLeave = onSnapshot(leaveQuery, (snap) => {
      const all: LeaveRequest[] = []
      let pendingCount = 0

      snap.forEach(d => {
        const data = d.data()
        const statusNormalized =
          (data.status?.charAt(0).toUpperCase() + data.status?.slice(1).toLowerCase()) as any

        if (data.status?.toLowerCase() === 'pending') {
          pendingCount++
        }

        all.push({
          id: d.id,
          student: data.studentName || 'Student',
          type: data.type || 'Leave',
          date: data.startDate || 'Recent',
          status: statusNormalized || 'Pending',
        })
      })

      setPendingLeavesCount(pendingCount)
      setRequests(all.slice(0, 5))
    })

    // 3. Attendance Today & Recent Days
    const fetchAttendanceStats = async () => {
      try {
        const attSnap = await getDocs(collection(db, 'attendance'))
        let pToday = 0
        let aToday = 0

        // Build last 6 days map
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const recentDaysMap: Record<string, { present: number; absent: number; dayName: string }> = {}

        const now = new Date()
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now)
          d.setDate(d.getDate() - i)
          const iso = d.toISOString().split('T')[0]!
          const dName = dayNames[d.getDay()]!
          recentDaysMap[iso] = { present: 0, absent: 0, dayName: dName }
        }

        attSnap.forEach(d => {
          const data = d.data()
          if (data.date === todayStr) {
            if (data.status === 'present') pToday++
            if (data.status === 'absent') aToday++
          }

          if (data.date && recentDaysMap[data.date]) {
            if (data.status === 'present') recentDaysMap[data.date]!.present += 1
            if (data.status === 'absent') recentDaysMap[data.date]!.absent += 1
          }
        })

        setPresentToday(pToday)
        setAbsentToday(aToday)

        const barData: AttendanceDayStat[] = Object.values(recentDaysMap).map(item => ({
          day: item.dayName,
          present: item.present,
          absent: item.absent,
        }))

        // If no attendance records exist yet, keep minimal default scale
        setAttendanceData(barData.length > 0 ? barData : [
          { day: 'Mon', present: 0, absent: 0 },
          { day: 'Tue', present: 0, absent: 0 },
          { day: 'Wed', present: 0, absent: 0 },
          { day: 'Thu', present: 0, absent: 0 },
          { day: 'Fri', present: 0, absent: 0 },
          { day: 'Sat', present: 0, absent: 0 },
        ])
      } catch (err) {
        console.error('Error fetching attendance overview stats:', err)
      }
    }

    fetchAttendanceStats()

    return () => {
      unsubStudents()
      unsubLeave()
    }
  }, [todayStr])

  const handleStatusChange = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      const docRef = doc(db, 'leaveRequests', id)
      await updateDoc(docRef, {
        status: newStatus.toLowerCase(),
        reviewedBy: user?.uid || '',
        reviewedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('Error updating leave status from dashboard:', err)
    }
  }

  // Calculate Pie slices
  let cumulativePercent = 0
  const getCoordinatesForPercent = (percent: number): [string, string] => {
    const x = Math.cos(2 * Math.PI * percent)
    const y = Math.sin(2 * Math.PI * percent)
    return [x.toFixed(10), y.toFixed(10)]
  }

  const presentPercentage =
    totalStudents > 0 ? ((presentToday / totalStudents) * 100).toFixed(1) : '0'
  const absentPercentage =
    totalStudents > 0 ? ((absentToday / totalStudents) * 100).toFixed(1) : '0'

  return (
    <>
      {/* Top Header */}
      <header className="t2-topbar">
        <div className="t2-topbar-left">
          <button className="t2-icon-btn">
            <MdMenu size={22} color="#4b5563" />
          </button>
        </div>

        <TopbarRight defaultRole="Teacher" />
      </header>

      {/* Main Content Area */}
      <div className="t2-content">
        {/* Top Row: 4 Stat Cards */}
        <div className="t2-stats-grid">
          {/* Card 1: Total Students */}
          <div className="t2-stat-card">
            <div className="t2-stat-icon-wrap t2-icon-blue">
              <MdGridView size={22} />
            </div>
            <div className="t2-stat-info">
              <span className="t2-stat-title">Total Students</span>
              <span className="t2-stat-num">{totalStudents}</span>
              <span className="t2-stat-sub">Enrolled Students</span>
            </div>
          </div>

          {/* Card 2: Present Today */}
          <div className="t2-stat-card">
            <div className="t2-stat-icon-wrap t2-icon-green">
              <MdCheckCircle size={22} />
            </div>
            <div className="t2-stat-info">
              <span className="t2-stat-title">Present Today</span>
              <span className="t2-stat-num">{presentToday}</span>
              <span className="t2-stat-sub">{presentPercentage}%</span>
            </div>
          </div>

          {/* Card 3: Absent Today */}
          <div className="t2-stat-card">
            <div className="t2-stat-icon-wrap t2-icon-red">
              <MdCancel size={22} />
            </div>
            <div className="t2-stat-info">
              <span className="t2-stat-title">Absent Today</span>
              <span className="t2-stat-num">{absentToday}</span>
              <span className="t2-stat-sub">{absentPercentage}%</span>
            </div>
          </div>

          {/* Card 4: Pending Leaves */}
          <div className="t2-stat-card">
            <div className="t2-stat-icon-wrap t2-icon-amber">
              <MdDescription size={22} />
            </div>
            <div className="t2-stat-info">
              <span className="t2-stat-title">Pending Leaves</span>
              <span className="t2-stat-num">{pendingLeavesCount}</span>
              <span className="t2-stat-sub">Requests</span>
            </div>
          </div>
        </div>

        {/* Middle Row: Attendance Overview + Students by Class */}
        <div className="t2-middle-grid">
          {/* Attendance Overview (Dual Bar Chart) */}
          <div className="t2-card">
            <div className="t2-card-head">
              <h2 className="t2-card-title">Attendance Overview</h2>
              <div className="t2-legend-row">
                <span className="t2-legend-item">
                  <span className="t2-legend-square t2-bg-green" /> Present
                </span>
                <span className="t2-legend-item">
                  <span className="t2-legend-square t2-bg-red" /> Absent
                </span>
              </div>
            </div>

            {/* SVG Dual-Bar Chart */}
            <div className="t2-chart-wrap">
              <svg width="100%" height="220" viewBox="0 0 460 220" className="t2-bar-svg">
                {/* Y-Axis Labels & Grid Lines */}
                {[100, 75, 50, 25, 0].map((val) => {
                  const y = 20 + ((100 - val) / 100) * 150
                  return (
                    <g key={val}>
                      <text x="24" y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">
                        {val}
                      </text>
                      <line x1="34" y1={y} x2="450" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                    </g>
                  )
                })}

                {/* Bars per day */}
                {attendanceData.map((d, i) => {
                  const groupX = 65 + i * 64
                  const maxH = 150
                  const baseY = 170

                  const maxScale = Math.max(...attendanceData.map(a => Math.max(a.present, a.absent, 10)), 10)
                  const presentH = (d.present / maxScale) * maxH
                  const absentH = (d.absent / maxScale) * maxH

                  return (
                    <g key={d.day}>
                      {/* Present bar (Green) */}
                      <rect
                        x={groupX}
                        y={baseY - presentH}
                        width="14"
                        height={Math.max(presentH, 2)}
                        rx="3"
                        fill="#10b981"
                      />
                      {/* Absent bar (Red) */}
                      <rect
                        x={groupX + 18}
                        y={baseY - absentH}
                        width="14"
                        height={Math.max(absentH, 2)}
                        rx="3"
                        fill="#ef4444"
                      />
                      {/* Day label */}
                      <text
                        x={groupX + 16}
                        y="194"
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="500"
                        fill="#6b7280"
                      >
                        {d.day}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>

          {/* Students by Class (Pie/Donut Chart) */}
          <div className="t2-card">
            <div className="t2-card-head">
              <h2 className="t2-card-title">Students by Class</h2>
            </div>

            <div className="t2-pie-layout">
              {/* SVG Pie Chart */}
              <div className="t2-pie-container">
                <svg width="180" height="180" viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
                  {classData.map((slice) => {
                    const startPercent = cumulativePercent
                    cumulativePercent += slice.percent / 100
                    const endPercent = cumulativePercent

                    const [startX, startY] = getCoordinatesForPercent(startPercent)
                    const [endX, endY] = getCoordinatesForPercent(endPercent)
                    const largeArcFlag = slice.percent / 100 > 0.5 ? 1 : 0

                    const pathData = [
                      `M ${startX} ${startY}`,
                      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                      `L 0 0`,
                    ].join(' ')

                    return (
                      <path
                        key={slice.label}
                        d={pathData}
                        fill={slice.color}
                        stroke="#ffffff"
                        strokeWidth="0.04"
                      />
                    )
                  })}
                </svg>
              </div>

              {/* Legend List */}
              <div className="t2-pie-legend">
                {classData.map((item) => (
                  <div key={item.label} className="t2-pie-legend-row">
                    <div className="t2-pie-legend-left">
                      <span className="t2-dot" style={{ background: item.color }} />
                      <span className="t2-pie-label">{item.label}</span>
                    </div>
                    <span className="t2-pie-val">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Recent Leave Requests + Quick Actions */}
        <div className="t2-bottom-grid">
          {/* Recent Leave Requests Table */}
          <div className="t2-card">
            <div className="t2-card-head">
              <h2 className="t2-card-title">Recent Leave Requests</h2>
            </div>

            <table className="t2-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                      No recent leave requests.
                    </td>
                  </tr>
                ) : (
                  requests.map((row) => (
                    <tr key={row.id}>
                      <td className="t2-student-name">{row.student}</td>
                      <td>{row.type}</td>
                      <td className="t2-date-cell">{row.date}</td>
                      <td>
                        <span className={`t2-badge t2-badge-${row.status.toLowerCase()}`}>
                          {row.status}
                        </span>
                      </td>
                      <td>
                        <div className="t2-action-btns">
                          <button
                            className="t2-action-btn t2-action-check"
                            onClick={() => handleStatusChange(row.id, 'Approved')}
                            title="Approve"
                          >
                            <MdCheck size={16} />
                          </button>
                          <button
                            className="t2-action-btn t2-action-close"
                            onClick={() => handleStatusChange(row.id, 'Rejected')}
                            title="Reject"
                          >
                            <MdClose size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Actions */}
          <div className="t2-card">
            <div className="t2-card-head">
              <h2 className="t2-card-title">Quick Actions</h2>
            </div>

            <div className="t2-quick-btns">
              <Link href="/teacher/add-student" style={{ textDecoration: 'none' }}>
                <button className="t2-btn t2-btn-blue">
                  <MdPersonAdd size={18} />
                  <span>Add Student</span>
                </button>
              </Link>

              <Link href="/teacher/attendance" style={{ textDecoration: 'none' }}>
                <button className="t2-btn t2-btn-green">
                  <MdCheckCircle size={18} />
                  <span>Mark Attendance</span>
                </button>
              </Link>

              <Link href="/teacher/attendance" style={{ textDecoration: 'none' }}>
                <button className="t2-btn t2-btn-purple">
                  <MdShowChart size={18} />
                  <span>View Reports</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

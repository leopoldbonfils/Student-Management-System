'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  MdGridView, MdCheckCircle, MdCancel, MdDescription,
  MdPersonAdd, MdCheck, MdClose, MdShowChart,
  MdNotifications, MdMenu
} from 'react-icons/md'

interface LeaveRequest {
  id: number
  student: string
  type: string
  date: string
  status: 'Pending' | 'Approved' | 'Rejected'
}

const initialLeaveRequests: LeaveRequest[] = [
  { id: 1, student: 'Alice Johnson', type: 'Sick Leave',       date: 'Aug 10, 2025', status: 'Pending' },
  { id: 2, student: 'Bob Smith',     type: 'Family Function',  date: 'Aug 9, 2025',  status: 'Pending' },
  { id: 3, student: 'Carol White',   type: 'Personal Work',    date: 'Aug 8, 2025',  status: 'Approved' },
]

// Attendance overview dual-bar data (Mon - Sat)
const attendanceData = [
  { day: 'Mon', present: 88, absent: 24 },
  { day: 'Tue', present: 96, absent: 18 },
  { day: 'Wed', present: 86, absent: 18 },
  { day: 'Thu', present: 90, absent: 19 },
  { day: 'Fri', present: 83, absent: 16 },
  { day: 'Sat', present: 80, absent: 16 },
]

// Students by Class pie chart data
const classData = [
  { label: 'Grade 10', percent: 30, color: '#3b82f6' },
  { label: 'Grade 11', percent: 30, color: '#10b981' },
  { label: 'Grade 12', percent: 25, color: '#f59e0b' },
  { label: 'Others',   percent: 15, color: '#8b5cf6' },
]

export default function TeacherDashboard() {
  const [requests, setRequests] = useState(initialLeaveRequests)

  const handleStatusChange = (id: number, newStatus: 'Approved' | 'Rejected') => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req))
  }

  // Calculate Pie slices
  let cumulativePercent = 0
  const getCoordinatesForPercent = (percent: number): [string, string] => {
    const x = Math.cos(2 * Math.PI * percent)
    const y = Math.sin(2 * Math.PI * percent)
    // Return formatted string values directly to ensure identical string representations on both server and client,
    // avoiding floating-point precision discrepancies during serialization.
    return [x.toFixed(10), y.toFixed(10)]
  }

  return (
    <>
      {/* Top Header */}
      <header className="t2-topbar">
        <div className="t2-topbar-left">
          <button className="t2-icon-btn">
            <MdMenu size={22} color="#4b5563" />
          </button>
        </div>

        <div className="t2-topbar-right">
          <button className="t2-bell-btn">
            <MdNotifications size={22} color="#4b5563" />
            <span className="t2-bell-badge" />
          </button>

          <Link href="/teacher/profile" className="t2-profile-link" style={{ textDecoration: 'none' }}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"
              alt="Mr. David"
              className="t2-avatar-img"
            />
            <div className="t2-profile-text">
              <span className="t2-profile-name">Mr. David</span>
              <span className="t2-profile-role">Teacher</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="t2-content">
        {/*  Top Row: 4 Stat Cards  */}
        <div className="t2-stats-grid">
          {/* Card 1: Total Students */}
          <div className="t2-stat-card">
            <div className="t2-stat-icon-wrap t2-icon-blue">
              <MdGridView size={22} />
            </div>
            <div className="t2-stat-info">
              <span className="t2-stat-title">Total Students</span>
              <span className="t2-stat-num">120</span>
              <span className="t2-stat-sub">All Students</span>
            </div>
          </div>

          {/* Card 2: Present Today */}
          <div className="t2-stat-card">
            <div className="t2-stat-icon-wrap t2-icon-green">
              <MdCheckCircle size={22} />
            </div>
            <div className="t2-stat-info">
              <span className="t2-stat-title">Present Today</span>
              <span className="t2-stat-num">105</span>
              <span className="t2-stat-sub">87.5%</span>
            </div>
          </div>

          {/* Card 3: Absent Today */}
          <div className="t2-stat-card">
            <div className="t2-stat-icon-wrap t2-icon-red">
              <MdCancel size={22} />
            </div>
            <div className="t2-stat-info">
              <span className="t2-stat-title">Absent Today</span>
              <span className="t2-stat-num">15</span>
              <span className="t2-stat-sub">12.5%</span>
            </div>
          </div>

          {/* Card 4: Pending Leaves */}
          <div className="t2-stat-card">
            <div className="t2-stat-icon-wrap t2-icon-amber">
              <MdDescription size={22} />
            </div>
            <div className="t2-stat-info">
              <span className="t2-stat-title">Pending Leaves</span>
              <span className="t2-stat-num">8</span>
              <span className="t2-stat-sub">Requests</span>
            </div>
          </div>
        </div>

        {/* Middle Row: Attendance Overview + Students by Class  */}
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

                  const presentH = (d.present / 100) * maxH
                  const absentH = (d.absent / 100) * maxH

                  return (
                    <g key={d.day}>
                      {/* Present bar (Green) */}
                      <rect
                        x={groupX}
                        y={baseY - presentH}
                        width="14"
                        height={presentH}
                        rx="3"
                        fill="#10b981"
                      />
                      {/* Absent bar (Red) */}
                      <rect
                        x={groupX + 18}
                        y={baseY - absentH}
                        width="14"
                        height={absentH}
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

        {/* Bottom Row: Recent Leave Requests + Quick Actions  */}
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
                {requests.map((row) => (
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
                ))}
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

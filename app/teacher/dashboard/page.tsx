'use client'

import React from 'react'
import Link from 'next/link'
import {
  MdPeople, MdCalendarToday, MdAssignment,
  MdArrowForward, MdSearch, MdNotifications
} from 'react-icons/md'

const leaveRequests = [
  { name: 'Jane Smith', grade: 'Grade 10A', avatar: 'JS', color: '#f59e0b', dates: 'Oct 12 - Oct 14', reason: 'Medical', status: 'Pending' },
  { name: 'Michael Klein', grade: 'Grade 11B', avatar: 'MK', color: '#3b82f6', dates: 'Oct 15', reason: 'Family Event', status: 'Pending' },
  { name: 'Sarah Davis',   grade: 'Grade 8C',  avatar: 'SD', color: '#10b981', dates: 'Oct 10',          reason: 'Dentist',      status: 'Approved' },
]

// Bar chart data: M T W T F
const weeklyData = [
  { day: 'M', value: 72 },
  { day: 'T', value: 95 },
  { day: 'W', value: 88 },
  { day: 'T', value: 100 },
  { day: 'F', value: 60 },
]
const maxVal = Math.max(...weeklyData.map(d => d.value))

export default function TeacherDashboard() {
  return (
    <>
      {/* Page title bar */}
      <div className="td-topbar">
        <h1 className="td-page-title">Dashboard</h1>
        <div className="td-topbar-right">
          <div className="td-search">
            <MdSearch size={16} color="#9ca3af" />
            <input placeholder="Search..." />
          </div>
          <button className="td-icon-btn"><MdNotifications size={20} /></button>
        </div>
      </div>

      <div className="td-content">
        {/* Stat Cards */}
        <div className="td-stats">
          <div className="td-stat-card">
            <div className="td-stat-top">
              <span className="td-stat-label">TOTAL STUDENTS</span>
              <div className="td-stat-icon td-blue"><MdPeople size={16} /></div>
            </div>
            <div className="td-stat-value">120</div>
          </div>

          <div className="td-stat-card">
            <div className="td-stat-top">
              <span className="td-stat-label">PRESENT TODAY</span>
              <div className="td-stat-icon td-green"><MdCalendarToday size={16} /></div>
            </div>
            <div className="td-stat-value">105</div>
          </div>

          <div className="td-stat-card">
            <div className="td-stat-top">
              <span className="td-stat-label">ABSENT TODAY</span>
              <div className="td-stat-icon td-red"><MdCalendarToday size={16} /></div>
            </div>
            <div className="td-stat-value">15</div>
          </div>

          <div className="td-stat-card">
            <div className="td-stat-top">
              <span className="td-stat-label">PENDING REQUESTS</span>
              <div className="td-stat-icon td-orange"><MdAssignment size={16} /></div>
            </div>
            <div className="td-stat-value">4</div>
          </div>
        </div>

        {/* Middle Row */}
        <div className="td-middle">
          {/* Weekly Attendance Chart */}
          <div className="td-chart-card">
            <div className="td-card-header">
              <span className="td-card-title">Weekly Attendance</span>
              <Link href="/teacher/attendance" className="td-view-link">
                View Report <MdArrowForward size={14} />
              </Link>
            </div>

            {/* SVG Bar Chart */}
            <div className="td-bar-chart">
              <svg width="100%" height="130" viewBox="0 0 280 130">
                {weeklyData.map((d, i) => {
                  const barW = 32
                  const gap = 20
                  const x = 20 + i * (barW + gap)
                  const barH = (d.value / maxVal) * 90
                  const y = 105 - barH
                  const isMax = d.value === maxVal

                  return (
                    <g key={d.day}>
                      <rect
                        x={x}
                        y={15}
                        width={barW}
                        height={90}
                        rx={6}
                        fill="#f3f4f6"
                      />
                      <rect
                        x={x}
                        y={y}
                        width={barW}
                        height={barH}
                        rx={6}
                        fill={isMax ? '#4f46e5' : '#818cf8'}
                      />
                      <text
                        x={x + barW / 2}
                        y={122}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
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

          {/* Quick Actions */}
          <div className="td-quick-card">
            <p className="td-card-title">Quick Actions</p>
            <div className="td-quick-list">
              <Link href="/teacher/add-student" style={{ textDecoration: 'none' }}>
                <button className="td-quick-btn td-q-blue">
                  + Add New Student
                </button>
              </Link>
              <Link href="/teacher/attendance" style={{ textDecoration: 'none' }}>
                <button className="td-quick-btn td-q-purple">
                  Mark Attendance
                </button>
              </Link>
            </div>

            <div className="td-quick-info">
              <span className="td-info-dot">ℹ</span>
              <div>
                <p className="td-info-title">Term 1 Ending Soon</p>
                <p className="td-info-sub">Finalize all pending marks by Friday.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Leave Requests */}
        <div className="td-table-card">
          <div className="td-card-header">
            <span className="td-card-title">Recent Leave Requests</span>
            <Link href="/teacher/leave" className="td-view-link">
              View All <MdArrowForward size={14} />
            </Link>
          </div>

          <table className="td-table">
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>DATES</th>
                <th>REASON</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((req, i) => (
                <tr key={i}>
                  <td>
                    <div className="td-student-cell">
                      <div className="td-avatar" style={{ background: req.color }}>{req.avatar}</div>
                      <div>
                        <p className="td-student-name">{req.name}</p>
                        <p className="td-student-grade">{req.grade}</p>
                      </div>
                    </div>
                  </td>
                  <td>{req.dates}</td>
                  <td>{req.reason}</td>
                  <td>
                    <span className={`td-badge td-badge-${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="td-view-all">
            <Link href="/teacher/leave">View All Requests</Link>
          </div>
        </div>
      </div>
    </>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import {
  MdMenu, MdNotifications, MdKeyboardArrowDown,
  MdGroups, MdFlightTakeoff, MdDescription, MdVerified
} from 'react-icons/md'

const leaveRequests = [
  { date: 'Aug 10, 2025', reason: 'Sick Leave',       status: 'Pending' },
  { date: 'Aug 5, 2025',  reason: 'Family Function',  status: 'Approved' },
  { date: 'Jul 28, 2025', reason: 'Personal Work',    status: 'Approved' },
]

export default function StudentDashboard() {
  const radius = 64
  const strokeWidth = 18
  const circumference = 2 * Math.PI * radius
  const presentPercent = 0.92
  const absentPercent = 0.08

  // Dash calculations for donut
  const presentDash = circumference * presentPercent
  const absentDash = circumference * absentPercent

  return (
    <>
      {/* Top Header */}
      <header className="s2-topbar">
        <div className="s2-topbar-left">
          <button className="s2-icon-btn">
            <MdMenu size={22} color="#4b5563" />
          </button>
        </div>

        <div className="s2-topbar-right">
          <button className="s2-bell-btn">
            <MdNotifications size={22} color="#4b5563" />
          </button>

          <Link href="/student/profile" className="s2-profile-link" style={{ textDecoration: 'none' }}>
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop"
              alt="John Doe"
              className="s2-avatar-img"
            />
            <div className="s2-profile-text">
              <span className="s2-profile-name">John Doe</span>
              <span className="s2-profile-role">Student</span>
            </div>
            <MdKeyboardArrowDown size={18} color="#9ca3af" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="s2-content">
        {/* Welcome Section */}
        <div className="s2-welcome-row">
          <h1 className="s2-title">Welcome back, John! 👋</h1>
          <p className="s2-sub">Here is your academic overview</p>
        </div>

        {/* ── Top Row: 4 Stat Cards ── */}
        <div className="s2-stats-grid">
          {/* Card 1: Attendance */}
          <div className="s2-stat-card">
            <div className="s2-stat-icon-wrap s2-icon-green">
              <MdGroups size={24} />
            </div>
            <div className="s2-stat-info">
              <span className="s2-stat-title">Attendance</span>
              <span className="s2-stat-num">92%</span>
              <span className="s2-stat-sub">This Month</span>
            </div>
          </div>

          {/* Card 2: Leaves Taken */}
          <div className="s2-stat-card">
            <div className="s2-stat-icon-wrap s2-icon-purple">
              <MdFlightTakeoff size={24} />
            </div>
            <div className="s2-stat-info">
              <span className="s2-stat-title">Leaves Taken</span>
              <span className="s2-stat-num">2</span>
              <span className="s2-stat-sub">This Month</span>
            </div>
          </div>

          {/* Card 3: Pending Leaves */}
          <div className="s2-stat-card">
            <div className="s2-stat-icon-wrap s2-icon-amber">
              <MdDescription size={24} />
            </div>
            <div className="s2-stat-info">
              <span className="s2-stat-title">Pending Leaves</span>
              <span className="s2-stat-num">1</span>
              <span className="s2-stat-sub">Pending</span>
            </div>
          </div>

          {/* Card 4: Average Grade */}
          <div className="s2-stat-card">
            <div className="s2-stat-icon-wrap s2-icon-blue">
              <MdVerified size={24} />
            </div>
            <div className="s2-stat-info">
              <span className="s2-stat-title">Average Grade</span>
              <span className="s2-stat-num">A-</span>
              <span className="s2-stat-sub">This Term</span>
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
                    92%
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
                  <span className="s2-legend-val">92%</span>
                </div>

                <div className="s2-legend-row">
                  <div className="s2-legend-left">
                    <span className="s2-dot s2-dot-red" />
                    <span className="s2-legend-label">Absent</span>
                  </div>
                  <span className="s2-legend-val">8%</span>
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
                {leaveRequests.map((row, i) => (
                  <tr key={i}>
                    <td className="s2-date-cell">{row.date}</td>
                    <td className="s2-reason-cell">{row.reason}</td>
                    <td className="s2-status-cell">
                      <span className={`s2-badge s2-badge-${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
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

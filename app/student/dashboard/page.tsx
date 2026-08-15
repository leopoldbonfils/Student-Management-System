'use client'

import React, { useState } from 'react'
import {
  MdDashboard, MdPeople, MdCalendarToday, MdGrade,
  MdSchedule, MdSettings, MdSearch, MdNotifications,
  MdHelp, MdMoreVert, MdSchool, MdFlightTakeoff, MdPendingActions
} from 'react-icons/md'
import { PiGraduationCapFill } from 'react-icons/pi'

const leaveRequests = [
  { dateRange: 'Oct 12 - Oct 14, 2023', reason: 'Family Emergency',     days: 3, status: 'Pending'  },
  { dateRange: 'Sep 05 - Sep 06, 2023', reason: 'Medical Appointment',  days: 2, status: 'Approved' },
  { dateRange: 'Aug 20 - Aug 20, 2023', reason: 'Personal Event',       days: 1, status: 'Approved' },
]

const navItems = [
  { name: 'Dashboard',  Icon: MdDashboard },
  { name: 'Students',   Icon: MdPeople },
  { name: 'Attendance', Icon: MdCalendarToday },
  { name: 'Schedule',   Icon: MdSchedule },
]

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const ATTENDANCE = 0.92

export default function StudentDashboard() {
  const [activeNav, setActiveNav] = useState('Dashboard')

  return (
    <div className="db-wrapper">

      {/* Sidebar */}
      <aside className="db-sidebar">

        <div className="db-logo">
          <div className="db-logo-icon">
            <PiGraduationCapFill size={22} color="white" />
          </div>
          <div>
            <p className="db-logo-title">EduPortal</p>
            <p className="db-logo-sub">MANAGEMENT SYSTEM</p>
          </div>
        </div>

        <nav className="db-nav">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`db-nav-item ${activeNav === item.name ? 'db-nav-active' : ''}`}
              onClick={() => setActiveNav(item.name)}
            >
              <item.Icon size={20} />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <button className="db-nav-item db-settings">
          <MdSettings size={20} />
          <span>Settings</span>
        </button>

      </aside>

      {/* Main */}
      <div className="db-main">

        {/* Header */}
        <header className="db-header">
          <span className="db-header-brand">EduPortal</span>

          <div className="db-search">
            <MdSearch size={18} color="#9ca3af" />
            <input type="text" placeholder="Search..." />
          </div>

          <div className="db-header-actions">
            <button className="db-icon-btn"><MdNotifications size={22} /></button>
            <button className="db-icon-btn"><MdHelp size={22} /></button>
            <div className="db-avatar">A</div>
          </div>
        </header>

        {/* Content */}
        <div className="db-content">

          <h1 className="db-welcome">Welcome back, Alex!</h1>
          <p className="db-welcome-sub">Here is your academic overview for this semester.</p>

          {/* Stat Cards */}
          <div className="db-stats">

            <div className="db-stat-card">
              <div className="db-stat-label">ATTENDANCE <MdCalendarToday size={13} /></div>
              <div className="db-stat-value">92%</div>
              <div className="db-stat-note positive">↑ +2% from last month</div>
            </div>

            <div className="db-stat-card">
              <div className="db-stat-label">LEAVES TAKEN <MdFlightTakeoff size={13} /></div>
              <div className="db-stat-value">2 <span className="db-stat-unit">days</span></div>
            </div>

            <div className="db-stat-card">
              <div className="db-stat-label">PENDING LEAVES <MdPendingActions size={13} /></div>
              <div className="db-stat-value">1 <span className="db-stat-unit">request</span></div>
              <div className="db-stat-note">Awaiting approval</div>
            </div>

            <div className="db-stat-card">
              <div className="db-stat-label">AVG. GRADE <MdSchool size={13} /></div>
              <div className="db-stat-value">A-</div>
              <div className="db-stat-note">Top 15% of class</div>
            </div>

          </div>

          {/* Bottom Row */}
          <div className="db-bottom">

            {/* Donut Chart */}
            <div className="db-chart-card">
              <div className="db-card-header">
                <span>Attendance Overview</span>
                <button className="db-icon-btn"><MdMoreVert size={20} /></button>
              </div>

              <div className="db-donut">
                <svg width="150" height="150" viewBox="0 0 150 150">
                  {/* Background circle */}
                  <circle cx="75" cy="75" r={RADIUS} fill="none" stroke="#e5e7eb" strokeWidth="16" />
                  {/* Progress arc */}
                  <circle
                    cx="75" cy="75" r={RADIUS}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="16"
                    strokeDasharray={`${CIRCUMFERENCE * ATTENDANCE} ${CIRCUMFERENCE * (1 - ATTENDANCE)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 75 75)"
                  />
                  <text x="75" y="71" textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">92%</text>
                  <text x="75" y="87" textAnchor="middle" fontSize="11" fill="#6b7280">Present</text>
                </svg>
              </div>

              <div className="db-legend">
                <div className="db-legend-item">
                  <span className="db-legend-dot" style={{ background: '#4f46e5' }} />
                  Present (92%)
                </div>
                <div className="db-legend-item">
                  <span className="db-legend-dot" style={{ background: '#e5e7eb' }} />
                  Absent (8%)
                </div>
              </div>
            </div>

            {/* Leave Requests Table */}
            <div className="db-table-card">
              <div className="db-card-header">
                <span>Recent Leave Requests</span>
                <button className="db-ask-leave">+ Ask Leave</button>
              </div>

              <table className="db-table">
                <thead>
                  <tr>
                    <th>Date Range</th>
                    <th>Reason</th>
                    <th>Days</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map((req, i) => (
                    <tr key={i}>
                      <td>{req.dateRange}</td>
                      <td>{req.reason}</td>
                      <td>{req.days}</td>
                      <td>
                        <span className={`db-badge db-badge-${req.status.toLowerCase()}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import {
  MdDashboard, MdPeople, MdCalendarToday, MdAssignment,
  MdPersonAdd, MdThumbUp, MdBarChart, MdSettings,
  MdLogout, MdArrowForward, MdSearch, MdNotifications
} from 'react-icons/md'
import { PiGraduationCapFill } from 'react-icons/pi'

const navItems = [
  { name: 'Dashboard',      Icon: MdDashboard },
  { name: 'Students',       Icon: MdPeople },
  { name: 'Attendance',     Icon: MdCalendarToday },
  { name: 'Leave Requests', Icon: MdAssignment },
  { name: 'Add Student',    Icon: MdPersonAdd },
  { name: 'Approval',       Icon: MdThumbUp },
  { name: 'Reports',        Icon: MdBarChart },
  { name: 'Settings',       Icon: MdSettings },
]

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
  const [activeNav, setActiveNav] = useState('Dashboard')

  return (
    <div className="td-wrapper">

      {/*  Sidebar  */}
      <aside className="td-sidebar">

        <div className="td-logo">
          <div className="td-logo-icon">
            <PiGraduationCapFill size={20} color="white" />
          </div>
          <div>
            <p className="td-logo-title">EduPortal</p>
            <p className="td-logo-sub">Management System</p>
          </div>
        </div>

        <nav className="td-nav">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`td-nav-item ${activeNav === item.name ? 'td-nav-active' : ''}`}
              onClick={() => setActiveNav(item.name)}
            >
              <item.Icon size={18} />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <button className="td-nav-item td-logout">
          <MdLogout size={18} />
          <span>Logout</span>
        </button>

      </aside>

      {/*  Main  */}
      <div className="td-main">

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

          {/*  Stat Cards  */}
          <div className="td-stats">
            <div className="td-stat-card">
              <div className="td-stat-top">
                <span className="td-stat-label">Total Students</span>
                <div className="td-stat-icon td-blue"><MdPeople size={18} /></div>
              </div>
              <div className="td-stat-value">120</div>
            </div>

            <div className="td-stat-card">
              <div className="td-stat-top">
                <span className="td-stat-label">Present Today</span>
                <div className="td-stat-icon td-green"><MdCalendarToday size={18} /></div>
              </div>
              <div className="td-stat-value">105</div>
            </div>

            <div className="td-stat-card">
              <div className="td-stat-top">
                <span className="td-stat-label">Absent Today</span>
                <div className="td-stat-icon td-red"><MdAssignment size={18} /></div>
              </div>
              <div className="td-stat-value">15</div>
            </div>

            <div className="td-stat-card">
              <div className="td-stat-top">
                <span className="td-stat-label">Pending Requests</span>
                <div className="td-stat-icon td-orange"><MdThumbUp size={18} /></div>
              </div>
              <div className="td-stat-value">4</div>
            </div>
          </div>

          {/*  Middle Row  */}
          <div className="td-middle">

            {/* Weekly Attendance Chart */}
            <div className="td-chart-card">
              <div className="td-card-header">
                <span className="td-card-title">Weekly Attendance</span>
                <a href="#" className="td-view-link">View Report <MdArrowForward size={14} /></a>
              </div>

              {/* SVG Bar Chart */}
              <div className="td-bar-chart">
                <svg width="100%" height="160" viewBox="0 0 340 160" preserveAspectRatio="none">
                  {weeklyData.map((d, i) => {
                    const barH = (d.value / maxVal) * 120
                    const x = i * 68 + 14
                    const y = 140 - barH
                    const isActive = d.day === 'T' && i === 3
                    return (
                      <g key={i}>
                        <rect
                          x={x} y={y}
                          width="40" height={barH}
                          rx="6"
                          fill={isActive ? '#3730a3' : '#a5b4fc'}
                        />
                        <text x={x + 20} y="155" textAnchor="middle" fontSize="11" fill="#9ca3af">{d.day}</text>
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
                <button className="td-quick-btn td-q-blue">
                  <MdPersonAdd size={16} /> Add New Student
                </button>
                <button className="td-quick-btn td-q-purple">
                  <MdCalendarToday size={16} /> Mark Attendance
                </button>
                <div className="td-quick-info">
                  <span className="td-info-dot">ℹ</span>
                  <div>
                    <p className="td-info-title">Term Ends Soon</p>
                    <p className="td-info-sub">Submit all reports</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/*  Recent Leave Requests  */}
          <div className="td-table-card">
            <div className="td-card-header">
              <span className="td-card-title">Recent Leave Requests</span>
            </div>

            <table className="td-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Date(s)</th>
                  <th>Reason</th>
                  <th>Status</th>
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
              <a href="#">View All Requests</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

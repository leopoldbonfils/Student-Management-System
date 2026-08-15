'use client'

import React, { useState } from 'react'
import {
  MdDashboard, MdPeople, MdCalendarToday, MdGrade,
  MdSchedule, MdSettings, MdSearch, MdPersonAdd,
  MdChevronLeft, MdChevronRight, MdBarChart, MdAssignment,
  MdThumbUp, MdLogout
} from 'react-icons/md'
import { PiGraduationCapFill } from 'react-icons/pi'

const navItems = [
  { name: 'Dashboard',Icon: MdDashboard },
  { name: 'Students',Icon: MdPeople },
  { name: 'Attendance',Icon: MdCalendarToday },
  { name: 'Grades',Icon: MdGrade },
  { name: 'Schedule',Icon: MdSchedule },
]

const students = [
  {
    name: 'Emma Smith',
    email: 'emma.s@eduportal.com',
    avatar: 'ES',
    color: '#10b981',
    id: 'STU-1042',
    class: 'Grade 10 - A',
    attendance: 98,
    status: 'Active',
  },
  {
    name: 'James Davis',
    email: 'jdavis@eduportal.com',
    avatar: 'JD',
    color: '#f59e0b',
    id: 'STU-1043',
    class: 'Grade 9 - B',
    attendance: 82,
    status: 'Active',
  },
  {
    name: 'Mia Johnson',
    email: 'mia.j@eduportal.com',
    avatar: 'MJ',
    color: '#6366f1',
    id: 'STU-1044',
    class: 'Grade 11 - Sci',
    attendance: 71,
    status: 'Warning',
  },
  {
    name: 'William Lee',
    email: 'william.l@eduportal.com',
    avatar: 'WL',
    color: '#3b82f6',
    id: 'STU-1045',
    class: 'Grade 10 - A',
    attendance: 95,
    status: 'Suspended',
  },
]

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
  const [activeNav, setActiveNav] = useState('Students')
  const [search, setSearch] = useState('')
  const [classFilter, setClass] = useState('')
  const [statusFilter, setStatus] = useState('Active')
  const [activePage, setPage] = useState(1)

  return (
    <div className="td-wrapper">

      {/* Sidebar */}
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

        <button className="td-nav-item td-settings">
          <MdSettings size={18} />
          <span>Settings</span>
        </button>
      </aside>

      {/* Main */}
      <div className="td-main">

        {/* Header */}
        <header className="td-topbar">
          <div className="sm-header-search">
            <MdSearch size={16} color="#9ca3af" />
            <input placeholder="Search EduPortal..." />
          </div>
        </header>

        {/* Content */}
        <div className="td-content">

          {/* Page heading */}
          <div className="sm-page-head">
            <div>
              <h1 className="sm-title">Students Management</h1>
              <p className="sm-sub">Manage and overview student records.</p>
            </div>
            <button className="sm-add-btn">
              <MdPersonAdd size={18} /> + Add Student
            </button>
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
                <label className="sm-filter-label">Class / Grade</label>
                <select
                  className="sm-filter-select"
                  value={classFilter}
                  onChange={e => setClass(e.target.value)}
                >
                  <option value="">All Classes</option>
                  <option value="grade10a">Grade 10 - A</option>
                  <option value="grade9b">Grade 9 - B</option>
                  <option value="grade11sci">Grade 11 - Sci</option>
                </select>
              </div>

              <div className="sm-filter-group">
                <label className="sm-filter-label">Status</label>
                <select
                  className="sm-filter-select"
                  value={statusFilter}
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Warning">Warning</option>
                  <option value="Suspended">Suspended</option>
                  <option value="">All</option>
                </select>
              </div>

              <div className="sm-filter-actions">
                <button
                  className="sm-reset-btn"
                  onClick={() => { setSearch(''); setClass(''); setStatus('Active') }}
                >
                  Reset
                </button>
                <button className="sm-apply-btn">Apply</button>
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
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={i}>
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
                      <td className="sm-id">{s.id}</td>
                      <td>{s.class}</td>
                      <td><AttendanceBar value={s.attendance} /></td>
                      <td>
                        <span className={`sm-badge sm-badge-${s.status.toLowerCase()}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="sm-pagination">
                <span className="sm-page-info">Showing 1 to 4 of <strong>240</strong> results</span>
                <div className="sm-page-btns">
                  <button className="sm-page-btn"><MdChevronLeft size={16} /></button>
                  {[1, 2, 3].map(n => (
                    <button
                      key={n}
                      className={`sm-page-btn ${activePage === n ? 'sm-page-active' : ''}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button className="sm-page-btn"><MdChevronRight size={16} /></button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

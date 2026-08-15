'use client'

import React, { useState } from 'react'
import {
  MdDashboard, MdPeople, MdCalendarToday, MdGrade,
  MdSchedule, MdSettings, MdSearch, MdSave
} from 'react-icons/md'
import { PiGraduationCapFill } from 'react-icons/pi'

const navItems = [
  { name: 'Dashboard',  Icon: MdDashboard },
  { name: 'Students',   Icon: MdPeople },
  { name: 'Attendance', Icon: MdCalendarToday },
  { name: 'Grades',     Icon: MdGrade },
  { name: 'Schedule',   Icon: MdSchedule },
]

type AttStatus = 'Present' | 'Absent' | 'Late' | null

const initialStudents = [
  { id: '1042', avatar: 'AS', color: '#10b981', name: 'Alex Smith',       status: 'Present' as AttStatus },
  { id: '1045', avatar: 'BJ', color: '#6366f1', name: 'Bella Johnson',    status: 'Absent'  as AttStatus },
  { id: '1051', avatar: 'CW', color: '#f59e0b', name: 'Charlie Williams', status: 'Present' as AttStatus },
  { id: '1060', avatar: 'DM', color: '#3b82f6', name: 'David Miller',     status: 'Late'    as AttStatus },
]

export default function MarkAttendance() {
  const [activeNav, setActiveNav]   = useState('Attendance')
  const [classVal, setClassVal]     = useState('Grade 10 - Mathematics')
  const [dateVal, setDateVal]       = useState('2023-10-24')
  const [students, setStudents]     = useState(initialStudents)
  const [saved, setSaved]           = useState(false)

  const setStatus = (id: string, status: AttStatus) => {
    setSaved(false)
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s))
  }

  const markAllPresent = () => {
    setSaved(false)
    setStudents(prev => prev.map(s => ({ ...s, status: 'Present' as AttStatus })))
  }

  const present      = students.filter(s => s.status === 'Present').length
  const absent       = students.filter(s => s.status === 'Absent').length
  const late         = students.filter(s => s.status === 'Late').length
  const totalEnrolled = 32

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
            <input placeholder="Search students, classes..." />
          </div>
        </header>

        {/* Content */}
        <div className="td-content">

          {/* Page heading row */}
          <div className="at-head-row">
            <div>
              <h1 className="sm-title">Mark Attendance</h1>
              <p className="at-sub">Select class and date to manage student presence.</p>
            </div>
            <div className="at-controls">
              <div className="at-control-group">
                <label className="at-ctrl-label">Class</label>
                <select
                  className="at-select"
                  value={classVal}
                  onChange={e => setClassVal(e.target.value)}
                >
                  <option>Grade 10 - Mathematics</option>
                  <option>Grade 9 - Science</option>
                  <option>Grade 11 - English</option>
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
            <div className="at-table-head">
              <div className="at-col-id">ID</div>
              <div className="at-col-name">Student Name</div>
              <div className="at-col-actions">
                <button className="at-mark-all" onClick={markAllPresent}>
                  Mark All Present
                </button>
              </div>
            </div>

            {/* Rows */}
            {students.map((s) => (
              <div key={s.id} className="at-row">
                <div className="at-col-id at-id-text">{s.id}</div>
                <div className="at-col-name">
                  <div className="at-student-cell">
                    <div className="at-avatar" style={{ background: s.color }}>{s.avatar}</div>
                    <span className="at-name">{s.name}</span>
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
            ))}

            {/* Save button */}
            <div className="at-footer">
              <button
                className={`at-save-btn ${saved ? 'at-saved' : ''}`}
                onClick={() => setSaved(true)}
              >
                <MdSave size={16} />
                {saved ? 'Saved!' : 'Save Attendance'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

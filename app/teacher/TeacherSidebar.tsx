'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MdDashboard, MdPeople, MdCalendarToday, MdAssignment,
  MdPersonAdd, MdThumbUp, MdBarChart, MdSettings,
  MdLogout
} from 'react-icons/md'
import { PiGraduationCapFill } from 'react-icons/pi'

const navItems = [
  { name: 'Dashboard', Icon: MdDashboard, href: '/teacher/dashboard' },
  { name: 'Students', Icon: MdPeople, href: '/teacher/students' },
  { name: 'Attendance', Icon: MdCalendarToday, href: '/teacher/attendance' },
  { name: 'Leave Requests', Icon: MdAssignment, href: '/teacher/leave' },
  { name: 'Add Student', Icon: MdPersonAdd, href: '/teacher/add-student' },
  { name: 'Approval', Icon: MdThumbUp, href: '/teacher/approval' },
  { name: 'Reports', Icon: MdBarChart, href: '/teacher/reports' },
]

export default function TeacherSidebar() {
  const pathname = usePathname()

  return (
    <aside className="td-sidebar">
      {/* Logo */}
      <Link href="/teacher/dashboard" style={{ textDecoration: 'none' }}>
        <div className="td-logo">
          <div className="td-logo-icon">
            <PiGraduationCapFill size={20} color="white" />
          </div>
          <div>
            <p className="td-logo-title">EduPortal</p>
            <p className="td-logo-sub">Management System</p>
          </div>
        </div>
      </Link>

      {/* Nav List */}
      <nav className="td-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`td-nav-item ${isActive ? 'td-nav-active' : ''}`}
            >
              <item.Icon size={18} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Settings */}
      <Link
        href="/teacher/settings"
        className={`td-nav-item td-settings ${pathname === '/teacher/settings' ? 'td-nav-active' : ''}`}
        style={{ margin: '0 8px', textDecoration: 'none' }}
      >
        <MdSettings size={18} />
        <span>Settings</span>
      </Link>

      {/* Logout under Settings */}
      <Link 
        href="/login" 
        className="td-nav-item td-logout" 
        style={{ textDecoration: 'none' }}
      >
        <MdLogout size={18} />
        <span>Logout</span>
      </Link>
    </aside>
  )
}

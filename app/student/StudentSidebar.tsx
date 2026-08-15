'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MdDashboard, MdPeople, MdCalendarToday, MdGrade,
  MdSchedule, MdSettings, MdLogout
} from 'react-icons/md'
import { PiGraduationCapFill } from 'react-icons/pi'

const navItems = [
  { name: 'Dashboard', Icon: MdDashboard, href: '/student/dashboard' },
  { name: 'Students', Icon: MdPeople, href: '/student/dashboard' },
  { name: 'Attendance', Icon: MdCalendarToday, href: '/student/leave' },
  { name: 'Grades', Icon: MdGrade, href: '/student/report' },
  { name: 'Schedule', Icon: MdSchedule, href: '/student/dashboard' },
]

export default function StudentSidebar() {
  const pathname = usePathname()

  return (
    <aside className="db-sidebar">
      {/* Logo */}
      <Link href="/student/dashboard" style={{ textDecoration: 'none' }}>
        <div className="db-logo">
          <div className="db-logo-icon">
            <PiGraduationCapFill size={22} color="white" />
          </div>
          <div>
            <p className="db-logo-title">EduPortal</p>
            <p className="db-logo-sub">MANAGEMENT SYSTEM</p>
          </div>
        </div>
      </Link>

      {/* Nav List */}
      <nav className="db-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.name === 'Attendance' && pathname?.startsWith('/student/leave'))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`db-nav-item ${isActive ? 'db-nav-active' : ''}`}
            >
              <item.Icon size={20} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Settings */}
      <Link
        href="/student/settings"
        className={`db-nav-item db-settings ${pathname === '/student/settings' ? 'db-nav-active' : ''}`}
      >
        <MdSettings size={20} />
        <span>Settings</span>
      </Link>

      {/* Logout under Settings */}
      <Link
        href="/login"
        className="db-nav-item db-logout"
        style={{ textDecoration: 'none' }}
      >
        <MdLogout size={20} />
        <span>Logout</span>
      </Link>
    </aside>
  )
}

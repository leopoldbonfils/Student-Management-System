'use client'

import React, { useState } from 'react'
import {
  MdDashboard, MdPeople, MdCalendarToday,
  MdSchedule, MdSettings, MdEdit, MdSearch,
  MdSchool, MdEmail, MdPerson, MdLocationOn,
  MdCheckCircle, MdClass, MdMap, MdSupervisorAccount
} from 'react-icons/md'
import { PiGraduationCapFill } from 'react-icons/pi'

const navItems = [
  { name: 'Dashboard', Icon: MdDashboard, href: '/student/dashboard' },
  { name: 'Students', Icon: MdPeople, href: '#' },
  { name: 'Attendance', Icon: MdCalendarToday, href: '/student/leave' },
  { name: 'Schedule', Icon: MdSchedule, href: '#' },
]

export default function StudentProfile() {
  const [activeNav, setActiveNav] = useState('Settings')

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

        <button 
          className={`db-nav-item db-settings ${activeNav === 'Settings' ? 'db-nav-active' : ''}`}
          onClick={() => setActiveNav('Settings')}
        >
          <MdSettings size={20} />
          <span>Settings</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="db-main">
        {/* Header */}
        <header className="db-header">
          <div className="db-search" style={{ maxWidth: 280 }}>
            <MdSearch size={16} color="#9ca3af" />
            <input type="text" placeholder="Search EduPortal..." />
          </div>
        </header>

        {/* Content Area */}
        <div className="db-content">
          {/* Breadcrumbs & Title */}
          <div className="pf-breadcrumbs">
            <span>Students</span>
            <span className="sl-sep">&rsaquo;</span>
            <span className="pf-crumb-active">Student Profile</span>
          </div>

          <h1 className="pf-page-title">Alex Johnson Profile</h1>

          {/* Hero Banner Card */}
          <div className="pf-hero-card">
            <div className="pf-hero-left">
              <div className="pf-avatar-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop" 
                  alt="Alex Johnson" 
                  className="pf-avatar-img"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>

              <div className="pf-hero-info">
                <h2 className="pf-name">Alex Johnson</h2>
                <p className="pf-role">
                  <MdSchool size={14} className="pf-role-icon" />
                  <span>Grade 10 - Section A</span>
                  <span className="pf-dot">•</span>
                  <span>Science Stream</span>
                </p>

                <div className="pf-badge-group">
                  <span className="pf-badge-active">
                    <MdCheckCircle size={13} /> Active Student
                  </span>
                  <span className="pf-badge-email">
                    <MdEmail size={13} /> alex.johnson@eduportal.edu
                  </span>
                </div>
              </div>
            </div>

            <button className="pf-edit-btn">
              <MdEdit size={16} />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* Lower Grid Details */}
          <div className="pf-grid">
            {/* Left Column */}
            <div className="pf-col">
              {/* Personal Information */}
              <div className="pf-card">
                <div className="pf-card-head">
                  <MdPerson size={18} className="pf-head-icon" />
                  <h3 className="pf-card-title">Personal Information</h3>
                </div>

                <div className="pf-fields-grid">
                  <div className="pf-field">
                    <span className="pf-label">FULL NAME</span>
                    <span className="pf-value">Alex William Johnson</span>
                  </div>
                  <div className="pf-field">
                    <span className="pf-label">EMAIL ADDRESS</span>
                    <span className="pf-value pf-link">alex.johnson@eduportal.edu</span>
                  </div>
                  <div className="pf-field">
                    <span className="pf-label">PHONE NUMBER</span>
                    <span className="pf-value">+1 (555) 349-8120</span>
                  </div>
                  <div className="pf-field">
                    <span className="pf-label">DATE OF BIRTH</span>
                    <span className="pf-value">March 22, 2008</span>
                  </div>
                  <div className="pf-field">
                    <span className="pf-label">GENDER</span>
                    <span className="pf-value">Male</span>
                  </div>
                </div>
              </div>

              {/* Contact & Guardian Address */}
              <div className="pf-card">
                <div className="pf-card-head">
                  <MdLocationOn size={18} className="pf-head-icon" />
                  <h3 className="pf-card-title">Contact Address</h3>
                </div>

                <div className="pf-address-box">
                  <div className="pf-address-icon">
                    <MdMap size={20} />
                  </div>
                  <div>
                    <span className="pf-label">RESIDENTIAL ADDRESS</span>
                    <div className="pf-address-text">
                      <p>742 Evergreen Terrace</p>
                      <p>West Seattle</p>
                      <p>Seattle, WA 98116</p>
                      <p>United States</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="pf-col">
              {/* Academic Details */}
              <div className="pf-card">
                <div className="pf-card-head">
                  <MdSchool size={18} className="pf-head-icon" />
                  <h3 className="pf-card-title">Academic Details</h3>
                </div>

                <div className="pf-fields-grid">
                  <div className="pf-field">
                    <span className="pf-label">Student ID</span>
                    <span className="pf-value pf-bold">STU-2024-001</span>
                  </div>
                  <div className="pf-field">
                    <span className="pf-label">Enrollment Date</span>
                    <span className="pf-value">September 01, 2023</span>
                  </div>
                  <div className="pf-field pf-full">
                    <span className="pf-label">ACADEMIC ADVISOR</span>
                    <div className="pf-qual-row">
                      <MdSupervisorAccount size={16} className="pf-qual-icon" />
                      <span className="pf-value">Dr. Sarah Mitchell (Mathematics Dept.)</span>
                    </div>
                  </div>
                  <div className="pf-field pf-full">
                    <span className="pf-label">STREAM & MAJOR</span>
                    <span className="pf-value">General High School Science & Mathematics</span>
                  </div>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div className="pf-card">
                <div className="pf-card-head pf-space-between">
                  <div className="pf-head-left">
                    <MdClass size={18} className="pf-head-icon" />
                    <h3 className="pf-card-title">Enrolled Courses</h3>
                  </div>
                  <span className="pf-count-badge">5 Total</span>
                </div>

                <div className="pf-classes-list">
                  <div className="pf-class-pill">
                    <span className="pf-dot pf-dot-blue" />
                    <span>Grade 10-A Math</span>
                  </div>
                  <div className="pf-class-pill">
                    <span className="pf-dot pf-dot-green" />
                    <span>Physics 101</span>
                  </div>
                  <div className="pf-class-pill">
                    <span className="pf-dot pf-dot-blue" />
                    <span>Chemistry Lab</span>
                  </div>
                  <div className="pf-class-pill">
                    <span className="pf-dot pf-dot-purple" />
                    <span>English Literature</span>
                  </div>
                  <div className="pf-class-pill">
                    <span className="pf-dot pf-dot-green" />
                    <span>World History</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

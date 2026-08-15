'use client'

import React, { useState } from 'react'
import {
  MdDashboard, MdPeople, MdCalendarToday, MdGrade,
  MdSchedule, MdSettings, MdEdit, MdSearch,
  MdWork, MdEmail, MdPerson, MdLocationOn,
  MdCheckCircle, MdSchool, MdClass, MdMap
} from 'react-icons/md'
import { PiGraduationCapFill } from 'react-icons/pi'

const navItems = [
  { name: 'Dashboard',  Icon: MdDashboard,     href: '/teacher/dashboard' },
  { name: 'Students',   Icon: MdPeople,        href: '/teacher/students' },
  { name: 'Attendance', Icon: MdCalendarToday, href: '/teacher/attendance' },
  { name: 'Grades',     Icon: MdGrade,         href: '#' },
  { name: 'Schedule',   Icon: MdSchedule,      href: '#' },
]

export default function TeacherProfile() {
  const [activeNav, setActiveNav] = useState('Settings')

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

        <button 
          className={`td-nav-item td-settings ${activeNav === 'Settings' ? 'td-nav-active' : ''}`}
          onClick={() => setActiveNav('Settings')}
        >
          <MdSettings size={18} />
          <span>Settings</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="td-main">
        {/* Top Header */}
        <header className="td-topbar">
          <div className="sm-header-search" style={{ width: 320 }}>
            <MdSearch size={16} color="#9ca3af" />
            <input placeholder="Search EduPortal..." />
          </div>
        </header>

        {/* Content Area */}
        <div className="td-content">
          {/* Breadcrumbs & Title */}
          <div className="pf-breadcrumbs">
            <span>Faculty</span>
            <span className="sl-sep">&rsaquo;</span>
            <span className="pf-crumb-active">Teacher Profile</span>
          </div>

          <h1 className="pf-page-title">Dr. Sarah Mitchell Profile</h1>

          {/* Hero Banner Card */}
          <div className="pf-hero-card">
            <div className="pf-hero-left">
              <div className="pf-avatar-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop" 
                  alt="Dr. Sarah Mitchell" 
                  className="pf-avatar-img"
                  onError={(e) => {
                    // Fallback to stylized initial if image fails
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>

              <div className="pf-hero-info">
                <h2 className="pf-name">Dr. Sarah Mitchell</h2>
                <p className="pf-role">
                  <MdWork size={14} className="pf-role-icon" />
                  <span>Senior Mathematics Faculty</span>
                  <span className="pf-dot">•</span>
                  <span>Science & Math Dept.</span>
                </p>

                <div className="pf-badge-group">
                  <span className="pf-badge-active">
                    <MdCheckCircle size={13} /> Active Staff
                  </span>
                  <span className="pf-badge-email">
                    <MdEmail size={13} /> s.mitchell@eduportal.edu
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
                    <span className="pf-value">Sarah Elizabeth Mitchell</span>
                  </div>
                  <div className="pf-field">
                    <span className="pf-label">EMAIL ADDRESS</span>
                    <span className="pf-value pf-link">s.mitchell@eduportal.edu</span>
                  </div>
                  <div className="pf-field">
                    <span className="pf-label">PHONE NUMBER</span>
                    <span className="pf-value">+1 (555) 123-4567</span>
                  </div>
                  <div className="pf-field">
                    <span className="pf-label">DATE OF BIRTH</span>
                    <span className="pf-value">October 14, 1982</span>
                  </div>
                  <div className="pf-field">
                    <span className="pf-label">GENDER</span>
                    <span className="pf-value">Female</span>
                  </div>
                </div>
              </div>

              {/* Contact Address */}
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
                      <p>482 Academic Way, Apt 3B</p>
                      <p>University District</p>
                      <p>Seattle, WA 98105</p>
                      <p>United States</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="pf-col">
              {/* Professional Details */}
              <div className="pf-card">
                <div className="pf-card-head">
                  <MdWork size={18} className="pf-head-icon" />
                  <h3 className="pf-card-title">Professional Details</h3>
                </div>

                <div className="pf-fields-grid">
                  <div className="pf-field">
                    <span className="pf-label">Employee ID</span>
                    <span className="pf-value pf-bold">EMP-2018-042</span>
                  </div>
                  <div className="pf-field">
                    <span className="pf-label">Date Joined</span>
                    <span className="pf-value">August 15, 2018</span>
                  </div>
                  <div className="pf-field pf-full">
                    <span className="pf-label">HIGHEST QUALIFICATION</span>
                    <div className="pf-qual-row">
                      <MdSchool size={16} className="pf-qual-icon" />
                      <span className="pf-value">Ph.D. in Applied Mathematics</span>
                    </div>
                  </div>
                  <div className="pf-field pf-full">
                    <span className="pf-label">SPECIALIZATION</span>
                    <span className="pf-value">Advanced Calculus, Linear Algebra</span>
                  </div>
                </div>
              </div>

              {/* Assigned Classes */}
              <div className="pf-card">
                <div className="pf-card-head pf-space-between">
                  <div className="pf-head-left">
                    <MdClass size={18} className="pf-head-icon" />
                    <h3 className="pf-card-title">Assigned Classes</h3>
                  </div>
                  <span className="pf-count-badge">4 Total</span>
                </div>

                <div className="pf-classes-list">
                  <div className="pf-class-pill">
                    <span className="pf-dot pf-dot-blue" />
                    <span>Grade 10-A</span>
                  </div>
                  <div className="pf-class-pill">
                    <span className="pf-dot pf-dot-green" />
                    <span>Grade 11-B</span>
                  </div>
                  <div className="pf-class-pill">
                    <span className="pf-dot pf-dot-blue" />
                    <span>Grade 12-A</span>
                  </div>
                  <div className="pf-class-pill">
                    <span className="pf-dot pf-dot-purple" />
                    <span>AP Calculus</span>
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

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import { MdNotifications } from 'react-icons/md'

function formatNameFromEmail(email?: string): string {
  if (!email) return ''
  const namePart = email.split('@')[0] || ''
  const words = namePart.replace(/[._-]/g, ' ').split(' ').filter(Boolean)
  if (words.length === 0) return ''
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export function getInitials(name?: string, email?: string): string {
  const clean = (name || formatNameFromEmail(email) || 'User').trim()
  const parts = clean.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    const first = parts[0]?.[0] || ''
    const second = parts[1]?.[0] || ''
    return (first + second).toUpperCase()
  }
  return clean.slice(0, 2).toUpperCase()
}

interface TopbarRightProps {
  defaultRole?: 'Teacher' | 'Student'
}

export default function TopbarRight({ defaultRole }: TopbarRightProps) {
  const { user, profile } = useAuth()
  const [imageError, setImageError] = useState(false)

  const role = profile?.role
    ? profile.role === 'teacher'
      ? 'Teacher'
      : 'Student'
    : defaultRole || 'Teacher'

  const emailDerivedName = formatNameFromEmail(profile?.email || user?.email || '')
  const displayName =
    profile?.name ||
    user?.displayName ||
    emailDerivedName ||
    (role === 'Teacher' ? 'Teacher' : 'Student')

  const initials = getInitials(displayName, profile?.email || user?.email || '')
  const avatarUrl = profile?.avatar || user?.photoURL
  const profileHref = role === 'Teacher' ? '/teacher/profile' : '/student/profile'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
      {/* Notification Bell with Red Dot */}
      <button
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          color: '#4b5563',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
          borderRadius: '50%',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        title="Notifications"
      >
        <MdNotifications size={22} color="#4b5563" />
        {/* Red notification dot badge */}
        <span
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            border: '1.5px solid #ffffff',
          }}
        />
      </button>

      {/* User Profile Link -> Navigates to /teacher/profile or /student/profile */}
      <Link
        href={profileHref}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '8px',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        title={`View ${displayName}'s Profile`}
      >
        {avatarUrl && !imageError ? (
          <img
            src={avatarUrl}
            alt={displayName}
            onError={() => setImageError(true)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1px solid #e5e7eb',
            }}
          />
        ) : (
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              flexShrink: 0,
              boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)',
            }}
          >
            {initials}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            {displayName}
          </span>
          <span
            style={{
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: 500,
              lineHeight: 1.2,
            }}
          >
            {role}
          </span>
        </div>
      </Link>
    </div>
  )
}

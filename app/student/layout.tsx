import React from 'react'
import StudentSidebar from './StudentSidebar'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="db-wrapper">
      <StudentSidebar />
      <div className="db-main">
        {children}
      </div>
    </div>
  )
}

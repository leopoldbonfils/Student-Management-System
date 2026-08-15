import React from 'react'
import TeacherSidebar from './TeacherSidebar'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="td-wrapper">
      <TeacherSidebar />
      <div className="td-main">
        {children}
      </div>
    </div>
  )
}

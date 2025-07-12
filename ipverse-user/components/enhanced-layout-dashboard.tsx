"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { EnhancedSidebar } from "@/components/enhanced-sidebar"
import { EnhancedTopbar } from "@/components/enhanced-topbar"

export function EnhancedLayoutDashboard({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ipverse-sidebar-collapsed")
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved))
    }
  }, [])

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("ipverse-sidebar-collapsed", JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  return (
    <div className="flex h-screen bg-gray-50">
      <EnhancedSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300`}>
        <EnhancedTopbar onMenuClick={() => setSidebarOpen(true)} isCollapsed={sidebarCollapsed} />

        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}

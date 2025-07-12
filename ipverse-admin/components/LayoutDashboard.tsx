"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "./AdminSidebar"
import AdminTopbar from "./AdminTopbar"

export default function LayoutDashboard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    // Load collapse state from localStorage
    const savedCollapseState = localStorage.getItem("sidebarCollapsed")
    if (savedCollapseState) {
      setIsCollapsed(JSON.parse(savedCollapseState))
    }
  }, [router])

  const handleToggleCollapse = () => {
    const newCollapseState = !isCollapsed
    setIsCollapsed(newCollapseState)
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newCollapseState))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />
      <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        <AdminTopbar isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

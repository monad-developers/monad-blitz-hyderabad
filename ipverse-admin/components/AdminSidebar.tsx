"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Plus,
  FolderOpen,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronLeft,
  ChevronRight,
  Building2
} from "lucide-react"

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Create Companies", href: "/dashboard/manage-companies", icon: Building2 },
  { name: "Add Project", href: "/dashboard/add-project", icon: Plus },
  { name: "Manage Projects", href: "/dashboard/manage-projects", icon: FolderOpen },
  { name: "Profile", href: "/dashboard/profile", icon: User },
]

interface AdminSidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export default function AdminSidebar({ isCollapsed, onToggleCollapse }: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("adminName")
    router.push("/login")
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Collapse Toggle */}
          <div className="flex items-center justify-between px-4 py-4 border-b">
            {/* Logo - only show when not collapsed */}
            <div
              className={`flex items-center transition-all duration-200 ${
                isCollapsed ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100"
              }`}
            >
              <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 whitespace-nowrap">IPVerse</span>
            </div>

            {/* Collapse Toggle - always visible */}
            <button
              onClick={onToggleCollapse}
              className={`flex p-1.5 rounded-md hover:bg-gray-100 transition-colors ${
                isCollapsed ? "lg:mx-auto" : "hidden lg:flex"
              }`}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              )}
            </button>

            {/* Logo icon only for collapsed state */}
            {isCollapsed && (
              <div className="hidden lg:flex h-10 w-10 bg-indigo-600 rounded-lg items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-white" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700 border-r-2 border-indigo-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    } ${isCollapsed ? "lg:justify-center" : ""}`}
                    title={isCollapsed ? item.name : ""}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? "" : "mr-3"}`} />
                    <span
                      className={`transition-opacity duration-200 whitespace-nowrap ${
                        isCollapsed ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100"
                      }`}
                    >
                      {item.name}
                    </span>
                  </Link>

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 hidden lg:block">
                      {item.name}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="px-2 py-4 border-t">
            <div className="relative group">
              <button
                onClick={handleLogout}
                className={`flex items-center w-full px-3 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 ${
                  isCollapsed ? "lg:justify-center" : ""
                }`}
                title={isCollapsed ? "Logout" : ""}
              >
                <LogOut className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? "" : "mr-3"}`} />
                <span
                  className={`transition-opacity duration-200 whitespace-nowrap ${
                    isCollapsed ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100"
                  }`}
                >
                  Logout
                </span>
              </button>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 hidden lg:block">
                  Logout
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

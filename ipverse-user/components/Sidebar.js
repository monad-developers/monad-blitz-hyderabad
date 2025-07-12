"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderOpen,
  TrendingUp,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    href: "/dashboard/projects",
    icon: FolderOpen,
  },
  {
    name: "My Investments",
    href: "/dashboard/investments",
    icon: TrendingUp,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export default function Sidebar({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      // On desktop, sidebar is open by default
      if (!mobile) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isOpen && isMobile) {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isMobile])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${!isOpen && !isMobile ? "lg:w-16" : "lg:w-64"}
        `}
        aria-label="Sidebar navigation"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className={`flex items-center ${!isOpen && !isMobile ? "lg:justify-center" : ""}`}>
            <h1
              className={`text-xl font-bold text-blue-600 transition-opacity duration-200 ${!isOpen && !isMobile ? "lg:opacity-0 lg:w-0" : "opacity-100"}`}
            >
              IPVerse 
            </h1>
          </div>

          {/* Mobile Close Button */}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2" role="navigation">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-lg
                  transition-all duration-200 group relative
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }
                  ${!isOpen && !isMobile ? "lg:justify-center lg:px-2" : ""}
                `}
                onClick={() => isMobile && setIsOpen(false)}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${!isOpen && !isMobile ? "" : "mr-3"}`} />
                <span
                  className={`transition-opacity duration-200 ${!isOpen && !isMobile ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100"}`}
                >
                  {item.name}
                </span>

                {/* Tooltip for collapsed state */}
                {!isOpen && !isMobile && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            className={`
              flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg
              hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 group relative
              ${!isOpen && !isMobile ? "lg:justify-center lg:px-2" : ""}
            `}
            aria-label="Logout"
          >
            <LogOut className={`h-5 w-5 flex-shrink-0 ${!isOpen && !isMobile ? "" : "mr-3"}`} />
            <span
              className={`transition-opacity duration-200 ${!isOpen && !isMobile ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100"}`}
            >
              Logout
            </span>

            {/* Tooltip for collapsed state */}
            {!isOpen && !isMobile && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>

        {/* Desktop Toggle Button */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
          </button>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className={`transition-all duration-300 ${!isOpen && !isMobile ? "lg:ml-0" : ""}`}>
            <h2 className="text-lg font-semibold text-gray-900">Welcome back, John Doe!</h2>
            <p className="text-sm text-gray-600">Ready to explore new investment opportunities?</p>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main
          className={`
            flex-1 overflow-auto p-6 transition-all duration-300
            ${!isOpen && !isMobile ? "lg:ml-0" : ""}
          `}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

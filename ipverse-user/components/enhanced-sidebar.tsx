"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import {
  LayoutDashboard,
  FolderOpen,
  TrendingUp,
  User,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Vault,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "IP Marketplace", href: "/dashboard/projects", icon: FolderOpen },
  { name: "Portfolio", href: "/dashboard/investments", icon: TrendingUp },
  { name: "Profile", href: "/dashboard/profile", icon: User },
]

interface EnhancedSidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export function EnhancedSidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }: EnhancedSidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)

      // On mobile, always use overlay mode
      if (mobile) {
        setIsCollapsed(false)
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [setIsCollapsed])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key closes mobile sidebar
      if (event.key === "Escape" && isOpen && isMobile) {
        setIsOpen(false)
      }
      // Ctrl/Cmd + B toggles sidebar on desktop
      if ((event.ctrlKey || event.metaKey) && event.key === "b" && !isMobile) {
        event.preventDefault()
        setIsCollapsed(!isCollapsed)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isCollapsed, isMobile, setIsOpen, setIsCollapsed])

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  const toggleCollapse = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          // Mobile behavior
          isMobile
            ? ["w-64", isOpen ? "translate-x-0" : "-translate-x-full"]
            : [
                // Desktop behavior
                "translate-x-0",
                isCollapsed ? "w-16" : "w-64",
              ],
        )}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div
              className={cn(
                "flex items-center transition-all duration-300",
                !isMobile && isCollapsed ? "justify-center" : "space-x-3",
              )}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Vault className="h-5 w-5 text-white" />
              </div>
              <h1
                className={cn(
                  "text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300",
                  !isMobile && isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100",
                )}
              >
                IPVerse 
              </h1>
            </div>

            {/* Mobile close button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2" role="navigation">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center text-sm font-medium rounded-lg transition-all duration-200 relative",
                      !isMobile && isCollapsed ? "justify-center px-3 py-3" : "px-3 py-2",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-gray-900",
                    )}
                    onClick={() => isMobile && setIsOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    title={!isMobile && isCollapsed ? item.name : undefined}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0 transition-all duration-200",
                        !isMobile && isCollapsed ? "" : "mr-3",
                      )}
                    />

                    <span
                      className={cn(
                        "transition-all duration-300 truncate",
                        !isMobile && isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100",
                      )}
                    >
                      {item.name}
                    </span>

                    {/* Active indicator for collapsed state */}
                    {isActive && !isMobile && isCollapsed && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-l-full" />
                    )}
                  </Link>

                  {/* Tooltip for collapsed state */}
                  {!isMobile && isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 top-1/2 transform -translate-y-1/2">
                      {item.name}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="relative group">
              <button
                onClick={handleLogout}
                className={cn(
                  "flex items-center w-full text-sm font-medium text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50 hover:text-red-600 transition-all duration-200",
                  !isMobile && isCollapsed ? "justify-center px-3 py-3" : "px-3 py-2",
                )}
                title={!isMobile && isCollapsed ? "Logout" : undefined}
              >
                <LogOut
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-all duration-200",
                    !isMobile && isCollapsed ? "" : "mr-3",
                  )}
                />

                <span
                  className={cn(
                    "transition-all duration-300",
                    !isMobile && isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100",
                  )}
                >
                  Logout
                </span>
              </button>

              {/* Tooltip for collapsed logout */}
              {!isMobile && isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 top-1/2 transform -translate-y-1/2">
                  Logout
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                </div>
              )}
            </div>
          </div>

          {/* Desktop collapse toggle */}
          {!isMobile && (
            <Button
              onClick={toggleCollapse}
              variant="ghost"
              size="icon"
              className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={`${isCollapsed ? "Expand" : "Collapse"} sidebar (Ctrl+B)`}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              )}
            </Button>
          )}
        </div>
      </aside>
    </>
  )
}

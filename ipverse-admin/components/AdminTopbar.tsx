"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, User, LogOut, Menu, Wallet2 } from "lucide-react"

interface AdminTopbarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export default function AdminTopbar({ isCollapsed, onToggleCollapse }: AdminTopbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [adminName, setAdminName] = useState("")
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const name = localStorage.getItem("adminName") || "Admin"
    const storedAddress = localStorage.getItem("walletAddress")
    setAdminName(name)
    setWalletAddress(storedAddress)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("adminName")
    localStorage.removeItem("walletAddress")
    router.push("/login")
  }

  const connectWallet = async () => {
    if (typeof window === 'undefined') {
      console.log("Window is undefined. This code must run in a browser.")
      alert("This feature is only available in a browser environment.")
      return
    }

    if (typeof (window as any).ethereum === 'undefined') {
      console.log("MetaMask is not installed or not detected.")
      alert("Please install MetaMask extension to connect your wallet.")
      return
    }

    try {
      console.log("Attempting to connect to MetaMask...")
      await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
      const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
      
      if (accounts.length > 0) {
        const address = accounts[0]
        console.log("Connected account:", address)
        localStorage.setItem("walletAddress", address)
        setWalletAddress(address)
        alert("Wallet connected successfully: " + address)
      } else {
        console.log("No accounts found after connection attempt.")
        alert("No MetaMask accounts available. Please ensure MetaMask is unlocked and has accounts.")
      }
    } catch (error) {
      console.error("MetaMask connection error:", error)
      if ((error as any).code === 4001) {
        alert("User rejected the connection request in MetaMask.")
      } else {
        alert("Failed to connect to MetaMask: " + (error as Error).message)
      }
    }
  }

  const disconnectWallet = () => {
    setWalletAddress(null)
    localStorage.removeItem("walletAddress")
    alert("Wallet disconnected.")
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Collapse toggle for desktop */}
        <div className="flex items-center">
          <button
            onClick={onToggleCollapse}
            className="flex lg:flex p-2 rounded-md hover:bg-gray-100 transition-colors mr-4"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Right side - Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <span className="text-gray-700 font-medium">
              {adminName} {walletAddress ? `| ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : ""}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
              <button
                onClick={() => {
                  setIsDropdownOpen(false)
                  router.push("/dashboard/profile")
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <User className="mr-3 h-4 w-4" />
                Profile
              </button>
              {!walletAddress && (
                <button
                  onClick={connectWallet}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50"
                >
                  <Wallet2 className="mr-3 h-4 w-4" />
                  Connect wallet
                </button>
              )}
              {walletAddress && (
                <button
                  onClick={disconnectWallet}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Disconnect Wallet
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
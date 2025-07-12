"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LayoutDashboard from "@/components/LayoutDashboard"
import { User, Mail, Shield, Edit, LogOut } from "lucide-react"
import { apiFetch } from "@/lib/api"

type AdminProfile = {
  _id: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLogin: string
}

export default function ProfilePage() {
  const [admin, setAdmin] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await apiFetch<{ success: boolean; data: { admin: AdminProfile } }>("/auth/profile")
        setAdmin(res.data.admin)
      } catch (err: any) {
        setError(err.message || "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("adminName")
    router.push("/login")
  }

  const handleEditProfile = () => {
    alert("Edit profile functionality would be implemented here")
  }

  if (loading) return <LayoutDashboard><div>Loading...</div></LayoutDashboard>
  if (error) return <LayoutDashboard><div className="text-red-600">{error}</div></LayoutDashboard>

  return (
    <LayoutDashboard>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your admin account settings and preferences.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{admin?.email}</h2>
                <p className="text-indigo-100">{admin?.role}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="text-gray-900">{admin?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="text-gray-900">{admin?.role}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Account Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${admin?.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {admin?.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="text-gray-900">{admin?.lastLogin ? new Date(admin.lastLogin).toLocaleString() : ""}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0">
                <button
                  onClick={handleEditProfile}
                  className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <button className="text-indigo-600 hover:text-indigo-700 font-medium">Enable</button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Change Password</p>
                <p className="text-sm text-gray-500">Update your account password</p>
              </div>
              <button className="text-indigo-600 hover:text-indigo-700 font-medium">Change</button>
            </div>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  )
}

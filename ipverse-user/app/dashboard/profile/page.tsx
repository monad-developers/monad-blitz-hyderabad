"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { userApi, type UserProfile } from "@/lib/api"

const getAccountStats = (accountData: {
  memberSince: string;
  totalInvestments: number;
  portfolioValue: number;
  kycStatus: string;
}) => [
  { label: "Member Since", value: accountData.memberSince },
  { label: "Total Investments", value: accountData.totalInvestments.toString() },
  { label: "Portfolio Value", value: `$${accountData.portfolioValue.toLocaleString()}` },
  { label: "Account Status", value: accountData.kycStatus.charAt(0).toUpperCase() + accountData.kycStatus.slice(1) },
]

const recentActivity = [
  {
    action: "Invested in Marvel Studios IP Token",
    amount: "$5,000",
    date: "2024-03-15",
    type: "investment",
  },
  {
    action: "Received dividend from Netflix Original Series",
    amount: "$125",
    date: "2024-03-10",
    type: "dividend",
  },
  {
    action: "Profile updated",
    amount: null,
    date: "2024-03-05",
    type: "profile",
  },
  {
    action: "Invested in Gaming IP Portfolio",
    amount: "$2,000",
    date: "2024-03-01",
    type: "investment",
  },
]

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const [accountData, setAccountData] = useState({
    memberSince: "",
    totalInvestments: 0,
    portfolioValue: 0,
    kycStatus: "pending",
    phone: "",
    location: ""
  })
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchProfileData = async () => {
    try {
      const { data: profileData } = await userApi.getProfile()
      setAccountData(prev => ({
        ...prev,
        phone: profileData.phone || "",
        location: profileData.location || ""
      }))
    } catch (error) {
      console.error("Error fetching profile data:", error)
    }
  }

  useEffect(() => {
    if (user) {
      // Format member since date
      const memberSince = new Date(user.lastLogin || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      })

      setAccountData(prev => ({
        ...prev,
        memberSince,
        totalInvestments: user.totalInvestments || 0,
        portfolioValue: user.walletBalance || 0,
        kycStatus: user.kycStatus || 'pending'
      }))

      fetchProfileData()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Please log in to view your profile</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account information and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile" />
                  <AvatarFallback className="text-lg">JD</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">Member since {accountData.memberSince}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-gray-900">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-gray-900">{accountData.phone || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <p className="mt-1 text-gray-900">{accountData.location || "Not provided"}</p>
                </div>
              </div>

              <Button 
                className="w-full sm:w-auto" 
                onClick={() => setIsUpdating(true)} 
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Account Stats and Activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {getAccountStats(accountData).map((stat, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{stat.label}</span>
                  <span className="font-medium">
                    {stat.label === "Account Status" ? <Badge variant="default">{stat.value}</Badge> : stat.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === "investment"
                          ? "bg-blue-500"
                          : activity.type === "dividend"
                            ? "bg-green-500"
                            : "bg-gray-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                        {activity.amount && (
                          <p
                            className={`text-xs font-medium ${
                              activity.type === "dividend" ? "text-green-600" : "text-blue-600"
                            }`}
                          >
                            {activity.amount}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

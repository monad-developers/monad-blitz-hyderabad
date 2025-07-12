"use client"

import { useState, useEffect } from "react"
import ProtectedRoute from "@/components/ProtectedRoute"
import LayoutDashboard from "@/components/LayoutDashboard"
import { TrendingUp, Users, Coins, DollarSign } from "lucide-react"

export default function DashboardPage() {
  const [adminName, setAdminName] = useState("")
  const [kpis, setKpis] = useState({
    totalProjects: 0,
    totalInvestors: 0,
    totalTokensSold: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    const name = localStorage.getItem("adminName") || "Admin"
    setAdminName(name)

    // Mock KPI data
    setKpis({
      totalProjects: 12,
      totalInvestors: 1847,
      totalTokensSold: 45623,
      totalRevenue: 234.7,
    })
  }, [])

  const kpiCards = [
    {
      title: "Total Projects",
      value: kpis.totalProjects,
      icon: TrendingUp,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "Total Investors",
      value: kpis.totalInvestors.toLocaleString(),
      icon: Users,
      color: "bg-green-500",
      change: "+8%",
    },
    {
      title: "Tokens Sold",
      value: kpis.totalTokensSold.toLocaleString(),
      icon: Coins,
      color: "bg-purple-500",
      change: "+23%",
    },
    {
      title: "Revenue (ETH)",
      value: kpis.totalRevenue,
      icon: DollarSign,
      color: "bg-orange-500",
      change: "+15%",
    },
  ]

  return (
    <ProtectedRoute>
      <LayoutDashboard>
        <div className="space-y-6">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">Welcome back, {adminName}! 👋</h1>
            <p className="text-indigo-100">Here's what's happening with your IP tokenization platform today.</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiCards.map((kpi, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                    <p className="text-sm text-green-600 mt-1">{kpi.change} from last month</p>
                  </div>
                  <div className={`${kpi.color} p-3 rounded-lg`}>
                    <kpi.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">New project "AI Music Rights" created</span>
                <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">1,250 tokens sold for "Digital Art Collection"</span>
                <span className="text-xs text-gray-500 ml-auto">4 hours ago</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700">New investor registered: john.doe@email.com</span>
                <span className="text-xs text-gray-500 ml-auto">6 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </LayoutDashboard>
    </ProtectedRoute>
  )
}

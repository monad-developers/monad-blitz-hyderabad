import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, FolderOpen, Target, ArrowRight } from "lucide-react"

const stats = [
  {
    title: "Total Invested",
    value: "$24,500",
    change: "+12.5%",
    icon: DollarSign,
    color: "text-green-600",
  },
  {
    title: "Active Projects",
    value: "8",
    change: "+2 this month",
    icon: FolderOpen,
    color: "text-blue-600",
  },
  {
    title: "Portfolio Value",
    value: "$28,750",
    change: "+17.3%",
    icon: TrendingUp,
    color: "text-purple-600",
  },
  {
    title: "ROI",
    value: "17.3%",
    change: "+2.1% this month",
    icon: Target,
    color: "text-orange-600",
  },
]

const recentProjects = [
  {
    name: "Marvel Studios IP Token",
    investment: "$5,000",
    tokens: 250,
    status: "Active",
    return: "+15.2%",
  },
  {
    name: "Netflix Original Series",
    investment: "$3,500",
    tokens: 175,
    status: "Active",
    return: "+8.7%",
  },
  {
    name: "Indie Film Collection",
    investment: "$2,000",
    tokens: 100,
    status: "Completed",
    return: "+22.1%",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Track your tokenized IP investments and portfolio performance</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects">
            Explore Projects
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.color}`}>{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Investments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProjects.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-600">
                    {project.tokens} tokens • {project.investment}
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-medium ${
                      project.return.startsWith("+") ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {project.return}
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full ${
                      project.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {project.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Eye } from "lucide-react"
import Link from "next/link"

const investments = [
  {
    id: 1,
    projectName: "Marvel Studios IP Token",
    tokens: 250,
    totalInvested: 5000,
    currentValue: 5760,
    return: 15.2,
    date: "2024-01-15",
    status: "Active",
  },
  {
    id: 2,
    projectName: "Netflix Original Series",
    tokens: 175,
    totalInvested: 2625,
    currentValue: 2853,
    return: 8.7,
    date: "2024-02-03",
    status: "Active",
  },
  {
    id: 3,
    projectName: "Indie Film Collection",
    tokens: 100,
    totalInvested: 1000,
    currentValue: 1221,
    return: 22.1,
    date: "2024-01-28",
    status: "Completed",
  },
  {
    id: 4,
    projectName: "Gaming IP Portfolio",
    tokens: 80,
    totalInvested: 2000,
    currentValue: 1920,
    return: -4.0,
    date: "2024-03-10",
    status: "Active",
  },
  {
    id: 5,
    projectName: "Music Royalties Token",
    tokens: 50,
    totalInvested: 1500,
    currentValue: 1665,
    return: 11.0,
    date: "2024-02-20",
    status: "Active",
  },
]

const totalStats = {
  totalInvested: investments.reduce((sum, inv) => sum + inv.totalInvested, 0),
  currentValue: investments.reduce((sum, inv) => sum + inv.currentValue, 0),
  totalReturn: 0,
}
totalStats.totalReturn = ((totalStats.currentValue - totalStats.totalInvested) / totalStats.totalInvested) * 100

export default function InvestmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Investments</h1>
        <p className="text-gray-600">Track your tokenized IP investment portfolio</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalStats.totalInvested.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalStats.currentValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold flex items-center ${
                totalStats.totalReturn >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {totalStats.totalReturn >= 0 ? (
                <TrendingUp className="h-5 w-5 mr-1" />
              ) : (
                <TrendingDown className="h-5 w-5 mr-1" />
              )}
              {totalStats.totalReturn.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Investment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Project</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Tokens</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Invested</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Current Value</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Return</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((investment) => (
                  <tr key={investment.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{investment.projectName}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{investment.tokens.toLocaleString()}</td>
                    <td className="py-4 px-4 text-gray-600">${investment.totalInvested.toLocaleString()}</td>
                    <td className="py-4 px-4 text-gray-600">${investment.currentValue.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <div
                        className={`flex items-center ${investment.return >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {investment.return >= 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {investment.return.toFixed(1)}%
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{new Date(investment.date).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <Badge variant={investment.status === "Active" ? "default" : "secondary"}>
                        {investment.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/project/${investment.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

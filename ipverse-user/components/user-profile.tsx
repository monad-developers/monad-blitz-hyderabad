import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit } from "lucide-react"

export function UserProfile() {
  return (
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
            <h3 className="text-xl font-semibold">John Doe</h3>
            <p className="text-gray-600">john.doe@example.com</p>
            <p className="text-sm text-gray-500">Member since March 2024</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <p className="mt-1 text-gray-900">John Doe</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">john.doe@example.com</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <p className="mt-1 text-gray-900">+1 (555) 123-4567</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Location</label>
            <p className="mt-1 text-gray-900">San Francisco, CA</p>
          </div>
        </div>

        <Button className="w-full sm:w-auto">
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import LayoutDashboard from "@/components/LayoutDashboard"
import ProjectForm from "@/components/ProjectForm"
import { CheckCircle } from "lucide-react"
import { apiFetch } from "@/lib/api"

export default function AddProjectPage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleProjectSubmit = async (projectData: any) => {
    setError("")
    try {
      // Call your backend API using apiFetch
      const res = await apiFetch<{ success: boolean; message: string; data: any }>(
        "/projects/createproject",
        {
          method: "POST",
          body: JSON.stringify(projectData),
        }
      )
      console.log("res is here why you fear ",res);
      if (res.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (err: any) {
      setError(err.message || "Failed to create project")
    }
  }

  return (
    <LayoutDashboard>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New IP Project</h1>
          <p className="text-gray-600 mt-2">Add a new intellectual property tokenization project to your platform.</p>
        </div>

        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50">
            <CheckCircle className="h-5 w-5" />
            <span>Project created successfully!</span>
          </div>
        )}

        {/* Error Toast */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <ProjectForm onSubmit={handleProjectSubmit} />
        </div>
      </div>
    </LayoutDashboard>
  )
}

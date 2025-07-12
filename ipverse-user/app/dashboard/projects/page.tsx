"use client"

import { useEffect, useState } from "react"
import { ProjectCard } from "@/components/project-card"
import { projectApi } from "@/lib/api"
import type { Project } from "@/lib/api"
import { toast } from "sonner"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await projectApi.getAllProjects()
        console.log("response is here",response);
        console.log("response data is here",response.data);
        setProjects(response.data.projects)
      } catch (error) {
        console.error("Failed to fetch projects:", error)
        toast.error("Failed to load projects. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available IP Assets</h1>
          <p className="text-gray-600">Discover and invest in tokenized intellectual property portfolios</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-t-lg" />
              <div className="space-y-4 p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Available IP Assets</h1>
        <p className="text-gray-600">Discover and invest in tokenized intellectual property portfolios</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(projects) && projects.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    </div>
  )
}

"use client";

import { useState, useEffect } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";
import ProjectTable from "@/components/ProjectTable";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api"


interface Project {
  id: string;
  name: string;
  tokenPrice: number;
  totalTokens: number;
  soldTokens: number;
  status: "Active" | "Completed" | "Upcoming";
  startDate: string;
  endDate: string;
}

export default function ManageProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await apiFetch<{
          success: boolean;
          data: {
            projects: Array<{
              _id: string;
              title: string;
              tokenPrice: number;
              totalTokens: number;
              soldTokens: number;
              status: string;
              startDate: string;
              endDate: string;
            }>;
          };
        }>("/projects/allprojectlist");
        if (response.success) {
          const mappedProjects = response.data.projects.map((project) => ({
            id: project._id,
            name: project.title,
            tokenPrice: project.tokenPrice,
            totalTokens: project.totalTokens,
            soldTokens: project.soldTokens,
            status: mapStatus(project.status), // Map backend status to UI status
            startDate: new Date(project.startDate).toISOString().split("T")[0],
            endDate: new Date(project.endDate).toISOString().split("T")[0],
          }));
          setProjects(mappedProjects);
          setFilteredProjects(mappedProjects);
        }
      } catch (err) {
        setError("Failed to fetch projects. Please try again later.");
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const filtered = projects.filter((project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [searchTerm, projects]);

  const handleEdit = (project: Project) => {
    console.log("Edit project:", project);
    alert(`Edit functionality for "${project.name}" would be implemented here`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      console.log("Deleted project:", id);
    }
  };

  // Helper function to map backend status to UI status
  const mapStatus = (status: string): "Active" | "Completed" | "Upcoming" => {
    switch (status.toLowerCase()) {
      case "active":
        return "Active";
      case "funded":
      case "closed":
        return "Completed";
      case "draft":
      case "upcoming":
        return "Upcoming";
      default:
        return "Upcoming"; // Default fallback
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  return (
    <LayoutDashboard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Projects</h1>
            <p className="text-gray-600 mt-2">View and manage all your IP tokenization projects.</p>
          </div>
          <Link
            href="/dashboard/add-project"
            className="mt-4 sm:mt-0 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Project</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-500">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <ProjectTable
            projects={filteredProjects}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </LayoutDashboard>
  );
}
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, TrendingUp, Users, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"
import { projectApi } from "@/lib/api"
import type { Project } from "@/lib/api"
import { toast } from "sonner"

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [tokenAmount, setTokenAmount] = useState(1)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [investing, setInvesting] = useState(false)

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await projectApi.getProjectById(projectId)
        console.log("response is here id", response)
        setProject(response.data.project) // Updated to access response.data.project
      } catch (error) {
        console.error("Failed to fetch project:", error)
        toast.error("Failed to load project details. Please try again later.")
      }
    }

    fetchProject()
  }, [projectId])

  const handleInvest = async () => {
    if (!project) return

    try {
      setInvesting(true)
      await projectApi.investInProject(project._id, tokenAmount)
      toast.success(`Successfully invested ${tokenAmount} tokens in ${project.title}`) 
    } catch (error) {
      console.error("Investment failed:", error)
      toast.error("Investment failed. Please try again later.")
    } finally {
      setInvesting(false)
    }
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>

        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-gray-200 rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  // Safely get the image URL: prefer images[0], then image, then fallback
  const fallbackImage = "https://via.placeholder.com/800x400?text=No+Image"
  const imageSrc =
    (Array.isArray(project.images) && project.images.length > 0 && project.images[0]) ||
    project.image ||
    fallbackImage
  const imageUrl = imageSrc.includes("?")
    ? imageSrc.replace(/\?.*$/, "?auto=format&fit=crop&w=800&q=80")
    : `${imageSrc}?auto=format&fit=crop&w=800&q=80`

  const totalAmount = tokenAmount * (project.tokenPrice || 0) 

  // Helper to safely format numbers
  const safeNumber = (value: any, fallback = 0) => (typeof value === 'number' && !isNaN(value) ? value : fallback)
  const safeLocaleString = (value: any, fallback = '0') => (typeof value === 'number' && !isNaN(value) ? value.toLocaleString() : fallback)

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/dashboard/projects">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="aspect-video relative bg-gray-100">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse bg-gray-200 w-full h-full"></div>
                </div>
              )}
              {!imageError ? (
                <img
                  src={imageUrl}
                  alt={project.title} 
                  className={`w-full h-full object-cover rounded-t-lg transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                  onError={() => { setImageError(true); setImageLoading(false); }}
                  onLoad={() => setImageLoading(false)}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                  <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2ZM3 15l4.586-4.586a2 2 0 0 1 2.828 0L17 17" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8.5" cy="8.5" r="1.5" fill="#888"/></svg>
                </div>
              )}
              <Badge className="absolute top-4 right-4">{project.category}</Badge>
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{project.title}</CardTitle>
                  <p className="text-gray-600 mt-2">{project.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">${safeNumber(project.tokenPrice)}</p> 
                  <p className="text-sm text-gray-500">per token</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{project.expectedReturns || 'N/A'}</p> 
                <p className="text-xs text-gray-500">Expected Return</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{project.details && typeof project.details.investors !== 'undefined' ? project.details.investors : 0}</p>
                <p className="text-xs text-gray-500">Investors</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{project.details && typeof project.details.duration !== 'undefined' ? project.details.duration : 'N/A'}</p>
                <p className="text-xs text-gray-500">Duration</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{project.details && typeof project.details.totalRaised !== 'undefined' ? project.details.totalRaised : 'N/A'}</p>
                <p className="text-xs text-gray-500">Total Raised</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Project Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(project.details && Array.isArray(project.details.highlights) ? project.details.highlights : []).map((highlight: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Make Investment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tokens">Number of Tokens</Label>
                <Input
                  id="tokens"
                  type="number"
                  min="1"
                  max={safeNumber(project.availableTokens)}
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(Number.parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Min: {safeNumber(project.minInvestment) / (safeNumber(project.tokenPrice) || 1)} tokens • Max: {safeLocaleString(project.availableTokens)}{' '}
                  available
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Token Price:</span>
                  <span>${safeNumber(project.tokenPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>{tokenAmount}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount:</span>
                  <span>${totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <Button
                onClick={handleInvest}
                className="w-full"
                disabled={tokenAmount < (safeNumber(project.minInvestment) / (safeNumber(project.tokenPrice) || 1)) || investing}
              >
                {investing ? "Processing..." : "Invest Now"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Token Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Available</span>
                  <span>{safeLocaleString(project.availableTokens)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total</span>
                  <span>{safeLocaleString(project.totalTokens)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full"
                    style={{
                      width: `${(safeNumber(project.availableTokens) / safeNumber(project.totalTokens)) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {Math.round((safeNumber(project.availableTokens) / safeNumber(project.totalTokens)) * 100)}% available
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
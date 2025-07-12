"use client"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, TrendingUp, Users } from "lucide-react"

import type { Project } from "@/lib/api"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  // Provide a fallback image if project.image is missing or undefined
  const fallbackImage = "https://via.placeholder.com/600x400?text=No+Image";
  const imageSrc =
    (Array.isArray(project.images) && project?.images.length > 0 && project.images[0]) ||
    fallbackImage;
  // Process image URL to ensure high quality and proper formatting
  const imageUrl = imageSrc.includes('?') 
    ? imageSrc.replace(/\?.*$/, "?auto=format&fit=crop&w=600&h=400&q=80")
    : `${imageSrc}?auto=format&fit=crop&w=600&h=400&q=80`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group relative">
      <Link href={`/project/${project._id}`} className="absolute inset-0 z-10" aria-label={`View ${project.name} details`} />
      
      <div className="aspect-video relative bg-gray-100">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse bg-gray-200 w-full h-full" />
          </div>
        )}
        
        {!imageError ? (
          <img 
            src={imageUrl}
            alt={project.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        <Badge 
          className="absolute top-2 right-2 bg-black/70 text-white border-0 z-20"
          variant="secondary"
        >
          {project.category}
        </Badge>
      </div>
      
      <CardHeader>
        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
          {project.name}
        </CardTitle>
        <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold text-primary">${project.price}</p>
            <p className="text-xs text-gray-500">per token</p>
          </div>
          <div className="text-right flex items-center gap-1 justify-end">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-600">{project.expectedReturn}</p>
              <p className="text-xs text-gray-500">expected return</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{project.details && typeof project.details.investors !== 'undefined' ? project.details.investors : 0} investors</span>
            </span>
            <span className="font-medium">
              {((project.availableTokens / project.totalTokens) * 100).toFixed(1)}% available
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-full rounded-full transition-all duration-300"
              style={{
                width: `${(project.availableTokens / project.totalTokens) * 100}%`,
              }}
            />
          </div>
          <div className="text-xs text-gray-500 text-right">
            {project.availableTokens.toLocaleString()} / {project.totalTokens.toLocaleString()} tokens
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

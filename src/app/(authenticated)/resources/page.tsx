'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Video, 
  FileText, 
  Download,
  ExternalLink,
  Search,
  Filter,
  Star
} from 'lucide-react'

// Mock resources data
const resourceCategories = [
  {
    id: 'training',
    name: 'Training Materials',
    icon: BookOpen,
    color: 'bg-blue-500',
    count: 45
  },
  {
    id: 'videos',
    name: 'Video Library',
    icon: Video,
    color: 'bg-red-500',
    count: 128
  },
  {
    id: 'playbooks',
    name: 'Playbooks',
    icon: FileText,
    color: 'bg-green-500',
    count: 23
  },
  {
    id: 'forms',
    name: 'Forms & Documents',
    icon: Download,
    color: 'bg-purple-500',
    count: 17
  }
]

const recentResources = [
  {
    title: 'Advanced Dodging Techniques',
    type: 'Video',
    category: 'Training',
    rating: 4.8,
    duration: '12:34',
    addedDate: '2025-01-14'
  },
  {
    title: 'Team Practice Plan Template',
    type: 'Document',
    category: 'Forms',
    rating: 4.9,
    size: '2.4 MB',
    addedDate: '2025-01-13'
  },
  {
    title: 'Transition Offense Playbook',
    type: 'Playbook',
    category: 'Strategy',
    rating: 4.7,
    pages: 24,
    addedDate: '2025-01-12'
  },
  {
    title: 'Goalie Training Fundamentals',
    type: 'Video Series',
    category: 'Training',
    rating: 4.9,
    duration: '45:20',
    addedDate: '2025-01-11'
  }
]

export default function ResourcesPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Resources
            </h1>
            <p className="text-gray-600 mt-1">
              Access training materials, videos, playbooks, and coaching resources
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Resource Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {resourceCategories.map((category) => {
          const Icon = category.icon
          return (
            <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${category.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary">{category.count}</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Browse {category.count} resources
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recently Added */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recently Added</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentResources.map((resource, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="bg-gray-100 p-2 rounded-lg mr-4">
                    {resource.type === 'Video' || resource.type === 'Video Series' ? (
                      <Video className="h-5 w-5 text-gray-600" />
                    ) : resource.type === 'Document' ? (
                      <Download className="h-5 w-5 text-gray-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{resource.title}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {resource.category}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        {resource.rating}
                      </div>
                      <span className="text-sm text-gray-500">
                        {resource.duration || resource.size || `${resource.pages} pages`}
                      </span>
                      <span className="text-sm text-gray-500">
                        Added {resource.addedDate}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Coach's Toolkit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Essential coaching resources and practice planning tools
            </p>
            <Button className="w-full">
              Access Toolkit
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="h-5 w-5 mr-2" />
              Featured Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Curated videos and training materials from top coaches
            </p>
            <Button variant="outline" className="w-full">
              Browse Featured
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
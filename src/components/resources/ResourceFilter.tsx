'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal,
  FileText,
  Video,
  Link,
  File,
  Users,
  Calendar,
  Tag,
  Star
} from 'lucide-react'

export interface FilterState {
  searchQuery: string
  category: string | null
  resourceType: string | null
  ageGroups: string[]
  roles: string[]
  tags: string[]
  sortBy: 'newest' | 'popular' | 'rating' | 'alphabetical'
  onlyFavorites: boolean
  onlyDownloaded: boolean
}

interface ResourceFilterProps {
  onFilterChange: (filters: FilterState) => void
  activeFilters: FilterState
  userRole: string
  categories: Array<{ id: string; name: string }>
  availableTags?: string[]
  resultCount?: number
}

export default function ResourceFilter({
  onFilterChange,
  activeFilters,
  userRole,
  categories,
  availableTags = [],
  resultCount = 0
}: ResourceFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState<FilterState>(activeFilters)

  // Resource types
  const resourceTypes = [
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'pdf', label: 'PDFs', icon: FileText },
    { value: 'template', label: 'Templates', icon: File },
    { value: 'link', label: 'Links', icon: Link }
  ]

  // Age groups
  const ageGroups = [
    { value: '8-10', label: '8-10 years' },
    { value: '11-14', label: '11-14 years' },
    { value: '15+', label: '15+ years' }
  ]

  // Roles (for filtering who the resource is for)
  const roles = [
    { value: 'coach', label: 'Coaches' },
    { value: 'player', label: 'Players' },
    { value: 'parent', label: 'Parents' },
    { value: 'director', label: 'Directors' }
  ]

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'alphabetical', label: 'A-Z' }
  ]

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(activeFilters)
  }, [activeFilters])

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localFilters.searchQuery !== activeFilters.searchQuery) {
        onFilterChange(localFilters)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [localFilters.searchQuery])

  // Handle filter update
  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    
    // Don't debounce for non-search filters
    if (key !== 'searchQuery') {
      onFilterChange(newFilters)
    }
  }

  // Handle array filter updates (for checkboxes)
  const toggleArrayFilter = (key: 'ageGroups' | 'roles' | 'tags', value: string) => {
    const current = localFilters[key]
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    
    updateFilter(key, updated)
  }

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters: FilterState = {
      searchQuery: '',
      category: null,
      resourceType: null,
      ageGroups: [],
      roles: [],
      tags: [],
      sortBy: 'newest',
      onlyFavorites: false,
      onlyDownloaded: false
    }
    setLocalFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  // Count active filters
  const activeFilterCount = [
    localFilters.category,
    localFilters.resourceType,
    localFilters.ageGroups.length > 0,
    localFilters.roles.length > 0,
    localFilters.tags.length > 0,
    localFilters.onlyFavorites,
    localFilters.onlyDownloaded
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search resources..."
            value={localFilters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Resource Type Quick Filters */}
        {resourceTypes.map(type => {
          const Icon = type.icon
          const isActive = localFilters.resourceType === type.value
          return (
            <Button
              key={type.value}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('resourceType', isActive ? null : type.value)}
            >
              <Icon className="h-3 w-3 mr-1" />
              {type.label}
            </Button>
          )
        })}
        
        {/* Favorites Quick Filter */}
        <Button
          variant={localFilters.onlyFavorites ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateFilter('onlyFavorites', !localFilters.onlyFavorites)}
        >
          <Star className={`h-3 w-3 mr-1 ${localFilters.onlyFavorites ? 'fill-current' : ''}`} />
          Favorites
        </Button>
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {resultCount} resource{resultCount !== 1 ? 's' : ''} found
        </div>
        <Select
          value={localFilters.sortBy}
          onValueChange={(value: any) => updateFilter('sortBy', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <Card>
          <CardContent className="p-4">
            <Accordion type="single" collapsible defaultValue="category">
              {/* Category Filter */}
              <AccordionItem value="category">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Category
                    {localFilters.category && (
                      <Badge variant="secondary">{localFilters.category}</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={localFilters.category === category.name}
                          onCheckedChange={(checked) => 
                            updateFilter('category', checked ? category.name : null)
                          }
                        />
                        <label
                          htmlFor={`category-${category.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Age Groups Filter */}
              <AccordionItem value="age-groups">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Age Groups
                    {localFilters.ageGroups.length > 0 && (
                      <Badge variant="secondary">{localFilters.ageGroups.length}</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {ageGroups.map(group => (
                      <div key={group.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`age-${group.value}`}
                          checked={localFilters.ageGroups.includes(group.value)}
                          onCheckedChange={() => toggleArrayFilter('ageGroups', group.value)}
                        />
                        <label
                          htmlFor={`age-${group.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {group.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Target Audience Filter */}
              <AccordionItem value="roles">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Target Audience
                    {localFilters.roles.length > 0 && (
                      <Badge variant="secondary">{localFilters.roles.length}</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {roles.map(role => (
                      <div key={role.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role.value}`}
                          checked={localFilters.roles.includes(role.value)}
                          onCheckedChange={() => toggleArrayFilter('roles', role.value)}
                        />
                        <label
                          htmlFor={`role-${role.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {role.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <AccordionItem value="tags">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags
                      {localFilters.tags.length > 0 && (
                        <Badge variant="secondary">{localFilters.tags.length}</Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map(tag => {
                        const isSelected = localFilters.tags.includes(tag)
                        return (
                          <Badge
                            key={tag}
                            variant={isSelected ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleArrayFilter('tags', tag)}
                          >
                            {tag}
                            {isSelected && <X className="h-3 w-3 ml-1" />}
                          </Badge>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Additional Filters */}
              <AccordionItem value="additional">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Additional Filters
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="only-downloaded"
                        checked={localFilters.onlyDownloaded}
                        onCheckedChange={(checked) => 
                          updateFilter('onlyDownloaded', !!checked)
                        }
                      />
                      <label
                        htmlFor="only-downloaded"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Only show downloaded resources
                      </label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {localFilters.category && (
            <Badge variant="secondary" className="gap-1">
              Category: {localFilters.category}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('category', null)}
              />
            </Badge>
          )}
          {localFilters.resourceType && (
            <Badge variant="secondary" className="gap-1">
              Type: {localFilters.resourceType}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('resourceType', null)}
              />
            </Badge>
          )}
          {localFilters.ageGroups.map(age => (
            <Badge key={age} variant="secondary" className="gap-1">
              Age: {age}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('ageGroups', age)}
              />
            </Badge>
          ))}
          {localFilters.roles.map(role => (
            <Badge key={role} variant="secondary" className="gap-1">
              For: {role}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('roles', role)}
              />
            </Badge>
          ))}
          {localFilters.onlyFavorites && (
            <Badge variant="secondary" className="gap-1">
              Favorites only
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('onlyFavorites', false)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
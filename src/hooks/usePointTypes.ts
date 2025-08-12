import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface PointType {
  id: number
  name: string
  display_name: string
  plural_name: string
  slug: string
  icon_url: string
  description?: string
  conversion_rate?: number
  is_active?: boolean
  metadata?: any
  created_at?: string
  updated_at?: string
  // Legacy interface compatibility
  title?: string
  image_url?: string
}

export function usePointTypes() {
  const [pointTypes, setPointTypes] = useState<PointType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPointTypes()
  }, [])

  const fetchPointTypes = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('point_types_powlax')
        .select('*')
        .order('id')

      if (fetchError) {
        throw fetchError
      }

      setPointTypes(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch point types'
      setError(errorMessage)
      console.error('Point types fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Get point type by name (checks name, display_name, and slug)
  const getPointTypeByName = (name: string): PointType | undefined => {
    return pointTypes.find(type => 
      type.name.toLowerCase() === name.toLowerCase() ||
      type.display_name.toLowerCase() === name.toLowerCase() ||
      type.slug === name ||
      type.display_name.toLowerCase().replace(/\s+/g, '_') === name.toLowerCase()
    )
  }

  // Get point types relevant to a series
  const getRelevantPointTypes = (seriesType?: string): PointType[] => {
    // For now, return all active point types
    // This could be enhanced to filter by series type in the future
    return pointTypes
  }

  return {
    pointTypes,
    loading,
    error,
    getPointTypeByName,
    getRelevantPointTypes,
    refetch: fetchPointTypes
  }
}
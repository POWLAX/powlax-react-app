import { supabase } from '@/lib/supabase'
import DrillDetails from '@/components/details/DrillDetails'
import StrategyDetails from '@/components/details/StrategyDetails'

type PageParams = {
  params: {
    type: 'drill' | 'strategy'
    id: string
  }
}

type BaseEntity = {
  id: string
  title: string
  description?: string
  videoUrl?: string
  equipment?: string[]
  tags?: string[]
}

async function fetchDrill(id: string): Promise<BaseEntity | null> {
  // Try common drill table names in priority order
  const drillTables: string[] = ['drills', 'powlax_drills', 'staging_wp_drills']

  for (const table of drillTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) {
        continue
      }
      if (!data) {
        continue
      }
      const title: string = (data.name as string) || (data.title as string) || `Drill ${id}`
      const description: string | undefined =
        (data.description as string) || (data.notes as string) || undefined
      const videoUrl: string | undefined =
        (data.drill_video_url as string) || (data.video_url as string) || undefined
      const equipmentRaw: unknown = (data.equipment_needed as unknown) ?? undefined
      const tagsRaw: unknown =
        (data.tags as unknown) ?? (data.skill_ids as unknown) ?? (data.concept_ids as unknown)

      const equipment: string[] | undefined = normalizeStringArray(equipmentRaw)
      const tags: string[] | undefined = normalizeStringArray(tagsRaw)
      return { id, title, description, videoUrl, equipment, tags }
    } catch {
      continue
    }
  }

  return null
}

async function fetchStrategy(id: string): Promise<BaseEntity | null> {
  const strategyTables: string[] = ['powlax_strategies', 'strategies', 'staging_wp_strategies']

  for (const table of strategyTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) {
        continue
      }
      if (!data) {
        continue
      }
      const title: string = (data.name as string) || (data.title as string) || `Strategy ${id}`
      const description: string | undefined = (data.description as string) || undefined
      const videoUrl: string | undefined = (data.video_url as string) || undefined
      const tags: string[] | undefined = normalizeStringArray((data.tags as unknown) ?? undefined)

      return { id, title, description, videoUrl, tags }
    } catch {
      continue
    }
  }

  return null
}

function normalizeStringArray(input: unknown): string[] | undefined {
  if (input == null) return undefined
  if (Array.isArray(input)) return input.map((v) => String(v))
  if (typeof input === 'string') {
    const trimmed: string = input.trim()
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      // Postgres array style
      return trimmed
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return parsed.map((v) => String(v))
    } catch {
      // not JSON, continue
    }
    return trimmed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return undefined
}

export default async function Page({ params }: PageParams) {
  const { type, id } = params

  let entity: BaseEntity | null = null
  try {
    if (type === 'drill') {
      entity = await fetchDrill(id)
    } else if (type === 'strategy') {
      entity = await fetchStrategy(id)
    }
  } catch {
    entity = null
  }

  if (!entity) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-semibold">Item not found</h1>
        <p className="text-sm text-muted-foreground">No data was returned for the requested item.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {type === 'drill' ? (
        <DrillDetails data={entity} />
      ) : (
        <StrategyDetails data={entity} />
      )}
    </div>
  )
}



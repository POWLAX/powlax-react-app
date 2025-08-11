// Team Playbook Types

export interface TeamPlaybook {
  id: string
  team_id: string
  strategy_id: string
  strategy_source: 'powlax' | 'user'
  custom_name?: string
  team_notes?: string
  added_by: string
  created_at: string
  updated_at: string
}

export interface TeamPlaybookWithStrategy {
  id: string
  team_id: string
  strategy_id: string
  strategy_source: 'powlax' | 'user'
  custom_name?: string
  team_notes?: string
  added_by: string
  created_at: string
  updated_at: string
  // Strategy details populated from join
  strategy_name: string
  strategy_categories?: string
  description?: string
  lacrosse_lab_links?: any
  vimeo_link?: string
  thumbnail_urls?: any
  master_pdf_url?: string
}

export interface SaveToPlaybookData {
  team_id: string
  strategy_id: string
  strategy_source: 'powlax' | 'user'
  custom_name?: string
  team_notes?: string
}
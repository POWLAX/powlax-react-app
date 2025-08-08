import { SkillsAcademyHubEnhanced } from '@/components/skills-academy/SkillsAcademyHubEnhanced'
import { createServerClient } from '@/lib/supabase-server'

export default async function SkillsAcademyPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Skills Academy</h1>
        <p className="text-gray-600 mt-2">
          Progressive workout programs to master lacrosse fundamentals
        </p>
      </div>
      <SkillsAcademyHubEnhanced userId={user?.id} />
    </div>
  )
}
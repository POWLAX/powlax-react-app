import { SkillsAcademyHub } from '@/components/skills-academy/SkillsAcademyHub'
import { createServerClient } from '@/lib/supabase-server'

export default async function SkillsAcademyPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="container mx-auto px-4 py-8">
      <SkillsAcademyHub userId={user?.id} />
    </div>
  )
}
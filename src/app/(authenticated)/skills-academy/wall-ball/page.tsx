import { WallBallWorkoutHub } from '@/components/skills-academy/WallBallWorkoutHub'
import { createServerClient } from '@/lib/supabase-server'

export default async function WallBallPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="container mx-auto px-4 py-8">
      <WallBallWorkoutHub userId={user?.id} />
    </div>
  )
}
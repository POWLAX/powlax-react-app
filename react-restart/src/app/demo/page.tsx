import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Trophy, Target, Shield, Zap, Star, Award, 
  BookOpen, Users, ChevronRight, Calendar, User
} from 'lucide-react'

export default function DemoHomePage() {
  const demoPages = [
    {
      category: 'Skills Academy',
      icon: Trophy,
      color: 'text-yellow-500',
      pages: [
        { name: 'Public Overview', href: '/skills-academy', description: 'Marketing page' },
        { name: 'Workouts Browser', href: '/demo/skills-academy/workouts', description: 'Browse & start workouts' },
        { name: 'Progress Tracker', href: '/demo/skills-academy/progress', description: 'View progress & badges' },
        { name: 'Interactive Workout', href: '/demo/skills-academy/interactive-workout', description: 'Full workout with drill navigation & animations' }
      ]
    },
    {
      category: 'Strategies & Concepts',
      icon: BookOpen,
      color: 'text-blue-500',
      pages: [
        { name: 'Public Overview', href: '/strategies', description: 'Marketing page' },
        { name: 'Strategy Browser', href: '/demo/strategies', description: 'Browse with videos & Lab' }
      ]
    },
    {
      category: 'Gamification',
      icon: Award,
      color: 'text-purple-500',
      pages: [
        { name: 'Public Overview', href: '/gamification', description: 'System explanation' },
        { name: 'Player Dashboard', href: '/demo/gamification', description: 'Points, badges, ranks' }
      ]
    },
    {
      category: 'Practice Planner',
      icon: Calendar,
      color: 'text-green-500',
      pages: [
        { name: 'Practice Planner Demo', href: '/demo/practice-planner', description: 'Full practice planning tool' }
      ]
    },
    {
      category: 'Player Profile',
      icon: User,
      color: 'text-orange-500',
      pages: [
        { name: 'Player Profile Demo', href: '/demo/player-profile', description: 'Player card with avatar, rank, points & badges' }
      ]
    }
  ]

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">POWLAX Demo Navigation</h1>
        <p className="text-muted-foreground">
          Explore all the new pages without authentication. Data shown is a mix of real (strategies) and mock data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {demoPages.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <category.icon className={`w-6 h-6 ${category.color}`} />
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.pages.map((page) => (
                  <Link key={page.href} href={page.href}>
                    <div className="p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{page.name}</p>
                          <p className="text-sm text-muted-foreground">{page.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="font-semibold mb-2">🎯 Demo Notes:</h2>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Strategies page shows real data from database (221 records)</li>
          <li>• Skills Academy shows mock data (tables need import)</li>
          <li>• Gamification shows example points and badges</li>
          <li>• All video embeds use Vimeo URLs from database</li>
          <li>• Mobile responsive - try resizing your browser!</li>
        </ul>
      </div>
    </div>
  )
}
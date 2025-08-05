import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Clock, Target, PlayCircle } from 'lucide-react'

export default function SkillsAcademyDemoPage() {
  const skillsAcademyPages = [
    {
      name: 'Workouts Browser',
      href: '/demo/skills-academy/workouts',
      description: 'Browse and start workout sessions',
      icon: Trophy,
      color: 'text-yellow-500'
    },
    {
      name: 'Progress Tracker',
      href: '/demo/skills-academy/progress',
      description: 'View progress and earned badges',
      icon: Target,
      color: 'text-green-500'
    },
    {
      name: 'Interactive Workout',
      href: '/demo/skills-academy/interactive-workout',
      description: 'Full workout with drill navigation & animations',
      icon: PlayCircle,
      color: 'text-blue-500'
    }
  ]

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Demo Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-center">
          <div className="text-sm text-blue-700 font-medium">
            🏆 SKILLS ACADEMY DEMO - Transform your lacrosse skills
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">POWLAX Skills Academy</h1>
        <p className="text-muted-foreground">
          Explore our comprehensive skills training system with interactive workouts, progress tracking, and gamification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skillsAcademyPages.map((page, index) => {
          const IconComponent = page.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <IconComponent className={`w-6 h-6 ${page.color}`} />
                  {page.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {page.description}
                </p>
                <Button asChild className="w-full">
                  <Link href={page.href}>
                    Explore {page.name}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">About Skills Academy</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Structured Training</h3>
            <p className="text-sm text-gray-600">Progressive skill development with timed drills</p>
          </div>
          <div className="text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Gamification</h3>
            <p className="text-sm text-gray-600">Earn points, badges, and track your progress</p>
          </div>
          <div className="text-center">
            <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Skill Focus</h3>
            <p className="text-sm text-gray-600">Target specific lacrosse skills and techniques</p>
          </div>
        </div>
      </div>
    </div>
  )
}
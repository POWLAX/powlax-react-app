'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Trophy, Target, Shield, Zap, Star, Award, 
  TrendingUp, Calendar, Medal, Crown, Gem,
  ChevronRight, Users, Sparkles
} from 'lucide-react'
import Link from 'next/link'

export default function PublicGamificationPage() {
  const ranks = [
    { name: 'Rookie', level: 1, points: 0, icon: Star, color: 'text-gray-500' },
    { name: 'Starter', level: 2, points: 500, icon: Star, color: 'text-gray-600' },
    { name: 'Varsity', level: 3, points: 1500, icon: Star, color: 'text-blue-500' },
    { name: 'All-Conference', level: 5, points: 5000, icon: Medal, color: 'text-purple-500' },
    { name: 'All-State', level: 7, points: 10000, icon: Medal, color: 'text-orange-500' },
    { name: 'All-American', level: 10, points: 25000, icon: Crown, color: 'text-yellow-500' }
  ]

  const pointTypes = [
    {
      name: 'Lax Credits',
      icon: Gem,
      color: 'text-yellow-500',
      description: 'Base currency for all activities',
      earning: 'Complete any drill or workout'
    },
    {
      name: 'Attack Tokens',
      icon: Target,
      color: 'text-red-500',
      description: 'Offensive mastery points',
      earning: 'Excel in shooting and dodging drills'
    },
    {
      name: 'Defense Dollars',
      icon: Shield,
      color: 'text-blue-500',
      description: 'Defensive prowess rewards',
      earning: 'Master footwork and positioning'
    },
    {
      name: 'Midfield Medals',
      icon: Zap,
      color: 'text-green-500',
      description: 'Two-way play excellence',
      earning: 'Dominate transition drills'
    },
    {
      name: 'Rebound Rewards',
      icon: Trophy,
      color: 'text-purple-500',
      description: 'Wall ball dedication',
      earning: 'Complete wall ball workouts'
    },
    {
      name: 'Flex Points',
      icon: Sparkles,
      color: 'text-orange-500',
      description: 'Versatility bonuses',
      earning: 'Try new skills and challenges'
    }
  ]

  const sampleBadges = [
    {
      name: 'First Steps',
      tier: 'bronze',
      description: 'Complete your first workout',
      category: 'Getting Started'
    },
    {
      name: 'Week Warrior',
      tier: 'silver',
      description: '7-day practice streak',
      category: 'Consistency'
    },
    {
      name: 'Elite Shooter',
      tier: 'gold',
      description: 'Master all shooting drills',
      category: 'Skills Mastery'
    }
  ]

  const getBadgeColor = (tier: string) => {
    switch (tier) {
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'bronze': return 'bg-orange-100 text-orange-800 border-orange-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-primary-foreground/20 text-primary-foreground">
              New Gamification System
            </Badge>
            <h1 className="text-5xl font-bold mb-6">Level Up Your Lacrosse Journey</h1>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Turn practice into play with points, badges, ranks, and rewards. 
              Track progress, compete with friends, and become an elite player.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/login">Start Earning Points</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
                How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Point System */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Six Ways to Earn</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Every drill, workout, and achievement earns you points. Different activities 
          reward different point types based on the skills you're developing.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pointTypes.map((point) => (
            <Card key={point.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center ${point.color}`}>
                    <point.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg">{point.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">{point.description}</p>
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium">How to earn:</p>
                  <p className="text-sm text-muted-foreground">{point.earning}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Ranks System */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Rise Through the Ranks</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Progress from Rookie to All-American as you accumulate points and master new skills
          </p>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {ranks.map((rank, index) => (
                <div key={rank.name} className="flex items-center gap-4 p-4 bg-background rounded-lg shadow-sm">
                  <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center ${rank.color}`}>
                    <rank.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{rank.name}</h3>
                    <p className="text-sm text-muted-foreground">Level {rank.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{rank.points.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">points</p>
                  </div>
                  {index < ranks.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Badge System */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Earn Achievement Badges</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Unlock Bronze, Silver, and Gold badges as you complete challenges and master skills
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {sampleBadges.map((badge) => (
            <Card key={badge.name} className={`border-2 ${getBadgeColor(badge.tier)}`}>
              <CardContent className="p-6 text-center">
                <Award className="w-16 h-16 mx-auto mb-4" />
                <Badge className={`mb-3 ${getBadgeColor(badge.tier)}`}>
                  {badge.tier.toUpperCase()}
                </Badge>
                <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                <p className="text-xs text-muted-foreground">{badge.category}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <p className="text-center mt-8 text-muted-foreground">
          Plus 100+ more badges to discover and earn!
        </p>
      </section>

      {/* Features Grid */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Gamification Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Daily Streaks</h3>
              <p className="text-muted-foreground">
                Build consistency with daily practice streaks and bonus rewards
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Team Leaderboards</h3>
              <p className="text-muted-foreground">
                Compete with teammates and see who's putting in the work
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Progress Analytics</h3>
              <p className="text-muted-foreground">
                Track improvement over time with detailed performance metrics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of players leveling up their game with POWLAX
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/login">Create Your Profile</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link href="/skills-academy">
                Start Training <ChevronRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
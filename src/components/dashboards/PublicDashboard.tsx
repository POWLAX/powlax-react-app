'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ActionCard } from './ActionCard'
import { 
  Trophy, 
  Target, 
  Users,
  Play,
  BookOpen,
  Star,
  CheckCircle,
  ArrowRight,
  Zap,
  Award,
  Calendar,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'

export function PublicDashboard() {
  // Mock data for public showcase
  const mockData = {
    features: [
      {
        icon: Trophy,
        title: "Skills Academy",
        description: "Interactive training system with 160+ drills and progressive skill development",
        color: "orange" as const,
        href: "/demo/skills-academy"
      },
      {
        icon: Calendar,
        title: "Practice Planner",
        description: "Create professional practice plans with 167+ drills and strategies",
        color: "blue" as const,
        href: "/demo/practice-planner"
      },
      {
        icon: Users,
        title: "Team Management",
        description: "Manage teams, track progress, and engage players with gamification",
        color: "green" as const,
        href: "/demo/teams"
      }
    ],
    stats: [
      { label: "Training Drills", value: "160+" },
      { label: "Practice Strategies", value: "80+" },
      { label: "Active Clubs", value: "50+" },
      { label: "Player Achievements", value: "1000+" }
    ],
    testimonials: [
      {
        name: "Coach Sarah Johnson",
        role: "U14 Eagles Coach",
        content: "POWLAX transformed how we plan practices. The drill library and Skills Academy keep our players engaged and improving every day.",
        rating: 5
      },
      {
        name: "Mike Davis",
        role: "Club Director",
        content: "Our coaches love the practice planner, and parents love seeing their kids' progress through the Skills Academy gamification system.",
        rating: 5
      }
    ],
    benefits: [
      {
        title: "Progressive Training",
        description: "Age-appropriate skill development from beginners to advanced players",
        icon: Target
      },
      {
        title: "Gamified Learning",
        description: "Points, badges, and achievements keep players motivated",
        icon: Award
      },
      {
        title: "Coach Tools",
        description: "Professional practice planning and team management features",
        icon: BookOpen
      },
      {
        title: "Parent Engagement",
        description: "Track progress and stay connected with your child's development",
        icon: MessageSquare
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative p-8 md:p-12 lg:p-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Welcome to POWLAX
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              The complete lacrosse training platform for players, coaches, and clubs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700 text-white">
                <Link href="/auth/login" className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Link href="#features">
                  Learn More
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mockData.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600">{stat.value}</div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-8">
        {/* Features Section */}
        <section id="features" className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Lacrosse Excellence
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From individual skill development to team management, POWLAX provides the tools you need to succeed at every level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {mockData.features.map((feature, index) => (
              <ActionCard
                key={index}
                title={feature.title}
                description={feature.description}
                href={feature.href}
                icon={feature.icon}
                color={feature.color}
                buttonText="Try Demo"
              />
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 bg-gray-50 rounded-2xl mb-12">
          <div className="p-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose POWLAX?
              </h2>
              <p className="text-lg text-gray-600">
                Built specifically for lacrosse by coaches who understand the game
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mockData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Coaches & Players
            </h2>
            <p className="text-lg text-gray-600">
              See what the lacrosse community is saying about POWLAX
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {mockData.testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.role}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic">&ldquo;{testimonial.content}&rdquo;</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 border-none text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Lacrosse Experience?
              </h2>
              <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                Join thousands of players, coaches, and clubs already using POWLAX to improve their game.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                  <Link href="/auth/register" className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Start Free Trial
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link href="/auth/login">
                    Already have an account? Sign In
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>
              <div className="mt-6 flex items-center justify-center gap-6 text-orange-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Demo Links */}
        <section className="py-12 border-t border-gray-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Explore Our Features
            </h3>
            <p className="text-gray-600">
              Try our interactive demos to see POWLAX in action
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/demo/skills-academy" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Skills Academy Demo
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/demo/practice-planner" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Practice Planner Demo
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/demo/gamification" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Gamification Demo
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
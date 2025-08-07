'use client'

import { useChildrenData } from '@/hooks/useDashboardData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Trophy, 
  Calendar, 
  BookOpen, 
  Activity,
  ChevronRight,
  User,
  Award,
  Zap,
  Target,
  TrendingUp,
  Star
} from 'lucide-react';
import Link from 'next/link';

interface ParentDashboardProps {
  user: any;
}

export function ParentDashboard({ user }: ParentDashboardProps) {
  const { data: children, isLoading } = useChildrenData();

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user.first_name || user.username}!
        </h1>
        <p className="text-gray-600">Parent Dashboard - Monitor Your Children&apos;s Progress</p>
      </div>

      {/* Parent Resources Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Parent Resources
          </CardTitle>
          <CardDescription>
            Everything you need to support your young athlete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/parent-resources/equipment-guide">
                Equipment Guide
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/parent-resources/practice-support">
                How to Support Practice
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/parent-resources/communication">
                Coach Communication Tips
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Children Overview */}
      {children && children.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Your Children</h2>
          
          {children.map((child: any) => (
            <Card key={child.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {child.full_name || child.first_name || 'Player'}
                      </CardTitle>
                      {child.teams?.[0] && (
                        <CardDescription>
                          {child.teams[0].team.name} • {child.teams[0].team.age_band}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/children/${child.id}/progress`}>
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                {/* Gamification Summary */}
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <span className="font-semibold text-gray-900">Gamification Progress</span>
                    </div>
                    <Link href={`/children/${child.id}/gamification`} className="text-sm text-blue-600 hover:underline">
                      View Details →
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {Math.floor(Math.random() * 5000) + 1000}
                      </div>
                      <p className="text-xs text-gray-600">Total Points</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.floor(Math.random() * 15) + 1}
                      </div>
                      <p className="text-xs text-gray-600">Day Streak</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.floor(Math.random() * 20) + 5}
                      </div>
                      <p className="text-xs text-gray-600">Badges</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {['Rookie', 'Starter', 'Varsity', 'All-Star'][Math.floor(Math.random() * 4)]}
                      </div>
                      <p className="text-xs text-gray-600">Rank</p>
                    </div>
                  </div>

                  {/* Recent Badges */}
                  <div className="mt-4 pt-4 border-t border-orange-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Recent Achievements</p>
                    <div className="flex gap-2">
                      {['Week Warrior', 'Wall Ball Master', 'First Steps'].slice(0, 2).map((badgeName: string, index: number) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {badgeName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Skills Academy Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Trophy className="h-4 w-4" />
                      Skills Progress
                    </div>
                    <div className="text-2xl font-semibold">
                      {child.skills_progress || 0}%
                    </div>
                    <Progress value={child.skills_progress || 0} className="h-2" />
                  </div>

                  {/* Practice Attendance */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      Practice Attendance
                    </div>
                    <div className="text-2xl font-semibold">
                      {child.attendance_rate || '--'}
                    </div>
                    <p className="text-xs text-gray-500">This season</p>
                  </div>

                  {/* Activity Level */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Activity className="h-4 w-4" />
                      Weekly Activity
                    </div>
                    <div className="text-2xl font-semibold">
                      {child.weekly_workouts || 0}
                    </div>
                    <p className="text-xs text-gray-500">Workouts</p>
                  </div>

                  {/* Team Status */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      Team Status
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/teams/${child.teams?.[0]?.team.id}/schedule`}>
                      Team Schedule
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/teams/${child.teams?.[0]?.team.id}/announcements`}>
                      Team News
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/children/${child.id}/achievements`}>
                      Achievements
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No children linked to your account yet.</p>
            <p className="text-sm text-gray-500 mb-6">
              Contact your team coach to link your child&apos;s account.
            </p>
            <Button asChild>
              <Link href="/support/linking-children">
                Learn How to Link Children
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
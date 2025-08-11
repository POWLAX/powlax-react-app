'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Patrick's ID for querying his children
  const patrickId = '523f2768-6404-439c-a429-f9eb6736aa17';

  // Fetch real data on mount
  useEffect(() => {
    fetchChildrenData();
  }, [user]);

  async function fetchChildrenData() {
    try {
      // Fetch Patrick's parent-child relationships
      const { data: relationships } = await supabase
        .from('parent_child_relationships')
        .select(`
          *,
          child:users!child_id (
            *,
            wallet:user_points_wallets (*),
            badges:user_badges (*),
            progress:skills_academy_user_progress (*),
            teams:team_members (
              id,
              role,
              team:teams (
                id,
                name,
                age_band,
                club:clubs (
                  name
                )
              )
            )
          )
        `)
        .eq('parent_id', patrickId);

      const childrenData = relationships?.map(rel => rel.child).filter(Boolean) || [];
      setChildren(childrenData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching children data:', error);
      setLoading(false);
    }
  }

  const isLoading = loading;

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
            Mock: Parent Resources
            <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs ml-2">
              Mock
            </Badge>
          </CardTitle>
          <CardDescription>
            Mock: Resource library placeholder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start" disabled>
              Mock: Equipment Guide
            </Button>
            <Button variant="outline" className="justify-start" disabled>
              Mock: Practice Support
            </Button>
            <Button variant="outline" className="justify-start" disabled>
              Mock: Communication Tips
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
                        {child.wallet?.[0]?.balance || Math.floor(Math.random() * 5000) + 1000}
                      </div>
                      <p className="text-xs text-gray-600">{child.wallet?.[0]?.balance ? 'Total Points' : 'Mock: Total Points'}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.floor(Math.random() * 15) + 1}
                      </div>
                      <p className="text-xs text-gray-600">Mock: Day Streak</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {child.badges?.length || Math.floor(Math.random() * 20) + 5}
                      </div>
                      <p className="text-xs text-gray-600">{child.badges?.length ? 'Badges' : 'Mock: Badges'}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {['Rookie', 'Starter', 'Varsity', 'All-Star'][Math.floor(Math.random() * 4)]}
                      </div>
                      <p className="text-xs text-gray-600">Mock: Rank</p>
                    </div>
                  </div>

                  {/* Recent Badges */}
                  <div className="mt-4 pt-4 border-t border-orange-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Recent Achievements</p>
                    <div className="flex gap-2">
                      {child.badges?.length > 0 ? (
                        child.badges.slice(0, 2).map((badge: any, index: number) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {badge.badge_name || 'Achievement'}
                          </Badge>
                        ))
                      ) : (
                        ['Mock: Week Warrior', 'Mock: Wall Ball Master'].map((badgeName: string, index: number) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1 bg-gray-100 text-gray-600">
                            <Award className="h-3 w-3" />
                            {badgeName}
                          </Badge>
                        ))
                      )}
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
                      Mock: Practice Attendance
                    </div>
                    <div className="text-2xl font-semibold text-gray-500 italic">
                      {Math.floor(Math.random() * 20) + 80}%
                    </div>
                    <p className="text-xs text-gray-500">Mock: This season</p>
                  </div>

                  {/* Activity Level */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Activity className="h-4 w-4" />
                      Skills Academy Progress
                    </div>
                    <div className="text-2xl font-semibold">
                      {child.progress?.filter((p: any) => p.status === 'completed').length || 0}
                    </div>
                    <p className="text-xs text-gray-500">Workouts completed</p>
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
                  {child.teams?.[0] ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/teams/${child.teams[0].team.id}`}>
                        {child.teams[0].team.name}
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      Mock: Team Schedule
                    </Button>
                  )}
                  <Button variant="outline" size="sm" disabled>
                    Mock: Team News
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/children/${child.id}/progress`}>
                      View Progress
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
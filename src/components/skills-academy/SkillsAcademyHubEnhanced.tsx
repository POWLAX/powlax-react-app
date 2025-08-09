'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Loader2, Star, TrendingUp, Calendar, Award,
  ChevronRight, Info, X
} from 'lucide-react';

interface SkillsAcademyHubEnhancedProps {
  userId?: string;
}

export function SkillsAcademyHubEnhanced({ userId }: SkillsAcademyHubEnhancedProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Use mock data to prevent infinite loading
  const series = [
    {
      id: 1,
      series_name: 'Quick Start',
      series_type: 'solid_start',
      description: 'Get started with basic lacrosse skills',
      difficulty_level: 1,
      workout_count: 12
    },
    {
      id: 2,
      series_name: 'Attack Training',
      series_type: 'attack', 
      description: 'Master offensive techniques and strategies',
      difficulty_level: 2,
      workout_count: 18
    },
    {
      id: 3,
      series_name: 'Defense Fundamentals',
      series_type: 'defense',
      description: 'Build solid defensive skills',
      difficulty_level: 1,
      workout_count: 15
    },
    {
      id: 4,
      series_name: 'Wall Ball Mastery',
      series_type: 'wall_ball',
      description: 'Perfect your stick skills',
      difficulty_level: 0,
      workout_count: 8
    }
  ];

  const handleStartWorkout = (seriesId: number) => {
    // For now, navigate to first workout of series (we'll improve this)
    router.push(`/skills-academy/workout/${seriesId}`);
  };

  const getDifficultyDisplay = (level: number) => {
    switch (level) {
      case 1: return { label: 'Beginner', color: 'bg-green-100 text-green-800' };
      case 2: return { label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' };
      case 3: return { label: 'Advanced', color: 'bg-red-100 text-red-800' };
      default: return { label: 'All Levels', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getSeriesTypeDisplay = (type: string) => {
    switch (type) {
      case 'solid_start': return 'Quick Start';
      case 'attack': return 'Attack Training';
      case 'midfield': return 'Midfield Skills';
      case 'defense': return 'Defense Training';
      case 'wall_ball': return 'Wall Ball';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-powlax-blue" />
              <p className="text-gray-600">Loading Skills Academy...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Skills Academy</h2>
            <p className="text-gray-600 mb-4">
              167 Drills • 118 Workouts • {series.length} Series
            </p>
            <p className="text-sm text-gray-500">
              Progressive skill development for all levels
            </p>
          </div>
          <div className="text-right">
            <Button 
              onClick={() => handleStartWorkout(1)}
              className="bg-powlax-blue hover:bg-powlax-blue/90 text-white"
            >
              Start Training
            </Button>
          </div>
        </div>
      </Card>

      {/* Training Categories */}
      {series.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-gray-500">
            <Info className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Series Available</h3>
            <p>Skills Academy series are being loaded. Please check back later.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {series.map(seriesItem => {
            const difficulty = getDifficultyDisplay(seriesItem.difficulty_level);
            const displayName = getSeriesTypeDisplay(seriesItem.series_type);
            
            return (
              <Card key={seriesItem.id} className="p-6 bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">
                      {seriesItem.series_name || displayName}
                    </h3>
                    <p className="text-gray-700 text-base mb-3 leading-relaxed">
                      {seriesItem.description || `${displayName} training series`}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 font-medium">
                      <span className={`px-2 py-1 rounded ${difficulty.color}`}>
                        {difficulty.label}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{seriesItem.position_focus || 'All Positions'}</span>
                      <span>•</span>
                      <span className="font-semibold">{seriesItem.workout_count} workouts</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleStartWorkout(seriesItem.id)}
                    className="bg-powlax-orange hover:bg-powlax-orange/90 text-white font-semibold ml-4"
                  >
                    Start
                  </Button>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="text-sm text-gray-600 font-medium">
                    Progress: <span className="text-gray-900 font-semibold">0/{seriesItem.workout_count}</span> completed
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => router.push('/skills-academy/favorites')}
        >
          <Star className="w-4 h-4 mr-2" />
          Favorites
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => router.push('/skills-academy/progress')}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Progress
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => router.push('/skills-academy/schedule')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Schedule
        </Button>
      </div>
    </div>
  );
}
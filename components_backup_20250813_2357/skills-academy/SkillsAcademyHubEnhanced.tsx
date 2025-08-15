'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrackCards } from './TrackCards';
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
  
  // Placeholder for stats - can be fetched later
  const stats = {
    drillCount: 167,
    workoutCount: 118,
    trackCount: 4
  };

  const handleStartWorkout = (seriesId: number) => {
    // For now, navigate to first workout of series (we'll improve this)
    router.push(`/skills-academy/workout/${seriesId}`);
  };

  const handleTrackClick = (track: { id: string; title: string; seriesType: string }) => {
    // Placeholder for track selection - will trigger workout selection modal
    console.log('Track selected:', track);
    // For now, navigate to a placeholder route
    router.push(`/skills-academy/track/${track.id}`);
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
              {stats.drillCount} Drills • {stats.workoutCount} Workouts • {stats.trackCount} Position Tracks
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

      {/* Position-Based Training Tracks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Choose Your Position</h3>
          <p className="text-sm text-gray-600">Select your training track</p>
        </div>
        <TrackCards onTrackClick={handleTrackClick} />
      </div>

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
          onClick={() => router.push('/skills-academy/workouts')}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Workouts
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
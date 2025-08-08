'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, Star, TrendingUp, Calendar, Award,
  ChevronRight, Info, X
} from 'lucide-react';
import { SkillsAcademySeriesCardEnhanced } from './SkillsAcademySeriesCardEnhanced';
import { 
  useSkillsAcademySeries, 
  useSkillsAcademySeriesByType
} from '@/hooks/useSkillsAcademyWorkouts';
import { SkillsAcademySeries } from '@/types/skills-academy';
import { supabase } from '@/lib/supabase';

interface SkillsAcademyHubEnhancedProps {
  userId?: string;
}

type TrackType = 'none' | '1month' | '3month';

interface UserProgress {
  favoriteSeriesIds: number[];
  completedWorkoutIds: number[];
  currentTrack: TrackType;
  currentWeek: number;
  currentWorkoutIndex: number;
  nextWorkoutId?: number;
}

export function SkillsAcademyHubEnhanced({ userId }: SkillsAcademyHubEnhancedProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'solid_start' | 'attack' | 'midfield' | 'defense'>('all');
  const [userProgress, setUserProgress] = useState<UserProgress>({
    favoriteSeriesIds: [],
    completedWorkoutIds: [],
    currentTrack: 'none',
    currentWeek: 1,
    currentWorkoutIndex: 0
  });
  const [showTrackBanner, setShowTrackBanner] = useState(false);
  const [pendingWorkoutId, setPendingWorkoutId] = useState<number | null>(null);

  // Fetch all series or by type
  const { series: allSeries, loading: allLoading, error: allError } = useSkillsAcademySeries();
  const { series: solidStartSeries } = useSkillsAcademySeriesByType('solid_start');
  const { series: attackSeries } = useSkillsAcademySeriesByType('attack');
  const { series: midfieldSeries } = useSkillsAcademySeriesByType('midfield');
  const { series: defenseSeries } = useSkillsAcademySeriesByType('defense');

  // Load user progress from localStorage or database
  useEffect(() => {
    if (userId) {
      loadUserProgress();
    }
  }, [userId]);

  const loadUserProgress = async () => {
    // For now, use localStorage. Later, fetch from database
    const stored = localStorage.getItem(`skills_academy_progress_${userId}`);
    if (stored) {
      setUserProgress(JSON.parse(stored));
    }
  };

  const saveUserProgress = (updates: Partial<UserProgress>) => {
    const newProgress = { ...userProgress, ...updates };
    setUserProgress(newProgress);
    if (userId) {
      localStorage.setItem(`skills_academy_progress_${userId}`, JSON.stringify(newProgress));
    }
  };

  const handleStartWorkout = (workoutId: number) => {
    // Check if user is on a track and trying to do a different workout
    if (userProgress.currentTrack !== 'none' && userProgress.nextWorkoutId && workoutId !== userProgress.nextWorkoutId) {
      setPendingWorkoutId(workoutId);
      setShowTrackBanner(true);
      return;
    }
    
    // Navigate to workout
    router.push(`/skills-academy/workout/${workoutId}`);
  };

  const handleConfirmDifferentWorkout = () => {
    if (pendingWorkoutId) {
      router.push(`/skills-academy/workout/${pendingWorkoutId}`);
      setShowTrackBanner(false);
      setPendingWorkoutId(null);
    }
  };

  const handleStayOnTrack = () => {
    setShowTrackBanner(false);
    setPendingWorkoutId(null);
    if (userProgress.nextWorkoutId) {
      router.push(`/skills-academy/workout/${userProgress.nextWorkoutId}`);
    }
  };

  const toggleFavorite = (seriesId: number) => {
    const newFavorites = userProgress.favoriteSeriesIds.includes(seriesId)
      ? userProgress.favoriteSeriesIds.filter(id => id !== seriesId)
      : [...userProgress.favoriteSeriesIds, seriesId];
    
    saveUserProgress({ favoriteSeriesIds: newFavorites });
  };

  const setTrack = (track: TrackType) => {
    saveUserProgress({ 
      currentTrack: track,
      currentWeek: 1,
      currentWorkoutIndex: 0
    });
  };

  const getSeriesForTab = () => {
    switch (activeTab) {
      case 'solid_start': return solidStartSeries || [];
      case 'attack': return attackSeries || [];
      case 'midfield': return midfieldSeries || [];
      case 'defense': return defenseSeries || [];
      default: return allSeries || [];
    }
  };

  const getFavoriteSeries = () => {
    if (!allSeries) return [];
    return allSeries.filter(s => userProgress.favoriteSeriesIds.includes(s.id));
  };

  const getCompletedWorkouts = () => {
    return userProgress.completedWorkoutIds || [];
  };

  // Loading state
  if (allLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-powlax-blue" />
          <p className="text-gray-600">Loading Skills Academy...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (allError) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertDescription className="text-red-800">
          Failed to load Skills Academy. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const displaySeries = getSeriesForTab();
  const favoriteSeries = getFavoriteSeries();

  return (
    <div className="space-y-6">
      {/* Track Selection Banner */}
      {userProgress.currentTrack === 'none' && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Choose Your Training Track</h3>
              <p className="text-sm text-gray-600">
                Follow a structured program for maximum improvement
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setTrack('1month')}
                className="bg-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                1 Month Track
              </Button>
              <Button 
                onClick={() => setTrack('3month')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              >
                <Award className="w-4 h-4 mr-2" />
                3 Month Track
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Current Track Info */}
      {userProgress.currentTrack !== 'none' && (
        <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">
                  {userProgress.currentTrack === '1month' ? '1 Month' : '3 Month'} Track - Week {userProgress.currentWeek}
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Complete 3 workouts this week to earn a 5x points multiplier!
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setTrack('none')}
            >
              Leave Track
            </Button>
          </div>
        </Card>
      )}

      {/* Favorites Section */}
      {favoriteSeries.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Your Favorites
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {favoriteSeries.map(series => (
              <SkillsAcademySeriesCardEnhanced
                key={series.id}
                series={series}
                onStartWorkout={handleStartWorkout}
                isFavorite={true}
                onToggleFavorite={toggleFavorite}
                completedWorkouts={getCompletedWorkouts()}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="solid_start">Solid Start</TabsTrigger>
          <TabsTrigger value="attack">Attack</TabsTrigger>
          <TabsTrigger value="midfield">Midfield</TabsTrigger>
          <TabsTrigger value="defense">Defense</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displaySeries.map(series => (
              <SkillsAcademySeriesCardEnhanced
                key={series.id}
                series={series}
                onStartWorkout={handleStartWorkout}
                isFavorite={userProgress.favoriteSeriesIds.includes(series.id)}
                onToggleFavorite={toggleFavorite}
                completedWorkouts={getCompletedWorkouts()}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Track Confirmation Modal */}
      {showTrackBanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">You're on a training track!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  You selected the {userProgress.currentTrack === '1month' ? '1 Month' : '3 Month'} track. 
                  Sticking with it will earn you bonus points and better results. 
                  Do you want to continue with your track or do this workout instead?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleConfirmDifferentWorkout}
                    className="flex-1"
                  >
                    Do Different Workout
                  </Button>
                  <Button
                    onClick={handleStayOnTrack}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white"
                  >
                    Stay on Track
                  </Button>
                </div>
              </div>
              <button onClick={() => setShowTrackBanner(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
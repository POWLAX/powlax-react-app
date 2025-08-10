'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  PlayCircle, X, Users, Clock, Target, Shield, Zap, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Track {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  seriesType: string;
}

interface WorkoutSize {
  id: string;
  name: string;
  drillCount: number;
  duration: string;
  description: string;
}

const tracks: Track[] = [
  {
    id: 'solid_start',
    title: 'Solid Start Training',
    description: 'Develop essential skills fast!',
    icon: '⚔️',
    color: 'bg-gray-500',
    seriesType: 'solid_start'
  },
  {
    id: 'attack',
    title: 'Attack Training',
    description: 'Master every attack skill in 12 workouts!',
    icon: '⚔️',
    color: 'bg-green-500',
    seriesType: 'attack'
  },
  {
    id: 'midfield',
    title: 'Midfield Training', 
    description: 'Dominate both ends of the field with complete skills',
    icon: '🎯',
    color: 'bg-blue-500',
    seriesType: 'midfield'
  },
  {
    id: 'defense',
    title: 'Defense Training',
    description: 'Shutdown defensive techniques and positioning',
    icon: '🛡️',
    color: 'bg-red-500',
    seriesType: 'defense'
  }
];

const workoutSizes: WorkoutSize[] = [
  {
    id: 'mini',
    name: 'Mini',
    drillCount: 5,
    duration: '10-15 min',
    description: 'Quick skill building session'
  },
  {
    id: 'more',
    name: 'More',
    drillCount: 8,
    duration: '20-25 min',
    description: 'Balanced training workout'
  },
  {
    id: 'complete',
    name: 'Complete',
    drillCount: 12,
    duration: '30-40 min',
    description: 'Comprehensive skill development'
  }
];

interface Workout {
  id: number;
  workout_name: string;
  workout_size: string;
  drill_ids: number[];
  drill_count: number;
  estimated_duration_minutes: number;
  series_id: number;
}

interface Series {
  id: number;
  series_name: string;
  series_type: string;
  description: string;
}

export default function SkillsAcademyWorkoutsPage() {
  const router = useRouter();
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSeriesAndWorkouts();
  }, []);

  const fetchSeriesAndWorkouts = async () => {
    setLoading(true);
    try {
      // Fetch all series
      const { data: seriesData, error: seriesError } = await supabase
        .from('skills_academy_series')
        .select('*')
        .eq('is_active', true);

      if (seriesError) throw seriesError;
      setSeries(seriesData || []);

      // Fetch all workouts
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('skills_academy_workouts')
        .select('*')
        .eq('is_active', true);

      if (workoutsError) throw workoutsError;
      setWorkouts(workoutsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWorkoutsForTrack = (trackType: string) => {
    const trackSeries = series.filter(s => s.series_type === trackType);
    const seriesIds = trackSeries.map(s => s.id);
    return workouts.filter(w => seriesIds.includes(w.series_id));
  };

  const handleTrackClick = (track: Track) => {
    setSelectedTrack(track);
    setIsModalOpen(true);
  };

  const handleWorkoutStart = (workoutId: number) => {
    router.push(`/skills-academy/workout/${workoutId}`);
    setIsModalOpen(false);
  };

  const getTrackIcon = (track: Track) => {
    switch (track.id) {
      case 'solid_start':
        return <Zap className="w-12 h-12 text-white" />;
      case 'attack':
        return <Target className="w-12 h-12 text-white" />;
      case 'midfield':
        return <Users className="w-12 h-12 text-white" />;
      case 'defense':
        return <Shield className="w-12 h-12 text-white" />;
      default:
        return <PlayCircle className="w-12 h-12 text-white" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Skills Academy Workouts</h1>
        <p className="text-gray-600">
          Choose your training focus and start building lacrosse skills
        </p>
      </div>

      {/* Track Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {tracks.map((track) => (
          <Card
            key={track.id}
            className={`${track.color} hover:opacity-90 transition-all duration-200 cursor-pointer transform hover:scale-105 min-h-[180px]`}
            onClick={() => handleTrackClick(track)}
          >
            <div className="p-6 text-white h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  {getTrackIcon(track)}
                  <div className="text-right">
                    <div className="text-xs opacity-75 uppercase tracking-wide">Track</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{track.title}</h3>
                <p className="text-white/90 text-sm">{track.description}</p>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex space-x-2 text-xs">
                  <span className="bg-white/20 px-2 py-1 rounded">Mini</span>
                  <span className="bg-white/20 px-2 py-1 rounded">More</span>
                  <span className="bg-white/20 px-2 py-1 rounded">Complete</span>
                </div>
                <PlayCircle className="w-6 h-6 text-white/80" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Workout Selection Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-gray-900">
                {selectedTrack?.title} Workouts
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedTrack && (
            <div className="space-y-4 mt-4">
              <p className="text-gray-600 mb-6">{selectedTrack.description}</p>
              
              {/* Workout Options from Database */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 mb-4">Choose Your Workout:</h4>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-powlax-blue" />
                    <span className="ml-2 text-gray-600">Loading workouts...</span>
                  </div>
                ) : (
                  <>
                    {getWorkoutsForTrack(selectedTrack.seriesType).length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No workouts available for this track yet.</p>
                    ) : (
                      getWorkoutsForTrack(selectedTrack.seriesType).map((workout) => {
                        const seriesInfo = series.find(s => s.id === workout.series_id);
                        return (
                          <div
                            key={workout.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-powlax-blue hover:bg-blue-50 transition-colors cursor-pointer"
                            onClick={() => handleWorkoutStart(workout.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-3 h-3 rounded-full ${selectedTrack.color.replace('bg-', 'bg-')}`}></div>
                                  <h5 className="font-medium text-gray-900">
                                    {workout.workout_name || `${seriesInfo?.series_name} - ${workout.workout_size}`}
                                  </h5>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 ml-6">
                                  {workout.workout_size === 'mini' && 'Quick skill building session'}
                                  {workout.workout_size === 'more' && 'Balanced training workout'}
                                  {workout.workout_size === 'complete' && 'Comprehensive skill development'}
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-4 ml-4">
                                <div className="text-right text-sm">
                                  <div className="flex items-center text-gray-600">
                                    <Users className="w-4 h-4 mr-1" />
                                    {workout.drill_count} drills
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {workout.estimated_duration_minutes} min
                                  </div>
                                </div>
                                <Button 
                                  size="sm" 
                                  className="bg-powlax-blue hover:bg-powlax-blue/90"
                                >
                                  Start
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </>
                )}
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Training Tips:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Start with Mini workouts to build consistency</li>
                  <li>• Progress to Complete workouts as skills improve</li>
                  <li>• Focus on proper form over speed</li>
                  <li>• Track your progress and celebrate improvements</li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
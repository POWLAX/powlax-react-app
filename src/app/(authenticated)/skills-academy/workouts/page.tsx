'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  PlayCircle, X, Users, Clock, Target, Shield, Zap, Loader2, Circle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { WallBallSeries, WallBallVariant, GroupedVariants } from '@/types/wall-ball';

interface Track {
  id: string;
  title: string;
  description: string;
  color: string;
  seriesType: string;
}

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
  const [wallBallSeries, setWallBallSeries] = useState<WallBallSeries[]>([]);
  const [wallBallVariants, setWallBallVariants] = useState<WallBallVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTrackSelector, setShowTrackSelector] = useState(false);

  const tracks: Track[] = [
    {
      id: 'solid_start',
      title: 'Solid Start Training',
      description: 'Develop essential skills fast!',
      color: 'bg-gray-500',
      seriesType: 'solid_start'
    },
    {
      id: 'attack',
      title: 'Attack Training',
      description: 'Master every attack skill in 12 workouts!',
      color: 'bg-green-500',
      seriesType: 'attack'
    },
    {
      id: 'midfield',
      title: 'Midfield Training',
      description: 'Dominate both ends of the field with complete skills',
      color: 'bg-blue-500',
      seriesType: 'midfield'
    },
    {
      id: 'defense',
      title: 'Defense Training',
      description: 'Shutdown defensive techniques and positioning',
      color: 'bg-red-500',
      seriesType: 'defense'
    },
    {
      id: 'wall_ball',
      title: 'Wall Ball Training',
      description: 'Master fundamental skills with wall ball practice',
      color: 'bg-orange-600',
      seriesType: 'wall_ball'
    }
  ];

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

      if (seriesError) {
        console.error('Error fetching series:', seriesError);
      } else {
        setSeries(seriesData || []);
      }

      // Fetch all workouts
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('skills_academy_workouts')
        .select('*')
        .eq('is_active', true);

      if (workoutsError) {
        console.error('Error fetching workouts:', workoutsError);
      } else {
        setWorkouts(workoutsData || []);
      }

      // Fetch wall ball collections (use actual table)
      const { data: wallBallCollectionsData, error: wallBallCollectionsError } = await supabase
        .from('powlax_wall_ball_collections')
        .select('*')
        .order('id', { ascending: true });

      if (wallBallCollectionsError) {
        console.error('Error fetching wall ball collections:', wallBallCollectionsError);
      } else {
        // Map collections to series format
        const mappedSeries = wallBallCollectionsData?.map(collection => ({
          id: collection.id,
          series_name: collection.name,
          series_type: 'wall_ball',
          description: collection.description,
          difficulty_level: collection.difficulty_level
        })) || [];
        setWallBallSeries(mappedSeries);
        
        // Map collections to variants format (each collection becomes multiple variants)
        const mappedVariants = wallBallCollectionsData?.flatMap(collection => [
          {
            id: collection.id, // Use collection ID directly for "Full" version
            series_id: collection.id,
            workout_name: `${collection.name} - Full`,
            duration_minutes: collection.duration_minutes,
            has_coaching: collection.has_coaching,
            collection_id: collection.id
          }
        ]) || [];
        setWallBallVariants(mappedVariants);
      }
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

  const handleWallBallVariantStart = (variantId: number) => {
    router.push(`/skills-academy/wall-ball/${variantId}`);
    setIsModalOpen(false);
  };

  const getWallBallWorkoutsForTrack = () => {
    // Group wall ball variants by series, then by duration
    const seriesGroups = wallBallSeries.map(series => {
      const variants = wallBallVariants.filter(v => v.series_id === series.id);
      const durations = [...new Set(variants.map(v => v.duration_minutes))].sort((a, b) => a - b);
      
      return {
        series,
        durations: durations.map(duration => ({
          duration,
          withCoaching: variants.find(v => v.duration_minutes === duration && v.has_coaching) || null,
          withoutCoaching: variants.find(v => v.duration_minutes === duration && !v.has_coaching) || null
        }))
      };
    });
    
    return seriesGroups;
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
      case 'wall_ball':
        return <Circle className="w-12 h-12 text-white" />;
      default:
        return <PlayCircle className="w-12 h-12 text-white" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Desktop Content */}
      <div className="hidden md:block container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Skills Academy Workouts</h1>
          <p className="text-gray-600">
            Choose your training focus and start building lacrosse skills
          </p>
        </div>

        {/* Track Cards Grid - Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {tracks.map((track) => (
          <Card
            key={track.id}
            className={`relative overflow-hidden hover:opacity-90 transition-all duration-200 cursor-pointer transform hover:scale-105 min-h-[180px]`}
            onClick={() => handleTrackClick(track)}
          >
            {/* Background with gradient */}
            <div className={`absolute inset-0 ${track.color}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/50"></div>
            </div>
            
            {/* Content */}
            <div className="relative p-6 text-white h-full flex flex-col justify-between">
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
              
              <div className="flex items-center justify-end mt-4">
                <PlayCircle className="w-6 h-6 text-white/80" />
              </div>
            </div>
          </Card>
        ))}
        </div>
      </div>
      
      {/* Mobile View - Just a welcome message until button is clicked */}
      <div className="md:hidden flex-1 p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Skills Academy Workouts</h1>
          <p className="text-gray-600">
            Choose your training focus and start building lacrosse skills
          </p>
        </div>
        
        {/* Show basic info or placeholder */}
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <PlayCircle className="w-16 h-16 mx-auto mb-4 text-powlax-blue" />
          <h2 className="text-xl font-semibold mb-2">Ready to Train?</h2>
          <p className="text-gray-600">
            Tap the &quot;Select Workout&quot; button below to choose your training track and start improving your skills.
          </p>
        </div>
      </div>

      {/* Mobile Track Selector Modal - Slides from top like Practice Planner */}
      {showTrackSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="absolute inset-x-0 top-0 bg-white rounded-b-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Select Training Track</h3>
              <button
                onClick={() => setShowTrackSelector(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            {/* Track Cards for Mobile */}
            <div className="p-4 space-y-4">
              {tracks.map((track) => (
                <Card
                  key={track.id}
                  className={`relative overflow-hidden hover:opacity-90 transition-all duration-200 cursor-pointer transform hover:scale-105 min-h-[140px]`}
                  onClick={() => {
                    handleTrackClick(track);
                    setShowTrackSelector(false);
                  }}
                >
                  {/* Background with gradient */}
                  <div className={`absolute inset-0 ${track.color}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/50"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative p-4 text-white h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        {getTrackIcon(track)}
                      </div>
                      <h3 className="text-lg font-bold mb-1">{track.title}</h3>
                      <p className="text-white/90 text-sm">{track.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-end mt-3">
                      <PlayCircle className="w-5 h-5 text-white/80" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Select Workout Button - positioned like Practice Planner's "Add to Plan" */}
      <button
        onClick={() => setShowTrackSelector(true)}
        className="fixed bottom-14 left-4 right-4 bg-powlax-blue text-white rounded-lg py-3 shadow-lg md:hidden z-40"
      >
        <Target className="h-5 w-5 inline mr-2" />
        Select Workout
      </button>

      {/* Workout Selection Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {selectedTrack?.title} Workouts
            </DialogTitle>
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
                    {selectedTrack.seriesType === 'wall_ball' ? (
                      // Wall Ball workouts rendering
                      (() => {
                        const wallBallGroups = getWallBallWorkoutsForTrack();
                        
                        if (wallBallGroups.length === 0) {
                          return <p className="text-gray-500 text-center py-4">No wall ball workouts available yet.</p>;
                        }
                        
                        return wallBallGroups.map(({ series: wallBallSeriesItem, durations }) => (
                          <div
                            key={wallBallSeriesItem.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-powlax-blue transition-colors"
                          >
                            <div className="mb-3">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className={`w-3 h-3 rounded-full ${selectedTrack.color}`}></div>
                                <h5 className="font-medium text-gray-900">
                                  {wallBallSeriesItem.series_name}
                                </h5>
                              </div>
                              
                              {wallBallSeriesItem.description && (
                                <p className="text-sm text-gray-600 ml-6">
                                  {wallBallSeriesItem.description}
                                </p>
                              )}
                            </div>
                            
                            {/* Duration options for this wall ball series */}
                            <div className="space-y-2">
                              {durations.map(({ duration, withCoaching, withoutCoaching }) => (
                                <div key={duration} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <span className="font-medium text-sm">{duration} minutes</span>
                                  <div className="flex space-x-2">
                                    {withoutCoaching && (
                                      <Button 
                                        size="sm" 
                                        className="bg-gray-600 hover:bg-gray-700 text-white text-xs"
                                        onClick={() => handleWallBallVariantStart(withoutCoaching.id)}
                                      >
                                        No Coaching
                                      </Button>
                                    )}
                                    {withCoaching && (
                                      <Button 
                                        size="sm" 
                                        className="bg-powlax-blue hover:bg-powlax-blue/90 text-white text-xs"
                                        onClick={() => handleWallBallVariantStart(withCoaching.id)}
                                      >
                                        With Coaching
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()
                    ) : (
                      // Regular Skills Academy workouts rendering
                      (() => {
                        const trackSeries = series
                          .filter(s => s.series_type === selectedTrack.seriesType)
                          .sort((a, b) => {
                            // Sort by series name (SS1, SS2, SS3, etc.)
                            const aNum = parseInt(a.series_name.match(/\d+/)?.[0] || '0');
                            const bNum = parseInt(b.series_name.match(/\d+/)?.[0] || '0');
                            return aNum - bNum;
                          });
                        
                        if (trackSeries.length === 0) {
                          return <p className="text-gray-500 text-center py-4">No workouts available for this track yet.</p>;
                        }
                        
                        return trackSeries.map((seriesItem) => {
                        // Get all workouts for this series
                        const seriesWorkouts = workouts.filter(w => w.series_id === seriesItem.id);
                        
                        // Find workouts by size
                        const miniWorkout = seriesWorkouts.find(w => w.workout_size === 'mini');
                        const moreWorkout = seriesWorkouts.find(w => w.workout_size === 'more');
                        const completeWorkout = seriesWorkouts.find(w => w.workout_size === 'complete');
                        
                        // Extract the workout name without the SS prefix
                        const workoutName = seriesItem.series_name.replace(/^SS\d+\s*-?\s*/, '').trim();
                        
                        return (
                          <div
                            key={seriesItem.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-powlax-blue transition-colors"
                          >
                            <div className="mb-3">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className={`w-3 h-3 rounded-full ${selectedTrack.color}`}></div>
                                <h5 className="font-medium text-gray-900">
                                  {workoutName || seriesItem.series_name}
                                </h5>
                              </div>
                              
                              {seriesItem.description && (
                                <p className="text-sm text-gray-600 ml-6">
                                  {seriesItem.description}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex space-x-2 mt-3">
                              {miniWorkout && (
                                <Button 
                                  size="sm" 
                                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                                  onClick={() => handleWorkoutStart(miniWorkout.id)}
                                >
                                  <div className="flex items-center space-x-2">
                                    <Users className="w-4 h-4 text-white" />
                                    <span className="font-medium text-white">Mini</span>
                                    <span className="text-xs text-white/80">({miniWorkout.drill_count} drills)</span>
                                  </div>
                                </Button>
                              )}
                              
                              {moreWorkout && (
                                <Button 
                                  size="sm" 
                                  className="flex-1 bg-gray-700 hover:bg-gray-800 text-white"
                                  onClick={() => handleWorkoutStart(moreWorkout.id)}
                                >
                                  <div className="flex items-center space-x-2">
                                    <Users className="w-4 h-4 text-white" />
                                    <span className="font-medium text-white">More</span>
                                    <span className="text-xs text-white/80">({moreWorkout.drill_count} drills)</span>
                                  </div>
                                </Button>
                              )}
                              
                              {completeWorkout && (
                                <Button 
                                  size="sm" 
                                  className="flex-1 bg-powlax-blue hover:bg-powlax-blue/90 text-white"
                                  onClick={() => handleWorkoutStart(completeWorkout.id)}
                                >
                                  <div className="flex items-center space-x-2">
                                    <Users className="w-4 h-4 text-white" />
                                    <span className="font-medium text-white">Complete</span>
                                    <span className="text-xs text-white/80">({completeWorkout.drill_count} drills)</span>
                                  </div>
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      });
                      })()
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
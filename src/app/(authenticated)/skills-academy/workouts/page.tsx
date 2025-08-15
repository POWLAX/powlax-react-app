'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  PlayCircle, X, Users, Clock, Target, Shield, Zap, Loader2, Circle, Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { WallBallSeries, WallBallVariant, GroupedVariants } from '@/types/wall-ball';
import { useAuth } from '@/contexts/SupabaseAuthContext';

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
  const { user, loading: authLoading } = useAuth();
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTrackSelector, setShowTrackSelector] = useState(false);
  const [showAnimationsModal, setShowAnimationsModal] = useState(false);

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

      // Wall ball workouts are now migrated to Skills Academy tables - no separate fetch needed
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeriesAndWorkouts();
  }, []);

  // Temporarily bypass auth loading check to fix infinite loading issue
  // The authenticated layout already handles auth protection
  // if (authLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <Loader2 className="w-8 h-8 animate-spin text-powlax-blue mx-auto" />
  //         <p className="mt-4 text-gray-600">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

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
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Skills Academy Workouts</h1>
            <p className="text-gray-600">
              Choose your training focus and start building lacrosse skills
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAnimationsModal(true)}
            className="flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>View Animations</span>
          </Button>
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
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Skills Academy Workouts</h1>
              <p className="text-gray-600">
                Choose your training focus and start building lacrosse skills
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAnimationsModal(true)}
              className="ml-2"
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>
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
                      // Skills Academy workouts rendering (includes wall ball)
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
                        
                        // Special handling for Wall Ball workouts
                        if (selectedTrack.seriesType === 'wall_ball') {
                          return trackSeries.map((seriesItem) => {
                            // Get all workouts for this series
                            const seriesWorkouts = workouts.filter(w => w.series_id === seriesItem.id);
                            
                            // Find workouts by size and coaching status
                            const miniCoaching = seriesWorkouts.find(w => w.workout_size === 'mini');
                            const miniNoCoaching = seriesWorkouts.find(w => w.workout_size === 'mini_no_coach');
                            const moreCoaching = seriesWorkouts.find(w => w.workout_size === 'more');
                            const moreNoCoaching = seriesWorkouts.find(w => w.workout_size === 'more_no_coach');
                            const completeCoaching = seriesWorkouts.find(w => w.workout_size === 'complete');
                            const completeNoCoaching = seriesWorkouts.find(w => w.workout_size === 'complete_no_coach');
                            
                            return (
                              <div
                                key={seriesItem.id}
                                className="border border-gray-200 rounded-lg p-4 hover:border-orange-500 transition-colors"
                              >
                                <div className="mb-3">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                                    <h5 className="font-medium text-gray-900">
                                      {seriesItem.series_name}
                                    </h5>
                                  </div>
                                  
                                  {seriesItem.description && (
                                    <p className="text-sm text-gray-600 ml-6">
                                      {seriesItem.description}
                                    </p>
                                  )}
                                </div>
                                
                                {/* Three columns for Mini, More, Complete */}
                                <div className="grid grid-cols-3 gap-2 mt-3">
                                  {/* Mini Column */}
                                  <div className="space-y-2">
                                    <div className="text-xs font-semibold text-gray-600 text-center mb-1">5 Minutes</div>
                                    {miniCoaching && (
                                      <Button 
                                        size="sm" 
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-1.5"
                                        onClick={() => handleWorkoutStart(miniCoaching.id)}
                                      >
                                        <div className="flex flex-col items-center">
                                          <span className="text-xs font-medium">With Coaching</span>
                                        </div>
                                      </Button>
                                    )}
                                    {miniNoCoaching && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="w-full bg-white border-orange-600 text-black hover:bg-orange-50 py-1.5"
                                        onClick={() => handleWorkoutStart(miniNoCoaching.id)}
                                      >
                                        <div className="flex flex-col items-center">
                                          <span className="text-xs font-medium">No Coaching</span>
                                        </div>
                                      </Button>
                                    )}
                                  </div>
                                  
                                  {/* More Column */}
                                  <div className="space-y-2">
                                    <div className="text-xs font-semibold text-gray-600 text-center mb-1">10 Minutes</div>
                                    {moreCoaching && (
                                      <Button 
                                        size="sm" 
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-1.5"
                                        onClick={() => handleWorkoutStart(moreCoaching.id)}
                                      >
                                        <div className="flex flex-col items-center">
                                          <span className="text-xs font-medium">With Coaching</span>
                                        </div>
                                      </Button>
                                    )}
                                    {moreNoCoaching && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="w-full bg-white border-orange-600 text-black hover:bg-orange-50 py-1.5"
                                        onClick={() => handleWorkoutStart(moreNoCoaching.id)}
                                      >
                                        <div className="flex flex-col items-center">
                                          <span className="text-xs font-medium">No Coaching</span>
                                        </div>
                                      </Button>
                                    )}
                                  </div>
                                  
                                  {/* Complete Column */}
                                  <div className="space-y-2">
                                    <div className="text-xs font-semibold text-gray-600 text-center mb-1">Complete</div>
                                    {completeCoaching && (
                                      <Button 
                                        size="sm" 
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-1.5"
                                        onClick={() => handleWorkoutStart(completeCoaching.id)}
                                      >
                                        <div className="flex flex-col items-center">
                                          <span className="text-xs font-medium">With Coaching</span>
                                        </div>
                                      </Button>
                                    )}
                                    {completeNoCoaching && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="w-full bg-white border-orange-600 text-black hover:bg-orange-50 py-1.5"
                                        onClick={() => handleWorkoutStart(completeNoCoaching.id)}
                                      >
                                        <div className="flex flex-col items-center">
                                          <span className="text-xs font-medium">No Coaching</span>
                                        </div>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        }
                        
                        // Regular Skills Academy workouts (non-wall ball)
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Animations Modal */}
      <Dialog open={showAnimationsModal} onOpenChange={setShowAnimationsModal}>
        <DialogContent className="bg-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-orange-600" />
              Workout Completion Animations
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Mock Animation Preview */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎉 Workout Complete Animation Preview</h3>
              
              {/* Mock Animation Container */}
              <div className="relative bg-white rounded-lg border-2 border-dashed border-orange-300 h-64 flex items-center justify-center mb-4">
                <div className="text-center space-y-4">
                  {/* Animated Trophy */}
                  <div className="animate-bounce">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">🏆</span>
                    </div>
                  </div>
                  
                  {/* Success Text */}
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-gray-900 animate-pulse">Workout Complete!</h4>
                    <p className="text-gray-600">Great job! You earned 50 Attack Tokens</p>
                  </div>
                  
                  {/* Mock Progress Bar */}
                  <div className="w-48 mx-auto">
                    <div className="bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                    </div>
                    <p className="text-xs text-gray-500">Level Progress: 75%</p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 italic">
                * This is a mock representation. The actual animations will include particle effects, 
                sound feedback, and personalized achievement celebrations.
              </p>
            </div>

            {/* Animation Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  Dynamic Celebrations
                </h4>
                <p className="text-sm text-gray-600">
                  Unique animations based on workout type, difficulty, and personal achievements
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-500" />
                  Progress Visualization
                </h4>
                <p className="text-sm text-gray-600">
                  Visual progress bars and level-up effects to show skill development
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  Social Sharing
                </h4>
                <p className="text-sm text-gray-600">
                  Share achievements with teammates and celebrate milestones together
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Streak Rewards
                </h4>
                <p className="text-sm text-gray-600">
                  Special animations for daily streaks and consistency achievements
                </p>
              </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <h4 className="font-semibold text-blue-900 mb-2">🚀 Coming Soon</h4>
              <p className="text-sm text-blue-700">
                Full animation system will be implemented once the workout completion flow is finalized. 
                This preview shows the planned celebration experience for completing Skills Academy workouts.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
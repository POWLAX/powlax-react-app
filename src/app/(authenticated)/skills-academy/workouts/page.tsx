'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  PlayCircle, X, Users, Clock, Target, Shield, Zap, Loader2, Circle, Sparkles
} from 'lucide-react';
import { CelebrationAnimation } from '@/components/skills-academy/CelebrationAnimation';
import { SkillTreeDemo } from '@/components/animations/SkillTreeSVG';
import BadgeUnlockCSS from '@/components/animations/BadgeUnlockCSS';
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
  const [animationPhase, setAnimationPhase] = useState<'academy-points' | 'badge-unlock' | 'completion'>('academy-points');
  const [showSkillTreeModal, setShowSkillTreeModal] = useState(false);

  // Auto-progress from Academy Points to Badge Unlock after 4 seconds
  useEffect(() => {
    if (showAnimationsModal && animationPhase === 'academy-points') {
      const timer = setTimeout(() => {
        setAnimationPhase('badge-unlock');
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [showAnimationsModal, animationPhase]);



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
              onClick={() => setShowAnimationsModal(true)}
              className="ml-2 bg-gray-100 text-black border border-gray-400 hover:bg-gray-200"
            >
              Workout Completion
            </Button>
          </div>
          
          {/* Skill Tree Button - Mobile Only */}
          <div className="mt-4">
            <Button
              size="sm"
              onClick={() => setShowSkillTreeModal(true)}
              className="w-full bg-gray-100 text-black border border-gray-400 hover:bg-gray-200"
            >
              Skill Tree
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

      {/* Enhanced Workout Completion Animation */}
      {showAnimationsModal && (
        <>
          {/* Academy Points Animation Phase */}
          {animationPhase === 'academy-points' && (
            <div 
              className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 cursor-pointer"
              onClick={() => setAnimationPhase('badge-unlock')}
            >
              <div className="text-center max-w-md mx-auto p-8 animate-fade-in">
                <div className="bg-white rounded-xl p-8 shadow-2xl border-4 border-yellow-400">
                  <div className="mb-6">
                    <img 
                      src="https://powlax.com/wp-content/uploads/2024/10/Lax-Credits.png" 
                      alt="Academy Points" 
                      className="w-20 h-20 mx-auto mb-4 animate-bounce"
                    />
                    <div className="text-3xl font-bold text-yellow-600 mb-2 animate-pulse">
                      You&apos;ve earned
                    </div>
                    <div className="text-5xl font-bold text-yellow-600 mb-2">
                      67 Academy Points!
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Tap to continue or wait 4 seconds...
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Badge Unlock Animation Phase - CSS Animation */}
          {animationPhase === 'badge-unlock' && (
            <div 
              className="fixed inset-0 z-[110] bg-black cursor-pointer"
              onClick={() => setAnimationPhase('completion')}
            >
              <BadgeUnlockCSS
                badgeName="Foundation Ace"
                badgeImage="https://powlax.com/wp-content/uploads/2024/10/WB2-Dominant-Dodger.png"
                category="wallball"
                onComplete={() => {
                  // Don't auto-complete - let it persist until clicked!
                  // The user needs to click to continue
                }}
              />
              
              {/* Click instruction overlay */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center animate-pulse">
                <div className="bg-black/50 rounded-lg px-6 py-3">
                  <p className="text-lg font-semibold">🎉 Foundation Ace Badge Unlocked! 🎉</p>
                  <p className="text-sm mt-1">Tap anywhere to continue...</p>
                </div>
              </div>
            </div>
          )}

          {/* Final Completion Screen */}
          {animationPhase === 'completion' && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="mb-6">
                  <div className="text-4xl font-bold mb-4 text-gray-900">Workout Complete!</div>
                  <div className="text-lg text-gray-600 mb-4">
                    Great job completing <strong>Attack Training - SS1</strong>!
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="bg-white/90 rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="text-3xl font-bold text-blue-600">85</div>
                    <div className="text-sm text-gray-600">Points Earned</div>
                  </div>
                  <div className="bg-white/90 rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="text-xl font-bold text-green-600">7 Day Streak!</div>
                    <div className="text-sm text-gray-600">Keep it up!</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowAnimationsModal(false);
                      setAnimationPhase('academy-points'); // Reset for next time
                    }}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Continue Training
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Background celebration animation - runs during academy-points and badge-unlock phases */}
          <CelebrationAnimation 
            points={85}
            isVisible={showAnimationsModal && (animationPhase === 'academy-points' || animationPhase === 'badge-unlock')}
            onAnimationEnd={() => {
              // Don't auto-close, let user progress through phases
            }}
          />
        </>
      )}

      {/* Skill Tree Modal */}
      {showSkillTreeModal && (
        <div className="fixed inset-0 z-[100] bg-black">
          <div className="absolute top-4 right-4 z-[101]">
            <button
              onClick={() => setShowSkillTreeModal(false)}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <SkillTreeDemo />
        </div>
      )}
    </div>
  );
}
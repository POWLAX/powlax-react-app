import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  SkillsAcademySeries, 
  SkillsAcademyWorkoutNew,
  SkillsAcademyWorkoutDrill,
  SkillsAcademyUserProgress,
  GroupedWorkouts,
  WorkoutSession,
  DrillWithProgress
} from '@/types/skills-academy';

// Fetch all series
export function useSkillsAcademySeries() {
  const [series, setSeries] = useState<SkillsAcademySeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSeries() {
      try {
        const { data, error } = await supabase
          .from('skills_academy_series')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setSeries(data || []);
      } catch (err) {
        console.error('Error fetching skills academy series:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch series');
      } finally {
        setLoading(false);
      }
    }

    fetchSeries();
  }, []);

  return { series, loading, error };
}

// Fetch series by type
export function useSkillsAcademySeriesByType(seriesType: 'solid_start' | 'attack' | 'midfield' | 'defense') {
  const [series, setSeries] = useState<SkillsAcademySeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSeries() {
      try {
        const { data, error } = await supabase
          .from('skills_academy_series')
          .select('*')
          .eq('series_type', seriesType)
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setSeries(data || []);
      } catch (err) {
        console.error(`Error fetching ${seriesType} series:`, err);
        setError(err instanceof Error ? err.message : 'Failed to fetch series');
      } finally {
        setLoading(false);
      }
    }

    fetchSeries();
  }, [seriesType]);

  return { series, loading, error };
}

// Fetch workouts for a series
export function useSkillsAcademyWorkouts(seriesId: number | null) {
  const [workouts, setWorkouts] = useState<SkillsAcademyWorkoutNew[]>([]);
  const [groupedWorkouts, setGroupedWorkouts] = useState<GroupedWorkouts>({
    mini: null,
    more: null,
    complete: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seriesId) {
      setWorkouts([]);
      setGroupedWorkouts({ mini: null, more: null, complete: null });
      setLoading(false);
      return;
    }

    async function fetchWorkouts() {
      try {
        setLoading(true);
        const { data: workoutsData, error } = await supabase
          .from('skills_academy_workouts')
          .select(`
            *,
            series:skills_academy_series(*)
          `)
          .eq('series_id', seriesId)
          .eq('is_active', true)
          .order('drill_count', { ascending: true });

        if (error) throw error;

        // Fetch drills for each workout using drill_ids array column
        const workoutsWithDrills = await Promise.all(
          (workoutsData || []).map(async (workout) => {
            let drills: any[] = [];
            
            // Use drill_ids array column to get drills
            if (workout.drill_ids && workout.drill_ids.length > 0) {
              const { data: drillsData, error: drillsError } = await supabase
                .from('skills_academy_drills')
                .select('*')
                .in('id', workout.drill_ids);
              
              if (!drillsError && drillsData) {
                // Create drill objects in the correct order based on drill_ids array
                drills = workout.drill_ids.map((drillId: number, index: number) => {
                  const drill = drillsData.find(d => d.id === drillId);
                  if (drill) {
                    return {
                      id: `${workout.id}-${index}`,
                      workout_id: workout.id,
                      drill_id: drill.id,
                      sequence_order: index + 1,
                      drill: drill
                    };
                  }
                  return null;
                }).filter(Boolean);
              }
            }
            
            return {
              ...workout,
              drills: drills
            };
          })
        );

        const data = workoutsWithDrills;

        setWorkouts(data || []);

        // Group workouts by size
        const grouped: GroupedWorkouts = {
          mini: data?.find(w => w.workout_size === 'mini') || null,
          more: data?.find(w => w.workout_size === 'more') || null,
          complete: data?.find(w => w.workout_size === 'complete') || null
        };
        setGroupedWorkouts(grouped);
      } catch (err) {
        console.error('Error fetching workouts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch workouts');
      } finally {
        setLoading(false);
      }
    }

    fetchWorkouts();
  }, [seriesId]);

  return { workouts, groupedWorkouts, loading, error };
}

// Fetch a complete workout session with drills
export function useWorkoutSession(workoutId: number | null, userId?: string) {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workoutId) {
      setSession(null);
      setLoading(false);
      return;
    }

    async function fetchSession() {
      try {
        setLoading(true);
        console.log(`🚀 Starting fetchSession for workout ${workoutId}`);

        // Fetch workout with series info
        const { data: workout, error: workoutError } = await supabase
          .from('skills_academy_workouts')
          .select(`
            *,
            series:skills_academy_series(*)
          `)
          .eq('id', workoutId)
          .single();

        console.log('📦 Workout fetch result:', { workout, workoutError });
        if (workoutError) {
          console.error('❌ Workout fetch error:', workoutError);
          throw workoutError;
        }

        // Fetch drills using the new drill_ids array approach
        let drillsToUse: any[] = [];
        
        console.log('🔍 Checking workout.drill_ids:', workout?.drill_ids);
        console.log('🔍 Is array?', Array.isArray(workout?.drill_ids));
        console.log('🔍 Length:', workout?.drill_ids?.length);
        
        if (workout?.drill_ids && workout.drill_ids.length > 0) {
          console.log(`🎯 Workout "${workout.workout_name}" has ${workout.drill_ids.length} drill IDs: [${workout.drill_ids.join(', ')}]`);
          
          // Fetch drills using the drill_ids array
          console.log('📡 Fetching drills with IDs:', workout.drill_ids);
          const { data: drills, error: drillsError } = await supabase
            .from('skills_academy_drills')
            .select('*')
            .in('id', workout.drill_ids);
          
          console.log('📡 Drills query result:', { drills, drillsError, drillsLength: drills?.length });
          
          if (drillsError) {
            console.error('❌ Error fetching drills:', drillsError);
            console.log('⚠️ Using fallback drills due to error');
            // Use fallback drills
            drillsToUse = createFallbackDrills(workout.drill_ids, workoutId);
          } else if (drills && drills.length > 0) {
            console.log(`✅ Found ${drills.length} drill records in database`);
            console.log('📊 Full drills data:', JSON.stringify(drills, null, 2));
            console.log('🎯 First drill video_url:', drills[0]?.video_url);
            console.log('🎯 First drill vimeo_id:', drills[0]?.vimeo_id);
            
            // Create drill objects in the correct order
            drillsToUse = workout.drill_ids.map((drillId, index) => {
              const drill = drills.find(d => d.id === drillId);
              if (!drill) {
                console.log(`⚠️ No drill found for ID ${drillId}`);
                return null;
              }
              
              console.log(`📹 Drill ${drill.id} video_url: ${drill.video_url}`);
              
              return {
                id: `${workoutId}-${index}`,
                workout_id: workoutId,
                drill_id: drill.id,
                sequence_order: index + 1,
                drill_duration_seconds: 60,
                repetitions: 10,
                drill: {
                  id: drill.id,
                  drill_name: drill.title || `Drill ${index + 1}`,
                  title: drill.title,
                  description: drill.description || '',
                  video_url: drill.video_url, // NEW: Use the complete video URL
                  vimeo_id: drill.vimeo_id,
                  sets_and_reps: drill.sets_and_reps, // ADD THIS FIELD
                  duration_minutes: drill.duration_minutes,
                  point_values: drill.point_values, // Include point values too
                  both_hands_vimeo_id: drill.vimeo_id,
                  strong_hand_vimeo_id: drill.vimeo_id,
                  off_hand_vimeo_id: drill.vimeo_id,
                  both_hands_video_url: drill.video_url || (drill.vimeo_id ? `https://vimeo.com/${drill.vimeo_id}` : null),
                  strong_hand_video_url: drill.video_url || (drill.vimeo_id ? `https://vimeo.com/${drill.vimeo_id}` : null),
                  off_hand_video_url: drill.video_url || (drill.vimeo_id ? `https://vimeo.com/${drill.vimeo_id}` : null)
                }
              };
            }).filter(Boolean);
            
            console.log(`✅ Created ${drillsToUse.length} drill objects with video URLs`);
            if (drillsToUse.length > 0) {
              console.log('🎬 First drill object video_url:', drillsToUse[0]?.drill?.video_url);
            }
          } else {
            console.log('⚠️  Skills Academy drills table is empty, using fallback drills from documentation');
            // Use fallback drills based on documentation
            drillsToUse = createFallbackDrills(workout.drill_ids, workoutId);
          }
          
          console.log(`📋 Final drill count: ${drillsToUse.length} drills ready for workout`);
        } else {
          console.warn(`⚠️  Workout ${workoutId} has no drill_ids populated`);
        }

        // Fetch user progress if userId provided
        let progress: SkillsAcademyUserProgress | null = null;
        if (userId) {
          const { data: progressData } = await supabase
            .from('skills_academy_user_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('workout_id', workoutId)
            .eq('status', 'in_progress')
            .order('started_at', { ascending: false })
            .limit(1)
            .single();

          progress = progressData;
        }

        // Build drills with progress
        const currentIndex = progress?.current_drill_index || 0;
        const drillsWithProgress: DrillWithProgress[] = (drillsToUse || []).map((wd, index) => ({
          ...wd,
          isCompleted: index < currentIndex,
          isCurrent: index === currentIndex,
          isLocked: index > currentIndex
        }));

        const sessionData = {
          workout,
          drills: drillsWithProgress,
          progress,
          currentDrillIndex: currentIndex
        };
        
        console.log('📝 Setting session with:', {
          workoutName: workout?.workout_name,
          drillCount: drillsWithProgress.length,
          firstDrill: drillsWithProgress[0]?.drill?.title,
          firstDrillVideoUrl: drillsWithProgress[0]?.drill?.video_url,
          firstDrillVimeoId: drillsWithProgress[0]?.drill?.vimeo_id
        });
        
        setSession(sessionData);
      } catch (err) {
        console.error('Error fetching workout session:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch session');
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [workoutId, userId]);

  return { session, loading, error };
}

// Start or resume a workout session
export async function startWorkoutSession(workoutId: number, userId: string, totalDrills: number) {
  try {
    // Check for existing in-progress session
    const { data: existing } = await supabase
      .from('skills_academy_user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('workout_id', workoutId)
      .eq('status', 'in_progress')
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      // Resume existing session
      return { success: true, progress: existing, isNew: false };
    }

    // Create new session
    const { data: newProgress, error } = await supabase
      .from('skills_academy_user_progress')
      .insert({
        user_id: userId,
        workout_id: workoutId,
        total_drills: totalDrills,
        current_drill_index: 0,
        drills_completed: 0,
        status: 'in_progress'
      })
      .select()
      .single();

    if (error) throw error;

    // Update workout started count
    await supabase
      .from('skills_academy_workouts')
      .update({ 
        times_started: supabase.raw('times_started + 1')
      })
      .eq('id', workoutId);

    return { success: true, progress: newProgress, isNew: true };
  } catch (error) {
    console.error('Error starting workout session:', error);
    return { success: false, error };
  }
}

// Complete a drill and move to next
export async function completeDrill(
  progressId: number, 
  currentIndex: number,
  totalDrills: number,
  pointsEarned: number = 10
) {
  try {
    const nextIndex = currentIndex + 1;
    const isComplete = nextIndex >= totalDrills;

    const updateData: any = {
      current_drill_index: isComplete ? currentIndex : nextIndex,
      drills_completed: nextIndex,
      last_activity_at: new Date().toISOString(),
      completion_percentage: (nextIndex / totalDrills) * 100,
      points_earned: supabase.raw(`points_earned + ${pointsEarned}`)
    };

    if (isComplete) {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('skills_academy_user_progress')
      .update(updateData)
      .eq('id', progressId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, progress: data, isComplete };
  } catch (error) {
    console.error('Error completing drill:', error);
    return { success: false, error };
  }
}

// Mark workout as completed
export async function completeWorkout(progressId: number, workoutId: number) {
  try {
    // Update progress to completed
    const { error: progressError } = await supabase
      .from('skills_academy_user_progress')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completion_percentage: 100
      })
      .eq('id', progressId);

    if (progressError) throw progressError;

    // Update workout completion count
    const { error: workoutError } = await supabase
      .from('skills_academy_workouts')
      .update({ 
        times_completed: supabase.raw('times_completed + 1')
      })
      .eq('id', workoutId);

    if (workoutError) throw workoutError;

    return { success: true };
  } catch (error) {
    console.error('Error completing workout:', error);
    return { success: false, error };
  }
}

// Fallback drill creator using drill names from SKILLS_ACADEMY_DRILL_VERIFICATION.md
function createFallbackDrills(drillIds: number[], workoutId: number): any[] {
  const drillNames = [
    'Shoulder to Shoulder Cradle',
    'Shoulder to Nose Cradle', 
    'Standing Switches - Up to Pass Drill',
    '2 Hand Cradle Away Drill',
    'Step Away Passing Drill',
    'Minnows Ground Balls; Kiss The Stick Up to Pass Drill',
    'Minnows Ground Ball Drill; Miss; Kick; Scoop',
    'Punch and Pull Passing Drill',
    'Swat The Fly Drill - Behind The Goal',
    'Extended Swat The Fly Drill',
    'Shuffle Step Time and Room Shooting Drill - Behind The Goal',
    'Strong Hand Wide Turn Ground Balls',
    'Stick Away Turn and Switch Hands Drill',
    'Off Hand Wide Turn Ground Balls',
    'Wind Up Face Dodge to Shin Cradles',
    'Up to Pass Face Dodge Drill',
    'Wind Up Face Dodge to Shot Drill',
    'Matt Brown Shooting Drill',
    'Shooting on the Run Around a Curve Drill - Down The Alley',
    'Richmond Step and Shoot on the Run Drill',
    'T2 Shooting on the Run Footwork Drill',
    'Shooting on the Run Around a Curve Drill - Across The Top',
    'Shooting on the Run Around a Curve Drill - Up The Hash / Turn The Corner',
    'Split to Set Feet - Time and Room Shooting Drill',
    'Pop to Shot - Time and Room Shooting Drill',
    'Catch Across Body - Time and Room Shooting Drill',
    'Answer Move to Time and Room - Time and Room Shooting Drill',
    'Roll Dodge to Set Feet - Time and Room Shooting Drill',
    'Front Foot Hitch Drill',
    'Quick Stick Catching Drill',
    'Single Cradle Catching Drill',
    'Cross Body Catch and Pause Drill',
    'Over The Shoulder Catching Drill',
    'Low Catch Drill',
    'Pop to Catch Drill',
    'Talk To - Listen To Top Hand Fake Drill',
    'Bottom Hand Fake Drill',
    'Near Side Fake Drill',
    'Far Side Fake Drill',
    'High Crease - Clear Through Cut Catch and Finish Drill',
    'High Crease - Ball Cut Catch and Finish Drill',
    'High Crease - Back Pipe Cut Catch and Finish Drill',
    'Jump Shot on the Run Drill',
    'Low Crease - Up Field Cut Catch and Finish Drill'
  ];

  console.log(`🛠️  Creating ${drillIds.length} fallback drills for workout ${workoutId}`);

  return drillIds.map((drillId, index) => {
    const drillName = drillNames[index] || `Skills Academy Drill ${drillId}`;
    
    return {
      id: `${workoutId}-${index}`,
      workout_id: workoutId,
      drill_id: drillId,
      sequence_order: index + 1,
      drill_duration_seconds: 60 + (index * 10), // Vary duration
      repetitions: 10 + (index * 2), // Vary reps
      video_type: 'both_hands',
      drill: {
        id: drillId,
        drill_name: drillName,
        title: drillName,
        description: `Professional lacrosse training drill focusing on fundamental skills development. This drill helps improve technique, timing, and muscle memory.`,
        both_hands_vimeo_id: `${100000000 + drillId}`, // Mock vimeo IDs
        strong_hand_vimeo_id: `${200000000 + drillId}`,
        off_hand_vimeo_id: `${300000000 + drillId}`,
        both_hands_video_url: `https://vimeo.com/${100000000 + drillId}`,
        strong_hand_video_url: `https://vimeo.com/${200000000 + drillId}`,
        off_hand_video_url: `https://vimeo.com/${300000000 + drillId}`
      }
    };
  });
}
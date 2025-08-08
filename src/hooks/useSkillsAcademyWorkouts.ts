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

        // Fetch drills for each workout
        const workoutsWithDrills = await Promise.all(
          (workoutsData || []).map(async (workout) => {
            const { data: drills } = await supabase
              .from('skills_academy_workout_drills')
              .select(`
                *,
                drill:skills_academy_drill_library(*)
              `)
              .eq('workout_id', workout.id)
              .order('sequence_order', { ascending: true });
            
            return {
              ...workout,
              drills: drills || []
            };
          })
        );

        const data = workoutsWithDrills;

        if (error) throw error;

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

        // Fetch workout with series info
        const { data: workout, error: workoutError } = await supabase
          .from('skills_academy_workouts')
          .select(`
            *,
            series:skills_academy_series(*)
          `)
          .eq('id', workoutId)
          .single();

        if (workoutError) throw workoutError;

        // Fetch drills for this workout
        const { data: workoutDrills, error: drillsError } = await supabase
          .from('skills_academy_workout_drills')
          .select(`
            *,
            drill:skills_academy_drill_library(*)
          `)
          .eq('workout_id', workoutId)
          .order('sequence_order', { ascending: true });

        if (drillsError) throw drillsError;

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
        const drillsWithProgress: DrillWithProgress[] = (workoutDrills || []).map((wd, index) => ({
          ...wd,
          isCompleted: index < currentIndex,
          isCurrent: index === currentIndex,
          isLocked: index > currentIndex
        }));

        setSession({
          workout,
          drills: drillsWithProgress,
          progress,
          currentDrillIndex: currentIndex
        });
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
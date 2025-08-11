import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { WallBallSeries, WallBallVariant, GroupedVariants } from '@/types/wall-ball';

// Wall Ball series are now part of Skills Academy
export function useWallBallSeries() {
  const [series, setSeries] = useState<WallBallSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSeries() {
      try {
        // Fetch Wall Ball series from Skills Academy tables
        const { data, error } = await supabase
          .from('skills_academy_series')
          .select('*')
          .eq('series_type', 'wall_ball')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        
        // Map Skills Academy series to Wall Ball series format
        const mappedSeries = (data || []).map(s => ({
          id: s.id,
          series_name: s.series_name,
          series_slug: s.series_name.toLowerCase().replace(/\s+/g, '-'),
          description: s.description,
          skill_focus: 'Wall Ball',
          difficulty_level: s.difficulty_level || 'beginner',
          target_audience: s.target_audience,
          thumbnail_url: s.thumbnail_url,
          preview_video_url: s.preview_video_url,
          is_featured: s.is_featured || false,
          display_order: s.display_order,
          available_durations: [5, 10, 15], // Default wall ball durations
          has_coaching_version: true,
          has_no_coaching_version: true,
          total_variants: 6, // Mini/More/Complete x With/Without coaching
          times_accessed: s.times_accessed || 0,
          average_rating: s.average_rating,
          is_active: s.is_active,
          created_at: s.created_at,
          updated_at: s.updated_at
        }));
        
        setSeries(mappedSeries);
      } catch (err) {
        console.error('Error fetching wall ball series:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch series');
      } finally {
        setLoading(false);
      }
    }

    fetchSeries();
  }, []);

  return { series, loading, error };
}

// Wall Ball variants are now Skills Academy workouts
export function useWallBallVariants(seriesId: number | null) {
  const [variants, setVariants] = useState<WallBallVariant[]>([]);
  const [groupedVariants, setGroupedVariants] = useState<GroupedVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seriesId) {
      setVariants([]);
      setGroupedVariants([]);
      setLoading(false);
      return;
    }

    async function fetchVariants() {
      try {
        setLoading(true);
        // Fetch Wall Ball workouts from Skills Academy tables
        const { data, error } = await supabase
          .from('skills_academy_workouts')
          .select(`
            *,
            series:skills_academy_series(*)
          `)
          .eq('series_id', seriesId)
          .eq('is_active', true)
          .order('workout_size', { ascending: true });

        if (error) throw error;

        // Map Skills Academy workouts to Wall Ball variant format
        const mappedVariants = (data || []).map(workout => {
          const durationMap = {
            'mini': 5,
            'more': 10, 
            'complete': 15
          };
          
          return {
            id: workout.id,
            series_id: workout.series_id,
            variant_name: `${workout.workout_size.charAt(0).toUpperCase() + workout.workout_size.slice(1)} Wall Ball`,
            duration_minutes: durationMap[workout.workout_size] || 10,
            has_coaching: !workout.workout_size.includes('no_coach'),
            full_workout_video_url: workout.video_url || '',
            full_workout_vimeo_id: workout.vimeo_id,
            drill_sequence: workout.drill_ids?.join(',') || null,
            drill_ids: workout.drill_ids || [],
            total_drills: workout.drill_count || 0,
            wp_post_id: workout.wp_post_id,
            original_csv_column: workout.original_json_name,
            times_completed: workout.times_completed || 0,
            is_active: workout.is_active,
            created_at: workout.created_at,
            updated_at: workout.updated_at,
            series: workout.series
          };
        });

        setVariants(mappedVariants);

        // Group variants by duration
        const grouped = groupVariantsByDuration(mappedVariants);
        setGroupedVariants(grouped);
      } catch (err) {
        console.error('Error fetching wall ball variants:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch variants');
      } finally {
        setLoading(false);
      }
    }

    fetchVariants();
  }, [seriesId]);

  return { variants, groupedVariants, loading, error };
}

function groupVariantsByDuration(variants: WallBallVariant[]): GroupedVariants[] {
  const durations = [...new Set(variants.map(v => v.duration_minutes))].sort((a, b) => a - b);
  
  return durations.map(duration => {
    const durVariants = variants.filter(v => v.duration_minutes === duration);
    return {
      duration,
      withCoaching: durVariants.find(v => v.has_coaching) || null,
      withoutCoaching: durVariants.find(v => !v.has_coaching) || null
    };
  });
}

// Wall Ball variant is now a Skills Academy workout
export function useWallBallVariant(variantId: number | null) {
  const [variant, setVariant] = useState<WallBallVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!variantId) {
      setVariant(null);
      setLoading(false);
      return;
    }

    async function fetchVariant() {
      try {
        setLoading(true);
        
        // Fetch from Skills Academy workout table
        const { data: workout, error: workoutError } = await supabase
          .from('skills_academy_workouts')
          .select(`
            *,
            series:skills_academy_series(*)
          `)
          .eq('id', variantId)
          .single();

        if (workoutError) throw workoutError;

        // Fetch drills using drill_ids array
        let drills: any[] = [];
        if (workout.drill_ids && workout.drill_ids.length > 0) {
          const { data: drillsData, error: drillsError } = await supabase
            .from('skills_academy_drills')
            .select('*')
            .in('id', workout.drill_ids);
          
          if (!drillsError && drillsData) {
            drills = workout.drill_ids.map((drillId: number, index: number) => {
              const drill = drillsData.find(d => d.id === drillId);
              return drill ? {
                id: `${workout.id}-${index}`,
                drill_id: drill.id,
                sequence_order: index + 1,
                drill: drill
              } : null;
            }).filter(Boolean);
          }
        }

        // Map to expected WallBallVariant format with drills attached
        const durationMap = {
          'mini': 5,
          'more': 10, 
          'complete': 15
        };
        
        const mappedVariant: WallBallVariant & { drills: any[] } = {
          id: workout.id,
          series_id: workout.series_id,
          variant_name: workout.workout_name,
          duration_minutes: durationMap[workout.workout_size] || 10,
          has_coaching: !workout.workout_size.includes('no_coach'),
          full_workout_video_url: workout.video_url || '',
          full_workout_vimeo_id: workout.vimeo_id,
          drill_sequence: workout.drill_ids?.join(',') || null,
          drill_ids: workout.drill_ids || [],
          total_drills: workout.drill_count || 0,
          wp_post_id: workout.wp_post_id,
          original_csv_column: workout.original_json_name,
          times_completed: workout.times_completed || 0,
          is_active: workout.is_active,
          created_at: workout.created_at,
          updated_at: workout.updated_at,
          drills: drills,
          series: workout.series
        };

        setVariant(mappedVariant);
      } catch (err) {
        console.error('Error fetching wall ball variant:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch variant');
      } finally {
        setLoading(false);
      }
    }

    fetchVariant();
  }, [variantId]);

  return { variant, loading, error };
}

// Track workout completion - now uses Skills Academy tables
export async function markWorkoutComplete(variantId: number, userId: string) {
  try {
    // Update the times_completed counter in Skills Academy
    const { error: updateError } = await supabase
      .from('skills_academy_workouts')
      .update({ 
        times_completed: supabase.raw('times_completed + 1')
      })
      .eq('id', variantId);

    if (updateError) throw updateError;

    // Log user completion in Skills Academy progress
    const { error: logError } = await supabase
      .from('skills_academy_user_progress')
      .insert({
        user_id: userId,
        workout_id: variantId,
        status: 'completed',
        completion_percentage: 100,
        completed_at: new Date().toISOString()
      });

    if (logError) {
      console.warn('Could not log user progress:', logError);
      // Don't fail the whole operation for logging issues
    }

    return { success: true };
  } catch (error) {
    console.error('Error marking workout complete:', error);
    return { success: false, error };
  }
}
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { WallBallSeries, WallBallVariant, GroupedVariants } from '@/types/wall-ball';

export function useWallBallSeries() {
  const [series, setSeries] = useState<WallBallSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSeries() {
      try {
        const { data, error } = await supabase
          .from('wall_ball_workout_series')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setSeries(data || []);
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
        const { data, error } = await supabase
          .from('wall_ball_workout_variants')
          .select(`
            *,
            series:wall_ball_workout_series(*)
          `)
          .eq('series_id', seriesId)
          .eq('is_active', true)
          .order('duration_minutes', { ascending: true });

        if (error) throw error;

        setVariants(data || []);

        // Group variants by duration
        const grouped = groupVariantsByDuration(data || []);
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
        
        // Fetch from actual wall ball collection table
        const { data: collection, error: collectionError } = await supabase
          .from('powlax_wall_ball_collections')
          .select('*')
          .eq('id', variantId)
          .single();

        if (collectionError) throw collectionError;

        // Fetch drills for this collection
        const { data: drills, error: drillsError } = await supabase
          .from('powlax_wall_ball_collection_drills')
          .select(`
            *,
            drill:powlax_wall_ball_drill_library(*)
          `)
          .eq('collection_id', variantId)
          .order('sequence_order', { ascending: true });

        if (drillsError) throw drillsError;

        // Map to expected WallBallVariant format with drills attached
        const mappedVariant: WallBallVariant & { drills: any[] } = {
          id: collection.id,
          series_id: collection.id,
          variant_name: collection.name,
          duration_minutes: collection.duration_minutes,
          has_coaching: collection.has_coaching || false,
          full_workout_video_url: collection.video_url || '',
          full_workout_vimeo_id: collection.vimeo_id,
          drill_sequence: null,
          drill_ids: drills?.map(d => d.drill_id) || [],
          total_drills: drills?.length || 0,
          wp_post_id: collection.wp_post_id,
          original_csv_column: null,
          times_completed: 0,
          is_active: true,
          created_at: collection.created_at,
          updated_at: collection.updated_at,
          drills: drills || [],
          series: {
            id: collection.id,
            series_name: collection.name,
            series_slug: collection.workout_type?.toLowerCase().replace(/\s+/g, '-') || '',
            description: collection.description,
            skill_focus: null,
            difficulty_level: collection.difficulty_level,
            target_audience: null,
            thumbnail_url: null,
            preview_video_url: null,
            is_featured: false,
            display_order: collection.id,
            available_durations: [collection.duration_minutes],
            has_coaching_version: collection.has_coaching || false,
            has_no_coaching_version: !collection.has_coaching,
            total_variants: 1,
            times_accessed: 0,
            average_rating: null,
            is_active: true,
            created_at: collection.created_at,
            updated_at: collection.updated_at
          }
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

// Track workout completion
export async function markWorkoutComplete(variantId: number, userId: string) {
  try {
    // Update the times_completed counter
    const { error: updateError } = await supabase
      .from('wall_ball_workout_variants')
      .update({ 
        times_completed: supabase.raw('times_completed + 1')
      })
      .eq('id', variantId);

    if (updateError) throw updateError;

    // Log user completion (if you have a user_workout_completions table)
    // const { error: logError } = await supabase
    //   .from('user_workout_completions')
    //   .insert({
    //     user_id: userId,
    //     workout_variant_id: variantId,
    //     completed_at: new Date().toISOString()
    //   });

    return { success: true };
  } catch (error) {
    console.error('Error marking workout complete:', error);
    return { success: false, error };
  }
}
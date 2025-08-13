import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';

// Badge and rank interfaces
interface BadgeProgress {
  id: number;
  badge_id: number;
  series_id: number;
  drills_completed: number;
  drills_required: number;
  progress_percentage: number;
  is_eligible: boolean;
  earned_at?: string;
}

interface RankProgress {
  id: number;
  current_rank_id: number;
  academy_points_total: number;
  points_to_next_rank: number;
  rank_progress_percentage: number;
  highest_rank_achieved: number;
}

interface BadgeEarned {
  badge_id: number;
  title: string;
  icon_url: string;
  category: string;
}

interface RankUp {
  new_rank_id: number;
  title: string;
  icon_url: string;
  description: string;
}

// Rank requirements with 10x multiplier
const RANK_REQUIREMENTS = [
  { id: 1, title: "Lacrosse Bot", points: 0 },
  { id: 2, title: "2nd Bar Syndrome", points: 250 },
  { id: 3, title: "Left Bench Hero", points: 600 },
  { id: 4, title: "Celly King", points: 1000 },
  { id: 5, title: "D-Mid Rising", points: 1400 },
  { id: 6, title: "Lacrosse Utility", points: 2000 },
  { id: 7, title: "Flow Bro", points: 3000 },
  { id: 8, title: "Lax Beast", points: 4500 },
  { id: 9, title: "Lax Ninja", points: 6000 },
  { id: 10, title: "Lax God", points: 10000 }
];

export const useGamificationTracking = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get drill requirements for a series (20 for solid_start, 50 for others)
  const getDrillsRequiredForSeries = async (seriesId: number): Promise<number> => {
    const { data: series } = await supabase
      .from('skills_academy_series')
      .select('series_type')
      .eq('id', seriesId)
      .single();

    return series?.series_type === 'solid_start' ? 20 : 50;
  };

  // Get badge ID for a series from mapping table
  const getBadgeIdForSeries = async (seriesId: number): Promise<number | null> => {
    const { data: mapping } = await supabase
      .from('badge_series_mapping')
      .select('badge_id')
      .eq('series_id', seriesId)
      .single();

    return mapping?.badge_id || null;
  };

  // Get drill point value (base 10 points + multipliers)
  const getDrillPointValue = async (drillId: number): Promise<number> => {
    const { data: drill } = await supabase
      .from('skills_academy_drills')
      .select('point_values')
      .eq('id', drillId)
      .single();

    // Base 10 points for Academy Points
    // Could add multipliers based on drill.point_values if needed
    return 10;
  };

  // Calculate rank from points
  const calculateRankFromPoints = (points: number) => {
    let currentRank = RANK_REQUIREMENTS[0];
    let nextRank = RANK_REQUIREMENTS[1];
    
    for (let i = 0; i < RANK_REQUIREMENTS.length; i++) {
      if (points >= RANK_REQUIREMENTS[i].points) {
        currentRank = RANK_REQUIREMENTS[i];
        nextRank = RANK_REQUIREMENTS[i + 1] || null;
      }
    }

    const pointsToNext = nextRank ? nextRank.points - points : 0;
    const progressPercentage = nextRank 
      ? ((points - currentRank.points) / (nextRank.points - currentRank.points)) * 100
      : 100;

    return {
      id: currentRank.id,
      pointsToNext,
      progressPercentage: Math.min(progressPercentage, 100)
    };
  };

  // Track drill completion for badge progress
  const trackDrillCompletion = useCallback(async (drillId: number, seriesId: number) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Get or create badge progress for this series
      const badgeId = await getBadgeIdForSeries(seriesId);
      if (!badgeId) {
        console.log('No badge mapped to series', seriesId);
        return null;
      }

      // Check existing progress
      const { data: existingProgress } = await supabase
        .from('user_badge_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('series_id', seriesId)
        .eq('badge_id', badgeId)
        .single();

      let badgeEarned: BadgeEarned | null = null;

      if (!existingProgress) {
        // Create new progress record
        const drillsRequired = await getDrillsRequiredForSeries(seriesId);
        const { data: newProgress } = await supabase
          .from('user_badge_progress')
          .insert([{
            user_id: user.id,
            badge_id: badgeId,
            series_id: seriesId,
            drills_completed: 1,
            drills_required: drillsRequired,
            is_eligible: 1 >= drillsRequired,
            earned_at: 1 >= drillsRequired ? new Date().toISOString() : null
          }])
          .select()
          .single();

        if (newProgress?.is_eligible) {
          badgeEarned = await awardBadge(badgeId);
        }
      } else {
        // Update existing progress
        const newCount = existingProgress.drills_completed + 1;
        const isNowEligible = newCount >= existingProgress.drills_required;

        const { data: updatedProgress } = await supabase
          .from('user_badge_progress')
          .update({
            drills_completed: newCount,
            is_eligible: isNowEligible,
            earned_at: isNowEligible && !existingProgress.earned_at 
              ? new Date().toISOString() 
              : existingProgress.earned_at
          })
          .eq('id', existingProgress.id)
          .select()
          .single();

        // Check if badge was just earned
        if (isNowEligible && !existingProgress.is_eligible) {
          badgeEarned = await awardBadge(badgeId);
          await checkCombinationBadges();
        }
      }

      // 2. Update Academy Points for rank progression
      const pointsEarned = await getDrillPointValue(drillId);
      const rankUp = await updateAcademyPoints(pointsEarned);

      setLoading(false);
      return { badgeEarned, rankUp };

    } catch (err) {
      console.error('Error tracking drill completion:', err);
      setError(err.message);
      setLoading(false);
      return null;
    }
  }, [user]);

  // Award a badge to the user
  const awardBadge = async (badgeId: number): Promise<BadgeEarned | null> => {
    if (!user) return null;

    try {
      // Get badge details
      const { data: badge } = await supabase
        .from('badges_powlax')
        .select('*')
        .eq('id', badgeId)
        .single();

      if (!badge) return null;

      // Check if already awarded
      const { data: existing } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .eq('badge_id', badgeId)
        .single();

      if (!existing) {
        // Award the badge
        await supabase
          .from('user_badges')
          .insert([{
            user_id: user.id,
            badge_id: badgeId,
            earned_at: new Date().toISOString()
          }]);
      }

      return {
        badge_id: badge.id,
        title: badge.title,
        icon_url: badge.icon_url,
        category: badge.category
      };

    } catch (err) {
      console.error('Error awarding badge:', err);
      return null;
    }
  };

  // Check for combination badges
  const checkCombinationBadges = async () => {
    if (!user) return;

    try {
      // Get all combination badge requirements
      const { data: combinations } = await supabase
        .from('badge_series_mapping')
        .select('*')
        .eq('is_combination_badge', true);

      if (!combinations) return;

      // Get user's earned badges
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user.id);

      const earnedBadgeIds = userBadges?.map(ub => ub.badge_id) || [];

      // Check each combination
      for (const combo of combinations) {
        const required = combo.combination_badge_ids || [];
        const hasAll = required.every(id => earnedBadgeIds.includes(id));

        if (hasAll && !earnedBadgeIds.includes(combo.badge_id)) {
          await awardBadge(combo.badge_id);
        }
      }
    } catch (err) {
      console.error('Error checking combination badges:', err);
    }
  };

  // Update Academy Points total
  const updateAcademyPoints = async (pointsEarned: number): Promise<RankUp | null> => {
    if (!user) return null;

    try {
      // Get current rank progress
      const { data: currentProgress } = await supabase
        .from('user_rank_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const newTotal = (currentProgress?.academy_points_total || 0) + pointsEarned;
      const newRank = calculateRankFromPoints(newTotal);

      if (!currentProgress) {
        // Create initial rank progress
        await supabase
          .from('user_rank_progress')
          .insert([{
            user_id: user.id,
            academy_points_total: newTotal,
            current_rank_id: newRank.id,
            points_to_next_rank: newRank.pointsToNext,
            rank_progress_percentage: newRank.progressPercentage,
            highest_rank_achieved: newRank.id
          }]);
      } else {
        // Update existing progress
        const rankChanged = currentProgress.current_rank_id !== newRank.id;
        
        await supabase
          .from('user_rank_progress')
          .update({
            academy_points_total: newTotal,
            current_rank_id: newRank.id,
            points_to_next_rank: newRank.pointsToNext,
            rank_progress_percentage: newRank.progressPercentage,
            highest_rank_achieved: Math.max(newRank.id, currentProgress.highest_rank_achieved),
            rank_updated_at: rankChanged ? new Date().toISOString() : currentProgress.rank_updated_at
          })
          .eq('id', currentProgress.id);

        // Return rank up info if rank changed
        if (rankChanged) {
          const { data: rankData } = await supabase
            .from('powlax_player_ranks')
            .select('*')
            .eq('id', newRank.id)
            .single();

          if (rankData) {
            return {
              new_rank_id: rankData.id,
              title: rankData.title,
              icon_url: rankData.icon_url,
              description: rankData.description
            };
          }
        }
      }

      return null;

    } catch (err) {
      console.error('Error updating Academy Points:', err);
      return null;
    }
  };

  // Get user's badge progress
  const getUserBadgeProgress = useCallback(async () => {
    if (!user) return [];

    try {
      const { data } = await supabase
        .from('user_badge_progress')
        .select(`
          *,
          badge:badges_powlax!badge_id(*),
          series:skills_academy_series!series_id(*)
        `)
        .eq('user_id', user.id);

      return data || [];
    } catch (err) {
      console.error('Error fetching badge progress:', err);
      return [];
    }
  }, [user]);

  // Get user's rank progress
  const getUserRankProgress = useCallback(async () => {
    if (!user) return null;

    try {
      const { data } = await supabase
        .from('user_rank_progress')
        .select(`
          *,
          current_rank:powlax_player_ranks!current_rank_id(*)
        `)
        .eq('user_id', user.id)
        .single();

      return data;
    } catch (err) {
      console.error('Error fetching rank progress:', err);
      return null;
    }
  }, [user]);

  return {
    trackDrillCompletion,
    getUserBadgeProgress,
    getUserRankProgress,
    updateAcademyPoints,
    checkCombinationBadges,
    loading,
    error
  };
};
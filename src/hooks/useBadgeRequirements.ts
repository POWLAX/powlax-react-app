import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface BadgeRequirement {
  badge_id: number;
  series_id: number | null;
  drills_required: number;
  is_combination_badge: boolean;
  combination_badge_ids: number[];
  badge_title?: string;
  badge_icon_url?: string;
  series_name?: string;
}

export const useBadgeRequirements = () => {
  const [requirements, setRequirements] = useState<BadgeRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBadgeRequirements();
  }, []);

  const fetchBadgeRequirements = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all badge-series mappings with badge and series details
      const { data, error: fetchError } = await supabase
        .from('badge_series_mapping')
        .select(`
          *,
          series:skills_academy_series!series_id(
            id,
            series_name,
            series_type
          )
        `)
        .order('badge_id', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      // Get badge details
      const { data: badges } = await supabase
        .from('badges_powlax')
        .select('id, title, icon_url, category');

      // Merge badge details with requirements
      const enrichedRequirements = data?.map(req => {
        const badge = badges?.find(b => b.id === req.badge_id);
        return {
          ...req,
          badge_title: badge?.title,
          badge_icon_url: badge?.icon_url,
          series_name: req.series?.series_name
        };
      }) || [];

      setRequirements(enrichedRequirements);
      setLoading(false);

    } catch (err) {
      console.error('Error fetching badge requirements:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Get requirements for a specific badge
  const getBadgeRequirement = (badgeId: number): BadgeRequirement | undefined => {
    return requirements.find(req => req.badge_id === badgeId);
  };

  // Get all badges for a specific series
  const getBadgesForSeries = (seriesId: number): BadgeRequirement[] => {
    return requirements.filter(req => req.series_id === seriesId);
  };

  // Get all combination badges
  const getCombinationBadges = (): BadgeRequirement[] => {
    return requirements.filter(req => req.is_combination_badge);
  };

  // Check if prerequisites are met for a combination badge
  const checkCombinationPrerequisites = async (
    badgeId: number, 
    userBadgeIds: number[]
  ): Promise<boolean> => {
    const requirement = getBadgeRequirement(badgeId);
    if (!requirement || !requirement.is_combination_badge) {
      return false;
    }

    const requiredBadges = requirement.combination_badge_ids || [];
    return requiredBadges.every(id => userBadgeIds.includes(id));
  };

  return {
    requirements,
    loading,
    error,
    getBadgeRequirement,
    getBadgesForSeries,
    getCombinationBadges,
    checkCombinationPrerequisites,
    refetch: fetchBadgeRequirements
  };
};
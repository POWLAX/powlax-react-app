import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface GamificationUpdate {
  type: 'badge_progress' | 'rank_progress' | 'badge_earned' | 'rank_up';
  data: any;
  timestamp: string;
}

export const useGamificationSync = () => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<GamificationUpdate[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time updates for gamification data
    const gamificationChannel = supabase
      .channel(`gamification-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_badge_progress',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          handleBadgeProgressUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_rank_progress',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          handleRankProgressUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          handleBadgeEarned(payload);
        }
      )
      .subscribe();

    setChannel(gamificationChannel);

    // Cleanup on unmount
    return () => {
      if (gamificationChannel) {
        supabase.removeChannel(gamificationChannel);
      }
    };
  }, [user]);

  const handleBadgeProgressUpdate = (payload: any) => {
    const update: GamificationUpdate = {
      type: 'badge_progress',
      data: payload.new || payload.old,
      timestamp: new Date().toISOString()
    };

    setUpdates(prev => [...prev, update]);

    // Check if badge was just earned
    if (payload.new?.is_eligible && !payload.old?.is_eligible) {
      // Trigger badge earned notification
      fetchBadgeDetails(payload.new.badge_id);
    }
  };

  const handleRankProgressUpdate = (payload: any) => {
    const update: GamificationUpdate = {
      type: 'rank_progress',
      data: payload.new || payload.old,
      timestamp: new Date().toISOString()
    };

    setUpdates(prev => [...prev, update]);

    // Check if rank changed
    if (payload.new?.current_rank_id !== payload.old?.current_rank_id) {
      // Trigger rank up notification
      fetchRankDetails(payload.new.current_rank_id);
    }
  };

  const handleBadgeEarned = (payload: any) => {
    const update: GamificationUpdate = {
      type: 'badge_earned',
      data: payload.new,
      timestamp: new Date().toISOString()
    };

    setUpdates(prev => [...prev, update]);
  };

  const fetchBadgeDetails = async (badgeId: number) => {
    const { data: badge } = await supabase
      .from('badges_powlax')
      .select('*')
      .eq('id', badgeId)
      .single();

    if (badge) {
      const update: GamificationUpdate = {
        type: 'badge_earned',
        data: badge,
        timestamp: new Date().toISOString()
      };
      setUpdates(prev => [...prev, update]);
    }
  };

  const fetchRankDetails = async (rankId: number) => {
    const { data: rank } = await supabase
      .from('powlax_player_ranks')
      .select('*')
      .eq('id', rankId)
      .single();

    if (rank) {
      const update: GamificationUpdate = {
        type: 'rank_up',
        data: rank,
        timestamp: new Date().toISOString()
      };
      setUpdates(prev => [...prev, update]);
    }
  };

  // Get latest updates of each type
  const getLatestUpdate = (type: GamificationUpdate['type']) => {
    return updates
      .filter(u => u.type === type)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
  };

  // Clear updates (useful after displaying notifications)
  const clearUpdates = (type?: GamificationUpdate['type']) => {
    if (type) {
      setUpdates(prev => prev.filter(u => u.type !== type));
    } else {
      setUpdates([]);
    }
  };

  return {
    updates,
    getLatestUpdate,
    clearUpdates,
    isConnected: channel?.state === 'joined'
  };
};
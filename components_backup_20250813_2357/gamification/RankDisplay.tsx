'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface RankInfo {
  current_rank: {
    id: number;
    title: string;
    description: string;
    icon_url: string;
  };
  academy_points_total: number;
  points_to_next_rank: number;
  rank_progress_percentage: number;
  next_rank?: {
    id: number;
    title: string;
    points_required: number;
  };
}

// Rank requirements with 10x multiplier
const RANK_DATA = [
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

export default function RankDisplay({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const [rankInfo, setRankInfo] = useState<RankInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);
  
  useEffect(() => {
    fetchRankInfo();
  }, [user]);
  
  const fetchRankInfo = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      // Get user's rank progress
      const { data: progressData } = await supabase
        .from('user_rank_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressData) {
        // Get current rank details
        const { data: currentRankData } = await supabase
          .from('powlax_player_ranks')
          .select('*')
          .eq('id', progressData.current_rank_id)
          .single();

        // Calculate next rank
        const currentRankIndex = RANK_DATA.findIndex(r => r.id === progressData.current_rank_id);
        const nextRankData = RANK_DATA[currentRankIndex + 1];

        setRankInfo({
          current_rank: currentRankData || RANK_DATA[0],
          academy_points_total: progressData.academy_points_total || 0,
          points_to_next_rank: progressData.points_to_next_rank || 250,
          rank_progress_percentage: progressData.rank_progress_percentage || 0,
          next_rank: nextRankData
        });
      } else {
        // Create initial rank progress
        await supabase
          .from('user_rank_progress')
          .insert([{
            user_id: user.id,
            current_rank_id: 1,
            academy_points_total: 0,
            points_to_next_rank: 250,
            rank_progress_percentage: 0
          }]);
        
        // Get default first rank
        const { data: firstRank } = await supabase
          .from('powlax_player_ranks')
          .select('*')
          .eq('id', 1)
          .single();

        setRankInfo({
          current_rank: firstRank || RANK_DATA[0],
          academy_points_total: 0,
          points_to_next_rank: 250,
          rank_progress_percentage: 0,
          next_rank: RANK_DATA[1]
        });
      }
    } catch (error) {
      console.error('Error fetching rank info:', error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger animation on progress changes
  useEffect(() => {
    if (rankInfo?.rank_progress_percentage) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 1000);
    }
  }, [rankInfo?.rank_progress_percentage]);
  
  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 h-20 rounded-xl"></div>
    );
  }

  if (!rankInfo) {
    return null;
  }
  
  if (compact) {
    return (
      <div className="rank-display-compact bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 rounded-xl text-white shadow-xl">
        <div className="flex items-center gap-3">
          {/* Rank Icon */}
          {rankInfo.current_rank.icon_url ? (
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src={rankInfo.current_rank.icon_url}
                alt={rankInfo.current_rank.title}
                fill
                className="object-contain rounded-full border-2 border-white shadow-md"
                sizes="48px"
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white shadow-md">
              <span className="text-white font-bold text-lg">
                {rankInfo.current_rank.id}
              </span>
            </div>
          )}
          
          {/* Rank Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate">{rankInfo.current_rank.title}</h3>
            <div className="rank-progress bg-white/20 rounded-full h-2 mt-1 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-1000 ${
                  animating ? 'animate-pulse' : ''
                }`}
                style={{ width: `${Math.min(rankInfo.rank_progress_percentage, 100)}%` }}
              />
            </div>
          </div>
          
          {/* Points Display */}
          <div className="text-right">
            <p className="text-lg font-bold">
              {rankInfo.academy_points_total.toLocaleString()}
            </p>
            <p className="text-xs opacity-90">Academy Pts</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="rank-display-full bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header with Gradient Background */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
        <div className="flex items-center gap-4">
          {/* Rank Icon */}
          {rankInfo.current_rank.icon_url ? (
            <div className="relative w-20 h-20 flex-shrink-0">
              <Image
                src={rankInfo.current_rank.icon_url}
                alt={rankInfo.current_rank.title}
                fill
                className="object-contain rounded-full border-4 border-white shadow-xl"
                sizes="80px"
              />
            </div>
          ) : (
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
              <span className="text-white font-bold text-2xl">
                {rankInfo.current_rank.id}
              </span>
            </div>
          )}
          
          {/* Rank Details */}
          <div className="flex-1">
            <h2 className="font-black text-2xl mb-1">{rankInfo.current_rank.title}</h2>
            <p className="text-white/90 text-sm">{rankInfo.current_rank.description}</p>
          </div>
        </div>
      </div>
      
      {/* Progress Section */}
      <div className="p-6">
        {/* Progress Header */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-700">
            {rankInfo.next_rank ? `Progress to ${rankInfo.next_rank.title}` : 'Max Rank Achieved!'}
          </span>
          <span className="text-sm font-black text-purple-600">
            {rankInfo.rank_progress_percentage.toFixed(1)}%
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="progress-bar bg-gray-200 rounded-full h-4 mb-4 overflow-hidden shadow-inner">
          <div
            className={`h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 relative ${
              animating ? 'animate-pulse' : ''
            }`}
            style={{ width: `${Math.min(rankInfo.rank_progress_percentage, 100)}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shine" />
          </div>
        </div>
        
        {/* Points Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Current Points</p>
            <p className="text-2xl font-black text-gray-900">
              {rankInfo.academy_points_total.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs text-purple-600 mb-1">
              {rankInfo.next_rank ? 'Points to Next Rank' : 'Max Rank'}
            </p>
            <p className="text-2xl font-black text-purple-900">
              {rankInfo.points_to_next_rank > 0 
                ? rankInfo.points_to_next_rank.toLocaleString()
                : '🏆'
              }
            </p>
          </div>
        </div>
        
        {/* Next Rank Preview */}
        {rankInfo.next_rank && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                  <span className="text-purple-700 font-bold text-sm">
                    {rankInfo.next_rank.id}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Next Rank</p>
                  <p className="font-bold text-purple-900">{rankInfo.next_rank.title}</p>
                </div>
              </div>
              <p className="text-xs text-purple-700 font-semibold">
                {rankInfo.next_rank.points_required.toLocaleString()} pts
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
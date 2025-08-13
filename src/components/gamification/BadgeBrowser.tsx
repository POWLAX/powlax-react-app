'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Badge {
  id: number;
  title: string;
  description: string;
  icon_url: string;
  category: string;
  progress?: {
    drills_completed: number;
    drills_required: number;
    progress_percentage: number;
    is_eligible: boolean;
    series_name: string;
    series_id: number;
  };
}

export default function BadgeBrowser() {
  const { user } = useAuth();
  const router = useRouter();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchBadgesWithProgress();
  }, [user]);
  
  const fetchBadgesWithProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      // Get all badges
      const { data: badgeData } = await supabase
        .from('badges_powlax')
        .select('*')
        .order('category', { ascending: true });

      // Get user's progress
      const { data: progressData } = await supabase
        .from('user_badge_progress')
        .select(`
          *,
          series:skills_academy_series!series_id(series_name, id)
        `)
        .eq('user_id', user.id);

      // Merge badge data with progress
      const mergedBadges = badgeData?.map(badge => {
        const progress = progressData?.find(p => p.badge_id === badge.id);
        return {
          ...badge,
          progress: progress ? {
            drills_completed: progress.drills_completed || 0,
            drills_required: progress.drills_required || 50,
            progress_percentage: progress.progress_percentage || 0,
            is_eligible: progress.is_eligible || false,
            series_name: progress.series?.series_name || '',
            series_id: progress.series?.id || 0
          } : undefined
        };
      }) || [];
      
      setBadges(mergedBadges);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredBadges = badges.filter(badge => 
    selectedCategory === 'all' || badge.category === selectedCategory
  );
  
  const navigateToSeries = (seriesId: number) => {
    // Navigate user to Skills Academy series for training
    router.push(`/skills-academy/series/${seriesId}`);
  };

  const categories = [
    { id: 'all', label: 'All Badges', color: 'bg-gray-500' },
    { id: 'solid_start', label: 'Solid Start', color: 'bg-green-500' },
    { id: 'attack', label: 'Attack', color: 'bg-red-500' },
    { id: 'defense', label: 'Defense', color: 'bg-blue-500' },
    { id: 'midfield', label: 'Midfield', color: 'bg-purple-500' },
    { id: 'wall_ball', label: 'Wall Ball', color: 'bg-orange-500' },
    { id: 'lacrosse_iq', label: 'Lacrosse IQ', color: 'bg-indigo-500' }
  ];
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="badge-browser max-w-6xl mx-auto p-4">
      {/* Category Filter - Mobile Optimized */}
      <div className="category-filter mb-6 overflow-x-auto">
        <div className="flex gap-2 pb-2 min-w-max">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-5 py-3 rounded-full text-sm font-semibold transition-all transform hover:scale-105 ${
                selectedCategory === category.id
                  ? `${category.color} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Badge Grid - Mobile First Design */}
      <div className="badge-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBadges.map(badge => (
          <div 
            key={badge.id}
            className="badge-card bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 overflow-hidden"
          >
            {/* Badge Header with Icon */}
            <div className="relative p-4 bg-gradient-to-br from-gray-50 to-gray-100">
              {/* Badge Icon */}
              <div className="badge-icon mb-3 text-center">
                {badge.icon_url ? (
                  <div className="relative w-20 h-20 mx-auto">
                    <Image
                      src={badge.icon_url}
                      alt={badge.title}
                      fill
                      className="object-contain drop-shadow-lg"
                      sizes="80px"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">
                      {badge.title.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Earned Badge Indicator */}
              {badge.progress?.is_eligible && (
                <div className="absolute top-2 right-2">
                  <div className="bg-green-500 text-white rounded-full p-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            
            {/* Badge Content */}
            <div className="p-4">
              {/* Badge Title */}
              <h3 className="badge-title font-bold text-base mb-2 text-gray-800 text-center">
                {badge.title}
              </h3>
              
              {/* Progress Section */}
              {badge.progress ? (
                <div className="progress-section mb-3">
                  {/* Progress Bar */}
                  <div className="progress-bar bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500 relative"
                      style={{ width: `${Math.min(badge.progress.progress_percentage, 100)}%` }}
                    >
                      {/* Animated shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shine" />
                    </div>
                  </div>
                  
                  {/* Progress Text */}
                  <p className="progress-text text-xs text-gray-600 text-center font-medium">
                    {badge.progress.drills_completed} / {badge.progress.drills_required} drills
                  </p>
                </div>
              ) : (
                <div className="mb-3">
                  <div className="bg-gray-100 rounded-full h-3 mb-2" />
                  <p className="text-xs text-gray-500 text-center">No progress yet</p>
                </div>
              )}
              
              {/* Action Button */}
              {badge.progress?.is_eligible ? (
                <div className="text-center">
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-bold px-3 py-2 rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Earned!
                  </span>
                </div>
              ) : badge.progress && badge.progress.series_id ? (
                <button
                  onClick={() => navigateToSeries(badge.progress!.series_id)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-3 rounded-lg text-xs font-bold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-md"
                >
                  Train Now →
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-200 text-gray-500 py-2 px-3 rounded-lg text-xs font-medium cursor-not-allowed"
                >
                  Coming Soon
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Add CSS for the shine animation
const styleSheet = `
@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-shine {
  animation: shine 2s infinite;
}
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = styleSheet;
  document.head.appendChild(style);
}
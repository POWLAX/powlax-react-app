'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, Trophy, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  weeklyWorkouts: number;
  monthlyWorkouts: number;
  totalWorkouts: number;
}

interface StreakTrackerProps {
  userId?: string;
  onStreakUpdate?: (streak: number) => void;
}

export function StreakTracker({ userId, onStreakUpdate }: StreakTrackerProps) {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    weeklyWorkouts: 0,
    monthlyWorkouts: 0,
    totalWorkouts: 0
  });

  useEffect(() => {
    // Load streak data from localStorage (or database in production)
    const loadStreakData = () => {
      const key = `streak_${userId || 'default'}`;
      const stored = localStorage.getItem(key);
      
      if (stored) {
        const data = JSON.parse(stored);
        setStreakData(data);
        onStreakUpdate?.(data.currentStreak);
      } else {
        // Initialize with sample data for demo
        const initialData: StreakData = {
          currentStreak: 3,
          longestStreak: 7,
          lastWorkoutDate: new Date().toISOString(),
          weeklyWorkouts: 5,
          monthlyWorkouts: 18,
          totalWorkouts: 42
        };
        setStreakData(initialData);
        localStorage.setItem(key, JSON.stringify(initialData));
      }
    };

    loadStreakData();
  }, [userId, onStreakUpdate]);

  const updateStreak = () => {
    const today = new Date().toDateString();
    const lastWorkout = streakData.lastWorkoutDate ? new Date(streakData.lastWorkoutDate).toDateString() : null;
    
    let newStreak = streakData.currentStreak;
    
    if (lastWorkout !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastWorkout === yesterday.toDateString()) {
        // Consecutive day - increase streak
        newStreak = streakData.currentStreak + 1;
      } else if (lastWorkout === today) {
        // Same day - no change
        newStreak = streakData.currentStreak;
      } else {
        // Streak broken - reset to 1
        newStreak = 1;
      }
      
      const updatedData: StreakData = {
        ...streakData,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streakData.longestStreak),
        lastWorkoutDate: new Date().toISOString(),
        weeklyWorkouts: streakData.weeklyWorkouts + 1,
        monthlyWorkouts: streakData.monthlyWorkouts + 1,
        totalWorkouts: streakData.totalWorkouts + 1
      };
      
      setStreakData(updatedData);
      localStorage.setItem(`streak_${userId || 'default'}`, JSON.stringify(updatedData));
      onStreakUpdate?.(newStreak);
    }
  };

  const getStreakColor = () => {
    if (streakData.currentStreak >= 7) return 'text-orange-500';
    if (streakData.currentStreak >= 3) return 'text-yellow-500';
    return 'text-gray-400';
  };

  const getStreakMessage = () => {
    if (streakData.currentStreak >= 30) return "Legendary! 🏆";
    if (streakData.currentStreak >= 14) return "On Fire! 🔥";
    if (streakData.currentStreak >= 7) return "Great Work! ⭐";
    if (streakData.currentStreak >= 3) return "Building Momentum! 💪";
    return "Keep Going! 👍";
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
      <div className="space-y-4">
        {/* Main Streak Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`${getStreakColor()}`}
            >
              <Flame className="w-8 h-8" />
            </motion.div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {streakData.currentStreak} Day Streak
              </div>
              <div className="text-sm text-gray-600">{getStreakMessage()}</div>
            </div>
          </div>
          
          {/* Streak Multiplier Badge */}
          {streakData.currentStreak >= 3 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full font-bold"
            >
              {Math.min(Math.floor(streakData.currentStreak / 3) + 1, 5)}x Bonus
            </motion.div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/80 rounded-lg p-2">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
            <div className="text-lg font-bold">{streakData.longestStreak}</div>
            <div className="text-xs text-gray-600">Best Streak</div>
          </div>
          
          <div className="bg-white/80 rounded-lg p-2">
            <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-600" />
            <div className="text-lg font-bold">{streakData.weeklyWorkouts}</div>
            <div className="text-xs text-gray-600">This Week</div>
          </div>
          
          <div className="bg-white/80 rounded-lg p-2">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-600" />
            <div className="text-lg font-bold">{streakData.totalWorkouts}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>

        {/* Streak Calendar Preview */}
        <div className="flex gap-1 justify-center">
          {[...Array(7)].map((_, i) => {
            const day = 6 - i; // Start from today (rightmost)
            const isActive = day < streakData.currentStreak;
            
            return (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive 
                    ? 'bg-gradient-to-br from-orange-400 to-yellow-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {day === 0 ? 'T' : `-${day}`}
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// Mini streak display for workout page
export function StreakBadge({ streak }: { streak: number }) {
  if (streak < 3) return null;
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-400 to-yellow-500 text-white rounded-full text-sm font-bold"
    >
      <Flame className="w-4 h-4" />
      {streak}
    </motion.div>
  );
}
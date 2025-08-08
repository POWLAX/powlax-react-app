'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkillsAcademySeries } from '@/types/skills-academy';
import { 
  Target, Users, Trophy, ChevronRight, Clock, 
  Play, Dumbbell, Star, Heart, Shield, Swords, Zap
} from 'lucide-react';
import { WorkoutPreviewModal } from './WorkoutPreviewModal';
import { useSkillsAcademyWorkouts } from '@/hooks/useSkillsAcademyWorkouts';

interface SkillsAcademySeriesCardEnhancedProps {
  series: SkillsAcademySeries;
  onStartWorkout: (workoutId: number) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (seriesId: number) => void;
  completedWorkouts?: number[];
}

export function SkillsAcademySeriesCardEnhanced({ 
  series, 
  onStartWorkout,
  isFavorite = false,
  onToggleFavorite,
  completedWorkouts = []
}: SkillsAcademySeriesCardEnhancedProps) {
  const [selectedWorkoutSize, setSelectedWorkoutSize] = useState<'mini' | 'more' | 'complete' | null>(null);
  const { groupedWorkouts, loading } = useSkillsAcademyWorkouts(series.id);

  const getPositionIcon = () => {
    switch (series.position_focus) {
      case 'attack': return <Swords className="w-8 h-8 text-white" />;
      case 'midfield': return <Zap className="w-8 h-8 text-white" />;
      case 'defense': return <Shield className="w-8 h-8 text-white" />;
      default: return <Target className="w-8 h-8 text-white" />;
    }
  };

  const getColorClasses = () => {
    switch (series.series_type) {
      case 'attack': return 'bg-gradient-to-br from-red-500 to-red-600';
      case 'midfield': return 'bg-gradient-to-br from-green-500 to-green-600';
      case 'defense': return 'bg-gradient-to-br from-blue-500 to-blue-600';
      case 'solid_start': return 'bg-gradient-to-br from-purple-500 to-purple-600';
      default: return 'bg-gradient-to-br from-powlax-blue to-powlax-blue/90';
    }
  };

  const getDifficultyDisplay = () => {
    const level = series.difficulty_level || 1;
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-3 h-3 ${i < level ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} 
          />
        ))}
      </div>
    );
  };

  const handleWorkoutClick = (size: 'mini' | 'more' | 'complete') => {
    setSelectedWorkoutSize(size);
  };

  const handleStartFromModal = (workoutId: number) => {
    setSelectedWorkoutSize(null);
    onStartWorkout(workoutId);
  };

  const getWorkoutForSize = (size: 'mini' | 'more' | 'complete') => {
    if (!groupedWorkouts) return null;
    return groupedWorkouts[size];
  };

  const getCompletedCount = () => {
    if (!groupedWorkouts) return 0;
    const allWorkoutIds = [
      groupedWorkouts.mini?.id,
      groupedWorkouts.more?.id,
      groupedWorkouts.complete?.id
    ].filter(Boolean) as number[];
    
    return allWorkoutIds.filter(id => completedWorkouts.includes(id)).length;
  };

  const completedCount = getCompletedCount();

  return (
    <>
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0">
        {/* Compact header with gradient background */}
        <div className={`relative ${getColorClasses()} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getPositionIcon()}
              <div>
                <h3 className="text-white font-bold text-lg">
                  {series.series_name.replace(/^(Attack|Midfield|Defense|Solid Start)\s+/, '')}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-white/20 text-white text-xs backdrop-blur">
                    {series.series_type.toUpperCase()}
                  </Badge>
                  {getDifficultyDisplay()}
                </div>
              </div>
            </div>
            
            {/* Favorite button */}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(series.id);
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
              </button>
            )}
          </div>

          {/* Progress indicator */}
          {completedCount > 0 && (
            <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${(completedCount / 3) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="p-4 bg-white">
          {/* Workout size buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center py-3 hover:bg-gray-50 border-gray-200"
              onClick={() => handleWorkoutClick('mini')}
              disabled={loading || !groupedWorkouts?.mini}
            >
              <Play className="w-4 h-4 mb-1 text-gray-600" />
              <span className="text-xs font-medium">Mini</span>
              <span className="text-xs text-gray-500">5 drills</span>
              {completedWorkouts.includes(groupedWorkouts?.mini?.id || 0) && (
                <Badge className="mt-1 bg-green-100 text-green-700 text-xs">Done</Badge>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center py-3 hover:bg-gray-50 border-gray-200"
              onClick={() => handleWorkoutClick('more')}
              disabled={loading || !groupedWorkouts?.more}
            >
              <Dumbbell className="w-4 h-4 mb-1 text-gray-600" />
              <span className="text-xs font-medium">More</span>
              <span className="text-xs text-gray-500">10 drills</span>
              {completedWorkouts.includes(groupedWorkouts?.more?.id || 0) && (
                <Badge className="mt-1 bg-green-100 text-green-700 text-xs">Done</Badge>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center py-3 hover:bg-gray-50 border-gray-200"
              onClick={() => handleWorkoutClick('complete')}
              disabled={loading || !groupedWorkouts?.complete}
            >
              <Trophy className="w-4 h-4 mb-1 text-gray-600" />
              <span className="text-xs font-medium">Complete</span>
              <span className="text-xs text-gray-500">13+ drills</span>
              {completedWorkouts.includes(groupedWorkouts?.complete?.id || 0) && (
                <Badge className="mt-1 bg-green-100 text-green-700 text-xs">Done</Badge>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Workout Preview Modal */}
      {selectedWorkoutSize && groupedWorkouts && (
        <WorkoutPreviewModal
          isOpen={!!selectedWorkoutSize}
          onClose={() => setSelectedWorkoutSize(null)}
          workout={getWorkoutForSize(selectedWorkoutSize)}
          onStart={handleStartFromModal}
        />
      )}
    </>
  );
}
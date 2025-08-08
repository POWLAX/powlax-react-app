'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WallBallSeries } from '@/types/wall-ball';
import { Clock, Trophy, Users, ChevronRight } from 'lucide-react';

interface WallBallSeriesCardProps {
  series: WallBallSeries;
  onSelect: (series: WallBallSeries) => void;
}

export function WallBallSeriesCard({ series, onSelect }: WallBallSeriesCardProps) {
  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-blue-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-orange-500';
      case 5: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Intermediate';
      case 3: return 'Advanced';
      case 4: return 'Expert';
      case 5: return 'Elite';
      default: return 'All Levels';
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Thumbnail Section */}
      <div className="relative h-48 bg-gradient-to-br from-powlax-blue to-powlax-blue/80">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-80" />
            <h3 className="text-xl font-bold">{series.series_name}</h3>
          </div>
        </div>
        
        {/* Difficulty Badge */}
        {series.difficulty_level && (
          <Badge 
            className={`absolute top-2 right-2 ${getDifficultyColor(series.difficulty_level)} text-white`}
          >
            {getDifficultyLabel(series.difficulty_level)}
          </Badge>
        )}

        {/* Featured Badge */}
        {series.is_featured && (
          <Badge className="absolute top-2 left-2 bg-powlax-orange text-white">
            Featured
          </Badge>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Description */}
        {series.description && (
          <p className="text-sm text-gray-600 mb-3">
            {series.description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Available Durations */}
          {series.available_durations && series.available_durations.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{series.available_durations.join(', ')} min</span>
            </div>
          )}

          {/* Variant Count */}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{series.total_variants} workouts</span>
          </div>
        </div>

        {/* Coaching Options */}
        <div className="flex gap-2 mb-4">
          {series.has_coaching_version && (
            <Badge variant="outline" className="text-xs">
              With Coaching
            </Badge>
          )}
          {series.has_no_coaching_version && (
            <Badge variant="outline" className="text-xs">
              No Coaching
            </Badge>
          )}
        </div>

        {/* Action Button */}
        <Button 
          onClick={() => onSelect(series)}
          className="w-full bg-powlax-blue hover:bg-powlax-blue/90 text-white group"
        >
          <span>Select Workout</span>
          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
}
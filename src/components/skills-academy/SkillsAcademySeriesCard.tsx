'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkillsAcademySeries } from '@/types/skills-academy';
import { Target, Users, Trophy, ChevronRight, Clock } from 'lucide-react';

interface SkillsAcademySeriesCardProps {
  series: SkillsAcademySeries;
  onSelect: (series: SkillsAcademySeries) => void;
}

export function SkillsAcademySeriesCard({ series, onSelect }: SkillsAcademySeriesCardProps) {
  const getColorClasses = (colorScheme: string | null) => {
    switch (colorScheme) {
      case 'blue': return 'from-blue-600 to-blue-700';
      case 'red': return 'from-red-600 to-red-700';
      case 'green': return 'from-green-600 to-green-700';
      case 'orange': return 'from-orange-600 to-orange-700';
      default: return 'from-powlax-blue to-powlax-blue/90';
    }
  };

  const getPositionIcon = (position: string | null) => {
    switch (position) {
      case 'attack': return '⚔️';
      case 'midfield': return '🏃';
      case 'defense': return '🛡️';
      default: return '🥍';
    }
  };

  const getDifficultyStars = (level: number | null) => {
    const stars = level || 1;
    return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Header with gradient */}
      <div className={`relative h-32 bg-gradient-to-br ${getColorClasses(series.color_scheme)}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-4xl mb-2">
              {getPositionIcon(series.position_focus)}
            </div>
            <h3 className="text-lg font-bold">{series.series_code}</h3>
          </div>
        </div>
        
        {/* Featured badge */}
        {series.is_featured && (
          <Badge className="absolute top-2 right-2 bg-yellow-500 text-black">
            Featured
          </Badge>
        )}

        {/* Position badge */}
        <Badge className="absolute top-2 left-2 bg-white/20 text-white backdrop-blur">
          {series.position_focus?.toUpperCase() || 'ALL'}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-semibold text-lg mb-2 line-clamp-1">
          {series.series_name}
        </h4>
        
        {series.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {series.description}
          </p>
        )}

        {/* Stats */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Difficulty</span>
            <span className="font-mono text-xs">
              {getDifficultyStars(series.difficulty_level)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Workouts</span>
            <span className="font-medium">{series.total_workouts || 3}</span>
          </div>

          {series.total_drills > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total Drills</span>
              <span className="font-medium">{series.total_drills}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          <Badge variant="outline" className="text-xs">
            Mini (5 drills)
          </Badge>
          <Badge variant="outline" className="text-xs">
            More (10 drills)
          </Badge>
          <Badge variant="outline" className="text-xs">
            Complete (13-19)
          </Badge>
        </div>

        {/* Action button */}
        <Button 
          onClick={() => onSelect(series)}
          className={`w-full bg-gradient-to-r ${getColorClasses(series.color_scheme)} text-white hover:opacity-90 group`}
        >
          <span>Start Workout</span>
          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
}
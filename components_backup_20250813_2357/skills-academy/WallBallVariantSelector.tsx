'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GroupedVariants, WallBallVariant } from '@/types/wall-ball';
import { Clock, Volume2, VolumeX, Play } from 'lucide-react';

interface WallBallVariantSelectorProps {
  variants: GroupedVariants[];
  seriesName: string;
  onSelectVariant: (variant: WallBallVariant) => void;
  onBack: () => void;
}

export function WallBallVariantSelector({ 
  variants, 
  seriesName, 
  onSelectVariant,
  onBack 
}: WallBallVariantSelectorProps) {
  const [coachingPreference, setCoachingPreference] = useState<'with' | 'without'>('with');

  const getDurationLabel = (minutes: number) => {
    if (minutes === 5) return '5 Minutes - Quick';
    if (minutes === 10) return '10 Minutes - Standard';
    if (minutes === 15) return 'Complete - Full Workout';
    return `${minutes} Minutes`;
  };

  const getDurationDescription = (minutes: number) => {
    if (minutes === 5) return 'Perfect for warm-ups or when short on time';
    if (minutes === 10) return 'Ideal daily practice routine';
    if (minutes === 15) return 'Complete workout with all drill variations';
    return 'Custom duration workout';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-2"
          >
            ← Back to Series
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">{seriesName}</h2>
          <p className="text-gray-600 mt-1">Choose your workout duration and coaching preference</p>
        </div>
      </div>

      {/* Coaching Preference Tabs */}
      <Tabs value={coachingPreference} onValueChange={(v) => setCoachingPreference(v as 'with' | 'without')}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="with" className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            With Coaching
          </TabsTrigger>
          <TabsTrigger value="without" className="flex items-center gap-2">
            <VolumeX className="w-4 h-4" />
            No Coaching
          </TabsTrigger>
        </TabsList>

        <TabsContent value="with" className="mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            {variants.map((group) => {
              const variant = group.withCoaching;
              if (!variant) return null;

              return (
                <Card 
                  key={variant.id}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => onSelectVariant(variant)}
                >
                  <div className="p-6">
                    {/* Duration Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-powlax-blue text-white">
                        <Clock className="w-3 h-3 mr-1" />
                        {group.duration} min
                      </Badge>
                      <Volume2 className="w-5 h-5 text-gray-400" />
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-lg mb-2">
                      {getDurationLabel(group.duration)}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4">
                      {getDurationDescription(group.duration)}
                    </p>

                    {/* Play Button */}
                    <Button 
                      className="w-full bg-powlax-orange hover:bg-powlax-orange/90 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVariant(variant);
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Workout
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="without" className="mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            {variants.map((group) => {
              const variant = group.withoutCoaching;
              if (!variant) return null;

              return (
                <Card 
                  key={variant.id}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => onSelectVariant(variant)}
                >
                  <div className="p-6">
                    {/* Duration Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-gray-600 text-white">
                        <Clock className="w-3 h-3 mr-1" />
                        {group.duration} min
                      </Badge>
                      <VolumeX className="w-5 h-5 text-gray-400" />
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-lg mb-2">
                      {getDurationLabel(group.duration)}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4">
                      {getDurationDescription(group.duration)}
                      <span className="block mt-1 text-xs font-medium">No audio coaching</span>
                    </p>

                    {/* Play Button */}
                    <Button 
                      className="w-full bg-gray-700 hover:bg-gray-800 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVariant(variant);
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Workout
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="p-4">
          <h4 className="font-semibold text-blue-900 mb-2">About Coaching Options</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>With Coaching:</strong> Includes audio instruction and tips throughout the workout
            </p>
            <p>
              <strong>No Coaching:</strong> Same workout without audio - perfect for experienced players or when you want to focus
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
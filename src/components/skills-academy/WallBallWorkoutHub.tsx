'use client';

import { useState } from 'react';
import { WallBallSeriesCard } from './WallBallSeriesCard';
import { WallBallVariantSelector } from './WallBallVariantSelector';
import { WallBallVideoPlayer } from './WallBallVideoPlayer';
import { useWallBallSeries, useWallBallVariants } from '@/hooks/useWallBallWorkouts';
import { WallBallSeries, WallBallVariant } from '@/types/wall-ball';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WallBallWorkoutHubProps {
  userId?: string;
}

export function WallBallWorkoutHub({ userId }: WallBallWorkoutHubProps) {
  const [selectedSeries, setSelectedSeries] = useState<WallBallSeries | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<WallBallVariant | null>(null);
  
  const { series, loading: seriesLoading, error: seriesError } = useWallBallSeries();
  const { groupedVariants, loading: variantsLoading } = useWallBallVariants(selectedSeries?.id || null);

  // Handle series selection
  const handleSelectSeries = (series: WallBallSeries) => {
    setSelectedSeries(series);
    setSelectedVariant(null);
  };

  // Handle variant selection
  const handleSelectVariant = (variant: WallBallVariant) => {
    setSelectedVariant(variant);
  };

  // Handle back navigation
  const handleBack = () => {
    setSelectedSeries(null);
    setSelectedVariant(null);
  };

  // Handle video player close
  const handleClosePlayer = () => {
    setSelectedVariant(null);
  };

  // Loading state
  if (seriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-powlax-blue" />
          <p className="text-gray-600">Loading Wall Ball workouts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (seriesError) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertDescription className="text-red-800">
          Failed to load Wall Ball workouts. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // No workouts available
  if (!series || series.length === 0) {
    return (
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertDescription className="text-yellow-800">
          No Wall Ball workouts available at this time.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative">
      {/* Video Player Modal */}
      {selectedVariant && (
        <WallBallVideoPlayer
          variant={selectedVariant}
          onClose={handleClosePlayer}
          userId={userId}
        />
      )}

      {/* Main Content */}
      {!selectedSeries ? (
        // Series Selection View
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Wall Ball Workouts</h1>
            <p className="text-gray-600">
              Choose a workout series to improve your skills. Each series offers multiple duration options 
              with or without coaching.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {series.map((s) => (
              <WallBallSeriesCard
                key={s.id}
                series={s}
                onSelect={handleSelectSeries}
              />
            ))}
          </div>
        </div>
      ) : (
        // Variant Selection View
        <div>
          {variantsLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-powlax-blue" />
                <p className="text-gray-600">Loading workout options...</p>
              </div>
            </div>
          ) : (
            <WallBallVariantSelector
              variants={groupedVariants}
              seriesName={selectedSeries.series_name}
              onSelectVariant={handleSelectVariant}
              onBack={handleBack}
            />
          )}
        </div>
      )}
    </div>
  );
}
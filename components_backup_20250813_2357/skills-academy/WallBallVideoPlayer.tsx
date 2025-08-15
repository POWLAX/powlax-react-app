'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WallBallVariant } from '@/types/wall-ball';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize, 
  Volume2, 
  VolumeX,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';
import { markWorkoutComplete } from '@/hooks/useWallBallWorkouts';

interface WallBallVideoPlayerProps {
  variant: WallBallVariant;
  onClose: () => void;
  userId?: string;
}

export function WallBallVideoPlayer({ variant, onClose, userId }: WallBallVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Vimeo Player API would be initialized here
  // For now, we'll use the iframe embed

  const handleComplete = async () => {
    setIsCompleted(true);
    if (userId) {
      await markWorkoutComplete(variant.id, userId);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Build the Vimeo embed URL with parameters
  const vimeoEmbedUrl = variant.full_workout_vimeo_id 
    ? `https://player.vimeo.com/video/${variant.full_workout_vimeo_id}?` + 
      new URLSearchParams({
        autopause: '0',
        badge: '0',
        player_id: '0',
        app_id: '58479',
        title: '0',
        byline: '0',
        portrait: '0',
        color: 'FF6600', // POWLAX orange
      }).toString()
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div 
        ref={containerRef}
        className="relative w-full max-w-6xl bg-white rounded-lg overflow-hidden"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
          <div className="flex items-start justify-between">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-1">{variant.variant_name}</h2>
              <div className="flex items-center gap-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  <Clock className="w-3 h-3 mr-1" />
                  {variant.duration_minutes} minutes
                </Badge>
                {variant.has_coaching ? (
                  <Badge className="bg-powlax-orange/80 text-white">
                    <Volume2 className="w-3 h-3 mr-1" />
                    With Coaching
                  </Badge>
                ) : (
                  <Badge className="bg-gray-600/80 text-white">
                    <VolumeX className="w-3 h-3 mr-1" />
                    No Coaching
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative bg-black aspect-video">
          {vimeoEmbedUrl ? (
            <iframe
              ref={iframeRef}
              src={vimeoEmbedUrl}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={variant.variant_name}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              <p>Video URL not available</p>
            </div>
          )}
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>

            {isCompleted && (
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="w-4 h-4 mr-1" />
                Workout Complete!
              </Badge>
            )}
          </div>
        </div>

        {/* Workout Info Panel */}
        <div className="p-6 bg-gray-50">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Workout Details */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Workout Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Series:</span>
                  <span className="font-medium">{variant.series?.series_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{variant.duration_minutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-medium">Level {variant.series?.difficulty_level || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Times Completed:</span>
                  <span className="font-medium">{variant.times_completed}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Actions</h3>
              <div className="space-y-2">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleComplete}
                  disabled={isCompleted}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Complete
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // Restart video logic would go here
                    setProgress(0);
                    setCurrentTime(0);
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restart Workout
                </Button>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          {variant.has_coaching && (
            <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Coaching Tips</h4>
              <p className="text-sm text-blue-800">
                This workout includes audio coaching throughout. The coach will guide you through each drill,
                provide technique tips, and help you maintain proper form and intensity.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WorkoutSession, DrillWithProgress } from '@/types/skills-academy';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Check, 
  X, 
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  RotateCw,
  Trophy
} from 'lucide-react';
import { completeDrill, completeWorkout } from '@/hooks/useSkillsAcademyWorkouts';

interface DrillSequencePlayerProps {
  session: WorkoutSession;
  userId?: string;
  onClose: () => void;
  onComplete?: () => void;
}

export function DrillSequencePlayer({ 
  session, 
  userId,
  onClose, 
  onComplete 
}: DrillSequencePlayerProps) {
  const [currentDrillIndex, setCurrentDrillIndex] = useState(session.currentDrillIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [drillTimer, setDrillTimer] = useState(0);
  const [completedDrills, setCompletedDrills] = useState<Set<number>>(new Set());

  const currentDrill = session.drills[currentDrillIndex];
  const progressPercentage = ((currentDrillIndex + 1) / session.drills.length) * 100;
  const isLastDrill = currentDrillIndex === session.drills.length - 1;

  // Timer for current drill
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setDrillTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteDrill = async () => {
    setCompletedDrills(prev => new Set([...prev, currentDrillIndex]));
    setIsPlaying(false);
    
    // Update progress in database
    if (session.progress && userId) {
      await completeDrill(
        session.progress.id,
        currentDrillIndex,
        session.drills.length,
        10 // points
      );
    }

    // Move to next drill or complete workout
    if (isLastDrill) {
      handleCompleteWorkout();
    } else {
      handleNextDrill();
    }
  };

  const handleNextDrill = () => {
    if (currentDrillIndex < session.drills.length - 1) {
      setCurrentDrillIndex(prev => prev + 1);
      setDrillTimer(0);
      setIsPlaying(false);
    }
  };

  const handlePreviousDrill = () => {
    if (currentDrillIndex > 0) {
      setCurrentDrillIndex(prev => prev - 1);
      setDrillTimer(0);
      setIsPlaying(false);
    }
  };

  const handleCompleteWorkout = async () => {
    if (session.progress && userId) {
      await completeWorkout(session.progress.id, session.workout.id);
    }
    onComplete?.();
  };

  // Get video URL for current drill
  const getVideoUrl = () => {
    if (!currentDrill?.drill) return null;
    
    const drill = currentDrill.drill;
    const videoType = currentDrill.video_type || 'both_hands';
    
    switch (videoType) {
      case 'strong_hand':
        return drill.strong_hand_video_url;
      case 'off_hand':
        return drill.off_hand_video_url;
      case 'both_hands':
      default:
        return drill.both_hands_video_url || drill.strong_hand_video_url || drill.off_hand_video_url;
    }
  };

  const videoUrl = getVideoUrl();
  
  // Extract Vimeo ID from URL if present
  const getVimeoId = (url: string | null) => {
    if (!url) return null;
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  const vimeoId = getVimeoId(videoUrl);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </Button>
              
              <div>
                <h2 className="text-xl font-bold text-white">
                  {session.workout.workout_name}
                </h2>
                <p className="text-sm text-gray-400">
                  Drill {currentDrillIndex + 1} of {session.drills.length}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-4">
              <div className="w-64">
                <Progress value={progressPercentage} className="h-2" />
              </div>
              <Badge className="bg-green-600 text-white">
                {completedDrills.size} / {session.drills.length} Complete
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 container mx-auto px-4 py-8 overflow-auto">
        <div className="grid lg:grid-cols-3 gap-8 h-full">
          {/* Video player section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                {vimeoId ? (
                  <iframe
                    src={`https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0&player_id=0&app_id=58479`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={currentDrill?.drill?.drill_name || 'Drill Video'}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Target className="w-16 h-16 mx-auto mb-4" />
                      <p>No video available for this drill</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Drill info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {currentDrill?.drill?.drill_name || `Drill ${currentDrillIndex + 1}`}
                    </h3>
                    {currentDrill?.drill?.description && (
                      <p className="text-gray-400">
                        {currentDrill.drill.description}
                      </p>
                    )}
                  </div>
                  
                  <Badge className="bg-blue-600 text-white">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTime(drillTimer)}
                  </Badge>
                </div>

                {/* Drill details */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Duration</p>
                    <p className="text-lg font-bold text-white">
                      {currentDrill?.drill_duration_seconds || 60}s
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Repetitions</p>
                    <p className="text-lg font-bold text-white">
                      {currentDrill?.repetitions || 10}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Rest</p>
                    <p className="text-lg font-bold text-white">
                      {currentDrill?.rest_duration_seconds || 10}s
                    </p>
                  </div>
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousDrill}
                    disabled={currentDrillIndex === 0}
                    className="text-white border-gray-700 hover:bg-gray-800"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  <Button
                    size="lg"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-powlax-orange hover:bg-powlax-orange/90 text-white px-8"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause Drill
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Start Drill
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextDrill}
                    disabled={isLastDrill}
                    className="text-white border-gray-700 hover:bg-gray-800"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Complete button */}
                <div className="mt-6">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleCompleteDrill}
                    disabled={completedDrills.has(currentDrillIndex)}
                  >
                    {completedDrills.has(currentDrillIndex) ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Drill Completed
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Mark as Complete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Drill list sidebar */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Workout Drills</h3>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {session.drills.map((drill, index) => (
                <Card
                  key={drill.id}
                  className={`p-3 cursor-pointer transition-all ${
                    index === currentDrillIndex 
                      ? 'bg-blue-900 border-blue-700' 
                      : 'bg-gray-900 border-gray-800 hover:bg-gray-800'
                  }`}
                  onClick={() => {
                    setCurrentDrillIndex(index);
                    setDrillTimer(0);
                    setIsPlaying(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      completedDrills.has(index)
                        ? 'bg-green-600 text-white'
                        : index === currentDrillIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {completedDrills.has(index) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        index === currentDrillIndex ? 'text-white' : 'text-gray-300'
                      }`}>
                        {drill.drill?.drill_name || `Drill ${index + 1}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {drill.drill_duration_seconds}s • {drill.repetitions} reps
                      </p>
                    </div>

                    {index === currentDrillIndex && (
                      <Badge className="bg-blue-600 text-white text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Workout complete button */}
            {completedDrills.size === session.drills.length && (
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white"
                onClick={handleCompleteWorkout}
              >
                <Trophy className="w-5 h-5 mr-2" />
                Complete Workout
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
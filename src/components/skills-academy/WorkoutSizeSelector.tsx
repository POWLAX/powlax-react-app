'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GroupedWorkouts, SkillsAcademyWorkoutNew } from '@/types/skills-academy';
import { Clock, PlayCircle, Target, ArrowLeft, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface WorkoutSizeSelectorProps {
  seriesName: string;
  seriesCode: string;
  workouts: GroupedWorkouts;
  onSelectWorkout: (workout: SkillsAcademyWorkoutNew) => void;
  onBack: () => void;
}

export function WorkoutSizeSelector({ 
  seriesName, 
  seriesCode,
  workouts, 
  onSelectWorkout,
  onBack 
}: WorkoutSizeSelectorProps) {
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  
  const toggleExpanded = (size: string) => {
    setExpandedWorkouts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(size)) {
        newSet.delete(size);
      } else {
        newSet.add(size);
      }
      return newSet;
    });
  };
  
  const workoutOptions = [
    {
      size: 'mini' as const,
      workout: workouts.mini,
      title: 'Mini Workout',
      description: 'Quick 5-drill session perfect for warm-ups or when short on time',
      icon: '⚡',
      color: 'from-blue-500 to-blue-600',
      duration: '15 minutes',
      drillCount: 5
    },
    {
      size: 'more' as const,
      workout: workouts.more,
      title: 'More Workout',
      description: 'Standard 10-drill workout for comprehensive skill development',
      icon: '🎯',
      color: 'from-green-500 to-green-600',
      duration: '30 minutes',
      drillCount: 10
    },
    {
      size: 'complete' as const,
      workout: workouts.complete,
      title: 'Complete Workout',
      description: 'Full workout with 13-19 drills for maximum skill improvement',
      icon: '🏆',
      color: 'from-purple-500 to-purple-600',
      duration: '45+ minutes',
      drillCount: workouts.complete?.drill_count || 15
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onBack} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="p-6 space-y-6" data-testid="size-selector-modal">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Series
        </Button>
        
        <div className="flex items-center gap-3 mb-2">
          <Badge className="text-lg px-3 py-1">{seriesCode}</Badge>
          <h2 className="text-2xl font-bold text-gray-900">{seriesName}</h2>
        </div>
        <p className="text-gray-600">Choose your workout intensity</p>
      </div>

      {/* Workout size cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {workoutOptions.map((option) => {
          const isAvailable = !!option.workout;
          const isExpanded = expandedWorkouts.has(option.size);
          
          return (
            <Card 
              key={option.size}
              className={`relative overflow-hidden transition-all duration-200 ${
                isAvailable 
                  ? 'hover:shadow-lg' 
                  : 'opacity-50'
              }`}
            >
              {/* Gradient header */}
              <div className={`h-24 bg-gradient-to-br ${option.color} flex items-center justify-center`}>
                <span className="text-4xl">{option.icon}</span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900">{option.title}</h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  {option.description}
                </p>

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Target className="w-4 h-4" />
                      Drills
                    </span>
                    <span className="font-bold">{option.drillCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      Duration
                    </span>
                    <span className="font-bold">{option.duration}</span>
                  </div>
                </div>

                {/* Drill Preview Dropdown */}
                {isAvailable && option.workout && (
                  <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(option.size)}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mb-3"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Activity className="w-4 h-4 mr-2" />
                        View Drills ({option.workout.drills?.length || option.workout.drill_count || option.drillCount})
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 ml-auto" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-auto" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mb-3">
                      <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-2 bg-gray-50">
                        {/* Show real drills if available, otherwise generate mock drills based on drill_count */}
                        {option.workout.drills && option.workout.drills.length > 0 ? (
                          option.workout.drills.map((workoutDrill, index) => {
                            const drillName = workoutDrill.drill?.drill_name || 
                                            workoutDrill.drill?.name || 
                                            workoutDrill.drill_name || 
                                            `Drill ${index + 1}`;
                            return (
                              <div key={workoutDrill.id} className="flex items-start gap-2 text-xs py-1">
                                <span className="font-semibold text-gray-700 min-w-[20px]">
                                  {index + 1}.
                                </span>
                                <span className="text-gray-700 flex-1">
                                  {drillName}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          // Generate mock drill names based on drill_count and workout type
                          Array.from({ length: option.workout.drill_count || option.drillCount }, (_, index) => {
                            const mockDrillNames = {
                              mini: ['Wall Ball - Right Hand', 'Wall Ball - Left Hand', 'Quick Stick', 'Ground Balls', 'Cradling Practice'],
                              more: ['Wall Ball - Right Hand', 'Wall Ball - Left Hand', 'Quick Stick', 'Ground Balls', 'Cradling Practice', 'Split Dodge', 'Face Dodge', 'Roll Dodge', 'Shooting - High to Low', 'Shooting - Low to High'],
                              complete: ['Wall Ball - Right Hand', 'Wall Ball - Left Hand', 'Quick Stick', 'Ground Balls', 'Cradling Practice', 'Split Dodge', 'Face Dodge', 'Roll Dodge', 'Shooting - High to Low', 'Shooting - Low to High', 'Behind the Back', 'One-Handed Cradling', 'Pick-up Drills', 'Passing Accuracy', 'Advanced Stick Skills']
                            };
                            const drillSet = mockDrillNames[option.size] || mockDrillNames.mini;
                            const drillName = drillSet[index] || `${option.workout.workout_name} Drill ${index + 1}`;
                            
                            return (
                              <div key={index} className="flex items-start gap-2 text-xs py-1">
                                <span className="font-semibold text-gray-700 min-w-[20px]">
                                  {index + 1}.
                                </span>
                                <span className="text-gray-700 flex-1">
                                  {drillName}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Action button */}
                <Button 
                  className={`w-full bg-gradient-to-r ${option.color} text-white hover:opacity-90`}
                  disabled={!isAvailable}
                  onClick={() => isAvailable && option.workout && onSelectWorkout(option.workout)}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {isAvailable ? 'Start Workout' : 'Not Available'}
                </Button>

                {!isAvailable && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    This workout size is not available for this series
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info box */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="p-4">
          <h4 className="font-semibold text-blue-900 mb-2">How to Choose</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• <strong>Mini:</strong> Great for beginners or warm-ups before games</li>
            <li>• <strong>More:</strong> Ideal for regular practice sessions</li>
            <li>• <strong>Complete:</strong> Best for dedicated training days</li>
          </ul>
        </div>
      </Card>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, Clock, Target, Users, AlertCircle, 
  ChevronRight, Dumbbell, Cone, User2 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface WorkoutPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: any;
  onStart: (workoutId: number) => void;
}

interface DrillWithEquipment {
  id: number;
  drill_name: string;
  drill_duration_seconds: number;
  repetitions: number;
  equipment_needed?: string[];
  requires_partner?: boolean;
  requires_cones?: boolean;
  requires_ladder?: boolean;
  requires_bounce_back?: boolean;
}

export function WorkoutPreviewModal({ 
  isOpen, 
  onClose, 
  workout,
  onStart 
}: WorkoutPreviewModalProps) {
  const [drills, setDrills] = useState<DrillWithEquipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workout?.id) {
      fetchWorkoutDrills();
    }
  }, [workout?.id]);

  const fetchWorkoutDrills = async () => {
    if (!workout?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('skills_academy_workout_drills')
        .select(`
          *,
          drill:skills_academy_drill_library(
            id,
            drill_name,
            equipment_needed,
            requires_partner,
            requires_cones,
            requires_ladder,
            requires_bounce_back
          )
        `)
        .eq('workout_id', workout.id)
        .order('sequence_order');

      if (data) {
        const formattedDrills = data.map(item => ({
          id: item.drill?.id || item.drill_id,
          drill_name: item.drill?.drill_name || `Drill ${item.sequence_order}`,
          drill_duration_seconds: item.drill_duration_seconds || 60,
          repetitions: item.repetitions || 10,
          equipment_needed: item.drill?.equipment_needed || [],
          requires_partner: item.drill?.requires_partner || false,
          requires_cones: item.drill?.requires_cones || false,
          requires_ladder: item.drill?.requires_ladder || false,
          requires_bounce_back: item.drill?.requires_bounce_back || false,
        }));
        setDrills(formattedDrills);
      }
    } catch (error) {
      console.error('Error fetching drills:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRequiredEquipment = () => {
    const equipment = new Set<string>();
    
    drills.forEach(drill => {
      if (drill.requires_partner) equipment.add('Partner');
      if (drill.requires_cones) equipment.add('Cones');
      if (drill.requires_ladder) equipment.add('Agility Ladder');
      if (drill.requires_bounce_back) equipment.add('Bounce Back');
      if (drill.equipment_needed?.length) {
        drill.equipment_needed.forEach(item => equipment.add(item));
      }
    });
    
    return Array.from(equipment);
  };

  const getTotalDuration = () => {
    const totalSeconds = drills.reduce((acc, drill) => acc + (drill.drill_duration_seconds || 60), 0);
    return Math.ceil(totalSeconds / 60);
  };

  if (!workout) return null;

  const requiredEquipment = getRequiredEquipment();
  const totalDuration = getTotalDuration();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            {workout.workout_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Workout Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4 text-gray-500" />
              <span>{drills.length} drills</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>~{totalDuration} minutes</span>
            </div>
            <Badge variant="outline">{workout.workout_size}</Badge>
          </div>

          {/* Required Equipment */}
          {requiredEquipment.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Equipment Needed:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {requiredEquipment.map(item => (
                      <Badge key={item} variant="secondary" className="text-xs">
                        {item === 'Partner' && <User2 className="w-3 h-3 mr-1" />}
                        {item === 'Cones' && <Cone className="w-3 h-3 mr-1" />}
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Drill List */}
          <div>
            <h3 className="font-semibold mb-2">Workout Drills:</h3>
            <ScrollArea className="h-[300px] border rounded-lg">
              <div className="p-4 space-y-3">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading drills...
                  </div>
                ) : (
                  drills.map((drill, index) => (
                    <div 
                      key={drill.id} 
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-powlax-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{drill.drill_name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                          <span>{drill.drill_duration_seconds}s</span>
                          <span>•</span>
                          <span>{drill.repetitions} reps</span>
                          {drill.requires_partner && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">Partner</Badge>
                            </>
                          )}
                          {drill.requires_cones && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">Cones</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={() => onStart(workout.id)}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Workout
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
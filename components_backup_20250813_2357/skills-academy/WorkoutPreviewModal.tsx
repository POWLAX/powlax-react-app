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
  
  // Also trigger on isOpen to ensure drills are fetched when modal opens
  useEffect(() => {
    if (isOpen && workout?.id && drills.length === 0) {
      console.log('Modal opened, fetching drills immediately');
      fetchWorkoutDrills();
    }
  }, [isOpen]);

  useEffect(() => {
    if (workout?.id) {
      console.log('WorkoutPreviewModal: Fetching drills for workout', workout.id, workout.workout_name);
      fetchWorkoutDrills();
    } else if (workout) {
      console.log('WorkoutPreviewModal: Workout exists but no ID', workout);
    }
  }, [workout?.id, workout?.workout_name]);

  const fetchWorkoutDrills = async () => {
    if (!workout?.id) return;
    
    setLoading(true);
    try {
      // WORKAROUND: Junction table is empty, so we'll programmatically assign drills
      // Get drills from the skills_academy_drills table and assign them to this workout
      const drillCount = workout.drill_count || 5;
      
      const { data: allDrills, error } = await supabase
        .from('skills_academy_drills')
        .select('*')
        .limit(drillCount * 3); // Get more drills than needed for variety

      if (error) {
        console.error('Error fetching drills:', error);
        setDrills([]);
        return;
      }

      if (!allDrills || allDrills.length === 0) {
        console.warn('No drills found in database');
        setDrills([]);
        return;
      }

      // Assign drills based on workout ID to ensure consistency
      const startIndex = (workout.id - 1) * drillCount % allDrills.length;
      const assignedDrills = [];
      
      for (let i = 0; i < drillCount; i++) {
        const drillIndex = (startIndex + i) % allDrills.length;
        const drill = allDrills[drillIndex];
        
        assignedDrills.push({
          id: drill.id,
          drill_name: drill.title || 'Unnamed Drill',
          drill_duration_seconds: (drill.duration_minutes || 3) * 60,
          repetitions: 1,
          equipment_needed: Array.isArray(drill.equipment_needed) ? drill.equipment_needed : [],
          requires_partner: Array.isArray(drill.equipment_needed) && drill.equipment_needed.includes('partner'),
          requires_cones: Array.isArray(drill.equipment_needed) && drill.equipment_needed.includes('cones'),
          requires_ladder: Array.isArray(drill.equipment_needed) && drill.equipment_needed.includes('ladder'),
          requires_bounce_back: Array.isArray(drill.equipment_needed) && drill.equipment_needed.includes('bounce-back')
        });
      }

      setDrills(assignedDrills);
      console.log(`✅ Assigned ${assignedDrills.length} drills to workout "${workout.workout_name}"`);
      console.log('Drill names:', assignedDrills.map(d => d.drill_name));
    } catch (error) {
      console.error('Error fetching drills:', error);
      setDrills([]);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden bg-white text-gray-900 border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <Dumbbell className="w-5 h-5" />
            {workout.workout_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Workout Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 font-medium">{drills.length} drills</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 font-medium">~{totalDuration} minutes</span>
            </div>
            <Badge variant="outline" className="border-gray-300 text-gray-700">{workout.workout_size}</Badge>
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
            <h3 className="font-semibold mb-2 text-gray-900">Workout Drills:</h3>
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
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-powlax-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{drill.drill_name}</p>
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
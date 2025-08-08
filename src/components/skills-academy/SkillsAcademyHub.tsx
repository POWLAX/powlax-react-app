'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { SkillsAcademySeriesCard } from './SkillsAcademySeriesCard';
import { WorkoutSizeSelector } from './WorkoutSizeSelector';
import { DrillSequencePlayer } from './DrillSequencePlayer';
import { 
  useSkillsAcademySeries, 
  useSkillsAcademySeriesByType,
  useSkillsAcademyWorkouts,
  useWorkoutSession,
  startWorkoutSession
} from '@/hooks/useSkillsAcademyWorkouts';
import { 
  SkillsAcademySeries, 
  SkillsAcademyWorkoutNew,
  WorkoutSession 
} from '@/types/skills-academy';

interface SkillsAcademyHubProps {
  userId?: string;
}

export function SkillsAcademyHub({ userId }: SkillsAcademyHubProps) {
  const router = useRouter();
  const [selectedSeries, setSelectedSeries] = useState<SkillsAcademySeries | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<SkillsAcademyWorkoutNew | null>(null);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'solid_start' | 'attack' | 'midfield' | 'defense'>('all');

  // Fetch all series or by type
  const { series: allSeries, loading: allLoading, error: allError } = useSkillsAcademySeries();
  const { series: solidStartSeries, loading: ssLoading } = useSkillsAcademySeriesByType('solid_start');
  const { series: attackSeries, loading: aLoading } = useSkillsAcademySeriesByType('attack');
  const { series: midfieldSeries, loading: mLoading } = useSkillsAcademySeriesByType('midfield');
  const { series: defenseSeries, loading: dLoading } = useSkillsAcademySeriesByType('defense');

  // Fetch workouts for selected series
  const { groupedWorkouts, loading: workoutsLoading } = useSkillsAcademyWorkouts(selectedSeries?.id || null);

  // Fetch workout session
  const { session, loading: sessionLoading } = useWorkoutSession(selectedWorkout?.id || null, userId);

  // Handle series selection
  const handleSelectSeries = (series: SkillsAcademySeries) => {
    setSelectedSeries(series);
    setSelectedWorkout(null);
    setActiveSession(null);
  };

  // Handle workout selection
  const handleSelectWorkout = async (workout: SkillsAcademyWorkoutNew) => {
    // Navigate directly to the workout runner page
    router.push(`/skills-academy/workout/${workout.id}`);
  };

  // Handle starting the drill player
  const handleStartDrillPlayer = () => {
    if (session) {
      setActiveSession(session);
    }
  };

  // Handle workout completion
  const handleWorkoutComplete = () => {
    setActiveSession(null);
    setSelectedWorkout(null);
    setSelectedSeries(null);
    // Could show a completion modal here
    alert('Congratulations! You completed the workout! 🎉');
  };

  // Handle closing drill player
  const handleCloseDrillPlayer = () => {
    setActiveSession(null);
  };

  // Loading state
  if (allLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-powlax-blue" />
          <p className="text-gray-600">Loading Skills Academy workouts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (allError) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertDescription className="text-red-800">
          Failed to load Skills Academy workouts. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Show drill player if session is active
  if (activeSession) {
    return (
      <DrillSequencePlayer
        session={activeSession}
        userId={userId}
        onClose={handleCloseDrillPlayer}
        onComplete={handleWorkoutComplete}
      />
    );
  }

  // Show workout selector if series is selected
  if (selectedSeries && !selectedWorkout) {
    return (
      <WorkoutSizeSelector
        seriesName={selectedSeries.series_name}
        seriesCode={selectedSeries.series_code || ''}
        workouts={groupedWorkouts}
        onSelectWorkout={handleSelectWorkout}
        onBack={() => setSelectedSeries(null)}
      />
    );
  }

  // Show session start screen if workout is selected
  if (selectedWorkout && session) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-gray-600 mb-2">{selectedWorkout.workout_name}</p>
          <p className="text-sm text-gray-500 mb-6">
            {session.drills.length} drills • {selectedWorkout.estimated_duration_minutes} minutes
          </p>
          
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full bg-powlax-orange hover:bg-powlax-orange/90"
              onClick={handleStartDrillPlayer}
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Start Workout
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSelectedWorkout(null)}
            >
              Choose Different Size
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Main series selection view
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Skills Academy</h1>
        <p className="text-gray-600">
          Progressive lacrosse training workouts designed to improve your skills
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="solid_start">Solid Start</TabsTrigger>
          <TabsTrigger value="attack">Attack</TabsTrigger>
          <TabsTrigger value="midfield">Midfield</TabsTrigger>
          <TabsTrigger value="defense">Defense</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allSeries.map((series) => (
              <SkillsAcademySeriesCard
                key={series.id}
                series={series}
                onSelect={handleSelectSeries}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="solid_start" className="mt-6">
          {ssLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {solidStartSeries.map((series) => (
                <SkillsAcademySeriesCard
                  key={series.id}
                  series={series}
                  onSelect={handleSelectSeries}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="attack" className="mt-6">
          {aLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {attackSeries.map((series) => (
                <SkillsAcademySeriesCard
                  key={series.id}
                  series={series}
                  onSelect={handleSelectSeries}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="midfield" className="mt-6">
          {mLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {midfieldSeries.map((series) => (
                <SkillsAcademySeriesCard
                  key={series.id}
                  series={series}
                  onSelect={handleSelectSeries}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="defense" className="mt-6">
          {dLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {defenseSeries.map((series) => (
                <SkillsAcademySeriesCard
                  key={series.id}
                  series={series}
                  onSelect={handleSelectSeries}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Missing imports
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Trophy } from 'lucide-react';
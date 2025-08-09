'use client';

import { useEffect, useState } from 'react';
// Removed framer-motion - using CSS animations instead
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, Star, Zap, Award, Home, 
  RotateCw, TrendingUp, Target, Clock 
} from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

interface WorkoutCompletionAnimationProps {
  workoutName: string;
  totalPoints: number;
  bonusMultiplier: number;
  drillsCompleted: number;
  totalDrills: number;
  timeSpent: number;
  onRepeat: () => void;
  earnedBadge?: boolean;
}

export function WorkoutCompletionAnimation({
  workoutName,
  totalPoints,
  bonusMultiplier,
  drillsCompleted,
  totalDrills,
  timeSpent,
  onRepeat,
  earnedBadge = false
}: WorkoutCompletionAnimationProps) {
  const [showPoints, setShowPoints] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [animatedPoints, setAnimatedPoints] = useState(0);
  
  const finalPoints = totalPoints * bonusMultiplier;

  useEffect(() => {
    // Trigger confetti
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    // Animate points counting up
    setTimeout(() => {
      setShowPoints(true);
      let current = 0;
      const increment = finalPoints / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= finalPoints) {
          setAnimatedPoints(finalPoints);
          clearInterval(timer);
          if (earnedBadge) {
            setTimeout(() => setShowBadge(true), 500);
          }
        } else {
          setAnimatedPoints(Math.floor(current));
        }
      }, 30);
    }, 500);

    return () => clearInterval(interval);
  }, [finalPoints, earnedBadge]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        
        {/* Main Trophy Animation */}
        <div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.8 
          }}
          className="text-center"
        >
          <div className="relative inline-block">
            <div
              animate={{ 
                rotate: [0, 5, -5, 5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-2xl"
            >
              <Trophy className="w-16 h-16 text-white" />
            </div>
            
            {/* Sparkle effects */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  x: [0, (i % 2 ? 1 : -1) * 60 * Math.cos(i * 60 * Math.PI / 180)],
                  y: [0, 60 * Math.sin(i * 60 * Math.PI / 180)],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        </div>

        {/* Congratulations Text */}
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Workout Complete!
          </h1>
          <p className="text-lg text-gray-600 mt-2">{workoutName}</p>
        </div>

        {/* Points Animation */}
        <>
          {showPoints && (
            <div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-2 border-green-400">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="w-8 h-8 text-yellow-500" />
                    <div
                      className="text-5xl font-bold text-green-600"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      {animatedPoints}
                    </div>
                    <span className="text-2xl font-bold text-gray-600">pts</span>
                  </div>
                  
                  {bonusMultiplier > 1 && (
                    <div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2"
                    >
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1">
                        {bonusMultiplier}x Bonus - Full Completion!
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </>

        {/* Badge Earned Animation */}
        <>
          {showBadge && (
            <div
              initial={{ scale: 0, rotate: -360 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-2 border-purple-400">
                <div className="flex items-center justify-center gap-4">
                  <div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1, repeat: Infinity }
                    }}
                  >
                    <Award className="w-12 h-12 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">New Badge Earned!</h3>
                    <p className="text-sm text-gray-600">Workout Warrior</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </>

        {/* Stats Grid */}
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center bg-blue-50 border-blue-200">
              <Target className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-700">{drillsCompleted}</div>
              <div className="text-xs text-gray-600">Drills Done</div>
            </Card>
            
            <Card className="p-4 text-center bg-purple-50 border-purple-200">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-700">
                {Math.round((drillsCompleted / totalDrills) * 100)}%
              </div>
              <div className="text-xs text-gray-600">Completion</div>
            </Card>
            
            <Card className="p-4 text-center bg-orange-50 border-orange-200">
              <Clock className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-700">
                {Math.floor(timeSpent / 60)}
              </div>
              <div className="text-xs text-gray-600">Minutes</div>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex gap-3"
        >
          <Button
            variant="outline"
            onClick={onRepeat}
            className="flex-1"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Do Again
          </Button>
          <Button
            asChild
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Link href="/skills-academy">
              <Home className="w-4 h-4 mr-2" />
              Back to Academy
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
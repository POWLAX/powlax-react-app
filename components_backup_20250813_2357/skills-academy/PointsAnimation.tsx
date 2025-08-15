'use client';

import { useEffect, useState } from 'react';
// Removed framer-motion - using CSS animations instead

interface PointsAnimationProps {
  points: number;
  multiplier?: number;
  onComplete?: () => void;
}

export function PointsAnimation({ points, multiplier = 1, onComplete }: PointsAnimationProps) {
  const [displayPoints, setDisplayPoints] = useState(0);
  const [showMultiplier, setShowMultiplier] = useState(false);
  const finalPoints = points * multiplier;

  useEffect(() => {
    // Animate points counting up
    const duration = 1500; // 1.5 seconds
    const steps = 30;
    const increment = finalPoints / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= finalPoints) {
        setDisplayPoints(finalPoints);
        clearInterval(timer);
        if (multiplier > 1) {
          setShowMultiplier(true);
        }
        onComplete?.();
      } else {
        setDisplayPoints(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [finalPoints, multiplier, onComplete]);

  return (
    <div className="relative">
      <div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="text-center"
      >
        <div className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-600">
          {displayPoints}
        </div>
        
        <>
          {showMultiplier && multiplier > 1 && (
            <div
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mt-2"
            >
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold">
                <span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  ⭐
                </span>
                <span className="ml-2">{multiplier}x Bonus!</span>
              </span>
            </div>
          )}
        </>
      </div>
    </div>
  );
}

interface PointTypeAnimationProps {
  pointsBreakdown: {
    lax_credits: number;
    attack_tokens: number;
    defense_dollars: number;
    midfield_medals: number;
    rebound_rewards: number;
    flex_points: number;
  };
}

export function PointTypeAnimation({ pointsBreakdown }: PointTypeAnimationProps) {
  const [visibleTypes, setVisibleTypes] = useState<string[]>([]);
  
  const types = [
    { key: 'lax_credits', label: 'Lax Credits', color: 'blue', icon: '💎' },
    { key: 'attack_tokens', label: 'Attack Tokens', color: 'red', icon: '⚔️' },
    { key: 'defense_dollars', label: 'Defense Dollars', color: 'green', icon: '🛡️' },
    { key: 'midfield_medals', label: 'Midfield Medals', color: 'purple', icon: '🏅' },
    { key: 'rebound_rewards', label: 'Rebound Rewards', color: 'orange', icon: '🎯' },
    { key: 'flex_points', label: 'Flex Points', color: 'gray', icon: '💪' }
  ];

  useEffect(() => {
    // Stagger the appearance of each point type
    types.forEach((type, index) => {
      setTimeout(() => {
        setVisibleTypes(prev => [...prev, type.key]);
      }, 100 * index);
    });
  }, []);

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      gray: 'bg-gray-50 text-gray-600 border-gray-200'
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-4">
      {types.map((type) => {
        const value = pointsBreakdown[type.key as keyof typeof pointsBreakdown];
        const isVisible = visibleTypes.includes(type.key);
        
        return (
          <div
            key={type.key}
            initial={{ scale: 0, opacity: 0 }}
            animate={isVisible ? { scale: 1, opacity: 1 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`text-center p-3 rounded-lg border ${getColorClasses(type.color)}`}
          >
            <div
              animate={isVisible ? { y: [0, -5, 0] } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-2xl mb-1"
            >
              {type.icon}
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs">{type.label}</div>
          </div>
        );
      })}
    </div>
  );
}
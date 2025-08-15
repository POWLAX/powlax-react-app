'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  seriesType: string;
}

interface TrackCardsProps {
  onTrackClick?: (track: Track) => void;
}

const tracks: Track[] = [
  {
    id: 'solid_start',
    title: 'Solid Start Training',
    description: 'Develop essential skills fast!',
    icon: '⚔️',
    color: 'bg-gray-500',
    seriesType: 'solid_start'
  },
  {
    id: 'attack',
    title: 'Attack Training',
    description: 'Master every attack skill in 12 workouts!',
    icon: '⚔️',
    color: 'bg-green-500',
    seriesType: 'attack'
  },
  {
    id: 'midfield',
    title: 'Midfield Training', 
    description: 'Dominate both ends of the field with complete skills',
    icon: '🎯',
    color: 'bg-blue-500',
    seriesType: 'midfield'
  },
  {
    id: 'defense',
    title: 'Defense Training',
    description: 'Shutdown defensive techniques and positioning',
    icon: '🛡️',
    color: 'bg-red-500',
    seriesType: 'defense'
  }
];

export function TrackCards({ onTrackClick }: TrackCardsProps) {
  const handleTrackClick = (track: Track) => {
    if (onTrackClick) {
      onTrackClick(track);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {tracks.map((track) => (
        <Card 
          key={track.id}
          className="relative overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300 border-0 min-h-[180px]"
          onClick={() => handleTrackClick(track)}
        >
          {/* Gradient Background */}
          <div className={`absolute inset-0 ${track.color} bg-gradient-to-br from-current via-current/90 to-current/80`} />
          
          {/* Content Overlay */}
          <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
            {/* Top Section */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl" role="img" aria-label={track.title}>
                    {track.icon}
                  </span>
                  <h3 className="text-xl font-bold leading-tight">
                    {track.title}
                  </h3>
                </div>
                <p className="text-white/90 text-sm leading-relaxed">
                  {track.description}
                </p>
              </div>
              
              {/* Arrow Icon */}
              <ChevronRight className="w-6 h-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
            </div>

            {/* Bottom Section - Touch Target */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/90">
                  Start Training
                </span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Hover Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>
      ))}
    </div>
  );
}
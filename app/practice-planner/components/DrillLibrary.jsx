'use client';

import React, { useState, useEffect } from 'react';

const CATEGORIES = [
  { name: 'Admin', count: 5, color: 'bg-gray-100' },
  { name: 'Skill Drills', count: 47, color: 'bg-green-100' },
  { name: '1v1 Drills', count: 14, color: 'bg-orange-100' },
  { name: 'Concept Drills', count: 15, color: 'bg-purple-100' },
  { name: 'Team Drills', count: 43, color: 'bg-blue-100' },
  { name: 'Live Play', count: 6, color: 'bg-sky-100' }
];

const SAMPLE_DRILLS = {
  'Admin': [
    { id: 'a1', name: 'Team Meeting', defaultDuration: 10, description: 'Team meeting and announcements' },
    { id: 'a2', name: 'Warm-up', defaultDuration: 15, description: 'Dynamic warm-up and stretching' },
    { id: 'a3', name: 'Water Break', defaultDuration: 5, description: 'Hydration break' }
  ],
  'Skill Drills': [
    { id: 's1', name: 'Box Passing', defaultDuration: 8, description: 'Four corners passing drill' },
    { id: 's2', name: 'Star Drill', defaultDuration: 10, description: '5-man star passing pattern' },
    { id: 's3', name: 'Line Drills', defaultDuration: 12, description: 'Ground balls and passing on the move' }
  ],
  '1v1 Drills': [
    { id: '1v1_1', name: '1v1 Ground Balls', defaultDuration: 10, description: 'Compete for ground balls' },
    { id: '1v1_2', name: '1v1 From X', defaultDuration: 12, description: 'Dodging from behind the goal' },
    { id: '1v1_3', name: '1v1 Top Center', defaultDuration: 10, description: 'Face dodging at the top' }
  ],
  'Concept Drills': [
    { id: 'c1', name: '2-Man Game', defaultDuration: 15, description: 'Pick and roll concepts' },
    { id: 'c2', name: 'Adjacent Slides', defaultDuration: 12, description: 'Defensive sliding patterns' },
    { id: 'c3', name: 'Clearing Patterns', defaultDuration: 10, description: 'Organized clear concepts' }
  ],
  'Team Drills': [
    { id: 't1', name: '6v6 Transition', defaultDuration: 20, description: 'Full field transition work' },
    { id: 't2', name: '4v3 Fast Break', defaultDuration: 15, description: 'Numbers advantage drill' },
    { id: 't3', name: 'Settled Offense', defaultDuration: 15, description: '6v6 half field offense' }
  ],
  'Live Play': [
    { id: 'l1', name: 'Full Field Scrimmage', defaultDuration: 20, description: '6v6 game situations' },
    { id: 'l2', name: 'Situational Play', defaultDuration: 15, description: 'Game-specific scenarios' },
    { id: 'l3', name: 'Man Up/Down', defaultDuration: 12, description: 'Special teams practice' }
  ]
};

const DrillLibrary = ({ onAddDrill }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Drill Library</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter Drills
          </button>
        </div>
        
        <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          + Add Custom Drill
        </button>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <div key={category.name} className="bg-white rounded-lg shadow-sm">
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 font-medium">{category.name}</span>
                  <span className="text-sm text-gray-500">{category.count}</span>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories[category.name] ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedCategories[category.name] && (
                <div className="border-t border-gray-100">
                  {SAMPLE_DRILLS[category.name]?.map((drill) => (
                    <div
                      key={drill.id}
                      className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 mr-2">
                          <h4 className="text-sm font-medium text-gray-900">{drill.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{drill.description}</p>
                          <span className="text-xs text-gray-500">{drill.defaultDuration} min</span>
                        </div>
                        <button
                          onClick={() => onAddDrill({ ...drill, category: category.name })}
                          className="p-1 hover:bg-blue-100 rounded transition-colors"
                          title="Add to practice"
                        >
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DrillLibrary;
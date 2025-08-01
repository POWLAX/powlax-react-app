'use client';

import React, { useState } from 'react';

const PracticeSchedule = ({ 
  practiceInfo, 
  setPracticeInfo, 
  practiceDrills,
  setPracticeDrills,
  onRemoveDrill 
}) => {
  const [addSetupTime, setAddSetupTime] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Practice Schedule</h2>
      
      {/* Practice Details */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">Date:</span>
            <input
              type="date"
              value={practiceInfo.date}
              onChange={(e) => setPracticeInfo({...practiceInfo, date: e.target.value})}
              className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">Start:</span>
            <input
              type="text"
              value={practiceInfo.startTime}
              onChange={(e) => setPracticeInfo({...practiceInfo, startTime: e.target.value})}
              className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
            />
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">Field:</span>
            <select
              value={practiceInfo.field}
              onChange={(e) => setPracticeInfo({...practiceInfo, field: e.target.value})}
              className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Turf">Turf</option>
              <option value="Grass">Grass</option>
              <option value="Box">Box</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">Duration:</span>
            <span className="text-gray-900">{practiceInfo.duration} min</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">End:</span>
            <span className="text-gray-900">{practiceInfo.endTime}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="setupTime"
            checked={addSetupTime}
            onChange={(e) => setAddSetupTime(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="setupTime" className="text-gray-700">Add Setup Time</label>
        </div>
      </div>

      {/* Practice Plan Area */}
      <div className="min-h-[400px] border-2 border-dashed border-gray-300 rounded-lg p-8">
        {practiceDrills.length === 0 ? (
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Ready to Build Your Practice!</h3>
            <div className="space-y-2 text-gray-600">
              <p className="flex items-center justify-center gap-2">
                <span className="text-xl">➕</span>
                Click the + in the Drill Library 
                <span className="text-xl">👉</span>
              </p>
              <p className="text-gray-500">or</p>
              <p className="flex items-center justify-center gap-2">
                Tap "Add Drills to Plan" below
                <span className="text-xl">👇</span>
              </p>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-blue-600">
              <span className="text-2xl">📘</span>
              <span className="text-sm">Icons open notes, videos, diagrams, and images.</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {practiceDrills.map((drill, index) => (
              <div
                key={drill.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{drill.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{drill.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{drill.duration} min</span>
                      <span>•</span>
                      <span>{drill.category}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveDrill(drill.id)}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeSchedule;
'use client';

import React, { useState, useEffect } from 'react';
import PracticeSchedule from './PracticeSchedule';
import DrillLibrary from './DrillLibrary';

const PracticePlanner = () => {
  const [practiceInfo, setPracticeInfo] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '06:00 PM',
    field: 'Turf',
    duration: 0,
    endTime: '--:--'
  });

  const [practiceDrills, setPracticeDrills] = useState([]);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleAddDrill = (drill) => {
    const newDrill = {
      ...drill,
      id: `${drill.id}-${Date.now()}`,
      duration: drill.defaultDuration || 10
    };
    setPracticeDrills([...practiceDrills, newDrill]);
    updatePracticeDuration([...practiceDrills, newDrill]);
  };

  const handleRemoveDrill = (drillId) => {
    const updatedDrills = practiceDrills.filter(d => d.id !== drillId);
    setPracticeDrills(updatedDrills);
    updatePracticeDuration(updatedDrills);
  };

  const updatePracticeDuration = (drills) => {
    const totalDuration = drills.reduce((sum, drill) => sum + drill.duration, 0);
    
    // Calculate end time
    const [time, period] = practiceInfo.startTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let totalHours = hours;
    if (period === 'PM' && hours !== 12) totalHours += 12;
    if (period === 'AM' && hours === 12) totalHours = 0;
    
    const totalMinutes = totalHours * 60 + minutes + totalDuration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    
    let displayHours = endHours % 12 || 12;
    const endPeriod = endHours >= 12 ? 'PM' : 'AM';
    const endTime = `${String(displayHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')} ${endPeriod}`;
    
    setPracticeInfo(prev => ({
      ...prev,
      duration: totalDuration,
      endTime: totalDuration > 0 ? endTime : '--:--'
    }));
  };

  const [showDrillLibrary, setShowDrillLibrary] = useState(false);

  return (
    <div className="max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-center">
            <span className="text-xl sm:text-2xl mr-2">🥍</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">POWLAX Practice Planner</h1>
          </div>
          <p className="text-center text-gray-600 mt-2 text-sm sm:text-base">
            Finally: A practice planner built by a lacrosse coach who actually gets it.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col sm:flex-row h-[calc(100vh-120px)] relative">
        {/* Left Panel - Practice Schedule */}
        <div className={`w-full sm:w-2/3 bg-white sm:border-r border-gray-200 overflow-y-auto ${showDrillLibrary ? 'hidden sm:block' : 'block'} pb-16 sm:pb-0`}>
          <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3">
              <button className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-4">
                <button className="text-gray-600 hover:text-gray-900">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
                <button className="text-gray-600 hover:text-gray-900">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </button>
                <button className="text-gray-600 hover:text-gray-900">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Practice Info Bar */}
            <div 
              className="px-4 sm:px-6 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setShowInfoModal(true)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Practice Info and Goals</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          <PracticeSchedule 
            practiceInfo={practiceInfo}
            setPracticeInfo={setPracticeInfo}
            practiceDrills={practiceDrills}
            setPracticeDrills={setPracticeDrills}
            onRemoveDrill={handleRemoveDrill}
          />
        </div>

        {/* Right Panel - Drill Library */}
        <div className={`${showDrillLibrary ? 'block' : 'hidden'} sm:block fixed sm:relative inset-0 sm:inset-auto w-full sm:w-1/3 bg-gray-50 z-50 sm:z-auto`}>
          {/* Mobile close button */}
          <button
            onClick={() => setShowDrillLibrary(false)}
            className="sm:hidden absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg z-50"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <DrillLibrary onAddDrill={(drill) => {
            handleAddDrill(drill);
            // Close library on mobile after adding
            if (window.innerWidth < 640) {
              setShowDrillLibrary(false);
            }
          }} />
        </div>

        {/* Mobile Add Drills Button */}
        <button
          onClick={() => setShowDrillLibrary(true)}
          className="sm:hidden fixed bottom-0 left-0 right-0 w-full bg-blue-600 text-white py-4 px-6 text-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg z-40"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Drills to Plan
        </button>
      </div>
    </div>
  );
};

export default PracticePlanner;
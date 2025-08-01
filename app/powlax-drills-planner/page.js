'use client';

import { useState, useEffect } from 'react';

export default function PowlaxDrillsPlannerPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [PracticePlanner, setPracticePlanner] = useState(null);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        console.log('Loading PracticePlanner component...');
        const component = await import('./components/PracticePlanner');
        setPracticePlanner(() => component.default);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading PracticePlanner:', err);
        setError(err);
        setIsLoading(false);
      }
    };

    loadComponent();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading POWLAX Practice Planner...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full mx-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🥍 POWLAX Practice Planner</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Loading Error</h2>
            <p className="text-red-700 mb-2">{error.message}</p>
            <details className="text-sm">
              <summary className="cursor-pointer text-red-600 hover:text-red-800">
                Show technical details
              </summary>
              <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                {error.stack}
              </pre>
            </details>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {PracticePlanner && <PracticePlanner />}
    </div>
  );
}
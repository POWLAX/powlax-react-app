'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function TestSupabase() {
  const [status, setStatus] = useState('Checking...');
  const [drills, setDrills] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Test basic connection
      setStatus('Testing Supabase connection...');
      
      const { data, error } = await supabase
        .from('drills')
        .select('*')
        .limit(5);

      if (error) {
        setError(error.message);
        setStatus('Error connecting to Supabase');
      } else {
        setDrills(data || []);
        setStatus(`Success! Found ${data?.length || 0} drills`);
      }
    } catch (err) {
      setError(err.message);
      setStatus('Unexpected error');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className="mb-4">
        <p className="font-semibold">Status: {status}</p>
        {error && (
          <p className="text-red-600 mt-2">Error: {error}</p>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}
        </p>
        <p className="text-sm text-gray-600">
          Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'}
        </p>
      </div>

      {drills.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Sample Drills:</h2>
          <ul className="list-disc pl-5">
            {drills.map(drill => (
              <li key={drill.id}>{drill.title} - {drill.category}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
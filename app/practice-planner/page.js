'use client';

import { useState, useEffect } from 'react';
import PracticePlanner from './components/PracticePlanner';

export default function PracticePlannerPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <PracticePlanner />
    </div>
  );
}
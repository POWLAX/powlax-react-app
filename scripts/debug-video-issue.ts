#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

// Simulate the page logic to see what's happening
console.log('🔍 Debugging video display issue...\n');

// Helper function from the workout page
function extractVimeoId(drill: any): string | null {
  console.log('extractVimeoId called with drill:', drill);
  
  // First check if drill has direct vimeo_id field
  if (drill?.vimeo_id) {
    console.log('Found vimeo_id:', drill.vimeo_id);
    return drill.vimeo_id;
  }
  
  // Fallback to URL extraction if needed
  const url = drill?.video_url || drill?.video_link;
  if (!url) {
    console.log('No video_url or video_link found');
    return null;
  }
  
  console.log('Attempting to extract from URL:', url);
  
  // Handle different Vimeo URL formats
  const patterns = [
    /vimeo\.com\/(\d+)/,           // https://vimeo.com/123456
    /player\.vimeo\.com\/video\/(\d+)/, // https://player.vimeo.com/video/123456
    /^(\d+)$/                        // Just the ID: 123456
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      console.log('Extracted ID:', match[1]);
      return match[1];
    }
  }
  
  console.log('No match found');
  return null;
}

// Test with mock data that matches database
const mockCurrentDrill = {
  drill: {
    id: 1,
    title: "2 Hand Cradle Away Drill",
    vimeo_id: "1000143414"
  }
};

console.log('Testing with mock drill data...');
const result = extractVimeoId(mockCurrentDrill.drill);
console.log('Result:', result);

if (result) {
  console.log('\n✅ Video should work!');
  console.log(`Iframe src would be: https://player.vimeo.com/video/${result}`);
} else {
  console.log('\n❌ Video would not display');
}
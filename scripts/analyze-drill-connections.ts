import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function analyzeDrillConnections() {
  // Get all drills from powlax_drills
  const { data: drills, error } = await supabase
    .from('powlax_drills')
    .select('id, title, video_url')
    .order('title');
  
  if (error) {
    console.error('Error fetching drills:', error);
    return;
  }
  
  console.log(`Total drills in powlax_drills: ${drills?.length || 0}`);
  console.log('\nSample drill titles from powlax_drills:');
  console.log('=========================================');
  
  // Create a map of drill titles for easy lookup
  const drillMap = new Map();
  drills?.forEach(drill => {
    drillMap.set(drill.title.toLowerCase().trim(), drill);
  });
  
  // Show first 20 drill titles
  drills?.slice(0, 20).forEach(d => {
    console.log(`  - ${d.title}`);
  });
  
  // Now check JSON files for drill references
  console.log('\n\nChecking drill references in JSON files:');
  console.log('=========================================');
  
  const jsonDir = '/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/docs/existing/json Academy Workouts.';
  
  // Read one JSON file to check drill structure
  const sampleFile = path.join(jsonDir, 'ldqie_export_1754547992.json');
  
  try {
    const jsonContent = fs.readFileSync(sampleFile, 'utf-8');
    const data = JSON.parse(jsonContent);
    
    if (data.question) {
      console.log('\nSample workout drills from JSON:');
      const drillTitles = new Set<string>();
      
      // Get drill titles from questions
      Object.values(data.question).forEach((q: any) => {
        if (q._title) {
          drillTitles.add(q._title);
        }
      });
      
      // Check which drills exist in powlax_drills
      let matched = 0;
      let unmatched = 0;
      const unmatchedList: string[] = [];
      
      drillTitles.forEach(title => {
        const exists = drillMap.has(title.toLowerCase().trim());
        if (exists) {
          matched++;
        } else {
          unmatched++;
          unmatchedList.push(title);
        }
      });
      
      console.log(`  - Total drill references: ${drillTitles.size}`);
      console.log(`  - Matched in powlax_drills: ${matched}`);
      console.log(`  - Not found in powlax_drills: ${unmatched}`);
      
      if (unmatchedList.length > 0) {
        console.log('\nUnmatched drill titles (first 10):');
        unmatchedList.slice(0, 10).forEach(title => {
          console.log(`  ❌ "${title}"`);
          // Try to find close matches
          const closeMatch = Array.from(drillMap.keys()).find(key => 
            key.includes(title.toLowerCase().substring(0, 10))
          );
          if (closeMatch) {
            console.log(`     → Possible match: "${drillMap.get(closeMatch).title}"`);
          }
        });
      }
      
      // Show some matched drills
      console.log('\nSuccessfully matched drills (sample):');
      let count = 0;
      drillTitles.forEach(title => {
        if (count < 5 && drillMap.has(title.toLowerCase().trim())) {
          const drill = drillMap.get(title.toLowerCase().trim());
          console.log(`  ✅ "${title}" → ID: ${drill.id}`);
          count++;
        }
      });
    }
  } catch (err) {
    console.error('Error reading JSON file:', err);
  }
  
  process.exit(0);
}

analyzeDrillConnections().catch(console.error);
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTeamMembers() {
  console.log('🔍 Checking team_members table structure...\n');

  // Get all team_members records
  const { data: teamMembers, error } = await supabase
    .from('team_members')
    .select('*')
    .limit(10);

  if (error) {
    console.error('❌ Error fetching team_members:', error);
    return;
  }

  console.log('📊 TEAM_MEMBERS TABLE DATA:');
  console.log('=' .repeat(60));
  
  if (teamMembers && teamMembers.length > 0) {
    console.log(`Found ${teamMembers.length} records\n`);
    
    // Show sample records
    teamMembers.forEach((member, index) => {
      console.log(`Record ${index + 1}:`);
      console.log(`  ID: ${member.id}`);
      console.log(`  Team ID: ${member.team_id}`);
      console.log(`  User ID: ${member.user_id}`);
      console.log(`  Role: ${member.role}`);
      console.log(`  Status: ${member.status}`);
      console.log(`  Created: ${member.created_at}`);
      console.log('');
    });

    // Check what team_id values look like
    const uniqueTeamIds = [...new Set(teamMembers.map(m => m.team_id))];
    console.log('📋 UNIQUE TEAM IDs:');
    uniqueTeamIds.forEach(id => {
      console.log(`  - ${id}`);
    });
  } else {
    console.log('No records found in team_members table');
  }

  // Check if there's a separate teams-like table we're missing
  console.log('\n🔍 CHECKING ALL TABLES FOR POSSIBLE TEAM DATA:');
  console.log('=' .repeat(60));

  // List all tables that might contain team data
  const possibleTables = [
    'practice_plans',
    'practice_templates', 
    'clubs',
    'user_profiles',
    'wordpress_groups',
    'wp_bp_groups'
  ];

  for (const table of possibleTables) {
    const { error } = await supabase
      .from(table)
      .select('*')
      .limit(0);
    
    if (!error) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      console.log(`✅ ${table}: EXISTS (${count || 0} records)`);
      
      // Get sample to see columns
      const { data: sample } = await supabase
        .from(table)
        .select('*')
        .limit(1)
        .single();
      
      if (sample) {
        const relevantColumns = Object.keys(sample).filter(col => 
          col.includes('team') || 
          col.includes('group') || 
          col.includes('name') ||
          col.includes('title')
        );
        
        if (relevantColumns.length > 0) {
          console.log(`   Relevant columns: ${relevantColumns.join(', ')}`);
        }
      }
    }
  }

  console.log('\n✅ Analysis complete!');
}

checkTeamMembers().catch(console.error);
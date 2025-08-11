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

async function checkTeamsTable() {
  console.log('🔍 Checking team_teams table structure...\n');

  // Check if team_teams exists and get structure
  const { data: teams, error } = await supabase
    .from('team_teams')
    .select('*')
    .limit(5);

  if (error) {
    console.error('❌ Error fetching team_teams:', error);
    return;
  }

  console.log('📊 TEAM_TEAMS TABLE:');
  console.log('=' .repeat(60));
  
  if (teams && teams.length > 0) {
    console.log(`Found ${teams.length} team records\n`);
    
    // Show columns
    const sampleTeam = teams[0];
    console.log('Table columns:', Object.keys(sampleTeam).join(', '));
    console.log('');
    
    // Show sample records
    teams.forEach((team, index) => {
      console.log(`Team ${index + 1}:`);
      Object.entries(team).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          console.log(`  ${key}: ${value}`);
        }
      });
      console.log('');
    });
  } else {
    console.log('No records found in team_teams table');
    
    // Get column structure even if empty
    const { data: emptyCheck } = await supabase
      .from('team_teams')
      .select('*')
      .limit(0);
    
    console.log('Table exists but is empty - will need to populate it');
  }

  // Check relationship with team_members
  console.log('\n🔗 CHECKING TEAM_MEMBERS RELATIONSHIPS:');
  console.log('=' .repeat(60));
  
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('*')
    .limit(3);
  
  if (teamMembers && teamMembers.length > 0) {
    console.log('Sample team_members records:');
    teamMembers.forEach((member, index) => {
      console.log(`  ${index + 1}. Team ID: ${member.team_id}, User ID: ${member.user_id}, Role: ${member.role}`);
    });
    
    // Check if team_ids in team_members exist in team_teams
    const teamId = teamMembers[0].team_id;
    const { data: teamCheck } = await supabase
      .from('team_teams')
      .select('*')
      .eq('id', teamId)
      .single();
    
    if (teamCheck) {
      console.log(`\n✅ Team ${teamId} exists in team_teams table`);
      console.log(`   Team name: ${teamCheck.name || 'NO NAME'}`);
    } else {
      console.log(`\n❌ Team ${teamId} from team_members NOT found in team_teams table`);
      console.log('   This means team_members has orphaned records that need teams created');
    }
  }

  // Get unique team IDs from team_members
  console.log('\n📋 ALL UNIQUE TEAM IDs IN TEAM_MEMBERS:');
  console.log('=' .repeat(60));
  
  const { data: allMembers } = await supabase
    .from('team_members')
    .select('team_id, user_id, role');
  
  if (allMembers) {
    const uniqueTeamIds = [...new Set(allMembers.map(m => m.team_id))];
    console.log(`Found ${uniqueTeamIds.length} unique team IDs in team_members:`);
    uniqueTeamIds.forEach(id => {
      const memberCount = allMembers.filter(m => m.team_id === id).length;
      console.log(`  - ${id} (${memberCount} members)`);
    });
  }

  console.log('\n✅ Analysis complete!');
}

checkTeamsTable().catch(console.error);
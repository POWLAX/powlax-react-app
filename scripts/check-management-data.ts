import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkManagementData() {
  console.log('\n🔍 Checking Management Interface Data...\n');

  // Check users table
  const { data: users, error: usersError, count: userCount } = await supabase
    .from('users')
    .select('*', { count: 'exact' });
  
  console.log('=== USERS TABLE ===');
  if (usersError) {
    console.log('❌ Error:', usersError.message);
  } else {
    console.log(`✅ Found ${userCount} total users`);
    console.log('Sample users (first 3):');
    users?.slice(0, 3).forEach(u => {
      console.log(`  - ${u.email} | Roles: ${JSON.stringify(u.roles || [])} | Last activity: ${u.updated_at || 'Never'}`);
    });
  }

  // Check magic links
  const { data: links, error: linksError, count: linkCount } = await supabase
    .from('magic_links')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });
  
  console.log('\n=== MAGIC LINKS TABLE ===');
  if (linksError) {
    console.log('❌ Error:', linksError.message);
  } else {
    console.log(`✅ Found ${linkCount} total magic links`);
    if (links && links.length > 0) {
      console.log('Latest 3 magic links:');
      links.slice(0, 3).forEach(l => {
        const status = l.used_at ? 'Used' : new Date(l.expires_at) < new Date() ? 'Expired' : 'Active';
        console.log(`  - ${l.email} | Status: ${status} | Created: ${new Date(l.created_at).toLocaleDateString()}`);
      });
    }
  }

  // Check clubs
  const { data: clubs, error: clubsError, count: clubCount } = await supabase
    .from('clubs')
    .select('*', { count: 'exact' });
  
  console.log('\n=== CLUBS TABLE ===');
  if (clubsError) {
    console.log('❌ Error:', clubsError.message);
  } else {
    console.log(`✅ Found ${clubCount} total clubs`);
    if (clubs && clubs.length > 0) {
      console.log('All clubs:');
      clubs.forEach(c => {
        const mockIndicator = c.name?.includes('(MOCK)') ? ' [MOCK DATA]' : '';
        console.log(`  - ${c.name}${mockIndicator}`);
      });
    }
  }

  // Check teams
  const { data: teams, error: teamsError, count: teamCount } = await supabase
    .from('teams')
    .select('*', { count: 'exact' });
  
  console.log('\n=== TEAMS TABLE ===');
  if (teamsError) {
    console.log('❌ Error:', teamsError.message);
  } else {
    console.log(`✅ Found ${teamCount} total teams`);
    if (teams && teams.length > 0) {
      console.log('Sample teams (first 3):');
      teams.slice(0, 3).forEach(t => {
        const mockIndicator = t.name?.includes('(MOCK)') ? ' [MOCK DATA]' : '';
        console.log(`  - ${t.name}${mockIndicator}`);
      });
    }
  }

  // Check team members
  const { data: members, error: membersError, count: memberCount } = await supabase
    .from('team_members')
    .select('*', { count: 'exact' });
  
  console.log('\n=== TEAM MEMBERS TABLE ===');
  if (membersError) {
    console.log('❌ Error:', membersError.message);
  } else {
    console.log(`✅ Found ${memberCount} total team member relationships`);
  }

  console.log('\n✨ Data check complete!');
  console.log('\nSummary:');
  console.log(`- Users: ${userCount || 0} records`);
  console.log(`- Magic Links: ${linkCount || 0} records`);
  console.log(`- Clubs: ${clubCount || 0} records`);
  console.log(`- Teams: ${teamCount || 0} records`);
  console.log(`- Team Members: ${memberCount || 0} records`);
}

checkManagementData().catch(console.error);
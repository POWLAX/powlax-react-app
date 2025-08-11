import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Badge data with real WordPress URLs
const badges = [
  // Attack Badges
  { title: 'Crease Crawler', badge_type: 'Attack', category: 'Attack', icon_url: 'https://powlax.com/wp-content/uploads/2024/10/A1-Crease-Crawler.png', description: 'Master of crease movement and positioning', sort_order: 1 },
  { title: 'Wing Wizard', badge_type: 'Attack', category: 'Attack', icon_url: 'https://powlax.com/wp-content/uploads/2024/10/A2-Wing-Wizard.png', description: 'Expert at wing play and cutting', sort_order: 2 },
  { title: 'Ankle Breaker', badge_type: 'Attack', category: 'Attack', icon_url: 'https://powlax.com/wp-content/uploads/2024/10/A3-Ankle-Breaker.png', description: 'Devastating dodges that leave defenders behind', sort_order: 3 },
  
  // Defense Badges  
  { title: 'Hip Hitter', badge_type: 'Defense', category: 'Defense', icon_url: 'https://powlax.com/wp-content/uploads/2024/10/D1-Hip-Hitter.png', description: 'Master of defensive positioning', sort_order: 1 },
  { title: 'Footwork Fortress', badge_type: 'Defense', category: 'Defense', icon_url: 'https://powlax.com/wp-content/uploads/2024/10/D2-Footwork-Fortress.png', description: 'Impeccable defensive footwork', sort_order: 2 },
  
  // Midfield Badges
  { title: 'Ground Ball Guru', badge_type: 'Midfield', category: 'Midfield', icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Mid1-Ground-Ball-Guru.png', description: 'Dominates ground ball battles', sort_order: 1 },
  
  // Wall Ball Badges
  { title: 'Foundation Ace', badge_type: 'Wall Ball', category: 'Wall Ball', icon_url: 'https://powlax.com/wp-content/uploads/2024/10/WB1-Foundation-Ace.png', description: 'Master of wall ball fundamentals', sort_order: 1 },
  { title: 'Wall Ball Wizard', badge_type: 'Wall Ball', category: 'Wall Ball', icon_url: 'https://powlax.com/wp-content/uploads/2024/10/WB8-Wall-Ball-Wizard.png', description: 'Complete wall ball mastery', sort_order: 8 }
];

// Rank data
const ranks = [
  { title: 'Rookie', description: 'Just starting', rank_order: 1, lax_credits_required: 0 },
  { title: 'Player', description: 'Making progress', rank_order: 2, lax_credits_required: 500 },
  { title: 'Star Player', description: 'Standing out', rank_order: 3, lax_credits_required: 1500 },
  { title: 'Elite', description: 'Top tier', rank_order: 4, lax_credits_required: 3000 },
  { title: 'Legend', description: 'Legendary status', rank_order: 5, lax_credits_required: 5000 }
];

async function setupTables() {
  console.log('🚀 Testing Gamification Table Setup...\n');
  
  // Test if tables exist by trying to insert data
  console.log('Testing badges_powlax table...');
  const { error: badgeError } = await supabase
    .from('badges_powlax')
    .insert(badges);
  
  if (badgeError) {
    console.log(`❌ badges_powlax: ${badgeError.message}`);
    console.log('   -> Table needs to be created first');
  } else {
    console.log(`✅ badges_powlax: Data inserted successfully`);
  }
  
  console.log('\nTesting powlax_player_ranks table...');
  const { error: rankError } = await supabase
    .from('powlax_player_ranks')
    .insert(ranks);
  
  if (rankError) {
    console.log(`❌ powlax_player_ranks: ${rankError.message}`);
    console.log('   -> Table needs to be created first');
  } else {
    console.log(`✅ powlax_player_ranks: Data inserted successfully`);
  }
  
  if (badgeError || rankError) {
    console.log('\n⚠️  IMPORTANT: Tables need to be created first!');
    console.log('\nPlease go to your Supabase Dashboard:');
    console.log('1. Navigate to SQL Editor');
    console.log('2. Copy and run the SQL from:');
    console.log('   supabase/migrations/090_create_gamification_tables_properly.sql');
    console.log('3. Then run this script again to populate the data');
  } else {
    console.log('\n🎉 All tables populated successfully!');
  }
}

setupTables().catch(console.error);
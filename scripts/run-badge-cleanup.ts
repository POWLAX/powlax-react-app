import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function cleanupBadges() {
  console.log('🧹 POWLAX Badge Cleanup Tool');
  console.log('============================\n');
  
  try {
    // Step 1: Add badge_type column
    console.log('📋 Step 1: Adding badge_type column...');
    // Note: Column may already exist, we'll update it later
    console.log('   Skipping ALTER TABLE (will update column values)');
    
    // Step 2: Get all badges for processing
    console.log('\n📋 Step 2: Fetching all badges...');
    const { data: badges, error } = await supabase
      .from('badges_powlax')
      .select('*')
      .order('title');
    
    if (error) {
      console.error('❌ Error fetching badges:', error);
      return;
    }
    
    console.log(`   Found ${badges?.length || 0} badges`);
    
    // Step 3: Process and clean badges
    console.log('\n📋 Step 3: Cleaning badge data...');
    
    const cleanedBadges = new Map();
    const duplicates: string[] = [];
    
    badges?.forEach(badge => {
      // Determine badge type from title prefix
      let badgeType = 'General';
      if (badge.title?.match(/^A\d+/)) badgeType = 'Attack';
      else if (badge.title?.match(/^D\d+/)) badgeType = 'Defense';
      else if (badge.title?.match(/^M\d+|^Mid/)) badgeType = 'Midfield';
      else if (badge.title?.match(/^WB\d+/)) badgeType = 'Wall Ball';
      else if (badge.title?.match(/^SS|^Both/)) badgeType = 'Solid Start';
      else if (badge.title?.match(/^IQ/)) badgeType = 'Lacrosse IQ';
      else badgeType = badge.category || 'General';
      
      // Clean title: remove prefix and dash
      let cleanTitle = badge.title || '';
      cleanTitle = cleanTitle.replace(/^[A-Z]+\d*\s*-\s*/, '').trim();
      cleanTitle = cleanTitle.replace(/^Both Badge/, 'Both Hands').trim();
      
      // Create unique key for duplicate detection
      const key = `${cleanTitle.toLowerCase()}_${badgeType}`;
      
      if (cleanedBadges.has(key)) {
        duplicates.push(`${badge.title} (ID: ${badge.id})`);
      } else {
        cleanedBadges.set(key, {
          ...badge,
          title: cleanTitle,
          badge_type: badgeType
        });
      }
    });
    
    console.log(`   Cleaned ${cleanedBadges.size} unique badges`);
    console.log(`   Found ${duplicates.length} duplicates to remove`);
    
    if (duplicates.length > 0) {
      console.log('\n   Duplicates removed:');
      duplicates.forEach(d => console.log(`     - ${d}`));
    }
    
    // Step 4: Clear table and insert clean data
    console.log('\n📋 Step 4: Updating database with clean data...');
    
    // Delete all existing records
    const { error: deleteError } = await supabase
      .from('badges_powlax')
      .delete()
      .neq('id', 0); // Delete all (neq with impossible value)
    
    if (deleteError) {
      console.error('❌ Error clearing table:', deleteError);
      return;
    }
    
    // Insert cleaned data (remove badge_type field since column doesn't exist yet)
    const cleanBadgeArray = Array.from(cleanedBadges.values()).map((badge, index) => {
      const { badge_type, ...badgeWithoutType } = badge;
      return {
        ...badgeWithoutType,
        id: index + 1,
        sort_order: index,
        // Store badge type in metadata for now
        metadata: {
          ...badge.metadata,
          badge_type: badge_type
        }
      };
    });
    
    const { error: insertError } = await supabase
      .from('badges_powlax')
      .insert(cleanBadgeArray);
    
    if (insertError) {
      console.error('❌ Error inserting clean data:', insertError);
      return;
    }
    
    console.log(`✅ Successfully updated ${cleanBadgeArray.length} badges`);
    
    // Step 5: Map image URLs
    console.log('\n📋 Step 5: Mapping WordPress image URLs...');
    
    const imageUpdates = [
      // Attack badges
      { title: 'Crease Crawler', type: 'Attack', url: 'https://powlax.com/wp-content/uploads/2024/10/A1-Crease-Crawler.png' },
      { title: 'Wing Wizard', type: 'Attack', url: 'https://powlax.com/wp-content/uploads/2024/10/A2-Wing-Wizard.png' },
      { title: 'Ankle Breaker', type: 'Attack', url: 'https://powlax.com/wp-content/uploads/2024/10/A3-Ankle-Breaker.png' },
      { title: 'Seasoned Sniper', type: 'Attack', url: 'https://powlax.com/wp-content/uploads/2024/10/A4-Seasoned-Sniper.png' },
      { title: 'Time and room terror', type: 'Attack', url: 'https://powlax.com/wp-content/uploads/2024/10/A5-Time-and-room-terror.png' },
      { title: 'On the run rocketeer', type: 'Attack', url: 'https://powlax.com/wp-content/uploads/2024/10/A6-On-the-run-rocketeer.png' },
      { title: 'Island Isolator', type: 'Attack', url: 'https://powlax.com/wp-content/uploads/2024/10/A7-Island-Isolator.png' },
      { title: 'Goalies Nightmare', type: 'Attack', url: 'https://powlax.com/wp-content/uploads/2024/10/A8-Goalies-Nightmare.png' },
      { title: 'Rough Rider', type: 'Attack', url: 'https://powlax.com/wp-content/uploads/2024/10/A9-Rough-Rider.png' },
      { title: 'Fast Break Finisher', type: 'Attack', url: 'https://powlax.com/wp-content/uploads/2024/10/A10-Fast-Break-Finisher.png' },
      
      // Defense badges
      { title: 'Hip Hitter', type: 'Defense', url: 'https://powlax.com/wp-content/uploads/2024/10/D1-Hip-Hitter.png' },
      { title: 'Footwork Fortress', type: 'Defense', url: 'https://powlax.com/wp-content/uploads/2024/10/D2-Footwork-Fortress.png' },
      { title: 'Slide Master', type: 'Defense', url: 'https://powlax.com/wp-content/uploads/2024/10/D3-Slide-Master.png' },
      { title: 'Close Quarters Crusher', type: 'Defense', url: 'https://powlax.com/wp-content/uploads/2024/10/D4-Close-Quarters-Crusher.png' },
      { title: 'Ground Ball Gladiator', type: 'Defense', url: 'https://powlax.com/wp-content/uploads/2024/10/D5-Ground-Ball-Gladiator.png' },
      { title: 'Consistent Clear', type: 'Defense', url: 'https://powlax.com/wp-content/uploads/2024/10/D6-Consistent-Clear.png' },
      { title: 'Turnover Titan', type: 'Defense', url: 'https://powlax.com/wp-content/uploads/2024/10/D7-Turnover-Titan.png' },
      { title: 'The Great Wall', type: 'Defense', url: 'https://powlax.com/wp-content/uploads/2024/10/D8-The-Great-Wall.png' },
      { title: 'Silky Smooth', type: 'Defense', url: 'https://powlax.com/wp-content/uploads/2024/10/D9-Silky-Smooth.png' },
      
      // Midfield badges  
      { title: 'Ground Ball Guru', type: 'Midfield', url: 'https://powlax.com/wp-content/uploads/2024/10/Mid1-Ground-Ball-Guru.png' },
      { title: '2 Way Tornado', type: 'Midfield', url: 'https://powlax.com/wp-content/uploads/2024/10/Mid-2-2-Way-Tornado.png' },
      { title: 'Wing Man Warrior', type: 'Midfield', url: 'https://powlax.com/wp-content/uploads/2024/10/M3-Wing-Man-Warrior.png' },
      { title: 'Dodging Dynamo', type: 'Midfield', url: 'https://powlax.com/wp-content/uploads/2024/10/M4-Dodging-Dynaomo.png' },
      { title: 'Fast Break Starter', type: 'Midfield', url: 'https://powlax.com/wp-content/uploads/2024/10/M5-Fast-Break-Finisher.png' },
      { title: 'Shooting Sharp Shooter', type: 'Midfield', url: 'https://powlax.com/wp-content/uploads/2024/10/M6-Shooting-Sharp-Shooter.png' },
      { title: 'Clearing Commander', type: 'Midfield', url: 'https://powlax.com/wp-content/uploads/2024/10/M7-Clearing-Commander.png' },
      { title: 'Middie Machine', type: 'Midfield', url: 'https://powlax.com/wp-content/uploads/2024/10/M8-Middie-Machine.png' },
      { title: 'Determined D-Mid', type: 'Midfield', url: 'https://powlax.com/wp-content/uploads/2024/10/M-9-Determined-D-Mid.png' },
      { title: 'Inside Man', type: 'Midfield', url: 'https://powlax.com/wp-content/uploads/2024/10/m10-Inside-Man.png' },
      
      // Wall Ball badges
      { title: 'Foundation Ace', type: 'Wall Ball', url: 'https://powlax.com/wp-content/uploads/2024/10/WB1-Foundation-Ace.png' },
      { title: 'Dominant Dodger', type: 'Wall Ball', url: 'https://powlax.com/wp-content/uploads/2024/10/WB2-Dominant-Dodger.png' },
      { title: 'Stamina Star', type: 'Wall Ball', url: 'https://powlax.com/wp-content/uploads/2024/10/WB3-Stamina-Star.png' },
      { title: 'Finishing Phenom', type: 'Wall Ball', url: 'https://powlax.com/wp-content/uploads/2024/10/WB4-Finishing-Phenom.png' },
      { title: 'Bullet Snatcher', type: 'Wall Ball', url: 'https://powlax.com/wp-content/uploads/2024/10/WB5-Bullet-Snatcher.png' },
      { title: 'Long Pole Lizard', type: 'Wall Ball', url: 'https://powlax.com/wp-content/uploads/2024/10/WB6-Long-Pole-Lizard.png' },
      { title: 'Ball Hawk', type: 'Wall Ball', url: 'https://powlax.com/wp-content/uploads/2024/10/WB7-Ball-Hawk.png' },
      { title: 'Wall Ball Wizard', type: 'Wall Ball', url: 'https://powlax.com/wp-content/uploads/2024/10/WB8-Wall-Ball-Wizard.png' },
      { title: 'Fully Fancy Freddie', type: 'Wall Ball', url: 'https://powlax.com/wp-content/uploads/2024/10/WB8-Fully-Fancy-Freddie.png' },
      { title: 'Independent Improver', type: 'Wall Ball', url: 'https://powlax.com/wp-content/uploads/2024/10/WB9-Independent-Improver.png' },
    ];
    
    let updatedCount = 0;
    for (const update of imageUpdates) {
      // Find badge by title and category (since badge_type is in metadata)
      const { data: matchingBadges } = await supabase
        .from('badges_powlax')
        .select('id, title, metadata')
        .eq('title', update.title);
      
      const badge = matchingBadges?.find(b => 
        b.metadata?.badge_type === update.type || 
        b.title === update.title
      );
      
      if (badge) {
        const { error } = await supabase
          .from('badges_powlax')
          .update({ icon_url: update.url })
          .eq('id', badge.id);
      
        if (!error) {
          updatedCount++;
          console.log(`   ✅ Updated ${update.title} with image`);
        }
      }
    }
    
    console.log(`\n✅ Successfully updated ${updatedCount} badges with images`);
    
    // Step 6: Final report
    console.log('\n📊 Final Summary:');
    const { data: finalBadges } = await supabase
      .from('badges_powlax')
      .select('category, metadata, icon_url');
    
    const summary = finalBadges?.reduce((acc, badge) => {
      const type = badge.metadata?.badge_type || badge.category || 'Unknown';
      if (!acc[type]) acc[type] = { total: 0, withIcon: 0 };
      acc[type].total++;
      if (badge.icon_url) acc[type].withIcon++;
      return acc;
    }, {} as Record<string, { total: number; withIcon: number }>);
    
    Object.entries(summary || {}).forEach(([type, stats]) => {
      console.log(`   ${type}: ${stats.total} badges (${stats.withIcon} with icons)`);
    });
    
    console.log('\n🎉 Badge cleanup completed successfully!');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

cleanupBadges();
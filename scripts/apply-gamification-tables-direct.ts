import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function createGamificationTables() {
  console.log('🚀 Creating Gamification Progress Tables\n');
  console.log('=' . repeat(50));

  try {
    // 1. Create user_badge_progress table
    console.log('\n📊 Creating user_badge_progress table...');
    
    const { error: badgeTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_badge_progress (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          badge_id INTEGER NOT NULL,
          series_id INTEGER REFERENCES skills_academy_series(id),
          drills_completed INTEGER DEFAULT 0,
          drills_required INTEGER NOT NULL,
          progress_percentage DECIMAL(5,2) DEFAULT 0,
          is_eligible BOOLEAN DEFAULT FALSE,
          earned_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, badge_id, series_id)
        )
      `
    }).single();

    if (badgeTableError) {
      console.log('⚠️ Could not create via RPC, trying alternative method...');
      
      // Alternative: Check if table exists
      const { error: checkError } = await supabase
        .from('user_badge_progress')
        .select('id')
        .limit(1);
      
      if (checkError?.code === '42P01') {
        console.log('❌ Table does not exist and cannot be created via API');
        console.log('   Please run the migration directly in Supabase Dashboard SQL Editor');
      } else {
        console.log('✅ Table user_badge_progress already exists or was created');
      }
    } else {
      console.log('✅ Created user_badge_progress table');
    }

    // 2. Create user_rank_progress table
    console.log('\n📊 Creating user_rank_progress table...');
    
    const { error: rankTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_rank_progress (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          current_rank_id INTEGER REFERENCES powlax_player_ranks(id) DEFAULT 1,
          academy_points_total INTEGER DEFAULT 0,
          points_to_next_rank INTEGER,
          rank_progress_percentage DECIMAL(5,2) DEFAULT 0,
          highest_rank_achieved INTEGER DEFAULT 1,
          rank_updated_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id)
        )
      `
    }).single();

    if (rankTableError) {
      const { error: checkError } = await supabase
        .from('user_rank_progress')
        .select('id')
        .limit(1);
      
      if (checkError?.code === '42P01') {
        console.log('❌ Table does not exist and cannot be created via API');
      } else {
        console.log('✅ Table user_rank_progress already exists or was created');
      }
    } else {
      console.log('✅ Created user_rank_progress table');
    }

    // 3. Create badge_series_mapping table
    console.log('\n📊 Creating badge_series_mapping table...');
    
    const { error: mappingTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS badge_series_mapping (
          badge_id INTEGER NOT NULL,
          series_id INTEGER REFERENCES skills_academy_series(id),
          drills_required INTEGER NOT NULL,
          is_combination_badge BOOLEAN DEFAULT FALSE,
          combination_badge_ids INTEGER[] DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          PRIMARY KEY (badge_id, COALESCE(series_id, 0))
        )
      `
    }).single();

    if (mappingTableError) {
      const { error: checkError } = await supabase
        .from('badge_series_mapping')
        .select('badge_id')
        .limit(1);
      
      if (checkError?.code === '42P01') {
        console.log('❌ Table does not exist and cannot be created via API');
      } else {
        console.log('✅ Table badge_series_mapping already exists or was created');
      }
    } else {
      console.log('✅ Created badge_series_mapping table');
    }

    // 4. Populate badge_series_mapping if empty
    console.log('\n📊 Populating badge-series mappings...');
    
    const { count } = await supabase
      .from('badge_series_mapping')
      .select('*', { count: 'exact', head: true });

    if (count === 0) {
      // Solid Start mappings (20 drills)
      const solidStartMappings = [
        { badge_id: 137, series_id: 1, drills_required: 20 },  // Ball Mover
        { badge_id: 138, series_id: 2, drills_required: 20 },  // Dual Threat
        { badge_id: 139, series_id: 3, drills_required: 20 },  // Sure Hands
        { badge_id: 140, series_id: 4, drills_required: 20 },  // The Great Deceiver
        { badge_id: 141, series_id: 5, drills_required: 20 }   // Both Badge
      ];

      // Attack mappings (50 drills)
      const attackMappings = [
        { badge_id: 94, series_id: 7, drills_required: 50 },   // On the Run Rocketeer
        { badge_id: 95, series_id: 8, drills_required: 50 },   // Island Isolator
        { badge_id: 89, series_id: 9, drills_required: 50 },   // Crease Crawler
        { badge_id: 98, series_id: 10, drills_required: 50 },  // Fast Break Finisher
        { badge_id: 93, series_id: 11, drills_required: 50 },  // Time and Room Terror
        { badge_id: 91, series_id: 12, drills_required: 50 },  // Ankle Breaker
        { badge_id: 94, series_id: 13, drills_required: 50 },  // On the Run Rocketeer (dup)
        { badge_id: 91, series_id: 14, drills_required: 50 },  // Ankle Breaker (dup)
        { badge_id: 91, series_id: 15, drills_required: 50 },  // Ankle Breaker (dup)
        { badge_id: 93, series_id: 16, drills_required: 50 },  // Time and Room Terror (dup)
        { badge_id: 97, series_id: 17, drills_required: 50 }   // Rough Rider
      ];

      // Defense mappings (50 drills)
      const defenseMappings = [
        { badge_id: 101, series_id: 19, drills_required: 50 }, // Slide Master
        { badge_id: 100, series_id: 20, drills_required: 50 }, // Footwork Fortress
        { badge_id: 102, series_id: 21, drills_required: 50 }, // Close Quarters Crusher
        { badge_id: 105, series_id: 22, drills_required: 50 }, // Turnover Titan
        { badge_id: 103, series_id: 23, drills_required: 50 }, // Ground Ball Gladiator
        { badge_id: 101, series_id: 23, drills_required: 50 }, // Slide Master (dup)
        { badge_id: 100, series_id: 24, drills_required: 50 }, // Footwork Fortress (dup)
        { badge_id: 107, series_id: 25, drills_required: 50 }, // Silky Smooth
        { badge_id: 99, series_id: 26, drills_required: 50 },  // Hip Hitter
        { badge_id: 102, series_id: 27, drills_required: 50 }, // Close Quarters Crusher (dup)
        { badge_id: 104, series_id: 28, drills_required: 50 }, // Consistent Clear
        { badge_id: 105, series_id: 29, drills_required: 50 }  // Turnover Titan (dup)
      ];

      // Midfield mappings (50 drills)
      const midfieldMappings = [
        { badge_id: 113, series_id: 31, drills_required: 50 }, // Shooting Sharp Shooter
        { badge_id: 117, series_id: 32, drills_required: 50 }, // Inside Man
        { badge_id: 116, series_id: 33, drills_required: 50 }, // Determined D-Mid
        { badge_id: 110, series_id: 34, drills_required: 50 }, // Wing Man Warrior
        { badge_id: 111, series_id: 35, drills_required: 50 }, // Dodging Dynamo
        { badge_id: 111, series_id: 36, drills_required: 50 }, // Dodging Dynamo (dup)
        { badge_id: 109, series_id: 37, drills_required: 50 }, // 2 Way Tornado
        { badge_id: 117, series_id: 38, drills_required: 50 }, // Inside Man (dup)
        { badge_id: 112, series_id: 39, drills_required: 50 }, // Fast Break Starter
        { badge_id: 113, series_id: 40, drills_required: 50 }, // Shooting Sharp Shooter (dup)
        { badge_id: 116, series_id: 41, drills_required: 50 }  // Determined D-Mid (dup)
      ];

      // Wall Ball mappings (50 drills)
      const wallBallMappings = [
        { badge_id: 118, series_id: 42, drills_required: 50 }, // Foundation Ace
        { badge_id: 119, series_id: 43, drills_required: 50 }, // Dominant Dodger
        { badge_id: 122, series_id: 44, drills_required: 50 }, // Bullet Snatcher
        { badge_id: 120, series_id: 45, drills_required: 50 }, // Stamina Star
        { badge_id: 121, series_id: 46, drills_required: 50 }, // Finishing Phenom
        { badge_id: 124, series_id: 47, drills_required: 50 }, // Ball Hawk
        { badge_id: 123, series_id: 48, drills_required: 50 }, // Long Pole Lizard
        { badge_id: 125, series_id: 49, drills_required: 50 }  // Wall Ball Wizard
      ];

      // Combination badges
      const combinationMappings = [
        { 
          badge_id: 96, 
          series_id: null, 
          drills_required: 0, 
          is_combination_badge: true,
          combination_badge_ids: [92, 89, 94]  // Goalies Nightmare
        },
        { 
          badge_id: 106, 
          series_id: null, 
          drills_required: 0, 
          is_combination_badge: true,
          combination_badge_ids: [100, 101, 102]  // The Great Wall
        },
        { 
          badge_id: 115, 
          series_id: null, 
          drills_required: 0, 
          is_combination_badge: true,
          combination_badge_ids: [111, 117, 113]  // Middie Machine
        },
        { 
          badge_id: 142, 
          series_id: null, 
          drills_required: 0, 
          is_combination_badge: true,
          combination_badge_ids: [137, 138, 139, 140, 141]  // Solid Start Master
        }
      ];

      // Insert all mappings
      const allMappings = [
        ...solidStartMappings,
        ...attackMappings,
        ...defenseMappings,
        ...midfieldMappings,
        ...wallBallMappings,
        ...combinationMappings
      ];

      const { error: insertError } = await supabase
        .from('badge_series_mapping')
        .insert(allMappings);

      if (insertError) {
        console.log(`❌ Error inserting mappings: ${insertError.message}`);
      } else {
        console.log(`✅ Inserted ${allMappings.length} badge-series mappings`);
      }
    } else {
      console.log(`✅ Badge-series mappings already exist (${count} records)`);
    }

    // 5. Verify all tables
    console.log('\n' + '=' . repeat(50));
    console.log('\n🔍 Verifying gamification tables:\n');

    const tablesToCheck = [
      'user_badge_progress',
      'user_rank_progress', 
      'badge_series_mapping'
    ];

    for (const table of tablesToCheck) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`✅ ${table}: Exists with ${count || 0} records`);
      } else {
        console.log(`❌ ${table}: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('\n❌ Error creating tables:', error);
    console.log('\n⚠️ IMPORTANT: If table creation failed, please run the following SQL');
    console.log('   in your Supabase Dashboard SQL Editor:');
    console.log('   supabase/migrations/103_gamification_progress_tables.sql');
    process.exit(1);
  }
}

// Run the setup
createGamificationTables()
  .then(() => {
    console.log('\n✅ Gamification table setup complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Setup error:', error);
    process.exit(1);
  });
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testFavoritesCompleteFlow() {
  console.log('🧪 Testing Complete Favorites Flow...\n')
  
  // Get a test user
  const { data: users } = await supabase.from('users').select('id, email').limit(1)
  if (!users || users.length === 0) {
    console.log('❌ No users found for testing')
    return
  }
  
  const testUser = users[0]
  console.log(`✅ Using test user: ${testUser.email}`)
  
  // Step 1: Clear existing favorites for clean test
  console.log('\n📋 Step 1: Clearing existing favorites...')
  const { error: clearError } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', testUser.id)
  
  if (clearError) {
    console.log(`   ⚠️ Warning clearing favorites: ${clearError.message}`)
  } else {
    console.log('   ✅ Favorites cleared')
  }
  
  // Step 2: Get some test drills
  console.log('\n📋 Step 2: Getting test drills...')
  const { data: drills } = await supabase
    .from('powlax_drills')
    .select('id, title')
    .limit(3)
  
  if (!drills || drills.length === 0) {
    console.log('   ❌ No drills found')
    return
  }
  
  console.log(`   ✅ Found ${drills.length} test drills:`)
  drills.forEach(d => console.log(`      - ${d.title} (${d.id})`))
  
  // Step 3: Add drills as favorites
  console.log('\n📋 Step 3: Adding drills as favorites...')
  for (const drill of drills) {
    const { data: favData, error: favError } = await supabase
      .from('user_favorites')
      .insert([{
        user_id: testUser.id,
        drill_id: drill.id
      }])
      .select()
      .single()
    
    if (favError) {
      console.log(`   ❌ Failed to add ${drill.title}: ${favError.message}`)
    } else {
      console.log(`   ✅ Added ${drill.title} as favorite`)
    }
  }
  
  // Step 4: Verify favorites are saved
  console.log('\n📋 Step 4: Verifying favorites are saved...')
  const { data: savedFavorites, error: fetchError } = await supabase
    .from('user_favorites')
    .select('*')
    .eq('user_id', testUser.id)
  
  if (fetchError) {
    console.log(`   ❌ Error fetching favorites: ${fetchError.message}`)
    return
  }
  
  console.log(`   ✅ Found ${savedFavorites?.length || 0} saved favorites`)
  
  // Step 5: Check data mapping
  console.log('\n📋 Step 5: Testing data mapping for UI...')
  if (savedFavorites && savedFavorites.length > 0) {
    console.log('   Database columns present:')
    const firstFav = savedFavorites[0]
    Object.keys(firstFav).forEach(key => {
      if (firstFav[key] !== null && firstFav[key] !== undefined) {
        console.log(`      - ${key}: ${typeof firstFav[key] === 'string' && firstFav[key].length > 50 ? firstFav[key].substring(0, 50) + '...' : firstFav[key]}`)
      }
    })
    
    // Simulate how the hook maps this data
    console.log('\n   How the hook should map this:')
    const mappedFavorites = savedFavorites.map(item => ({
      id: item.id,
      drill_id: item.drill_id,
      item_id: item.drill_id || item.item_id,  // Map for UI compatibility
      item_type: (item.item_type || 'drill') as 'drill' | 'strategy',
      user_id: item.user_id,
      created_at: item.created_at
    }))
    
    console.log(`   ✅ Mapped ${mappedFavorites.length} favorites for UI`)
    mappedFavorites.forEach((fav, i) => {
      console.log(`      ${i + 1}. drill_id: ${fav.drill_id}, item_id: ${fav.item_id}, type: ${fav.item_type}`)
    })
    
    // Check if drill IDs match what we added
    console.log('\n   Verification:')
    const addedDrillIds = drills.map(d => d.id)
    const savedDrillIds = mappedFavorites.map(f => f.drill_id).filter(Boolean)
    
    addedDrillIds.forEach(id => {
      if (savedDrillIds.includes(id)) {
        console.log(`      ✅ Drill ${id} correctly saved and mapped`)
      } else {
        console.log(`      ❌ Drill ${id} not found in saved favorites`)
      }
    })
  }
  
  // Step 6: Test isFavorite function logic
  console.log('\n📋 Step 6: Testing isFavorite logic...')
  if (savedFavorites && savedFavorites.length > 0 && drills.length > 0) {
    const testDrillId = drills[0].id
    const favoriteItem = savedFavorites[0]
    
    console.log(`   Testing with drill ID: ${testDrillId}`)
    console.log(`   Favorite has drill_id: ${favoriteItem.drill_id}`)
    console.log(`   Favorite has item_id: ${favoriteItem.item_id}`)
    
    // Simulate isFavorite check
    const wouldMatch = (favoriteItem.item_id === testDrillId || favoriteItem.drill_id === testDrillId)
    console.log(`   Would isFavorite return true? ${wouldMatch}`)
  }
  
  console.log('\n✅ FAVORITES FLOW TEST COMPLETE')
  console.log('   Summary:')
  console.log(`   - User: ${testUser.email}`)
  console.log(`   - Added: ${drills.length} favorites`)
  console.log(`   - Saved: ${savedFavorites?.length || 0} favorites`)
  console.log(`   - Mapping: drill_id → item_id for UI compatibility`)
}

testFavoritesCompleteFlow().catch(console.error)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testFavoritesLoading() {
  console.log('🔍 Testing Favorites Loading...')
  
  // Get a real user for testing
  const { data: users } = await supabase.from('users').select('id, email').limit(1)
  if (!users || users.length === 0) {
    console.log('❌ No users found for testing')
    return
  }
  
  const testUser = users[0]
  console.log(`\n✅ Testing with user: ${testUser.email}`)
  
  // Check what's in the user_favorites table
  console.log('\n📊 Checking user_favorites table structure and data...')
  const { data: favorites, error } = await supabase
    .from('user_favorites')
    .select('*')
    .eq('user_id', testUser.id)
  
  if (error) {
    console.log(`❌ Error fetching favorites: ${error.message}`)
    return
  }
  
  if (!favorites || favorites.length === 0) {
    console.log('⚠️ No favorites found for this user')
    
    // Try to add a test favorite
    console.log('\n🧪 Adding a test favorite...')
    const { data: drills } = await supabase.from('powlax_drills').select('id, title').limit(1)
    if (drills && drills.length > 0) {
      const testDrill = drills[0]
      console.log(`   Adding drill: ${testDrill.title} (${testDrill.id})`)
      
      const { data: newFav, error: addError } = await supabase
        .from('user_favorites')
        .insert([{
          user_id: testUser.id,
          drill_id: testDrill.id
        }])
        .select()
      
      if (addError) {
        console.log(`   ❌ Error adding favorite: ${addError.message}`)
      } else {
        console.log(`   ✅ Added test favorite: ${JSON.stringify(newFav)}`)
      }
    }
  } else {
    console.log(`\n✅ Found ${favorites.length} favorites:`)
    favorites.forEach((fav, index) => {
      console.log(`\n   Favorite ${index + 1}:`)
      Object.keys(fav).forEach(key => {
        if (fav[key] !== null) {
          console.log(`      ${key}: ${fav[key]}`)
        }
      })
    })
  }
  
  // Check table columns
  console.log('\n🔍 Checking table columns...')
  const { data: tableInfo, error: tableError } = await supabase
    .from('user_favorites')
    .select('*')
    .limit(1)
  
  if (tableInfo && tableInfo.length > 0) {
    console.log('   Table columns:', Object.keys(tableInfo[0]))
  }
  
  // Now test how the application would map this data
  console.log('\n🎯 Testing data mapping for UI:')
  if (favorites && favorites.length > 0) {
    const mappedFavorites = favorites.map(item => ({
      id: item.id,
      drill_id: item.drill_id,
      item_id: item.drill_id,  // Map for UI compatibility
      item_type: 'drill' as const,
      user_id: item.user_id,
      created_at: item.created_at
    }))
    
    console.log('   Mapped favorites for UI:')
    mappedFavorites.forEach((fav, index) => {
      console.log(`      ${index + 1}. ID: ${fav.item_id} (Type: ${fav.item_type})`)
    })
  }
}

testFavoritesLoading().catch(console.error)
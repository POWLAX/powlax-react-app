/**
 * Badge Icon Upload Script
 * Agent 2 - Badge Definitions and Requirements
 * 
 * Downloads badge icons from WordPress URLs and uploads them to Supabase Storage
 * Updates badges_powlax table with new Supabase storage URLs
 */

import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import * as path from 'path'

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface Badge {
  id: number
  original_id: number
  title: string
  category: string
  icon_url: string | null
}

/**
 * Download image from URL and return as Buffer
 */
async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    console.log(`   📥 Downloading: ${url}`)
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error(`   ❌ Failed to download ${url}: ${response.status} ${response.statusText}`)
      return null
    }
    
    const buffer = await response.buffer()
    console.log(`   ✅ Downloaded ${buffer.length} bytes`)
    return buffer
  } catch (error) {
    console.error(`   ❌ Error downloading ${url}:`, error)
    return null
  }
}

/**
 * Upload image buffer to Supabase Storage
 */
async function uploadToSupabaseStorage(
  buffer: Buffer, 
  fileName: string,
  contentType: string = 'image/png'
): Promise<string | null> {
  try {
    console.log(`   📤 Uploading to storage: ${fileName}`)
    
    const { data, error } = await supabase.storage
      .from('badge-icons')
      .upload(fileName, buffer, {
        contentType,
        upsert: true
      })
    
    if (error) {
      console.error(`   ❌ Upload error for ${fileName}:`, error)
      return null
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('badge-icons')
      .getPublicUrl(fileName)
    
    console.log(`   ✅ Uploaded successfully: ${publicUrlData.publicUrl}`)
    return publicUrlData.publicUrl
    
  } catch (error) {
    console.error(`   ❌ Error uploading ${fileName}:`, error)
    return null
  }
}

/**
 * Generate storage filename from badge info
 */
function generateFileName(badge: Badge): string {
  // Create filename from category and title
  const categorySlug = badge.category.toLowerCase().replace(/\s+/g, '-')
  const titleSlug = badge.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Remove multiple hyphens
    .trim()
  
  return `${categorySlug}/${titleSlug}-${badge.original_id}.png`
}

/**
 * Process a single badge icon
 */
async function processBadgeIcon(badge: Badge): Promise<string | null> {
  if (!badge.icon_url) {
    console.log(`   ⚠️  No icon URL for badge: ${badge.title}`)
    return null
  }
  
  console.log(`\n🎖️  Processing icon for: ${badge.title}`)
  
  // Download the image
  const imageBuffer = await downloadImage(badge.icon_url)
  if (!imageBuffer) {
    return null
  }
  
  // Generate filename
  const fileName = generateFileName(badge)
  
  // Upload to Supabase Storage
  const supabaseUrl = await uploadToSupabaseStorage(imageBuffer, fileName)
  
  return supabaseUrl
}

/**
 * Update badge record with new icon URL
 */
async function updateBadgeIconUrl(badgeId: number, newIconUrl: string): Promise<void> {
  const { error } = await supabase
    .from('badges_powlax')
    .update({ icon_url: newIconUrl })
    .eq('id', badgeId)
  
  if (error) {
    console.error(`   ❌ Error updating badge ${badgeId}:`, error)
    throw error
  }
  
  console.log(`   ✅ Updated badge ${badgeId} with new icon URL`)
}

/**
 * Ensure storage bucket exists
 */
async function ensureStorageBucket(): Promise<void> {
  console.log('📁 Ensuring badge-icons storage bucket exists...')
  
  // List buckets to check if it exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  
  if (listError) {
    console.error('❌ Error listing buckets:', listError)
    throw listError
  }
  
  const bucketExists = buckets?.some(bucket => bucket.name === 'badge-icons')
  
  if (!bucketExists) {
    console.log('   Creating badge-icons bucket...')
    const { error: createError } = await supabase.storage.createBucket('badge-icons', {
      public: true,
      fileSizeLimit: 1024 * 1024 * 5 // 5MB limit
    })
    
    if (createError) {
      console.error('❌ Error creating bucket:', createError)
      throw createError
    }
    
    console.log('   ✅ Created badge-icons bucket')
  } else {
    console.log('   ✅ badge-icons bucket already exists')
  }
}

/**
 * Get all badges that need icon processing
 */
async function getBadgesNeedingIcons(): Promise<Badge[]> {
  console.log('🔍 Fetching badges that need icon processing...')
  
  const { data, error } = await supabase
    .from('badges_powlax')
    .select('id, original_id, title, category, icon_url')
    .not('icon_url', 'is', null)
    .order('sort_order')
  
  if (error) {
    console.error('❌ Error fetching badges:', error)
    throw error
  }
  
  console.log(`   Found ${data?.length || 0} badges with icon URLs`)
  return data || []
}

/**
 * Main execution function
 */
async function main() {
  console.log('🖼️  Badge Icon Upload - Agent 2')
  console.log('================================')
  
  try {
    // Ensure storage bucket exists
    await ensureStorageBucket()
    
    // Get badges that need icon processing
    const badges = await getBadgesNeedingIcons()
    
    if (badges.length === 0) {
      console.log('ℹ️  No badges found that need icon processing')
      return
    }
    
    console.log(`📋 Processing ${badges.length} badge icons...`)
    
    let successCount = 0
    let errorCount = 0
    
    // Process each badge
    for (const badge of badges) {
      try {
        const newIconUrl = await processBadgeIcon(badge)
        
        if (newIconUrl) {
          await updateBadgeIconUrl(badge.id, newIconUrl)
          successCount++
        } else {
          errorCount++
        }
        
        // Add small delay to be respectful to origin server
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (error) {
        console.error(`❌ Error processing badge ${badge.title}:`, error)
        errorCount++
      }
    }
    
    console.log('\n📊 Upload Summary:')
    console.log(`   ✅ Successfully processed: ${successCount}`)
    console.log(`   ❌ Errors encountered: ${errorCount}`)
    console.log(`   📁 Icons stored in: badge-icons/ bucket`)
    
    if (successCount > 0) {
      console.log('\n🎉 Badge icon upload complete!')
    } else {
      console.log('\n⚠️  No icons were successfully uploaded')
    }
    
  } catch (error) {
    console.error('❌ Fatal error in badge icon upload:', error)
    process.exit(1)
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { main as uploadBadgeIcons }
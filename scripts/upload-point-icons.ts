/**
 * GamiPress Point Icons Upload Script
 * Agent 1: Database schema updates and point type setup
 * Contract: POWLAX-GAM-001
 * 
 * This script downloads point type icons from WordPress URLs
 * and uploads them to Supabase Storage for local serving.
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import * as http from 'http'

// Use service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface PointTypeIcon {
  currency: string
  display_name: string
  wordpress_id: number
  icon_url: string
  slug: string
}

// Storage bucket for point type icons
const STORAGE_BUCKET = 'point-type-icons'

async function ensureStorageBucket(): Promise<void> {
  console.log('🪣 Checking storage bucket...')
  
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET)
  
  if (!bucketExists) {
    console.log('🪣 Creating storage bucket...')
    const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
      fileSizeLimit: 5 * 1024 * 1024 // 5MB
    })
    
    if (error) {
      throw new Error(`Failed to create bucket: ${error.message}`)
    }
    console.log('✅ Storage bucket created')
  } else {
    console.log('✅ Storage bucket exists')
  }
}

async function getPointTypesWithIcons(): Promise<PointTypeIcon[]> {
  console.log('🔍 Fetching point types with icons...')
  
  const { data, error } = await supabase
    .from('powlax_points_currencies')
    .select('currency, display_name, wordpress_id, icon_url, slug')
    .not('icon_url', 'is', null)
  
  if (error) {
    throw new Error(`Failed to fetch point types: ${error.message}`)
  }
  
  const typesWithIcons = (data || []).filter(item => 
    item.icon_url && item.icon_url.startsWith('http')
  ) as PointTypeIcon[]
  
  console.log(`📊 Found ${typesWithIcons.length} point types with icon URLs`)
  return typesWithIcons
}

function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`))
        return
      }
      
      const chunks: Buffer[] = []
      
      response.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })
      
      response.on('end', () => {
        const buffer = Buffer.concat(chunks)
        resolve(buffer)
      })
      
      response.on('error', reject)
    }).on('error', reject)
  })
}

function getFileExtension(url: string): string {
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
  return match ? match[1].toLowerCase() : 'png'
}

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function uploadIcon(pointType: PointTypeIcon): Promise<string | null> {
  try {
    console.log(`⬇️  Downloading icon for: ${pointType.display_name}`)
    
    // Download the image
    const imageBuffer = await downloadImage(pointType.icon_url)
    
    // Generate filename
    const extension = getFileExtension(pointType.icon_url)
    const fileName = `${sanitizeFileName(pointType.slug)}.${extension}`
    const filePath = `point-types/${fileName}`
    
    console.log(`⬆️  Uploading to: ${filePath}`)
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, imageBuffer, {
        contentType: `image/${extension}`,
        upsert: true
      })
    
    if (error) {
      console.error(`❌ Upload failed for ${pointType.display_name}:`, error)
      return null
    }
    
    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)
    
    console.log(`✅ Uploaded: ${pointType.display_name} → ${publicUrl.publicUrl}`)
    return publicUrl.publicUrl
    
  } catch (error) {
    console.error(`❌ Error processing ${pointType.display_name}:`, error)
    return null
  }
}

async function updatePointTypeIconUrls(pointType: PointTypeIcon, newIconUrl: string): Promise<void> {
  const { error } = await supabase
    .from('powlax_points_currencies')
    .update({ 
      icon_url: newIconUrl,
      updated_at: new Date().toISOString()
    })
    .eq('currency', pointType.currency)
  
  if (error) {
    console.error(`❌ Failed to update icon URL for ${pointType.currency}:`, error)
  } else {
    console.log(`🔄 Updated icon URL for: ${pointType.display_name}`)
  }
  
  // Log to sync table
  await supabase
    .from('gamipress_sync_log')
    .insert({
      entity_type: 'point_type_icons',
      wordpress_id: pointType.wordpress_id,
      supabase_id: pointType.currency,
      action_type: 'updated',
      sync_data: {
        original_url: pointType.icon_url,
        new_url: newIconUrl,
        file_name: path.basename(newIconUrl)
      }
    })
}

async function processIconUploads(): Promise<void> {
  const pointTypes = await getPointTypesWithIcons()
  
  if (pointTypes.length === 0) {
    console.log('ℹ️  No point types with icon URLs found')
    return
  }
  
  let uploaded = 0
  let failed = 0
  
  for (const pointType of pointTypes) {
    try {
      const newIconUrl = await uploadIcon(pointType)
      
      if (newIconUrl) {
        await updatePointTypeIconUrls(pointType, newIconUrl)
        uploaded++
      } else {
        failed++
      }
      
      // Add small delay to avoid overwhelming the servers
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error(`💥 Failed to process ${pointType.display_name}:`, error)
      failed++
    }
  }
  
  console.log('\n📊 UPLOAD SUMMARY:')
  console.log(`✅ Successfully uploaded: ${uploaded}`)
  console.log(`❌ Failed uploads: ${failed}`)
  console.log(`📄 Total processed: ${uploaded + failed}`)
}

async function validateIconUploads(): Promise<void> {
  console.log('🧪 Validating icon uploads...')
  
  const { data: pointTypes } = await supabase
    .from('powlax_points_currencies')
    .select('currency, display_name, icon_url')
    .not('icon_url', 'is', null)
  
  if (!pointTypes) {
    console.log('⚠️  No point types found')
    return
  }
  
  const localIcons = pointTypes.filter(pt => 
    pt.icon_url?.includes(supabaseUrl)
  )
  
  const externalIcons = pointTypes.filter(pt => 
    pt.icon_url && !pt.icon_url.includes(supabaseUrl)
  )
  
  console.log(`✅ Local icons: ${localIcons.length}`)
  console.log(`🌐 External icons: ${externalIcons.length}`)
  
  if (localIcons.length > 0) {
    console.log('\n🎨 Sample local icons:')
    localIcons.slice(0, 3).forEach(pt => {
      console.log(`  • ${pt.display_name}: ${pt.icon_url}`)
    })
  }
  
  if (externalIcons.length > 0) {
    console.log('\n🌐 Remaining external icons:')
    externalIcons.slice(0, 3).forEach(pt => {
      console.log(`  • ${pt.display_name}: ${pt.icon_url}`)
    })
  }
}

// Create a function to manually upload a single icon (useful for testing)
async function uploadSingleIcon(currency: string): Promise<void> {
  const { data: pointType } = await supabase
    .from('powlax_points_currencies')
    .select('*')
    .eq('currency', currency)
    .single()
  
  if (!pointType || !pointType.icon_url) {
    console.log(`❌ Point type ${currency} not found or has no icon URL`)
    return
  }
  
  await ensureStorageBucket()
  
  const newIconUrl = await uploadIcon(pointType as PointTypeIcon)
  
  if (newIconUrl) {
    await updatePointTypeIconUrls(pointType as PointTypeIcon, newIconUrl)
    console.log(`✅ Successfully uploaded icon for ${currency}`)
  } else {
    console.log(`❌ Failed to upload icon for ${currency}`)
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting Point Type Icons Upload\n')
    
    // Ensure storage bucket exists
    await ensureStorageBucket()
    
    // Process icon uploads
    await processIconUploads()
    
    // Validate results
    await validateIconUploads()
    
    console.log('\n🎉 Icon upload complete!')
    
  } catch (error) {
    console.error('💥 Icon upload failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { 
  main as uploadPointIcons, 
  uploadSingleIcon,
  processIconUploads,
  validateIconUploads
}
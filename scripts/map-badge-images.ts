import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

interface BadgeImageMapping {
  badgeName: string;
  category: string;
  imageUrl: string;
  csvFile: string;
}

// Badge CSV files and their categories
const BADGE_CSV_FILES = [
  { file: 'Attack-Badges-Export-2025-July-31-1836.csv', category: 'Attack' },
  { file: 'Defense-Badges-Export-2025-July-31-1855.csv', category: 'Defense' },
  { file: 'Midfield-Badges-Export-2025-July-31-1903.csv', category: 'Midfield' },
  { file: 'Wall-Ball-Badges-Export-2025-July-31-1925.csv', category: 'Wall Ball' },
  { file: 'Solid-Start-Badges-Export-2025-July-31-1920.csv', category: 'Solid Start' },
  { file: 'Lacrosse-IQ-Badges-Export-2025-July-31-1858.csv', category: 'Lacrosse IQ' }
];

const CSV_DIR = path.join(process.cwd(), 'docs', 'Wordpress CSV\'s', 'Gamipress Gamification Exports');

async function extractImageUrlsFromCSV(csvFile: string): Promise<BadgeImageMapping[]> {
  const filePath = path.join(CSV_DIR, csvFile);
  const mappings: BadgeImageMapping[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    console.log(`📋 Processing ${csvFile}...`);
    
    // Find all image URLs in the file
    const imageUrls = content.match(/https:\/\/powlax\.com\/wp-content\/uploads\/[^\s,"|]+\.png/g) || [];
    const uniqueUrls = [...new Set(imageUrls)];
    
    console.log(`   Found ${uniqueUrls.length} unique image URLs`);
    
    // For each image URL, try to extract badge name from filename
    uniqueUrls.forEach(url => {
      const filename = url.split('/').pop() || '';
      const badgeName = filename
        .replace('.png', '')
        .replace(/-/g, ' ')
        .replace(/^\w+\d+\s/, '') // Remove prefixes like "A1 ", "D2 ", etc.
        .trim();
      
      const category = BADGE_CSV_FILES.find(f => f.file === csvFile)?.category || 'Unknown';
      
      mappings.push({
        badgeName,
        category,
        imageUrl: url,
        csvFile
      });
    });
    
  } catch (error) {
    console.error(`❌ Error processing ${csvFile}:`, error);
  }
  
  return mappings;
}

async function getAllBadgeImageMappings(): Promise<BadgeImageMapping[]> {
  console.log('🗺️ Extracting badge image URLs from CSV files...');
  console.log('================================================');
  
  const allMappings: BadgeImageMapping[] = [];
  
  for (const csvInfo of BADGE_CSV_FILES) {
    const mappings = await extractImageUrlsFromCSV(csvInfo.file);
    allMappings.push(...mappings);
  }
  
  console.log(`\n📊 Total mappings extracted: ${allMappings.length}`);
  
  return allMappings;
}

async function updateBadgesWithImages(mappings: BadgeImageMapping[]) {
  console.log('\n🖼️ Updating badge records with image URLs...');
  console.log('===========================================');
  
  // Get all badges from database
  const { data: badges, error } = await supabase
    .from('badges_powlax')
    .select('*');
  
  if (error) {
    console.error('❌ Error fetching badges:', error);
    return;
  }
  
  if (!badges || badges.length === 0) {
    console.log('❌ No badges found in database');
    return;
  }
  
  console.log(`📋 Found ${badges.length} badges in database`);
  
  let updatedCount = 0;
  
  for (const badge of badges) {
    // Try to find matching image by badge title or category
    const mapping = mappings.find(m => {
      if (!badge.title || !m.badgeName) return false;
      
      const badgeTitleNormalized = badge.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const mappingNameNormalized = m.badgeName.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Extract key part after dash (e.g., "A1 - Crease Crawler" -> "creasecrawler")
      const badgeKeyPart = badge.title.split(' - ').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
      
      return (
        mappingNameNormalized.includes(badgeKeyPart) ||
        badgeKeyPart.includes(mappingNameNormalized) ||
        mappingNameNormalized.includes(badgeTitleNormalized) ||
        badgeTitleNormalized.includes(mappingNameNormalized) ||
        (badge.category && m.category === badge.category)
      );
    });
    
    if (mapping) {
      // Update badge with image URL
      const { error: updateError } = await supabase
        .from('badges_powlax')
        .update({ icon_url: mapping.imageUrl })
        .eq('id', badge.id);
      
      if (updateError) {
        console.error(`❌ Error updating badge ${badge.name}:`, updateError);
      } else {
        console.log(`✅ Updated "${badge.title}" with image: ${mapping.imageUrl}`);
        updatedCount++;
      }
    } else {
      console.log(`⚠️ No image mapping found for badge: "${badge.title}" (${badge.category})`);
    }
  }
  
  console.log(`\n🎉 Successfully updated ${updatedCount} badges with images!`);
}

async function validateImageUrls(mappings: BadgeImageMapping[]) {
  console.log('\n🔗 Validating image URL accessibility...');
  console.log('====================================');
  
  const sampleUrls = mappings.slice(0, 5).map(m => m.imageUrl);
  
  for (const url of sampleUrls) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        console.log(`✅ ${url} - Accessible`);
      } else {
        console.log(`❌ ${url} - Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${url} - Error: ${error}`);
    }
  }
}

async function main() {
  console.log('🎖️ POWLAX Badge Image Mapping Tool');
  console.log('==================================\n');
  
  try {
    // Step 1: Extract all image mappings from CSVs
    const mappings = await getAllBadgeImageMappings();
    
    if (mappings.length === 0) {
      console.log('❌ No image mappings found. Check CSV files.');
      return;
    }
    
    // Step 2: Validate some sample URLs
    await validateImageUrls(mappings);
    
    // Step 3: Update badges in database
    await updateBadgesWithImages(mappings);
    
    // Step 4: Create mapping report
    console.log('\n📋 Mapping Summary by Category:');
    const categoryGroups = mappings.reduce((acc, mapping) => {
      acc[mapping.category] = (acc[mapping.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(categoryGroups).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} images`);
    });
    
    console.log('\n🎉 Badge image mapping completed successfully!');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

// Export for use in other scripts
export { getAllBadgeImageMappings, updateBadgesWithImages };

// Run if called directly
if (require.main === module) {
  main();
}
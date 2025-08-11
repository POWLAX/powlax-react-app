/**
 * WordPress to Supabase sync functionality
 * Handles importing WordPress drill data into Supabase database
 */

import { supabase } from './supabase';
import { wordpressAPI, WordPressDrill } from './wordpress-api';

interface SyncResult {
  success: boolean;
  imported: number;
  errors: string[];
  skipped: number;
}

export class WordPressSync {
  async syncDrillsToSupabase(options: {
    skipExisting?: boolean;
    batchSize?: number;
    dryRun?: boolean;
  } = {}): Promise<SyncResult> {
    const { skipExisting = true, batchSize = 50, dryRun = false } = options;
    
    const result: SyncResult = {
      success: false,
      imported: 0,
      errors: [],
      skipped: 0,
    };

    try {
      console.log('Starting WordPress to Supabase sync...');
      
      // Fetch all drills from WordPress
      let allDrills: WordPressDrill[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        console.log(`Fetching WordPress drills page ${page}...`);
        const drills = await wordpressAPI.fetchDrills(page, batchSize);
        
        if (drills.length === 0) {
          hasMore = false;
        } else {
          allDrills = [...allDrills, ...drills];
          page++;
        }
      }

      console.log(`Found ${allDrills.length} drills in WordPress`);

      // Process drills in batches
      for (let i = 0; i < allDrills.length; i += batchSize) {
        const batch = allDrills.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allDrills.length / batchSize)}`);

        for (const wpDrill of batch) {
          try {
            // Check if drill already exists if skipExisting is true
            if (skipExisting) {
              const { data: existing } = await supabase
                .from('powlax_drills')
                .select('id')
                .eq('wordpress_id', wpDrill.id)
                .single();

              if (existing) {
                result.skipped++;
                continue;
              }
            }

            // Transform WordPress drill to Supabase format
            const transformedDrill = this.transformDrillForSupabase(wpDrill);

            if (dryRun) {
              console.log('DRY RUN - Would import:', transformedDrill.title);
              result.imported++;
              continue;
            }

            // Insert into Supabase
            const { error } = await supabase
              .from('powlax_drills')
              .upsert(transformedDrill, { 
                onConflict: 'wordpress_id' 
              });

            if (error) {
              result.errors.push(`Error importing drill ${wpDrill.id}: ${error.message}`);
            } else {
              result.imported++;
            }

          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            result.errors.push(`Error processing drill ${wpDrill.id}: ${errorMsg}`);
          }
        }
      }

      result.success = result.errors.length < allDrills.length / 2; // Success if less than 50% errors
      
      console.log('Sync completed:', {
        imported: result.imported,
        skipped: result.skipped,
        errors: result.errors.length,
      });

      return result;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Sync failed: ${errorMsg}`);
      return result;
    }
  }

  private transformDrillForSupabase(wpDrill: WordPressDrill): any {
    // Extract lab URLs
    const labUrls = [
      wpDrill.meta._drill_lab_url_1,
      wpDrill.meta._drill_lab_url_2,
      wpDrill.meta._drill_lab_url_3,
      wpDrill.meta._drill_lab_url_4,
      wpDrill.meta._drill_lab_url_5,
    ].filter(Boolean);

    return {
      wordpress_id: wpDrill.id,
      title: wpDrill.title.rendered,
      description: this.cleanHtmlContent(wpDrill.content.rendered),
      category: wpDrill.meta._drill_category || 'Uncategorized',
      duration_minutes: wpDrill.meta._drill_duration || null,
      video_url: wpDrill.meta._drill_video_url || null,
      lab_urls: labUrls.length > 0 ? labUrls : null,
      notes: wpDrill.meta._drill_notes || null,
      equipment: this.extractEquipmentFromContent(wpDrill.content.rendered),
      age_groups: this.extractAgeGroupsFromCategory(wpDrill.meta._drill_category || ''),
      skill_level: this.extractSkillLevel(wpDrill.meta._drill_category || ''),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  private cleanHtmlContent(html: string): string {
    // Basic HTML cleanup - you might want to use a proper HTML parser
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractEquipmentFromContent(content: string): string[] {
    // Extract equipment mentions from content
    const equipment: string[] = [];
    const commonEquipment = [
      'cones', 'balls', 'goals', 'sticks', 'pinnies', 'agility ladder',
      'medicine ball', 'resistance bands', 'hurdles'
    ];

    const lowerContent = content.toLowerCase();
    commonEquipment.forEach(item => {
      if (lowerContent.includes(item)) {
        equipment.push(item);
      }
    });

    return equipment;
  }

  private extractAgeGroupsFromCategory(category: string): string[] {
    const ageGroups: string[] = [];
    const lowerCategory = category.toLowerCase();

    if (lowerCategory.includes('youth') || lowerCategory.includes('u8') || lowerCategory.includes('u10')) {
      ageGroups.push('youth');
    }
    if (lowerCategory.includes('middle') || lowerCategory.includes('u12') || lowerCategory.includes('u14')) {
      ageGroups.push('middle_school');
    }
    if (lowerCategory.includes('high') || lowerCategory.includes('u16') || lowerCategory.includes('u18')) {
      ageGroups.push('high_school');
    }
    if (lowerCategory.includes('college') || lowerCategory.includes('adult')) {
      ageGroups.push('college');
    }

    return ageGroups.length > 0 ? ageGroups : ['all'];
  }

  private extractSkillLevel(category: string): string {
    const lowerCategory = category.toLowerCase();
    
    if (lowerCategory.includes('beginner') || lowerCategory.includes('basic')) {
      return 'beginner';
    }
    if (lowerCategory.includes('advanced') || lowerCategory.includes('expert')) {
      return 'advanced';
    }
    return 'intermediate';
  }

  async testSync(limit = 5): Promise<void> {
    console.log(`Testing sync with ${limit} drills...`);
    
    try {
      const drills = await wordpressAPI.fetchDrills(1, limit);
      
      console.log('Sample transformed drills:');
      drills.forEach((drill, index) => {
        const transformed = this.transformDrillForSupabase(drill);
        console.log(`${index + 1}. ${transformed.title}`);
        console.log(`   Category: ${transformed.category}`);
        console.log(`   Duration: ${transformed.duration_minutes} minutes`);
        console.log(`   Equipment: ${transformed.equipment.join(', ')}`);
        console.log('');
      });
      
    } catch (error) {
      console.error('Test sync failed:', error);
    }
  }
}

export const wordpressSync = new WordPressSync();
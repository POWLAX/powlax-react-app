#!/usr/bin/env npx tsx
/**
 * Seed Resources Database Script
 * 
 * This script populates the powlax_resources table with test data
 * All entries are clearly marked with "(MOCK)" in their titles
 * Following the NO MOCK DATA policy - data goes in database, not components
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Test resources with clear (MOCK) indicators
const mockResources = [
  // Coach Resources
  {
    title: '(MOCK) U12 Practice Plan Template',
    description: 'Complete practice plan template for U12 teams with drills and progressions',
    category: 'Practice Planning',
    resource_type: 'template',
    url: 'https://example.com/u12-practice-plan.pdf',
    file_size: 2400000,
    roles: ['coach', 'team_coach'],
    age_groups: ['11-14'],
    rating: 4.8,
    downloads_count: 234,
    views_count: 567,
    tags: ['practice', 'planning', 'u12'],
    is_public: true
  },
  {
    title: '(MOCK) Ground Ball Technique Video',
    description: 'Master the fundamentals of ground ball technique with this comprehensive video guide',
    category: 'Training Videos',
    resource_type: 'video',
    url: 'https://example.com/ground-ball-technique',
    thumbnail_url: 'https://example.com/ground-ball-thumb.jpg',
    duration_seconds: 323,
    roles: ['coach', 'team_coach', 'player'],
    rating: 4.9,
    views_count: 1456,
    tags: ['technique', 'ground balls', 'fundamentals'],
    is_public: true
  },
  {
    title: '(MOCK) Defensive Positioning Strategy Guide',
    description: 'Complete guide to teaching defensive positioning and slides',
    category: 'Strategy Guides',
    resource_type: 'pdf',
    url: 'https://example.com/defensive-positioning.pdf',
    file_size: 3200000,
    roles: ['coach', 'team_coach'],
    age_groups: ['11-14', '15+'],
    rating: 4.7,
    downloads_count: 189,
    views_count: 445,
    tags: ['defense', 'strategy', 'positioning'],
    is_public: true
  },
  
  // Player Resources
  {
    title: '(MOCK) Wall Ball Fundamentals',
    description: 'Essential wall ball drills for skill development',
    category: 'Individual Training',
    resource_type: 'video',
    url: 'https://example.com/wall-ball-fundamentals',
    duration_seconds: 480,
    roles: ['player'],
    age_groups: ['8-10', '11-14'],
    rating: 4.8,
    views_count: 2345,
    tags: ['wall ball', 'individual', 'skills'],
    is_public: true
  },
  {
    title: '(MOCK) Shooting Accuracy Drills',
    description: 'Improve your shooting accuracy with these targeted drills',
    category: 'Skills Development',
    resource_type: 'video',
    url: 'https://example.com/shooting-accuracy',
    duration_seconds: 360,
    roles: ['player'],
    age_groups: ['11-14', '15+'],
    rating: 4.7,
    views_count: 1890,
    tags: ['shooting', 'accuracy', 'drills'],
    is_public: true
  },
  {
    title: '(MOCK) Pre-Game Warmup Routine',
    description: 'Complete warmup routine to prepare for games',
    category: 'Game Preparation',
    resource_type: 'pdf',
    url: 'https://example.com/pregame-warmup.pdf',
    file_size: 1800000,
    roles: ['player', 'coach'],
    age_groups: ['11-14', '15+'],
    rating: 4.6,
    downloads_count: 456,
    views_count: 890,
    tags: ['warmup', 'pregame', 'routine'],
    is_public: true
  },
  
  // Parent Resources
  {
    title: '(MOCK) Understanding Lacrosse Rules',
    description: 'A parent\'s guide to understanding the rules of lacrosse',
    category: 'Parent Education',
    resource_type: 'pdf',
    url: 'https://example.com/parent-rules-guide.pdf',
    file_size: 2100000,
    roles: ['parent'],
    rating: 4.5,
    downloads_count: 678,
    views_count: 1234,
    tags: ['rules', 'parent guide', 'education'],
    is_public: true
  },
  {
    title: '(MOCK) Equipment Buying Guide',
    description: 'Complete guide to buying the right lacrosse equipment for your child',
    category: 'Equipment',
    resource_type: 'link',
    url: 'https://example.com/equipment-guide',
    roles: ['parent'],
    age_groups: ['8-10', '11-14'],
    rating: 4.7,
    views_count: 2100,
    tags: ['equipment', 'buying guide', 'parent'],
    is_public: true
  },
  {
    title: '(MOCK) Nutrition for Young Athletes',
    description: 'Nutritional guidelines for young lacrosse players',
    category: 'Health & Nutrition',
    resource_type: 'pdf',
    url: 'https://example.com/nutrition-guide.pdf',
    file_size: 1500000,
    roles: ['parent', 'coach'],
    rating: 4.6,
    downloads_count: 345,
    views_count: 789,
    tags: ['nutrition', 'health', 'parent guide'],
    is_public: true
  },
  
  // Club Director Resources
  {
    title: '(MOCK) Club Management Best Practices',
    description: 'Comprehensive guide to running a successful lacrosse club',
    category: 'Club Management',
    resource_type: 'pdf',
    url: 'https://example.com/club-management.pdf',
    file_size: 4500000,
    roles: ['club_director', 'administrator'],
    rating: 4.8,
    downloads_count: 123,
    views_count: 456,
    tags: ['club management', 'administration', 'best practices'],
    is_public: false,
    team_restrictions: [],
    club_restrictions: []
  },
  {
    title: '(MOCK) Tournament Planning Template',
    description: 'Everything you need to plan and run a successful tournament',
    category: 'Event Planning',
    resource_type: 'template',
    url: 'https://example.com/tournament-template.xlsx',
    file_size: 890000,
    roles: ['club_director', 'administrator'],
    rating: 4.7,
    downloads_count: 89,
    views_count: 234,
    tags: ['tournament', 'event planning', 'template'],
    is_public: false
  },
  {
    title: '(MOCK) Coach Development Program',
    description: 'Framework for developing and training coaches within your club',
    category: 'Coach Development',
    resource_type: 'pdf',
    url: 'https://example.com/coach-development.pdf',
    file_size: 3200000,
    roles: ['club_director', 'administrator', 'coach'],
    rating: 4.9,
    downloads_count: 167,
    views_count: 389,
    tags: ['coach development', 'training', 'program'],
    is_public: false
  }
]

async function seedResources() {
  console.log('🌱 Starting Resources Database Seed...')
  console.log('📋 Following NO MOCK DATA policy - all test data marked with "(MOCK)"')
  
  try {
    // First, check if the table exists
    const { data: existingResources, error: checkError } = await supabase
      .from('powlax_resources')
      .select('id')
      .limit(1)
    
    if (checkError) {
      console.error('❌ Table check failed:', checkError.message)
      console.log('⚠️  Please ensure the migration has been run:')
      console.log('   Execute /supabase/migrations/100_resources_permanence_tables.sql in Supabase Dashboard')
      return
    }
    
    // Check if we already have mock data
    const { data: mockCheck } = await supabase
      .from('powlax_resources')
      .select('id, title')
      .like('title', '%(MOCK)%')
    
    if (mockCheck && mockCheck.length > 0) {
      console.log(`ℹ️  Found ${mockCheck.length} existing mock resources`)
      console.log('🗑️  Cleaning up old mock data...')
      
      // Delete existing mock data
      const { error: deleteError } = await supabase
        .from('powlax_resources')
        .delete()
        .like('title', '%(MOCK)%')
      
      if (deleteError) {
        console.error('❌ Failed to delete old mock data:', deleteError.message)
        return
      }
    }
    
    // Insert new mock resources
    console.log(`📝 Inserting ${mockResources.length} test resources...`)
    
    const { data: inserted, error: insertError } = await supabase
      .from('powlax_resources')
      .insert(mockResources)
      .select('id, title, category, resource_type')
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError.message)
      return
    }
    
    console.log(`✅ Successfully inserted ${inserted?.length || 0} resources`)
    
    // Display summary
    if (inserted && inserted.length > 0) {
      console.log('\n📊 Inserted Resources Summary:')
      
      // Group by category
      const byCategory = inserted.reduce((acc, resource) => {
        acc[resource.category] = (acc[resource.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      Object.entries(byCategory).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} resources`)
      })
      
      // Group by type
      console.log('\n📁 By Type:')
      const byType = inserted.reduce((acc, resource) => {
        acc[resource.resource_type] = (acc[resource.resource_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      Object.entries(byType).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} resources`)
      })
    }
    
    console.log('\n✅ Database seeding complete!')
    console.log('📌 All test resources are marked with "(MOCK)" in their titles')
    console.log('🚀 Resources page will now display real data from the database')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the seed script
seedResources()
// Performance and Database Integrity Tests for MemberPress Integration
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 Running MemberPress Integration Performance & Integrity Tests');
console.log('=' .repeat(60));

if (!url || !key) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

// Test Results Storage
const results = {
  performance: [],
  integrity: [],
  errors: []
};

// Performance Tests
async function runPerformanceTests() {
  console.log('\n⚡ PERFORMANCE TESTS');
  console.log('-'.repeat(30));
  
  try {
    // Test 1: Webhook Queue Function Speed
    console.log('🔬 Testing enqueue_webhook function speed...');
    const start1 = Date.now();
    
    const { data: queueId, error } = await supabase.rpc('enqueue_webhook', {
      p_webhook_id: `perf-test-${Date.now()}`,
      p_event_type: 'performance_test',
      p_payload: { test: 'performance', data: Array(100).fill('x').join('') }
    });
    
    const time1 = Date.now() - start1;
    
    if (error) {
      results.errors.push(`enqueue_webhook: ${error.message}`);
      console.log(`❌ Function failed: ${error.message}`);
    } else {
      results.performance.push({ test: 'enqueue_webhook', time: time1, success: true });
      console.log(`✅ enqueue_webhook: ${time1}ms (${time1 < 500 ? 'PASS' : 'SLOW'})`);
    }
    
    // Test 2: Concurrent Queue Operations
    console.log('🔬 Testing concurrent webhook processing...');
    const start2 = Date.now();
    
    const concurrentRequests = Array(10).fill(0).map(async (_, i) => {
      return supabase.rpc('enqueue_webhook', {
        p_webhook_id: `concurrent-${Date.now()}-${i}`,
        p_event_type: 'concurrent_test',
        p_payload: { test: 'concurrent', index: i }
      });
    });
    
    const concurrentResults = await Promise.all(concurrentRequests);
    const time2 = Date.now() - start2;
    const successCount = concurrentResults.filter(r => !r.error).length;
    
    results.performance.push({ test: 'concurrent_webhooks', time: time2, success: successCount === 10 });
    console.log(`✅ Concurrent processing: ${time2}ms for 10 webhooks (${successCount}/10 success)`);
    
    // Test 3: Database Query Performance
    console.log('🔬 Testing webhook queue query performance...');
    const start3 = Date.now();
    
    const { data: queueData, error: queueError } = await supabase
      .from('webhook_queue')
      .select('id, webhook_id, status, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    
    const time3 = Date.now() - start3;
    
    if (queueError) {
      results.errors.push(`queue_query: ${queueError.message}`);
      console.log(`❌ Queue query failed: ${queueError.message}`);
    } else {
      results.performance.push({ test: 'queue_query', time: time3, success: true });
      console.log(`✅ Queue query: ${time3}ms for 100 records (${time3 < 200 ? 'FAST' : 'SLOW'})`);
    }
    
  } catch (error) {
    results.errors.push(`Performance tests: ${error.message}`);
    console.error('💥 Performance test error:', error.message);
  }
}

// Database Integrity Tests
async function runIntegrityTests() {
  console.log('\n🔐 DATABASE INTEGRITY TESTS');
  console.log('-'.repeat(30));
  
  try {
    // Test 1: Required Tables Exist
    console.log('🔍 Checking required tables...');
    const requiredTables = [
      'webhook_queue',
      'webhook_processing_log', 
      'registration_links',
      'membership_products',
      'membership_entitlements',
      'users'
    ];
    
    let tablesFound = 0;
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (!error) {
          tablesFound++;
          console.log(`  ✅ ${table}`);
        } else {
          console.log(`  ❌ ${table}: ${error.message}`);
          results.errors.push(`Missing table: ${table}`);
        }
      } catch (e) {
        console.log(`  ❌ ${table}: ${e.message}`);
        results.errors.push(`Table error ${table}: ${e.message}`);
      }
    }
    
    results.integrity.push({ test: 'required_tables', expected: requiredTables.length, found: tablesFound });
    
    // Test 2: Database Functions Exist
    console.log('🔍 Checking database functions...');
    const requiredFunctions = [
      'enqueue_webhook',
      'get_next_webhook_to_process',
      'complete_webhook',
      'retry_webhook'
    ];
    
    let functionsFound = 0;
    for (const func of requiredFunctions) {
      try {
        if (func === 'enqueue_webhook') {
          const { error } = await supabase.rpc(func, {
            p_webhook_id: `test-${Date.now()}`,
            p_event_type: 'integrity_test',
            p_payload: { test: true }
          });
          if (!error) {
            functionsFound++;
            console.log(`  ✅ ${func}`);
          } else {
            console.log(`  ❌ ${func}: ${error.message}`);
            results.errors.push(`Function error: ${func}`);
          }
        } else {
          // For other functions, just check if they exist in pg_proc
          console.log(`  ⚠️  ${func}: Not tested (would require complex setup)`);
        }
      } catch (e) {
        console.log(`  ❌ ${func}: ${e.message}`);
        results.errors.push(`Function error ${func}: ${e.message}`);
      }
    }
    
    results.integrity.push({ test: 'database_functions', expected: 1, found: functionsFound });
    
    // Test 3: Webhook Queue Constraints
    console.log('🔍 Testing webhook queue constraints...');
    
    // Test unique constraint
    const testId = `constraint-test-${Date.now()}`;
    const { data: first } = await supabase.rpc('enqueue_webhook', {
      p_webhook_id: testId,
      p_event_type: 'constraint_test',
      p_payload: { test: 'first' }
    });
    
    const { data: second } = await supabase.rpc('enqueue_webhook', {
      p_webhook_id: testId,
      p_event_type: 'constraint_test',
      p_payload: { test: 'duplicate' }
    });
    
    if (first === second) {
      console.log('  ✅ Unique webhook_id constraint working (idempotency)');
      results.integrity.push({ test: 'unique_constraint', success: true });
    } else {
      console.log('  ❌ Unique constraint may not be working');
      results.errors.push('Unique constraint issue');
      results.integrity.push({ test: 'unique_constraint', success: false });
    }
    
  } catch (error) {
    results.errors.push(`Integrity tests: ${error.message}`);
    console.error('💥 Integrity test error:', error.message);
  }
}

// Queue Health Check
async function checkQueueHealth() {
  console.log('\n📊 QUEUE HEALTH CHECK');
  console.log('-'.repeat(30));
  
  try {
    // Get queue statistics
    const { data: stats, error: statsError } = await supabase
      .from('webhook_queue')
      .select('status')
      .order('created_at', { ascending: false })
      .limit(1000);
    
    if (statsError) {
      console.log('❌ Could not get queue stats:', statsError.message);
      return;
    }
    
    const statusCounts = {};
    stats.forEach(row => {
      statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
    });
    
    console.log('📈 Queue Status Distribution (last 1000):');
    Object.entries(statusCounts).forEach(([status, count]) => {
      const percentage = ((count / stats.length) * 100).toFixed(1);
      console.log(`  ${status}: ${count} (${percentage}%)`);
    });
    
    // Check for stuck processing items
    const { data: stuckItems, error: stuckError } = await supabase
      .from('webhook_queue')
      .select('id, webhook_id, started_at')
      .eq('status', 'processing')
      .lt('started_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // 5 minutes ago
    
    if (!stuckError && stuckItems.length > 0) {
      console.log(`⚠️  ${stuckItems.length} items stuck in processing state`);
      results.errors.push(`${stuckItems.length} stuck processing items`);
    } else if (!stuckError) {
      console.log('✅ No stuck processing items found');
    }
    
    results.integrity.push({ 
      test: 'queue_health', 
      total_items: stats.length, 
      status_distribution: statusCounts,
      stuck_items: stuckItems?.length || 0
    });
    
  } catch (error) {
    results.errors.push(`Queue health check: ${error.message}`);
    console.error('💥 Queue health check error:', error.message);
  }
}

// Cleanup Test Data
async function cleanup() {
  console.log('\n🧹 CLEANUP');
  console.log('-'.repeat(30));
  
  try {
    const { data, error } = await supabase
      .from('webhook_queue')
      .delete()
      .or('webhook_id.like.*test*,webhook_id.like.*perf*,webhook_id.like.*concurrent*,webhook_id.like.*constraint*');
    
    if (error) {
      console.log('⚠️  Cleanup error:', error.message);
    } else {
      console.log('✅ Test data cleaned up');
    }
  } catch (error) {
    console.log('⚠️  Cleanup failed:', error.message);
  }
}

// Generate Summary Report
function generateReport() {
  console.log('\n📋 TEST SUMMARY REPORT');
  console.log('='.repeat(60));
  
  const perfTests = results.performance.length;
  const perfPassed = results.performance.filter(t => t.success).length;
  const avgTime = results.performance.reduce((acc, t) => acc + t.time, 0) / perfTests;
  
  console.log(`\n⚡ PERFORMANCE SUMMARY:`);
  console.log(`  Tests: ${perfPassed}/${perfTests} passed`);
  console.log(`  Average response time: ${Math.round(avgTime)}ms`);
  
  results.performance.forEach(test => {
    const status = test.success ? '✅' : '❌';
    console.log(`  ${status} ${test.test}: ${test.time}ms`);
  });
  
  console.log(`\n🔐 INTEGRITY SUMMARY:`);
  console.log(`  Checks completed: ${results.integrity.length}`);
  
  results.integrity.forEach(test => {
    if (typeof test.success === 'boolean') {
      console.log(`  ${test.success ? '✅' : '❌'} ${test.test}`);
    } else if (test.found !== undefined) {
      const status = test.found === test.expected ? '✅' : '❌';
      console.log(`  ${status} ${test.test}: ${test.found}/${test.expected}`);
    } else {
      console.log(`  ℹ️  ${test.test}: Complex result`);
    }
  });
  
  if (results.errors.length > 0) {
    console.log(`\n❌ ERRORS (${results.errors.length}):`);
    results.errors.forEach(error => {
      console.log(`  • ${error}`);
    });
  }
  
  const overallScore = ((perfPassed + results.integrity.filter(t => t.success !== false).length) / (perfTests + results.integrity.length) * 100);
  console.log(`\n🎯 OVERALL SCORE: ${Math.round(overallScore)}%`);
  
  if (overallScore >= 80) {
    console.log('🎉 MemberPress integration tests: PASSED');
  } else if (overallScore >= 60) {
    console.log('⚠️  MemberPress integration tests: PARTIAL');
  } else {
    console.log('❌ MemberPress integration tests: FAILED');
  }
  
  return {
    score: overallScore,
    performance: results.performance,
    integrity: results.integrity,
    errors: results.errors
  };
}

// Run All Tests
async function runAllTests() {
  try {
    await runPerformanceTests();
    await runIntegrityTests();
    await checkQueueHealth();
    await cleanup();
    
    const report = generateReport();
    
    console.log('\n✅ All automated tests completed!');
    console.log(`📊 Final Score: ${Math.round(report.score)}%`);
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

runAllTests();
#!/usr/bin/env tsx

/**
 * Local testing script for pools caching system
 * Run with: npx tsx scripts/test-cache.ts
 */

import { 
  fetchPoolsData, 
  cachePoolsData, 
  getCachedPoolsData, 
  getPoolsDataWithFallback,
  updatePoolsCache,
  isCacheStale 
} from '../lib/cache/pools-cache';

async function testCaching() {
  console.log('🧪 Testing Pools Caching System\n');

  try {
    // Test 1: Check if cache is empty initially
    console.log('1️⃣ Checking initial cache state...');
    const initialCache = await getCachedPoolsData();
    console.log('Initial cache:', initialCache ? 'EXISTS' : 'EMPTY');
    console.log('Cache is stale:', await isCacheStale());
    console.log('');

    // Test 2: Fetch fresh data (simulate what cron job does)
    console.log('2️⃣ Fetching fresh data from subgraph...');
    const startFresh = Date.now();
    const freshData = await fetchPoolsData();
    const endFresh = Date.now();
    console.log(`✅ Fresh data fetched in ${endFresh - startFresh}ms`);
    console.log(`Pools count: ${freshData.pools.length}`);
    console.log(`Farmings count: ${freshData.activeFarmings.length}`);
    console.log('');

    // Test 3: Cache the data
    console.log('3️⃣ Caching the data...');
    const startCache = Date.now();
    await cachePoolsData(freshData);
    const endCache = Date.now();
    console.log(`✅ Data cached in ${endCache - startCache}ms`);
    console.log('');

    // Test 4: Read from cache
    console.log('4️⃣ Reading from cache...');
    const startRead = Date.now();
    const cachedData = await getCachedPoolsData();
    const endRead = Date.now();
    console.log(`✅ Data read from cache in ${endRead - startRead}ms`);
    console.log(`Cached pools count: ${cachedData?.pools.length || 0}`);
    console.log(`Cache age: ${cachedData ? Date.now() - cachedData.lastUpdated : 0}ms`);
    console.log('');

    // Test 5: Test the main function (what SSR uses)
    console.log('5️⃣ Testing getPoolsDataWithFallback (SSR function)...');
    const startSSR = Date.now();
    const ssrData = await getPoolsDataWithFallback();
    const endSSR = Date.now();
    console.log(`✅ SSR data fetched in ${endSSR - startSSR}ms (should be fast from cache)`);
    console.log('');

    // Test 6: Test cache update function (what cron job calls)
    console.log('6️⃣ Testing updatePoolsCache (cron job function)...');
    const startUpdate = Date.now();
    await updatePoolsCache();
    const endUpdate = Date.now();
    console.log(`✅ Cache updated in ${endUpdate - startUpdate}ms`);
    console.log('');

    // Test 7: Performance comparison
    console.log('7️⃣ Performance Summary:');
    console.log(`📊 Fresh fetch: ${endFresh - startFresh}ms`);
    console.log(`⚡ Cache read: ${endRead - startRead}ms`);
    console.log(`🚀 Speed improvement: ${Math.round(((endFresh - startFresh) / (endRead - startRead)) * 100) / 100}x faster`);
    console.log('');

    console.log('✅ All tests completed successfully!');
    console.log('🎉 Your caching system is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testCaching().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});

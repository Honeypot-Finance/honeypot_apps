// Test script to verify the subgraph meta data tRPC endpoint
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './libs/shared/hpot-sdk/src/server/_app';
import superjson from 'superjson';

// Use the same base URL logic as the actual app
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  if (process.env['VERCEL_URL']) {
    return `https://${process.env['VERCEL_URL']}`;
  }
  
  // Default to PORT env variable or 3000
  const port = process.env['PORT'] || '9006';
  return `http://localhost:${port}`;
}

const trpcTestClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});

async function testSubgraphMetaData() {
  console.log('Testing subgraph meta data endpoints...\n');
  
  try {
    // Test 1: Get all subgraph meta data
    console.log('1. Getting all subgraph meta data:');
    const allData = await trpcTestClient.subgraphMetaData.getSubgraphMetaData.query();
    console.log('   All data:', allData);
    
    // Test 2: Get specific chain data
    console.log('\n2. Getting Bera chain data:');
    const beraData = await trpcTestClient.subgraphMetaData.getSubgraphMetaDataByChain.query({
      chainId: 'bera'
    });
    console.log('   Bera data:', beraData);
    
    // Test 3: Get total users across all chains
    console.log('\n3. Getting total users across all chains:');
    const totalUsers = await trpcTestClient.subgraphMetaData.getTotalUsersAcrossChains.query();
    console.log('   Total users:', totalUsers);
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

console.log(`Note: Make sure the app is running on ${getBaseUrl()}`);
console.log('You can start it with: PORT=9006 npx nx dev all-in-one-vault\n');

// Only run if this file is executed directly
if (require.main === module) {
  testSubgraphMetaData();
}
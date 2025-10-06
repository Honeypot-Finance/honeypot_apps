import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import BigNumber from 'bignumber.js';
import { mockCollections, createMockApolloProvider } from './leaderboard-graphql-mocks';

// Mock data interfaces based on the actual leaderboard data structures
export interface MockAccount {
  id: string;
  walletAddress: string;
  totalSpend: number;
  swapCount: number;
  poolHoldingCount?: number;
  memeTokenCount?: number;
  holdingPoolCount?: string;
  memeTokenHoldingCount?: string;
  platformTxCount: string;
  participateCount: number;
  totalSpendUSD: string;
  totalDepositPot2pumpUSD: string;
  pot2PumpLaunchCount: number;
  lastActive: string;
  transaction: { timestamp: string }[];
}

export interface MockStats {
  totalMemeCreated?: { title: string; value: number };
  totalSuccessedMeme?: { title: string; value: number };
  totalDepositedUSD?: { title: string; value: string };
  totalTrades?: { title: string; value: string };
  totalVolume?: { title: string; value: string };
  tvl?: { title: string; value: string };
  totalFees?: { title: string; value: string };
}

export interface MockFactoryData {
  factories: Array<{
    txCount: string;
    totalVolumeUSD: string;
    totalVolumeMatic: string;
    totalValueLockedUSD: string;
    totalValueLockedMatic: string;
    untrackedVolumeUSD: string;
    totalValueLockedUSDUntracked: string;
    totalFeesUSD: string;
    totalMemeCreated?: string;
    totalSuccessedMeme?: string;
    totalDepositedUSD?: string;
  }>;
}

export interface MockAccountsQueryData {
  accounts: Array<{
    id: string;
    swapCount: string;
    holdingPoolCount: string;
    memeTokenHoldingCount: string;
    platformTxCount: string;
    participateCount: string;
    totalSpendUSD: string;
    totalDepositPot2pumpUSD: string;
    pot2PumpLaunchCount: string;
    transaction: { timestamp: string }[];
  }>;
}

export interface MockPoolsData {
  pools: Array<{
    id: string;
    totalValueLockedUSD: string;
  }>;
}

// Mock data factory functions
export function createMockAccount(overrides: Partial<MockAccount> = {}): MockAccount {
  const baseAccount = {
    id: '0x1234567890123456789012345678901234567890',
    walletAddress: '0x1234567890123456789012345678901234567890',
    totalSpend: 1000.50,
    swapCount: 25,
    poolHoldingCount: 5,
    memeTokenCount: 3,
    holdingPoolCount: '5',
    memeTokenHoldingCount: '3',
    platformTxCount: '100',
    participateCount: 10,
    totalSpendUSD: '1000.50',
    totalDepositPot2pumpUSD: '5000.00',
    pot2PumpLaunchCount: 3,
    lastActive: '12/25/2024, 10:30:00 AM',
    transaction: [{ timestamp: '1735123800' }],
  };

  return { ...baseAccount, ...overrides };
}

export function createMockStats(type: 'pot2pump' | 'wasabee' | 'dreampad' = 'pot2pump', overrides: Partial<MockStats> = {}): MockStats {
  const baseStats = {
    pot2pump: {
      totalMemeCreated: { title: 'Total Meme Created', value: 150 },
      totalSuccessedMeme: { title: 'Total Successed Meme', value: 45 },
      totalDepositedUSD: { title: 'Total Deposited USD', value: '1500000.00' },
    },
    wasabee: {
      totalTrades: { title: 'Total Trades', value: '25000' },
      totalVolume: { title: 'Total Volume', value: '5000000.00' },
      tvl: { title: 'TVL', value: '2500000.00' },
      totalFees: { title: 'Total Fees', value: '15000.00' },
    },
    dreampad: {
      totalMemeCreated: { title: 'Total Projects', value: 50 },
      totalSuccessedMeme: { title: 'Successful Projects', value: 20 },
      totalDepositedUSD: { title: 'Total Raised', value: '750000.00' },
    },
  };

  return { ...baseStats[type], ...overrides };
}

export function generateLargeDataset(size: number): MockAccount[] {
  return Array.from({ length: size }, (_, index) => 
    createMockAccount({
      id: `0x${index.toString(16).padStart(40, '0')}`,
      walletAddress: `0x${index.toString(16).padStart(40, '0')}`,
      totalSpend: Math.random() * 10000,
      swapCount: Math.floor(Math.random() * 1000),
      participateCount: Math.floor(Math.random() * 100),
      pot2PumpLaunchCount: Math.floor(Math.random() * 10),
      totalSpendUSD: (Math.random() * 10000).toFixed(2),
      totalDepositPot2pumpUSD: (Math.random() * 50000).toFixed(2),
    })
  );
}

export function createMockFactoryData(type: 'pot2pump' | 'wasabee' = 'pot2pump', overrides: Partial<MockFactoryData['factories'][0]> = {}): MockFactoryData {
  const baseFactory = {
    txCount: '25000',
    totalVolumeUSD: '5000000.00',
    totalVolumeMatic: '2500000.00',
    totalValueLockedUSD: '1500000.00',
    totalValueLockedMatic: '750000.00',
    untrackedVolumeUSD: '100000.00',
    totalValueLockedUSDUntracked: '50000.00',
    totalFeesUSD: '15000.00',
  };

  if (type === 'pot2pump') {
    Object.assign(baseFactory, {
      totalMemeCreated: '150',
      totalSuccessedMeme: '45',
      totalDepositedUSD: '1500000.00',
    });
  }

  return {
    factories: [{ ...baseFactory, ...overrides }],
  };
}

export function createMockAccountsQueryData(accounts: MockAccount[] = []): MockAccountsQueryData {
  if (accounts.length === 0) {
    accounts = [createMockAccount()];
  }

  return {
    accounts: accounts.map(account => ({
      id: account.id,
      swapCount: account.swapCount.toString(),
      holdingPoolCount: account.holdingPoolCount || '0',
      memeTokenHoldingCount: account.memeTokenHoldingCount || '0',
      platformTxCount: account.platformTxCount,
      participateCount: account.participateCount.toString(),
      totalSpendUSD: account.totalSpendUSD,
      totalDepositPot2pumpUSD: account.totalDepositPot2pumpUSD,
      pot2PumpLaunchCount: account.pot2PumpLaunchCount.toString(),
      transaction: account.transaction,
    })),
  };
}

export function createMockPoolsData(poolCount: number = 5, overrides: Partial<MockPoolsData['pools'][0]> = {}): MockPoolsData {
  return {
    pools: Array.from({ length: poolCount }, (_, index) => ({
      id: `pool-${index}`,
      totalValueLockedUSD: (Math.random() * 100000).toFixed(2),
      ...overrides,
    })),
  };
}

// Test data generators for different scenarios
export const testDataScenarios = {
  valid: {
    accounts: [
      createMockAccount(),
      createMockAccount({
        id: '0x2345678901234567890123456789012345678901',
        walletAddress: '0x2345678901234567890123456789012345678901',
        totalSpend: 2500.75,
        swapCount: 50,
        participateCount: 20,
      }),
    ],
    stats: createMockStats('pot2pump'),
    factoryData: createMockFactoryData('pot2pump'),
  },
  
  empty: {
    accounts: [],
    stats: {},
    factoryData: { factories: [] },
  },
  
  malformed: {
    accounts: [
      {
        id: 'invalid-address',
        walletAddress: 'invalid-address',
        totalSpend: NaN,
        swapCount: -1,
        participateCount: null as any,
        totalSpendUSD: 'not-a-number',
        totalDepositPot2pumpUSD: '',
        pot2PumpLaunchCount: undefined as any,
        lastActive: 'invalid-date',
        transaction: [],
        platformTxCount: 'invalid',
        holdingPoolCount: 'invalid',
        memeTokenHoldingCount: 'invalid',
      },
    ],
    stats: {
      totalMemeCreated: { title: '', value: NaN },
      totalSuccessedMeme: { title: '', value: -1 },
      totalDepositedUSD: { title: '', value: 'invalid' },
    },
    factoryData: {
      factories: [{
        txCount: 'invalid',
        totalVolumeUSD: 'not-a-number',
        totalVolumeMatic: '',
        totalValueLockedUSD: 'NaN',
        totalValueLockedMatic: 'undefined',
        untrackedVolumeUSD: '-1',
        totalValueLockedUSDUntracked: 'null',
        totalFeesUSD: 'infinity',
      }],
    },
  },
  
  large: {
    accounts: generateLargeDataset(1000),
    stats: createMockStats('pot2pump'),
    factoryData: createMockFactoryData('pot2pump'),
  },
};

// Edge case data generators
export function createEdgeCaseData() {
  return {
    zeroValues: createMockAccount({
      totalSpend: 0,
      swapCount: 0,
      participateCount: 0,
      pot2PumpLaunchCount: 0,
      totalSpendUSD: '0',
      totalDepositPot2pumpUSD: '0',
    }),
    
    extremelyLargeValues: createMockAccount({
      totalSpend: Number.MAX_SAFE_INTEGER,
      swapCount: 999999999,
      participateCount: 999999999,
      pot2PumpLaunchCount: 999999999,
      totalSpendUSD: '999999999999.99',
      totalDepositPot2pumpUSD: '999999999999.99',
    }),
    
    negativeValues: createMockAccount({
      totalSpend: -1000,
      swapCount: -1,
      participateCount: -1,
      pot2PumpLaunchCount: -1,
      totalSpendUSD: '-1000.00',
      totalDepositPot2pumpUSD: '-5000.00',
    }),
    
    nullUndefinedValues: createMockAccount({
      totalSpend: null as any,
      swapCount: undefined as any,
      participateCount: null as any,
      pot2PumpLaunchCount: undefined as any,
      totalSpendUSD: null as any,
      totalDepositPot2pumpUSD: undefined as any,
      lastActive: null as any,
    }),
  };
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  apolloMocks?: MockedResponse[];
  mockScenario?: keyof typeof mockCollections;
  apolloProps?: {
    addTypename?: boolean;
    defaultOptions?: any;
    cache?: any;
  };
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult {
  const { 
    apolloMocks, 
    mockScenario = 'successful',
    apolloProps = {},
    ...renderOptions 
  } = options;

  // Use provided mocks or default to scenario-based mocks
  const mocks = apolloMocks || createMockApolloProvider(mockScenario);
  const { addTypename = false, ...otherApolloProps } = apolloProps;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MockedProvider 
        mocks={mocks} 
        addTypename={addTypename}
        {...otherApolloProps}
      >
        {children}
      </MockedProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Utility functions for testing
export function waitForNextTick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

export function createMockError(message: string = 'Test error', code?: string) {
  const error = new Error(message);
  if (code) {
    (error as any).code = code;
  }
  return error;
}

export function createMockNetworkError() {
  return createMockError('Network error', 'NETWORK_ERROR');
}

export function createMockGraphQLError(message: string = 'GraphQL error') {
  return {
    message,
    locations: [{ line: 1, column: 1 }],
    path: ['test'],
  };
}

// Performance testing utilities
export function measurePerformance<T>(fn: () => T): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return { result, duration: end - start };
}

export function createLargeDatasetForPerformanceTesting(size: number = 10000) {
  return generateLargeDataset(size);
}

// Memory testing utilities
export function getMemoryUsage() {
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }
  return null;
}

export function forceGarbageCollection() {
  if (typeof global !== 'undefined' && global.gc) {
    global.gc();
  }
}

// Debounce testing utilities
export function createMockDebounce() {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return {
    debounce: (fn: Function, delay: number) => {
      return (...args: any[]) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => fn(...args), delay);
      };
    },
    flush: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
  };
}

// BigNumber testing utilities
export function createMockBigNumber(value: string | number = '0') {
  return new BigNumber(value);
}

export function validateBigNumberPrecision(value: BigNumber | null, expectedPrecision: number): boolean {
  if (!value) return false;
  return value.decimalPlaces() <= expectedPrecision;
}

// GraphQL testing utilities
export function createMockGraphQLProvider(mocks: MockedResponse[]) {
  return function MockProvider({ children }: { children: React.ReactNode }) {
    return (
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    );
  };
}

export function waitForGraphQLResponse(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

export function createMockQueryResult<T>(data: T, loading: boolean = false, error?: Error) {
  return {
    data: loading ? undefined : data,
    loading,
    error,
    refetch: jest.fn(),
    fetchMore: jest.fn(),
    updateQuery: jest.fn(),
    startPolling: jest.fn(),
    stopPolling: jest.fn(),
    subscribeToMore: jest.fn(),
    variables: {},
    networkStatus: loading ? 1 : 7,
    called: true,
  };
}

export function createMockMutationResult<T>(data?: T, loading: boolean = false, error?: Error) {
  return [
    jest.fn().mockResolvedValue({ data }),
    {
      data: loading ? undefined : data,
      loading,
      error,
      called: false,
      reset: jest.fn(),
    },
  ];
}

// Apollo Client cache testing utilities
export function createMockApolloCache() {
  return {
    readQuery: jest.fn(),
    writeQuery: jest.fn(),
    readFragment: jest.fn(),
    writeFragment: jest.fn(),
    identify: jest.fn(),
    evict: jest.fn(),
    gc: jest.fn(),
    modify: jest.fn(),
    reset: jest.fn(),
  };
}

// GraphQL error testing utilities
export function expectGraphQLError(result: any, expectedMessage?: string) {
  expect(result.error).toBeDefined();
  if (expectedMessage) {
    expect(result.error.message).toContain(expectedMessage);
  }
}

export function expectGraphQLLoading(result: any) {
  expect(result.loading).toBe(true);
  expect(result.data).toBeUndefined();
}

export function expectGraphQLSuccess(result: any, expectedData?: any) {
  expect(result.loading).toBe(false);
  expect(result.error).toBeUndefined();
  expect(result.data).toBeDefined();
  if (expectedData) {
    expect(result.data).toEqual(expectedData);
  }
}

// Mock GraphQL subscription utilities
export function createMockSubscription<T>(data: T) {
  return {
    subscribe: jest.fn().mockReturnValue({
      next: jest.fn(),
      error: jest.fn(),
      complete: jest.fn(),
      unsubscribe: jest.fn(),
    }),
  };
}

// Network status testing utilities
export function simulateNetworkError() {
  return new Error('Network request failed');
}

export function simulateGraphQLError(message: string = 'GraphQL error') {
  return {
    graphQLErrors: [{ message }],
    networkError: null,
  };
}

export function simulateTimeoutError() {
  return new Error('Request timeout');
}
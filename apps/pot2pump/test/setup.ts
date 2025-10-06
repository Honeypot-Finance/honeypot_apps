import '@testing-library/jest-dom';
import React from 'react';

// Mock NextUI theme
jest.mock('@nextui-org/theme', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

// Mock NextUI components globally
jest.mock('@nextui-org/react', () => {
  const mockReact = require('react');
  return {
    Button: ({ children, onClick, isLoading, isDisabled, ...props }: any) => 
      mockReact.createElement('button', {
        onClick,
        disabled: isDisabled,
        'data-loading': isLoading,
        ...props
      }, children),
    Input: ({ value, onChange, placeholder, ...props }: any) => 
      mockReact.createElement('input', {
        value,
        onChange,
        placeholder,
        ...props
      }),
    Select: ({ children, onSelectionChange, defaultSelectedKeys, ...props }: any) => 
      mockReact.createElement('select', {
        onChange: (e: any) => onSelectionChange?.({ currentKey: e.target.value }),
        defaultValue: defaultSelectedKeys?.[0],
        ...props
      }, children),
    SelectItem: ({ children, value, ...props }: any) => 
      mockReact.createElement('option', { value, ...props }, children),
    Modal: ({ children, isOpen, onClose, ...props }: any) => 
      isOpen ? mockReact.createElement('div', { 'data-testid': 'modal', ...props }, children) : null,
    ModalContent: ({ children, ...props }: any) => 
      mockReact.createElement('div', { 'data-testid': 'modal-content', ...props }, children),
    ModalHeader: ({ children, ...props }: any) => 
      mockReact.createElement('div', { 'data-testid': 'modal-header', ...props }, children),
    ModalBody: ({ children, ...props }: any) => 
      mockReact.createElement('div', { 'data-testid': 'modal-body', ...props }, children),
    ModalFooter: ({ children, ...props }: any) => 
      mockReact.createElement('div', { 'data-testid': 'modal-footer', ...props }, children),
    Tooltip: ({ children, content, ...props }: any) => 
      mockReact.createElement('div', { title: content, ...props }, children),
    Pagination: ({ page, total, onChange, showControls, ...props }: any) => 
      mockReact.createElement('div', {
        'data-testid': 'pagination',
        'data-page': page,
        'data-total': total,
        'data-show-controls': showControls,
        ...props
      }),
    Accordion: ({ children, ...props }: any) => 
      mockReact.createElement('div', { 'data-testid': 'accordion', ...props }, children),
    AccordionItem: ({ children, title, ...props }: any) => 
      mockReact.createElement('div', { 'data-testid': 'accordion-item', 'data-title': title, ...props }, children),
    Card: ({ children, ...props }: any) => 
      mockReact.createElement('div', { 'data-testid': 'card', ...props }, children),
    CardBody: ({ children, ...props }: any) => 
      mockReact.createElement('div', { 'data-testid': 'card-body', ...props }, children),
    CardHeader: ({ children, ...props }: any) => 
      mockReact.createElement('div', { 'data-testid': 'card-header', ...props }, children),
    Spinner: (props: any) => 
      mockReact.createElement('div', { 'data-testid': 'loading-spinner', ...props }, 'Loading...'),
    Progress: ({ value, label, ...props }: any) => 
      mockReact.createElement('div', {
        'data-testid': 'progress',
        role: 'progressbar',
        'aria-valuenow': value,
        ...props
      }, label),
    cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => ({ ...props, children }),
    button: ({ children, ...props }: any) => ({ ...props, children }),
    span: ({ children, ...props }: any) => ({ ...props, children }),
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
  ToastContainer: () => null,
}));

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    const mockReact = require('react');
    return mockReact.createElement('a', { href, ...props }, children);
  };
});

jest.mock('next/image', () => {
  return ({ src, alt, ...props }: any) => {
    const mockReact = require('react');
    return mockReact.createElement('img', { src, alt, ...props });
  };
});

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/test',
    query: {},
    asPath: '/test',
  }),
}));

// Mock @honeypot/shared modules
jest.mock('@honeypot/shared', () => ({
  Token: {
    getToken: jest.fn(),
  },
  IndexerPaginationState: jest.fn().mockImplementation((args) => ({
    namespace: args?.namespace || '',
    pageInfo: {
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: '',
      endCursor: '',
    },
    filter: args?.filter || {},
    isInit: false,
    isLoading: false,
    pageItems: {
      value: [],
      setValue: jest.fn(),
    },
    LoadNextPageFunction: args?.LoadNextPageFunction || jest.fn(),
    updateFilter: jest.fn(),
    loadNextPage: jest.fn(),
    ...args,
  })),
  PageInfo: jest.fn(),
  OldIndexerPaginationState: jest.fn().mockImplementation((args) => ({
    namespace: args?.namespace || '',
    pageInfo: {
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: '',
      endCursor: '',
    },
    filter: args?.filter || {},
    isInit: false,
    isLoading: false,
    pageItems: {
      value: [],
      setValue: jest.fn(),
    },
    LoadNextPageFunction: jest.fn(),
    updateFilter: jest.fn(),
    loadNextPage: jest.fn(),
    ...args,
  })),
  ValueState: jest.fn().mockImplementation((config) => {
    const state = {
      value: config?.value || null,
      loading: false,
      error: null,
      setValue: jest.fn((newValue) => {
        state.value = newValue;
      }),
    };
    return state;
  }),
  AsyncState: jest.fn().mockImplementation(function(func) {
    const state = {
      call: jest.fn().mockImplementation(async (...args) => {
        try {
          state.loading = true;
          const result = await func?.(...args);
          state.value = result;
          state.loading = false;
          return result;
        } catch (error) {
          state.error = error;
          state.loading = false;
          throw error;
        }
      }),
      loading: false,
      error: null,
      value: null,
      isInit: false,
      setValue: jest.fn((newValue) => {
        state.value = newValue;
      }),
      setLoading: jest.fn((loading) => {
        state.loading = loading;
      }),
      setError: jest.fn((error) => {
        state.error = error;
      }),
    };
    return state;
  }),
  getSubgraphClientByChainId: jest.fn(),
}));

// Mock superjson
jest.mock('superjson', () => ({
  default: {
    stringify: jest.fn((obj) => JSON.stringify(obj)),
    parse: jest.fn((str) => JSON.parse(str)),
  },
}));

// Mock viem
jest.mock('viem', () => ({
  getContract: jest.fn(),
  zeroAddress: '0x0000000000000000000000000000000000000000',
  parseEther: jest.fn(),
  formatEther: jest.fn(),
}));

// Mock TRPC
jest.mock('@trpc/next', () => ({
  createTRPCNext: jest.fn(),
}));

jest.mock('@trpc/react-query', () => ({
  createTRPCReact: jest.fn(() => ({
    createClient: jest.fn(() => ({
      query: jest.fn(),
      mutate: jest.fn(),
    })),
  })),
}));

// Mock Rainbow Kit
jest.mock('@rainbow-me/rainbowkit', () => {
  const mockReact = require('react');
  return {
    useConnectModal: jest.fn(() => ({
      openConnectModal: jest.fn(),
    })),
    ConnectButton: ({ children }: any) => 
      mockReact.createElement('button', { 'data-testid': 'connect-button' }, children || 'Connect Wallet'),
  };
});

// Mock Wagmi
jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
  })),
  useConnect: jest.fn(() => ({
    connect: jest.fn(),
    connectors: [],
  })),
  useConnectors: jest.fn(() => []),
}));

// Mock wallet
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    account: '0x1234567890123456789012345678901234567890',
    currentChainId: 80084,
    isInit: true,
    currentChain: {
      nativeToken: {
        address: '0xnative',
        symbol: 'ETH',
        decimals: 18,
      },
      raisedTokenData: [
        {
          address: '0xhoney',
          symbol: 'HONEY',
          amount: BigInt('1000000000000000000000'),
        },
        {
          address: '0xusdc',
          symbol: 'USDC',
          amount: BigInt('5000000000'),
        },
      ],
      validatedFtoAddresses: [],
    },
    contracts: {
      memeFactory: {
        createPair: { call: jest.fn() },
      },
      memeFacade: {
        deposit: { call: jest.fn() },
        claimLP: { call: jest.fn() },
      },
    },
  },
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    reload: jest.fn(),
    assign: jest.fn(),
  },
  writable: true,
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock problematic JSX files
jest.mock('@/lib/algebra/utils/common/formatAmount', () => ({
  formatAmountWithAlphabetSymbol: jest.fn((amount) => `${amount} formatted`),
}));



// Mock PoweredByAlgebra component to avoid PNG import issues
jest.mock('@pot2pump/components/algebra/common/PoweredByAlgebra', () => {
  const mockReact = require('react');
  return {
    __esModule: true,
    default: ({ className }: { className?: string }) => 
      mockReact.createElement('div', { className, 'data-testid': 'powered-by-algebra' }, 'Powered by Algebra'),
    PoweredByAlphaKek: ({ className }: { className?: string }) => 
      mockReact.createElement('div', { className, 'data-testid': 'powered-by-alphakek' }, 'Powered by AlphaKek'),
  };
});

// Mock other components that might import images
jest.mock('@pot2pump/components/algebra/swap/V3SwapCard', () => {
  const mockReact = require('react');
  return {
    V3SwapCard: (props: any) => 
      mockReact.createElement('div', { 'data-testid': 'v3-swap-card', ...props }, 'V3 Swap Card'),
  };
});

jest.mock('@pot2pump/components/SwapCard/MemeSwap', () => {
  const mockReact = require('react');
  return {
    MemeSwap: (props: any) => 
      mockReact.createElement('div', { 'data-testid': 'meme-swap', ...props }, 'Meme Swap'),
  };
});

jest.mock('@pot2pump/components/MemeWarBanner/Pot2PumpTracker', () => {
  const mockReact = require('react');
  return {
    Pot2PumpTracker: (props: any) => 
      mockReact.createElement('div', { 'data-testid': 'pot2pump-tracker', ...props }, 'Pot2Pump Tracker'),
  };
});

// Mock OptionsDropdown for LaunchCard
jest.mock('@pot2pump/components/OptionsDropdown/OptionsDropdown', () => {
  const mockReact = require('react');
  return {
    OptionsDropdown: (props: any) => 
      mockReact.createElement('div', { 'data-testid': 'options-dropdown', ...props }, 'Options'),
    optionsPresets: {
      copy: jest.fn((config) => ({
        ...config,
        onClick: jest.fn(),
      })),
      importTokenToWallet: jest.fn((config) => ({
        ...config,
        onClick: jest.fn(),
      })),
      share: jest.fn((config) => ({
        ...config,
        onClick: jest.fn(),
      })),
      viewOnExplorer: jest.fn((config) => ({
        ...config,
        onClick: jest.fn(),
      })),
    },
  };
});

// Mock crypto for UUID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid-' + Math.random().toString(36).substring(2, 11),
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
});

// Mock TextEncoder/TextDecoder for viem
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Suppress console warnings in tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.warn = (...args: any[]) => {
    // Suppress specific warnings that are expected in tests
    const message = args[0];
    if (
      typeof message === 'string' && 
      (message.includes('React.createElement: type is invalid') ||
       message.includes('Warning: Failed prop type') ||
       message.includes('Warning: Each child in a list'))
    ) {
      return;
    }
    originalConsoleWarn(...args);
  };

  console.error = (...args: any[]) => {
    // Suppress specific errors that are expected in tests
    const message = args[0];
    if (
      typeof message === 'string' && 
      (message.includes('Warning: ReactDOM.render is no longer supported') ||
       message.includes('Error: Uncaught [TypeError: Cannot read properties'))
    ) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

// Global test utilities
export const createMockToken = (overrides = {}) => ({
  address: '0x1234567890123456789012345678901234567890',
  name: 'Mock Token',
  symbol: 'MOCK',
  decimals: 18,
  balance: '1000000000000000000000', // 1000 tokens
  balanceFormatted: '1,000.00',
  derivedUSD: '1.50',
  logoURI: '/mock-logo.png',
  isNative: false,
  init: jest.fn(),
  getBalance: jest.fn(),
  approveIfNoAllowance: jest.fn(),
  ...overrides,
});

export const createMockPair = (overrides = {}) => ({
  address: '0xpair1234567890123456789012345678901234567890',
  name: 'Mock Pair',
  projectName: 'Mock Project',
  description: 'Mock description',
  logoUrl: '/mock-logo.png',
  bannerUrl: '/mock-banner.png',
  state: 3, // Processing
  canClaimLP: false,
  canRefund: false,
  depositedRaisedToken: '1000',
  depositedLaunchedToken: '1000000',
  participantsCount: '25',
  endTime: '1640995200',
  launchedToken: createMockToken({ name: 'Launched Token', symbol: 'LT' }),
  raiseToken: createMockToken({ name: 'Raise Token', symbol: 'RT' }),
  deposit: { call: jest.fn(), loading: false },
  refund: { call: jest.fn(), loading: false },
  claimLP: { call: jest.fn(), loading: false },
  getDepositedRaisedToken: jest.fn(),
  ...overrides,
});

export const waitForLoadingToFinish = async () => {
  const { waitFor, screen } = await import('@testing-library/react');
  return waitFor(() => {
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });
};

export const mockWalletConnected = () => ({
  account: '0x1234567890123456789012345678901234567890',
  currentChainId: 80084,
  isInit: true,
  currentChain: {
    nativeToken: createMockToken({ isNative: true }),
    raisedTokenData: [
      {
        address: '0xhoney',
        symbol: 'HONEY',
        amount: BigInt('1000000000000000000000'),
      },
    ],
    validatedFtoAddresses: [],
    contracts: {
      algebraSwapRouter: '0xrouter',
      algebraPositionManager: '0xposition',
    },
  },
  contracts: {
    memeFactory: {
      createPair: { call: jest.fn() },
      contract: { simulate: { createPair: jest.fn() } },
    },
    memeFacade: {
      address: '0xfacade',
      deposit: { call: jest.fn() },
      claimLP: { call: jest.fn() },
    },
  },
});

export const mockWalletDisconnected = () => ({
  account: null,
  currentChainId: null,
  isInit: false,
  currentChain: null,
  contracts: {},
});

// Custom render function with providers
import { render as rtlRender } from '@testing-library/react';

export const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  // Add any global providers here if needed
  return rtlRender(ui, options);
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };
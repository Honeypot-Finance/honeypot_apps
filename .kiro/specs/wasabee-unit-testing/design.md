# Wasabee Dex Unit Testing Design Document

## Overview

This design document outlines the comprehensive unit testing strategy for Wasabee Dex major functionalities. The testing approach focuses on ensuring robust coverage of business logic, state management, API interactions, form validation, transaction handling, and conditional rendering across seven core areas: Swap Token, Automated Vaults, Concentrated Liquidity, Create Pool, Vault Actions, Bridge, and Cross Chain Swap functionality.

The design emphasizes testing critical user flows, edge cases, and error handling while maintaining high code quality and reliability standards.

## Architecture

### Testing Framework Stack

- **Testing Framework**: Jest with React Testing Library (RTL)
- **Mocking Strategy**: Jest mocks for external dependencies, services, and blockchain interactions
- **State Management Testing**: MobX store testing with mock reactions
- **Component Testing**: Shallow and integration testing approaches
- **Async Testing**: Proper handling of promises, timeouts, and blockchain transactions

### Testing Structure

```
apps/wasabee/
├── __tests__/
│   ├── components/
│   │   ├── algebra/
│   │   │   ├── swap/
│   │   │   │   ├── V3SwapCard.test.tsx
│   │   │   │   ├── V3SwapCardIndependent.test.tsx
│   │   │   │   └── xSwapCard.test.tsx
│   │   │   ├── create-pool/
│   │   │   │   └── CreatePoolForm.test.tsx
│   │   │   └── position/
│   │   ├── Aquabera/
│   │   │   ├── VaultLists.test.tsx
│   │   │   ├── CreateAquaberaVault.test.tsx
│   │   │   └── VaultTag.test.tsx
│   │   ├── VaultAmount/
│   │   │   └── VaultAmount.test.tsx
│   │   ├── Bridge/
│   │   │   ├── OrbiterBridge/
│   │   │   └── StargateBridge/
│   │   └── cross-chain-swap/
│   │       ├── CrossChainSwapCard.test.tsx
│   │       └── CrossChainSwapLayout.test.tsx
│   ├── pages/
│   │   ├── swap.test.tsx
│   │   ├── pool.test.tsx
│   │   └── cross-chain-swap.test.tsx
│   ├── services/
│   │   ├── orbiterBridge.test.ts
│   │   ├── stargateBridge.test.ts
│   │   └── crossChainSwap.test.ts
│   └── utils/
│       └── test-utils.tsx
```

## Components and Interfaces

### 1. Swap Token Testing Components

#### V3SwapCard Component Testing
- **Props Interface**: Test all prop combinations and default values
- **State Management**: Test swap field state, currency selection, and amount calculations
- **User Interactions**: Test token selection, amount input, and swap execution
- **Error Handling**: Test insufficient balance, invalid amounts, and transaction failures

#### V3SwapCardIndependent Component Testing
- **Independent State**: Test isolated state management without global swap store
- **Currency Management**: Test input/output currency state and conversions
- **Callback Testing**: Test onUserInput, setBestCall, and other callback functions

#### xSwapCard Component Testing
- **Multi-Swap Logic**: Test xSwap service integration and swap aggregation
- **Selection State**: Test isSelected state and swap selection logic
- **Trade Execution**: Test trade derivation and approval state management

### 2. Automated Vaults Testing Components

#### VaultLists Component Testing
- **Tab Management**: Test switching between "All Vaults" and "My Vaults"
- **Search Functionality**: Test search input filtering and real-time updates
- **Sort Functionality**: Test sorting by APR, TVL, Volume, Fees, and Token Pair
- **Data Loading**: Test prefetched data handling and loading states

#### CreateAquaberaVault Component Testing
- **Token Selection**: Test TokenA and TokenB selection and validation
- **Pool Validation**: Test pool existence checking and address computation
- **Form Submission**: Test vault creation transaction and error handling
- **State Management**: Test MobX observer patterns and reactive updates

#### VaultTag Component Testing
- **Rendering Logic**: Test tag display with different color combinations
- **Tooltip Functionality**: Test tooltip content and positioning
- **Accessibility**: Test keyboard navigation and screen reader support

### 3. Concentrated Liquidity Testing Components

#### Position Management Testing
- **Price Range Validation**: Test min/max price inputs and range calculations
- **Liquidity Calculations**: Test token amount calculations based on price ranges
- **Position State**: Test position creation, modification, and removal flows
- **Fee Tracking**: Test fee accumulation and withdrawal calculations

### 4. Create Pool Testing Components

#### CreatePoolForm Component Testing
- **Currency Selection**: Test token pair selection and validation
- **Price Input**: Test initial price setting and reciprocal calculations
- **Pool Existence**: Test existing pool detection and redirection logic
- **Transaction Flow**: Test pool creation transaction lifecycle
- **Form Validation**: Test required field validation and error states

### 5. Vault Actions Testing Components

#### VaultAmount Component Testing
- **Amount Input**: Test numeric input validation and formatting
- **Balance Validation**: Test balance checking and max button functionality
- **Token Allowance**: Test conditional rendering based on vault token permissions
- **Error States**: Test invalid amount handling and visual feedback
- **MobX Integration**: Test observer pattern and reactive updates

### 6. Bridge Testing Components

#### OrbiterBridge Service Testing
- **Service Initialization**: Test Orbiter client creation and configuration
- **Trade Pair Management**: Test available trade pairs fetching and filtering
- **Router Configuration**: Test router creation and simulation calculations
- **Transaction Execution**: Test bridge transaction creation and execution
- **Error Handling**: Test service failures and network issues

#### StargateBridge Service Testing
- **Token Filtering**: Test supported token filtering and availability
- **Chain Management**: Test chain ID switching and validation
- **Amount Calculations**: Test bridge amount calculations and limits
- **State Management**: Test MobX state updates and reactions

### 7. Cross Chain Swap Testing Components

#### CrossChainSwapCard Component Testing
- **Chain Selection**: Test source/destination chain selection and validation
- **Quote Fetching**: Test quote API calls, debouncing, and error handling
- **Price Fetching**: Test token price API integration and fallback logic
- **Transaction Execution**: Test Universal Account integration and multi-step transactions
- **Status Tracking**: Test transaction status updates and user feedback

#### CrossChainSwapLayout Component Testing
- **Layout Rendering**: Test responsive layout and component positioning
- **Chart Integration**: Test chart refresh triggers and data updates
- **Transaction History**: Test history component integration and data flow

## Data Models

### Test Data Structures

```typescript
// Mock Token Data
interface MockToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: string;
  isNative: boolean;
  balance: string;
  balanceFormatted: string;
}

// Mock Vault Data
interface MockVault {
  address: string;
  token0: MockToken;
  token1: MockToken;
  allowToken0: boolean;
  allowToken1: boolean;
  apr: number;
  tvl: string;
}

// Mock Trade Data
interface MockTrade {
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
  route: string[];
  executionPrice: string;
}

// Mock Transaction Data
interface MockTransaction {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  from: string;
  to: string;
  value: string;
  gasUsed: string;
}
```

### Mock Service Interfaces

```typescript
// Mock Wallet Service
interface MockWallet {
  account: string;
  chainId: number;
  isConnected: boolean;
  balance: string;
  switchChain: jest.Mock;
  signTransaction: jest.Mock;
}

// Mock Contract Service
interface MockContract {
  read: jest.Mock;
  write: jest.Mock;
  simulate: jest.Mock;
  address: string;
  abi: any[];
}
```

## Error Handling

### Error Testing Categories

1. **Network Errors**
   - Connection timeouts
   - RPC failures
   - Chain switching failures

2. **Validation Errors**
   - Invalid amounts
   - Insufficient balances
   - Invalid addresses

3. **Transaction Errors**
   - Gas estimation failures
   - Transaction reverts
   - Approval failures

4. **Service Errors**
   - API failures
   - Bridge service unavailability
   - Quote fetching failures

### Error Handling Patterns

```typescript
// Error boundary testing
const renderWithErrorBoundary = (component: ReactElement) => {
  return render(
    <ErrorBoundary fallback={<div>Error occurred</div>}>
      {component}
    </ErrorBoundary>
  );
};

// Async error testing
const testAsyncError = async (asyncFunction: () => Promise<any>) => {
  await expect(asyncFunction()).rejects.toThrow('Expected error message');
};
```

## Testing Strategy

### Unit Test Categories

#### 1. Positive Tests (Happy Path)
- Valid user inputs and successful operations
- Correct state updates and UI rendering
- Successful API calls and transaction execution
- Proper callback execution and event handling

#### 2. Negative Tests (Error Cases)
- Invalid inputs and validation failures
- Network errors and service unavailability
- Transaction failures and reverts
- Insufficient permissions and balances

#### 3. Edge Case Tests
- Boundary values (min/max amounts)
- Empty states and loading conditions
- Race conditions and concurrent operations
- Network switching during operations

### Mock Strategy

#### External Dependencies
```typescript
// Wallet mocking
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    account: '0x123...',
    currentChainId: 1,
    isConnected: true,
    // ... other wallet properties
  }
}));

// Contract mocking
jest.mock('@/lib/contracts', () => ({
  getContract: jest.fn().mockReturnValue({
    read: jest.fn(),
    write: jest.fn(),
    simulate: jest.fn(),
  })
}));

// API mocking
jest.mock('@/services/api', () => ({
  fetchTokenPrice: jest.fn(),
  getSwapQuote: jest.fn(),
  getBridgeRoutes: jest.fn(),
}));
```

#### State Management Mocking
```typescript
// MobX store mocking
jest.mock('@/stores/swapStore', () => ({
  swapStore: {
    inputAmount: '100',
    outputAmount: '95',
    setInputAmount: jest.fn(),
    setOutputAmount: jest.fn(),
  }
}));
```

### Test Utilities

#### Custom Render Function
```typescript
const customRender = (
  ui: ReactElement,
  options?: {
    initialState?: any;
    wrapper?: ComponentType;
  }
) => {
  const AllTheProviders = ({ children }: { children: ReactNode }) => {
    return (
      <QueryClient>
        <WalletProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </WalletProvider>
      </QueryClient>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};
```

#### Async Testing Utilities
```typescript
const waitForTransaction = async (transactionPromise: Promise<any>) => {
  await waitFor(() => {
    expect(screen.getByText(/transaction pending/i)).toBeInTheDocument();
  });
  
  await waitFor(() => {
    expect(screen.getByText(/transaction successful/i)).toBeInTheDocument();
  }, { timeout: 10000 });
};
```

### Performance Testing

#### Component Performance
- Test component render times with large datasets
- Test memory usage with complex state updates
- Test scroll performance with virtualized lists

#### API Performance
- Test API response times and timeout handling
- Test concurrent request handling
- Test cache effectiveness and invalidation

### Accessibility Testing

#### A11y Requirements
- Keyboard navigation testing
- Screen reader compatibility
- Color contrast validation
- Focus management testing

```typescript
// Accessibility testing example
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should not have accessibility violations', async () => {
  const { container } = render(<SwapCard />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Implementation Guidelines

### Test File Structure
```typescript
describe('ComponentName', () => {
  // Setup and teardown
  beforeEach(() => {
    // Reset mocks and state
  });

  describe('Positive Tests', () => {
    test('should handle valid user input correctly', () => {
      // Test implementation
    });
  });

  describe('Negative Tests', () => {
    test('should handle invalid input gracefully', () => {
      // Test implementation
    });
  });

  describe('Edge Cases', () => {
    test('should handle boundary conditions', () => {
      // Test implementation
    });
  });
});
```

### Coverage Requirements
- **Minimum Coverage**: 80% line coverage
- **Critical Paths**: 95% coverage for transaction flows
- **Error Handling**: 100% coverage for error scenarios
- **Edge Cases**: 90% coverage for boundary conditions

### Continuous Integration
- Run tests on every pull request
- Generate coverage reports
- Fail builds on coverage regression
- Run accessibility tests in CI pipeline
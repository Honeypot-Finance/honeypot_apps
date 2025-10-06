# Wasabee Dex Unit Testing Suite

This directory contains comprehensive unit tests for the Wasabee Dex application, covering all major functionalities as specified in the requirements document.

## Test Structure

The test suite mirrors the `apps/wasabee/` folder structure exactly:

```
test/apps/wasabee/
├── components/
│   ├── algebra/
│   │   ├── swap/
│   │   │   ├── V3SwapCard.test.tsx
│   │   │   ├── xSwapCard.test.tsx
│   │   │   └── V3SwapCardIndependent.test.tsx
│   │   └── create-pool/
│   │       └── CreatePoolForm.test.tsx
│   ├── Aquabera/
│   │   ├── VaultTag.test.tsx
│   │   ├── VaultLists.test.tsx
│   │   ├── create-vault.test.tsx
│   │   └── modals.test.tsx
│   ├── VaultAmount/
│   │   └── VaultAmount.test.tsx
│   ├── cross-chain-swap/
│   │   ├── CrossChainSwapCard.test.tsx
│   │   ├── CrossChainSwapLayout.test.tsx
│   │   ├── CrossChainKlineChart.test.tsx
│   │   ├── ChainSelector.test.tsx
│   │   └── TokenSelector.test.tsx
│   └── Bridge/
│       ├── OrbiterBridge.test.tsx
│       └── StargateBridge.test.tsx
├── pages/
│   ├── swap.test.tsx
│   ├── pool.test.tsx
│   ├── cross-chain-swap.test.tsx
│   └── vault/
│       └── [address].test.tsx
└── services/
    ├── orbiterBridge.test.ts
    ├── stargateBridge.test.ts
    └── crossChainSwap.test.ts
```

## Test Coverage Requirements

The test suite covers all acceptance criteria from the requirements document:

### 1. Swap Token Testing
- ✅ Valid swap amount calculations and parameter display
- ✅ Insufficient balance error handling
- ✅ Successful swap execution and state updates
- ✅ Price calculation failure handling
- ✅ Token position switching
- ✅ Slippage tolerance modifications
- ✅ Network failure error handling

### 2. Automated Vaults Testing
- ✅ Vault data display (APR, TVL, token pairs)
- ✅ Vault search functionality
- ✅ Vault sorting capabilities
- ✅ Vault creation with validation
- ✅ Vault creation error handling
- ✅ Vault tag display and tooltips
- ✅ Tab switching between "All Vaults" and "My Vaults"

### 3. Concentrated Liquidity Testing
- ✅ Liquidity position creation and validation
- ✅ Invalid parameter error handling
- ✅ Real-time position range modifications
- ✅ Position data display (fees, current value)
- ✅ Liquidity removal calculations
- ✅ Out-of-range position status updates
- ✅ Transaction failure error handling

### 4. Create Pool Testing
- ✅ Token pair validation (different and supported tokens)
- ✅ Initial price validation and reciprocal calculation
- ✅ Existing pool detection and redirection
- ✅ Transaction lifecycle handling
- ✅ Pool creation error handling
- ✅ Missing field validation
- ✅ Successful creation flow and state clearing

### 5. Vault Actions Testing (Deposit/Stake/Withdraw)
- ✅ Deposit amount validation against balances
- ✅ "Max" button functionality
- ✅ Balance exceeded error states
- ✅ Successful deposit execution and balance updates
- ✅ Withdrawal calculations and position updates
- ✅ Operation failure error handling
- ✅ Single token deposit handling

### 6. Bridge Testing
- ✅ Chain compatibility validation and trade pair loading
- ✅ Token selection and balance information
- ✅ Amount validation against limits
- ✅ Insufficient balance error handling
- ✅ No trade pairs error handling
- ✅ Token approval and bridge execution
- ✅ Service unavailability error handling
- ✅ Bridge provider switching
- ✅ Parameter change handling and recalculation
- ✅ Transaction failure error handling

### 7. Cross Chain Swap Testing
- ✅ Chain selector initialization and token loading
- ✅ Quote fetching with fees, price impact, and timing
- ✅ Universal Account transaction handling
- ✅ Universal Account initialization error handling
- ✅ Token price API failure handling
- ✅ Network switching prompts and transitions
- ✅ Transaction status tracking and progress updates
- ✅ Slippage tolerance modifications and route updates
- ✅ Swap failure and refund handling
- ✅ Swap simulation and feasibility validation
- ✅ Layout component rendering and integration
- ✅ Success handling with data refresh and form clearing

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test File
```bash
npm test -- V3SwapCard.test.tsx
```

### Run Tests for Specific Component Type
```bash
npm test -- --testPathPattern=components/algebra
npm test -- --testPathPattern=services
npm test -- --testPathPattern=pages
```

## Test Configuration

### Jest Configuration
- **Environment**: jsdom (for React component testing)
- **Setup**: Custom test setup with mocked dependencies
- **Coverage**: Comprehensive coverage reporting
- **Timeout**: 10 seconds per test

### Mocked Dependencies
- `@honeypot/shared` - Shared library components and utilities
- `@orbiter-finance/bridge-sdk` - Orbiter bridge SDK
- `next/router` and `next/navigation` - Next.js routing
- `wagmi` - Ethereum React hooks
- `react-toastify` - Toast notifications
- `framer-motion` - Animation library
- Browser APIs (localStorage, fetch, crypto, etc.)

## Test Patterns

### Component Testing
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Component from 'path/to/Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Service Testing
```typescript
import { ServiceClass } from 'path/to/service';

describe('ServiceClass', () => {
  let service: ServiceClass;
  
  beforeEach(() => {
    service = new ServiceClass();
  });
  
  it('should perform expected operation', async () => {
    const result = await service.performOperation();
    expect(result).toEqual(expectedResult);
  });
});
```

### Error Handling Testing
```typescript
it('should handle errors gracefully', async () => {
  // Mock error condition
  mockFunction.mockRejectedValue(new Error('Test error'));
  
  // Test error handling
  await expect(serviceMethod()).rejects.toThrow('Test error');
  
  // Verify error UI
  expect(screen.getByText(/error/i)).toBeInTheDocument();
});
```

## Key Testing Principles

1. **No Mocking of Production Code**: Tests import and use actual production components and services
2. **Real Implementation Testing**: Tests validate actual behavior, not mocked behavior
3. **Comprehensive Coverage**: All acceptance criteria are covered by tests
4. **Error Boundary Testing**: All error conditions and edge cases are tested
5. **User-Centric Testing**: Tests focus on user interactions and business logic
6. **Deterministic Tests**: Tests don't rely on external network calls during CI

## Test Utilities

Global test utilities are available via `global.testUtils`:

```typescript
// Create mock objects
const mockToken = global.testUtils.createMockToken({ symbol: 'USDC' });
const mockChain = global.testUtils.createMockChain({ chainId: 137 });
const mockWallet = global.testUtils.createMockWallet({ address: '0x123' });

// Wait for next tick
await global.testUtils.waitForNextTick();
```

## Continuous Integration

Tests are designed to run in CI environments with:
- No external network dependencies
- Deterministic behavior
- Comprehensive error handling
- Fast execution times
- Clear failure reporting

## Contributing

When adding new tests:

1. Follow the existing folder structure
2. Use descriptive test names
3. Cover both positive and negative scenarios
4. Include edge cases and error conditions
5. Mock external dependencies, not production code
6. Ensure tests are deterministic and fast
7. Add proper documentation for complex test scenarios

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all imports use the correct relative paths
2. **Mock Issues**: Check that mocks are properly configured in test setup
3. **Async Issues**: Use `waitFor` for async operations
4. **DOM Issues**: Ensure jsdom environment is properly configured

### Debug Tips

1. Use `screen.debug()` to see rendered DOM
2. Use `console.log` in tests for debugging (removed in CI)
3. Run single tests with `--verbose` flag for detailed output
4. Check mock call history with `jest.fn().mock.calls`
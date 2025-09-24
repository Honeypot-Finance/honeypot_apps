# Honeypot Finance - Test Suite

This directory contains comprehensive unit and component tests for all major functionalities across the Honeypot Finance ecosystem.

## 📁 Test Structure

```
test/
├── apps/
│   ├── wasabee/
│   │   └── components/
│   │       ├── SwapCard.test.ts
│   │       ├── VaultAmount.test.ts
│   │       ├── BridgeSwap.test.ts
│   │       ├── ConcentratedLiquidity.test.ts
│   │       ├── CreatePool.test.ts
│   │       └── AutomatedVaults.test.ts
│   ├── pot2pump/
│   │   └── components/
│   │       ├── LaunchPadProjectCard.test.ts
│   │       └── MemeSwap.test.ts
│   ├── all-in-one-vault/
│   │   └── components/
│   │       └── VaultDeposit.test.ts
│   └── leaderboard/
│       └── components/
│           └── AllInOneLeaderboard.test.ts
```

## 🧪 Test Coverage

### Wasabee Dex Tests

- **SwapCard.test.ts**: Token swapping functionality
- **VaultAmount.test.ts**: Automated vault operations (deposit, stake, withdraw)
- **BridgeSwap.test.ts**: Cross-chain bridge functionality
- **ConcentratedLiquidity.test.ts**: Concentrated liquidity pool management
- **CreatePool.test.ts**: Pool creation functionality with validation and error handling
- **AutomatedVaults.test.ts**: Automated vault display, performance metrics, and user positions

### Pot2Pump Tests

- **LaunchPadProjectCard.test.ts**: Meme token launching and display
- **MemeSwap.test.ts**: Meme token swapping and LP claiming

### All-in-One Vault Tests

- **VaultDeposit.test.ts**: Multi-platform vault deposit functionality

### Leaderboard Tests

- **AllInOneLeaderboard.test.ts**: Cross-platform leaderboard aggregation

## 🎯 Test Types

Each test file includes three types of tests:

### 1. Positive Tests

- Test successful operations with valid inputs
- Verify expected behavior under normal conditions
- Validate successful API calls and state changes

### 2. Negative Tests

- Test error handling with invalid inputs
- Verify proper error messages and states
- Test edge cases that should fail gracefully

### 3. Edge Case Tests

- Test boundary conditions (zero amounts, maximum values)
- Test concurrent operations
- Test unusual but valid scenarios

## 🚀 Running Tests

### Run All Tests

```bash
pnpm test
```

### Run Tests for Specific Apps

```bash
# Wasabee tests
pnpm test:wasabee

# Pot2Pump tests
pnpm test:pot2pump

# All-in-One Vault tests
pnpm test:all-in-one-vault

# Leaderboard tests
pnpm test:leaderboard
```

# Run specific app tests with verbose output

```bash
pnpm run test:wasabee -- --verbose
```


### Run Tests with Coverage


```bash
pnpm test:coverage
```



## 📊 Coverage Reports

Coverage reports are generated in the `coverage/` directory and include:

- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

## Test Configuration

Each app has its own Jest configuration:

- `apps/wasabee/jest.config.ts`
- `apps/pot2pump/jest.config.ts`
- `apps/all-in-one-vault/jest.config.ts`
- `apps/leaderboard/jest.config.ts`

## Continuous Integration

Tests run automatically on every commit via GitHub Actions:

- **Trigger**: Push to `main` or `develop` branches, or pull requests
- **Node Versions**: 18.x and 20.x
- **Steps**:
  1. Linting
  2. Type checking
  3. Unit tests with coverage
  4. Integration tests
  5. Security scanning

## 📝 Test Examples

### Positive Test Example

```typescript
it('should successfully initialize swap with valid tokens', () => {
  const mockSwapState = {
    independentField: 'INPUT',
    typedValue: '1.0',
  };

  expect(mockSwapState.independentField).toBe('INPUT');
  expect(mockSwapState.typedValue).toBe('1.0');
});
```

### Negative Test Example

```typescript
it('should handle insufficient balance error', () => {
  const userBalance = '0.5';
  const swapAmount = '1.0';

  const hasInsufficientBalance = parseFloat(userBalance) < parseFloat(swapAmount);
  expect(hasInsufficientBalance).toBe(true);
});
```

### Edge Case Test Example

```typescript
it('should handle zero amount input', () => {
  const zeroAmount = '0';
  const isValidAmount = parseFloat(zeroAmount) > 0;
  expect(isValidAmount).toBe(false);
});
```

## Mocking Strategy

Tests use comprehensive mocking for:

- **Wallet connections**: Mock wallet state and transactions
- **Contract interactions**: Mock smart contract calls
- **API calls**: Mock external service responses
- **Next.js features**: Mock router, dynamic imports, etc.

## Adding New Tests

When adding new functionality:

1. **Create test file**: Follow naming convention `<ComponentName>.test.ts`
2. **Include all test types**: Positive, negative, and edge cases
3. **Mock dependencies**: Use appropriate mocks for external dependencies
4. **Update CI**: Tests will automatically run in CI pipeline


## 🐛 Debugging Tests

To debug failing tests:

1. **Run specific test**: `pnpm test -- --testNamePattern="test name"`
2. **Enable verbose output**: `pnpm test -- --verbose`
3. **Check coverage**: `pnpm test:coverage` to see uncovered code
4. **Use debugger**: Add `debugger` statements in test code

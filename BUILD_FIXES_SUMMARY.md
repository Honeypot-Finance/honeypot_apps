# Build Fixes Summary

## Fixed Issues

### 1. BSC Swap Issue (pot2pump app)
**Problem:** The swap component showed "Select an amount for swap" even when tokens were selected and amounts entered on BSC.

**Root Cause:** The ALGEBRA_QUOTER_V2 address was hardcoded to Berachain's address, causing quote calls to fail on BSC.

**Fix:** Modified `/apps/pot2pump/lib/algebra/hooks/swap/useQuotesResults.ts` to dynamically fetch the quoter address based on the current chain ID.

### 2. TypeScript Build Errors (both apps)

#### wasabee app:
1. **WrappedToastify.warning error**
   - File: `/apps/wasabee/components/cross-chain-swap/CrossChainSwapCard.tsx`
   - Fix: Changed `WrappedToastify.warning` to `WrappedToastify.warn`

2. **useToken hook error**
   - File: `/apps/wasabee/lib/algebra/hooks/common/useAlgebraToken.ts`
   - Fix: Moved `enabled` property into the `query` object for wagmi v2 compatibility

3. **algebraPoolABI import error**
   - File: `/apps/wasabee/lib/algebra/hooks/swap/useSwapPools.ts`
   - Fix: Changed `algebraPoolABI` to `algebraPoolAbi` (correct casing)

#### pot2pump app:
1. **useToken hook error**
   - File: `/apps/pot2pump/lib/algebra/hooks/common/useAlgebraToken.ts`
   - Fix: Moved `enabled` property into the `query` object for wagmi v2 compatibility

## Build Status
- TypeScript compilation: ✅ Passes without errors for both apps
- Build process: ⚠️ Requires clearing Nx cache permissions

## To Build Successfully
```bash
# Clear Nx cache with proper permissions
sudo rm -rf .nx

# Build the apps
sudo npx nx build wasabee --prod
sudo npx nx build pot2pump --prod
```

## Testing the BSC Swap Fix
1. Start pot2pump app: `pnpm p` or `npx nx dev pot2pump --port 9001`
2. Connect wallet to BSC (Chain ID 56)
3. Select tokens for swapping
4. Enter an amount
5. Verify the swap button is enabled and shows "Swap" instead of "Select an amount"
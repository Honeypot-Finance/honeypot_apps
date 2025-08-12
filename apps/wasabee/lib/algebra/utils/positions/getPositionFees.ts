import { MAX_UINT128 } from '@/config/algebra/max-uint128';
import { wallet } from '@honeypot/shared/lib/wallet';
import { algebraPositionManagerAbi } from '@honeypot/shared/wagmi-generated';
import { CurrencyAmount, Pool, unwrappedToken } from '@cryptoalgebra/sdk';
import { getContract } from 'viem';

export async function getPositionFees(pool: Pool, positionId: number) {
  try {
    const algebraPositionManager = getContract({
      address: wallet.currentChain.contracts.algebraPositionManager,
      abi: algebraPositionManagerAbi,
      client: { public: wallet.publicClient, wallet: wallet.walletClient },
    });

    const owner = await algebraPositionManager.read.ownerOf([
      BigInt(positionId),
    ]);

    const {
      result: [fees0, fees1],
    } = await algebraPositionManager.simulate.collect(
      [
        {
          tokenId: BigInt(positionId),
          recipient: owner,
          amount0Max: MAX_UINT128,
          amount1Max: MAX_UINT128,
        },
      ],
      {
        account: owner,
      }
    );

    return [
      CurrencyAmount.fromRawAmount(
        unwrappedToken(pool.token0),
        fees0.toString()
      ),
      CurrencyAmount.fromRawAmount(
        unwrappedToken(pool.token1),
        fees1.toString()
      ),
    ];
  } catch {
    return [undefined, undefined];
  }
}

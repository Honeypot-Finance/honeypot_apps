import { observer } from 'mobx-react-lite';
import { useState } from 'react';

import { Token } from '@honeypot/shared/lib/contract/token/token';
import TokenCardV3 from '@/components/algebra/swap/TokenCard/TokenCardV3';
import { computePoolAddress, Currency } from '@cryptoalgebra/sdk';

import { ICHIVaultContract } from '@honeypot/shared/lib/contract/aquabera/ICHIVault-contract';
import { Button } from '@/components/button';
import { wallet } from '@honeypot/shared/lib/wallet';
import { TokenSelector } from '@honeypot/shared/components/TokenSelector';
import { PoolState, usePool } from '@/lib/algebra/hooks/pools/usePool';
import { Address } from 'viem';
import { Token as AlgebraToken } from '@cryptoalgebra/sdk';

export const CreateAquaberaVault = observer(() => {
  const [tokenA, setTokenA] = useState<Token>(
    Token.getToken({
      address: wallet.currentChain.validatedTokens[0].address,
      chainId: wallet.currentChainId.toString(),
    })
  );
  const [tokenB, setTokenB] = useState<Token>(
    Token.getToken({
      address: wallet.currentChain.validatedTokens[1].address,
      chainId: wallet.currentChainId.toString(),
    })
  );

  const poolAddress =
    tokenA && tokenB
      ? (computePoolAddress({
          tokenA: new AlgebraToken(
            wallet.currentChainId,
            tokenA.address,
            Number(tokenA.decimals),
            tokenA.symbol,
            tokenA.name
          ),
          tokenB: new AlgebraToken(
            wallet.currentChainId,
            tokenB.address,
            Number(tokenB.decimals),
            tokenB.symbol,
            tokenB.name
          ),
        }) as Address)
      : undefined;

  const [poolState] = usePool(poolAddress);

  const isPoolExists = poolState === PoolState.EXISTS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await wallet.contracts.vaultFactory.createICHIVault(
        tokenA?.address as string, // Assuming tokenA has an address property
        true, // allowTokenA
        tokenB?.address as string, // Assuming tokenB has an address property
        true // allowTokenB
      );
      console.log('res', res);
      console.log('Vault created successfully');
    } catch (error) {
      console.error('Error creating vault:', error);
    }
  };

  return (
    <div className="md:min-w-[500px] flex flex-col justify-center items-center gap-1 p-2 bg-[#271A0C] rounded-3xl border-3 border-solid border-[#F7931A10] hover:border-[#F7931A] transition-all ">
      <h2 className="font-semibold text-xl ml-2 mt-2 w-full text-center">
        Create Vault
      </h2>
      <form
        onSubmit={handleSubmit}
        className="*:my-3 w-full flex flex-col gap-3 justify-center items-center"
      >
        <TokenSelector value={tokenA} onSelect={setTokenA} />
        <TokenSelector value={tokenB} onSelect={setTokenB} />
        <Button
          type="submit"
          className="form-submit-button"
          isDisabled={!isPoolExists}
        >
          {!isPoolExists ? 'Algebra Pool does not exist' : 'Create Vault'}
        </Button>
      </form>
    </div>
  );
});

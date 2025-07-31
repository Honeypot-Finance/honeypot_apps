import { TokenLogo } from '@honeypot/shared';

import { getSingleVaultDetails } from '@honeypot/shared';
import { DynamicFormatAmount } from '@honeypot/shared';
import { useSubgraphClient } from '@honeypot/shared';

import { ICHIVaultContract } from '@honeypot/shared';

import { Token } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
import {
  useReadIchiVaultAllowToken0,
  useReadIchiVaultAllowToken1,
} from '@/wagmi-generated';
import { Skeleton, Tooltip } from '@nextui-org/react';
import { InfoIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';

export const MyVaultRow = observer(
  ({ vault }: { vault: ICHIVaultContract }) => {
    const [vaultContract, setVaultContract] = useState<
      ICHIVaultContract | undefined
    >(undefined);
    const infoClient = useSubgraphClient('algebra_info');
    const tokenA = Token.getToken({
      address: vault.token0?.address ?? '',
      chainId: wallet.currentChainId.toString(),
    });
    const tokenB = Token.getToken({
      address: vault.token1?.address ?? '',
      chainId: wallet.currentChainId.toString(),
    });
    const loading = useMemo(() => {
      return !vaultContract || !tokenA || !tokenB;
    }, [vaultContract, tokenA, tokenB]);

    const isTokenAAllowed = useReadIchiVaultAllowToken0({
      address: vault.address,
    });

    const isTokenBAllowed = useReadIchiVaultAllowToken1({
      address: vault.address,
    });

    useEffect(() => {
      if (!vault) return;

      async function getVaultsContracts() {
        if (!vault) return;
        const vaultContract = await getSingleVaultDetails(
          infoClient,
          vault.address
        );

        if (vaultContract) {
          Promise.all([
            vaultContract?.getTotalAmounts(),
            vaultContract?.getTotalSupply(),
            vaultContract?.getBalanceOf(wallet.account),
          ]);

          vaultContract?.token0?.init(true, {
            loadIndexerTokenData: true,
          });
          vaultContract?.token1?.init(true, {
            loadIndexerTokenData: true,
          });

          return vaultContract;
        }
      }

      tokenA.init();
      tokenB.init();

      getVaultsContracts().then((vaultContract) => {
        setVaultContract(vaultContract);
      });
    }, [vault]);

    if (loading) {
      return (
        <tr>
          <td colSpan={6}>
            <Skeleton className="h-12 bg-yellow-500" />
          </td>
        </tr>
      );
    }

    return (
      <tr
        className="transition-colors bg-white text-black hover:bg-gray-50 cursor-pointer"
        onClick={() => (window.location.href = `/vault/${vault.address}`)}
      >
        {/* Token pair */}
        <td className="py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <TokenLogo
                token={tokenA}
                addtionalClasses="translate-x-[25%]"
                size={24}
              />
              <TokenLogo
                token={tokenB}
                addtionalClasses="translate-x-[-25%]"
                size={24}
              />
            </div>
            <div className="flex flex-col">
              <p className="text-black font-medium">
                {tokenA.symbol}/{tokenB.symbol}
              </p>
            </div>
          </div>
        </td>
        {/* allow token */}
        <td className="py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {isTokenAAllowed.data && <TokenLogo token={tokenA} size={24} />}
              {isTokenBAllowed.data && <TokenLogo token={tokenB} size={24} />}
            </div>
            <div className="flex">
              <p className="text-black font-medium">
                {isTokenAAllowed.data && tokenA.symbol}
                {isTokenBAllowed.data && tokenB.symbol}
              </p>
            </div>
          </div>
        </td>
        {/* vault address */}
        {/* <td className="py-4 px-6 text-black">{vault.id}</td> */}
        {/* tvl */}
        <td className="py-4 px-6 text-right text-black">
          {DynamicFormatAmount({
            amount: vaultContract?.userTVLUSD ?? 0,
            decimals: 3,
            endWith: ' $',
          })}
        </td>
        {/* apr */}
        <td className="py-4 px-6 text-right text-black flex justify-end items-center gap-2">
          {vaultContract?.apr.toFixed(2)}%
          <Tooltip
            content={
              <div>
                <p>1d: {vaultContract?.detailedApr.feeApr_1d.toFixed(5)}%</p>
                <p>3d: {vaultContract?.detailedApr.feeApr_3d.toFixed(5)}%</p>
                <p>7d: {vaultContract?.detailedApr.feeApr_7d.toFixed(5)}%</p>
                <p>30d: {vaultContract?.detailedApr.feeApr_30d.toFixed(5)}%</p>
              </div>
            }
          >
            <span className="text-gray-500">
              <InfoIcon className="w-4 h-4" />
            </span>
          </Tooltip>
        </td>
      </tr>
    );
  }
);

export default MyVaultRow;

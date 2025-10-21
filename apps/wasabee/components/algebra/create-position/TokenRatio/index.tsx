import { TokenLogo } from '@honeypot/shared/components/TokenLogo/TokenLogo';

import { Token } from '@honeypot/shared/lib/contract/token/token';
import { IDerivedMintInfo } from '@/lib/algebra/state/mintStore';
import { useMemo } from 'react';
import { zeroAddress } from 'viem';
import { wallet } from '@honeypot/shared/lib/wallet';

interface TokenRatioProps {
  mintInfo: IDerivedMintInfo;
}

const TokenRatio = ({ mintInfo }: TokenRatioProps) => {
  const {
    currencies: { CURRENCY_A: currencyA, CURRENCY_B: currencyB },
    ticksAtLimit,
  } = mintInfo;

  const { LOWER: tickLowerAtLimit, UPPER: tickUpperAtLimit } = ticksAtLimit;

  const [token0Ratio, token1Ratio] = useMemo(() => {
    const currentPrice = mintInfo.price?.toSignificant(5);

    const left = mintInfo.lowerPrice?.toSignificant(5);
    const right = mintInfo.upperPrice?.toSignificant(5);

    if (tickUpperAtLimit) return ['50', '50'];

    if (!currentPrice) return ['0', '0'];

    if (!left && !right) return ['0', '0'];

    if (!left && right) return ['0', '100'];

    if (!right && left) return ['100', '0'];

    if (mintInfo.depositADisabled) {
      return ['0', '100'];
    }

    if (mintInfo.depositBDisabled) {
      return ['100', '0'];
    }

    if (left && right && currentPrice) {
      const leftRange = +currentPrice - +left;
      const rightRange = +right - +currentPrice;

      const totalSum = +leftRange + +rightRange;

      const leftRate = (+leftRange * 100) / totalSum;
      const rightRate = (+rightRange * 100) / totalSum;

      if (mintInfo.invertPrice) {
        return [String(leftRate), String(rightRate)];
      } else {
        return [String(rightRate), String(leftRate)];
      }
    }

    return ['0', '0'];
  }, [mintInfo, tickLowerAtLimit, tickUpperAtLimit]);

  return (
    <div className="relative flex h-[40px] bg-white rounded-xl">
      {/* FIXME： remove honeypot-button */}
      <div className="flex w-full h-full font-semibold gap-x-2">
        {Number(token0Ratio) > 0 && (
          <div
            className={`flex items-center justify-between pl-1 pr-2 h-full bg-[#ffd666] border border-[#000] rounded-[8px] duration-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
            style={{ width: `${token0Ratio}%` }}
          >
            <TokenLogo
              size={24}
              token={Token.getToken({
                address: currencyA ? currencyA.wrapped.address : zeroAddress,
                chainId: wallet.currentChainId.toString(),
              })}
            />
            <span className="text-sm text-[rgba(32,32,32,1)] font-gliker">{`${parseFloat(
              token0Ratio
            ).toFixed()}%`}</span>
          </div>
        )}
        {Number(token1Ratio) > 0 && (
          <div
            className={`flex items-center justify-between  pr-1 pl-2 h-full bg-[rgba(243,208,166,1)] duration-300 relative rounded-[8px] border border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
            style={{ width: `${token1Ratio}%` }}
          >
            <TokenLogo
              size={24}
              token={Token.getToken({
                address: currencyB ? currencyB.wrapped.address : zeroAddress,
                chainId: wallet.currentChainId.toString(),
              })}
            />

            <span className="text-sm text-[rgba(32,32,32,1)] font-gliker">{`${parseFloat(
              token1Ratio
            ).toFixed()}%`}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenRatio;

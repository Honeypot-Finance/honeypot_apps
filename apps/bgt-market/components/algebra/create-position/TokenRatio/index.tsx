import { TokenLogo } from '@honeypot/shared';

import { Token } from '@honeypot/shared';
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
    <div className="relative flex h-[30px] bg-card-dark rounded-xl px-2">
      {/* FIXME： remove honeypot-button */}
      <div className="flex w-full h-full font-semibold">
        {Number(token0Ratio) > 0 && (
          <div
            className={`flex items-center justify-end pl-1 pr-2 h-full bg-[#ffd666] border border-[#ffd666]/30 duration-300 ${
              Number(token0Ratio) === 100 ? 'rounded-2xl' : 'rounded-l-2xl'
            }`}
            style={{ width: `${token0Ratio}%` }}
          >
            <TokenLogo
              addtionalClasses="w-8 absolute left-2 top-0"
              token={Token.getToken({
                address: currencyA ? currencyA.wrapped.address : zeroAddress,
                chainId: wallet.currentChainId.toString(),
              })}
            />
            {`${parseFloat(token0Ratio).toFixed()}%`}
          </div>
        )}
        {Number(token1Ratio) > 0 && (
          <div
            className={`flex items-center pr-1 pl-2 h-full honeypot-button border duration-300 relative ${
              Number(token1Ratio) === 100 ? 'rounded-2xl' : 'rounded-r-2xl'
            }`}
            style={{ width: `${token1Ratio}%` }}
          >
            {`${parseFloat(token1Ratio).toFixed()}%`}
            <TokenLogo
              addtionalClasses="w-8 absolute right-0 top-0"
              token={Token.getToken({
                address: currencyB ? currencyB.wrapped.address : zeroAddress,
                chainId: wallet.currentChainId.toString(),
              })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenRatio;

import { Token } from '@honeypot/shared';
import { TokenLogo } from '@honeypot/shared';
import { observer } from 'mobx-react-lite';
import {
  OptionsDropdown,
  optionsPresets,
} from '../OptionsDropdown/OptionsDropdown';
import { motion } from 'framer-motion';
import { itemSlideVariants } from '@/lib/animation';
import { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { portfolio } from '@/services/portfolio';
import { DynamicFormatAmount } from '@honeypot/shared';

interface TokenBalanceCardProps {
  token: Token;
  autoSize?: boolean;
}

export const TokenBalanceCard = observer(({ token }: TokenBalanceCardProps) => {
  useEffect(() => {
    //token.init();
  }, []);

  // Calculate 24h price change percentage
  const priceChangePercent = new BigNumber(token.derivedUSD || 0)
    .minus(token.derivedUSD || 0)
    .dividedBy(token.derivedUSD || 1)
    .multipliedBy(100)
    .toFixed(2);

  // Calculate token value in USD
  const tokenValue = new BigNumber(token.derivedUSD || 0)
    .multipliedBy(token.balance)
    .toFixed(2);

  // Calculate proportion of total portfolio value
  const proportion = new BigNumber(tokenValue)
    .dividedBy(portfolio.totalBalance)
    .multipliedBy(100)
    .toFixed(2);

  // Format USD price with "<0.00" for very small values
  const formattedUSDPrice = DynamicFormatAmount({
    amount: token.derivedUSD,
    decimals: 2,
    endWith: '$',
  });

  return (
    <tr className="transition-colors bg-transparent text-black">
      {/* Asset Column */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <TokenLogo token={token} />
          <div className="flex flex-col">
            <p className="text-white font-medium">{token.displayName}</p>
            <p className="text-white/60 text-sm">{token.name}</p>
          </div>
        </div>
      </td>

      {/* Price Column */}
      <td className="py-4 px-6 text-right">
        <div className="flex flex-col">
          <span className="text-black">{formattedUSDPrice}</span>
          <span
            className={`text-xs ${
              Number(priceChangePercent) >= 0
                ? 'text-[#4ADE80]'
                : 'text-[#FF5555]'
            }`}
          >
            {Number(priceChangePercent) >= 0 ? '+' : ''}
            {priceChangePercent}%
          </span>
        </div>
      </td>

      {/* Balance Column */}
      <td className="py-4 px-6 text-right">
        <div className="flex flex-col">
          <span className="text-white">
            {DynamicFormatAmount({
              amount: token.balance.toString(),
              decimals: 4,
            })}
          </span>
          <span className="text-xs text-white/60">${tokenValue}</span>
        </div>
      </td>

      {/* Proportion Column */}
      <td className="py-4 px-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="w-[230px] h-4 bg-[#DBE7E0] rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300 bg-[#48DE84]"
              style={{ width: `${proportion}%` }}
            />
          </div>
          <span className="text-white w-[60px] text-right">{proportion}%</span>
        </div>
      </td>

      {/* Action Column */}
      <td className="py-4 px-6 text-center">
        <OptionsDropdown
          className="min-h-0 h-[unset] bg-white text-black"
          options={[
            optionsPresets.copy({
              copyText: token?.address ?? '',
              displayText: 'Copy Token address',
              copysSuccessText: 'Token address copied',
            }),
            optionsPresets.importTokenToWallet({
              token: token,
            }),
            optionsPresets.viewOnExplorer({
              address: token?.address ?? '',
            }),
          ]}
        />
      </td>
    </tr>
  );
});

export default TokenBalanceCard;

import { Input } from '@/components/algebra/ui/input';
import { formatBalance } from '@/lib/algebra/utils/common/formatBalance';
import { Currency, Percent, ExtendedNative } from '@cryptoalgebra/sdk';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useAccount, useBalance, useWatchBlockNumber } from 'wagmi';
import { Address, zeroAddress } from 'viem';
import { TokenSelector } from '@honeypot/shared/components/TokenSelector';
import { Token as AlgebraToken } from '@cryptoalgebra/sdk';
import { wallet } from '@honeypot/shared/lib/wallet';

import { Token } from '@honeypot/shared/lib/contract/token/token';
import { debounce } from 'lodash';

import { cn } from '@/lib/tailwindcss';
import Layer2Container from '../../Layer2Container';
import { Wallet2Icon } from 'lucide-react';

interface TokenSwapCardProps {
  handleTokenSelection: (currency: Currency) => void;
  handleValueChange?: (value: string) => void;
  handleMaxValue?: () => void;
  value: string;
  currency: Currency | null | undefined;
  otherCurrency: Currency | null | undefined;
  fiatValue?: ReactNode;
  priceImpact?: Percent;
  showMaxButton?: boolean;
  showBalance?: boolean;
  showNativeToken?: boolean;
  disabled?: boolean;
  label?: string;
  disableSelection?: boolean;
  showInput?: boolean;
  showSettings?: boolean;
  staticTokenList?: Token[];
}

const TokenCardMultichain = ({
  handleTokenSelection,
  handleValueChange,
  handleMaxValue,
  value,
  currency,
  otherCurrency,
  fiatValue,
  showMaxButton,
  showBalance = true,
  showNativeToken,
  disabled,
  label,
  showInput = true,
  showSettings = true,
  disableSelection,
  staticTokenList,
}: TokenSwapCardProps) => {
  const { address: account } = useAccount();
  useWatchBlockNumber({
    onBlockNumber: () => {
      refetch();
    },
  });
  const [storedValue, setStoredValue] = useState(value);

  const {
    data: balance,
    isLoading,
    refetch,
  } = useBalance({
    address: account,
    token: currency?.isNative
      ? undefined
      : (currency?.wrapped.address as Address),
  });

  useEffect(() => {
    setStoredValue(value);
  }, [value]);

  const balanceString = useMemo(() => {
    if (!account) return '';
    if (isLoading || !balance) return 'Loading...';
    return formatBalance(balance.formatted);
  }, [balance, isLoading, account]);

  const handleInput = useMemo(
    () =>
      debounce((value: string) => {
        if (value === '.') value = '0.';
        console.log('value', value);
        handleValueChange?.(value);
      }, 200),
    []
  );

  const handleTokenSelect = (newCurrency: Currency) => {
    handleTokenSelection(newCurrency);
  };

  return (
    <Layer2Container className="flex">
      <div className="text-gray-300 flex flex-col px-2">
        <div>
          {' '}
          <div className="text-[#E7CDB1] text-xs">{label}</div>
        </div>

        <div className="flex flex-col items-start">
          <input
            disabled={disabled}
            type="text"
            value={storedValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setStoredValue(e.target.value);
              handleInput(e.target.value);
            }}
            placeholder="0.0"
            style={{
              fontFamily: 'Anonymous Pro, monospace',
              fontWeight: 700,
              fontStyle: 'normal',
              fontSize: '20px',
              lineHeight: '115%',
              letterSpacing: '-0.02em',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'white',
              width: '100%',
            }}
            className="placeholder:text-gray-500"
          />
          {showBalance && fiatValue && (
            <div className="text-[#E7CDB1] text-xs">{fiatValue}</div>
          )}
        </div>
      </div>

      <div className="">
        <div className="flex-grow flex flex-col justify-end w-full gap-1">
          <div className="bg-[#FFFFFF1A]/10 rounded-full border-1 border-[#86715B]">
            <TokenSelector
              staticTokenList={staticTokenList}
              disableTools={true}
              value={
                currency
                  ? (() => {
                      // For wrapped native tokens, check if address matches wrapped native token
                      const currencyAddress = currency.isNative
                        ? undefined
                        : currency.isToken
                        ? (currency as any).address
                        : undefined;
                      const isWrappedNative =
                        !currency.isNative &&
                        currencyAddress?.toLowerCase() ===
                          wallet.currentChain?.wrappedNativeToken?.address?.toLowerCase();

                      // Find the token in the validated tokens list first
                      const validatedToken = currency.isNative
                        ? wallet.currentChain.validatedTokens?.find(
                            (t) => t.isNative
                          )
                        : wallet.currentChain.validatedTokens?.find(
                            (t) =>
                              !t.isNative &&
                              t.address.toLowerCase() ===
                                currencyAddress?.toLowerCase()
                          );

                      if (validatedToken) {
                        // If it's the wrapped native token, ensure it has the correct symbol
                        if (
                          !currency.isNative &&
                          isWrappedNative &&
                          wallet.currentChain?.wrappedNativeToken
                        ) {
                          // Create a new token with the correct symbol for wrapped native
                          const correctedToken = Token.getToken({
                            ...validatedToken,
                            symbol:
                              wallet.currentChain.wrappedNativeToken.symbol ||
                              validatedToken.symbol,
                            name:
                              wallet.currentChain.wrappedNativeToken.name ||
                              validatedToken.name,
                          });
                          return correctedToken;
                        }

                        return validatedToken;
                      }

                      // Create a new token if not found
                      // Override symbol for wrapped native tokens since SDK has wrong symbol
                      let tokenSymbol = currency.symbol;
                      let tokenName = currency.name;
                      if (
                        isWrappedNative &&
                        wallet.currentChain?.wrappedNativeToken
                      ) {
                        tokenSymbol =
                          wallet.currentChain.wrappedNativeToken.symbol ||
                          currency.symbol;
                        tokenName =
                          wallet.currentChain.wrappedNativeToken.name ||
                          currency.name;
                      }

                      const token = Token.getToken({
                        address: currency.isNative
                          ? '0x0000000000000000000000000000000000000000'
                          : currencyAddress || '',
                        isNative: currency.isNative,
                        chainId: wallet.currentChainId.toString(),
                        symbol: tokenSymbol,
                        name: tokenName,
                        decimals: currency.decimals,
                        // For native tokens or wrapped native, use appropriate logo
                        logoURI: currency.isNative
                          ? wallet.currentChain?.nativeToken?.logoURI ||
                            wallet.currentChain?.wrappedNativeToken?.logoURI
                          : isWrappedNative
                          ? wallet.currentChain?.wrappedNativeToken?.logoURI
                          : undefined,
                      });
                      return token;
                    })()
                  : undefined
              }
              disableSelection={disableSelection}
              onSelect={async (token) => {
                await token.init();

                // Check if this is the wrapped native token
                const isWrappedNative =
                  !token.isNative &&
                  token.address?.toLowerCase() ===
                    wallet.currentChain?.wrappedNativeToken?.address?.toLowerCase();

                // Use the correct symbol for wrapped native tokens
                const tokenSymbol =
                  isWrappedNative &&
                  wallet.currentChain?.wrappedNativeToken?.symbol
                    ? wallet.currentChain.wrappedNativeToken.symbol
                    : token.symbol;
                const tokenName =
                  isWrappedNative &&
                  wallet.currentChain?.wrappedNativeToken?.name
                    ? wallet.currentChain.wrappedNativeToken.name
                    : token.name;

                handleTokenSelect(
                  token.isNative
                    ? ExtendedNative.onChain(
                        wallet.currentChainId,
                        wallet.currentChain.nativeToken.symbol,
                        wallet.currentChain.nativeToken.name
                      )
                    : new AlgebraToken(
                        wallet.currentChainId,
                        token.address,
                        Number(token.decimals),
                        tokenSymbol,
                        tokenName
                      )
                );
              }}
            />
          </div>
          <div className="flex justify-end text-xs items-center">
            <Wallet2Icon className="pr-1 w-4 " />
            <div className="pr-1 text-[#E7CDB1] text-xs">
              {balanceString} {currency?.symbol}
            </div>

            {showMaxButton && (
              <div className="bg-[#FFFFFF1A]/10 rounded-full border-1 border-[#86715B] px-2">
                <button className="cursor-pointer " onClick={handleMaxValue}>
                  Max
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layer2Container>

    // <Layer2Container className="flex">
    //   <div className="text-gray-300 flex items-center justify-between px-2">
    //     <span>{label}</span>
    //     <div className="flex items-center gap-x-2">
    //       {currency && account && showBalance && (
    //         <div className="flex items-center gap-x-2">
    //           <div>
    //             <span>Balance: </span>
    //             <span>{balanceString}</span>
    //           </div>
    //           {showMaxButton && (
    //             <button
    //               className="cursor-pointer text-[#63b4ff]"
    //               onClick={handleMaxValue}
    //             >
    //               Max
    //             </button>
    //           )}
    //         </div>
    //       )}
    //     </div>
    //   </div>

    //   <div className="w-full rounded-2xl border border-[#333333] bg-[#271A0C] shadow-[0px_332px_93px_0px_rgba(0,0,0,0.00),0px_212px_85px_0px_rgba(0,0,0,0.01),0px_119px_72px_0px_rgba(0,0,0,0.05),0px_53px_53px_0px_rgba(0,0,0,0.09),0px_13px_29px_0px_rgba(0,0,0,0.10)] flex items-center justify-between px-4 py-2.5 gap-x-2">
    //     <div className="grid grid-cols-[max-content_auto] w-full">
    //       <div className="flex-grow">
    //         <TokenSelector
    //           staticTokenList={staticTokenList}
    //           value={
    //             currency
    //               ? (() => {
    //                   // For wrapped native tokens, check if address matches wrapped native token
    //                   const currencyAddress = currency.isNative
    //                     ? undefined
    //                     : currency.isToken
    //                     ? (currency as any).address
    //                     : undefined;
    //                   const isWrappedNative =
    //                     !currency.isNative &&
    //                     currencyAddress?.toLowerCase() ===
    //                       wallet.currentChain?.wrappedNativeToken?.address?.toLowerCase();

    //                   // Find the token in the validated tokens list first
    //                   const validatedToken = currency.isNative
    //                     ? wallet.currentChain.validatedTokens?.find(
    //                         (t) => t.isNative
    //                       )
    //                     : wallet.currentChain.validatedTokens?.find(
    //                         (t) =>
    //                           !t.isNative &&
    //                           t.address.toLowerCase() ===
    //                             currencyAddress?.toLowerCase()
    //                       );

    //                   if (validatedToken) {
    //                     // If it's the wrapped native token, ensure it has the correct symbol
    //                     if (
    //                       !currency.isNative &&
    //                       isWrappedNative &&
    //                       wallet.currentChain?.wrappedNativeToken
    //                     ) {
    //                       // Create a new token with the correct symbol for wrapped native
    //                       const correctedToken = Token.getToken({
    //                         ...validatedToken,
    //                         symbol:
    //                           wallet.currentChain.wrappedNativeToken.symbol ||
    //                           validatedToken.symbol,
    //                         name:
    //                           wallet.currentChain.wrappedNativeToken.name ||
    //                           validatedToken.name,
    //                       });
    //                       return correctedToken;
    //                     }

    //                     return validatedToken;
    //                   }

    //                   // Create a new token if not found
    //                   // Override symbol for wrapped native tokens since SDK has wrong symbol
    //                   let tokenSymbol = currency.symbol;
    //                   let tokenName = currency.name;
    //                   if (
    //                     isWrappedNative &&
    //                     wallet.currentChain?.wrappedNativeToken
    //                   ) {
    //                     tokenSymbol =
    //                       wallet.currentChain.wrappedNativeToken.symbol ||
    //                       currency.symbol;
    //                     tokenName =
    //                       wallet.currentChain.wrappedNativeToken.name ||
    //                       currency.name;
    //                   }

    //                   const token = Token.getToken({
    //                     address: currency.isNative
    //                       ? '0x0000000000000000000000000000000000000000'
    //                       : currencyAddress || '',
    //                     isNative: currency.isNative,
    //                     chainId: wallet.currentChainId.toString(),
    //                     symbol: tokenSymbol,
    //                     name: tokenName,
    //                     decimals: currency.decimals,
    //                     // For native tokens or wrapped native, use appropriate logo
    //                     logoURI: currency.isNative
    //                       ? wallet.currentChain?.nativeToken?.logoURI ||
    //                         wallet.currentChain?.wrappedNativeToken?.logoURI
    //                       : isWrappedNative
    //                       ? wallet.currentChain?.wrappedNativeToken?.logoURI
    //                       : undefined,
    //                   });
    //                   return token;
    //                 })()
    //               : undefined
    //           }
    //           disableSelection={disableSelection}
    //           onSelect={async (token) => {
    //             await token.init();

    //             // Check if this is the wrapped native token
    //             const isWrappedNative =
    //               !token.isNative &&
    //               token.address?.toLowerCase() ===
    //                 wallet.currentChain?.wrappedNativeToken?.address?.toLowerCase();

    //             // Use the correct symbol for wrapped native tokens
    //             const tokenSymbol =
    //               isWrappedNative &&
    //               wallet.currentChain?.wrappedNativeToken?.symbol
    //                 ? wallet.currentChain.wrappedNativeToken.symbol
    //                 : token.symbol;
    //             const tokenName =
    //               isWrappedNative &&
    //               wallet.currentChain?.wrappedNativeToken?.name
    //                 ? wallet.currentChain.wrappedNativeToken.name
    //                 : token.name;

    //             handleTokenSelect(
    //               token.isNative
    //                 ? ExtendedNative.onChain(
    //                     wallet.currentChainId,
    //                     wallet.currentChain.nativeToken.symbol,
    //                     wallet.currentChain.nativeToken.name
    //                   )
    //                 : new AlgebraToken(
    //                     wallet.currentChainId,
    //                     token.address,
    //                     Number(token.decimals),
    //                     tokenSymbol,
    //                     tokenName
    //                   )
    //             );
    //           }}
    //         />
    //       </div>
    //       {showInput && (
    //         <div className="flex flex-col items-end">
    //           <Input
    //             disabled={disabled}
    //             type="text"
    //             value={storedValue}
    //             onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    //               setStoredValue(e.target.value);
    //               handleInput(e.target.value);
    //             }}
    //             className={cn(
    //               'text-right',
    //               '!bg-transparent',
    //               '[&_*]:!bg-transparent',
    //               'data-[invalid=true]:!bg-transparent'
    //             )}
    //             classNames={{
    //               inputWrapper: cn(
    //                 '!bg-transparent',
    //                 'border-none',
    //                 'shadow-none',
    //                 '!transition-none',
    //                 'data-[invalid=true]:!bg-transparent',
    //                 'group-data-[invalid=true]:!bg-transparent'
    //               ),
    //               input: cn(
    //                 '!bg-transparent',
    //                 '!text-white',
    //                 'text-right',
    //                 'text-xl',
    //                 '!pr-0',
    //                 '[appearance:textfield]',
    //                 '[&::-webkit-outer-spin-button]:appearance-none',
    //                 '[&::-webkit-inner-spin-button]:appearance-none',
    //                 'data-[invalid=true]:!bg-transparent'
    //               ),
    //               clearButton: cn(
    //                 'opacity-70',
    //                 'hover:opacity-100',
    //                 '!text-gray-400',
    //                 '!p-0',
    //                 'end-0 start-auto'
    //               ),
    //             }}
    //             placeholder="0.0"
    //             maxDecimals={currency?.decimals ?? 0 + 2}
    //           />
    //           {showBalance && fiatValue && (
    //             <div className="text-sm">{fiatValue}</div>
    //           )}
    //         </div>
    //       )}
    //     </div>
    //   </div>
    // </Layer2Container>
  );
};

export default TokenCardMultichain;

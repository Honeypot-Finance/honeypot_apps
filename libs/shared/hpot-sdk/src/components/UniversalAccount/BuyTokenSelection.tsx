import { observer } from 'mobx-react-lite';
import { TokenSelector } from '../TokenSelector';
import TokenCard from '../TokenCard/TokenCard';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Token as AlgebraToken, ExtendedNative } from '@cryptoalgebra/sdk';
import { Token } from '../../lib/contract';
import buyWithUniversalAccountService from '../../services/particleUniversalAccount/buyWithUniversalAccountService';
import { Input } from '../input';
import { cn } from '@nextui-org/react';
import { zeroAddress } from 'viem';

export const BuyTokenSelection = observer(() => {
  const buyToken = buyWithUniversalAccountService.buyToken;
  const buyTokenAmount = buyWithUniversalAccountService.buyTokenAmount;
  const accountSpendAmountUSD =
    buyWithUniversalAccountService.accountSpendAmountUSD;

  return (
    <div className="w-full flex flex-col gap-2  rounded-lg p-1 justify-center items-center">
      <div className="w-full  rounded-2xl border bg-card-dark shadow-[0px_332px_93px_0px_rgba(0,0,0,0.00),0px_212px_85px_0px_rgba(0,0,0,0.01),0px_119px_72px_0px_rgba(0,0,0,0.05),0px_53px_53px_0px_rgba(0,0,0,0.09),0px_13px_29px_0px_rgba(0,0,0,0.10)] flex items-center justify-between px-4 py-2.5 gap-x-2">
        <div className="grid grid-cols-[max-content_auto] w-full justify-between items-center">
          <div>Account USD</div>
          <div className="flex flex-col items-end">
            <Input
              value={accountSpendAmountUSD}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                buyWithUniversalAccountService.setAccountSpendAmountUSD(
                  e.target.value
                );
              }}
              className={cn(
                'text-right',
                '!bg-transparent',
                '[&_*]:!bg-transparent',
                'data-[invalid=true]:!bg-transparent'
              )}
              classNames={{
                inputWrapper: cn(
                  '!bg-transparent',
                  'border-none',
                  'shadow-none',
                  '!transition-none',
                  'data-[invalid=true]:!bg-transparent',
                  'group-data-[invalid=true]:!bg-transparent'
                ),
                input: cn(
                  '!bg-transparent',
                  '!text-[#202020]',
                  'text-right',
                  'text-xl',
                  '!pr-0',
                  '[appearance:textfield]',
                  '[&::-webkit-outer-spin-button]:appearance-none',
                  '[&::-webkit-inner-spin-button]:appearance-none',
                  'data-[invalid=true]:!bg-transparent'
                ),
                clearButton: cn(
                  'opacity-70',
                  'hover:opacity-100',
                  '!text-black',
                  '!p-0',
                  'end-0 start-auto'
                ),
              }}
              placeholder="0.0"
            />
          </div>
        </div>
      </div>

      <TokenCard
        showBalance={false}
        showAdvancedInput={false}
        handleTokenSelection={(token) =>
          buyWithUniversalAccountService.setBuyToken(
            Token.getToken({
              address: token.isNative
                ? wallet.currentChain.nativeToken.address
                : token.wrapped?.address ?? zeroAddress,
              chainId:
                token.wrapped?.chainId.toString() ??
                wallet.currentChain.chainId.toString(),
              isNative: token.isNative,
            })
          )
        }
        value={buyTokenAmount}
        handleValueChange={(value) =>
          buyWithUniversalAccountService.setBuyTokenAmount(value)
        }
        currency={
          buyToken &&
          (buyToken.isNative
            ? ExtendedNative.onChain(
                Number(buyToken?.chainId ?? wallet.currentChain.chainId),
                buyToken?.symbol ?? '',
                buyToken?.name ?? ''
              )
            : new AlgebraToken(
                Number(buyToken?.chainId),
                buyToken?.address ?? '',
                Number(buyToken?.decimals),
                buyToken?.symbol ?? '',
                buyToken?.name ?? ''
              ))
        }
        otherCurrency={null}
      />
    </div>
  );
});

import { observer, useLocalObservable } from 'mobx-react-lite';
import { FtoPairContract } from '@/services/contract/launches/fto/ftopair-contract';
import { Button } from '@/components/button/button-next';
import { MemePairContract } from '@/services/contract/launches/pot2pump/memepair-contract';
import { LaunchDetailSwapCard } from '@/components/SwapCard/MemeSwap';
import { DedicatedSwapCard } from '@/components/SwapCard/MemeSwap';
import PottingModal from '@/components/atoms/Pot2PumpComponents/PottingModal';
import { wallet } from '@honeypot/shared/lib/wallet';

import { SwapField } from '@/types/algebra/types/swap-field';
import { useDerivedSwapInfo } from '@/lib/algebra/state/swapStore';
import { DedicatedPot2Pump } from '@/config/dedicatedPot2pump';

const SuccessAction = observer(
  ({
    pair,
    refreshTxsCallback,
  }: {
    pair: FtoPairContract | MemePairContract;
    refreshTxsCallback?: () => void;
  }) => {
    const {
      toggledTrade: trade,
      currencyBalances,
      parsedAmount,
      currencies,
    } = useDerivedSwapInfo();
    return (
      <LaunchDetailSwapCard
        noBoarder
        inputAddress={pair.raiseToken?.address ?? ''}
        outputAddress={pair.launchedToken?.address}
        memePairContract={pair as MemePairContract}
        onSwapSuccess={refreshTxsCallback}
        isInputNative={
          pair.raiseToken?.address.toLowerCase() ===
          wallet.currentChain.nativeToken.address.toLowerCase()
        }
        disableFromSelection={false}
        disableToSelection={false}
      />
    );
  }
);

const FailAction = observer(
  ({
    pair,
    refreshTxsCallback,
  }: {
    pair: FtoPairContract | MemePairContract;
    refreshTxsCallback?: () => void;
  }) => {
    console.log(pair);
    if (pair instanceof MemePairContract) {
      pair.getCanRefund();
    }
    return (
      <div className="flex flex-col gap-[16px]">
        {pair instanceof FtoPairContract && pair.isProvider && (
          <Button
            className="w-full"
            isLoading={pair.withdraw.loading}
            onClick={() => {
              pair.withdraw.call();
            }}
          >
            Provider Withdraw
          </Button>
        )}
        {(pair as MemePairContract).canRefund ? (
          <Button
            className="w-full"
            onClick={() => {
              (pair as MemePairContract).refund.call();
            }}
            isLoading={(pair as MemePairContract).refund.loading}
            style={{
              backgroundColor: 'green',
            }}
          >
            Refund LP
          </Button>
        ) : (
          <Button className="w-full bg-gray-500" disabled>
            You have Refunded
          </Button>
        )}
      </div>
    );
  }
);

const ProcessingAction = observer(
  ({
    pair,
    refreshTxsCallback: onSuccess,
  }: {
    pair: FtoPairContract | MemePairContract;
    refreshTxsCallback?: () => void;
  }) => {
    return <PottingModal pair={pair} onSuccess={onSuccess} />;
  }
);

const Action = observer(
  ({
    pair,
    refreshTxsCallback,
  }: {
    pair: FtoPairContract | MemePairContract;
    refreshTxsCallback?: () => void;
  }) => {
    if (!wallet.isInit) return null;
    switch (pair.state) {
      case 0:
        return (
          <SuccessAction pair={pair} refreshTxsCallback={refreshTxsCallback} />
        );
      case 1:
        return (
          <FailAction pair={pair} refreshTxsCallback={refreshTxsCallback} />
        );
      case 2:
        return <>Case 2</>;
      case 3:
        if (pair.isCompleted) {
          return <></>;
        }
        return (
          <ProcessingAction
            pair={pair}
            refreshTxsCallback={refreshTxsCallback}
          />
        );
    }
  }
);

export const DedicatedAction = observer(
  ({
    token,
    refreshTxsCallback,
  }: {
    token: DedicatedPot2Pump;
    refreshTxsCallback?: () => void;
  }) => {
    const {
      toggledTrade: trade,
      currencyBalances,
      parsedAmount,
      currencies,
    } = useDerivedSwapInfo();
    return (
      <DedicatedSwapCard
        noBoarder
        inputAddress={wallet.currentChain.nativeToken.address.toLowerCase()}
        outputAddress={token.tokenAddress}
        onSwapSuccess={refreshTxsCallback}
        isInputNative={
          wallet.currentChain.nativeToken.address.toLowerCase() ===
          token.tokenAddress.toLowerCase()
        }
        disableFromSelection={
          token.tokenAddress.toLowerCase() ===
          currencies[SwapField.INPUT]?.wrapped.address.toLowerCase()
        }
        disableToSelection={
          token.tokenAddress.toLowerCase() ===
          currencies[SwapField.OUTPUT]?.wrapped.address.toLowerCase()
        }
      />
    );
  }
);

export default Action;

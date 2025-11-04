import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/algebra/ui/hover-card';
import TokenRatio from '../TokenRatio';
import { Currency } from '@cryptoalgebra/sdk';
import { usePositionAPR } from '@/lib/algebra/hooks/positions/usePositionAPR';
import { getPoolAPR } from '@/lib/algebra/utils/pool/getPoolAPR';
import AddLiquidityButton from '../AddLiquidityButton';
import { Address } from 'viem';
import { useEffect, useState } from 'react';
import EnterAmounts from '../EnterAmounts';
import IncreaseLiquidityButton from '@/components/algebra/position/IncreaseLiquidityButton';
import { IDerivedMintInfo } from '@/lib/algebra/state/mintStore';
import { ManageLiquidity } from '@/types/algebra/types/manage-liquidity';
import { useRouter } from 'next/router';

interface AmountsSectionProps {
  tokenId?: number;
  currencyA: Currency | undefined;
  currencyB: Currency | undefined;
  mintInfo: IDerivedMintInfo;
  manageLiquidity: ManageLiquidity;
  handleCloseModal?: () => void;
  useNative: boolean;
  setUseNative: (useNative: boolean) => void;
}

type NewPositionPageParams = Record<'pool', Address>;

const AmountsSection = ({
  tokenId,
  currencyA,
  currencyB,
  mintInfo,
  manageLiquidity,
  handleCloseModal,
  useNative,
  setUseNative,
}: AmountsSectionProps) => {
  const router = useRouter();
  const { pool: poolAddress } = router.query as { pool: Address };

  const [poolAPR, setPoolAPR] = useState<number>();
  const apr = usePositionAPR(poolAddress, mintInfo.position);

  useEffect(() => {
    if (!poolAddress) return;
    getPoolAPR(poolAddress).then(setPoolAPR);
  }, [poolAddress]);

  return (
    <div className="flex flex-col gap-4">
      <EnterAmounts
        useNative={useNative}
        setUseNative={setUseNative}
        currencyA={currencyA}
        currencyB={currencyB}
        mintInfo={mintInfo}
      />

      <div className="w-full rounded-lg border bg-[#1F150A] p-4 border-[#3B2712]">
        <HoverCard>
          <HoverCardTrigger>
            <TokenRatio mintInfo={mintInfo} />
          </HoverCardTrigger>
          <HoverCardContent className="flex flex-col gap-2 bg-[#271A0C] border border-[#3B2712] rounded-lg p-4">
            <div className="flex items-center">
              <span className="font-medium text-white">Token Ratio</span>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      <div className="w-full rounded-lg border bg-[#1F150A] border-[#3B2712] p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-[#E7CDB1] font-gliker uppercase mb-1">
              Estimated Position APR
            </div>
            <div className="text-lg font-bold text-[#BFEECA] font-gliker">
              {apr ? `${apr.toFixed(2)}%` : '0%'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-[#E7CDB1] font-gliker uppercase mb-1">
              Pool APR
            </div>
            <div className="text-lg font-bold text-[#BFEECA] font-gliker">
              {poolAPR !== undefined ? `${poolAPR}%` : '0%'}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex items-center justify-center rounded-lg">
        {manageLiquidity === ManageLiquidity.INCREASE && (
          <IncreaseLiquidityButton
            tokenId={tokenId}
            baseCurrency={currencyA}
            quoteCurrency={currencyB}
            mintInfo={mintInfo}
            handleCloseModal={handleCloseModal}
          />
        )}
        {manageLiquidity === ManageLiquidity.ADD && (
          <AddLiquidityButton
            baseCurrency={currencyA}
            quoteCurrency={currencyB}
            mintInfo={mintInfo}
            poolAddress={poolAddress}
          />
        )}
      </div>
    </div>
  );
};

export default AmountsSection;

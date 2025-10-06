import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { NextLayoutPage } from '@/types/nextjs';
import { wallet } from '@honeypot/shared/lib/wallet';
import Image from 'next/image';
import { chart } from '@/services/chart';
import Action from './components/Action';
import Tabs from './components/Tabs';
import ProjectTitle from './components/ProjectTitle';
import KlineChart from './components/KlineChart';
import { LaunchDataProgress } from './components/LaunchDataProgress';
import { cn } from '@/lib/tailwindcss';
import CardContainer from '@/components/CardContianer/v3';
import ProjectDescription from './components/ProjectDescription';
import ProjectStats from './components/ProjectStats';
import { useLaunchTokenQuery } from '@/lib/hooks/useLaunchTokenQuery';
import { Pot2Pump } from '@/lib/algebra/graphql/generated/graphql';
import { pot2PumpToMemePair } from '@/lib/algebra/graphql/clients/pair';
import NotConnetctedDisplay from '@/components/NotConnetctedDisplay/NotConnetctedDisplay';

export const MemeView = observer(() => {
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const { pair: launchTokenAddress } = router.query;

  const { data: pairData, loading: pot2PumpLoading } = useLaunchTokenQuery(
    launchTokenAddress as string
  );

  const pair = useMemo(() => {
    if (pairData?.pot2Pumps?.[0]) {
      return pot2PumpToMemePair(pairData.pot2Pumps[0] as Partial<Pot2Pump>);
    }
  }, [pairData]);

  useEffect(() => {
    if (pair) {
      pair.getProjectInfo(true);
    }
  }, [pair]);

  useEffect(() => {
    if (!pair?.launchedToken) {
      return;
    }
    chart.setCurrencyCode('USD');
    chart.setTokenNumber(0);
    chart.setChartTarget(pair.launchedToken);
    chart.setChartLabel(pair.launchedToken?.displayName + '/USD');

    // Set token supply if available
    if (pair.launchedToken) {
      chart.setTokenSupply(
        pair.launchedToken.totalSupplyWithoutDecimals.div(
          10 ** pair.launchedToken.decimals
        )
      );
    }
  }, [pair, pair?.launchedToken]);

  return (
    <div className="w-full px-2 sm:px-4 md:px-8 xl:px-0 space-y-4 md:space-y-8 xl:max-w-[1200px] 2xl:max-w-[1500px] mx-auto">
      <CardContainer type="default" showBottomBorder={false}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-4 md:gap-x-4 md:gap-y-14 w-full @container">
          <div
            className={cn(
              'relative bg-white col-span-1 lg:col-span-2 px-2 sm:px-4 md:px-8 py-3 md:py-5 rounded-xl sm:rounded-3xl',
              'grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 text-[#202020]'
            )}
          >
            <ProjectTitle
              className="col-span-1"
              pair={pair ?? undefined}
              name={pair?.launchedToken?.name}
              displayName={pair?.launchedToken?.displayName}
              telegram={pair?.telegram}
              twitter={pair?.twitter}
              website={pair?.website}
              address={pair?.launchedToken?.address}
              statusColor={pair?.ftoStatusDisplay?.color}
              status={pair?.ftoStatusDisplay?.status}
              isValidated={pair?.isValidated}
            />
            <ProjectDescription
              className="col-span-1"
              description={pair?.description}
            />
            <ProjectStats className="col-span-1" pair={pair} />
          </div>

          <CardContainer
            variant="dark"
            loading={!pair}
            loadingSize={200}
            loadingText="Loading Data..."
            className={cn('relative min-h-[500px] px-1 sm:px-2 md:px-4')}
          >
            {pair?.state === 0 && (
              <div className="md:block w-full">
                <KlineChart height={500} />
              </div>
            )}

            {pair?.state === 1 && (
              <div className="flex flex-col gap-y-3 md:gap-y-5">
                <div className="flex flex-col gap-y-2">
                  <h2 className="text-xl md:text-2xl font-bold text-black text-center w-full">
                    This Project has Failed!
                  </h2>
                  <Image
                    className="w-full h-auto"
                    src="/images/bera/deadfaceBear.webp"
                    width={1000}
                    height={0}
                    alt="dead face"
                  />
                </div>
              </div>
            )}

            {pair?.state === 3 && <LaunchDataProgress pair={pair} />}
          </CardContainer>

          <div className="bg-transparent rounded-2xl space-y-3 col-span-1">
            {!wallet.isInit ? (
              <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center">
                <div className="text-[#eee369] text-xl text-center">
                  Initializing wallet...
                </div>
              </div>
            ) : wallet.isInit && pair ? (
              <Action pair={pair} refreshTxsCallback={triggerRefresh} />
            ) : (
              <NotConnetctedDisplay />
            )}
          </div>
        </div>

        <div className="mt-6 md:mt-16 w-full">
          {pair && <Tabs pair={pair} refreshTrigger={refreshTrigger} />}
        </div>
      </CardContainer>
    </div>
  );
});

export default MemeView;

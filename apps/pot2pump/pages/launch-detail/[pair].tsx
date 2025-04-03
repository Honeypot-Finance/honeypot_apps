import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { NextLayoutPage } from '@/types/nextjs';
import { wallet } from '@/services/wallet';
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
import { MemeView } from './MemeView';
import { DedicatedTokenView } from './DedicatedTokenView';
import { dedicatedPot2pumps } from '@/config/dedicatedPot2pump';
import { chain } from '@/services/chain';
import { LoadingDisplay } from '@/components/LoadingDisplay/LoadingDisplay';

const LaunchPage: NextLayoutPage = observer(() => {
  const router = useRouter();
  const { pair: launchTokenAddress } = router.query;
  console.log(launchTokenAddress);

  if (!chain.isInit) {
    return <LoadingDisplay />;
  }

  if (
    dedicatedPot2pumps.some(
      (token) =>
        token.tokenAddress.toLowerCase() ===
        launchTokenAddress?.toString().toLowerCase()
    )
  ) {
    return <DedicatedTokenView />;
  }

  return <MemeView />;
});

export default LaunchPage;

import { observer } from 'mobx-react-lite';
import { NextLayoutPage } from '@/types/nextjs';
import CardContainer from '@/components/CardContianer/v3';
import {
  BuyOrderListBgtMarket,
  SellOrdersListBgtMarket,
} from '@/components/BGT-Vault/OrdersList';
import { UserBgtVaults } from '@/components/BGT-Vault/UserBgtVaults';
import { globalService } from '@/services/global';
import { SellOrdersListHeyBgt } from '@/components/BGT-Vault/OrdersList/SellOrdersListHeyBgt';
import { BuyOrderListHeyBgt } from '@/components/BGT-Vault/OrdersList/BuyOrderListHeyBgt';
import {
  HeyBgtPostOrderModal,
  BgtMarketPostOrderModal,
} from '../components/BGT-Vault/new-order';
import { usePollingBlockNumber } from '@/lib/hooks/useBlockNumber';
import { useEffect } from 'react';
import { wallet } from '@honeypot/shared/lib/wallet';
import { bgtRegistry } from '@/services/contract/bgt-registry';

const HomePage: NextLayoutPage = observer(() => {
  const { block } = usePollingBlockNumber();

  useEffect(() => {
    if (bgtRegistry.heyBgt) {
      bgtRegistry.heyBgt.getBeraPrice();
    }
  }, [block, bgtRegistry.heyBgt]);

  return (
    <div className="w-screen h-full p-2">
      <div className="lg:grid grid-cols-[1fr_400px] gap-2">
        <CardContainer className="col-start-2 lg:grid grid-cols-1 grid-rows-[1fr_1fr]">
          <UserBgtVaults />
          {globalService.BgtMarketBaseToken === 'BERA' && (
            <BgtMarketPostOrderModal />
          )}
          {globalService.BgtMarketBaseToken === 'HONEY' && (
            <HeyBgtPostOrderModal />
          )}
        </CardContainer>

        <CardContainer className="row-start-1 lg:grid grid-cols-1 grid-rows-[1fr_1fr]">
          {globalService.BgtMarketBaseToken === 'BERA' && (
            <>
              <SellOrdersListBgtMarket />
              <BuyOrderListBgtMarket />
            </>
          )}
          {globalService.BgtMarketBaseToken === 'HONEY' && (
            <>
              <SellOrdersListHeyBgt />
              <BuyOrderListHeyBgt />
            </>
          )}
        </CardContainer>
      </div>
    </div>
  );
});

export default HomePage;

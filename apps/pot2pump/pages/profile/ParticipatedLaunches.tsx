import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
import { Pot2PumpService } from '@/services/launchpad/pot2pump';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Tab, Tabs } from '@nextui-org/react';
import Pagination from '@/components/Pagination/Pagination';
import { LaunchCardV3 } from '@/components/LaunchCard/v3';
import { MemePairContract } from '@/services/contract/launches/pot2pump/memepair-contract';
import {
  canClaimPot2Pump,
  canRefundPot2Pump,
} from '@/lib/algebra/graphql/clients/pot2pump';
import { Button } from '@/components/algebra/ui/button';
import { Address } from 'viem';

export const ParticipatedLaunches = observer(() => {
  const [myProjects, setMyProjects] = useState<Pot2PumpService>();
  const [canClaimPot2PumpList, setCanClaimPot2PumpList] = useState<
    MemePairContract[]
  >([]);
  const [canRefundPot2PumpList, setCanRefundPot2PumpList] = useState<
    MemePairContract[]
  >([]);
  const [claimAllLoading, setClaimAllLoading] = useState(false);
  const [refundAllLoading, setRefundAllLoading] = useState(false);


  useEffect(() => {
    if (!wallet.isInit) {
      return;
    }
    initPot2Pumps();
  }, [wallet.isInit]);

  const initPot2Pumps = () => {
    const newPumpingProjects = new Pot2PumpService();
    setMyProjects(newPumpingProjects);
    newPumpingProjects.participatedPairs.reloadPage();
    canClaimPot2Pump(wallet.account).then((res) => {
      setCanClaimPot2PumpList(res);
    });
    canRefundPot2Pump(wallet.account).then((res) => {
      setCanRefundPot2PumpList(res);
    });
  };

  return (
    <div className="w-full relative custom-dashed-3xl bg-white p-6">
      <div className="text-4xl flex justify-between  gap-4 absolute top-8 left-6">
        <div>Participated Launch</div>
        <div className="flex gap-4 text-sm z-10">
          {canClaimPot2PumpList?.length > 0 && (
            <Button
              onClick={async () => {
                setClaimAllLoading(true);
                try {
                  await wallet.contracts.memeFacade.claimAllUserLP.call(
                    [
                      wallet.account as Address,
                      canClaimPot2PumpList.map(
                        (pair) => pair.launchedToken?.address as Address
                      ),
                    ],
                    {
                      gas: BigInt(10000000),
                    }
                  ).then(() => {
                    setCanClaimPot2PumpList([]);
                    canClaimPot2PumpList.forEach((pair) => {
                      pair.canClaimLP = false;
                    });
                  });
                } catch (err: any) {
                  console.error(err);
                } finally {
                  setClaimAllLoading(false);
                }
              }}
              disabled={!wallet.account || claimAllLoading}
              className="ml-[-1px] rounded-[8px] border border-black bg-[#FFCD4D] p-2 text-[#202020] shadow-[2px_2px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_1px_0px_0px_#000] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {claimAllLoading ? "Claiming..." : "Claim All"}
            </Button>
          )}
          {canRefundPot2PumpList.length > 0 && (
            <Button
              onClick={async () => {
                setRefundAllLoading(true);
                try {
                  await wallet.contracts.memeFacade.refundAllUserToken.call(
                    [
                      wallet.account as Address,
                      canRefundPot2PumpList.map(
                        (pair) => pair.launchedToken?.address as Address
                      ),
                    ],
                    {
                      gas: BigInt(10000000),
                    }
                  ).then(() => {
                    setCanRefundPot2PumpList([]);
                    canRefundPot2PumpList.forEach((pair) => {
                      pair.canRefund = false;
                    });
                  });
              
                } catch (err: any) {
                  console.error(err);
                } finally {
                  setRefundAllLoading(false);
                }
              }}
              disabled={!wallet.account || refundAllLoading}
              className="ml-[-1px] rounded-[8px] border border-black bg-[#FFCD4D] p-2 text-[#202020] shadow-[2px_2px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_1px_0px_0px_#000] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refundAllLoading ? "Refunding..." : "Refund All"}
            </Button>
          )}
        </div>
      </div>
      <Tabs
        classNames={{
          base: 'relative w-full',
          tabList:
            'flex rounded-2xl border border-[#202020] bg-white p-4 shadow-[4px_4px_0px_0px_#202020,-4px_4px_0px_0px_#202020] py-2 px-3.5 mb-6 ml-auto z-10',
          cursor:
            'bg-[#FFCD4D] border border-black shadow-[2px_2px_0px_0px_#000000] text-sm',
          panel: 'w-full',
          tabContent: '!text-[#202020]',
        }}
      >
        <Tab key="participated" title="Participated">
          {myProjects && (
            <Pagination
              paginationState={myProjects.participatedPairs}
              render={(project) => (
                <LaunchCardV3
                  key={project.address}
                  pair={project}
                  action={<></>}
                  theme="dark"
                />
              )}
              classNames={{
                base: '',
                itemsContainer:
                  'grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:gap-6',
                item: '',
              }}
            />
          )}
        </Tab>
        <Tab key="can-claim" title="Can Claim">
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:gap-6">
            {canClaimPot2PumpList.map((pair) => (
              <LaunchCardV3 key={pair.address} pair={pair} action={<></>} />
            ))}
          </div>
        </Tab>
        <Tab key="can-refund" title="Can Refund">
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:gap-6">
            {canRefundPot2PumpList.map((pair) => (
              <LaunchCardV3 key={pair.address} pair={pair} action={<></>} />
            ))}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
});

export default ParticipatedLaunches;

'use client';

import { OrbiterBridgeSelectToken } from '../../../components/Bridge/OrbiterBridge/OrbiterBridgeSelectToken';
import OrbiterBridgeSelectNetwork from '../../../components/Bridge/OrbiterBridge/OrbiterBridgeSelectNetwork';
import { ArrowLeftRight, ArrowUpDown } from 'lucide-react';
import { orbiterBridgeService } from '@/services/orbiterBridge';
import OrbiterBridgeAmountInput from '../../../components/Bridge/OrbiterBridge/OrbiterBridgeAmountInput';
import OrbiterBridgeParams from '../../../components/Bridge/OrbiterBridge/OrbiterBridgeParams';
import OrbiterBridgeButton from '../../../components/Bridge/OrbiterBridge/OrbiterBridgeButton';
import { observer } from 'mobx-react-lite';

export const OrbiterBridge = observer(() => {
  const handleSwapNetworks = () => {
    const fromChainId = orbiterBridgeService.fromChainId;
    const toChainId = orbiterBridgeService.toChainId;

    orbiterBridgeService.setFromChainId(toChainId || '');
    orbiterBridgeService.setToChainId(fromChainId || '');
  };

  return (
    <div className="w-full flex justify-center items-center mt-5">
      <div className="flex flex-col gap-1 justify-center items-center relative custom-dashed px-[18px] py-6 max-w-[512px] w-full bg-[#271A0C]">
        <OrbiterBridgeSelectToken />
        <div className="flex w-full gap-1 justify-between items-center">
          <OrbiterBridgeSelectNetwork type="from" />
          <OrbiterBridgeAmountInput type="from" />
        </div>
        <div className="flex w-full items-center gap-[5px]">
          <div className=" h-px flex-[1_0_0] bg-[#363636]/30 rounded-[100px]"></div>
          <div
            className=" cursor-pointer hover:rotate-180 transition-all rounded-[10px] bg-[#FFCD4D] border border-black text-black p-2.5 shadow-[1.25px_2.5px_0px_0px_#000]"
            onClick={handleSwapNetworks}
          >
            <ArrowLeftRight className="size-5" />
          </div>
          <div className=" h-px flex-[1_0_0] bg-[#363636]/30 rounded-[100px]"></div>
        </div>
        <div className="flex w-full gap-1 justify-between items-center">
          <OrbiterBridgeSelectNetwork type="to" />
          <OrbiterBridgeAmountInput type="to" />
        </div>
        {orbiterBridgeService.bridgeErrorText && (
          <div className="text-red-500 text-sm">
            {orbiterBridgeService.bridgeErrorText}
          </div>
        )}
        <OrbiterBridgeParams />
        <OrbiterBridgeButton />
      </div>
    </div>
  );
});

export default OrbiterBridge;

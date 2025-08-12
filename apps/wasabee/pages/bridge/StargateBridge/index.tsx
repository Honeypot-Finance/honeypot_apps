import { stargateBridgeService } from '@/services/stargateBridge';
import { ArrowLeftRight } from 'lucide-react';
import StargateBridgeSelectToken from '../../../components/Bridge/StargateBridge/StargateBridgeSelectToken';

export default function StargateBridge() {
  return (
    <div className="w-full flex justify-center items-center mt-5">
      <div className="flex flex-col gap-1 justify-center items-center relative custom-dashed px-[18px] py-6 max-w-[512px] w-full bg-[#271A0C]">
        <StargateBridgeSelectToken />
        {/* <div className="flex w-full gap-1 justify-between items-center">
          <StargateBridgeSelectNetwork type="from" />
          <StargateBridgeAmountInput type="from" />
        </div>
        <div className="flex w-full items-center gap-[5px]">
          <div className=" h-px flex-[1_0_0] bg-[#363636]/30 rounded-[100px]"></div>
          <div
            className=" cursor-pointer hover:rotate-180 transition-all rounded-[10px] bg-[#FFCD4D] border border-black text-black p-2.5 shadow-[1.25px_2.5px_0px_0px_#000]"
            onClick={stargateBridgeService.swapChainIds}
          >
            <ArrowLeftRight className="size-5" />
          </div>
          <div className=" h-px flex-[1_0_0] bg-[#363636]/30 rounded-[100px]"></div>
        </div>
        <div className="flex w-full gap-1 justify-between items-center">
          <StargateBridgeSelectNetwork type="to" />
          <StargateBridgeAmountInput type="to" />
        </div>
        <StargateBridgeParams />
        <StargateBridgeButton /> */}
      </div>
    </div>
  );
}

import { BaseContract } from '@/services/contract';
import { wallet } from '@honeypot/shared/lib/wallet';
import { getContract } from 'viem';
import { makeAutoObservable } from 'mobx';
import { ContractWrite } from '@honeypot/shared/lib/utils/utils';
import { pot2PumpFacadeABI } from '@/lib/abis/Pot2Pump/pot2PumpFacade';

export class MEMEFacadeContract implements BaseContract {
  address = '';
  name: string = '';
  abi = pot2PumpFacadeABI;

  constructor(args: Partial<MEMEFacadeContract>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  get contract() {
    return getContract({
      address: this.address as `0x${string}`,
      abi: this.abi,
      client: { public: wallet.publicClient, wallet: wallet.walletClient },
    });
  }

  get deposit() {
    return new ContractWrite(this.contract.write?.deposit, {
      action: 'Deposit',
      isSuccessEffect: true,
    });
  }

  get claimLP() {
    return new ContractWrite(this.contract.write?.claimLP, {
      action: 'Claim Liquidity Pool',
      isSuccessEffect: true,
    });
  }

  get claimAllUserLP() {
    return new ContractWrite(this.contract.write?.multiClaimLP, {
      action: 'Claim All User LP',
      isSuccessEffect: true,
    });
  }

  get refundAllUserToken() {
    return new ContractWrite(this.contract.write?.multiRefundRaisedToken, {
      action: 'Refund All User Token',
      isSuccessEffect: true,
    });
  }
}

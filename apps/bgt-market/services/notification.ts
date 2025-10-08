import { canClaimPot2Pump } from '@/lib/algebra/graphql/clients/pot2pump';
import { canRefundPot2Pump } from '@/lib/algebra/graphql/clients/pot2pump';
import { makeAutoObservable } from 'mobx';
import { wallet } from '@honeypot/shared/lib/wallet';

class NotificationService {
  isClaimableProject = false;
  isRefundableProject = false;

  constructor() {
    makeAutoObservable(this);
  }

  async checkClaimableProject() {
    if (!wallet.isInit) {
      return;
    }
    const res = await canClaimPot2Pump(wallet.account);
    this.isClaimableProject = res?.length > 0;
  }

  async checkRefundableProject() {
    if (!wallet.isInit) {
      return;
    }
    const res = await canRefundPot2Pump(wallet.account);
    console.log('checkRefundableProject', res);
    this.isRefundableProject = res.length > 0;
    console.log('isRefundableProject', this.isRefundableProject);
  }
}

export const notificationService = new NotificationService();

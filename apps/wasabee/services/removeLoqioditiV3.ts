import { makeAutoObservable } from 'mobx';

import { Token } from '@honeypot/shared/lib/contract/token/token';
import { AsyncState } from '@honeypot/shared/lib/utils/utils';
import { AlgebraPoolContract } from './contract/algebra/algebra-pool-contract';

class RemoveLiquidityV3 {
  currentRemovePair: AlgebraPoolContract | null = null;
  constructor() {
    makeAutoObservable(this);
  }

  setCurrentRemovePair(pair: AlgebraPoolContract) {
    this.currentRemovePair = pair;
  }
}

export const removeLiquidityV3 = new RemoveLiquidityV3();

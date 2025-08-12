import { makeAutoObservable } from 'mobx';

import { Token } from '@honeypot/shared';
import { AsyncState } from '@honeypot/shared';
import { AlgebraPoolContract } from './contract/algebra/algebra-pool-contract';

class CreatePositionV3 {
  pool: AlgebraPoolContract | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setPool(pool: AlgebraPoolContract) {
    this.pool = pool;
  }
}

export const createPositionV3 = new CreatePositionV3();

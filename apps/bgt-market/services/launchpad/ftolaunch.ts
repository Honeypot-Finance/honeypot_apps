import { makeAutoObservable } from 'mobx';
import { PageController } from '../lib/factory';
import { createSiweMessage } from '@/lib/siwe';
import { AsyncState } from '@honeypot/shared/lib/utils/utils';

import { wallet } from '@honeypot/shared/lib/wallet';
import { trpcClient } from '@/lib/trpc';

class ProjectDetail extends PageController {
  updateProject = new AsyncState(
    async (data: {
      pair: string;
      chain_id: number;
      twitter: string;
      telegram: string;
      website: string;
      description: string;
      projectName: string;
    }) => {
      await createSiweMessage(
        wallet.account,
        'Sign In With Honeypot',
        wallet.walletClient
      );
      await trpcClient.projects.createOrUpdateProjectInfo.mutate(data);
    }
  );
  init = new AsyncState(async () => {});
  dispose() {}
}

class ProjectPad {
  init() {}
}

class ProjectLaunch {
  init() {}
}

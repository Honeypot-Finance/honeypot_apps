export interface SubgraphAddresses {
  algebra_info: string;
  algebra_farming: string;
  bgt_market: string;
  lbp: string;
  wasabee_ido: string;
  limit_order: string;
}

export type SubgraphEndpointType = keyof SubgraphAddresses;

export const subgraphAddresses: Record<string, SubgraphAddresses> = {
  default: {
    algebra_info: '',
    algebra_farming: '',
    bgt_market: '',
    lbp: '',
    wasabee_ido: '',
    limit_order: '',
  },
  // berachain mainnet
  '80094': {
    algebra_info:
      'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-algebra-berachain-mainnet/2.5.0/gn',
    algebra_farming:
      'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-algebra-farming/2.0.0/gn',
    bgt_market:
      'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-bgt-market/bgt-market/gn',
    lbp: 'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-lbp/1.0.1/gn',
    wasabee_ido:
      '',
    limit_order:
      'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/limit-orders/v1.0.0/gn',
  },
  //bsc mainnet
  '56': {
    algebra_info:
      'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-algebra-bsc/1.0.5/gn',
    algebra_farming:
      'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-algebra-farming-bsc/1.0.0/gn',
    bgt_market: '',
    lbp: '',
    wasabee_ido: '',
    limit_order: '',
  },
};

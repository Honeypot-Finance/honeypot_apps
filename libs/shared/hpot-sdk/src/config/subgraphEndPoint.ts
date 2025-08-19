export interface SubgraphAddresses {
  algebra_info: string;
  algebra_farming: string;
  bgt_market: string;
  lbp: string;
  wasabee_ido: string;
}

export type SubgraphEndpointType = keyof SubgraphAddresses;

export const subgraphAddresses: Record<string, SubgraphAddresses> = {
  default: {
    algebra_info: '',
    algebra_farming: '',
    bgt_market: '',
    lbp: '',
    wasabee_ido: '',
  },
  // berachain mainnet
  '80094': {
    algebra_info:
      'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-algebra-core/2.4.0/gn',
    algebra_farming:
      'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-algebra-farming/2.0.0/gn',
    bgt_market:
      'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-bgt-market/bgt-market/gn',
    lbp: 'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-lbp/1.0.1/gn',
    wasabee_ido:
      'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/wasabee-ido-berachain-mainnet/2.0.0/gn',
  },
  // bepolia
  '80069': {
    algebra_info:
      'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-algebra-core-bepolia/1.0.0/gn',
    algebra_farming:
      'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-algebra-farming-bepolia/1.0.0/gn',
    bgt_market: '',
    lbp: 'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-lbp-berachain-bepolia/1.0.0/gn',
    wasabee_ido: '',
  },
  //ethereum sepolia
  '11155111': {
    algebra_info: '',
    algebra_farming: '',
    bgt_market: '',
    lbp: 'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-lbp-sepolia/1.0.1/gn',
    wasabee_ido: '',
  },
  //bsc mainnet
  '56': {
    algebra_info:
      'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-algebra-bsc/1.0.0/gn',
    algebra_farming:
      'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-algebra-farming-bsc/1.0.0/gn',
    bgt_market: '',
    lbp: '',
    wasabee_ido: '',
  },
  '10143': {
    algebra_info:
      'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-algebra-monad-testnet/1.0.0/gn',
    algebra_farming:
      'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-algebra-farming-monad-testnet/1.0.0/gn',
    bgt_market: '',
    lbp: '',
    wasabee_ido: '',
  },
};

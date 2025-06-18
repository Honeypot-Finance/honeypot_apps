declare type DefinedTokenHistoryPrice = {
  token: {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
  };
  data: {
    priceUsd: number;
  }[];
};

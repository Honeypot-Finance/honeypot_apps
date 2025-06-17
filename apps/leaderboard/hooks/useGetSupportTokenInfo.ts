const MULTICALL_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';
import {
  Multicall,
  ContractCallContext,
  ContractCallResults,
} from 'ethereum-multicall';
import { erc20Abi } from 'viem';
import { useQuery } from '@tanstack/react-query';

type Payload = {
  tokens: string[];
};

interface TokenInfo {
  decimals: number;
  name: string;
  symbol: string;
  address: string;
}

interface FormattedTokenData {
  [address: string]: TokenInfo;
}

const createContractCallContext = (tokens: string[]) => {
  return tokens.map((tokenAddress) => ({
    reference: tokenAddress,
    contractAddress: tokenAddress,
    abi: erc20Abi,
    calls: [
      {
        reference: 'decimals',
        methodName: 'decimals',
        methodParameters: [],
      },
      {
        reference: 'name',
        methodName: 'name',
        methodParameters: [],
      },
      {
        reference: 'symbol',
        methodName: 'symbol',
        methodParameters: [],
      },
      {
        reference: 'totalSupply',
        methodName: 'totalSupply',
        methodParameters: [],
      },
    ],
  }));
};

const formatTokenResults = (results: ContractCallResults): FormattedTokenData => {
  const formattedData: FormattedTokenData = {};

  Object.keys(results.results).forEach((tokenAddress) => {
    const tokenResult = results.results[tokenAddress];
    const calls = tokenResult.callsReturnContext;

    const decimalsCall = calls.find(call => call.reference === 'decimals');
    const nameCall = calls.find(call => call.reference === 'name');
    const symbolCall = calls.find(call => call.reference === 'symbol');

    if (decimalsCall?.success && nameCall?.success && symbolCall?.success) {
      formattedData[tokenAddress] = {
        decimals: decimalsCall.returnValues[0],
        name: nameCall.returnValues[0],
        symbol: symbolCall.returnValues[0],
        address: tokenAddress,
      };
    }
  });

  return formattedData;
};

const useGetSupportTokenInfo = ({ tokens }: Payload) => {
  const data = useQuery({
    queryKey: ['get-support-token-info', ...tokens],
    queryFn: async (): Promise<FormattedTokenData> => {
      if (!tokens || tokens.length === 0) {
        return {};
      }

      const multicall = new Multicall({
        nodeUrl: 'https://rpc.berachain.com',
        multicallCustomContractAddress: MULTICALL_ADDRESS,
      });

      const contractCallContext = createContractCallContext(tokens);
      const result: ContractCallResults = await multicall.call(contractCallContext as any as ContractCallContext[]);
      
      return formatTokenResults(result);
    },
    enabled: tokens.length > 0,
  });

  return data;
};

export default useGetSupportTokenInfo;
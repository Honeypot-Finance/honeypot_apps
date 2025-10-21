import { useSubgraphClient } from '@honeypot/shared/hooks/useSubgraphClients';

export function useClients() {
  const infoClient = useSubgraphClient('algebra_info');
  const farmingClient = useSubgraphClient('algebra_farming');

  return {
    infoClient,
    farmingClient,
  };
}

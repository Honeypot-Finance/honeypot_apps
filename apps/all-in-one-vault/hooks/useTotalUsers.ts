import { useQuery } from '@apollo/client';
import { TOTAL_USERS_QUERY } from '@/lib/algebra/graphql/clients/leaderboard';
import type { FactoryData } from '@/lib/algebra/graphql/clients/leaderboard';

export function useTotalUsers() {
  const { data, loading, error } = useQuery<FactoryData>(TOTAL_USERS_QUERY);

  return {
    totalUsers: data?.factories[0]?.accountCount
      ? parseInt(data.factories[0].accountCount)
      : 0,
    loading,
    error,
  };
}

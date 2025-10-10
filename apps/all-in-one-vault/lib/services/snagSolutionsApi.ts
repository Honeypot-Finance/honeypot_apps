const SNAG_API_BASE_URL = 'https://admin.snagsolutions.io/api';
const SNAG_API_KEY = '1349fa8dcfcc47b9be5d9ce11ad1103f';
const ORGANIZATION_ID = 'dc42201d-d1cb-47c2-a3ac-94367cdf40ea';
const WEBSITE_ID = '4a2be9fc-12fb-4b39-bd2c-c721deafce39';

export const CURRENCY_IDS = {
  LP_POINTS: '0d7ea8bf-ed6e-4bc2-a9c2-3169217025f3',
  DEX_POINTS: '02f058c3-c44c-4369-b827-64ddc3edb4cc',
  SOCIAL_POINTS: '532243ed-358a-45ae-87cd-46dc766cfddc',
} as const;

export interface LoyaltyAccount {
  id: string;
  amount: number;
  loyaltyCurrencyId: string;
  userId: string;
  user?: {
    id: string;
    walletAddress?: string;
    username?: string;
  };
}

export interface LoyaltyAccountsResponse {
  data: LoyaltyAccount[];
  hasNextPage: boolean;
  message: string;
}

export interface FetchLoyaltyAccountsParams {
  loyaltyCurrencyId: string;
  limit?: number;
  startingAfter?: string;
  sortDir?: 'asc' | 'desc';
  walletAddress?: string;
}

export async function fetchLoyaltyAccounts(
  params: FetchLoyaltyAccountsParams
): Promise<LoyaltyAccountsResponse> {
  const queryParams = new URLSearchParams({
    loyaltyCurrencyId: params.loyaltyCurrencyId,
    limit: (params.limit || 20).toString(),
    sortDir: params.sortDir || 'desc',
  });

  if (params.startingAfter) {
    queryParams.append('startingAfter', params.startingAfter);
  }

  if (params.walletAddress) {
    queryParams.append('walletAddress', params.walletAddress);
  }

  const response = await fetch(
    `/api/loyalty/accounts?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch loyalty accounts: ${response.statusText}`);
  }

  return response.json();
}

export function getCurrencyName(currencyId: string): string {
  switch (currencyId) {
    case CURRENCY_IDS.LP_POINTS:
      return 'LP Points';
    case CURRENCY_IDS.DEX_POINTS:
      return 'DEX Points';
    case CURRENCY_IDS.SOCIAL_POINTS:
      return 'Social Points';
    default:
      return 'Unknown';
  }
}

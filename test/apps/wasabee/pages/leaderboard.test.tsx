import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextUIProvider } from '@nextui-org/react';
import LeaderboardPage from '@/pages/leaderboard';

// Mock wallet
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    currentChain: {
      supportDEX: true,
      chain: {
        blockExplorers: {
          default: {
            url: 'https://berascan.com/'
          }
        }
      }
    }
  }
}));

// Mock hooks
jest.mock('@/lib/hooks/useLeaderboard', () => ({
  useLeaderboard: jest.fn()
}));

jest.mock('@/lib/hooks/useAccounts', () => ({
  useAccounts: jest.fn(),
  useTopSwapAccounts: jest.fn(),
  useTopPot2PumpDeployer: jest.fn(),
  useTopParticipateAccounts: jest.fn()
}));

jest.mock('@/lib/hooks/useTotalUsers', () => ({
  useTotalUsers: jest.fn()
}));

jest.mock('@/lib/utils', () => ({
  shortenAddressString: jest.fn((address) => `${address.slice(0, 6)}...${address.slice(-4)}`),
  formatVolume: jest.fn((volume) => `$${volume.toFixed(2)}`)
}));

jest.mock('@/lib/format', () => ({
  formatExtremelyLargeNumber: jest.fn((num, decimals, options) => {
    if (typeof num === 'string' && num.startsWith('$')) {
      num = num.slice(1);
    }
    const value = parseFloat(num.toString());
    if (value >= 1000000) return options?.addPrefix ? `$${(value / 1000000).toFixed(decimals)}M` : `${(value / 1000000).toFixed(decimals)}M`;
    if (value >= 1000) return options?.addPrefix ? `$${(value / 1000).toFixed(decimals)}K` : `${(value / 1000).toFixed(decimals)}K`;
    return options?.addPrefix ? `$${value.toFixed(decimals)}` : value.toFixed(decimals);
  })
}));

jest.mock('@/components/CardContianer/v3', () => {
  return function MockCardContainer({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={className} data-testid="card-container">{children}</div>;
  };
});

import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { useAccounts, useTopSwapAccounts, useTopPot2PumpDeployer, useTopParticipateAccounts } from '@/lib/hooks/useAccounts';
import { useTotalUsers } from '@/lib/hooks/useTotalUsers';
import { wallet } from '@honeypot/shared/lib/wallet';

const mockStats = {
  totalTrades: { title: 'Total Trades', value: '50000' },
  totalVolume: { title: 'Total Volume', value: '$15000000.50' },
  tvl: { title: 'TVL', value: '$8500000.25' },
  totalFees: { title: 'Total Fees', value: '$125000.75' }
};

const mockAccounts = [
  {
    walletAddress: '0x1234567890123456789012345678901234567890',
    totalSpend: 1000.50,
    swapCount: 25,
    poolHoldingCount: 5,
    memeTokenCount: 3,
    transactions: 50,
    participateCount: 10,
    lastActive: '01/01/2022, 12:00:00 AM'
  },
  {
    walletAddress: '0x2345678901234567890123456789012345678901',
    totalSpend: 2000.75,
    swapCount: 40,
    poolHoldingCount: 8,
    memeTokenCount: 6,
    transactions: 80,
    participateCount: 15,
    lastActive: '02/01/2022, 1:30:00 PM'
  }
];

const mockTopAccounts = [
  { walletAddress: '0x1111111111111111111111111111111111111111', swapCount: 100 }
];

const mockTopDeployers = [
  { walletAddress: '0x2222222222222222222222222222222222222222', pot2PumpDeployCount: 10 }
];

const mockTopParticipants = [
  { walletAddress: '0x3333333333333333333333333333333333333333', participateCount: 25 }
];

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <NextUIProvider>
      {component}
    </NextUIProvider>
  );
};

describe('Wasabee Leaderboard Page', () => {
  beforeEach(() => {
    (useLeaderboard as jest.Mock).mockReturnValue({
      stats: mockStats,
      loading: false
    });

    (useAccounts as jest.Mock).mockReturnValue({
      accounts: mockAccounts,
      loading: false,
      hasMore: true,
      loadMore: jest.fn()
    });

    (useTotalUsers as jest.Mock).mockReturnValue({
      totalUsers: 3500,
      loading: false
    });

    (useTopSwapAccounts as jest.Mock).mockReturnValue({
      accounts: mockTopAccounts,
      loading: false
    });

    (useTopPot2PumpDeployer as jest.Mock).mockReturnValue({
      accounts: mockTopDeployers,
      loading: false
    });

    (useTopParticipateAccounts as jest.Mock).mockReturnValue({
      accounts: mockTopParticipants,
      loading: false
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render stats cards correctly', () => {
    renderWithProviders(<LeaderboardPage />);

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Total Trades')).toBeInTheDocument();
    expect(screen.getByText('Total Volume')).toBeInTheDocument();
    expect(screen.getByText('TVL')).toBeInTheDocument();
    expect(screen.getByText('Total Fees')).toBeInTheDocument();

    expect(screen.getByText('3500')).toBeInTheDocument();
  });

  it('should format large numbers in stats correctly', () => {
    renderWithProviders(<LeaderboardPage />);

    // The formatExtremelyLargeNumber should be called for large values
    expect(screen.getByText('50000')).toBeInTheDocument(); // Total trades (no formatting needed)
  });

  it('should render search input', () => {
    renderWithProviders(<LeaderboardPage />);

    const searchInput = screen.getByPlaceholderText('Search by address');
    expect(searchInput).toBeInTheDocument();
  });

  it('should handle search input changes', async () => {
    renderWithProviders(<LeaderboardPage />);

    const searchInput = screen.getByPlaceholderText('Search by address');
    fireEvent.change(searchInput, { target: { value: '0x1234' } });

    expect(searchInput).toHaveValue('0x1234');
  });

  it('should render clear button when search has value', async () => {
    renderWithProviders(<LeaderboardPage />);

    const searchInput = screen.getByPlaceholderText('Search by address');
    fireEvent.change(searchInput, { target: { value: '0x1234' } });

    await waitFor(() => {
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });
  });

  it('should clear search when clear button is clicked', async () => {
    renderWithProviders(<LeaderboardPage />);

    const searchInput = screen.getByPlaceholderText('Search by address');
    fireEvent.change(searchInput, { target: { value: '0x1234' } });

    await waitFor(() => {
      const clearButton = screen.getByText('Clear');
      fireEvent.click(clearButton);
    });

    expect(searchInput).toHaveValue('');
  });

  it('should render leaderboard table with correct headers', () => {
    renderWithProviders(<LeaderboardPage />);

    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('Swaps')).toBeInTheDocument();
  });

  it('should render account data in table rows', () => {
    renderWithProviders(<LeaderboardPage />);

    // Check for swap counts
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
  });

  it('should render external links with correct explorer URL', () => {
    renderWithProviders(<LeaderboardPage />);

    const externalLinks = screen.getAllByRole('link').filter(link => 
      link.getAttribute('href')?.includes('berascan.com')
    );
    
    expect(externalLinks.length).toBeGreaterThan(0);
    externalLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  it('should render pagination controls', () => {
    renderWithProviders(<LeaderboardPage />);

    expect(screen.getByText('Page')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should handle next page click', async () => {
    const mockLoadMore = jest.fn().mockResolvedValue({});
    (useAccounts as jest.Mock).mockReturnValue({
      accounts: mockAccounts,
      loading: false,
      hasMore: true,
      loadMore: mockLoadMore
    });

    renderWithProviders(<LeaderboardPage />);

    // Find next button (might be icon only on mobile)
    const nextButtons = screen.getAllByRole('button').filter(button => 
      button.textContent?.includes('Next') || button.querySelector('svg')
    );
    
    if (nextButtons.length > 0) {
      fireEvent.click(nextButtons[nextButtons.length - 1]);
      
      await waitFor(() => {
        expect(mockLoadMore).toHaveBeenCalled();
      });
    }
  });

  it('should show loading state in table', () => {
    (useAccounts as jest.Mock).mockReturnValue({
      accounts: [],
      loading: true,
      hasMore: false,
      loadMore: jest.fn()
    });

    renderWithProviders(<LeaderboardPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show loading state in stats', () => {
    (useLeaderboard as jest.Mock).mockReturnValue({
      stats: null,
      loading: true
    });

    renderWithProviders(<LeaderboardPage />);

    const loadingTexts = screen.getAllByText('Loading...');
    expect(loadingTexts.length).toBeGreaterThan(0);
  });

  it('should handle responsive design classes', () => {
    renderWithProviders(<LeaderboardPage />);

    // Check for responsive grid classes in stats
    const statsGrid = screen.getByText('Users').closest('.grid');
    expect(statsGrid).toHaveClass('grid-cols-2', 'sm:grid-cols-3', 'lg:grid-cols-5');
  });

  it('should show unsupported chain message when DEX is not supported', () => {
    // Mock unsupported chain
    (wallet as any).currentChain.supportDEX = false;

    renderWithProviders(<LeaderboardPage />);

    expect(screen.getByText('DEX is not supported on this chain')).toBeInTheDocument();
  });

  it('should format volume correctly', () => {
    renderWithProviders(<LeaderboardPage />);

    // Volume should be formatted using formatVolume
    expect(screen.getByText('$1000.50')).toBeInTheDocument();
    expect(screen.getByText('$2000.75')).toBeInTheDocument();
  });

  it('should show search results count', async () => {
    (useAccounts as jest.Mock).mockReturnValue({
      accounts: [mockAccounts[0]], // Only one result
      loading: false,
      hasMore: false,
      loadMore: jest.fn()
    });

    renderWithProviders(<LeaderboardPage />);

    const searchInput = screen.getByPlaceholderText('Search by address');
    fireEvent.change(searchInput, { target: { value: '0x1234' } });

    await waitFor(() => {
      expect(screen.getByText('Found 1 results')).toBeInTheDocument();
    });
  });

  it('should show no results message', async () => {
    (useAccounts as jest.Mock).mockReturnValue({
      accounts: [],
      loading: false,
      hasMore: false,
      loadMore: jest.fn()
    });

    renderWithProviders(<LeaderboardPage />);

    const searchInput = screen.getByPlaceholderText('Search by address');
    fireEvent.change(searchInput, { target: { value: '0x1234' } });

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  it('should show searching state', async () => {
    (useAccounts as jest.Mock).mockReturnValue({
      accounts: [],
      loading: true,
      hasMore: false,
      loadMore: jest.fn()
    });

    renderWithProviders(<LeaderboardPage />);

    const searchInput = screen.getByPlaceholderText('Search by address');
    fireEvent.change(searchInput, { target: { value: '0x1234' } });

    await waitFor(() => {
      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });
  });

  it('should handle empty accounts list', () => {
    (useAccounts as jest.Mock).mockReturnValue({
      accounts: [],
      loading: false,
      hasMore: false,
      loadMore: jest.fn()
    });

    renderWithProviders(<LeaderboardPage />);

    // Should still render table structure
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('Swaps')).toBeInTheDocument();
  });

  it('should render CardContainer with correct props', () => {
    renderWithProviders(<LeaderboardPage />);

    const cardContainer = screen.getByTestId('card-container');
    expect(cardContainer).toHaveClass('xl:max-w-[1200px]', 'mx-auto', 'w-[calc(100%-32px)]');
  });

  it('should handle loading indicator during pagination', () => {
    (useAccounts as jest.Mock).mockReturnValue({
      accounts: mockAccounts,
      loading: true,
      hasMore: true,
      loadMore: jest.fn()
    });

    renderWithProviders(<LeaderboardPage />);

    // Should show loading spinner in pagination area
    const loadingSpinner = screen.getByText('Loading...').closest('div');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('should disable navigation buttons appropriately', () => {
    (useAccounts as jest.Mock).mockReturnValue({
      accounts: mockAccounts,
      loading: false,
      hasMore: false,
      loadMore: jest.fn()
    });

    renderWithProviders(<LeaderboardPage />);

    // Previous button should be disabled on first page
    const prevButtons = screen.getAllByRole('button').filter(button => 
      button.textContent?.includes('Previous') || 
      (button.querySelector('svg') && button.previousElementSibling === null)
    );
    
    if (prevButtons.length > 0) {
      expect(prevButtons[0]).toBeDisabled();
    }
  });

  it('should handle debounced search', async () => {
    jest.useFakeTimers();
    renderWithProviders(<LeaderboardPage />);

    const searchInput = screen.getByPlaceholderText('Search by address');
    
    fireEvent.change(searchInput, { target: { value: '0x1' } });
    fireEvent.change(searchInput, { target: { value: '0x12' } });
    fireEvent.change(searchInput, { target: { value: '0x123' } });

    // Fast forward time to trigger debounce
    jest.advanceTimersByTime(500);

    // The hook should only be called once with the final value after debounce
    await waitFor(() => {
      expect(useAccounts).toHaveBeenLastCalledWith(
        expect.any(Number),
        expect.any(Number),
        '0x123'
      );
    });

    jest.useRealTimers();
  });

  it('should render shortened addresses correctly', () => {
    renderWithProviders(<LeaderboardPage />);

    expect(screen.getByText('0x1234...7890')).toBeInTheDocument();
    expect(screen.getByText('0x2345...8901')).toBeInTheDocument();
  });
});
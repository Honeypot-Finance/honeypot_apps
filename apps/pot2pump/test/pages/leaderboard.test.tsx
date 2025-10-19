import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import LeaderboardPage from '../../pages/leaderboard';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import {
  useAccounts,
  useTopSwapAccounts,
  useTopPot2PumpDeployer,
  useTopParticipateAccounts,
} from '@/lib/hooks/useAccounts';
import { useTotalUsers } from '@/lib/hooks/useTotalUsers';



// Mock NextUI components
jest.mock('@nextui-org/react', () => {
  const mockReact = require('react');
  return {
    NextUIProvider: ({ children }: unknown) =>
      mockReact.createElement('div', {}, children),
    Link: ({ children, href, target, className, ...props }: any) =>
      mockReact.createElement(
        'a',
        { href, target, className, ...props },
        children
      ),
    Tooltip: ({ children, content, ...props }: any) =>
      mockReact.createElement('div', { title: content, ...props }, children),
  };
});

// Mock hooks
jest.mock('@/lib/hooks/useLeaderboard', () => ({
  useLeaderboard: jest.fn(),
}));

jest.mock('@/lib/hooks/useAccounts', () => ({
  useAccounts: jest.fn(),
  useTopSwapAccounts: jest.fn(),
  useTopPot2PumpDeployer: jest.fn(),
  useTopParticipateAccounts: jest.fn(),
}));

jest.mock('@/lib/hooks/useTotalUsers', () => ({
  useTotalUsers: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  shortenAddressString: jest.fn(
    (address) => `${address.slice(0, 6)}...${address.slice(-4)}`
  ),
  formatVolume: jest.fn((volume) => `$${volume.toFixed(2)}`),
}));

jest.mock('@/lib/algebra/utils/common/formatAmount', () => ({
  DynamicFormatAmount: jest.fn(
    ({ amount, endWith }) => `${endWith || ''}${amount}`
  ),
}));

jest.mock('@/components/CardContianer/v3', () => {
  return function MockCardContainer({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <div className={className} data-testid="card-container">
        {children}
      </div>
    );
  };
});

jest.mock('@/components/LoadingDisplay/LoadingDisplay', () => ({
  LoadingDisplay: ({ text }: { text?: string }) => (
    <div data-testid="loading-display">{text || 'Loading...'}</div>
  ),
}));



// Mock the Account_OrderBy enum
jest.mock('@/lib/algebra/graphql/generated/graphql', () => ({
  Account_OrderBy: {
    TotalDepositPot2pumpUsd: 'totalDepositPot2pumpUSD',
    Pot2PumpLaunchCount: 'pot2PumpLaunchCount',
    ParticipateCount: 'participateCount',
  },
}));

const mockStats = {
  totalMemeCreated: { title: 'Total Meme Created', value: '150' },
  totalSuccessedMeme: { title: 'Total Successed Meme', value: '75' },
  totalDepositedUSD: { title: 'Total Deposited USD', value: '1000000' },
};

const mockAccounts = [
  {
    walletAddress: '0x1234567890123456789012345678901234567890',
    totalSpend: 1000.5,
    swapCount: 25,
    poolHoldingCount: 5,
    memeTokenCount: 3,
    transactions: 50,
    participateCount: 10,
    totalDepositPot2pumpUSD: '500.25',
    pot2PumpLaunchCount: '2',
    lastActive: '01/01/2022, 12:00:00 AM',
  },
  {
    walletAddress: '0x2345678901234567890123456789012345678901',
    totalSpend: 2000.75,
    swapCount: 40,
    poolHoldingCount: 8,
    memeTokenCount: 6,
    transactions: 80,
    participateCount: 15,
    totalDepositPot2pumpUSD: '750.50',
    pot2PumpLaunchCount: '3',
    lastActive: '02/01/2022, 1:30:00 PM',
  },
];

const mockTopAccounts = [
  {
    walletAddress: '0x1111111111111111111111111111111111111111',
    participateCount: 50,
  },
];

const mockTopDeployers = [
  {
    walletAddress: '0x2222222222222222222222222222222222222222',
    pot2PumpDeployCount: 10,
  },
];

const mockTopParticipants = [
  {
    walletAddress: '0x3333333333333333333333333333333333333333',
    participateCount: 25,
  },
];

const renderWithProviders = (component: React.ReactElement) => {
  return render(component);
};

describe('Pot2Pump Leaderboard Page', () => {
  it('should import the component correctly', () => {
    expect(LeaderboardPage).toBeDefined();
    expect(typeof LeaderboardPage).toBe('function');
  });

  beforeEach(() => {
    (useLeaderboard as jest.Mock).mockReturnValue({
      stats: mockStats,
      loading: false,
    });

    (useAccounts as jest.Mock).mockReturnValue({
      accounts: mockAccounts,
      loading: false,
      hasMore: true,
      loadMore: jest.fn(),
    });

    (useTotalUsers as jest.Mock).mockReturnValue({
      totalUsers: 3500,
      loading: false,
    });

    (useTopSwapAccounts as jest.Mock).mockReturnValue({
      accounts: mockTopAccounts,
      loading: false,
    });

    (useTopPot2PumpDeployer as jest.Mock).mockReturnValue({
      accounts: mockTopDeployers,
      loading: false,
    });

    (useTopParticipateAccounts as jest.Mock).mockReturnValue({
      accounts: mockTopParticipants,
      loading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render stats cards correctly', () => {
    renderWithProviders(<LeaderboardPage />);

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Total Meme Created')).toBeInTheDocument();
    expect(screen.getByText('Total Successed Meme')).toBeInTheDocument();
    expect(screen.getByText('Total Deposited USD')).toBeInTheDocument();

    expect(screen.getByText('3500')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('should render search input', () => {
    renderWithProviders(<LeaderboardPage />);

    const searchInput = screen.getByPlaceholderText('Search by address');
    expect(searchInput).toBeInTheDocument();
  });

  it('should handle search input changes', async () => {
    jest.useFakeTimers();
    renderWithProviders(<LeaderboardPage />);

    const searchInput = screen.getByPlaceholderText('Search by address');
    fireEvent.change(searchInput, { target: { value: '0x1234' } });

    // Fast forward time to trigger debounce
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(searchInput).toHaveValue('0x1234');
    });

    jest.useRealTimers();
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
    jest.useFakeTimers();
    renderWithProviders(<LeaderboardPage />);

    const searchInput = screen.getByPlaceholderText('Search by address');
    fireEvent.change(searchInput, { target: { value: '0x1234' } });

    // Fast forward time to trigger debounce and show the clear button
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      const clearButton = screen.getByText('Clear');
      fireEvent.click(clearButton);
    });

    // Fast forward time again to trigger the clear debounce
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(searchInput).toHaveValue('');
    });

    jest.useRealTimers();
  });

  it('should render leaderboard table with correct headers', () => {
    renderWithProviders(<LeaderboardPage />);

    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Launches')).toBeInTheDocument();
    expect(screen.getByText('Participations')).toBeInTheDocument();
    expect(screen.getByText('total deposite')).toBeInTheDocument();
  });

  it('should render account data in table rows', () => {
    renderWithProviders(<LeaderboardPage />);

    // Check for account data
    expect(screen.getByText('2')).toBeInTheDocument(); // Launch count
    expect(screen.getByText('3')).toBeInTheDocument(); // Launch count
    expect(screen.getByText('10')).toBeInTheDocument(); // Participate count
    expect(screen.getByText('15')).toBeInTheDocument(); // Participate count
  });

  // it('should render external links to Berascan', () => {
  //   renderWithProviders(<LeaderboardPage />);

  //   const externalLinks = screen
  //     .getAllByRole('link')
  //     .filter((link) => link.getAttribute('href')?.includes('berascan.com'));

  //   expect(externalLinks.length).toBeGreaterThan(0);
  //   externalLinks.forEach((link) => {
  //     expect(link).toHaveAttribute('target', '_blank');
  //   });
  // });

  it('should render external links to Berascan', () => {
    renderWithProviders(<LeaderboardPage />);
  
    const externalLinks = screen
      .getAllByRole('link')
      .filter((link) => {
        const href = link.getAttribute('href');
        if (!href) return false;
        try {
          const host = new URL(href, window.location.origin).host;
          return host === 'berascan.com' || host.endsWith('.berascan.com');
        } catch {
          return false;
        }
      });
  
    expect(externalLinks.length).toBeGreaterThan(0);
    externalLinks.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
    });
  });
  

  it('should handle column header clicks for sorting', () => {
    const mockUseAccounts = useAccounts as jest.Mock;
    renderWithProviders(<LeaderboardPage />);

    const launchesHeader = screen.getByText('Launches');
    fireEvent.click(launchesHeader);

    // Verify that the hook was called with the correct order by parameter
    expect(mockUseAccounts).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      expect.any(String),
      'pot2PumpLaunchCount'
    );
  });

  it('should render pagination controls', () => {
    renderWithProviders(<LeaderboardPage />);

    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Page')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should disable previous button on first page', () => {
    renderWithProviders(<LeaderboardPage />);

    const previousButton = screen.getByText('Previous').closest('button');
    expect(previousButton).toBeDisabled();
  });

  it('should handle next page click', async () => {
    const mockLoadMore = jest.fn().mockResolvedValue({});
    (useAccounts as jest.Mock).mockReturnValue({
      accounts: mockAccounts,
      loading: false,
      hasMore: true,
      loadMore: mockLoadMore,
    });

    renderWithProviders(<LeaderboardPage />);

    const nextButton = screen.getByText('Next').closest('button');
    if (nextButton) {
      fireEvent.click(nextButton);
    }

    await waitFor(() => {
      expect(mockLoadMore).toHaveBeenCalled();
    });
  });

  it('should show loading state in table', () => {
    (useAccounts as jest.Mock).mockReturnValue({
      accounts: [],
      loading: true,
      hasMore: false,
      loadMore: jest.fn(),
    });

    renderWithProviders(<LeaderboardPage />);

    // Check for loading state specifically in the table
    const tableBody = screen.getByRole('table').querySelector('tbody');
    expect(tableBody).toHaveTextContent('Loading...');
  });

  it('should show loading state in stats', () => {
    (useLeaderboard as jest.Mock).mockReturnValue({
      stats: null,
      loading: true,
    });

    renderWithProviders(<LeaderboardPage />);

    const loadingTexts = screen.getAllByText('Loading...');
    expect(loadingTexts.length).toBeGreaterThan(0);
  });

  it('should show loading state for users', () => {
    (useTotalUsers as jest.Mock).mockReturnValue({
      totalUsers: 0,
      loading: true,
    });

    renderWithProviders(<LeaderboardPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle empty accounts list', () => {
    (useAccounts as jest.Mock).mockReturnValue({
      accounts: [],
      loading: false,
      hasMore: false,
      loadMore: jest.fn(),
    });

    renderWithProviders(<LeaderboardPage />);

    // Should still render table structure
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Launches')).toBeInTheDocument();
  });

  it('should render CardContainer with correct props', () => {
    renderWithProviders(<LeaderboardPage />);

    const cardContainer = screen.getByTestId('card-container');
    expect(cardContainer).toHaveClass(
      'xl:max-w-[1200px]',
      'mx-auto',
      'w-[calc(100%-32px)]'
    );
  });

  it('should show search results count', async () => {
    (useAccounts as jest.Mock).mockReturnValue({
      accounts: [mockAccounts[0]], // Only one result
      loading: false,
      hasMore: false,
      loadMore: jest.fn(),
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
      loadMore: jest.fn(),
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
      loadMore: jest.fn(),
    });

    renderWithProviders(<LeaderboardPage />);

    const searchInput = screen.getByPlaceholderText('Search by address');
    fireEvent.change(searchInput, { target: { value: '0x1234' } });

    await waitFor(() => {
      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });
  });

  it('should format deposit amounts correctly', () => {
    renderWithProviders(<LeaderboardPage />);

    // Check that DynamicFormatAmount is called for deposit amounts
    expect(screen.getByText('$500.25')).toBeInTheDocument();
    expect(screen.getByText('$750.50')).toBeInTheDocument();
  });

  it('should handle loading indicator during pagination', () => {
    (useAccounts as jest.Mock).mockReturnValue({
      accounts: mockAccounts,
      loading: true,
      hasMore: true,
      loadMore: jest.fn(),
    });

    renderWithProviders(<LeaderboardPage />);

    // Should show loading text in pagination area - get all loading texts and check for the one in pagination
    const loadingTexts = screen.getAllByText('Loading...');
    expect(loadingTexts.length).toBeGreaterThan(1); // Should have both table and pagination loading
  });

  it('should disable next button when no more data', () => {
    (useAccounts as jest.Mock).mockReturnValue({
      accounts: mockAccounts,
      loading: false,
      hasMore: false,
      loadMore: jest.fn(),
    });

    renderWithProviders(<LeaderboardPage />);

    const nextButton = screen.getByText('Next').closest('button');
    expect(nextButton).toBeDisabled();
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
        '0x123',
        expect.any(String)
      );
    });

    jest.useRealTimers();
  });
});

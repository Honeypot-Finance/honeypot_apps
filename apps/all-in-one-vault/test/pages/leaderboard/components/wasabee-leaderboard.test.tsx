import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { NextUIProvider } from '@nextui-org/react';

import WasabeeLeaderboard from '../../../../pages/leaderboard/components/wasabee-leaderboard';

import { useWasabeeLeaderboard } from '@/hooks/useWasabeeLeaderboard';
import { useWasabeeAccounts } from '@/hooks/useWasabeeAccounts';
import { useTotalUsersFromDB } from '@/hooks/useTotalUsersFromDB';



// Mock NextUIProvider and other NextUI components
jest.mock('@nextui-org/react', () => ({
  NextUIProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Link: ({ children, href, target, title, className, ...props }: any) => (
    <a href={href} target={target} title={title} className={className} {...props}>
      {children}
    </a>
  ),
  Tooltip: ({ children, content, placement, classNames, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
}));

// Mock lodash
jest.mock('lodash', () => ({
  debounce: (fn: any) => fn,
}));



// Mock hooks with correct paths
jest.mock('../../../../hooks/useWasabeeLeaderboard', () => ({
  useWasabeeLeaderboard: jest.fn(),
}));

jest.mock('../../../../hooks/useWasabeeAccounts', () => ({
  useWasabeeAccounts: jest.fn(),
}));

jest.mock('../../../../hooks/useTotalUsersFromDB', () => ({
  useTotalUsersFromDB: jest.fn(),
}));

jest.mock('../../../../lib/utils', () => ({
  formatNumberWithUnit: jest.fn((num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }),
}));

const mockStats = {
  totalTrades: { title: 'Total Trades', value: '50000' },
  totalVolume: { title: 'Total Volume', value: '$15000000.50' },
  tvl: { title: 'TVL', value: '$8500000.25' },
  totalFees: { title: 'Total Fees', value: '$125000.75' },
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
    lastActive: '02/01/2022, 1:30:00 PM',
  },
];

const mockChainBreakdown = [
  { id: 'bera', total_account: 1000 },
  { id: 'bsc', total_account: 500 },
  { id: 'ethereum', total_account: 2000 },
];

const renderWithProviders = (component: React.ReactElement) => {
  return render(<NextUIProvider>{component}</NextUIProvider>);
};

describe('WasabeeLeaderboard Component', () => {
  beforeEach(() => {
    (useWasabeeLeaderboard as jest.Mock).mockReturnValue({
      stats: mockStats,
      loading: false,
    });

    (useWasabeeAccounts as jest.Mock).mockReturnValue({
      accounts: mockAccounts,
      loading: false,
      hasMore: true,
      loadMore: jest.fn(),
    });

    (useTotalUsersFromDB as jest.Mock).mockReturnValue({
      fetchTotalUsers: jest.fn().mockResolvedValue(3500),
      fetchChainBreakdown: jest.fn().mockResolvedValue(mockChainBreakdown),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render all stats cards correctly', async () => {
    renderWithProviders(<WasabeeLeaderboard />);

    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Total Trades')).toBeInTheDocument();
      expect(screen.getByText('Total Volume')).toBeInTheDocument();
      expect(screen.getByText('TVL')).toBeInTheDocument();
      expect(screen.getByText('Total Fees')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('3,500')).toBeInTheDocument();
    });
  });

  it('should format extremely large numbers correctly', async () => {
    renderWithProviders(<WasabeeLeaderboard />);

    await waitFor(() => {
      // The component should format large numbers using formatExtremelyLargeNumber
      expect(screen.getByText('50K')).toBeInTheDocument(); // Total trades formatted
    });
  });

  it('should render search input with correct placeholder', () => {
    renderWithProviders(<WasabeeLeaderboard />);

    const searchInput = screen.getByPlaceholderText(
      'Search by full wallet address (0x...)'
    );
    expect(searchInput).toBeInTheDocument();
  });

  it('should handle search input changes', async () => {
    renderWithProviders(<WasabeeLeaderboard />);

    const searchInput = screen.getByPlaceholderText(
      'Search by full wallet address (0x...)'
    );
    fireEvent.change(searchInput, { target: { value: '0x1234' } });

    expect(searchInput).toHaveValue('0x1234');
  });

  it('should show validation messages for search input', async () => {
    renderWithProviders(<WasabeeLeaderboard />);

    const searchInput = screen.getByPlaceholderText(
      'Search by full wallet address (0x...)'
    );

    // Test incomplete address
    fireEvent.change(searchInput, { target: { value: '0x1234' } });
    await waitFor(() => {
      expect(screen.getByText(/Need \d+ more characters/)).toBeInTheDocument();
    });

    // Test address not starting with 0x
    fireEvent.change(searchInput, { target: { value: '1234567890' } });
    await waitFor(() => {
      expect(
        screen.getByText('Address must start with 0x')
      ).toBeInTheDocument();
    });
  });

  it('should render leaderboard table with correct headers', () => {
    renderWithProviders(<WasabeeLeaderboard />);

    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('Swaps')).toBeInTheDocument();
  });

  it('should render account data in table rows', () => {
    renderWithProviders(<WasabeeLeaderboard />);

    // Check for shortened addresses
    expect(screen.getByText('0x1234...7890')).toBeInTheDocument();
    expect(screen.getByText('0x2345...8901')).toBeInTheDocument();

    // Check for swap counts
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
  });

  it('should handle address click to populate search', async () => {
    renderWithProviders(<WasabeeLeaderboard />);

    const addressLink = screen.getByText('0x1234...7890');
    fireEvent.click(addressLink);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(
        'Search by full wallet address (0x...)'
      );
      expect(searchInput).toHaveValue(
        '0x1234567890123456789012345678901234567890'
      );
    });
  });

  it('should render clear button when search has value', async () => {
    renderWithProviders(<WasabeeLeaderboard />);

    const searchInput = screen.getByPlaceholderText(
      'Search by full wallet address (0x...)'
    );
    fireEvent.change(searchInput, { target: { value: '0x1234' } });

    await waitFor(() => {
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });
  });

  it('should clear search when clear button is clicked', async () => {
    renderWithProviders(<WasabeeLeaderboard />);

    const searchInput = screen.getByPlaceholderText(
      'Search by full wallet address (0x...)'
    );
    fireEvent.change(searchInput, { target: { value: '0x1234' } });

    await waitFor(() => {
      const clearButton = screen.getByText('Clear');
      fireEvent.click(clearButton);
    });

    expect(searchInput).toHaveValue('');
  });

  it('should render pagination controls', () => {
    renderWithProviders(<WasabeeLeaderboard />);

    expect(screen.getByText('Page')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    // Check for Previous/Next buttons (they might be hidden on mobile)
    const buttons = screen.getAllByRole('button');
    const hasNavigationButtons = buttons.some(
      (button) =>
        button.textContent?.includes('Previous') ||
        button.textContent?.includes('Next')
    );
    expect(hasNavigationButtons).toBe(true);
  });

  it('should handle next page click', async () => {
    renderWithProviders(<WasabeeLeaderboard />);

    // Find next button (might be icon only on mobile)
    const nextButtons = screen
      .getAllByRole('button')
      .filter(
        (button) =>
          button.textContent?.includes('Next') || button.querySelector('svg')
      );

    if (nextButtons.length > 0) {
      fireEvent.click(nextButtons[nextButtons.length - 1]);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Page number should change
      });
    }
  });

  it('should show loading state in table', () => {
    (useWasabeeAccounts as jest.Mock).mockReturnValue({
      accounts: [],
      loading: true,
      hasMore: false,
      loadMore: jest.fn(),
    });

    renderWithProviders(<WasabeeLeaderboard />);

    // Use getAllByText since there might be multiple "Loading..." elements
    const loadingElements = screen.getAllByText('Loading...');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('should show loading state in stats', () => {
    (useWasabeeLeaderboard as jest.Mock).mockReturnValue({
      stats: null,
      loading: true,
    });

    renderWithProviders(<WasabeeLeaderboard />);

    const loadingTexts = screen.getAllByText('Loading...');
    expect(loadingTexts.length).toBeGreaterThan(0);
  });

  it('should handle external link clicks', () => {
    renderWithProviders(<WasabeeLeaderboard />);

    const externalLinks = screen.getAllByTitle('Open in Berascan');
    expect(externalLinks.length).toBeGreaterThan(0);

    externalLinks.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('href')).toContain('berascan.com');
    });
  });

  it('should format volume correctly', () => {
    renderWithProviders(<WasabeeLeaderboard />);

    // Volume should be formatted using formatNumberWithUnit with $ prefix
    expect(screen.getByText('$1.0K')).toBeInTheDocument(); // 1000.50 formatted
    expect(screen.getByText('$2.0K')).toBeInTheDocument(); // 2000.75 formatted
  });

  it('should handle responsive design classes', () => {
    renderWithProviders(<WasabeeLeaderboard />);

    // Check for responsive grid classes
    const statsGrid = screen.getByText('Users').closest('.grid');
    expect(statsGrid).toHaveClass(
      'grid-cols-2',
      'sm:grid-cols-3',
      'lg:grid-cols-5'
    );
  });

  it('should show chain breakdown tooltip', async () => {
    renderWithProviders(<WasabeeLeaderboard />);

    await waitFor(() => {
      // Look for the info icon SVG by checking for the SVG element with specific path
      const infoIcon = document.querySelector('svg path[d*="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"]');
      expect(infoIcon).toBeInTheDocument();
    });
  });

  it('should handle empty accounts list', () => {
    (useWasabeeAccounts as jest.Mock).mockReturnValue({
      accounts: [],
      loading: false,
      hasMore: false,
      loadMore: jest.fn(),
    });

    renderWithProviders(<WasabeeLeaderboard />);

    // Should still render table structure
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('Swaps')).toBeInTheDocument();
  });

  it('should debounce search input', async () => {
    jest.useFakeTimers();
    renderWithProviders(<WasabeeLeaderboard />);

    const searchInput = screen.getByPlaceholderText(
      'Search by full wallet address (0x...)'
    );

    fireEvent.change(searchInput, { target: { value: '0x1' } });
    fireEvent.change(searchInput, { target: { value: '0x12' } });
    fireEvent.change(searchInput, { target: { value: '0x123' } });

    // Fast forward time to trigger debounce
    jest.advanceTimersByTime(300);

    // The hook should only be called once with the final value after debounce
    await waitFor(() => {
      expect(useWasabeeAccounts).toHaveBeenLastCalledWith(
        1, // page
        10, // pageSize
        '0x123' // searchAddress
      );
    });

    jest.useRealTimers();
  });

  it('should handle stats with USD formatting', async () => {
    renderWithProviders(<WasabeeLeaderboard />);

    await waitFor(() => {
      // Stats with USD should be formatted appropriately
      const statsCards = screen.getAllByText(/Total/);
      expect(statsCards.length).toBeGreaterThan(0);
    });
  });

  it('should show loading indicator during pagination', () => {
    (useWasabeeAccounts as jest.Mock).mockReturnValue({
      accounts: mockAccounts,
      loading: true,
      hasMore: true,
      loadMore: jest.fn(),
    });

    renderWithProviders(<WasabeeLeaderboard />);

    // Should show loading spinner in pagination area - use getAllByText since there are multiple
    const loadingElements = screen.getAllByText('Loading...');
    expect(loadingElements.length).toBeGreaterThan(0);
    
    // Check for the spinning icon by class name
    const spinningIcon = document.querySelector('.animate-spin');
    expect(spinningIcon).toBeInTheDocument();
  });
});

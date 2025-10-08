import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { NextUIProvider } from '@nextui-org/react';
import { MockedProvider } from '@apollo/client/testing';
import Pot2PumpLeaderboard from '../../../../pages/leaderboard/components/pot2pump-leaderboard';

import { usePot2PumpLeaderboard } from '@/hooks/usePot2PumpLeaderboard';
import { usePot2PumpAccounts } from '@/hooks/usePot2PumpAccounts';
import { useTotalUsersFromDB } from '@/hooks/useTotalUsersFromDB';



// import { createMockApolloProvider, mockCollections } from '../../../../../shared/leaderboard-graphql-mocks';
// import { createMockAccount } from '../../../../../shared/leaderboard-test-utils';

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

// Mock Apollo Client
jest.mock('@apollo/client/testing', () => ({
  MockedProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));


// Mock the hooks with correct paths
jest.mock('../../../../hooks/usePot2PumpLeaderboard', () => ({
  usePot2PumpLeaderboard: jest.fn(),
}));

jest.mock('../../../../hooks/usePot2PumpAccounts', () => ({
  usePot2PumpAccounts: jest.fn(),
  Account_OrderBy: {
    TotalDepositPot2pumpUsd: 'totalDepositPot2pumpUSD',
    Pot2PumpLaunchCount: 'pot2PumpLaunchCount',
    ParticipateCount: 'participateCount',
    TotalSpendUSD: 'totalSpendUSD',
    SwapCount: 'swapCount',
  },
}));

jest.mock('../../../../hooks/useTotalUsersFromDB', () => ({
  useTotalUsersFromDB: jest.fn(),
}));

// Mock utility functions
jest.mock('../../../../lib/algebra/utils/common/formatAmount', () => ({
  DynamicFormatAmount: jest.fn(({ amount }) => `$${amount}`),
}));

jest.mock('../../../../lib/utils', () => ({
  formatNumberWithUnit: jest.fn((num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }),
}));



const mockUsePot2PumpLeaderboard = usePot2PumpLeaderboard as jest.MockedFunction<typeof usePot2PumpLeaderboard>;
const mockUsePot2PumpAccounts = usePot2PumpAccounts as jest.MockedFunction<typeof usePot2PumpAccounts>;
const mockUseTotalUsersFromDB = useTotalUsersFromDB as jest.MockedFunction<typeof useTotalUsersFromDB>;

describe('Pot2Pump Leaderboard Component', () => {
  const mockStats = {
    totalMemeCreated: { title: 'Total Meme Created', value: 150 },
    totalSuccessedMeme: { title: 'Total Successed Meme', value: 45 },
    totalDepositedUSD: { title: 'Total Deposited USD', value: '1500000.00' },
  };

  const mockAccounts = [
    {
      walletAddress: '0x1234567890123456789012345678901234567890',
      totalSpend: 10000.50,
      swapCount: 100,
      poolHoldingCount: 5,
      memeTokenCount: 3,
      transactions: 50,
      participateCount: 25,
      totalDepositPot2pumpUSD: '50000.00',
      pot2PumpLaunchCount: 5,
      lastActive: '01/01/2022, 12:00:00 AM',
    },
    {
      walletAddress: '0x2345678901234567890123456789012345678901',
      totalSpend: 8500.25,
      swapCount: 85,
      poolHoldingCount: 8,
      memeTokenCount: 6,
      transactions: 80,
      participateCount: 20,
      totalDepositPot2pumpUSD: '35000.00',
      pot2PumpLaunchCount: 3,
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

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUsePot2PumpLeaderboard.mockReturnValue({
      stats: mockStats,
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    mockUsePot2PumpAccounts.mockReturnValue({
      accounts: mockAccounts,
      loading: false,
      error: undefined,
      loadMore: jest.fn(),
      hasMore: true,
    });

    mockUseTotalUsersFromDB.mockReturnValue({
      fetchTotalUsers: jest.fn().mockResolvedValue(3500),
      fetchChainBreakdown: jest.fn().mockResolvedValue(mockChainBreakdown),
    });
  });

  describe('Component Rendering', () => {
    it('should render the component title', () => {
      renderWithProviders(<Pot2PumpLeaderboard />);
      
      expect(screen.getByText('Pot2Pump Leaderboard')).toBeInTheDocument();
    });

    it('should render stats cards when data is available', async () => {
      renderWithProviders(<Pot2PumpLeaderboard />);

      await waitFor(() => {
        expect(screen.getByText('Total Meme Created')).toBeInTheDocument();
        expect(screen.getByText('150')).toBeInTheDocument();
        expect(screen.getByText('Total Successed Meme')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();
        expect(screen.getByText('Total Deposited USD')).toBeInTheDocument();
      });
    });

    it('should render search input', () => {
      renderWithProviders(<Pot2PumpLeaderboard />);
      
      const searchInput = screen.getByPlaceholderText(/search by full wallet address/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should render account list when data is available', async () => {
      renderWithProviders(<Pot2PumpLeaderboard />);

      await waitFor(() => {
        expect(screen.getByText('0x1234...7890')).toBeInTheDocument();
        expect(screen.getByText('0x2345...8901')).toBeInTheDocument();
      });
    });

    it('should render table headers', () => {
      renderWithProviders(<Pot2PumpLeaderboard />);

      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(screen.getByText('Launches')).toBeInTheDocument();
      expect(screen.getByText('Participations')).toBeInTheDocument();
      expect(screen.getByText('Total Deposit')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state for stats', () => {
      mockUsePot2PumpLeaderboard.mockReturnValue({
        stats: null,
        loading: true,
        error: undefined,
        refetch: jest.fn(),
      });

      renderWithProviders(<Pot2PumpLeaderboard />);
      
      const loadingElements = screen.getAllByText(/loading/i);
      expect(loadingElements.length).toBeGreaterThan(0);
    });

    it('should show loading state for accounts', () => {
      mockUsePot2PumpAccounts.mockReturnValue({
        accounts: [],
        loading: true,
        error: undefined,
        loadMore: jest.fn(),
        hasMore: false,
      });

      renderWithProviders(<Pot2PumpLeaderboard />);
      
      const loadingElements = screen.getAllByText(/loading/i);
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Search Functionality', () => {
    it('should handle search input changes', async () => {
      renderWithProviders(<Pot2PumpLeaderboard />);
      
      const searchInput = screen.getByPlaceholderText(/search by full wallet address/i);
      fireEvent.change(searchInput, { target: { value: '0x1234' } });
      
      expect(searchInput).toHaveValue('0x1234');
    });

    it('should show validation messages for search input', async () => {
      renderWithProviders(<Pot2PumpLeaderboard />);

      const searchInput = screen.getByPlaceholderText(/search by full wallet address/i);

      // Test incomplete address
      fireEvent.change(searchInput, { target: { value: '0x1234' } });
      await waitFor(() => {
        expect(screen.getByText(/Need \d+ more characters/)).toBeInTheDocument();
      });

      // Test address not starting with 0x
      fireEvent.change(searchInput, { target: { value: '1234567890' } });
      await waitFor(() => {
        expect(screen.getByText('Address must start with 0x')).toBeInTheDocument();
      });
    });

    it('should render clear button when search has value', async () => {
      renderWithProviders(<Pot2PumpLeaderboard />);

      const searchInput = screen.getByPlaceholderText(/search by full wallet address/i);
      fireEvent.change(searchInput, { target: { value: '0x1234' } });

      await waitFor(() => {
        expect(screen.getByText('Clear')).toBeInTheDocument();
      });
    });

    it('should clear search when clear button is clicked', async () => {
      renderWithProviders(<Pot2PumpLeaderboard />);

      const searchInput = screen.getByPlaceholderText(/search by full wallet address/i);
      fireEvent.change(searchInput, { target: { value: '0x1234' } });

      await waitFor(() => {
        const clearButton = screen.getByText('Clear');
        fireEvent.click(clearButton);
      });

      expect(searchInput).toHaveValue('');
    });
  });

  describe('Pagination', () => {
    it('should render pagination controls', () => {
      renderWithProviders(<Pot2PumpLeaderboard />);

      expect(screen.getByText('Page')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();

      // Check for Previous/Next buttons
      const buttons = screen.getAllByRole('button');
      const hasNavigationButtons = buttons.some(
        (button) =>
          button.textContent?.includes('Previous') ||
          button.textContent?.includes('Next')
      );
      expect(hasNavigationButtons).toBe(true);
    });

    it('should handle next page click', async () => {
      renderWithProviders(<Pot2PumpLeaderboard />);

      // Find next button
      const nextButtons = screen
        .getAllByRole('button')
        .filter((button) => button.textContent?.includes('Next'));

      if (nextButtons.length > 0) {
        fireEvent.click(nextButtons[0]);

        await waitFor(() => {
          expect(screen.getByText('2')).toBeInTheDocument(); // Page number should change
        });
      }
    });
  });

  describe('Data Formatting', () => {
    it('should format wallet addresses correctly', async () => {
      renderWithProviders(<Pot2PumpLeaderboard />);

      await waitFor(() => {
        expect(screen.getByText('0x1234...7890')).toBeInTheDocument();
        expect(screen.getByText('0x2345...8901')).toBeInTheDocument();
      });
    });

    it('should format deposit amounts correctly', async () => {
      renderWithProviders(<Pot2PumpLeaderboard />);

      await waitFor(() => {
        // Check for the formatted amounts - they appear as separate text nodes
        // Looking at the DOM output, we can see "50.0K" and "35.0K" are present
        const tableBody = document.querySelector('tbody');
        expect(tableBody?.textContent).toContain('50.0K');
        expect(tableBody?.textContent).toContain('35.0K');
        // Check that there are $ symbols in the table
        expect(tableBody?.textContent).toContain('$');
      });
    });

    it('should display launch counts correctly', async () => {
      renderWithProviders(<Pot2PumpLeaderboard />);

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument(); // Launch count
        expect(screen.getByText('3')).toBeInTheDocument(); // Launch count
      });
    });

    it('should display participation counts correctly', async () => {
      renderWithProviders(<Pot2PumpLeaderboard />);

      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument(); // Participation count
        expect(screen.getByText('20')).toBeInTheDocument(); // Participation count
      });
    });
  });

  describe('User Interaction', () => {
    it('should handle address click to populate search', async () => {
      renderWithProviders(<Pot2PumpLeaderboard />);

      const addressLink = screen.getByText('0x1234...7890');
      fireEvent.click(addressLink);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/search by full wallet address/i);
        expect(searchInput).toHaveValue('0x1234567890123456789012345678901234567890');
      });
    });

    it('should handle external link clicks', () => {
      renderWithProviders(<Pot2PumpLeaderboard />);

      const externalLinks = screen.getAllByTitle('Open in Berascan');
      expect(externalLinks.length).toBeGreaterThan(0);

      externalLinks.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link.getAttribute('href')).toContain('berascan.com');
      });
    });
  });

  describe('Responsive Design', () => {
    it('should handle responsive design classes', () => {
      renderWithProviders(<Pot2PumpLeaderboard />);

      // Check for responsive grid classes
      const statsGrid = screen.getByText('Users').closest('.grid');
      expect(statsGrid).toHaveClass('grid-cols-1', 'lg:grid-cols-4');
    });
  });

  describe('Loading Indicators', () => {
    it('should show loading indicator during pagination', () => {
      mockUsePot2PumpAccounts.mockReturnValue({
        accounts: mockAccounts,
        loading: true,
        error: undefined,
        loadMore: jest.fn(),
        hasMore: true,
      });

      renderWithProviders(<Pot2PumpLeaderboard />);

      // Check for the spinning icon by class name
      const spinningIcon = document.querySelector('.animate-spin');
      expect(spinningIcon).toBeInTheDocument();
    });
  });

  describe('Chain Breakdown Tooltip', () => {
    it('should show chain breakdown tooltip', async () => {
      renderWithProviders(<Pot2PumpLeaderboard />);

      await waitFor(() => {
        // Look for the info icon SVG by checking for the SVG element with specific path
        const infoIcon = document.querySelector('svg path[d*="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"]');
        expect(infoIcon).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty accounts list', () => {
      mockUsePot2PumpAccounts.mockReturnValue({
        accounts: [],
        loading: false,
        error: undefined,
        loadMore: jest.fn(),
        hasMore: false,
      });

      renderWithProviders(<Pot2PumpLeaderboard />);
      
      // Should still render table structure
      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(screen.getByText('Launches')).toBeInTheDocument();
      expect(screen.getByText('Participations')).toBeInTheDocument();
      expect(screen.getByText('Total Deposit')).toBeInTheDocument();
    });

    it('should handle null stats data', () => {
      mockUsePot2PumpLeaderboard.mockReturnValue({
        stats: null,
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      renderWithProviders(<Pot2PumpLeaderboard />);
      
      expect(screen.getByText('Pot2Pump Leaderboard')).toBeInTheDocument();
    });
  });
});
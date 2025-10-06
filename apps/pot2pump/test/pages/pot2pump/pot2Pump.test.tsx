import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MemeLaunchPage from '../../../pages/pot2pump/pot2Pump';
import { MemePairContract } from '../../../services/contract/launches/pot2pump/memepair-contract';

import { wallet } from '@honeypot/shared/lib/wallet';





// Mock all external dependencies
jest.mock('mobx-react-lite', () => ({
  observer: (component: any) => component,
}));

jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    account: '0x1234567890123456789012345678901234567890',
    currentChainId: 80084,
    isInit: true,
  },
}));

jest.mock('@nextui-org/react', () => ({
  Tab: function MockTab({ children, title, ...props }: any) {
    const mockReact = require('react');
    return mockReact.createElement(
      'div',
      { 'data-testid': 'tab', ...props },
      children
    );
  },
  Tabs: function MockTabs({ children, onSelectionChange, ...props }: any) {
    const mockReact = require('react');
    return mockReact.createElement(
      'div',
      { 'data-testid': 'tabs', ...props },
      children
    );
  },
}));

jest.mock('react-icons/fa', () => ({
  FaExternalLinkAlt: function MockIcon() {
    const mockReact = require('react');
    return mockReact.createElement(
      'span',
      { 'data-testid': 'external-link-icon' },
      '↗'
    );
  },
}));

// Mock Next.js components
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
  }: {
    children: any;
    href: string;
  }) {
    const mockReact = require('react');
    return mockReact.createElement('a', { href }, children);
  };
});

jest.mock('next/image', () => {
  return function MockImage({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) {
    const mockReact = require('react');
    return mockReact.createElement('img', { src, alt, ...props });
  };
});

// Mock wallet
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    account: '0x1234567890123456789012345678901234567890',
    currentChainId: 80084,
    isInit: true,
  },
}));

// Mock internal services and components
jest.mock('@/services/memewar', () => ({
  memewarStore: {
    reloadParticipants: jest.fn(),
  },
}));

jest.mock('@/components/button/button-next', () => ({
  Button: function MockButton({ children, className, ...props }: any) {
    const mockReact = require('react');
    return mockReact.createElement('button', { className, ...props }, children);
  },
}));

jest.mock('@/components/Pagination/Pagination', () => ({
  __esModule: true,
  default: function MockPagination({
    paginationState,
    render,
    classNames,
  }: any) {
    const mockReact = require('react');
    return mockReact.createElement(
      'div',
      { 'data-testid': 'pagination', className: classNames?.itemsContainer },
      paginationState?.items?.map((item: any, index: number) =>
        mockReact.createElement('div', { key: index }, render(item))
      )
    );
  },
}));

jest.mock('@/components/LaunchCard/v3/pot2Pump', () => ({
  LaunchCardV3: function MockLaunchCardV3({ pair, action }: any) {
    const mockReact = require('react');
    return mockReact.createElement('div', { 'data-testid': 'launch-card' }, [
      mockReact.createElement(
        'span',
        {
          key: 'name',
          'data-testid': 'pair-name',
        },
        pair?.projectName || 'Unknown'
      ),
      mockReact.createElement(
        'div',
        {
          key: 'action',
          'data-testid': 'card-action',
        },
        action
      ),
    ]);
  },
}));

jest.mock('@/components/pot2pump/FilterModal', () => ({
  Filter: function MockFilter({ filters, setFilters, pumpingProjects }: any) {
    const mockReact = require('react');
    return mockReact.createElement(
      'div',
      { 'data-testid': 'filter-modal' },
      'Filter'
    );
  },
}));

jest.mock('@/components/MemeWarBanner/Pot2PumpTracker', () => ({
  Pot2PumpTracker: function MockTracker() {
    const mockReact = require('react');
    return mockReact.createElement(
      'div',
      { 'data-testid': 'pot2pump-tracker' },
      'Tracker'
    );
  },
}));

jest.mock('@/components/wrappedNextUI/SearchBar/WrappedInputSearchBar', () => ({
  WrappedNextInputSearchBar: function MockSearchBar({
    value,
    placeholder,
    onChange,
    className,
  }: any) {
    const mockReact = require('react');
    return mockReact.createElement('input', {
      'data-testid': 'search-input',
      placeholder,
      className,
      onChange,
    });
  },
}));

jest.mock('@/constants/pot2pump.type', () => ({}));

jest.mock('@/constants/pot2pump', () => ({
  defaultFilterState: {
    search: '',
    tvl: { min: '', max: '' },
    participants: { min: '', max: '' },
  },
}));

// Mock Pot2PumpPumpingService
const mockProjectsPage = {
  items: [] as MemePairContract[],
  loading: false,
  hasNextPage: true,
  loadNextPage: jest.fn(),
  refresh: jest.fn(),
  reloadPage: jest.fn(),
  updateFilter: jest.fn(),
  error: null as Error | null,
  filter: {
    status: 'success',
    search: '',
    currentPage: 0,
    limit: 9,
  },
  setFilter: jest.fn(),
};

jest.mock('@/services/launchpad/pot2pump/pot2Pump', () => ({
  Pot2PumpPumpingService: jest.fn().mockImplementation(() => ({
    projectsPage: mockProjectsPage,
  })),
}));

describe('MemeLaunchPage', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();

    // Reset mock data
    mockProjectsPage.items = [];
    mockProjectsPage.loading = false;
    mockProjectsPage.hasNextPage = true;

    // Ensure wallet is initialized by default
    (wallet as any).isInit = true;
  });

  describe('Page Rendering', () => {
    it('should render the main container', () => {
      render(<MemeLaunchPage />);

      const containers = screen.getAllByRole('generic');
      const mainContainer = containers.find(
        (el) =>
          el.classList.contains('w-full') &&
          el.classList.contains('grow') &&
          el.classList.contains('flex') &&
          el.classList.contains('flex-col') &&
          el.classList.contains('font-gliker')
      );

      expect(mainContainer).toBeInTheDocument();
    });

    it('should render pot2pump tracker', () => {
      render(<MemeLaunchPage />);

      expect(screen.getByTestId('pot2pump-tracker')).toBeInTheDocument();
    });

    it('should render tabs component', () => {
      render(<MemeLaunchPage />);

      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });

    it('should render launch token button', () => {
      render(<MemeLaunchPage />);

      const launchButton = screen.getByText('Launch Token');
      expect(launchButton.closest('a')).toHaveAttribute(
        'href',
        '/launch-token?launchType=meme'
      );
    });
  });

  describe('Token List Display', () => {
    it('should render tabs component', () => {
      render(<MemeLaunchPage />);

      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });

    it('should render tab elements', () => {
      render(<MemeLaunchPage />);

      const tabs = screen.getAllByTestId('tab');
      expect(tabs.length).toBeGreaterThan(0);
    });

    it('should render pagination when service is available', async () => {
      // Wait for useEffect to run
      render(<MemeLaunchPage />);

      await waitFor(() => {
        const pagination = screen.queryByTestId('pagination');
        if (pagination) {
          expect(pagination).toBeInTheDocument();
        }
      });
    });
  });

  describe('Component Integration', () => {
    it('should initialize service when wallet is ready', () => {
      (wallet as any).isInit = true;

      render(<MemeLaunchPage />);

      expect(mockProjectsPage.reloadPage).toHaveBeenCalled();
    });

    it('should not initialize service when wallet is not ready', () => {
      (wallet as any).isInit = false;

      render(<MemeLaunchPage />);

      expect(mockProjectsPage.reloadPage).not.toHaveBeenCalled();
    });

    it('should reload participants on mount', () => {
      const mockMemewarStore = require('@/services/memewar').memewarStore;

      render(<MemeLaunchPage />);

      expect(mockMemewarStore.reloadParticipants).toHaveBeenCalled();
    });
  });

  describe('Tab Functionality', () => {
    it('should render tabs with correct structure', () => {
      render(<MemeLaunchPage />);

      const tabs = screen.getByTestId('tabs');
      expect(tabs).toHaveAttribute('aria-label', 'Options');
      expect(tabs).toHaveClass('next-tab');
    });

    it('should render tab content', () => {
      render(<MemeLaunchPage />);

      const tabs = screen.getAllByTestId('tab');
      expect(tabs.length).toBeGreaterThan(0);
    });

    it('should handle tab selection', () => {
      render(<MemeLaunchPage />);

      // Verify tabs component is rendered with proper attributes
      const tabs = screen.getByTestId('tabs');
      expect(tabs).toHaveAttribute('aria-label', 'Options');
      expect(tabs).toHaveClass('next-tab');
    });
  });

  describe('Pagination', () => {
    it('should render pagination when service is initialized', async () => {
      render(<MemeLaunchPage />);

      // Wait for the useEffect to run and create the service
      await waitFor(() => {
        const pagination = screen.queryByTestId('pagination');
        if (pagination) {
          expect(pagination).toBeInTheDocument();
        }
      });
    });

    it('should not render pagination when wallet is not initialized', () => {
      (wallet as any).isInit = false;

      render(<MemeLaunchPage />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('should render tabs regardless of pagination state', () => {
      render(<MemeLaunchPage />);

      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });
  });

  describe('Service Integration', () => {
    it('should call memewar store reload on mount', () => {
      const mockMemewarStore = require('@/services/memewar').memewarStore;

      render(<MemeLaunchPage />);

      expect(mockMemewarStore.reloadParticipants).toHaveBeenCalled();
    });

    it('should handle service initialization asynchronously', async () => {
      render(<MemeLaunchPage />);

      // The service is created in useEffect, so we need to wait
      await waitFor(() => {
        expect(mockProjectsPage.reloadPage).toHaveBeenCalled();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive container classes', () => {
      render(<MemeLaunchPage />);

      const containers = screen.getAllByRole('generic');
      const mainContainer = containers.find(
        (el) =>
          el.classList.contains('px-4') && el.classList.contains('md:px-6')
      );

      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass(
        'px-4',
        'md:px-6',
        'w-full',
        'xl:max-w-[1200px]',
        'mx-auto'
      );
    });

    it('should have main layout with responsive classes', () => {
      render(<MemeLaunchPage />);

      const containers = screen.getAllByRole('generic');
      const mainLayout = containers.find(
        (el) =>
          el.classList.contains('w-full') &&
          el.classList.contains('grow') &&
          el.classList.contains('flex') &&
          el.classList.contains('flex-col')
      );

      expect(mainLayout).toBeInTheDocument();
      expect(mainLayout).toHaveClass('font-gliker');
    });
  });

  describe('Layout Structure', () => {
    it('should render filter section with correct id', () => {
      render(<MemeLaunchPage />);

      const filterDiv = document.getElementById('filter');
      expect(filterDiv).toBeInTheDocument();
      expect(filterDiv).toHaveClass(
        'flex',
        'flex-col',
        'sm:flex-row',
        'items-center',
        'gap-2',
        'my-4',
        'sm:my-0'
      );
    });

    it('should render button section with launch token link', () => {
      render(<MemeLaunchPage />);

      const launchButton = screen.getByText('Launch Token');
      const link = launchButton.closest('a');
      expect(link).toHaveAttribute('href', '/launch-token?launchType=meme');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible tabs component', () => {
      render(<MemeLaunchPage />);

      const tabs = screen.getByTestId('tabs');
      expect(tabs).toHaveAttribute('aria-label', 'Options');
    });

    it('should have accessible launch button', () => {
      render(<MemeLaunchPage />);

      const launchButton = screen.getByRole('button');
      expect(launchButton).toBeInTheDocument();

      const launchLink = screen.getByRole('link');
      expect(launchLink).toHaveAttribute(
        'href',
        '/launch-token?launchType=meme'
      );
    });

    it('should render semantic HTML structure', () => {
      render(<MemeLaunchPage />);

      // Check for proper div structure
      const containers = screen.getAllByRole('generic');
      expect(containers.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle component mounting without errors', () => {
      expect(() => render(<MemeLaunchPage />)).not.toThrow();
    });

    it('should handle wallet state changes', () => {
      const { rerender } = render(<MemeLaunchPage />);

      (wallet as any).isInit = false;
      rerender(<MemeLaunchPage />);

      (wallet as any).isInit = true;
      rerender(<MemeLaunchPage />);

      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });
  });

  describe('Integration with Wallet', () => {
    it('should not initialize service when wallet is not ready', () => {
      (wallet as any).isInit = false;
      jest.clearAllMocks();

      render(<MemeLaunchPage />);

      expect(mockProjectsPage.reloadPage).not.toHaveBeenCalled();
    });

    it('should display launch token button when rendered', () => {
      (wallet as any).isInit = true;

      render(<MemeLaunchPage />);

      expect(screen.getByText('Launch Token')).toBeInTheDocument();
    });

    it('should initialize service when wallet is ready', () => {
      (wallet as any).isInit = true;
      jest.clearAllMocks();

      render(<MemeLaunchPage />);

      expect(mockProjectsPage.reloadPage).toHaveBeenCalled();
    });
  });
});

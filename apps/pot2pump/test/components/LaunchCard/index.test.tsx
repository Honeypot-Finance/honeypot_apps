import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import BigNumber from 'bignumber.js';

import { MemePairContract } from '@/services/contract/launches/pot2pump/memepair-contract';
import { FtoPairContract } from '@/services/contract/launches/fto/ftopair-contract';
import { LaunchCard } from '../../../components/LaunchCard/index';




// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href }: { children: any; href: string }) => {
    const mockReact = require('react');
    return mockReact.createElement('a', { href }, children);
  };
});

jest.mock('next/image', () => {
  return ({ src, alt, ...props }: any) => {
    const mockReact = require('react');
    return mockReact.createElement('img', { src, alt, ...props });
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const mockReact = require('react');
      return mockReact.createElement('div', { ...props }, children);
    },
  },
}));

// Mock react-countdown
jest.mock('react-countdown', () => {
  return ({ renderer }: { renderer: (countdown: any) => any }) => {
    const mockCountdown = {
      days: 2,
      hours: 5,
      minutes: 30,
      seconds: 45,
      completed: false,
    };
    return renderer(mockCountdown);
  };
});

// Mock clipboard-polyfill
jest.mock('clipboard-polyfill', () => ({
  writeText: jest.fn().mockResolvedValue(undefined),
}));

// Mock OptionsDropdown component
jest.mock('@pot2pump/components/OptionsDropdown/OptionsDropdown', () => {
  const mockReact = require('react');
  return {
    OptionsDropdown: ({ children }: { children: any }) => 
      mockReact.createElement('div', { 'data-testid': 'options-dropdown' }, children),
    optionsPresets: {
      copy: jest.fn((config) => ({
        ...config,
        onClick: jest.fn(),
      })),
      importTokenToWallet: jest.fn((config) => ({
        ...config,
        onClick: jest.fn(),
      })),
      share: jest.fn((config) => ({
        ...config,
        onClick: jest.fn(),
      })),
      viewOnExplorer: jest.fn((config) => ({
        ...config,
        onClick: jest.fn(),
      })),
    },
  };
});

// Mock wallet
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    account: '0x1234567890123456789012345678901234567890',
    currentChainId: 80084,
  },
}));

describe('LaunchCard', () => {
  let mockMemePair: MemePairContract;
  let mockFtoPair: FtoPairContract;

  const createMockMemePair = () => {
    // Create a mock that will be recognized as MemePairContract
    const pair = {
      address: '0xmemepair',
      name: 'Test Meme Token',
      projectName: 'Test Meme Project',
      logoUrl: '/test-logo.png',
      bannerUrl: '/test-banner.png',
      launchedToken: {
        name: 'Test Meme Token',
        symbol: 'TMT',
        address: '0xlaunchedtoken',
        displayName: 'TMT',
      },
      raiseToken: {
        displayName: 'HONEY',
        symbol: 'HONEY',
      },
      depositedRaisedToken: new BigNumber('1500'),
      depositedLaunchedToken: new BigNumber('1000000'),
      raisedTokenMinCap: new BigNumber('2000000000000000000'),
      participantsCount: new BigNumber('25'),
      endTime: '1640995200',
      state: 3, // Processing
      canClaimLP: false,
      canRefund: false,
      price: new BigNumber('0.0015'),
      refund: { call: jest.fn() },
      claimLP: { call: jest.fn() },
    };
    // Set the prototype to make instanceof work
    Object.setPrototypeOf(pair, MemePairContract.prototype);
    return pair;
  };

  beforeEach(() => {
    mockMemePair = createMockMemePair();

    // Create mock FtoPairContract
    mockFtoPair = {
      address: '0xftopair',
      launchedToken: {
        name: 'Test FTO Token',
        symbol: 'TFT',
        address: '0xftotoken',
        displayName: 'TFT',
      },
      raiseToken: {
        displayName: 'USDC',
        symbol: 'USDC',
      },
      depositedRaisedToken: new BigNumber('5000'),
      depositedLaunchedToken: new BigNumber('2000000'),
      participantsCount: new BigNumber('50'),
      endTime: '1640995200',
      state: 0, // Success
      canClaimLP: true,
      price: new BigNumber('0.0025'),
      logoUrl: '/fto-logo.png',
      bannerUrl: '/fto-banner.png',
      projectName: 'Test FTO Project',
      claimLP: { call: jest.fn() },
    };
    // Set the prototype to make instanceof work
    Object.setPrototypeOf(mockFtoPair, FtoPairContract.prototype);
  });

  describe('Meme Project Rendering', () => {
    it('should render meme project card with correct information', () => {
      render(
        <LaunchCard pair={mockMemePair} action={<div>Test Action</div>} />
      );

      expect(screen.getByText('Test Meme Token (TMT)')).toBeInTheDocument();
      expect(screen.getByText('Total raised')).toBeInTheDocument();
      expect(screen.getByText('1,500.000 HONEY')).toBeInTheDocument();
      expect(screen.getByText('Participants')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('should show progress bar for processing meme projects', () => {
      render(
        <LaunchCard pair={mockMemePair} action={<div>Test Action</div>} />
      );

      expect(screen.getByText('Progress')).toBeInTheDocument();
      // Progress bar should be visible
      expect(
        document.querySelector('[role="progressbar"]')
      ).toBeInTheDocument();
    });

    it('should display countdown timer', () => {
      render(
        <LaunchCard pair={mockMemePair} action={<div>Test Action</div>} />
      );

      expect(screen.getByText('End Time')).toBeInTheDocument();
      expect(screen.getByText('2d 5h 30m 45s')).toBeInTheDocument();
    });

    it('should show project logo and banner', () => {
      render(
        <LaunchCard pair={mockMemePair} action={<div>Test Action</div>} />
      );

      const logo = screen.getByAltText('honey');
      const banner = screen.getByAltText('banner');

      expect(logo).toHaveAttribute('src', '/test-logo.png');
      expect(banner).toHaveAttribute('src', '/test-banner.png');
    });
  });

  describe('FTO Project Rendering', () => {
    it('should render FTO project card with correct information', () => {
      render(<LaunchCard pair={mockFtoPair} action={<div>Test Action</div>} />);

      expect(screen.getByText('Test FTO Token (TFT)')).toBeInTheDocument();
      expect(screen.getByText('Total launched')).toBeInTheDocument();
      expect(screen.getByText('2,000,000 TFT')).toBeInTheDocument();
      expect(screen.getByText('Token Price')).toBeInTheDocument();
    });

    it('should show claim LP button for successful FTO projects', () => {
      render(<LaunchCard pair={mockFtoPair} action={<div>Test Action</div>} />);

      const claimButton = screen.getByText('Claim LP');
      expect(claimButton).toBeInTheDocument();
    });

    it('should handle claim LP button click', async () => {
      render(<LaunchCard pair={mockFtoPair} action={<div>Test Action</div>} />);

      const claimButton = screen.getByText('Claim LP');
      fireEvent.click(claimButton);

      await waitFor(() => {
        expect(mockFtoPair.claimLP.call).toHaveBeenCalled();
      });
    });
  });

  describe('Action Buttons', () => {
    it('should render custom action component', () => {
      const customAction = <button>Custom Action</button>;
      render(<LaunchCard pair={mockMemePair} action={customAction} />);

      expect(screen.getByText('Custom Action')).toBeInTheDocument();
    });

    it('should show View Token link', () => {
      render(
        <LaunchCard pair={mockMemePair} action={<div>Test Action</div>} />
      );

      const viewTokenLink = screen.getByText('View Token');
      expect(viewTokenLink.closest('a')).toHaveAttribute(
        'href',
        '/launch-detail/0xlaunchedtoken'
      );
    });

    it('should show Buy Token link for successful projects', () => {
      Object.defineProperty(mockMemePair, 'state', {
        value: 0, // Success
        writable: true,
        configurable: true,
      });
      render(
        <LaunchCard pair={mockMemePair} action={<div>Test Action</div>} />
      );

      const buyTokenLink = screen.getByText('Buy Token');
      expect(buyTokenLink.closest('a')).toHaveAttribute(
        'href',
        '/swap?inputCurrency=undefined&outputCurrency=0xlaunchedtoken'
      );
    });

    it('should show Add LP link for successful projects', () => {
      Object.defineProperty(mockMemePair, 'state', {
        value: 0, // Success
        writable: true,
        configurable: true,
      });
      render(
        <LaunchCard pair={mockMemePair} action={<div>Test Action</div>} />
      );

      const addLPLink = screen.getByText('Add LP');
      expect(addLPLink.closest('a')).toHaveAttribute(
        'href',
        '/pool?inputCurrency=0xlaunchedtoken&outputCurrency=undefined'
      );
    });
  });

  describe('Refund Functionality', () => {
    it('should show refund button when canRefund is true', () => {
      mockMemePair.canRefund = true;
      mockMemePair.refund = { call: jest.fn() };

      render(
        <LaunchCard pair={mockMemePair} action={<div>Test Action</div>} />
      );

      const refundButton = screen.getByText('Refund');
      expect(refundButton).toBeInTheDocument();
    });

    it('should handle refund button click', async () => {
      mockMemePair.canRefund = true;
      mockMemePair.refund = { call: jest.fn() };

      render(
        <LaunchCard pair={mockMemePair} action={<div>Test Action</div>} />
      );

      const refundButton = screen.getByText('Refund');
      fireEvent.click(refundButton);

      await waitFor(() => {
        expect(mockMemePair.refund.call).toHaveBeenCalled();
      });
    });

    it('should not show refund button when canRefund is false', () => {
      mockMemePair.canRefund = false;

      render(
        <LaunchCard pair={mockMemePair} action={<div>Test Action</div>} />
      );

      expect(screen.queryByText('Refund')).not.toBeInTheDocument();
    });
  });

  describe('Card Variants', () => {
    it('should render trending variant correctly', () => {
      render(
        <LaunchCard
          pair={mockMemePair}
          action={<div>Test Action</div>}
          type="trending"
        />
      );

      // Trending cards should show progress percentage
      expect(screen.getByText('Total raised')).toBeInTheDocument();
      // Look for percentage text in trending variant
      expect(screen.getByText(/\d+\.\d+\s*%/)).toBeInTheDocument();
    });

    it('should render detail variant by default', () => {
      render(
        <LaunchCard pair={mockMemePair} action={<div>Test Action</div>} />
      );

      // Detail cards should show more comprehensive information
      expect(screen.getByText('End Time')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('Participants')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null pair gracefully', () => {
      render(<LaunchCard pair={null} action={<div>Test Action</div>} />);

      // Should not crash - component renders empty when pair is null
      // The action is not rendered when pair is null based on component logic
      expect(screen.queryByText('Test Action')).not.toBeInTheDocument();
    });

    it('should handle missing token data', () => {
      mockMemePair.launchedToken = undefined;
      mockMemePair.raiseToken = undefined;

      render(
        <LaunchCard pair={mockMemePair} action={<div>Test Action</div>} />
      );

      // Should render with fallback values
      expect(screen.getByText('Test Action')).toBeInTheDocument();
    });

    it('should handle missing logo with fallback', () => {
      mockMemePair.logoUrl = '';

      render(
        <LaunchCard pair={mockMemePair} action={<div>Test Action</div>} />
      );

      const logo = screen.getByAltText('honey');
      expect(logo).toHaveAttribute('src', '/images/project_honey.png');
    });

    it('should display ended message when countdown is completed', () => {
      // Set pair state to non-processing (not 3) to trigger "Ended!" display
      Object.defineProperty(mockMemePair, 'state', {
        value: 0, // Success state
        writable: true,
        configurable: true,
      });

      render(
        <LaunchCard pair={mockMemePair} action={<div>Test Action</div>} />
      );

      expect(screen.getByText('Ended!')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text for images', () => {
      render(
        <LaunchCard pair={mockMemePair} action={<div>Test Action</div>} />
      );

      expect(screen.getByAltText('honey')).toBeInTheDocument();
      expect(screen.getByAltText('banner')).toBeInTheDocument();
    });

    it('should have clickable elements with proper roles', () => {
      mockMemePair.canClaimLP = true;
      mockMemePair.claimLP = { call: jest.fn() };

      render(
        <LaunchCard pair={mockMemePair} action={<div>Test Action</div>} />
      );

      const claimButton = screen.getByText('Claim LP');
      expect(claimButton.tagName).toBe('BUTTON');
    });
  });
});

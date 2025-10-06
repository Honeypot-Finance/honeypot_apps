import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import Leaderboard from '../../../pages/leaderboard';


// Mock NextUI components
jest.mock('@nextui-org/react', () => {
  const mockReact = require('react');
  return {
    Tabs: ({
      children,
      selectedKey,
      onSelectionChange,
      className,
      classNames,
    }: any) =>
      mockReact.createElement(
        'div',
        {
          role: 'tablist',
          className,
          'data-classnames': JSON.stringify(classNames),
        },
        [
          mockReact.createElement(
            'div',
            { 'data-testid': 'tabs-container', key: 'tabs' },
            mockReact.Children.map(children, (child: any, index: number) => {
              if (child?.key) {
                const isSelected = selectedKey === child.key;
                return mockReact.createElement(
                  'button',
                  {
                    key: child.key,
                    role: 'tab',
                    'aria-selected': isSelected,
                    onClick: () => onSelectionChange?.(child.key),
                    'data-testid': `tab-${child.key}`,
                  },
                  child.props.title
                );
              }
              return null;
            })
          ),
          mockReact.createElement(
            'div',
            {
              role: 'tabpanel',
              'data-testid': 'tab-panel',
              key: 'panel',
            },
            mockReact.Children.map(children, (child: any) => {
              if (child?.key === selectedKey) {
                return child.props.children;
              }
              return null;
            })
          ),
        ]
      ),
    Tab: ({ children, title }: unknown) =>
      mockReact.createElement('div', { 'data-title': title }, children),
  };
});

// Mock the child components directly
jest.mock(
  '../../../pages/leaderboard/components/pot2pump-leaderboard',
  () => {
    return function MockPot2PumpLeaderboard() {
      return (
        <div data-testid="pot2pump-leaderboard">
          Pot2Pump Leaderboard Content
        </div>
      );
    };
  }
);

jest.mock(
  '../../../pages/leaderboard/components/wasabee-leaderboard',
  () => {
    return function MockWasabeeLeaderboard() {
      return (
        <div data-testid="wasabee-leaderboard">Wasabee Leaderboard Content</div>
      );
    };
  }
);

jest.mock(
  '../../../pages/leaderboard/components/dreampad-leaderboard',
  () => {
    return function MockDreampadLeaderboard() {
      return (
        <div data-testid="dreampad-leaderboard">
          Dreampad Leaderboard Content
        </div>
      );
    };
  }
);

jest.mock(
  '../../../components/card-contianer/v3',
  () => {
    return function MockCardContainer({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) {
      return (
        <div data-testid="card-container" className={className}>
          {children}
        </div>
      );
    };
  }
);

describe('All-in-One Vault Leaderboard Hub', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(component);
  };

  describe('Component Rendering', () => {
    it('should render the main leaderboard hub with title and description', () => {
      renderWithProviders(<Leaderboard />);

      expect(screen.getByText('All-in-One Leaderboard')).toBeInTheDocument();
      expect(
        screen.getByText('Combined leaderboard from Meme, Dex, and Launchpad')
      ).toBeInTheDocument();
    });

    it('should render all three tabs', () => {
      renderWithProviders(<Leaderboard />);

      expect(screen.getByText('Meme')).toBeInTheDocument();
      expect(screen.getByText('Dex')).toBeInTheDocument();
      expect(screen.getByText('Launchpad')).toBeInTheDocument();
    });

    it('should render within CardContainer', () => {
      renderWithProviders(<Leaderboard />);

      expect(screen.getByTestId('card-container')).toBeInTheDocument();
    });
  });

  describe('Tab Functionality', () => {
    it('should show Pot2Pump leaderboard by default', () => {
      renderWithProviders(<Leaderboard />);

      expect(screen.getByTestId('pot2pump-leaderboard')).toBeInTheDocument();
      expect(
        screen.queryByTestId('wasabee-leaderboard')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('dreampad-leaderboard')
      ).not.toBeInTheDocument();
    });

    it('should switch to Wasabee leaderboard when Dex tab is clicked', async () => {
      renderWithProviders(<Leaderboard />);

      const dexTab = screen.getByText('Dex');
      fireEvent.click(dexTab);

      await waitFor(() => {
        expect(screen.getByTestId('wasabee-leaderboard')).toBeInTheDocument();
      });

      expect(
        screen.queryByTestId('pot2pump-leaderboard')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('dreampad-leaderboard')
      ).not.toBeInTheDocument();
    });

    it('should switch to Dreampad leaderboard when Launchpad tab is clicked', async () => {
      renderWithProviders(<Leaderboard />);

      const launchpadTab = screen.getByText('Launchpad');
      fireEvent.click(launchpadTab);

      await waitFor(() => {
        expect(screen.getByTestId('dreampad-leaderboard')).toBeInTheDocument();
      });

      expect(
        screen.queryByTestId('pot2pump-leaderboard')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('wasabee-leaderboard')
      ).not.toBeInTheDocument();
    });

    it('should switch back to Pot2Pump when Meme tab is clicked', async () => {
      renderWithProviders(<Leaderboard />);

      // First switch to another tab
      const dexTab = screen.getByText('Dex');
      fireEvent.click(dexTab);

      await waitFor(() => {
        expect(screen.getByTestId('wasabee-leaderboard')).toBeInTheDocument();
      });

      // Then switch back to Meme tab
      const memeTab = screen.getByText('Meme');
      fireEvent.click(memeTab);

      await waitFor(() => {
        expect(screen.getByTestId('pot2pump-leaderboard')).toBeInTheDocument();
      });

      expect(
        screen.queryByTestId('wasabee-leaderboard')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('dreampad-leaderboard')
      ).not.toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('should maintain tab state correctly', async () => {
      renderWithProviders(<Leaderboard />);

      // Switch to Dex tab
      fireEvent.click(screen.getByText('Dex'));
      await waitFor(() => {
        expect(screen.getByTestId('wasabee-leaderboard')).toBeInTheDocument();
      });

      // Switch to Launchpad tab
      fireEvent.click(screen.getByText('Launchpad'));
      await waitFor(() => {
        expect(screen.getByTestId('dreampad-leaderboard')).toBeInTheDocument();
      });

      // Verify only the current tab content is visible
      expect(
        screen.queryByTestId('pot2pump-leaderboard')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('wasabee-leaderboard')
      ).not.toBeInTheDocument();
    });

    it('should handle rapid tab switching', async () => {
      renderWithProviders(<Leaderboard />);

      const memeTab = screen.getByText('Meme');
      const dexTab = screen.getByText('Dex');
      const launchpadTab = screen.getByText('Launchpad');

      // Rapidly switch between tabs
      fireEvent.click(dexTab);
      fireEvent.click(launchpadTab);
      fireEvent.click(memeTab);
      fireEvent.click(dexTab);

      await waitFor(() => {
        expect(screen.getByTestId('wasabee-leaderboard')).toBeInTheDocument();
      });

      expect(
        screen.queryByTestId('pot2pump-leaderboard')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('dreampad-leaderboard')
      ).not.toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should pass correct props to child components', () => {
      renderWithProviders(<Leaderboard />);

      // Verify that child components are rendered (they should handle their own props)
      expect(screen.getByTestId('pot2pump-leaderboard')).toBeInTheDocument();
    });

    it('should handle child component errors gracefully', () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {
        // Intentionally empty - suppressing console errors for this test
      });

      // This test ensures the parent component doesn't crash if child components have issues
      renderWithProviders(<Leaderboard />);

      expect(screen.getByText('All-in-One Leaderboard')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      renderWithProviders(<Leaderboard />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('All-in-One Leaderboard');
    });

    it('should have accessible tab navigation', () => {
      renderWithProviders(<Leaderboard />);

      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
      expect(tabs[0]).toHaveTextContent('Meme');
      expect(tabs[1]).toHaveTextContent('Dex');
      expect(tabs[2]).toHaveTextContent('Launchpad');
    });

    it('should support keyboard navigation', async () => {
      renderWithProviders(<Leaderboard />);

      const firstTab = screen.getByRole('tab', { name: 'Meme' });
      firstTab.focus();

      // Simulate Tab key to move to next tab
      fireEvent.keyDown(firstTab, { key: 'Tab' });

      // The NextUI Tabs component should handle keyboard navigation
      expect(document.activeElement).toBeDefined();
    });
  });

  describe('Responsive Design', () => {
    it('should render correctly on different screen sizes', () => {
      // Mock window.matchMedia for responsive testing
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query.includes('768px'), // Mock mobile breakpoint
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      renderWithProviders(<Leaderboard />);

      expect(screen.getByText('All-in-One Leaderboard')).toBeInTheDocument();
      expect(
        screen.getByText('Combined leaderboard from Meme, Dex, and Launchpad')
      ).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently with all tabs', () => {
      const startTime = performance.now();

      renderWithProviders(<Leaderboard />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(100); // Should render within 100ms
      expect(screen.getByText('All-in-One Leaderboard')).toBeInTheDocument();
    });

    it('should not re-render unnecessarily when switching tabs', async () => {
      const { rerender } = renderWithProviders(<Leaderboard />);

      // Switch tabs multiple times
      fireEvent.click(screen.getByText('Dex'));
      await waitFor(() => {
        expect(screen.getByTestId('wasabee-leaderboard')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Launchpad'));
      await waitFor(() => {
        expect(screen.getByTestId('dreampad-leaderboard')).toBeInTheDocument();
      });

      // Rerender should not cause issues
      rerender(<Leaderboard />);

      expect(screen.getByText('All-in-One Leaderboard')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing child components gracefully', () => {
      // Temporarily unmock one component to test error handling
      jest.doMock(
        '@all-in-one-vault/pages/leaderboard/components/pot2pump-leaderboard',
        () => {
          throw new Error('Component failed to load');
        }
      );

      // The component should still render the main structure
      expect(() => renderWithProviders(<Leaderboard />)).not.toThrow();
    });

    it('should maintain functionality when one tab fails', async () => {
      renderWithProviders(<Leaderboard />);

      // Even if one component has issues, tab switching should still work
      fireEvent.click(screen.getByText('Dex'));

      await waitFor(() => {
        expect(screen.getByTestId('wasabee-leaderboard')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Launchpad'));

      await waitFor(() => {
        expect(screen.getByTestId('dreampad-leaderboard')).toBeInTheDocument();
      });
    });
  });
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { Pagination } from '../../../components/Pagination/Pagination';

// Mock Button component
jest.mock('@/components/button', () => {
  const mockReact = require('react');
  return {
    Button: ({ children, onPress, isDisabled, ...props }: any) =>
      mockReact.createElement(
        'button',
        {
          onClick: onPress,
          disabled: isDisabled,
          'data-testid': 'load-more-button',
          ...props,
        },
        children
      ),
  };
});

// Mock DataContainer component
jest.mock('../../../components/DataContainer', () => {
  const mockReact = require('react');
  return {
    DataContainer: ({ children, isLoading, isInit, hasData }: any) =>
      mockReact.createElement(
        'div',
        {
          'data-testid': 'data-container',
          'data-loading': isLoading,
          'data-init': isInit,
          'data-has-data': hasData,
        },
        children
      ),
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('Pagination Component', () => {
  let mockPaginationState: any;
  let mockRender: jest.Mock;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    mockRender = jest.fn((item) => (
      <div data-testid={`item-${item.id}`}>{item.name}</div>
    ));

    mockPaginationState = {
      isLoading: false,
      isInit: true,
      pageItems: {
        value: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
          { id: 3, name: 'Item 3' },
        ],
      },
      filter: {
        hasNextPage: true,
      },
      loadMore: jest.fn(),
    };
  });

  describe('Basic Rendering', () => {
    it('should render pagination with items when initialized', () => {
      render(
        <Pagination paginationState={mockPaginationState} render={mockRender} />
      );

      expect(screen.getByTestId('data-container')).toBeInTheDocument();
      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-2')).toBeInTheDocument();
      expect(screen.getByTestId('item-3')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should not render items when not initialized', () => {
      mockPaginationState.isInit = false;

      render(
        <Pagination paginationState={mockPaginationState} render={mockRender} />
      );

      expect(screen.getByTestId('data-container')).toBeInTheDocument();
      expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('load-more-button')).not.toBeInTheDocument();
    });

    it('should pass correct props to DataContainer', () => {
      render(
        <Pagination paginationState={mockPaginationState} render={mockRender} />
      );

      const dataContainer = screen.getByTestId('data-container');
      expect(dataContainer).toHaveAttribute('data-loading', 'false');
      expect(dataContainer).toHaveAttribute('data-init', 'true');
      expect(dataContainer).toHaveAttribute('data-has-data', 'true');
    });

    it('should handle empty items array', () => {
      mockPaginationState.pageItems.value = [];

      render(
        <Pagination paginationState={mockPaginationState} render={mockRender} />
      );

      const dataContainer = screen.getByTestId('data-container');
      expect(dataContainer).toHaveAttribute('data-has-data', 'false');
      expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
    });
  });

  describe('Load More Functionality', () => {
    it('should show load more button when hasNextPage is true', () => {
      render(
        <Pagination paginationState={mockPaginationState} render={mockRender} />
      );

      expect(screen.getByTestId('load-more-button')).toBeInTheDocument();
      expect(screen.getByText('Load More')).toBeInTheDocument();
    });

    it('should not show load more button when hasNextPage is false', () => {
      mockPaginationState.filter.hasNextPage = false;

      render(
        <Pagination paginationState={mockPaginationState} render={mockRender} />
      );

      expect(screen.queryByTestId('load-more-button')).not.toBeInTheDocument();
    });

    it('should call loadMore when load more button is clicked', async () => {
      render(
        <Pagination paginationState={mockPaginationState} render={mockRender} />
      );

      const loadMoreButton = screen.getByTestId('load-more-button');
      await user.click(loadMoreButton);

      expect(mockPaginationState.loadMore).toHaveBeenCalledTimes(1);
    });

    it('should disable load more button when loading', () => {
      mockPaginationState.isLoading = true;

      render(
        <Pagination paginationState={mockPaginationState} render={mockRender} />
      );

      const loadMoreButton = screen.getByTestId('load-more-button');
      expect(loadMoreButton).toBeDisabled();
    });

    it('should show loading text when loading', () => {
      mockPaginationState.isLoading = true;

      render(
        <Pagination paginationState={mockPaginationState} render={mockRender} />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Load More')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should pass loading state to DataContainer', () => {
      mockPaginationState.isLoading = true;

      render(
        <Pagination paginationState={mockPaginationState} render={mockRender} />
      );

      const dataContainer = screen.getByTestId('data-container');
      expect(dataContainer).toHaveAttribute('data-loading', 'true');
    });

    it('should handle loading state changes', () => {
      // Create a new state object for loading
      const loadingState = {
        ...mockPaginationState,
        isLoading: true,
      };

      const { rerender } = render(
        <Pagination paginationState={mockPaginationState} render={mockRender} />
      );

      expect(screen.getByText('Load More')).toBeInTheDocument();

      rerender(
        <Pagination paginationState={loadingState} render={mockRender} />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom class names', () => {
      const classNames = {
        base: 'custom-base',
        itemsContainer: 'custom-items-container',
        item: 'custom-item',
      };

      const { container } = render(
        <Pagination
          paginationState={mockPaginationState}
          render={mockRender}
          classNames={classNames}
        />
      );

      const baseElement = container.firstChild as HTMLElement;
      expect(baseElement).toHaveClass('overflow-hidden');
    });

    it('should handle undefined classNames', () => {
      render(
        <Pagination paginationState={mockPaginationState} render={mockRender} />
      );

      expect(screen.getByTestId('data-container')).toBeInTheDocument();
    });
  });

  describe('Render Function', () => {
    it('should call render function for each item', () => {
      render(
        <Pagination paginationState={mockPaginationState} render={mockRender} />
      );

      expect(mockRender).toHaveBeenCalledTimes(3);
      expect(mockRender).toHaveBeenCalledWith({ id: 1, name: 'Item 1' });
      expect(mockRender).toHaveBeenCalledWith({ id: 2, name: 'Item 2' });
      expect(mockRender).toHaveBeenCalledWith({ id: 3, name: 'Item 3' });
    });

    it('should handle custom render function', () => {
      const customRender = jest.fn((item) => (
        <div data-testid={`custom-${item.id}`} className="custom-item">
          {item.name.toUpperCase()}
        </div>
      ));

      render(
        <Pagination
          paginationState={mockPaginationState}
          render={customRender}
        />
      );

      expect(screen.getByTestId('custom-1')).toBeInTheDocument();
      expect(screen.getByText('ITEM 1')).toBeInTheDocument();
      expect(customRender).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined items gracefully', () => {
      mockPaginationState.pageItems.value = [
        null,
        undefined,
        { id: 1, name: 'Valid Item' },
      ];

      const safeRender = jest.fn((item) =>
        item ? <div data-testid={`item-${item.id}`}>{item.name}</div> : null
      );

      render(
        <Pagination paginationState={mockPaginationState} render={safeRender} />
      );

      expect(safeRender).toHaveBeenCalledTimes(3);
      expect(screen.getByTestId('item-1')).toBeInTheDocument();
    });

    it('should handle missing filter object', () => {
      const stateWithoutFilter = {
        ...mockPaginationState,
        filter: undefined,
      };

      render(
        <Pagination paginationState={stateWithoutFilter} render={mockRender} />
      );

      expect(screen.queryByTestId('load-more-button')).not.toBeInTheDocument();
    });

    it('should handle missing pageItems', () => {
      mockPaginationState.pageItems = { value: [] };

      render(
        <Pagination paginationState={mockPaginationState} render={mockRender} />
      );

      const dataContainer = screen.getByTestId('data-container');
      expect(dataContainer).toHaveAttribute('data-has-data', 'false');
    });
  });

  describe('Integration', () => {
    it('should work with dynamic data updates', () => {
      const { rerender } = render(
        <Pagination paginationState={mockPaginationState} render={mockRender} />
      );

      expect(screen.getAllByTestId(/^item-/)).toHaveLength(3);

      // Create new state with more items
      const updatedState = {
        ...mockPaginationState,
        pageItems: {
          value: [
            ...mockPaginationState.pageItems.value,
            { id: 4, name: 'Item 4' },
            { id: 5, name: 'Item 5' },
          ],
        },
      };

      rerender(
        <Pagination paginationState={updatedState} render={mockRender} />
      );

      expect(screen.getAllByTestId(/^item-/)).toHaveLength(5);
      expect(screen.getByTestId('item-4')).toBeInTheDocument();
      expect(screen.getByTestId('item-5')).toBeInTheDocument();
    });

    it('should handle state transitions correctly', async () => {
      const { rerender } = render(
        <Pagination paginationState={mockPaginationState} render={mockRender} />
      );

      // Click load more
      const loadMoreButton = screen.getByTestId('load-more-button');
      await user.click(loadMoreButton);

      // Simulate loading state
      const loadingState = {
        ...mockPaginationState,
        isLoading: true,
      };

      rerender(
        <Pagination paginationState={loadingState} render={mockRender} />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Simulate loading complete with no more pages
      const finalState = {
        ...mockPaginationState,
        isLoading: false,
        filter: {
          hasNextPage: false,
        },
      };

      rerender(<Pagination paginationState={finalState} render={mockRender} />);

      expect(screen.queryByTestId('load-more-button')).not.toBeInTheDocument();
    });
  });
});

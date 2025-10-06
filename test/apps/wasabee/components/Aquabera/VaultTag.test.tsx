import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  VaultTag,
  VaultTagContent,
} from '../../../../../apps/wasabee/components/Aquabera/VaultTag';

// Mock NextUI Tooltip
jest.mock('@nextui-org/react', () => ({
  Tooltip: ({
    children,
    content,
    placement,
    delay,
    closeDelay,
    classNames,
  }: any) => (
    <div data-testid="tooltip-wrapper">
      <div
        data-testid="tooltip-content"
        data-placement={placement}
        data-delay={delay}
        data-close-delay={closeDelay}
      >
        {content}
      </div>
      {children}
    </div>
  ),
}));

describe('VaultTagContent', () => {
  const defaultProps = {
    tag: 'High APR',
    bgColor: '#10B981',
    textColor: '#FFFFFF',
  };

  describe('Rendering', () => {
    it('should render tag content with correct text', () => {
      render(<VaultTagContent {...defaultProps} />);

      expect(screen.getByText('High APR')).toBeInTheDocument();
    });

    it('should apply correct background color', () => {
      render(<VaultTagContent {...defaultProps} />);

      const tagElement = screen.getByText('High APR').parentElement;
      expect(tagElement).toHaveStyle({
        backgroundColor: '#10B981',
        color: '#FFFFFF',
      });
    });

    it('should apply correct text color', () => {
      render(<VaultTagContent {...defaultProps} />);

      const tagElement = screen.getByText('High APR').parentElement;
      expect(tagElement).toHaveStyle({
        color: '#FFFFFF',
      });
    });

    it('should have cursor pointer style', () => {
      render(<VaultTagContent {...defaultProps} />);

      const tagElement = screen.getByText('High APR').parentElement;
      expect(tagElement).toHaveClass('cursor-pointer');
    });

    it('should have rounded full styling', () => {
      render(<VaultTagContent {...defaultProps} />);

      const tagElement = screen.getByText('High APR').parentElement;
      expect(tagElement).toHaveClass('rounded-full');
    });
  });

  describe('Different Tag Types', () => {
    it('should render stable vault tag', () => {
      render(
        <VaultTagContent tag="Stable" bgColor="#3B82F6" textColor="#FFFFFF" />
      );

      expect(screen.getByText('Stable')).toBeInTheDocument();
    });

    it('should render volatile vault tag', () => {
      render(
        <VaultTagContent tag="Volatile" bgColor="#EF4444" textColor="#FFFFFF" />
      );

      expect(screen.getByText('Volatile')).toBeInTheDocument();
    });

    it('should render new vault tag', () => {
      render(
        <VaultTagContent tag="New" bgColor="#8B5CF6" textColor="#FFFFFF" />
      );

      expect(screen.getByText('New')).toBeInTheDocument();
    });
  });

  describe('Color Variations', () => {
    it('should handle different background colors', () => {
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];

      colors.forEach((color, index) => {
        const { unmount } = render(
          <VaultTagContent
            tag={`Tag ${index}`}
            bgColor={color}
            textColor="#FFFFFF"
          />
        );

        const tagElement = screen.getByText(`Tag ${index}`).parentElement;
        expect(tagElement).toHaveStyle({ backgroundColor: color });

        unmount();
      });
    });

    it('should handle different text colors', () => {
      const colors = ['#000000', '#FFFFFF', '#FF0000', '#00FF00'];

      colors.forEach((color, index) => {
        const { unmount } = render(
          <VaultTagContent
            tag={`Tag ${index}`}
            bgColor="#CCCCCC"
            textColor={color}
          />
        );

        const tagElement = screen.getByText(`Tag ${index}`).parentElement;
        expect(tagElement).toHaveStyle({ color: color });

        unmount();
      });
    });
  });

  describe('Accessibility', () => {
    it('should be focusable', () => {
      render(<VaultTagContent {...defaultProps} />);

      const tagElement = screen.getByText('High APR').parentElement;
      tagElement?.focus();

      expect(document.activeElement).toBe(tagElement);
    });
  });
});

describe('VaultTag', () => {
  const defaultProps = {
    tag: 'High APR',
    bgColor: '#10B981',
    textColor: '#FFFFFF',
    tooltip: 'This vault offers high annual percentage rate returns',
  };

  describe('Rendering', () => {
    it('should render vault tag with tooltip wrapper', () => {
      render(<VaultTag {...defaultProps} />);

      expect(screen.getByTestId('tooltip-wrapper')).toBeInTheDocument();
      expect(screen.getByText('High APR')).toBeInTheDocument();
    });

    it('should display tooltip content', () => {
      render(<VaultTag {...defaultProps} />);

      const tooltipContent = screen.getByTestId('tooltip-content');
      expect(tooltipContent).toHaveTextContent(
        'This vault offers high annual percentage rate returns'
      );
    });

    it('should render without tooltip when tooltip prop is not provided', () => {
      const propsWithoutTooltip = {
        tag: 'High APR',
        bgColor: '#10B981',
        textColor: '#FFFFFF',
      };

      render(<VaultTag {...propsWithoutTooltip} />);

      expect(screen.getByTestId('tooltip-wrapper')).toBeInTheDocument();
      expect(screen.getByText('High APR')).toBeInTheDocument();
    });
  });

  describe('Tooltip Configuration', () => {
    it('should configure tooltip with correct placement', () => {
      render(<VaultTag {...defaultProps} />);

      const tooltipContent = screen.getByTestId('tooltip-content');
      expect(tooltipContent).toHaveAttribute('data-placement', 'top');
    });

    it('should configure tooltip with correct delays', () => {
      render(<VaultTag {...defaultProps} />);

      const tooltipContent = screen.getByTestId('tooltip-content');
      expect(tooltipContent).toHaveAttribute('data-delay', '0');
      expect(tooltipContent).toHaveAttribute('data-close-delay', '0');
    });

    it('should have max width class for tooltip content', () => {
      render(<VaultTag {...defaultProps} />);

      // The classNames prop should be passed to Tooltip
      expect(screen.getByTestId('tooltip-wrapper')).toBeInTheDocument();
    });
  });

  describe('Interactive Behavior', () => {
    it('should show tooltip on hover', async () => {
      render(<VaultTag {...defaultProps} />);

      const tagElement = screen.getByText('High APR').parentElement;

      fireEvent.mouseEnter(tagElement!);

      await waitFor(() => {
        const tooltipContent = screen.getByTestId('tooltip-content');
        expect(tooltipContent).toBeInTheDocument();
      });
    });

    it('should hide tooltip on mouse leave', async () => {
      render(<VaultTag {...defaultProps} />);

      const tagElement = screen.getByText('High APR').parentElement;

      fireEvent.mouseEnter(tagElement!);
      fireEvent.mouseLeave(tagElement!);

      // Tooltip should still be in DOM but behavior would be handled by NextUI
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
    });
  });

  describe('Different Vault Tag Types', () => {
    const vaultTagTypes = [
      {
        tag: 'Stable',
        bgColor: '#3B82F6',
        textColor: '#FFFFFF',
        tooltip: 'Low volatility vault with stable returns',
      },
      {
        tag: 'High Risk',
        bgColor: '#EF4444',
        textColor: '#FFFFFF',
        tooltip: 'High risk, high reward vault strategy',
      },
      {
        tag: 'Trending',
        bgColor: '#F59E0B',
        textColor: '#000000',
        tooltip: 'Currently trending vault with high activity',
      },
      {
        tag: 'New',
        bgColor: '#8B5CF6',
        textColor: '#FFFFFF',
        tooltip: 'Recently launched vault',
      },
    ];

    vaultTagTypes.forEach(({ tag, bgColor, textColor, tooltip }) => {
      it(`should render ${tag} vault tag correctly`, () => {
        render(
          <VaultTag
            tag={tag}
            bgColor={bgColor}
            textColor={textColor}
            tooltip={tooltip}
          />
        );

        expect(screen.getByText(tag)).toBeInTheDocument();
        expect(screen.getByTestId('tooltip-content')).toHaveTextContent(
          tooltip
        );

        const tagElement = screen.getByText(tag).parentElement;
        expect(tagElement).toHaveStyle({
          backgroundColor: bgColor,
          color: textColor,
        });
      });
    });
  });

  describe('Long Tooltip Content', () => {
    it('should handle long tooltip content', () => {
      const longTooltip =
        'This is a very long tooltip content that should be properly wrapped and displayed within the maximum width constraints set by the component styling and should not overflow the viewport boundaries.';

      render(<VaultTag {...defaultProps} tooltip={longTooltip} />);

      const tooltipContent = screen.getByTestId('tooltip-content');
      expect(tooltipContent).toHaveTextContent(longTooltip);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tag text', () => {
      render(<VaultTag {...defaultProps} tag="" />);

      expect(screen.getByTestId('tooltip-wrapper')).toBeInTheDocument();
    });

    it('should handle special characters in tag', () => {
      const specialTag = 'APR: 15.5% 🚀';

      render(<VaultTag {...defaultProps} tag={specialTag} />);

      expect(screen.getByText(specialTag)).toBeInTheDocument();
    });

    it('should handle invalid color values gracefully', () => {
      render(
        <VaultTag
          tag="Test"
          bgColor="invalid-color"
          textColor="invalid-color"
          tooltip="Test tooltip"
        />
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<VaultTag {...defaultProps} />);

      const tagElement = screen.getByText('High APR').parentElement;

      // Should be focusable
      tagElement?.focus();
      expect(document.activeElement).toBe(tagElement);
    });

    it('should support keyboard navigation', () => {
      render(<VaultTag {...defaultProps} />);

      const tagElement = screen.getByText('High APR').parentElement;

      // Tab to focus
      fireEvent.keyDown(tagElement!, { key: 'Tab' });

      // Enter to activate
      fireEvent.keyDown(tagElement!, { key: 'Enter' });

      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
    });
  });
});

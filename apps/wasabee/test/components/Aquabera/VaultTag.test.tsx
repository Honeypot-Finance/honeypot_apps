import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VaultTag, VaultTagContent } from '@/components/Aquabera/VaultTag';

// Mock NextUI Tooltip
jest.mock('@nextui-org/react', () => ({
  Tooltip: ({ children, content, placement }: { children: React.ReactNode; content?: string; placement?: string }) => (
    <div data-testid="tooltip-wrapper" data-content={content} data-placement={placement}>
      {children}
    </div>
  ),
}));

// Mock MobX observer
jest.mock('mobx-react-lite', () => ({
  observer: <T extends React.ComponentType<any>>(component: T) => component,
}));

describe('VaultTagContent', () => {
  describe('Positive Tests', () => {
    test('should render with correct tag text', () => {
      render(
        <VaultTagContent
          tag="High Yield"
          bgColor="#00ff00"
          textColor="#000000"
        />
      );
      
      expect(screen.getByText('High Yield')).toBeInTheDocument();
    });

    test('should apply correct styles', () => {
      render(
        <VaultTagContent
          tag="Low Risk"
          bgColor="#ff0000"
          textColor="#ffffff"
        />
      );
      
      const tagElement = screen.getByText('Low Risk').closest('div');
      expect(tagElement).toHaveStyle({
        backgroundColor: 'rgb(255, 0, 0)',
        color: 'rgb(255, 255, 255)',
      });
    });

    test('should have cursor pointer styling', () => {
      render(
        <VaultTagContent
          tag="Stable"
          bgColor="#0000ff"
          textColor="#ffffff"
        />
      );
      
      const tagElement = screen.getByText('Stable').closest('div');
      expect(tagElement).toHaveClass('cursor-pointer');
    });
  });

  describe('Negative Tests', () => {
    test('should handle empty tag text', () => {
      const { container } = render(
        <VaultTagContent
          tag=""
          bgColor="#00ff00"
          textColor="#000000"
        />
      );
      
      const tagElement = container.querySelector('.cursor-pointer');
      expect(tagElement).toBeInTheDocument();
      const spanElement = tagElement?.querySelector('span');
      expect(spanElement?.textContent).toBe('');
    });

    test('should handle invalid color values gracefully', () => {
      render(
        <VaultTagContent
          tag="Test"
          bgColor="invalid-color"
          textColor="another-invalid-color"
        />
      );
      
      const tagElement = screen.getByText('Test').closest('div');
      expect(tagElement).toBeInTheDocument();
    });

    test('should handle undefined tooltip', () => {
      render(
        <VaultTagContent
          tag="Test"
          bgColor="#00ff00"
          textColor="#000000"
          tooltip={undefined}
        />
      );
      
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('Edge Case Tests', () => {
    test('should handle very long tag text', () => {
      const longTag = 'This is a very long tag name that might overflow the container';
      
      render(
        <VaultTagContent
          tag={longTag}
          bgColor="#00ff00"
          textColor="#000000"
        />
      );
      
      expect(screen.getByText(longTag)).toBeInTheDocument();
    });

    test('should handle special characters in tag', () => {
      const specialTag = '🚀 High APY 💰 (100%+)';
      
      render(
        <VaultTagContent
          tag={specialTag}
          bgColor="#00ff00"
          textColor="#000000"
        />
      );
      
      expect(screen.getByText(specialTag)).toBeInTheDocument();
    });

    test('should handle transparent colors', () => {
      render(
        <VaultTagContent
          tag="Transparent"
          bgColor="transparent"
          textColor="rgba(0,0,0,0.5)"
        />
      );
      
      const tagElement = screen.getByText('Transparent').closest('div');
      expect(tagElement).toHaveStyle({
        backgroundColor: 'transparent',
        color: 'rgba(0, 0, 0, 0.5)',
      });
    });
  });
});

describe('VaultTag', () => {
  describe('Positive Tests', () => {
    test('should render with tooltip wrapper', () => {
      render(
        <VaultTag
          tag="Premium"
          bgColor="#gold"
          textColor="#black"
          tooltip="This is a premium vault with high returns"
        />
      );
      
      expect(screen.getByTestId('tooltip-wrapper')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    test('should pass tooltip content correctly', () => {
      const tooltipText = "High risk, high reward vault";
      
      render(
        <VaultTag
          tag="Risky"
          bgColor="#red"
          textColor="#white"
          tooltip={tooltipText}
        />
      );
      
      const tooltipWrapper = screen.getByTestId('tooltip-wrapper');
      expect(tooltipWrapper).toHaveAttribute('data-content', tooltipText);
    });

    test('should render VaultTagContent inside tooltip', () => {
      render(
        <VaultTag
          tag="Stable"
          bgColor="#blue"
          textColor="#white"
          tooltip="Low risk vault"
        />
      );
      
      const tooltipWrapper = screen.getByTestId('tooltip-wrapper');
      const cursorPointerDivs = tooltipWrapper.querySelectorAll('.cursor-pointer');
      expect(cursorPointerDivs).toHaveLength(2); // outer wrapper and inner content
      expect(screen.getByText('Stable')).toBeInTheDocument();
    });
  });

  describe('Negative Tests', () => {
    test('should handle missing tooltip gracefully', () => {
      render(
        <VaultTag
          tag="No Tooltip"
          bgColor="#gray"
          textColor="#black"
        />
      );
      
      const tooltipWrapper = screen.getByTestId('tooltip-wrapper');
      expect(tooltipWrapper).toBeInTheDocument();
      expect(screen.getByText('No Tooltip')).toBeInTheDocument();
    });

    test('should handle empty tooltip string', () => {
      render(
        <VaultTag
          tag="Empty Tooltip"
          bgColor="#gray"
          textColor="#black"
          tooltip=""
        />
      );
      
      const tooltipWrapper = screen.getByTestId('tooltip-wrapper');
      expect(tooltipWrapper).toHaveAttribute('data-content', '');
    });

    test('should handle all empty props', () => {
      render(
        <VaultTag
          tag=""
          bgColor=""
          textColor=""
          tooltip=""
        />
      );
      
      expect(screen.getByTestId('tooltip-wrapper')).toBeInTheDocument();
      const tooltipWrapper = screen.getByTestId('tooltip-wrapper');
      const cursorPointerDivs = tooltipWrapper.querySelectorAll('.cursor-pointer');
      expect(cursorPointerDivs).toHaveLength(2);
    });
  });

  describe('Edge Case Tests', () => {
    test('should handle very long tooltip text', () => {
      const longTooltip = 'This is a very long tooltip that contains a lot of information about the vault including its strategy, risks, rewards, and other important details that users should know before investing.';
      
      render(
        <VaultTag
          tag="Complex"
          bgColor="#purple"
          textColor="#white"
          tooltip={longTooltip}
        />
      );
      
      const tooltipWrapper = screen.getByTestId('tooltip-wrapper');
      expect(tooltipWrapper).toHaveAttribute('data-content', longTooltip);
    });

    test('should handle HTML entities in tooltip', () => {
      const htmlTooltip = 'APY: >100% &amp; Risk: &lt;5%';
      
      render(
        <VaultTag
          tag="HTML"
          bgColor="#orange"
          textColor="#black"
          tooltip={htmlTooltip}
        />
      );
      
      const tooltipWrapper = screen.getByTestId('tooltip-wrapper');
      expect(tooltipWrapper).toHaveAttribute('data-content', htmlTooltip);
    });

    test('should handle keyboard interaction', () => {
      render(
        <VaultTag
          tag="Interactive"
          bgColor="#green"
          textColor="#white"
          tooltip="Press Enter to interact"
        />
      );
      
      const tooltipWrapper = screen.getByTestId('tooltip-wrapper');
      const outerDiv = tooltipWrapper.querySelector('.cursor-pointer') as HTMLElement;
      
      // Should handle keyboard events without errors
      expect(() => {
        fireEvent.keyDown(outerDiv, { key: 'Enter' });
        fireEvent.keyDown(outerDiv, { key: ' ' });
      }).not.toThrow();
      
      // Should be in the document
      expect(outerDiv).toBeInTheDocument();
    });

    test('should handle click events', () => {
      render(
        <VaultTag
          tag="Clickable"
          bgColor="#cyan"
          textColor="#black"
          tooltip="Click me!"
        />
      );
      
      const tooltipWrapper = screen.getByTestId('tooltip-wrapper');
      const outerDiv = tooltipWrapper.querySelector('.cursor-pointer') as HTMLElement;
      
      // Should handle click without errors
      expect(() => fireEvent.click(outerDiv)).not.toThrow();
    });

    test('should maintain proper CSS classes and structure', () => {
      render(
        <VaultTag
          tag="Styled"
          bgColor="#magenta"
          textColor="#yellow"
          tooltip="Styled vault"
        />
      );
      
      // Check the outer container has the correct classes
      const outerContainer = screen.getByTestId('tooltip-wrapper').parentElement;
      expect(outerContainer).toHaveClass('flex', 'items-center', 'gap-2', 'relative', 'mb-2');
      
      // Check the tooltip wrapper contains the cursor-pointer div
      const tooltipChild = screen.getByTestId('tooltip-wrapper').firstChild as HTMLElement;
      expect(tooltipChild).toHaveClass('cursor-pointer');
      
      // Check the inner VaultTagContent has the correct classes
      const innerTag = tooltipChild.querySelector('.cursor-pointer');
      expect(innerTag).toHaveClass('flex', 'items-center', 'gap-2', 'rounded-full', 'px-2', 'cursor-pointer');
    });
  });
});
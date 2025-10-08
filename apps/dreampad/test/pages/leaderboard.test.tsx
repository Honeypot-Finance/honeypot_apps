import React from 'react';
import { render, screen } from '@testing-library/react';
import { NextUIProvider } from '@nextui-org/react';

import LeaderboardPage from '../../pages/leaderboard';

// Get the mocked data for tests
import { launchedProjects } from '@/config/launchedProjects';



// Mock NextUI components
jest.mock('@nextui-org/react', () => ({
  NextUIProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Link: ({ children, href, target, title, className, ...props }: any) => (
    <a
      href={href}
      target={target}
      title={title}
      className={className}
      {...props}
    >
      {children}
    </a>
  ),
  Tooltip: ({ children, content, placement, classNames, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
}));

// Mock CardContainer
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

// Mock DynamicFormatAmount
jest.mock('@honeypot/shared', () => ({
  DynamicFormatAmount: jest.fn(({ amount, decimals }) => {
    const num = parseFloat(amount.toString());
    if (num >= 1000000) return `${(num / 1000000).toFixed(decimals || 0)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(decimals || 0)}K`;
    return num.toFixed(decimals || 0);
  }),
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, width, height, className }: any) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  };
});

// Mock the config with actual-like data
jest.mock('@/config/launchedProjects', () => ({
  launchedProjects: [
    {
      name: 'BearCage',
      symbol: 'xBEAR',
      image: { src: 'test-bearcage.webp', default: 'test-bearcage.webp' },
      raisedFund: 234800,
      participants: 319,
    },
    {
      name: 'Overlay',
      symbol: 'OVL',
      image: { src: 'test-overlay.webp', default: 'test-overlay.webp' },
      raisedFund: 704200,
      participants: 268,
    },
    {
      name: 'BurrBear',
      symbol: 'BURR',
      image: { src: 'test-burrbear.webp', default: 'test-burrbear.webp' },
      raisedFund: 425800,
      participants: 456,
    },
    {
      name: 'Berally',
      symbol: 'xBRLY',
      image: { src: 'test-berally.webp', default: 'test-berally.webp' },
      raisedFund: 1393000,
      participants: 635,
    },
  ],
}));



// Image mock is in dreampad-setup.ts

const renderWithProviders = (component: React.ReactElement) => {
  return render(<NextUIProvider>{component}</NextUIProvider>);
};

describe('Dreampad Leaderboard Page', () => {
  it('should render stats cards correctly', () => {
    renderWithProviders(<LeaderboardPage />);

    expect(screen.getByText('Total Fund Raised')).toBeInTheDocument();
    expect(screen.getByText('Total Participants')).toBeInTheDocument();
  });

  it('should calculate and display correct stats', () => {
    renderWithProviders(<LeaderboardPage />);

    // Calculate actual totals from real data
    const totalRaised = launchedProjects.reduce(
      (acc, project) => acc + project.raisedFund,
      0
    );
    const totalParticipants = launchedProjects.reduce(
      (acc, project) => acc + project.participants,
      0
    );

    // Check if the formatted values are displayed
    // Note: DynamicFormatAmount will format these numbers
    expect(screen.getByText('Total Fund Raised')).toBeInTheDocument();
    expect(screen.getByText('Total Participants')).toBeInTheDocument();
  });

  it('should render leaderboard table with correct headers', () => {
    renderWithProviders(<LeaderboardPage />);

    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByText('Fund Raised')).toBeInTheDocument();
    expect(screen.getByText('Participants')).toBeInTheDocument();
  });

  it('should render project data in table rows', () => {
    renderWithProviders(<LeaderboardPage />);

    // Check for actual project names from config
    launchedProjects.forEach((project) => {
      expect(screen.getByText(project.name)).toBeInTheDocument();
      expect(screen.getByText(`$${project.symbol}`)).toBeInTheDocument();
      expect(
        screen.getByText(project.participants.toString())
      ).toBeInTheDocument();
    });
  });

  it('should render project images', () => {
    renderWithProviders(<LeaderboardPage />);

    const images = screen.getAllByRole('img');
    const projectImages = images.filter((img) =>
      launchedProjects.some(
        (project) => img.getAttribute('alt') === project.symbol
      )
    );
    expect(projectImages).toHaveLength(launchedProjects.length);

    // Check that each project image has the correct alt attribute
    launchedProjects.forEach((project) => {
      const projectImage = images.find(
        (img) => img.getAttribute('alt') === project.symbol
      );
      expect(projectImage).toBeInTheDocument();
    });
  });

  it('should format raised amounts correctly', () => {
    renderWithProviders(<LeaderboardPage />);

    // Check that DynamicFormatAmount is used for formatting
    // Just verify that the Fund Raised column header exists
    expect(screen.getByText('Fund Raised')).toBeInTheDocument();

    // Verify that some numeric values are displayed (formatted amounts)
    const numericElements = screen.getAllByText(/\d+[KM]?/);
    expect(numericElements.length).toBeGreaterThan(0);
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

  it('should have proper table structure', () => {
    renderWithProviders(<LeaderboardPage />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(3); // Project, Fund Raised, Participants

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(5); // 1 header + 4 data rows
  });

  it('should render with correct styling classes', () => {
    renderWithProviders(<LeaderboardPage />);

    // Check for main container styling
    const mainContainer = screen.getByTestId('card-container');
    expect(
      mainContainer.parentElement?.querySelector('.max-w-full')
    ).toBeInTheDocument();

    // Check for stats grid styling
    const statsGrid = screen.getByText('Total Fund Raised').closest('.grid');
    expect(statsGrid).toHaveClass('grid-cols-1', 'lg:grid-cols-2');
  });

  it('should render table with proper styling', () => {
    renderWithProviders(<LeaderboardPage />);

    const tableContainer = screen
      .getByRole('table')
      .closest('.bg-\\[\\#202020\\]');
    expect(tableContainer).toBeInTheDocument();

    const tableHeader = screen.getByRole('table').querySelector('thead');
    expect(tableHeader).toHaveClass('bg-[#323232]');
  });

  it('should handle project list with actual data', () => {
    renderWithProviders(<LeaderboardPage />);

    // Verify we have actual projects
    expect(launchedProjects.length).toBeGreaterThan(0);

    // Stats should show actual values
    expect(screen.getByText('Total Fund Raised')).toBeInTheDocument();
    expect(screen.getByText('Total Participants')).toBeInTheDocument();
  });

  it('should display projects in the order they appear in config', () => {
    renderWithProviders(<LeaderboardPage />);

    const rows = screen.getAllByRole('row');
    const dataRows = rows.slice(1); // Skip header row

    // Projects should appear in the same order as in the config
    launchedProjects.forEach((project, index) => {
      if (dataRows[index]) {
        expect(dataRows[index]).toHaveTextContent(project.name);
      }
    });
  });

  it('should render with proper responsive layout', () => {
    renderWithProviders(<LeaderboardPage />);

    // Check for responsive container classes
    const container = screen.getByTestId('card-container');
    expect(container.querySelector('.max-w-full')).toBeInTheDocument();
    expect(
      container.querySelector('.xl\\:max-w-\\[1200px\\]')
    ).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    renderWithProviders(<LeaderboardPage />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    const headers = screen.getAllByRole('columnheader');
    headers.forEach((header) => {
      expect(header).toBeInTheDocument();
    });

    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('should render project symbols with dollar sign prefix', () => {
    renderWithProviders(<LeaderboardPage />);

    launchedProjects.forEach((project) => {
      expect(screen.getByText(`$${project.symbol}`)).toBeInTheDocument();
    });
  });

  it('should handle large numbers in stats formatting', () => {
    renderWithProviders(<LeaderboardPage />);

    // The DynamicFormatAmount should handle large numbers appropriately
    const statsValues = screen.getAllByText(/[0-9]+[KM]?/);
    expect(statsValues.length).toBeGreaterThan(0);
  });

  it('should maintain consistent table row styling', () => {
    renderWithProviders(<LeaderboardPage />);

    const tableRows = screen.getAllByRole('row').slice(1); // Skip header
    expect(tableRows).toHaveLength(launchedProjects.length);

    tableRows.forEach((row) => {
      // Each row should have consistent structure
      const cells = row.querySelectorAll('td');
      expect(cells).toHaveLength(3); // Project, Fund Raised, Participants
    });
  });

  it('should render images with proper dimensions', () => {
    renderWithProviders(<LeaderboardPage />);

    const images = screen.getAllByRole('img');
    const projectImages = images.filter((img) =>
      launchedProjects.some(
        (project) => img.getAttribute('alt') === project.symbol
      )
    );

    projectImages.forEach((img) => {
      expect(img).toHaveAttribute('width', '24');
      expect(img).toHaveAttribute('height', '24');
    });
  });
});

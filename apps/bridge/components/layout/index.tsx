import { ReactNode } from 'react';
import { Header } from './header';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-[#0a0a0a] ${className || ''}`}>
      <Header />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a2318] py-6">
        <div className="container mx-auto px-4 max-w-7xl text-center text-sm text-gray-500">
          <p>Powered by Circle CCTP - Cross-Chain Transfer Protocol</p>
        </div>
      </footer>
    </div>
  );
}

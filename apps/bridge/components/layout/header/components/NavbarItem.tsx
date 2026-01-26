import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/tailwindcss';
import { isExternalUrl } from '@/lib/utils/url';
import { Menu } from '@/config/allAppPath';

interface NavbarItemProps {
  menu: Menu;
  currentPath: string;
  isSub?: boolean;
  onItemClick: () => void;
}

/**
 * Mobile navigation menu item component
 * Handles both internal links, external links, and nested menus
 */
export const NavbarItem: React.FC<NavbarItemProps> = ({
  menu,
  currentPath,
  isSub = false,
  onItemClick,
}) => {
  // Handle nested menu (array of paths)
  if (Array.isArray(menu.path)) {
    const isActive = menu.path.some((p) => currentPath.includes(p.path));

    return (
      <div className="w-full">
        <div
          role="button"
          tabIndex={0}
          className={cn(
            'p-3 text-gray-300 text-base font-medium w-full rounded-lg transition-colors cursor-pointer',
            isActive
              ? 'text-white bg-[#6B4423]'
              : 'hover:bg-[#6B4423] hover:text-white',
            isSub ? 'pl-8' : ''
          )}
          onClick={onItemClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onItemClick();
            }
          }}
        >
          {menu.title}
        </div>
        {menu.path.map((subMenu) => (
          <NavbarItem
            key={subMenu.title}
            menu={subMenu as Menu}
            currentPath={currentPath}
            isSub
            onItemClick={onItemClick}
          />
        ))}
      </div>
    );
  }

  const path = menu.path as string;
  const isActive = currentPath === path;

  // Handle external links
  if (isExternalUrl(path)) {
    return (
      <a
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'block p-3 text-gray-300 text-base font-medium w-full rounded-lg transition-colors',
          'hover:bg-[#6B4423] hover:text-white',
          isSub ? 'pl-8' : ''
        )}
        onClick={onItemClick}
      >
        <span className="flex items-center">
          {menu.title}
          {menu.afterContent}
        </span>
      </a>
    );
  }

  // Handle internal links
  return (
    <Link
      href={path}
      className={cn(
        'block p-3 text-gray-300 text-base font-medium w-full rounded-lg transition-colors',
        isActive
          ? 'text-white bg-[#6B4423]'
          : 'hover:bg-[#6B4423] hover:text-white',
        isSub ? 'pl-8' : ''
      )}
      onClick={onItemClick}
    >
      <span className="flex items-center">
        {menu.title}
        {menu.afterContent}
      </span>
    </Link>
  );
};

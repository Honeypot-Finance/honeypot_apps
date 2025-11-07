import clsx from 'clsx';
import Link from 'next/link';
import Image from 'next/image';

import { cn } from '@nextui-org/theme';
import { useRouter } from 'next/router';
import { CustomNavbar } from './components/Navbar';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import React, { HtmlHTMLAttributes, useState, useEffect } from 'react';
// import { WalletConnect } from '@/components/walletconnect/v3';
import { Menu, appPathsList as menuList } from '@/config/allAppPath';
import { DOMAIN_MAP } from 'honeypot-sdk';
import { WalletConnect } from '@/components/walletconnect/v3';
import { useNavbar } from '@/lib/hooks/useNavbar';
import { Key } from 'react';

// Check if URL is external (different domain) or internal
const isExternalUrl = (url: string): boolean => {
  if (!url.startsWith('http')) return false;

  try {
    const urlObj = new URL(url);
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
    return urlObj.hostname !== currentHost;
  } catch {
    return false;
  }
};

// Handle navigation for internal or external links
const handleNavigation = (url: string, router: ReturnType<typeof useRouter>) => {
  if (isExternalUrl(url)) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    router.push(url);
  }
};

export const Header = (props: HtmlHTMLAttributes<any>) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isXl, setIsXl] = useState(false);
  const { menuList: primaryMenuList, loading } = useNavbar();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1280px)');
    setIsXl(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsXl(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const listToNavbarItem = (list: Menu[], isSub?: boolean): React.ReactNode => {
    return list.map((m) =>
      m.path instanceof Array ? (
        <div key={m.title} className="w-full">
          <div
            className={cn(
              'p-3 text-gray-300 text-base font-medium w-full rounded-lg transition-colors',
              m.path.some((p) => router.pathname.includes(p.path))
                ? 'text-white bg-[#6B4423]'
                : 'hover:bg-[#6B4423] hover:text-white',
              isSub ? 'pl-8' : ''
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            {m.title}
          </div>
          {listToNavbarItem(m.path as Menu[], true)}
        </div>
      ) : isExternalUrl(m.path as string) ? (
        <a
          key={m.title}
          href={m.path as string}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'block p-3 text-gray-300 text-base font-medium w-full rounded-lg transition-colors',
            'hover:bg-[#6B4423] hover:text-white',
            isSub ? 'pl-8' : ''
          )}
          onClick={() => setIsMenuOpen(false)}
        >
          <span className="flex items-center">
            {m.title}
            {m.afterContent}
          </span>
        </a>
      ) : (
        <Link
          key={m.title}
          href={m.path as string}
          className={cn(
            'block p-3 text-gray-300 text-base font-medium w-full rounded-lg transition-colors',
            router.pathname === m.path
              ? 'text-white bg-[#6B4423]'
              : 'hover:bg-[#6B4423] hover:text-white',
            isSub ? 'pl-8' : ''
          )}
          onClick={() => setIsMenuOpen(false)}
        >
          <span className="flex items-center">
            {m.title}
            {m.afterContent}
          </span>
        </Link>
      )
    );
  };

  interface SubMenu {
    path: string;
    title: string;
    routePath: string;
    beforeContent?: React.ReactNode;
    afterContent?: React.ReactNode;
  }

  const renderPrimaryNav = () => {
    if (loading || !primaryMenuList) return null;

    return (
      <nav className="flex items-center bg-[#1B1308] p-1 rounded-2xl">
        <div className="flex items-center gap-2">
          {primaryMenuList.map((menu) =>
            Array.isArray(menu.path) ? (
              <Dropdown
                key={menu.title}
                placement="bottom-start"
                classNames={{
                  content: 'bg-transparent p-0',
                }}
              >
                <DropdownTrigger>
                  <Button
                    style={{
                      backgroundColor: (menu.path as SubMenu[]).some(
                        (item) => item.routePath === router.pathname
                      )
                        ? '#F7931A1A'
                        : 'transparent',
                    }}
                    className={`h-10 px-4 py-2 font-medium text-base text-white rounded-lg transition-all hover:opacity-100 ${
                      (menu.path as SubMenu[]).some(
                        (item) => item.routePath === router.pathname
                      )
                        ? 'opacity-100'
                        : 'opacity-50'
                    }`}
                  >
                    <span
                      className="flex items-center"
                      style={{ color: menu.textColor || 'inherit' }}
                    >
                      {menu.beforeContent}
                      {menu.title}
                      {menu.afterContent}
                    </span>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label={menu.title}
                  className="bg-[#1A0F06] rounded-lg p-1 border border-[#2a2318] mt-2"
                  onAction={(key: Key) => {
                    const subMenu = (menu.path as SubMenu[]).find(
                      (item: SubMenu) => item.routePath === key
                    );
                    if (subMenu) {
                      handleNavigation(subMenu.path, router);
                    }
                  }}
                >
                  {(menu.path as SubMenu[]).map((subMenu: SubMenu) => (
                    <DropdownItem
                      key={subMenu.routePath}
                      style={{
                        backgroundColor: router.pathname === subMenu.routePath
                          ? '#6B4423'
                          : 'transparent',
                      }}
                      className={`font-medium text-white data-[hover=true]:bg-[#6B4423] data-[hover=true]:opacity-100 p-2 rounded-md transition-all ${
                        router.pathname === subMenu.routePath ? 'opacity-100' : 'opacity-50'
                      }`}
                      onPress={() => {
                        handleNavigation(subMenu.path, router);
                      }}
                    >
                      <span className="flex items-center">
                        {subMenu.beforeContent}
                        {subMenu.title}
                        {subMenu.afterContent}
                      </span>
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            ) : (
              <Button
                key={menu.title}
                style={{
                  backgroundColor: menu.routePath === router.pathname
                    ? '#F7931A1A'
                    : 'transparent',
                }}
                className={`h-10 px-4 py-2 font-medium text-base text-white rounded-lg transition-all hover:opacity-100 ${
                  menu.routePath === router.pathname ? 'opacity-100' : 'opacity-50'
                }`}
                onPress={() => {
                  if (typeof menu.path === 'string') {
                    handleNavigation(menu.path, router);
                  }
                }}
              >
                <span
                  className="flex items-center"
                  style={{ color: menu.textColor || 'inherit' }}
                >
                  {menu.beforeContent}
                  {menu.title}
                  {menu.afterContent}
                </span>
              </Button>
            )
          )}
        </div>
      </nav>
    );
  };

  return (
    <div className={clsx('relative', props.className)}>
      <Navbar
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        classNames={{
          base: 'bg-transaparent backdrop-blur-md border-b border-transparent mb-0 backdrop-blur-none',
          wrapper:
            'max-w-full px-2 sm:px-4 md:px-8 xl:px-0 xl:max-w-[1200px] 2xl:max-w-[1500px] !h-auto py-4',
        }}
      >
        <NavbarContent className="md:hidden !basis-auto !grow-0 !flex-grow-0 w-auto" justify="start">
          <NavbarMenuToggle
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="text-white h-8 w-8"
          />
        </NavbarContent>

        <NavbarContent className="hidden md:flex gap-2" justify="start">
          <NavbarBrand className="flex gap-4 items-center flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <Image
                width={40}
                height={40}
                alt="Honeypot Finance"
                src="/honeypot-icon.svg"
                className="rounded-full w-8 h-8 md:w-10 md:h-10"
              />
              <span className="text-lg md:text-[28.93px] font-bebas-neue font-[300] text-white">
                HONEYPOT DEX
              </span>
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent
          className="hidden md:flex font-bold flex-1"
          justify="center"
        >
          {renderPrimaryNav()}
        </NavbarContent>

        <NavbarContent className="flex-shrink-0" justify="end">
          <WalletConnect />
        </NavbarContent>

        <NavbarMenu
          className={cn(
            'lg:hidden pt-20 bg-[#1A0F06]/95 backdrop-blur-md border-t border-[#2a2318]',
            'will-change-transform transform-gpu transition-all duration-200 ease-out',
            isMenuOpen
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-2'
          )}
        >
          <div
            className={cn(
              'flex flex-col gap-2',
              'will-change-transform transform-gpu transition-all duration-150 ease-out',
              isMenuOpen
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-2'
            )}
          >
            {/* App-specific Navigation */}
            <div className="mb-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Vault
              </div>
              {listToNavbarItem(menuList)}
            </div>

            {/* Separator */}
            <div className="border-t border-[#2a2318] my-2" />

            {/* Honeypot Ecosystem Navigation */}
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Honeypot Ecosystem
              </div>
              {primaryMenuList && listToNavbarItem(primaryMenuList)}
            </div>
          </div>
        </NavbarMenu>
      </Navbar>

      {/* Secondary Navigation - App-specific Nav */}
      <div className="hidden md:flex justify-center mb-8 mt-0">
        <CustomNavbar menuList={menuList} />
      </div>
    </div>
  );
};

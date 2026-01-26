import clsx from 'clsx';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/tailwindcss';
import { useRouter } from 'next/router';
import { CustomNavbar } from './components/Navbar';
import { NavbarItem } from './components/NavbarItem';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
} from '@nextui-org/react';
import React, { HtmlHTMLAttributes, useState, useCallback } from 'react';
import { WalletConnect } from '@/components/walletconnect';
import { appPathsList } from '@/config/allAppPath';
import { useNavbar } from '@/lib/hooks/useNavbar';

export const Header = (props: HtmlHTMLAttributes<HTMLDivElement>) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { menuList, loading } = useNavbar();

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return (
    <div className={clsx('relative', props.className)}>
      <Navbar
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        classNames={{
          base: 'bg-[#0D0703]/80 backdrop-blur-xl border-b border-[#2a2318]/50',
          wrapper:
            'max-w-full px-4 sm:px-6 md:px-8 xl:px-0 xl:max-w-[1200px] 2xl:max-w-[1400px] !h-auto py-3',
        }}
      >
        <NavbarContent
          className="md:hidden !basis-auto !grow-0 !flex-grow-0 w-auto"
          justify="start"
        >
          <NavbarMenuToggle
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="text-white h-8 w-8"
          />
        </NavbarContent>

        <NavbarContent className="hidden md:flex gap-2" justify="start">
          <NavbarBrand className="flex gap-3 items-center flex-shrink-0">
            <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
              <Image
                width={36}
                height={36}
                alt="Honeypot Bridge"
                src="/honeypot-icon.svg"
                className="rounded-full w-8 h-8 md:w-9 md:h-9 group-hover:scale-105 transition-transform"
                priority
              />
              <span className="text-lg md:text-xl font-bold text-white">
                HONEYPOT BRIDGE
              </span>
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent
          className="hidden md:flex font-bold flex-1"
          justify="center"
        >
          {!loading && menuList && <CustomNavbar menuList={menuList} />}
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
            {/* App-specific Navigation (Bridge) */}
            <div className="mb-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Bridge
              </div>
              {appPathsList.map((menu) => (
                <NavbarItem
                  key={menu.title}
                  menu={menu}
                  currentPath={router.pathname}
                  onItemClick={handleMenuClose}
                />
              ))}
            </div>

            {/* Separator */}
            <div className="border-t border-[#2a2318] my-2" />

            {/* Honeypot Ecosystem Navigation */}
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Honeypot Ecosystem
              </div>
              {menuList?.map((menu) => (
                <NavbarItem
                  key={menu.title}
                  menu={menu}
                  currentPath={router.pathname}
                  onItemClick={handleMenuClose}
                />
              ))}
            </div>
          </div>
        </NavbarMenu>
      </Navbar>
    </div>
  );
};

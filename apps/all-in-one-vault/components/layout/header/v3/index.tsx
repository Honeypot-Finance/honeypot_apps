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
} from '@nextui-org/react';
import React, { HtmlHTMLAttributes, useState, useEffect } from 'react';
// import { WalletConnect } from '@/components/walletconnect/v3';
import { Menu, appPathsList as menuList } from '@/config/allAppPath';
import { DOMAIN_MAP } from 'honeypot-sdk';
import { WalletConnect } from '@/components/walletconnect/v3';

export const Header = (props: HtmlHTMLAttributes<any>) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isXl, setIsXl] = useState(false);

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
              'p-3 text-white text-lg font-medium w-full',
              m.path.some((p) => router.pathname.includes(p.path))
                ? 'bg-[rgba(225,138,32,0.40)] border-2 border-solid border-[rgba(225,138,32,0.60)] rounded-lg'
                : '',
              isSub ? 'pl-8' : ''
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            {m.title}
          </div>
          {listToNavbarItem(m.path as Menu[], true)}
        </div>
      ) : (
        <Link
          key={m.title}
          href={m.path as string}
          className={cn(
            'block p-3 text-white text-lg font-medium w-full',
            router.pathname === m.path
              ? 'bg-[rgba(225,74,32,0.40)] border-2 border-solid border-[rgba(225,74,32,0.6)] rounded-lg'
              : '',
            isSub ? 'pl-8' : ''
          )}
          onClick={() => setIsMenuOpen(false)}
        >
          {m.title}
        </Link>
      )
    );
  };

  return (
    <>
      <div className={clsx('relative mb-5 sm:mb-10', props.className)}>
        <Navbar
          isMenuOpen={isMenuOpen}
          onMenuOpenChange={setIsMenuOpen}
          classNames={{
            base: 'bg-transparent',
            wrapper:
              'max-w-full px-2 sm:px-4 md:px-8 xl:px-0 xl:max-w-[1200px] 2xl:max-w-[1500px] !h-auto',
          }}
        >
          {isXl && (
            <NavbarBrand className="flex gap-4 items-start !flex-grow-0 xl:min-w-[200px]">
              <Link
                href={DOMAIN_MAP.LANDING}
                className="pointer-events-none md:pointer-events-auto cursor-pointer"
              >
                <Image
                  width={200}
                  height={100}
                  alt="Honeypot Finance"
                  src="/images/header/project-name.svg"
                />
              </Link>
            </NavbarBrand>
          )}

          <NavbarContent justify="center" className="hidden md:flex">
            <CustomNavbar menuList={menuList} />
          </NavbarContent>

          <NavbarMenuToggle
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className={cn(
              'text-white will-change-transform transform-gpu transition-all duration-200 ease-out md:hidden h-16 w-16',
              isMenuOpen ? 'fixed top-6 left-0' : '-ml-4'
            )}
          />

          {!isMenuOpen && <WalletConnect />}

          <NavbarMenu
            className={cn(
              'lg:hidden pt-24 bg-black/95 backdrop-blur-md',
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
              {listToNavbarItem(menuList)}
            </div>
          </NavbarMenu>
        </Navbar>
      </div>
    </>
  );
};

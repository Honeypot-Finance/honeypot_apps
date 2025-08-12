import clsx from 'clsx';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/tailwindcss';
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
import { WalletConnect } from '@/components/walletconnect/v3';
import { Menu, appPathsList as menuList } from '@/config/allAppPath';
import { DOMAIN_MAP } from '@/config/allAppPath';

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
              'p-3 text-gray-300 text-base font-medium w-full rounded-lg transition-colors',
              m.path.some((p) => router.pathname.includes(p.path))
                ? 'text-[#F59E0B] bg-[#271A0C]'
                : 'hover:bg-[#271A0C] hover:text-white',
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
            'block p-3 text-gray-300 text-base font-medium w-full rounded-lg transition-colors',
            router.pathname === m.path
              ? 'text-[#F59E0B] bg-[#271A0C]'
              : 'hover:bg-[#271A0C] hover:text-white',
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
    <div className={clsx('relative', props.className)}>
      <Navbar
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        classNames={{
          base: 'bg-[#140D06]/80 backdrop-blur-md border-b border-[#333333] mb-5 sm:mb-10',
          wrapper:
            'max-w-full px-2 sm:px-4 md:px-8 xl:px-0 xl:max-w-[1200px] 2xl:max-w-[1500px] !h-auto py-4 ',
        }}
      >
        <NavbarContent className="flex gap-2 md:gap-8" justify="start">
          <NavbarMenuToggle
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="text-white md:hidden h-8 w-8"
          />
          <NavbarBrand className="hidden md:flex gap-4 items-center flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <Image
                width={40}
                height={40}
                alt="Wasabee"
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
          <CustomNavbar menuList={menuList} />
        </NavbarContent>

        <NavbarContent className="flex-shrink-0" justify="end">
          <WalletConnect />
        </NavbarContent>

        <NavbarMenu
          className={cn(
            'lg:hidden pt-20 bg-[#140D06]/95 backdrop-blur-md border-t border-[#333333]',
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
  );
};

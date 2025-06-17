import React, { HtmlHTMLAttributes, useRef, useState } from 'react';
import { Logo } from '../../svg/logo';
import { WalletConnect, WalletConnectMobile } from '../../walletconnect';
import clsx from 'clsx';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from '@nextui-org/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { cn } from '@nextui-org/theme';
import { Menu, appPathsList as menuList } from '@/config/allAppPath';
import {
  WarppedNextDropdownMenu,
  WarppedNextDropdown,
} from '../../wrappedNextUI/Dropdown/Dropdown';

export const Header = (props: HtmlHTMLAttributes<any>) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const listToNavbarItem = (list: Menu[], isSub?: boolean): React.ReactNode => {
    return list.map((m) =>
      m.path instanceof Array ? (
        <div key={m.title}>
          <NavbarMenuItem
            className={cn(
              'p-[8px]',
              m.path.some((p) => router.pathname.includes(p.path))
                ? '[background:rgba(225,138,32,0.40)] border-2 border-solid border-[rgba(225,138,32,0.60)]'
                : '',
              isSub ? 'pl-[2rem]' : ''
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            {m.title}
          </NavbarMenuItem>
          {listToNavbarItem(m.path as Menu[], true)}
        </div>
      ) : (
        <NavbarMenuItem
          key={m.title}
          className={cn(
            'p-[8px]',
            router.pathname === m.path
              ? '[background:rgba(225,74,32,0.40)] border-2 border-solid border-[rgba(225,74,32,0.6)]'
              : '',
            isSub ? 'ml-[2rem]' : ''
          )}
          isActive={router.pathname === m.path}
          onClick={() => setIsMenuOpen(false)}
        >
          <Link className={cn('w-full inline-block')} href={m.path as string}>
            {m.title}
          </Link>
        </NavbarMenuItem>
      )
    );
  };

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      classNames={{
        wrapper: 'max-w-[1200px] px-4 sm:px-6',
      }}
      className={clsx('h-[63px] bg-transparent', props.className)}
      style={{
        backdropFilter: 'none',
      }}
      isMenuOpen={isMenuOpen}
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-setsize={1}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden  text-[white] scale-75"
        />
        <NavbarBrand className="space-x-1 sm:space-x-2">
          <Link href="/">
            <Logo />
          </Link>
          <p className='text-[#FFCD4D] [font-family:"Bebas_Neue"]'>
            <Link
              href="/"
              className="text-lg sm:text-[28.927px] align-text-top"
            >
              Honeypot Finance
            </Link>
          </p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <ListToElement list={menuList}></ListToElement>
      </NavbarContent>
      <NavbarContent justify="end">
        {/* <NavbarItem className="hidden lg:flex">
          <Link href="#">Login</Link>
        </NavbarItem> */}
        <WalletConnect></WalletConnect>
      </NavbarContent>
      <NavbarMenu>
        {listToNavbarItem(menuList)}
        <NavbarMenuItem className="mt-[24px]">
          <WalletConnectMobile></WalletConnectMobile>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
};

function WrapedDropdownItem({
  dropdownMenu,
}: {
  dropdownMenu: {
    path: {
      path: string;
      title: string;
    }[];
    title: string;
  };
}) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dp = useRef<HTMLDivElement | null>(null);

  function checkMouseInside(event: MouseEvent) {
    if (dp.current) {
      const rect = dp.current.getBoundingClientRect();
      const x = event.clientX;
      const y = event.clientY;
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        setIsMenuOpen(false);
      }
    }
  }
  return (
    <WarppedNextDropdown
      ref={dp}
      isOpen={isMenuOpen}
      onOpenChange={setIsMenuOpen}
      onMouseLeave={() => setIsMenuOpen(false)}
      onMouseEnter={() => setIsMenuOpen(true)}
      onMouseMove={(e) => checkMouseInside(e.nativeEvent)}
      closeOnSelect
    >
      <NavbarItem
        className={cn(
          'flex items-center justify-center  px-5 py-2.5 text-base font-normal leading-[normal] cursor-pointer',
          dropdownMenu.path.some((p) => router.pathname.includes(p.path))
            ? router.pathname === '/launch'
              ? 'font-bold'
              : ' [background:#271A0C] border-[color:var(--button-stroke,rgba(247,147,26,0.20))] border rounded-[100px] border-solid'
            : 'hover:opacity-100 opacity-60'
        )}
        isActive={dropdownMenu.path.some((p) =>
          router.pathname.includes(p.path)
        )}
        onMouseEnter={() => setIsMenuOpen(true)}
        onMouseLeave={() => setIsMenuOpen(false)}
      >
        <DropdownTrigger
          onClick={() => {
            console.log(dropdownMenu.path[0].path);
            router.push(dropdownMenu.path[0].path);
          }}
        >
          <span className={cn('w-full inline-block')}>
            {dropdownMenu.title}
          </span>
        </DropdownTrigger>
      </NavbarItem>
      <WarppedNextDropdownMenu closeOnSelect>
        {dropdownMenu.path.map((p) => (
          <DropdownItem
            closeOnSelect
            key={p.title}
            className={cn(
              'flex items-center justify-center text-base font-normal leading-[normal] border-0',
              router.pathname === p.path
                ? router.pathname === '/launch'
                  ? 'font-bold'
                  : ' [background:#271A0C] border-[color:var(--button-stroke,rgba(247,147,26,0.20))] border rounded-[100px] border-solid'
                : 'hover:opacity-100 opacity-60'
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            <Link className={cn('w-full inline-block')} href={p.path as string}>
              {p.title}
            </Link>
          </DropdownItem>
        ))}
      </WarppedNextDropdownMenu>
    </WarppedNextDropdown>
  );
}
function ListToElement({ list }: { list: Menu[] }) {
  const router = useRouter();

  return list.map((m) => {
    return m.path instanceof Array ? (
      <WrapedDropdownItem
        key={m.title}
        dropdownMenu={
          m as {
            path: {
              path: string;
              title: string;
            }[];
            title: string;
          }
        }
      ></WrapedDropdownItem>
    ) : (
      <NavbarMenuItem
        key={m.title}
        className={cn(
          'flex items-center justify-center  px-5 py-2.5 text-base font-normal leading-[normal]',
          router.pathname === m.path
            ? router.pathname === '/launch'
              ? 'font-bold'
              : ' [background:#271A0C] border-[color:var(--button-stroke,rgba(247,147,26,0.20))] border rounded-[100px] border-solid'
            : 'hover:opacity-100 opacity-60'
        )}
        isActive={router.pathname === m.path}
      >
        <Link className={cn('w-full inline-block')} href={m.path as string}>
          {m.title}
        </Link>
      </NavbarMenuItem>
    );
  });
}

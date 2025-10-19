import React from 'react';
import { useRouter } from 'next/router';
import { cn } from '@/lib/tailwindcss';
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import { DOMAIN_MAP } from '@honeypot/shared';
import { Menu } from '@/config/allAppPath';
import Image from 'next/image';
import { Key } from 'react';
import { FaPlusCircle } from 'react-icons/fa';
import Link from 'next/link';
interface NavbarProps {
  menuList: Menu[];
}

interface SubMenu {
  path: string;
  title: string;
  routePath: string;
  icon?: {
    src: string;
  };
}

export const CustomNavbar: React.FC<NavbarProps> = ({ menuList }) => {
  const router = useRouter();

  return (
    <nav className="flex items-center">
      <div className="flex items-center gap-2">
          {menuList.map((menu) =>
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
                    className={cn(
                      'h-10 px-4 py-2 font-medium bg-transparent text-base text-gray-300 hover:text-white rounded-lg transition-colors',
                      (menu.path as SubMenu[]).some(
                        (item) => item.routePath === router.pathname
                      )
                        ? 'text-white'
                        : ''
                    )}
                  >
                    {menu.title}
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
                      router.push(subMenu.path);
                    }
                  }}
                >
                  {(menu.path as SubMenu[]).map((subMenu: SubMenu) => (
                    <DropdownItem
                      key={subMenu.routePath}
                      className={cn(
                        'font-medium data-[hover=true]:bg-[#6B4423] data-[hover=true]:text-white p-2 text-gray-300 rounded-md',
                        router.pathname === subMenu.routePath
                          ? 'text-white bg-[#6B4423]'
                          : 'text-gray-300'
                      )}
                      startContent={
                        subMenu.icon && (
                          <Image
                            src={subMenu.icon.src}
                            alt={subMenu.title}
                            width={16}
                            height={16}
                            className="w-4 h-4"
                          />
                        )
                      }
                      onPress={() => {
                        router.push(subMenu.path);
                      }}
                    >
                      {subMenu.title}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            ) : (
                <Button
                key={menu.title}
                  className={cn(
                  'h-10 px-4 py-2 font-medium bg-transparent text-base text-gray-300 hover:text-white rounded-lg transition-colors',
                  menu.routePath === router.pathname
                    ? 'text-white'
                    : ''
                  )}
                onPress={() => {
                  if (typeof menu.path === 'string') {
                    router.push(menu.path);
                  }
                }}
                >
                  <span className="flex items-center">
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

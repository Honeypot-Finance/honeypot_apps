import React from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import { Menu } from '@/config/allAppPath';
import Image from 'next/image';
import { Key } from 'react';
import { FaPlusCircle } from 'react-icons/fa';
import { DOMAIN_MAP } from 'honeypot-sdk';
import { cn } from '@/lib/tailwindcss';

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
    <div className="flex flex-col items-center font-gliker">
      <Image
        width={139}
        height={66}
        alt="hanging rope"
        className="mb-[-20px]"
        src="/images/header/hanging-rope.svg"
      />
      <div className="bg-[#FFCD4D] rounded-xl flex flex-col py-2 px-1.5 lg:py-4 lg:px-3 border-[1.5px] border-[#010101] shadow-[2px_4px_0px_0px_#FFF]">
        <div className="flex gap-1 lg:gap-2 lg:py-1 flex-wrap max-w-[280px] lg:max-w-none lg:flex-nowrap">
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
                      'min-h-[32px] h-8 py-0 font-bold bg-transparent text-black hover:bg-[#202020] hover:text-white',
                      (menu.path as SubMenu[]).some(
                        (item) => item.routePath === router.pathname
                      )
                        ? 'bg-[#202020] text-white'
                        : ''
                    )}
                  >
                    {menu.title}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label={menu.title}
                  className="bg-[#FFCD4D] rounded-lg p-2"
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
                        'font-bold data-[hover=true]:bg-[#202020] data-[hover=true]:text-white p-2',
                        router.pathname === subMenu.routePath
                          ? 'bg-[#202020] text-white'
                          : 'text-[#202020]'
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
                  'h-8 py-0 font-bold bg-transparent text-sm lg:text-base text-black hover:bg-[#202020]/80 hover:text-white',
                  menu.title === 'Dex' && 'hidden',
                  menu.routePath === router.pathname
                    ? 'bg-[#202020] text-white'
                    : ''
                )}
                onPress={() => {
                  if (typeof menu.path === 'string') {
                    router.push(menu.path);
                  }
                }}
              >
                {menu.title}
              </Button>
            )
          )}
          {/* <Dropdown>
            <DropdownTrigger
              className={cn(
                'min-h-[32px] h-8 py-0 font-bold bg-transparent text-black hover:bg-[#202020]/70 hover:text-white rounded-full'
              )}
            >
              <Button isIconOnly variant="light" className="p-0 w-8 h-8">
                <FaPlusCircle className="w-6 h-6" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                href={DOMAIN_MAP.WASABEE_DEX}
                startContent={
                  <Image
                    src="/images/wasabee_pot.webp"
                    alt="pot2pump"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                }
                key="pot2pump"
                onPress={() => {
                  router.push(DOMAIN_MAP.WASABEE_DEX);
                }}
              >
                Wasabee DEX
              </DropdownItem>
            </DropdownMenu>
          </Dropdown> */}
        </div>
      </div>
    </div>
  );
};

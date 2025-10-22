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
    <nav className="flex items-center bg-[#1B1308] p-1 rounded-2xl">
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
                    style={{
                      backgroundColor: router.pathname === subMenu.routePath
                        ? '#6B4423'
                        : 'transparent',
                    }}
                    className={`font-medium text-white data-[hover=true]:bg-[#6B4423] data-[hover=true]:opacity-100 p-2 rounded-md transition-all ${
                      router.pathname === subMenu.routePath ? 'opacity-100' : 'opacity-50'
                    }`}
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

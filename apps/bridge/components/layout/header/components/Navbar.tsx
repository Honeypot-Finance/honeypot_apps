import React, { useMemo } from 'react';
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
import { navigateToUrl } from '@/lib/utils/url';

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
  textColor?: string;
  beforeContent?: React.ReactNode;
  afterContent?: React.ReactNode;
}

/**
 * Check if any submenu item matches the current path
 */
const isSubMenuActive = (subMenus: SubMenu[], currentPath: string): boolean => {
  return subMenus.some((item) => item.routePath === currentPath);
};

export const CustomNavbar: React.FC<NavbarProps> = ({ menuList }) => {
  const router = useRouter();

  // Memoize active states to prevent unnecessary recalculations
  const activeStates = useMemo(() => {
    return menuList.reduce((acc, menu) => {
      if (Array.isArray(menu.path)) {
        acc[menu.title] = isSubMenuActive(menu.path as SubMenu[], router.pathname);
      } else {
        acc[menu.title] = menu.routePath === router.pathname;
      }
      return acc;
    }, {} as Record<string, boolean>);
  }, [menuList, router.pathname]);

  if (menuList.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center">
      <div className="flex items-center gap-1">
        {menuList.map((menu) => {
          const isActive = activeStates[menu.title];

          if (Array.isArray(menu.path)) {
            const subMenus = menu.path as SubMenu[];

            return (
              <Dropdown
                key={menu.title}
                placement="bottom-start"
                classNames={{
                  content: 'bg-transparent p-0',
                }}
              >
                <DropdownTrigger>
                  <Button
                    className={`h-9 px-3 font-medium text-sm text-white rounded-lg transition-all hover:bg-white/10 ${
                      isActive ? 'text-[#F59E0B]' : 'text-gray-300 hover:text-white'
                    }`}
                    variant="light"
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
                    const subMenu = subMenus.find(
                      (item) => item.routePath === key
                    );
                    if (subMenu) {
                      navigateToUrl(subMenu.path, router);
                    }
                  }}
                >
                  {subMenus.map((subMenu) => {
                    const isSubActive = router.pathname === subMenu.routePath;

                    return (
                      <DropdownItem
                        key={subMenu.routePath}
                        style={{
                          backgroundColor: isSubActive ? '#6B4423' : 'transparent',
                          color: subMenu.textColor || 'inherit',
                        }}
                        className={`font-medium text-white data-[hover=true]:bg-[#6B4423] data-[hover=true]:opacity-100 p-2 rounded-md transition-all ${
                          isSubActive ? 'opacity-100' : 'opacity-50'
                        }`}
                        startContent={
                          subMenu.icon && (
                            <Image
                              src={subMenu.icon.src}
                              alt={`${subMenu.title} icon`}
                              width={16}
                              height={16}
                              className="w-4 h-4"
                            />
                          )
                        }
                      >
                        <span className="flex items-center">
                          {subMenu.beforeContent}
                          {subMenu.title}
                          {subMenu.afterContent}
                        </span>
                      </DropdownItem>
                    );
                  })}
                </DropdownMenu>
              </Dropdown>
            );
          }

          return (
            <Button
              key={menu.title}
              className={`h-9 px-3 font-medium text-sm rounded-lg transition-all hover:bg-white/10 ${
                isActive ? 'text-[#F59E0B]' : 'text-gray-300 hover:text-white'
              }`}
              variant="light"
              onPress={() => {
                if (typeof menu.path === 'string') {
                  navigateToUrl(menu.path, router);
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
          );
        })}
      </div>
    </nav>
  );
};

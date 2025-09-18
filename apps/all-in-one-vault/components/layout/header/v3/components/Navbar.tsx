import React, { useEffect } from 'react';
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
import { FaPlusCircle } from 'react-icons/fa';
import { DOMAIN_MAP } from 'honeypot-sdk';
import { cn } from '@/lib/utils';

interface NavbarProps {
  menuList: Menu[];
}

export const CustomNavbar: React.FC<NavbarProps> = ({ menuList }) => {
  const router = useRouter();

  // Force dropdown styles via JavaScript as fallback
  const forceDropdownStyles = (element: HTMLElement | null) => {
    if (element) {
      // Find all dropdown content elements
      setTimeout(() => {
        const dropdownContent = document.querySelectorAll(
          '[data-slot="content"]'
        );
        dropdownContent.forEach((el) => {
          const htmlEl = el as HTMLElement;
          // Check if this dropdown contains our plus button items
          if (
            htmlEl.textContent?.includes('Wasabee DEX') ||
            htmlEl.textContent?.includes('Pot2Pump')
          ) {
            htmlEl.style.setProperty(
              'background-color',
              '#202020',
              'important'
            );
            htmlEl.style.setProperty(
              'border',
              '1px solid #5C5C5C',
              'important'
            );
            htmlEl.style.setProperty('color', 'white', 'important');

            // Force styles on menu items
            const menuItems = htmlEl.querySelectorAll('[role="menuitem"]');
            menuItems.forEach((item) => {
              const itemEl = item as HTMLElement;
              itemEl.style.setProperty(
                'background-color',
                '#202020',
                'important'
              );
              itemEl.style.setProperty('color', 'white', 'important');

              // Add hover event listeners
              itemEl.addEventListener('mouseenter', () => {
                itemEl.style.setProperty(
                  'background-color',
                  '#3a3a3a',
                  'important'
                );
              });
              itemEl.addEventListener('mouseleave', () => {
                itemEl.style.setProperty(
                  'background-color',
                  '#202020',
                  'important'
                );
              });
            });
          }
        });
      }, 100);
    }
  };

  useEffect(() => {
    forceDropdownStyles(null);
  }, []);

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
          {menuList.map((menu) => (
            <Button
              key={menu.title}
              className={cn(
                'h-8 py-0 font-bold bg-transparent text-sm lg:text-base text-black hover:bg-[#202020]/80 hover:text-white',
                menu.title === 'Dex' && 'hidden',
                (menu.routePath || menu.path) === router.pathname
                  ? 'bg-[#202020] text-white'
                  : ''
              )}
              onPress={() => {
                const targetPath = menu.routePath || menu.path;
                if (typeof targetPath === 'string') {
                  router.push(targetPath);
                }
              }}
            >
              {menu.title}
            </Button>
          ))}
          <Dropdown className="plus-dropdown">
            <DropdownTrigger
              className={cn(
                'min-h-[32px] h-8 py-0 font-bold bg-transparent text-black hover:bg-[#202020]/70 hover:text-white rounded-full'
              )}
            >
              <Button
                isIconOnly
                variant="light"
                className="p-0 w-8 h-8"
                ref={forceDropdownStyles}
                onPress={() => {
                  // Force styles when dropdown opens
                  setTimeout(() => forceDropdownStyles(null), 100);
                }}
              >
                <FaPlusCircle className="w-6 h-6" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              style={{
                backgroundColor: '#202020',
                color: 'white',
              }}
              classNames={{
                base: 'bg-[#202020] text-white',
                list: 'bg-[#202020]',
              }}
            >
              <DropdownItem
                href={DOMAIN_MAP.WASABEE_DEX}
                style={{
                  backgroundColor: '#202020',
                  color: 'white',
                }}
                className="text-white hover:bg-[#3a3a3a] data-[hover=true]:bg-[#3a3a3a] data-[hover=true]:text-white"
                startContent={
                  <Image
                    src="/images/wasabee_pot.webp"
                    alt="wasabee"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                }
                key="wasabee"
                onPress={() => {
                  router.push(DOMAIN_MAP.WASABEE_DEX);
                }}
              >
                Wasabee DEX
              </DropdownItem>
              <DropdownItem
                href={DOMAIN_MAP.POT2PUMP}
                style={{
                  backgroundColor: '#202020',
                  color: 'white',
                }}
                className="text-white hover:bg-[#3a3a3a] data-[hover=true]:bg-[#3a3a3a] data-[hover=true]:text-white"
                onPress={() => window.open(DOMAIN_MAP.POT2PUMP, '_self')}
                startContent={
                  <Image
                    src="/images/blueAstro.8533943d.svg"
                    alt="pot2pump"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                }
                key="pot2pump"
              >
                Pot2Pump
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

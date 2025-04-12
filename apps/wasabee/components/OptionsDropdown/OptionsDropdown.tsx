import { cn } from '@/lib/tailwindcss';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from '@nextui-org/react';
import { SlOptions, SlShare } from 'react-icons/sl';
import { VscCopy } from 'react-icons/vsc';
import * as clipboard from 'clipboard-polyfill';
import { ShareMediaDisplay } from '../ShareSocialMedialPopUp/ShareSocialMedialPopUp';
import { Token } from '@/services/contract/token';
import { BiLink, BiWallet } from 'react-icons/bi';
import { popmodal } from '@/services/popmodal';
import { WrappedToastify } from '@/lib/wrappedToastify';
import { wallet } from '@/services/wallet';
type optionItem = {
  icon: JSX.Element;
  display: string | JSX.Element;
  onClick?: () => void;
};

interface OptionsDropdownProps {
  className?: string;
  options: optionItem[];
}

export const optionsPresets = {
  copy: ({
    copyText,
    displayText,
    copysSuccessText,
  }: {
    copyText: string;
    displayText?: string;
    copysSuccessText?: string;
  }) => {
    return {
      icon: <VscCopy />,
      display: displayText ?? 'Copy',
      onClick: async () => {
        if (window.navigator.clipboard) {
          window.navigator.clipboard
            .writeText(copyText)
            .then(() => {
              WrappedToastify.success({
                message: copysSuccessText ?? 'Copied',
              });
            })
            .catch((error) => {
              console.error('Copy failed', error);
            });
        } else {
          clipboard.writeText(copyText).then(
            () => {
              WrappedToastify.success({
                message: copysSuccessText ?? 'Copied',
              });
            },
            (error: Error) => {
              WrappedToastify.error({
                message: (
                  <div>
                    <h3>
                      Copy failed, please do it manually, click this message to
                      open prompt:
                    </h3>
                    <p>{copyText}</p>
                  </div>
                ),
                options: {
                  autoClose: false,
                  onClick: () => {
                    window.prompt('Copy to clipboard: Ctrl+C, Enter', copyText);
                  },
                },
              });
              console.error('Copy failed', error);
            }
          );
        }
      },
    };
  },
  share: ({
    shareText,
    shareUrl,
    displayText,
  }: {
    shareText: string;
    shareUrl: string;
    displayText?: string;
  }) => {
    return {
      icon: <SlShare />,
      display: displayText ?? 'Share',
      onClick: () => {
        popmodal.openModal({
          content: (
            <ShareMediaDisplay shareText={shareText} shareUrl={shareUrl} />
          ),
        });
      },
    };
  },
  importTokenToWallet: ({ token }: { token?: Token }) => {
    return {
      icon: <BiWallet />,
      display: 'Import token to wallet',
      onClick: async () => {
        console.log('importTokenToWallet', token);
        if (!token) {
          WrappedToastify.error({
            message: 'Token not found or not initialized',
          });
          return;
        }
        await token.init();
        token.watch();
      },
    };
  },
  viewOnExplorer: ({
    address,
    displayText,
  }: {
    address: string;
    displayText?: string;
  }) => {
    return {
      icon: <BiLink />,
      display: displayText ?? 'View on explorer',
      onClick: () => {
        window.open(
          `${wallet.currentChain.chain.blockExplorers?.default.url}address/${address}`,
          '_blank'
        );
      },
    };
  },
};

export function OptionsDropdown(props: OptionsDropdownProps) {
  return (
    <Dropdown className="text-3xl">
      <DropdownTrigger>
        <Button className={cn('bg-transparent min-w-0', props.className)}>
          <SlOptions
            size={20}
            className="cursor-pointer hover:text-[#F7931A]"
          />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Dynamic Actions">
        {props.options.map((option, index) => (
          <DropdownItem
            key={index}
            onClick={() => {
              option.onClick && option.onClick();
            }}
            onTouchStart={() => {
              option.onClick && option.onClick();
            }}
            startContent={option.icon}
          >
            {option.display}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Divider,
  useDisclosure,
  Link,
  Tooltip,
} from '@nextui-org/react';
import { IoSearchOutline } from 'react-icons/io5';
import { IoClose } from 'react-icons/io5';

import { Token } from '@honeypot/shared';
import { Observer, observer, useLocalObservable } from 'mobx-react-lite';
import { liquidity } from '@/services/liquidity';
import { useCallback, useEffect, useState } from 'react';
import { isEthAddress } from '@/lib/address';
import { Input } from '../../input/index';
import { SpinnerContainer } from '../../Spinner';
import { NoData } from '../../table';
import { Copy } from '../../Copy/index';
import { BiLinkExternal } from 'react-icons/bi';
import { wallet } from '@honeypot/shared/lib/wallet';
import { TokenLogo } from '@honeypot/shared';
import { TruncateText } from '@honeypot/shared';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import pot2pumpIcon from '@/public/images/bera/smoking_bera.png';

type TokenSelectorProps = {
  onSelect: (token: Token) => void;
  value?: Token | null;
  disableSelection?: boolean;
  staticTokenList?: Token[];
};

export const TokenSelector = observer(
  ({
    onSelect,
    value,
    disableSelection,
    staticTokenList,
  }: TokenSelectorProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const state = useLocalObservable(() => ({
      search: '',
      setSearch(value: string) {
        state.search = value.trim();
      },
      filterLoading: false,
      filterTokensBySearch: async function () {
        if (!state.search) {
          state.tokens = liquidity.tokens;
          return;
        }
        state.filterLoading = true;
        const isEthAddr = isEthAddress(state.search);
        if (isEthAddr) {
          const filterToken = liquidity.tokens?.find((token) => {
            return (
              token.address.toLowerCase() === state.search.toLocaleLowerCase()
            );
          });
          if (filterToken) {
            state.tokens = [filterToken];
            state.filterLoading = false;
            return;
          }
          const token = Token.getToken({
            chainId: wallet.currentChainId.toString(),
            address: state.search,
          });
          await token.init();
          state.tokens = [token];
        } else {
          state.tokens = liquidity.tokens?.filter((token) => {
            return (
              token.name?.toLowerCase().includes(state.search.toLowerCase()) ||
              token.symbol?.toLowerCase().includes(state.search.toLowerCase())
            );
          });
        }
        state.filterLoading = false;
      },
      tokens: [] as Token[],
      currentAnimationVariant: 'initial',
    }));

    const animationVariants = {
      dropDownIcon: {
        initial: { y: 0 },
        hover: {
          y: [0, 5, 0],
        },
      },
    };

    useEffect(() => {
      value?.getPot2PumpAddress();
    }, [value]);

    useEffect(() => {
      state.filterTokensBySearch();
    }, [state.search]);

    return (
      <motion.div
        className="flex items-center group"
        onHoverStart={() => {
          state.currentAnimationVariant = 'hover';
        }}
        onHoverEnd={() => {
          state.currentAnimationVariant = 'initial';
        }}
      >
        <Popover
          isOpen={isOpen}
          onOpenChange={(isOpen) => {
            isOpen ? onOpen() : onClose();
          }}
          placement="bottom"
          classNames={{
            base: [
              // arrow color
              'before:bg-default-200',
            ],
            content: [
              'py-3 px-4 border border-default-200',
              'bg-gradient-to-br from-white to-default-300',
              'dark:from-default-100 dark:to-default-50',
            ],
          }}
          isTriggerDisabled={disableSelection}
        >
          <PopoverTrigger
            onClick={() => {
              state.setSearch('');
            }}
          >
            <Button className="inline-flex max-w-full justify-between h-10 items-center shrink-0 bg-transparent px-2.5 py-0 rounded-[30px] text-black">
              {value && (
                <TokenLogo
                  addtionalClasses="min-w-[24px]"
                  disableLink={true}
                  disableTooltip={true}
                  token={value}
                ></TokenLogo>
              )}
              <TruncateText className="shrink overflow-clip h-4">
                {value?.displayName ? value.displayName : 'Select Token'}
              </TruncateText>
              {!disableSelection && (
                <motion.div
                  variants={animationVariants.dropDownIcon}
                  initial={animationVariants.dropDownIcon.initial}
                  animate={state.currentAnimationVariant}
                >
                  <ChevronDown className="size-4" />
                </motion.div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex w-full lg:w-[350px] flex-col items-center gap-4 border border-[color:var(--card-stroke,#F7931A)] [background:var(--card-color,#271A0C)] rounded-xl border-solid">
            <Observer>
              {() => (
                <div className="w-full">
                  <SpinnerContainer isLoading={state.filterLoading}>
                    <Input
                      placeholder="Search token by symbol or address"
                      // className=" bg-transparent"
                      onClear={() => {
                        state.setSearch('');
                      }}
                      onChange={(e) => {
                        state.setSearch(e.target.value);
                      }}
                      isClearable={true}
                      // labelPlacement="outside"
                      startContent={<IoSearchOutline></IoSearchOutline>}
                      endContent={<IoClose></IoClose>}
                    />
                    <Divider className="my-4" />
                    <div>
                      {staticTokenList ? (
                        staticTokenList.length ? (
                          staticTokenList
                            .slice()
                            .sort((a, b) => b.priority - a.priority)
                            .map((token, idx) => {
                              return (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    onSelect(token);
                                    onClose();
                                  }}
                                  className="py-[8px] px-[8px] rounded-[8px] flex justify-between items-center cursor-pointer hover:[background:rgba(255,255,255,0.04)]"
                                >
                                  <TokenLogo token={token}></TokenLogo>
                                  <div className="flex-grow-[1] px-2">
                                    <div>{token.name}</div>
                                    <div className="text-[rgba(255,255,255,0.50)] [font-kerning:none] [font-feature-settings:'calt'_off] [font-family:Inter] text-xs font-normal leading-[14px]">
                                      {token.symbol}
                                    </div>
                                  </div>
                                  <div>{token.balanceFormatted}</div>
                                </div>
                              );
                            })
                        ) : (
                          <NoData></NoData>
                        )
                      ) : (
                        <div className="max-h-[300px] overflow-auto">
                          <div>
                            <h2 className=" opacity-50 font-normal font-sans">
                              Most Popular
                            </h2>
                            <div className="flex *:grow w-full flex-wrap gap-2">
                              {state.tokens.length ? (
                                state.tokens
                                  .slice()
                                  .filter((token) => token.isPopular)
                                  .sort((a, b) => b.priority - a.priority)
                                  .map((token, idx) => {
                                    return (
                                      <Button
                                        key={idx}
                                        onClick={() => {
                                          onSelect(token);
                                          onClose();
                                        }}
                                        className="min-w-[2rem] hover:bg-amber-600 flex  justify-center items-center"
                                      >
                                        <TokenLogo
                                          addtionalClasses="w-[15px] h-[15px]"
                                          token={token}
                                          disableLink
                                          disableTooltip
                                        ></TokenLogo>
                                        <p className="text-[rgba(255,255,255)] [font-kerning:none] [font-feature-settings:'calt'_off] [font-family:Inter] text-xs font-normal leading-[14px]">
                                          {token.symbol}
                                        </p>
                                      </Button>
                                    );
                                  })
                              ) : (
                                <NoData></NoData>
                              )}
                            </div>
                          </div>
                          <h2 className=" opacity-50 font-normal font-sans">
                            Validated
                          </h2>
                          {state.tokens.length ? (
                            state.tokens
                              .slice()
                              .sort((a, b) => b.priority - a.priority)
                              .map((token, idx) => {
                                return (
                                  <div
                                    key={idx}
                                    onClick={() => {
                                      onSelect(token);
                                      onClose();
                                    }}
                                    className="py-[8px] px-[8px] rounded-[8px] flex justify-between items-center cursor-pointer hover:[background:rgba(255,255,255,0.04)]"
                                  >
                                    <TokenLogo token={token}></TokenLogo>
                                    <div className="flex-grow-[1] px-2">
                                      <div>{token.name}</div>
                                      <div className="text-[rgba(255,255,255,0.50)] [font-kerning:none] [font-feature-settings:'calt'_off] [font-family:Inter] text-xs font-normal leading-[14px]">
                                        {token.symbol}
                                      </div>
                                    </div>
                                    <div>{token.balanceFormatted}</div>
                                  </div>
                                );
                              })
                          ) : (
                            <NoData></NoData>
                          )}
                          <div className="w-full justify-center text-center opacity-50">
                            <h3>
                              not seeing the token you want? search address for
                              specific token...
                            </h3>
                          </div>
                        </div>
                      )}
                    </div>
                  </SpinnerContainer>
                </div>
              )}
            </Observer>
          </PopoverContent>
        </Popover>
        {value && (
          <div className="text-black flex items-center gap-x-2 z-10">
            <Link
              href={`${wallet.currentChain?.chain.blockExplorers?.default.url}/token/${value.address}`}
              target="_blank"
            >
              <BiLinkExternal className=" cursor-pointer text-[#140E06]" />
            </Link>
            <Copy value={value.address} className="size-4 text-[#140E06]" />
            {value.pot2pumpAddress && (
              <Tooltip content="This token is launched on Pot2Pump">
                <Link href={`/launch-detail/${value.address}`}>
                  <Image
                    width={16}
                    height={16}
                    src={pot2pumpIcon}
                    alt="pot2pump"
                    className="size-4 cursor-pointer"
                  />
                </Link>
              </Tooltip>
            )}
          </div>
        )}
      </motion.div>
    );
  }
);

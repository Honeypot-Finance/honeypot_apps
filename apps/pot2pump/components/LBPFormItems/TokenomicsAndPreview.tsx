/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import {
  FormContainer,
  InputField,
  NumberField,
  SliderField,
} from './Components';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
  Listbox,
  ListboxItem,
  Switch,
  Selection,
  Button,
} from '@nextui-org/react';
import SearchIcon from '../svg/SearchIcon';
import { berachainNetworkTestnet } from '@/services/network';
import Image from 'next/image';
import { useReadContract } from 'wagmi';
import { ERC20ABI } from '@/lib/abis/erc20';
import { symbol } from 'zod';
import ArrowDownSvg from '../svg/ArrowDown';
import CloseIcon from '../svg/CloseIcon';

type AssetTokenData = {
  tokenName: string;
  tokenIcon: string;
};

const AssetTokenModal = ({
  projectTokenAddress,
}: {
  projectTokenAddress: `0x${string}`;
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [searchValue, setSearchValue] = React.useState('');

  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const listToken = Object.keys(berachainNetworkTestnet.validatedTokensInfo)
    .map((address) => ({
      addr: address,
      ...berachainNetworkTestnet.validatedTokensInfo[address],
    }))
    .filter((item) => item.addr !== projectTokenAddress);

  const filteredList = listToken.filter((token) =>
    token.symbol.toLowerCase().includes(searchValue.toLowerCase())
  );

  const selectedToken = listToken.find(
    (item) => item.symbol === watch('assetTokenType')
  );

  const handleSelect = (value: Selection) => {
    const assetTokenType = (value as Set<string>).values().next().value;
    const selectedToken = listToken.find(
      (item) => item.symbol === assetTokenType
    );

    setValue('assetTokenType', assetTokenType);
    setValue('assetTokenName', selectedToken?.name);
    setValue('assetTokenLogo', selectedToken?.logoURI);
    setValue('assetTokenAddress', selectedToken?.address);
  };

  return (
    <>
      <div
        className="flex items-center gap-2 md:gap-3 cursor-pointer"
        onClick={onOpen}
      >
        {selectedToken ? (
          <>
            <img
              className="size-[24px] md:size-[32px] aspect-square rounded-full"
              src={selectedToken?.logoURI}
              alt="Asset token"
            />
            <span className="text-lg md:text-xl">{selectedToken?.name}</span>

            <ArrowDownSvg />
          </>
        ) : (
          <span className="text-lg md:text-xl">Select Token</span>
        )}
      </div>
      <Modal
        classNames={{
          base: '!overflow-y-visible absolute top-0 px-4 shadow-none !mt-[170px]',
        }}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton
        size="lg"
      >
        <ModalContent className="!bg-transparent !border-none">
          <div className="flex absolute top-0 left-0 right-0 -translate-y-3/4 justify-center">
            <img src="/images/launch-project/Group.png" alt="handing-rope" />
          </div>
          <div className="hidden lg:flex absolute left-0 -translate-x-[60%] -translate-y-[10%]">
            <img
              src="/images/launch-project/launch-project-sticky3.png"
              alt="sticky3"
            />
          </div>

          <div className="hidden lg:flex absolute right-0 translate-x-[70%] -translate-y-[10%]">
            <img
              src="/images/launch-project/launch-project-sticky4.png"
              alt="sticky4"
            />
          </div>
          <ModalBody
            className="relative z-50 w-ful rounded-3xl px-0 pb-16 text-[#202020] block"
            style={{
              background:
                "url('/images/launch-project/subtract-sticky.png'), url('/images/launch-project/subtract-bg.png')",
              backgroundSize: 'contain, cover',
              backgroundRepeat: 'no-repeat, no-repeat',
            }}
          >
            <div className="flex items-center justify-between pt-6 pb-4 border-b px-6 border-[#202020]">
              <h3 className="text-lg">Token Selector</h3>

              <Button
                isIconOnly
                className="!size-8 min-w-8 rounded-md"
                variant="bordered"
                onClick={onOpenChange}
              >
                <CloseIcon className="text-black" />
              </Button>
            </div>

            <div className="px-6 pt-4 pb-6 border-b border-[#202020]">
              <p className="text-sm mb-2">Select a token</p>
              <InputField
                placeholder="Search"
                startContent={<SearchIcon className="size-5 !text-[#202020]" />}
                classNames={{
                  input: 'text-sm mt-1 leading-[16px]',
                  inputWrapper: 'h-[40px]',
                }}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>

            <div className="overflow-y-auto h-[300px] mx-6 mt-6 no-scrollbar">
              <Controller
                name="assetTokenType"
                control={control}
                render={({ field }) => (
                  <Listbox
                    aria-label="Token Selector"
                    variant="flat"
                    disallowEmptySelection
                    selectionMode="single"
                    selectedKeys={new Set([field.value])}
                    onSelectionChange={handleSelect}
                    className="bg-transparent rounded-md px-0"
                    classNames={{
                      list: 'gap-3',
                    }}
                  >
                    {filteredList.map((token) => (
                      <ListboxItem
                        key={token.symbol}
                        className="hover:bg-white/60"
                        classNames={{
                          base: 'select-item bg-white py-3 item-center data-[hover=true]:bg-white/80 data-[selectable=true]:focus:bg-white/80 data-[selectable=true]:text-[#202020] data-[selectable=true]:focus:text-[#202020] data-[selected=true]:border-b data-[selected=true]:border-[#2F302B] px-3 rounded-lg border border-black shadow-[1px_2px_0px_0px_#9B7D2F]',
                          title: 'text-base leading-[16px]',
                          selectedIcon:
                            'block p-1 w-6 h-6 border-[0.5px] border-[#202020] shadow-[1.125px_1.125px_0px_0px_#000] rounded hidden',
                        }}
                        textValue={token.symbol}
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            className="rounded-full"
                            src={token.logoURI}
                            alt={token.name}
                            width={18}
                            height={18}
                          />
                          <span className="pt-1">{token.name}</span>
                        </div>
                      </ListboxItem>
                    ))}
                  </Listbox>
                )}
              />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

const TokenomicsAndPreview = () => {
  const {
    control,
    formState: { errors },
    getValues,
    watch,
  } = useFormContext();

  const projectTokenLogo = getValues('projectTokenLogo');
  const assetTokenName = getValues('assetTokenName');
  const assetTokenLogo = getValues('assetTokenLogo');
  const projectTokenAddress = getValues('projectToken');
  const isCustomTotalSupply = watch('customTotalSupplyType');
  const [isFetchImageError, setIsFetchImageError] = useState(false);

  const { data: projectTokenName, isLoading } = useReadContract({
    abi: ERC20ABI,
    address: getValues('projectToken'),
    functionName: 'name',
  });

  return (
    <div className="text-[#202020]/80">
      <h1 className="text-2xl md:text-[32px] md:leading-[36.64px] font-medium text-center mb-4">
        LBP Configuration
      </h1>
      <FormContainer className="mt-6">
        <h3 className="text-[22px] md:text-2xl text-center md:leading-[28.79px] mb-6">
          Configure Quantities
        </h3>

        <div className="flex gap-4 md:gap-6 flex-col md:flex-row">
          <Controller
            name="projectTokenQuantity"
            control={control}
            render={({ field }) => (
              <NumberField
                value={field.value}
                onValueChange={(values) =>
                  field.onChange(Number(values.floatValue))
                }
                label="Project Token"
                placeholder="0"
                isInvalid={!!errors.projectTokenQuantity}
                errorMessage={errors.projectTokenQuantity?.message?.toString()}
                startContent={
                  <div className="flex items-center gap-2 md:gap-3">
                    <img
                      className="size-[24px] md:size-[32px] aspect-square rounded-full"
                      src={
                        isFetchImageError
                          ? 'https://cdn-icons-png.flaticon.com/512/6681/6681925.png'
                          : projectTokenLogo
                      }
                      alt={projectTokenName}
                      onError={(e) => {
                        setIsFetchImageError(true);
                      }}
                    />
                    <span className="text-lg md:text-xl">
                      {projectTokenName}
                    </span>
                    {isLoading && (
                      <span className="h-2.5 w-8 bg-neutral-400 rounded-full animate-pulse"></span>
                    )}
                    <ArrowDownSvg />
                  </div>
                }
                classNames={{
                  input: 'text-right flex-1',
                }}

                // description={
                //   <div className="text-[10px] text-white/50 px-4 flex items-center justify-between">
                //     <span>Use Max</span>
                //     <span>% supply: 0.000000003930187014%</span>
                //   </div>
                // }
              />
            )}
          />

          <Controller
            name="assetTokenQuantity"
            control={control}
            render={({ field }) => (
              <NumberField
                value={field.value}
                onValueChange={(values) =>
                  field.onChange(Number(values.floatValue))
                }
                label="Asset Token"
                placeholder="0"
                isInvalid={!!errors.assetTokenQuantity}
                errorMessage={errors.assetTokenQuantity?.message?.toString()}
                startContent={
                  <AssetTokenModal projectTokenAddress={projectTokenAddress} />
                }
                classNames={{
                  input: 'text-right flex-1',
                }}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-2 mt-6 pb-4 border-b border-black md:pb-0 mb:border-0">
          <div className="flex items-center gap-4">
            <label
              className="font-normal text-xs md:text-base md:leading-[19.2px] text-[#202020]/80"
              htmlFor="customTotalSupplyType"
            >
              Custom Total Supply
            </label>
            <Controller
              name="customTotalSupplyType"
              control={control}
              render={({ field }) => (
                <Switch
                  id="customTotalSupplyType"
                  size="sm"
                  classNames={{
                    wrapper:
                      'group-data-[selected=true]:bg-white border border-[#202020] bg-white',
                    thumb: 'bg-[#ECC94E]',
                  }}
                  isSelected={field.value}
                  onValueChange={(isSelected) => field.onChange(isSelected)}
                />
              )}
            />
          </div>

          {isCustomTotalSupply && (
            <Controller
              name="customTotalSupply"
              control={control}
              render={({ field }) => (
                <NumberField
                  value={field.value}
                  onValueChange={(values) =>
                    field.onChange(Number(values.floatValue))
                  }
                  placeholder="0"
                  isInvalid={!!errors.customTotalSupply}
                  errorMessage={errors.customTotalSupply?.message?.toString()}
                />
              )}
            />
          )}
        </div>

        <div className="mt-4 md:mt-6 flex flex-col gap-4">
          <h3 className="text-[22px] md:text-2xl text-center md:leading-[28.79px] mb-0 md:mb-6">
            Configure Weights
          </h3>

          <Controller
            name="startWeight"
            control={control}
            render={({ field }) => (
              <SliderField
                label="Start Weight"
                firstTokenName={projectTokenName}
                firstTokenIcon={
                  isFetchImageError
                    ? 'https://cdn-icons-png.flaticon.com/512/6681/6681925.png'
                    : projectTokenLogo
                }
                secondTokenName={assetTokenName}
                secondTokenIcon={assetTokenLogo}
                value={field.value}
                onChange={(value) => field.onChange(Number(value))}
              />
            )}
          />

          <Controller
            name="endWeight"
            control={control}
            render={({ field }) => (
              <SliderField
                label="End Weight"
                firstTokenName={projectTokenName}
                firstTokenIcon={
                  isFetchImageError
                    ? 'https://cdn-icons-png.flaticon.com/512/6681/6681925.png'
                    : projectTokenLogo
                }
                secondTokenName={assetTokenName}
                secondTokenIcon={assetTokenLogo}
                value={field.value}
                onChange={(value) => field.onChange(Number(value))}
              />
            )}
          />
        </div>
      </FormContainer>
    </div>
  );
};

export default TokenomicsAndPreview;

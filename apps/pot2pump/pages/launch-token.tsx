import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Controller, set, useForm } from 'react-hook-form';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { wallet } from '@honeypot/shared/lib/wallet';
import launchpad from '@/services/launchpad';
import { Button } from '@nextui-org/react';
import { NextLayoutPage } from '@/types/nextjs';
import { DreampadSvg } from '@/components/svg/Dreampad';
import { dayjs } from '@/lib/dayjs';
import {
  Accordion,
  AccordionItem,
  DateValue,
  Dropdown,
  Button as NextButton,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  SelectItem,
} from '@nextui-org/react';
import { useRouter } from 'next/router';
import { Copy } from '@/components/Copy';
import { BiSolidDownArrow } from 'react-icons/bi';
import { WarppedNextSelect } from '@/components/wrappedNextUI/Select/Select';
import { WrappedNextDatePicker } from '@/components/wrappedNextUI/DatePicker/DatePicker';
import { FaQuestionCircle } from 'react-icons/fa';
import { popmodal } from '@/services/popmodal';
import store from 'store2';
import { cn } from '@/lib/tailwindcss';
import { TokenLogo, Token } from '@honeypot/shared';
import { uploadFile, UploadImage } from '@/components/UploadImage/UploadImage';
import BigNumber from 'bignumber.js';
import { amountFormatted, formatAmount } from '@/lib/format';
import AITokenGenerator, {
  TokenGeneratedSuccessValues,
} from '@/components/AI/AITokenGenerator/AITokenGenerator';
import { HoneyContainer } from '@/components/CardContianer';
import { MemePairContract } from '@/services/contract/launches/pot2pump/memepair-contract';
const positiveIntegerPattern = /^[1-9]\d*$/;

type FormValues = {
  provider: string;
  raisedToken: string;
  tokenName: string;
  tokenSymbol: string;
  tokenAmount: number;
  poolHandler: string;
  raisingCycle: DateValue;
  projectName: string;
  description: string;
  twitter: string;
  website: string;
  telegram: string;
  logoUrl: string;
  bannerUrl: string;
};

const inputBaseClass =
  'w-full bg-white rounded-[12px] md:rounded-[16px] px-3 md:px-4 py-2 md:py-[18px] text-black outline-none border border-black shadow-[0px_332px_93px_0px_rgba(0,0,0,0.00),0px_212px_85px_0px_rgba(0,0,0,0.01),0px_119px_72px_0px_rgba(0,0,0,0.05),0px_53px_53px_0px_rgba(0,0,0,0.09),0px_13px_29px_0px_rgba(0,0,0,0.10)] placeholder:text-black/50 text-sm md:text-base font-medium h-[40px] md:h-[60px]';

const labelBaseClass = 'text-black text-sm md:text-base font-medium';

const MemePadInstruction = () => {
  const InstructionMarker = ({ className }: { className?: string }) => (
    <div
      className={cn(
        'w-9 h-9 bg-[#271A0C] rounded-[50%] flex justify-center items-center',
        className
      )}
    >
      <div className="w-6 h-6 bg-[#FFCD4D10]  rounded-[50%] flex justify-center items-center">
        <div className="w-3 h-3 bg-[#FFCD4D] rounded-[50%]"></div>
      </div>
    </div>
  );
  const steps = [
    {
      content: 'Pick a coin that you like 💖',
    },
    {
      content:
        'Deposit your coin to create your LP position in the AMM pool 💸',
    },
    {
      content: 'Withdraw anytime with no gains or losses🚪',
    },
    {
      content:
        'Once $20k market cap is reached, Liquidity is locked & burned on HenloDEX 🔥 + distrubute deployer rewards!',
    },
    {
      content:
        'claim your LP position and earn txn fee, BGT, and other protocol interest',
    },
  ];
  return (
    <div className="p-5 flex flex-col gap-5">
      <p className="text-xl">
        Pot2Pump mode stops rugs by ensuring all tokens are safe and integrate
        perfectly with PoL
      </p>
      <p className=" font-sans font-light">
        Every token created with Pot2Pump mode is a fair-launch—no presales, no
        team allocations with a chance to mine BGT and other protocol interests.
      </p>
      <h2 className="text-2xl">How it works</h2>
      <div className="relative">
        {/* <div className="absolute w-[2px] h-[90%] bg-[#FFCD4D] left-[21px] top-[50%] translate-y-[-50%]"></div> */}
        <ul
          className=" flex flex-col pl-5 text-lg font-sans font-light            
            list-none
          "
        >
          {steps.map((step, idx) => (
            <li key={idx} className="flex relative">
              <div className="flex flex-col items-center ">
                {idx !== 0 && (
                  <div className="w-[1px] flex-1 bg-[#FFCD4D]"></div>
                )}
                <InstructionMarker />
                {idx !== steps.length - 1 && (
                  <div className="w-[1px] flex-1 bg-[#FFCD4D]"></div>
                )}
              </div>
              <div
                className={cn(
                  'bg-[#3e2a0f]   px-5 py-2 ml-8 rounded-[2rem] relative overflow-visible',
                  idx !== 0 && idx !== steps.length - 1
                    ? 'my-2'
                    : idx === 0
                    ? 'mb-2'
                    : 'mt-2'
                )}
              >
                {step.content}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Button
        className="w-full mt-4"
        onClick={() => {
          popmodal.closeModal();
          store.set('pot2pump_notice_read', true);
        }}
      >
        I&apos;m ready to pump
      </Button>
    </div>
  );
};

const MEMELaunchModal: NextLayoutPage = observer(() => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      logoUrl: '/images/empty-logo.png',
    },
  });
  const router = useRouter();
  const state = useLocalObservable(() => ({
    pairAddress: '',
    launchedTokenAddress: '',
    setPairAddress(pairAddress: string) {
      this.pairAddress = pairAddress;
    },
    raisedTokenAddress: '',
    raisedTokenAmount: BigInt(0),
    setRaisedTokenAddress(raisedTokenAddress: string) {
      this.raisedTokenAddress = raisedTokenAddress;
      const amount = wallet.currentChain.raisedTokenData.find(
        (token) => token.address === raisedTokenAddress
      )?.amount;
      this.raisedTokenAmount = amount ?? BigInt(0);
    },
    setLaunchedTokenAddress(launchedTokenAddress: string) {
      this.launchedTokenAddress = launchedTokenAddress;
    },
  }));

  console.log('state.raisedTokenAddress:', state.raisedTokenAddress);

  const onSubmit = async (data: FormValues) => {
    try {
      const [pairAddress] = await launchpad.createLaunchProject.call({
        ...data,
        raisedToken: state.raisedTokenAddress,
        tokenAmount: state.raisedTokenAmount,
        launchType: 'meme',
        raisingCycle: dayjs().unix(),
      });

      const pair = new MemePairContract({
        address: pairAddress,
      });

      const launchedToken = await pair.contract.read.launchedToken();

      state.setPairAddress(launchedToken);
      state.setLaunchedTokenAddress(launchedToken);
      router.push(`/launch-detail/${launchedToken}`);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const notice_read = store.get('pot2pump_notice_read');
    if (!notice_read) {
      openInstructionModal();
    }
  }, []);

  useEffect(() => {
    if (wallet.isInit && wallet.currentChain?.raisedTokenData?.length > 0) {
      state.setRaisedTokenAddress(
        wallet.currentChain.raisedTokenData[0].address
      );
    }
  }, [wallet.isInit]);

  const openInstructionModal = () => {
    popmodal.openModal({
      content: <MemePadInstruction />,
    });
  };

  const tokenGeneratedCallback = (tokenInfo: TokenGeneratedSuccessValues) => {
    if (tokenInfo.image) {
      setValue('logoUrl', tokenInfo.image);
    }
    if (tokenInfo.name) {
      setValue('tokenName', tokenInfo.name);
    }
    if (tokenInfo.description) {
      setValue('description', tokenInfo.description);
    }
    if (tokenInfo.symbol) {
      setValue('tokenSymbol', tokenInfo.symbol);
    }
  };

  return (
    <div className="flex w-full items-center justify-center">
      <HoneyContainer>
        <div className="flex items-center gap-2">
          <DreampadSvg />
          <span className="text-black text-base md:text-xl font-bold text-center">
            Pot2Pump
          </span>{' '}
          <FaQuestionCircle
            onClick={() => openInstructionModal()}
            className="cursor-pointer hover:scale-150 transition-all text-black"
          />
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full rounded-[24px] md:rounded-[32px] bg-white space-y-5 px-4 md:px-8 py-4 md:py-6 custom-dashed mx-3 md:mx-6 mt-4 md:mt-6"
        >
          {/* <AITokenGenerator tokenGeneratedCallback={tokenGeneratedCallback} /> */}
          <div className="flex flex-col gap-4">
            <Controller
              control={control}
              name="logoUrl"
              rules={{ required: 'Token Logo is required' }}
              render={({ field: { onChange, value } }) => (
                <UploadImage
                  onUpload={onChange}
                  imagePath={value}
                  blobName="logo"
                />
              )}
            />
            <div className="text-black opacity-50 text-center text-sm">
              Click icon to upload new token icon{' '}
              <span className="text-red-500">*</span>
            </div>
            {errors.logoUrl && (
              <span className="text-red-500 text-center text-sm">
                {errors.logoUrl.message as string}
              </span>
            )}
          </div>

          <div className=" flex-col gap-4 hidden">
            <label htmlFor="provider">Token Provider</label>
            {wallet.account && (
              <input
                type="text"
                {...register('provider')}
                defaultValue={wallet.account}
                className="outline-none w-full sm:w-[522px] lg:w-[800px] h-[60px] bg-[#2F200B] pl-3 pr-4 py-3 rounded-2xl cursor-not-allowed"
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelBaseClass}>
              Token Name <span className="text-red-500 text-[10px]">*</span>
            </label>
            <input
              type="text"
              {...register('tokenName', { required: true })}
              className={inputBaseClass}
              placeholder="Enter token name"
            />
            {errors.tokenName && (
              <span className="text-red-500 text-sm">
                Token Name is required
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelBaseClass}>
              Token Symbol <span className="text-red-500 text-[10px]">*</span>
            </label>
            <input
              type="text"
              {...register('tokenSymbol', { required: true })}
              className={inputBaseClass}
              placeholder="Enter token symbol"
            />
            {errors.tokenSymbol && (
              <span className="text-red-500 text-sm">
                Token Symbol is required
              </span>
            )}
          </div>

          {wallet.isInit && wallet.currentChain?.raisedTokenData?.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className={labelBaseClass}>
                Raise Token <span className="text-red-500">*</span>
              </label>
              <WarppedNextSelect
                isRequired
                defaultSelectedKeys={
                  wallet.currentChain.raisedTokenData[0]?.address
                    ? [wallet.currentChain.raisedTokenData[0].address]
                    : []
                }
                items={wallet.currentChain?.raisedTokenData || []}
                selectorIcon={<></>}
                onSelectionChange={(value) => {
                  state.setRaisedTokenAddress(value.currentKey ?? '');
                }}
                {...register('raisedToken')}
              >
                {(wallet.currentChain?.raisedTokenData || []).map((token) => (
                  <SelectItem
                    key={token.address}
                    value={token.address}
                    startContent={
                      <TokenLogo
                        size={24}
                        token={Token.getToken({
                          address: token.address,
                          chainId: wallet.currentChain.chainId.toString(),
                        })}
                        addtionalClasses="rounded-full"
                      />
                    }
                  >
                    {amountFormatted(
                      new BigNumber(token.amount.toString())
                        .div(10 ** 18)
                        .toString(),
                      {
                        prefix: '',
                        decimals: 0,
                        fixed: 5,
                        symbol: ` ${token.symbol}`,
                      }
                    )}
                  </SelectItem>
                ))}
              </WarppedNextSelect>
            </div>
          )}

          {wallet.isInit && (!wallet.currentChain?.raisedTokenData || wallet.currentChain.raisedTokenData.length === 0) && (
            <div className="flex flex-col gap-2">
              <label className={labelBaseClass}>
                Raise Token <span className="text-red-500">*</span>
              </label>
              <div className="p-4 rounded-lg bg-default-100 text-default-500 text-sm">
                No raised tokens available on this chain. Please switch to a supported chain or contact support.
              </div>
            </div>
          )}

          <div className="custom-dashed-less-round">
            <Accordion variant="bordered" title="Advanced Options">
              <AccordionItem
                key="advanced"
                aria-label="advanced"
                title="Advanced Options"
                classNames={{
                  title: 'text-black font-bold text-sm md:text-base',
                  trigger:
                    'text-white/50 text-sm md:text-base h-[36px] md:h-[56px] flex items-center',
                  content: 'space-y-3',
                  base: 'border-none',
                }}
              >
                <div className="flex flex-col gap-2">
                  <label className={labelBaseClass}>
                    Description{' '}
                    <span className="text-black/50">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    {...register('description')}
                    className={inputBaseClass}
                    placeholder="Enter description"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelBaseClass}>
                    Twitter <span className="text-black/50">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    {...register('twitter')}
                    className={inputBaseClass}
                    placeholder="Enter Twitter URL"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelBaseClass}>
                    Website <span className="text-black/50">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    {...register('website')}
                    className={inputBaseClass}
                    placeholder="Enter website URL"
                  />
                </div>

                <div className="flex flex-col gap-2 pb-4">
                  <label className={labelBaseClass}>
                    Telegram <span className="text-black/50">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    {...register('telegram')}
                    className={inputBaseClass}
                    placeholder="Enter Telegram URL"
                  />
                </div>
              </AccordionItem>
            </Accordion>
          </div>

          {state.launchedTokenAddress ? (
            <div className="flex items-center text-black">
              Pair Address:&nbsp;
              <Link
                className="text-primary"
                href={`/launch-detail/${state.launchedTokenAddress}`}
                target="_blank"
              >
                {state.launchedTokenAddress}
              </Link>
              <Copy
                className="ml-[8px]"
                value={state.launchedTokenAddress}
              ></Copy>
            </div>
          ) : (
            <Button
              type="submit"
              isLoading={launchpad.createLaunchProject.loading}
              className="w-full bg-black text-white font-bold rounded-[12px] md:rounded-[16px] px-3 py-2 md:py-[18px] border-2 border-black hover:bg-black/90 text-sm md:text-base h-[40px] md:h-[60px]"
            >
              Launch Token
            </Button>
          )}
        </form>
        {/* 移除底部边框 */}
      </HoneyContainer>
    </div>
  );
});

export type LaunchType = 'fto' | 'meme';

const LaunchTokenPage: NextLayoutPage = observer(() => {
  const router = useRouter();
  const { launchType } = router.query || {};
  const [selectedLaunch, setSelectedLaunch] = useState<LaunchType>('fto');

  const launchs = [
    {
      key: 'fto',
      label: 'FTO Launch',
    },
    {
      key: 'meme',
      label: 'Pot2pump launch',
    },
  ];

  useEffect(() => {
    if (launchType) {
      setSelectedLaunch(launchType as LaunchType);
    }
  }, [launchType]);

  const handleLaunchTypeChange = (type: LaunchType) => {
    setSelectedLaunch(type);
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, launchType: type },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <div className="w-full md:p-6 md:max-w-full xl:max-w-[1200px] mx-auto">
      <div className="flex flex-col px-4 md:px-0 w-full md:w-[584px] lg:w-[900px] mx-auto">
        {/* <Dropdown>
          <DropdownTrigger>
            <NextButton variant="bordered" className="md:w-fit justify-between">
              {selectedLaunch.toUpperCase()} Launch
              <BiSolidDownArrow />
            </NextButton>
          </DropdownTrigger>
          <DropdownMenu
            className="w-[calc(100vw-48px)] md:w-auto min-w-[200px]"
            itemClasses={{
              base: "data-[hover=true]:bg-[#FFCD4D] data-[hover=true]:text-black",
            }}
          >
            {launchs
              .filter((launch) => launch.key !== selectedLaunch)
              .map((launch) => (
                <DropdownItem
                  key={launch.key}
                  onPress={() =>
                    handleLaunchTypeChange(launch.key as LaunchType)
                  }
                >
                  {launch.label}
                </DropdownItem>
              ))}
          </DropdownMenu>
        </Dropdown> */}
        <div className="flex items-center justify-center mt-4 md:mt-8">
          <MEMELaunchModal />
        </div>
      </div>
    </div>
  );
});

export default LaunchTokenPage;

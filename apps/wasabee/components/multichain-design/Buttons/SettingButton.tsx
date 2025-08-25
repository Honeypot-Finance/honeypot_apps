import { Button } from '@/components/algebra/ui/button';
import { Input } from '@/components/algebra/ui/input';
import { Switch } from '@/components/algebra/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/algebra/ui/popover';
import { Separator } from '@/components/algebra/ui/separator';
import Container from '../Container';
import { useUserState } from '@/lib/algebra/state/userStore';
import { Percent } from '@cryptoalgebra/sdk';
import SettingButtonIcon from './../assets/setting-button.svg';
import Image from 'next/image';
import { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '@nextui-org/react';
import { cn } from '@/lib/tailwindcss';

const Settings = () => {
  return (
    <Popover>
      <PopoverTrigger asChild className="p-3">
        <Image
          src={SettingButtonIcon}
          alt="setting"
          width={50}
          height={50}
          className="cursor-pointer hover:brightness-125"
        />
      </PopoverTrigger>
      <PopoverContent className="z-[9999] ">
        <Container className="flex-col gap-2 !bg-[#1F150A]">
          <div className="text-md font-sans">Transaction Settings</div>
          <Separator orientation={'horizontal'} className="bg-border" />
          <SlippageTolerance />
          <TransactionDeadline />
          <Multihop />
          <ExpertMode />
        </Container>
      </PopoverContent>
    </Popover>
  );
};

const SlippageTolerance = () => {
  const {
    slippage,
    actions: { setSlippage },
  } = useUserState();

  const [slippageInput, setSlippageInput] = useState('');
  const [slippageError, setSlippageError] = useState<boolean>(false);

  function parseSlippageInput(value: string) {
    setSlippageInput(value);
    setSlippageError(false);

    if (value.length === 0) {
      setSlippage('auto');
    } else {
      const parsed = Math.floor(Number.parseFloat(value) * 100);

      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 5000) {
        setSlippage('auto');
        if (value !== '.') {
          setSlippageError(true);
        }
      } else {
        setSlippage(new Percent(parsed, 10_000));
      }
    }
  }

  const tooLow =
    slippage !== 'auto' && slippage.lessThan(new Percent(5, 10_000));
  const tooHigh =
    slippage !== 'auto' && slippage.greaterThan(new Percent(1, 100));

  const slippageString = slippage !== 'auto' ? slippage.toFixed(2) : 'auto';

  return (
    <div className="flex flex-col gap-2">
      <div className="text-md text-md font-sans text-[#FFFFFF80]">
        Slippage Tolerance
      </div>
      <div className="flex gap-2">
        <Button
          variant={slippageString === 'auto' ? 'iconActive' : 'icon'}
          size={'sm'}
          onClick={() => parseSlippageInput('')}
          className={cn(
            'px-5 rounded-lg',
            slippageString === 'auto' ? 'bg-[#FB9A1B]' : 'bg-[#62411E]'
          )}
        >
          Auto
        </Button>
        <Button
          variant={slippageString === '0.10' ? 'iconActive' : 'icon'}
          size={'sm'}
          onClick={() => parseSlippageInput('0.10')}
          className={cn(
            'px-5 rounded-lg',
            slippageString === '0.1' ? 'bg-[#FB9A1B]' : 'bg-[#62411E]'
          )}
        >
          0.1%
        </Button>
        <Button
          variant={slippageString === '0.50' ? 'iconActive' : 'icon'}
          size={'sm'}
          onClick={() => parseSlippageInput('0.5')}
          className={cn(
            'px-5 rounded-lg',
            slippageString === '0.5' ? 'bg-[#FB9A1B]' : 'bg-[#62411E]'
          )}
        >
          0.5%
        </Button>
        <Button
          variant={slippageString === '1.00' ? 'iconActive' : 'icon'}
          size={'sm'}
          onClick={() => parseSlippageInput('1')}
          className={cn(
            'px-5 rounded-lg',
            slippageString === '1' ? 'bg-[#FB9A1B]' : 'bg-[#62411E]'
          )}
        >
          1%
        </Button>
        <div className="flex">
          <Input
            value={
              slippageInput.length > 0
                ? slippageInput
                : slippage === 'auto'
                ? ''
                : slippage.toFixed(2)
            }
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              parseSlippageInput(e.target.value)
            }
            onBlur={() => {
              setSlippageInput('');
              setSlippageError(false);
            }}
            className={`text-right border-none text-md font-semibold bg-[#271A0C] rounded-l-xl rounded-r-none w-[70px]`}
            placeholder={'0.0'}
          />
          <div className="bg-[#271A0C] text-sm p-2 pt-2.5 rounded-r-xl select-none">
            %
          </div>
        </div>
      </div>
      {slippageError || tooLow || tooHigh ? (
        <div>
          {slippageError ? (
            <div className="bg-red-900 text-red-200 px-2 py-1 rounded-lg">
              Enter a valid slippage percentage
            </div>
          ) : (
            <div className="bg-yellow-900 text-yellow-200 px-2 py-1 rounded-xl">
              {tooLow
                ? 'Your transaction may fail'
                : 'Your transaction may be frontrun'}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

const TransactionDeadline = () => {
  const {
    txDeadline,
    actions: { setTxDeadline },
  } = useUserState();

  const [deadlineInput, setDeadlineInput] = useState('');
  const [deadlineError, setDeadlineError] = useState<boolean>(false);

  function parseCustomDeadline(value: string) {
    setDeadlineInput(value);
    setDeadlineError(false);

    if (value.length === 0) {
      setTxDeadline(60 * 30);
    } else {
      try {
        const parsed: number = Math.floor(Number.parseFloat(value) * 60);
        if (!Number.isInteger(parsed) || parsed < 60 || parsed > 180 * 60) {
          setDeadlineError(true);
        } else {
          setTxDeadline(parsed);
        }
      } catch (error) {
        setDeadlineError(true);
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-md text-md font-sans text-[#FFFFFF80]">
        Transaction Deadline
      </div>
      <div className="flex">
        <Input
          placeholder={'30'}
          value={
            deadlineInput.length > 0
              ? deadlineInput
              : txDeadline === 180
              ? ''
              : (txDeadline / 60).toString()
          }
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            parseCustomDeadline(e.target.value)
          }
          onBlur={() => {
            setDeadlineInput('');
            setDeadlineError(false);
          }}
          color={deadlineError ? 'red' : ''}
          className={`text-left border-none text-md font-semibold bg-[#271A0C] rounded-l-xl rounded-r-none w-full`}
        />
        <div className="bg-[#271A0C] text-sm p-2 pt-2.5 rounded-r-xl select-none">
          minutes
        </div>
      </div>
    </div>
  );
};

const ExpertMode = () => {
  const {
    isExpertMode,
    actions: { setIsExpertMode },
  } = useUserState();

  return (
    <div className="flex flex-col gap-2 text-md font-sans">
      <div className="flex justify-between items-center gap-2 text-md">
        <label
          htmlFor="multihop"
          className="flex justify-center items-center text-[#FFFFFF80]"
        >
          Expert mode
          <Tooltip
            content="Advanced control over swap parameters such as price setting and gas management."
            className="flex justify-center items-center"
          >
            <InformationCircleIcon width={15} height={15} />
          </Tooltip>
        </label>
        <Switch
          id="expert-mode"
          checked={isExpertMode}
          onCheckedChange={setIsExpertMode}
          className="data-[state=checked]:bg-blue-500"
        />
      </div>
    </div>
  );
};

const Multihop = () => {
  const {
    isMultihop,
    actions: { setIsMultihop },
  } = useUserState();

  return (
    <div className="flex flex-col gap-2 text-md font-sans">
      <div className="flex justify-between items-center gap-2 text-md">
        <label
          htmlFor="multihop"
          className="flex justify-center items-center text-[#FFFFFF80]"
        >
          Multihop{' '}
          <Tooltip
            content="Optimized trades across multiple liquidity pools."
            className="flex justify-center items-center"
          >
            <InformationCircleIcon width={15} height={15} />
          </Tooltip>
        </label>
        <Switch
          id="multihop"
          checked={isMultihop}
          onCheckedChange={setIsMultihop}
          className="data-[state=checked]:bg-blue-500"
        />
      </div>
    </div>
  );
};

export default Settings;

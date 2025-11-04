import {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Price, Token } from '@cryptoalgebra/sdk';
import { useMintState } from '@/lib/algebra/state/mintStore';
import { Button } from '@/components/algebra/ui/button';
import { Input } from '@/components/algebra/ui/input';
import { cn } from '@/lib/utils';
import { debounce } from 'lodash';

export interface RangeSelectorPartProps {
  value: string;
  onUserInput: (value: string) => void;
  decrement: () => string;
  increment: () => string;
  decrementDisabled?: boolean;
  incrementDisabled?: boolean;
  label?: string;
  width?: string;
  locked?: boolean;
  initialPrice: Price<Token, Token> | undefined;
  disabled: boolean;
  title: string;
}

const RangeSelectorPart = ({
  value,
  decrement,
  increment,
  decrementDisabled = false,
  incrementDisabled = false,
  locked,
  onUserInput,
  disabled,
  title,
}: RangeSelectorPartProps) => {
  const [localUSDValue, setLocalUSDValue] = useState('');
  const [localTokenValue, setLocalTokenValue] = useState('');
  const handleUserInputDebounce = useMemo(
    () => debounce(onUserInput, 500),
    [onUserInput]
  );

  const {
    initialTokenPrice,
    actions: { updateSelectedPreset },
  } = useMintState();

  const handleOnBlur = useCallback(() => {
    onUserInput(localTokenValue);
  }, [localTokenValue, localUSDValue, onUserInput]);

  const handleDecrement = useCallback(() => {
    onUserInput(decrement());
  }, [decrement, onUserInput]);

  const handleIncrement = useCallback(() => {
    onUserInput(increment());
  }, [increment, onUserInput]);

  useEffect(() => {
    handleUserInputDebounce(localTokenValue);
  }, [localTokenValue]);

  useEffect(() => {
    if (value) {
      setLocalTokenValue(value);
      if (value === '∞') {
        setLocalUSDValue(value);
        return;
      }
    } else if (value === '') {
      setLocalTokenValue('');
      setLocalUSDValue('');
    }
  }, [initialTokenPrice, value]);

  return (
    <div className="flex-1 w-full flex flex-col gap-y-2 min-w-[200px]">
      <div className="flex items-center justify-between px-2 font-gliker">
        <span className="text-sm uppercase !text-white">{title}</span>
      </div>

      <div className="w-full h-[56px] rounded-lg border bg-[#271A0C] border-[#3B2712] flex items-center justify-between px-3 py-2 gap-x-2">
        <Button
          variant={'ghost'}
          onClick={handleDecrement}
          disabled={decrementDisabled || disabled}
          className="min-w-[36px] h-[36px] rounded-md bg-[#FFA931] hover:bg-[#FFB951] text-black border-none font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed"
        >
          -
        </Button>

        <Input
          type={'text'}
          value={localTokenValue}
          id={title}
          onBlur={handleOnBlur}
          disabled={disabled || locked}
          onUserInput={(v: SetStateAction<string>) => {
            setLocalTokenValue(v);
            updateSelectedPreset(null);
          }}
          placeholder={'0.00'}
          className={cn(
            'text-center',
            '!bg-transparent',
            '[&_*]:!bg-transparent',
            'data-[invalid=true]:!bg-transparent',
            'border-none',
            'text-white',
            'text-lg',
            'font-medium'
          )}
          classNames={{
            inputWrapper: cn(
              '!bg-transparent',
              'border-none',
              'shadow-none',
              '!transition-none',
              'data-[invalid=true]:!bg-transparent',
              'group-data-[invalid=true]:!bg-transparent',
              'px-2'
            ),
            input: cn(
              '!bg-transparent',
              '!text-white',
              'text-center',
              'text-lg',
              '!px-0',
              '[appearance:textfield]',
              '[&::-webkit-outer-spin-button]:appearance-none',
              '[&::-webkit-inner-spin-button]:appearance-none',
              'data-[invalid=true]:!bg-transparent'
            ),
          }}
        />

        <Button
          variant={'ghost'}
          onClick={handleIncrement}
          disabled={incrementDisabled || disabled}
          className="min-w-[36px] h-[36px] rounded-md bg-[#FFA931] hover:bg-[#FFB951] text-black border-none font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed"
        >
          +
        </Button>
      </div>
    </div>
  );
};

export default RangeSelectorPart;

import React from 'react';

import { cn } from '@nextui-org/theme';
import { HTMLAttributes } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';

export class SelectState {
  value: string | number | null = null;
  _onSelectChange: (value: string | number) => void = (
    value: string | number
  ) => {};
  onSelectChange(value: string | number) {
    this.value = value;
    this._onSelectChange(value);
  }
  constructor({ onSelectChange, ...args }: Partial<SelectState> = {}) {
    Object.assign(this, args);
    if (onSelectChange) {
      this._onSelectChange = onSelectChange;
    }
    makeAutoObservable(this);
  }
}

const SelectContext = React.createContext<SelectState>(new SelectState());

export const SelectItem = observer(
  ({
    children,
    value,
    className,
    ...props
  }: {
    children: React.ReactNode;
    value?: string | number;
  } & HTMLAttributes<any>) => {
    const selectState = React.useContext(SelectContext);
    return (
      <div
        className={cn(
          'flex h-[30px] px-[8px] flex-col justify-center items-center shrink-0 bg-[#271A0C] text-gray-300 border border-[#333333] rounded-2xl cursor-pointer text-xs hover:bg-[#F59E0B] hover:text-white hover:border-[#F59E0B] shadow-[0px_332px_93px_0px_rgba(0,0,0,0.00),0px_212px_85px_0px_rgba(0,0,0,0.01),0px_119px_72px_0px_rgba(0,0,0,0.05),0px_53px_53px_0px_rgba(0,0,0,0.09),0px_13px_29px_0px_rgba(0,0,0,0.10)]',
          selectState?.value === value
            ? 'bg-[#F59E0B] text-white border-[#F59E0B]'
            : '',
          className
        )}
        onClick={() => {
          value && selectState?.onSelectChange(value);
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export const ItemSelect = observer(
  ({
    children,
    selectState,
    className,
    ...props
  }: {
    children: React.ReactNode;
    selectState: SelectState;
  } & HTMLAttributes<any>) => {
    return (
      <SelectContext.Provider value={selectState}>
        <div
          className={cn('flex items-center gap-[8px]', className)}
          {...props}
        >
          {children}
        </div>
      </SelectContext.Provider>
    );
  }
);

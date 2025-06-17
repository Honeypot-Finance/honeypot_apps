import { cn } from '@nextui-org/theme';
import { InputProps, Input as NextInput } from '@nextui-org/react';
export const Input = ({ className, classNames, ...props }: InputProps) => {
  return (
    <NextInput
      className={cn('', className)}
      classNames={{
        inputWrapper: cn(
          'bg-transparent flex-1 data-[hover=true]:bg-transparent data-[focus=true]:!bg-transparent',
          classNames?.inputWrapper
        ),
        ...classNames,
      }}
      step={'any'}
      fullWidth
      isClearable={true}
      {...props}
    />
  );
};

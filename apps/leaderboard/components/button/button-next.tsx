import { cn } from '@nextui-org/theme';
import { ButtonProps, Button as NextButton } from '@nextui-org/react';

export const Button = ({
  children,
  className,
  isLoading,
  styleMode,
  ...props
}: {
  children: React.ReactNode;
  styleMode?: 'plain' | 'primary';
} & ButtonProps) => {
  const baseClassNames = cn(
    'border-5 border-black border-[#202020] rounded-lg bg-[#FFCD4D] text-black text-xs hover:bg-[#FFCD4D]/80 hover:border-black',
    className
  );
  return (
    <NextButton isLoading={isLoading} className={baseClassNames} {...props}>
      {children}
    </NextButton>
  );
};

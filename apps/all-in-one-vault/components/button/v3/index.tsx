import { Button as NextUIButton } from "@nextui-org/react";
import { cn } from "@/lib/utils";
import { ButtonProps } from "@nextui-org/react";

export interface HoneyButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export const Button = ({ 
  children, 
  className,
  ...props 
}: HoneyButtonProps) => {
  return (
    <NextUIButton
      className={cn(
        "rounded-[8px] border border-black bg-[#FFCD4D] text-[#202020]",
        "px-2 py-1 sm:px-4 sm:py-2",
        "text-xs sm:text-base",
        "shadow-[1px_1px_0px_0px_#000] hover:shadow-[1px_0.5px_0px_0px_#000] sm:shadow-[2px_2px_0px_0px_#000] sm:hover:shadow-[2px_1px_0px_0px_#000]",
        "hover:translate-y-[1px] active:translate-y-[1px] sm:hover:translate-y-[2px] sm:active:translate-y-[2px]",
        "active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed",
        "!min-w-fit",
        className
      )}
      {...props}
    >
      {children}
    </NextUIButton>
  );
};

export default Button;

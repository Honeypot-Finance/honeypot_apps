import Image from 'next/image';
import { ReactNode } from 'react';

import { cn } from '@nextui-org/theme';
import { LoadingDisplay } from '@/components/loading-display/loading-display';

interface HoneyContainerProps {
  empty?: boolean;
  loading?: boolean;
  bordered?: boolean;
  className?: string;
  children: ReactNode;
  topOffset?: boolean;
  loadingSize?: number;
  loadingText?: string;
  showTopBorder?: boolean;
  showBottomBorder?: boolean;
  variant?: 'default' | 'dark';
  type?: 'primary' | 'default';
}

function CardContainer({
  children,
  className,
  loadingText,
  empty = false,
  loading = false,
  bordered = true,
  type = 'primary',
  topOffset = false,
  loadingSize = 100,
  variant = 'default',
  showTopBorder = true,
  showBottomBorder = true,
}: HoneyContainerProps) {
  return (
    <div
      className={cn(
        'flex flex-col w-full gap-y-4 justify-center items-center rounded-2xl text-[#202020]',
        type === 'primary'
          ? 'bg-[#FFCD4D]'
          : bordered
          ? 'border-3 border-[#F2C34A] bg-transparent'
          : 'bg-transparent',
        bordered &&
          [
            'px-2 sm:px-4 md:px-8 bg-repeat-x',
            showTopBorder && showBottomBorder
              ? [
                  'py-12 sm:py-20',
                  'bg-[length:auto_40px,auto_40px] sm:bg-[length:auto_70px,auto_70px]',
                  topOffset
                    ? `bg-[position:-65px_top,left_bottom]`
                    : `bg-[position:left_top,left_bottom]`,
                  variant === 'default'
                    ? "bg-[url('/images/card-container/honey/honey-border.png'),url('/images/card-container/dark/bottom-border.svg')]"
                    : "bg-[url('/images/card-container/dark/top-border.svg'),url('/images/card-container/dark/bottom-border.svg')]",
                ]
              : showTopBorder
              ? [
                  'pt-12 sm:pt-20 pb-2 sm:pb-4',
                  'bg-[length:auto_40px] sm:bg-[length:auto_70px]',
                  topOffset
                    ? `bg-[position:-65px_top]`
                    : `bg-[position:left_top]`,
                  variant === 'default'
                    ? "bg-[url('/images/card-container/honey/honey-border.png')]"
                    : "bg-[url('/images/card-container/dark/top-border.svg')]",
                ]
              : showBottomBorder
              ? [
                  'pb-12 sm:pb-20 pt-2 sm:pt-4',
                  'bg-left-bottom',
                  'bg-[length:auto_40px] sm:bg-[length:auto_70px]',
                  "bg-[url('/images/card-container/dark/bottom-border.svg')]",
                ]
              : 'py-2 sm:py-4',
          ]
            .flat()
            .filter(Boolean)
            .join(' '),
        className
      )}
    >
      {loading ? (
        <LoadingDisplay size={loadingSize} text={loadingText} />
      ) : empty ? (
        <div className="flex flex-col justify-center items-center min-h-[200px] space-y-5">
          <Image
            width={100}
            height={100}
            alt="No Data"
            src={'/images/honey-stick.svg'}
          />
          <p className="text-[#FFCD4D] text-5xl">No Data</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export default CardContainer;

import Image from 'next/image';
import { ReactNode } from 'react';

import { cn } from '@nextui-org/theme';
import { LoadingDisplay } from '@/components/LoadingDisplay/LoadingDisplay';

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
        'flex flex-col w-full gap-y-4 justify-center items-center rounded-2xl text-white',
        type === 'primary'
          ? 'bg-[#140D06] border border-[#333333]'
          : bordered
          ? 'bg-[#140D06] border border-[#333333]'
          : 'bg-[#140D06]',
        bordered && 'px-2 sm:px-4 md:px-8 py-4 sm:py-6',
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

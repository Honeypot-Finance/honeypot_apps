import { cn } from '@nextui-org/theme';
import { ReactNode } from 'react';

interface HoneyContainerProps {
  children: ReactNode;
  bordered?: boolean;
  borderHeight?: string;
  bottomHeight?: string;
  variant?: 'dense' | 'wide';
  className?: string;
  noNoneyDrop?: boolean;
}

export function HoneyContainer({
  children,
  className,
  bordered = true,
  variant = 'wide',
  borderHeight = '40px',
  bottomHeight = borderHeight,
  noNoneyDrop = false,
}: HoneyContainerProps) {
  return (
    <div className={cn('w-full h-full @container', className)}>
      <div
        className={cn(
          'flex flex-col h-full w-full gap-y-4 justify-center items-center bg-[#140D06] rounded-2xl text-white border border-[#333333]',
          bordered && 'px-4 py-6'
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default HoneyContainer;

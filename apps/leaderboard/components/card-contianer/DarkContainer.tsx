import { cn } from '@nextui-org/theme';
import { ReactNode } from 'react';

interface DarkContainerProps {
  children: ReactNode;
  className?: string;
  borderHeight?: string;
}

export function DarkContainer({
  children,
  className,
  borderHeight = '24px',
}: DarkContainerProps) {
  return (
    <div className={cn('w-full @container', className)}>
      <div
        style={
          {
            '--dark-container-border-height': borderHeight,
          } as React.CSSProperties
        }
        className={cn(
          'w-full bg-[#FFCD4D] rounded-2xl overflow-hidden px-4 py-6',
          "bg-[url('/images/card-container/dark/top-border.svg'),_url('/images/card-container/dark/bottom-border.svg')]",
          'bg-[position:left_top,_left_calc(100%+1px)]',
          'bg-[size:auto_var(--dark-container-border-height)]',
          'bg-repeat-x bg-clip-padding'
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default DarkContainer;

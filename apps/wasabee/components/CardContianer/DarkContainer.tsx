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
          'w-full bg-[#140D06] rounded-2xl overflow-hidden px-2 md:px-4 py-6',
          'border border-[#333333]'
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default DarkContainer;

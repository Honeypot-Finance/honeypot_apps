import React from 'react';
import { cn } from '@/lib/tailwindcss';

interface Layer2ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Layer2Container: React.FC<Layer2ContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn('layer2-container', className)}
      style={{
        maxWidth: '100%',
        height: '100%',
        borderRadius: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        opacity: 1,
        background: '#271A0C',
      }}
    >
      {children}
    </div>
  );
};

export default Layer2Container;

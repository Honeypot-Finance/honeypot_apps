import React from 'react';
import { cn } from '@/lib/tailwindcss';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div
      className={cn('container-wrapper', className)}
      style={{
        width: '100%',
        maxWidth: '100%',
        height: '100%',
        borderRadius: '25.07px',
        border: '0.84px solid rgba(255, 255, 255, 0.2)',
        gap: '4.18px',
        opacity: 1,
        paddingTop: '15px',
        paddingRight: '15px',
        paddingBottom: '15px',
        paddingLeft: '15px',
        background: '#140D06',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  );
};

export default Container;

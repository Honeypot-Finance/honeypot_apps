import { NextPage } from 'next';
import { FC, ReactElement, ReactNode } from 'react';

export type NextLayoutPage<P = object, IP = P> = NextPage<P, IP> & {
  Layout?: FC<{ children: ReactNode; className?: string }>;
};

export type LayoutProps = {
  children: ReactNode;
  className?: string;
};

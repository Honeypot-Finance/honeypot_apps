import { AppProps } from "next/app";

export type NextLayoutPage = AppProps["Component"] & {
  Layout?: (props: { children: React.ReactNode } & React.BaseHTMLAttributes<'div'>) => JSX.Element;
};

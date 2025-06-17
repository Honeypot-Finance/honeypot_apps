import { cn } from '@nextui-org/theme';

// TODO: merge rocket and pedding svg

export const PeddingSvg = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn('animate-spin', className)}
      width="100"
      height="100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
    >
      <path
        d="M3.439 44.623C1.722 44.425.48 42.869.786 41.168a50 50 0 1 1 7.574 36.51c-.957-1.44-.437-3.36 1.06-4.224 1.496-.865 3.4-.346 4.37 1.085a43.742 43.742 0 1 0-6.773-32.65c-.32 1.698-1.861 2.932-3.578 2.734Z"
        fill="#181C2D"
      />
      <path
        d="M3.439 44.623c-1.717-.198-3.28 1.033-3.37 2.759A50 50 0 1 0 40.159.978c-1.695.34-2.687 2.065-2.241 3.735.445 1.67 2.16 2.651 3.857 2.326A43.742 43.742 0 1 1 6.3 48.101c.075-1.727-1.144-3.28-2.861-3.478Z"
        fill="#F7931A"
      />
      <path
        d="M3.439 44.623c-1.717-.198-3.28 1.033-3.37 2.759A50 50 0 1 0 40.159.978c-1.695.34-2.687 2.065-2.241 3.735.445 1.67 2.16 2.651 3.857 2.326A43.742 43.742 0 1 1 6.3 48.101c.075-1.727-1.144-3.28-2.861-3.478Z"
        fill="url(#a)"
      />
      <defs>
        <linearGradient
          id="a"
          x1="46.154"
          y1="-32.5"
          x2="46.154"
          y2="132.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".401" stopColor="#E8D37C" stopOpacity=".13" />
          <stop offset="1" stopColor="#FCD729" />
        </linearGradient>
      </defs>
    </svg>
  );
};

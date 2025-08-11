import { nextui } from '@nextui-org/react';
import { textStrokePlugin } from './styles/text-stroke';
import { textShadowPlugin } from './styles/text-shadow';

const config = {
  corePlugins: {
    // Disable `:has()` variant
    has: false,
  },
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './services/**/*.{js,ts}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.css',
    '../../libs/shared/hpot-sdk/src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      size: {
        4.5: '1.125rem',
      },
      colors: {
        'gold-primary': '#F59E0B',
        'amber-primary': '#F59E0B',
        'amber-hover': '#DC8A09',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      fontSize: {
        ss: ['0.8125rem', '1.125rem'],
      },
      fontFamily: {
        display: 'Oswald, ui-serif',
        gliker: ['Gliker', 'sans-serif'],
        'bebas-neue': ['var(--bebas-neue)', 'sans-serif'],
        inter: ['var(--inter)', 'sans-serif'],
      },
      backgroundColor: {
        default: '#140D06',
        'dark-primary': '#140D06',
        'dark-secondary': '#271A0C',
        'dark-card': '#271A0C',
      },
      textColor: {
        default: 'white',
        sub: 'rgba(255,255,255,0.50)',
      },
      outlineColor: {
        base: 'var(--button-stroke,rgba(247,147,26,0.20))',
      },
      boxShadow: {
        button: '1.5px 1.5px 0px 0px #000',
        field:
          '0px 332px 93px 0px rgba(0, 0, 0, 0.00), 0px 212px 85px 0px rgba(0, 0, 0, 0.01), 0px 119px 72px 0px rgba(0, 0, 0, 0.05), 0px 53px 53px 0px rgba(0, 0, 0, 0.09), 0px 13px 29px 0px rgba(0, 0, 0, 0.10)',
      },
      keyframes: {
        'flip-out': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-100%)', opacity: '0' },
        },
        'flip-in': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        breath: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'flip-out': 'flip-out 0.15s ease-out',
        'flip-in': 'flip-in 0.15s ease-out',
        breath: 'breath 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
      },
    },
  },
  darkMode: ['class', 'class'],
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/container-queries'),
    require('tailwind-scrollbar')({ nocompatible: true }),
    nextui({
      defaultTheme: "dark",
      themes: {
        dark: {
          colors: {
            background: '#140D06',
            foreground: '#ffffff',
            primary: {
              DEFAULT: '#F59E0B',
              50: '#FEF3E2',
              100: '#FDE8C5',
              200: '#FCD08B',
              300: '#FAB951',
              400: '#F9A217',
              500: '#F59E0B',
              600: '#DC8A09',
              700: '#A36607',
              800: '#6A4305',
              900: '#311F02',
              foreground: '#ffffff',
            },
            focus: '#F59E0B',
            content1: '#271A0C',
            content2: '#333333',
            content3: '#4a4a4a',
            content4: '#5a5a5a',
            default: {
              50: '#1a1a1a',
              100: '#2a2a2a',
              200: '#333333',
              300: '#4a4a4a',
              400: '#5a5a5a',
              500: '#6a6a6a',
              600: '#7a7a7a',
              700: '#8a8a8a',
              800: '#9a9a9a',
              900: '#aaaaaa',
            },
          },
        },
      },
    }),
    textStrokePlugin,
    textShadowPlugin,
  ],
};

export default config;

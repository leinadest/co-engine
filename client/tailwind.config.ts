import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    extend: {
      colors: {
        primary: '#1D4ED8', // Use in primary elements: buttons, links, headers
        primaryLight: '#6366F1', // Use to accent primary elements
        secondary: '#9333EA', // Use to complement and support primary
        success: '#10B981', // Use for success notifications or messages
        error: '#EF4444', // Use for error notifications or messages
        warning: '#F59E0B', // Use for cautionary notifications or messages
        info: '#3B82F6', // Use for informational messages or alerts
        backgroundPrimary: '#F9FAFB', // Use as a neutral color for background
        backgroundSecondary: '#F3F4F6', // Use as a neutral color for background
        textPrimary: '#111827', // Use for headings
        textSecondary: '#374151', // Use for body text
        border: '#D1D5DB', // Use around cards, inputs, or containers
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      // lineHeight: {
      //   none: '1',
      //   shorter: '1.25',
      //   short: '1.375',
      //   base: '1.5',
      //   tall: '1.625',
      //   taller: '2',
      // },
      maxWidth: {
        '2xl': '40rem',
        '3xl': '48rem',
        '4xl': '56rem',
        '5xl': '64rem',
        '6xl': '72rem',
      },
      // screens: {
      //   sm: '640px',
      //   md: '768px',
      //   lg: '1024px',
      //   xl: '1280px',
      //   '2xl': '1536px',
      // },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;

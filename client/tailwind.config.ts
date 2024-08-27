import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'selector',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    extend: {
      colors: {
        primary: { DEFAULT: '#1D4ED8', dark: '#B82E0D' }, // Use in primary elements: buttons, links, headers
        primaryLight: '#6366F1', // Use to accent primary elements
        secondary: '#9333EA', // Use to complement and support primary
        success: '#10B981', // Use for success notifications or messages
        error: '#EF4444', // Use for error notifications or messages
        warning: '#F59E0B', // Use for cautionary notifications or messages
        info: '#3B82F6', // Use for informational messages or alerts
        bgPrimary: { DEFAULT: '#F9FAFB', dark: '#111827' }, // Use as a neutral color for background
        bgSecondary: { DEFAULT: '#F3F4F6', dark: '#1F2937' }, // Use as a neutral color for background
        bgSecondaryDark: { DEFAULT: '#E5E7EB', dark: '#374151' }, // Use as a darker color for background
        textPrimary: { DEFAULT: '#111827', dark: '#E9EAEB' }, // Use for headings
        textSecondary: { DEFAULT: '#374151', dark: '#D3D4D6' }, // Use for body text
        border: { DEFAULT: '#D1D5DB', dark: '#374151' }, // Use around cards, inputs, or containers
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      maxWidth: {
        '2xl': '40rem',
        '3xl': '48rem',
        '4xl': '56rem',
        '5xl': '64rem',
        '6xl': '72rem',
      },
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

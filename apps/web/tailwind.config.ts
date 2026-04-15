import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFEFE6',
          100: '#FFEFE6',
          200: '#FFD3BA',
          300: '#FAB38B',
          400: '#EF8E58',
          500: '#E67635',
          600: '#C65D21',
          700: '#AB4E19',
          800: '#8C3D10',
          900: '#77340D',
          950: '#572508',
        },
        ink: {
          50: '#F7F7F7',
          100: '#F7F7F7',
          200: '#E1E1E1',
          300: '#CFCFCF',
          400: '#B1B1B1',
          500: '#9E9E9E',
          600: '#7E7E7E',
          700: '#626262',
          800: '#515151',
          900: '#383838',
          950: '#222222',
        },
      },
      fontFamily: {
        ui: ['"IBM Plex Sans"', 'Inter', 'system-ui', 'sans-serif'],
        content: ['"Crimson Pro"', 'Georgia', 'serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        brand: '0 4px 20px rgba(230, 118, 53, 0.25)',
        glass: '0 4px 24px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;

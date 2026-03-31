import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D3269',
          light: '#93A3CF',
          lighter: '#F3F3F4',
        },
        success: '#069005',
        danger: '#DD1803',
        dark: '#0D0002',
      },
      fontFamily: {
        sans: ['Tajawal', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

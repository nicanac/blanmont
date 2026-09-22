import type { Config } from "tailwindcss";

import aspectRatio from '@tailwindcss/aspect-ratio';
import forms from '@tailwindcss/forms';

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#e03e3e',   // Matches MUI Theme Primary
          secondary: '#15803d', // Matches Green Theme
        }
      }
    },
  },
  plugins: [
    aspectRatio,
    forms,
  ],
};

export default config;

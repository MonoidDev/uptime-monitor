const config = {
  mode: 'jit', // Workaround typing
  purge: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/data/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#cc2222',
        'primary-dark': '#2D2D35',
        secondary: '#D2A0A0',
        'secondary-dark': '#2D2D35',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
} as const;

module.exports = config;
export default config;

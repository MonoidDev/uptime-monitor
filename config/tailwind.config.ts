const config = {
  mode: 'jit', // Workaround typing
  purge: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#1F6659',
        'primary-dark': '#233735',
        secondary: '#1F6659',
        'secondary-dark': '#233735',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
} as const;

export = config; // To work with nodejs, compiles to module.exports = config;

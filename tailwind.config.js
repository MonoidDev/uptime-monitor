module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/data/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'media',
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
}
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './frontend/screens/**/*.{js,jsx,ts,tsx}',
    './frontend/components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontWeight: {
        hairline: '100',
        thin: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      // fontFamily: {
      //   poppins: ['Poppins', 'sans-serif'],
      //   'arial-rounded': ['ArialRoundedMTBold', 'Arial', 'sans-serif'],
      // },

      boxShadow: {
        'custom-lg': '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};

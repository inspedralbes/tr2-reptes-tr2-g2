/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00426B', // Pantone 7694 C / 541 U
        },
        // Colores Complementarios
        'light-blue': '#4197CB', // Pantone 7688 C / 7688 U
        'light-gray': '#CFD2D3', // Pantone 427 C / Cool Grey 1 U
        'pink-red': '#F26178',   // Pantone 709 C / 709 U
        beige: '#E0C5AC',        // Pantone 4685 C / 4685 U
        yellow: '#F9C311',
      },
      fontFamily: {
        sans: ['Arial', 'sans-serif'], // Para documentos editables
        corporate: ['Helvetica Neue', 'sans-serif'], // Para uso corporativo
      },
      fontSize: {
        'xs': '14px',
        'sm': '16px',
        'base': '18px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '30px',
        '3xl': '36px',
      },
    },
  },
  plugins: [],
};

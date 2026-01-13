/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Colores Corporativos
        primary: {
          DEFAULT: '#00426B', // Pantone 7694 C / 541 U
        },
        // Colores Complementarios
        'light-blue': '#4197CB', // Pantone 7688 C / 7688 U
        'light-gray': '#CFD2D3', // Pantone 427 C / Cool Grey 1 U
        'pink-red': '#F26178',   // Pantone 709 C / 709 U
        beige: '#E0C5AC',        // Pantone 4685 C / 4685 U
      },
      fontFamily: {
        // En React Native, 'Helvetica Neue' y 'Arial' pueden requerir configuración
        // específica para cargar fuentes personalizadas si no son del sistema.
        // Se recomienda usar 'sans' como fallback para asegurar compatibilidad.
        // Para Helvetica Neue, puedes necesitar cargar los diferentes pesos (Light, Regular, Bold).
        sans: ['Arial', 'sans-serif'], // Para documentos editables
        corporate: ['Helvetica Neue', 'sans-serif'], // Para uso corporativo
      },
    },
  },
  plugins: [],
};

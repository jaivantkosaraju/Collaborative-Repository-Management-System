// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // or 'media' for system preference
  theme: {
    extend: {
      colors: {
        gray: {
          750: '#2d3748', // Custom color between gray-700 and gray-800
        },
        brand: {
          dark: '#0A0F1C',
          card: '#111827',
          border: '#1E293B',
        }
      },
    },
  },
  plugins: [],
}

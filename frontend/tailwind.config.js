/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0D0D0D',
        primaryOrange: '#FF8C00',
        activeOrange: '#E67E00',
        cardBg: '#1A1A1A',
        neonAccent: '#FF8C00',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './app/**/*.{ts,tsx,js,jsx}',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // POWLAX colors
        'powlax-blue': '#3B4AA8',
        'powlax-gray': '#383535',
        // Drill categories
        'category-skill': '#90EE90',
        'category-competition': '#FFA500',
        'category-gameplay': '#87CEEB',
        'category-team': '#FFE4B5',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
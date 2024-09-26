/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}', // Ensure you're scanning Vue files for Tailwind classes
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
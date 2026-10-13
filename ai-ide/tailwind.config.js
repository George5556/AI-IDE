/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0d1117',
        neon: {
          blue: '#00f3ff',
          pink: '#ff00ff',
          green: '#00ff00',
        },
      },
    },
  },
  plugins: [],
}

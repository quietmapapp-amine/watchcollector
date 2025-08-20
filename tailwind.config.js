/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B1220',
        },
        graphite: {
          900: '#1C1F26',
        },
        steel: {
          500: '#A7B0B7',
        },
        champagne: '#E8D9B5',
        'accent-green': '#2E7D32',
        'accent-blue': '#1E3A8A',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'dm-serif': ['DM Serif Display', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
      },
      spacing: {
        '12': '3rem',
        '20': '5rem',
      },
      boxShadow: {
        'glassy': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}


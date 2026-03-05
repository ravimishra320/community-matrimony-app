module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFD700',
        secondary: '#F5F5F5',
        dark: '#1A1A1A',
        gray: {
          light: '#F8F8F8',
          medium: '#E0E0E0',
          dark: '#666666'
        }
      },
      borderRadius: {
        'card': '20px'
      }
    },
  },
  plugins: [],
}

// 🔐 APA-HARDENED Tailwind Config — v3 Stable
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#B15EFF',
        secondary: '#7E30E1',
        accent: '#00F0FF',
        neutral: {
          100: '#F8F9FB',
          900: '#1F1F1F',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

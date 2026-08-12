/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#090d16',      // Obsidian dark background
        cardBg: 'rgba(17, 25, 40, 0.75)', // Glassmorphic card background
        cardBorder: 'rgba(255, 255, 255, 0.08)',
        indigoAccent: '#6366f1', // Indigo primary glow
        emeraldAccent: '#10b981', // Success/ongoing
        roseAccent: '#f43f5e',    // Deadlines/cancel
        amberAccent: '#f59e0b',   // Winner achievement
        cyanAccent: '#06b6d4'     // Hybrid/domain/tech
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 20px rgba(99, 102, 241, 0.2)',
        glowEmerald: '0 0 20px rgba(16, 185, 129, 0.2)',
        glowAmber: '0 0 20px rgba(245, 158, 11, 0.2)'
      }
    },
  },
  plugins: [],
}

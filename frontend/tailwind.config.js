/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: 'var(--bg-primary)',
        cardBg: 'var(--bg-card)',
        cardBorder: 'var(--color-card-border)',
        indigoAccent: '#6366f1',
        emeraldAccent: '#10b981',
        roseAccent: '#f43f5e',
        amberAccent: '#f59e0b',
        cyanAccent: '#06b6d4',
        violetAccent: '#8b5cf6',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
        outfit: ['Outfit', 'Poppins', 'sans-serif'],
        poppins: ['Poppins', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'xs':   ['0.8125rem', { lineHeight: '1.5' }],   // 13px
        'sm':   ['0.9375rem', { lineHeight: '1.6' }],   // 15px
        'base': ['1.0625rem', { lineHeight: '1.65' }],  // 17px
        'lg':   ['1.1875rem', { lineHeight: '1.6' }],   // 19px
        'xl':   ['1.3125rem', { lineHeight: '1.5' }],   // 21px
        '2xl':  ['1.5625rem', { lineHeight: '1.4' }],   // 25px
        '3xl':  ['1.9375rem', { lineHeight: '1.3' }],   // 31px
        '4xl':  ['2.3125rem', { lineHeight: '1.2' }],   // 37px
      },
      boxShadow: {
        'glow':         '0 0 20px rgba(99, 102, 241, 0.25)',
        'glow-sm':      '0 0 10px rgba(99, 102, 241, 0.15)',
        'glow-lg':      '0 0 40px rgba(99, 102, 241, 0.3)',
        'glowEmerald':  '0 0 20px rgba(16, 185, 129, 0.2)',
        'glowAmber':    '0 0 20px rgba(245, 158, 11, 0.2)',
        'glowCyan':     '0 0 20px rgba(6, 182, 212, 0.2)',
        'glowViolet':   '0 0 20px rgba(139, 92, 246, 0.2)',
        'card':         '0 4px 24px -4px rgba(99, 102, 241, 0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'card-hover':   '0 12px 40px -8px rgba(99, 102, 241, 0.18), 0 4px 16px rgba(0,0,0,0.06)',
        'inner-glow':   'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0.3)' },
          '50%':      { boxShadow: '0 0 20px 6px rgba(99,102,241,0.15)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        cardEntrance: {
          from: { opacity: '0', transform: 'translateY(18px) scale(0.97)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'shimmer':      'shimmer 3s linear infinite',
        'float':        'float 3s ease-in-out infinite',
        'glow-pulse':   'glowPulse 2s ease-in-out infinite',
        'slide-in-left':'slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in':     'scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'card-entrance':'cardEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'gradient':     'gradientShift 4s ease infinite',
      },
      backgroundSize: {
        '200': '200% auto',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}

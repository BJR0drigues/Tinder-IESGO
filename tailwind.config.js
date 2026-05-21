/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens — Tinder IESGO
        coral:   '#F07070',
        purple:  '#A06090',
        navy:    '#304080',
        deep:    '#080510',
        surface: {
          DEFAULT:   '#0f0d1a',
          secondary: '#1a1728',
          tertiary:  '#241f35',
          input:     '#1e1a2e',
          border:    '#2e2a42',
        },
        // Semantic
        brand: {
          50:  '#fdf2f2',
          100: '#fce4e4',
          400: '#f38888',
          500: '#F07070',
          600: '#d85a5a',
          700: '#b84444',
        },
      },
      fontFamily: {
        sans:    ['var(--font-outfit)', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand':    'linear-gradient(135deg, #F07070 0%, #A06090 100%)',
        'gradient-full':     'linear-gradient(135deg, #F07070 0%, #A06090 50%, #304080 100%)',
        'gradient-radial':   'radial-gradient(ellipse at center, #1a1728 0%, #080510 100%)',
        'gradient-progress': 'linear-gradient(90deg, #F07070 0%, #A06090 100%)',
      },
      boxShadow: {
        'glow-coral':  '0 0 20px rgba(240, 112, 112, 0.35)',
        'glow-purple': '0 0 20px rgba(160, 96, 144, 0.35)',
        'card':        '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in':     'fadeIn 0.3s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'slide-down':  'slideDown 0.4s ease-out',
        'scale-in':    'scaleIn 0.3s ease-out',
        'orbit':       'orbit 4s linear infinite',
        'pulse-glow':  'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' },                          to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        orbit:     { from: { transform: 'rotate(0deg)' },              to: { transform: 'rotate(360deg)' } },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(240, 112, 112, 0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(240, 112, 112, 0.6)' },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.h-screen-real':     { height: '100vh', '@supports (height: 100dvh)': { height: '100dvh' } },
        '.min-h-screen-real': { 'min-height': '100vh', '@supports (min-height: 100dvh)': { 'min-height': '100dvh' } },
      });
    },
  ],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blossom: {
          cream: '#FDF8F5',
          petal: '#F9EEE7',
          blush: '#F2D5C8',
          rose: '#E8B4B8',
          mauve: '#C07B8E',
          wine: '#8B3A52',
          burgundy: '#6B2B3E',
          plum: '#4A1628',
          peach: '#F0A896',
          apricot: '#EE8B6F',
          gold: '#D4A853',
          sage: '#9CAF88',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'count-up': 'count-up 0.8s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backgroundImage: {
        'blossom-gradient': 'linear-gradient(135deg, #FDF8F5 0%, #F9EEE7 25%, #F2D5C8 50%, #E8B4B8 75%, #C07B8E 100%)',
        'hero-gradient': 'linear-gradient(160deg, #FDF8F5 0%, #F9EEE7 40%, #F2D5C8 70%, #E8B4B8 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,238,231,0.8) 100%)',
        'wine-gradient': 'linear-gradient(135deg, #8B3A52 0%, #6B2B3E 50%, #4A1628 100%)',
        'warm-gradient': 'linear-gradient(135deg, #F0A896 0%, #E8B4B8 50%, #C07B8E 100%)',
      },
      boxShadow: {
        'blossom': '0 4px 30px rgba(139, 58, 82, 0.08), 0 1px 3px rgba(139, 58, 82, 0.05)',
        'blossom-lg': '0 10px 60px rgba(139, 58, 82, 0.12), 0 4px 20px rgba(139, 58, 82, 0.08)',
        'card': '0 2px 20px rgba(139, 58, 82, 0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
        'neumorphic': '6px 6px 12px rgba(192, 123, 142, 0.15), -6px -6px 12px rgba(255, 255, 255, 0.9)',
        'glass': '0 8px 32px rgba(139, 58, 82, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

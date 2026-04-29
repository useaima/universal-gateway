/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        defi: {
          dark: '#0B0E14',
          darkSoft: '#11151d',
          surface: '#18140f',
          surfaceAlt: '#221b14',
          surfaceHover: '#2b2218',
          glass: 'rgba(211, 190, 151, 0.08)',
          beige: '#d7c4a5',
          cream: '#f2e9dc',
          gold: '#cfa95d',
          goldBright: '#f1cc7a',
          amber: '#f59e0b',
          emerald: '#10b981',
          crimson: '#ef4444',
          muted: '#9ca3af',
          mutedSoft: '#6b7280',
          border: 'rgba(215, 196, 165, 0.16)',
          borderStrong: 'rgba(215, 196, 165, 0.28)',
          ink: '#050505',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-soft': 'float-soft 6s ease-in-out infinite',
        'sheen': 'sheen 2.8s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 10px rgba(207,169,93,0.22))' },
          '50%': { opacity: .75, filter: 'drop-shadow(0 0 24px rgba(241,204,122,0.35))' },
        },
        'float-soft': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'sheen': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      }
    },
  },
  plugins: [],
}

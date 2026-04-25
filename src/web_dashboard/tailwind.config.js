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
          dark: '#0B0E14',      // Deep background
          surface: '#151A22',   // Card background
          surfaceHover: '#1A212B',
          accent: '#8B5CF6',    // Violet primary
          accentGlow: 'rgba(139, 92, 246, 0.4)',
          emerald: '#10B981',   // Success/Green accent
          muted: '#64748B',     // Secondary text
          border: '#1E293B',    // Border color
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Space Grotesk', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 10px rgba(139,92,246,0.3))' },
          '50%': { opacity: .7, filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.6))' },
        }
      }
    },
  },
  plugins: [],
}

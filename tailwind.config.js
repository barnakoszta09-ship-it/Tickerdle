export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'terminal-bg': '#0d0d0d',
        'terminal-surface': '#1a1a1a',
        'terminal-border': '#2a2a2a',
        'terminal-text': '#e5e5e5',
        'terminal-muted': '#737373',
        'correct': '#22c55e',
        'correct-muted': '#166534',
        'partial': '#eab308',
        'partial-muted': '#a16207',
        'wrong': '#404040',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Consolas', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'flip': 'flip 0.5s ease-in-out',
        'bounce-sm': 'bounce-sm 0.15s ease-in-out',
        'shake': 'shake 0.5s ease-in-out',
        'pop': 'pop 0.1s ease-in-out',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateX(0deg)' },
          '50%': { transform: 'rotateX(90deg)' },
          '100%': { transform: 'rotateX(0deg)' },
        },
        'bounce-sm': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

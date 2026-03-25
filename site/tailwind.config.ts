import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        'background-secondary': '#0f0f1a',
        'background-tertiary': '#13131f',
        foreground: '#e2e8f0',
        'foreground-muted': '#94a3b8',
        cyan: {
          DEFAULT: '#00d4ff',
          50: '#f0fbff',
          100: '#e0f7ff',
          200: '#b9eeff',
          300: '#7de4ff',
          400: '#38d3ff',
          500: '#00d4ff',
          600: '#00a8d4',
          700: '#0083a8',
          800: '#006b8a',
          900: '#005570',
        },
        purple: {
          DEFAULT: '#7c3aed',
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        glow: {
          cyan: 'rgba(0, 212, 255, 0.15)',
          purple: 'rgba(124, 58, 237, 0.15)',
          'cyan-strong': 'rgba(0, 212, 255, 0.4)',
          'purple-strong': 'rgba(124, 58, 237, 0.4)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'pulse-glow-purple': 'pulseGlowPurple 2s ease-in-out infinite',
        typing: 'typing 3.5s steps(40, end)',
        'blink-caret': 'blinkCaret 0.75s step-end infinite',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'spin-slow': 'spin 20s linear infinite',
        'spin-slower': 'spin 35s linear infinite',
        'spin-reverse': 'spinReverse 25s linear infinite',
        orbit: 'orbit 15s linear infinite',
        'draw-line': 'drawLine 2s ease-out forwards',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(0, 212, 255, 0.6), 0 0 80px rgba(0, 212, 255, 0.2)',
          },
        },
        pulseGlowPurple: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.3), 0 0 40px rgba(124, 58, 237, 0.1)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(124, 58, 237, 0.6), 0 0 80px rgba(124, 58, 237, 0.2)',
          },
        },
        typing: {
          from: { width: '0' },
          to: { width: '100%' },
        },
        blinkCaret: {
          'from, to': { borderColor: 'transparent' },
          '50%': { borderColor: '#00d4ff' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(30px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        spinReverse: {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        orbit: {
          from: { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          to: { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
        drawLine: {
          from: { strokeDashoffset: '1000' },
          to: { strokeDashoffset: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glow-cyan': 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
        'glow-purple': 'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
        'mesh-gradient':
          'radial-gradient(at 40% 20%, rgba(124, 58, 237, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(0, 212, 255, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(124, 58, 237, 0.1) 0px, transparent 50%)',
        shimmer: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.1), transparent)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(0, 212, 255, 0.3)',
        glow: '0 0 20px rgba(0, 212, 255, 0.4)',
        'glow-lg': '0 0 40px rgba(0, 212, 255, 0.4)',
        'glow-purple-sm': '0 0 10px rgba(124, 58, 237, 0.3)',
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.4)',
        'glow-purple-lg': '0 0 40px rgba(124, 58, 237, 0.4)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}

export default config

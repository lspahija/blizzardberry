/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F43F5E',
          dark: '#E11D48',
        },
        secondary: {
          DEFAULT: '#3B82F6',
          dark: '#1D4ED8',
        },
        brand: {
          DEFAULT: '#E11D48',
          dark: '#F43F5E',
        },
        success: '#10b981',
        danger: '#E11D48',
        warning: '#d97706',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
        'gradient-brand': 'linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-background': 'linear-gradient(135deg, #F9FAFB 0%, #FEF2F2 50%, #FFF1F2 100%)',
      },
      boxShadow: {
        'soft': '0 30px 60px rgba(244, 63, 94, 0.12)',
        'medium': '0 10px 30px rgba(244, 63, 94, 0.15)',
        'hard': '0 30px 60px rgba(244, 63, 94, 0.2)',
      },
      animation: {
        'fast': '0.3s ease-out',
        'normal': '0.6s ease-out',
        'slow': '0.8s ease-out',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      borderRadius: {
        'small': '8px',
        'medium': '12px',
        'large': '24px',
      },
      keyframes: {
        logoBreathing: {
          '0%, 100%': { 
            transform: 'scale(1)', 
            boxShadow: '0 0 30px rgba(244, 63, 94, 0.3)' 
          },
          '50%': { 
            transform: 'scale(1.05)', 
            boxShadow: '0 0 50px rgba(244, 63, 94, 0.5)' 
          },
        },
        floatingParticles: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(120deg)' },
          '66%': { transform: 'translateY(5px) rotate(240deg)' },
        },
        slideUpFromBottom: {
          from: {
            opacity: '0',
            transform: 'translateY(30px) scale(0.95)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        dataFlow: {
          '0%': { left: '0' },
          '100%': { left: '100%' },
        },
      },
      animation: {
        'logo-breathing': 'logoBreathing 2s infinite',
        'floating-particles': 'floatingParticles 4s ease-in-out infinite',
        'slide-up-from-bottom': 'slideUpFromBottom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'data-flow': 'dataFlow 3s ease-in-out',
      },
    },
  },
  plugins: [],
}
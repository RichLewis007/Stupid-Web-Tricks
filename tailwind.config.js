/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        bangers: ['Bangers', 'cursive'],
        fredoka: ['Fredoka', 'sans-serif'],
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slide-up 0.8s ease-out forwards',
        'gentle-drift': 'gentle-drift 8s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 5px #7661d1, 0 0 10px #7661d1, 0 0 15px #7661d1' },
          '100%': { textShadow: '0 0 10px #7661d1, 0 0 20px #7661d1, 0 0 30px #7661d1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gentle-drift': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(10px, -5px)' },
          '50%': { transform: 'translate(-5px, 10px)' },
          '75%': { transform: 'translate(-10px, -5px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

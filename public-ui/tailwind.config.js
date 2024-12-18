/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-50': 'var(--primary-50)',
        'primary-200': 'var(--primary-200)',
        'primary-600': 'var(--primary-600)',
        neutral: {
          50: 'var(--neutral-50)',
          100: 'var(--neutral-100)',
          200: 'var(--neutral-200)',
          400: 'var(--neutral-400)',
          600: 'var(--neutral-600)',
          700: 'var(--neutral-700)',
          900: 'var(--neutral-900)',
        },
      },
      backgroundColor: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
      },
      borderRadius: {
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
      },
      spacing: {
        '2': 'var(--space-2)',
        '4': 'var(--space-4)',
        '6': 'var(--space-6)',
      },
    },
  },
  plugins: [],
} 
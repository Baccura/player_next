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
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: '#f3f4f6',
        accent: '#1f2937',
        background: '#ffffff',
        foreground: '#111827',
        muted: {
          DEFAULT: '#f9fafb',
          foreground: '#6b7280',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#111827',
        },
        border: '#e5e7eb',
        input: '#e5e7eb',
        ring: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#374151',
          dark: '#1F2937',
          light: '#F3F4F6'
        },
        text: {
          dark: '#111827',
          medium: '#374151',
          light: '#6B7280',
          muted: '#9CA3AF'
        },
        background: {
          white: '#FFFFFF',
          light: '#F9FAFB',
          medium: '#F3F4F6',
          dark: '#E5E7EB'
        },
        border: '#E5E7EB'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}

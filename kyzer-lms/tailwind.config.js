// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         primary: {
//           DEFAULT: '#374151',
//           dark: '#1F2937',
//           light: '#F3F4F6'
//         },
//         text: {
//           dark: '#111827',
//           medium: '#374151',
//           light: '#6B7280',
//           muted: '#9CA3AF'
//         },
//         background: {
//           white: '#FFFFFF',
//           light: '#F9FAFB',
//           medium: '#F3F4F6',
//           dark: '#E5E7EB'
//         },
//         border: '#E5E7EB'
//       },
//       fontFamily: {
//         sans: ['Inter', 'system-ui', 'sans-serif']
//       },
//       spacing: {
//         '18': '4.5rem',
//         '88': '22rem'
//       },
//       animation: {
//         'fade-in': 'fadeIn 0.5s ease-in-out',
//         'slide-up': 'slideUp 0.3s ease-out',
//         'slide-down': 'slideDown 0.3s ease-out'
//       },
//       keyframes: {
//         fadeIn: {
//           '0%': { opacity: '0' },
//           '100%': { opacity: '1' }
//         },
//         slideUp: {
//           '0%': { transform: 'translateY(10px)', opacity: '0' },
//           '100%': { transform: 'translateY(0)', opacity: '1' }
//         },
//         slideDown: {
//           '0%': { transform: 'translateY(-10px)', opacity: '0' },
//           '100%': { transform: 'translateY(0)', opacity: '1' }
//         }
//       }
//     },
//   },
//   plugins: [
//     require('@tailwindcss/forms')
//   ],
// }

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
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
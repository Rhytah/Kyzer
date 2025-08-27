// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { AuthProvider } from '@/hooks/auth/useAuth'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { router } from '@/router'
import '@/styles/globals.css'
import '@/styles/themes.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--color-primary)',
              color: 'var(--color-background-white)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: 'var(--color-success)',
                secondary: 'var(--color-background-white)',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: 'var(--color-error)',
                secondary: 'var(--color-background-white)',
              },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
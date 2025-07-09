// src/components/ui/Input.jsx
import React from 'react'
import { clsx } from 'clsx'

const Input = React.forwardRef(({
  className = '',
  type = 'text',
  error = false,
  disabled = false,
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      disabled={disabled}
      className={clsx(
        'block w-full px-3 py-2 border rounded-lg',
        'placeholder-text-muted text-text-dark',
        'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
        'disabled:bg-background-medium disabled:cursor-not-allowed',
        'transition-colors duration-200',
        error 
          ? 'border-red-300 bg-red-50' 
          : 'border-background-dark bg-white hover:border-primary-light',
        className
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export default Input
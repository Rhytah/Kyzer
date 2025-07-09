// src/components/ui/Card.jsx
import React from 'react'
import { clsx } from 'clsx'

const Card = React.forwardRef(({
  children,
  className = '',
  padding = 'default',
  shadow = 'default',
  ...props
}, ref) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  }
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    default: 'shadow-sm hover:shadow-md',
    lg: 'shadow-lg'
  }
  
  return (
    <div
      ref={ref}
      className={clsx(
        'bg-white rounded-xl border border-background-dark',
        paddingClasses[padding],
        shadowClasses[shadow],
        'transition-shadow duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

export default Card
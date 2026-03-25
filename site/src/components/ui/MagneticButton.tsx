'use client'

import { useRef, useState, type ReactNode } from 'react'
import { motion, useSpring } from 'framer-motion'
import { clsx } from 'clsx'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  strength?: number
  disabled?: boolean
}

export default function MagneticButton({
  children,
  className,
  onClick,
  href,
  variant = 'primary',
  strength = 0.3,
  disabled = false,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const springConfig = { stiffness: 200, damping: 20 }
  const x = useSpring(0, springConfig)
  const y = useSpring(0, springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!buttonRef.current || disabled) return
    const rect = buttonRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength
    x.set(deltaX)
    y.set(deltaY)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  const variantClasses = {
    primary: clsx(
      'bg-cyan-500 text-background font-semibold',
      'hover:bg-cyan-400 shadow-glow-sm hover:shadow-glow',
      'border border-cyan-400/50'
    ),
    secondary: clsx(
      'bg-transparent text-cyan-400 font-semibold',
      'border border-cyan-500/40 hover:border-cyan-400',
      'hover:bg-cyan-500/10 hover:shadow-glow-sm'
    ),
    ghost: clsx(
      'bg-white/5 text-foreground font-medium',
      'border border-white/10 hover:border-white/20',
      'hover:bg-white/10'
    ),
  }

  const content = (
    <motion.div
      ref={buttonRef}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block"
    >
      <motion.button
        onClick={!href ? onClick : undefined}
        disabled={disabled}
        whileTap={{ scale: 0.96 }}
        className={clsx(
          'relative inline-flex items-center justify-center gap-2',
          'px-6 py-3 rounded-xl text-sm',
          'transition-all duration-200',
          'overflow-hidden cursor-pointer',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          className
        )}
      >
        {/* Shimmer effect on hover */}
        {isHovered && variant === 'primary' && (
          <motion.div
            className="absolute inset-0 -translate-x-full"
            animate={{ translateX: '200%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            }}
          />
        )}
        {children}
      </motion.button>
    </motion.div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return content
}

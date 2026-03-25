'use client'

import { useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { clsx } from 'clsx'

interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: 'cyan' | 'purple'
  intensity?: number
  tilt?: boolean
}

export default function GlowCard({
  children,
  className,
  glowColor = 'cyan',
  intensity = 1,
  tilt = true,
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { stiffness: 300, damping: 30, restDelta: 0.001 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig)

  const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), springConfig)
  const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !tilt) return
    const rect = cardRef.current.getBoundingClientRect()
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(normalizedX)
    mouseY.set(normalizedY)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }

  const glowColorMap = {
    cyan: {
      glow: `rgba(0, 212, 255, ${0.2 * intensity})`,
      border: 'rgba(0, 212, 255, 0.3)',
      borderHover: 'rgba(0, 212, 255, 0.6)',
    },
    purple: {
      glow: `rgba(124, 58, 237, ${0.2 * intensity})`,
      border: 'rgba(124, 58, 237, 0.3)',
      borderHover: 'rgba(124, 58, 237, 0.6)',
    },
  }

  const colors = glowColorMap[glowColor]

  return (
    <motion.div
      ref={cardRef}
      className={clsx('relative group', className)}
      style={tilt ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : {}}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow effect that follows mouse */}
      {isHovered && (
        <motion.div
          className="absolute -inset-px rounded-2xl pointer-events-none z-0"
          style={{
            background: `radial-gradient(300px circle at ${glowX}% ${glowY}%, ${colors.glow}, transparent 60%)`,
          }}
        />
      )}

      {/* Border glow */}
      <div
        className="absolute -inset-px rounded-2xl pointer-events-none z-0 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${colors.border}, transparent, ${colors.border})`,
          opacity: isHovered ? 0.6 : 0.2,
          borderRadius: 'inherit',
        }}
      />

      {/* Card content */}
      <div
        className={clsx(
          'relative z-10 rounded-2xl',
          'bg-background-secondary/80 backdrop-blur-sm',
          'border border-white/5',
          'transition-all duration-300',
          isHovered && 'border-white/10'
        )}
      >
        {children}
      </div>
    </motion.div>
  )
}

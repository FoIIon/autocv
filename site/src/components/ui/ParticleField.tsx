'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useMousePosition } from '@/hooks/useMousePosition'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
}

const PARTICLE_COUNT = 100
const CONNECTION_DISTANCE = 120
const MOUSE_REPEL_DISTANCE = 100
const MOUSE_REPEL_STRENGTH = 3
const COLORS = ['rgba(0, 212, 255,', 'rgba(124, 58, 237,', 'rgba(0, 212, 255,']

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)
  const mousePos = useMousePosition()
  const mousePosRef = useRef(mousePos)
  const prefersReducedMotion = useRef(false)

  useEffect(() => {
    mousePosRef.current = mousePos
  }, [mousePos])

  const initParticles = useCallback((width: number, height: number) => {
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    const mouse = mousePosRef.current

    particlesRef.current.forEach((p, i) => {
      // Mouse repulsion
      const dx = p.x - mouse.x
      const dy = p.y - mouse.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < MOUSE_REPEL_DISTANCE && dist > 0) {
        const force = (MOUSE_REPEL_DISTANCE - dist) / MOUSE_REPEL_DISTANCE
        p.vx += (dx / dist) * force * MOUSE_REPEL_STRENGTH * 0.02
        p.vy += (dy / dist) * force * MOUSE_REPEL_STRENGTH * 0.02
      }

      // Speed limiting
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
      if (speed > 1.5) {
        p.vx = (p.vx / speed) * 1.5
        p.vy = (p.vy / speed) * 1.5
      }

      // Apply damping
      p.vx *= 0.99
      p.vy *= 0.99

      // Move
      p.x += p.vx
      p.y += p.vy

      // Wrap around edges
      if (p.x < 0) p.x = width
      if (p.x > width) p.x = 0
      if (p.y < 0) p.y = height
      if (p.y > height) p.y = 0

      // Draw particle
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `${p.color}${p.opacity})`
      ctx.fill()

      // Draw connections
      for (let j = i + 1; j < particlesRef.current.length; j++) {
        const p2 = particlesRef.current[j]
        const cdx = p.x - p2.x
        const cdy = p.y - p2.y
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy)

        if (cdist < CONNECTION_DISTANCE) {
          const alpha = (1 - cdist / CONNECTION_DISTANCE) * 0.15
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    })

    animFrameRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.current = mediaQuery.matches

    if (prefersReducedMotion.current) return

    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles(canvas.width, canvas.height)
    }

    resizeCanvas()
    animFrameRef.current = requestAnimationFrame(animate)

    const handleResize = () => resizeCanvas()
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [animate, initParticles])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  )
}

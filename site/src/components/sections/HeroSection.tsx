'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ParticleField from '@/components/ui/ParticleField'
import MagneticButton from '@/components/ui/MagneticButton'
import { cv } from '@/lib/constants'

const BOOT_LINES = [
  { text: '$ initializing autocv v2.0...', delay: 0 },
  { text: '$ loading identity: Alex Mercer', delay: 400 },
  { text: '$ scanning skills: [AI, React, Python, Go, TypeScript...]', delay: 900 },
  { text: '$ experience: 8 years, 4 companies', delay: 1400 },
  { text: '$ open_source_contributions: 2400+ stars', delay: 1900 },
  { text: '$ checking availability... OPEN_TO_OPPORTUNITIES', delay: 2400 },
  { text: '$ status: READY_FOR_HIRE ✓', delay: 2900 },
]

interface BootLine {
  text: string
  delay: number
}

function TerminalLine({ line, index }: { line: BootLine; index: number }) {
  const [visible, setVisible] = useState(false)
  const [text, setText] = useState('')

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), line.delay)
    return () => clearTimeout(showTimer)
  }, [line.delay])

  useEffect(() => {
    if (!visible) return
    let i = 0
    const interval = setInterval(() => {
      if (i <= line.text.length) {
        setText(line.text.slice(0, i))
        i++
      } else {
        clearInterval(interval)
      }
    }, 18)
    return () => clearInterval(interval)
  }, [visible, line.text])

  const isLast = index === BOOT_LINES.length - 1

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`font-mono text-sm ${
            isLast ? 'text-green-400 font-semibold' : 'text-cyan-300/80'
          }`}
        >
          <span>{text}</span>
          {text.length < line.text.length && (
            <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-0.5 align-middle" />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function HeroSection() {
  const [bootComplete, setBootComplete] = useState(false)
  const [showMain, setShowMain] = useState(false)

  useEffect(() => {
    const lastLine = BOOT_LINES[BOOT_LINES.length - 1]
    const bootTimer = setTimeout(() => {
      setBootComplete(true)
      setTimeout(() => setShowMain(true), 600)
    }, lastLine.delay + lastLine.text.length * 18 + 600)

    return () => clearTimeout(bootTimer)
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section
      id="about"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <ParticleField />
      <div className="absolute inset-0 mesh-bg pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-radial from-purple-600/5 via-transparent to-transparent pointer-events-none" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-float-slow" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none animate-float" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        {/* Terminal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: bootComplete ? 0 : 1, scale: bootComplete ? 0.95 : 1 }}
          transition={{ duration: 0.4 }}
          className={`mb-8 ${bootComplete ? 'hidden' : 'block'}`}
        >
          <div className="bg-background-secondary/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-w-2xl mx-auto">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-background/50">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-foreground-muted font-mono">
                autocv — bash — 80x24
              </span>
            </div>
            {/* Terminal body */}
            <div className="p-6 space-y-1.5 min-h-[200px]">
              {BOOT_LINES.map((line, i) => (
                <TerminalLine key={i} line={line} index={i} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Hero Content */}
        <AnimatePresence>
          {showMain && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-8"
            >
              {/* Status Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm"
              >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Available for new opportunities
              </motion.div>

              {/* Name */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold leading-none">
                  <span className="text-foreground">{cv.name.split(' ')[0]} </span>
                  <span className="text-gradient-cyan glow-text-cyan">
                    {cv.name.split(' ')[1]}
                  </span>
                </h1>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex items-center justify-center gap-3"
              >
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-500/50" />
                <h2 className="text-xl sm:text-2xl text-foreground-muted font-medium tracking-wide">
                  {cv.title}
                </h2>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-500/50" />
              </motion.div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="max-w-2xl mx-auto text-foreground-muted text-lg leading-relaxed"
              >
                {cv.tagline}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="flex flex-wrap items-center justify-center gap-4 pt-4"
              >
                <MagneticButton
                  variant="primary"
                  onClick={() => scrollToSection('projects')}
                  className="text-base"
                >
                  <span>View Projects</span>
                  <span>→</span>
                </MagneticButton>
                <MagneticButton
                  variant="secondary"
                  onClick={() => scrollToSection('playground')}
                  className="text-base"
                >
                  <span>✦</span>
                  <span>Chat with my AI</span>
                </MagneticButton>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="grid grid-cols-3 gap-6 max-w-md mx-auto pt-6"
              >
                {[
                  { value: '8+', label: 'Years exp.' },
                  { value: '50M+', label: 'Tokens/day' },
                  { value: '3.5k+', label: 'OSS stars' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-gradient-cyan">{stat.value}</div>
                    <div className="text-xs text-foreground-muted mt-1">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll Indicator */}
      {showMain && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          onClick={() => scrollToSection('about')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-foreground-muted/50 hover:text-foreground-muted transition-colors group"
        >
          <span className="text-xs font-mono">scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5 group-hover:border-cyan-500/40"
          >
            <div className="w-1 h-2 bg-cyan-400/60 rounded-full" />
          </motion.div>
        </motion.button>
      )}
    </section>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NAV_LINKS } from '@/lib/constants'
import CommandPalette from '@/components/ui/CommandPalette'

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    const handleSectionObserver = () => {
      const sections = NAV_LINKS.map((link) => link.href.replace('#', ''))
      const current = sections.find((section) => {
        const el = document.getElementById(section)
        if (!el) return false
        const rect = el.getBoundingClientRect()
        return rect.top <= 100 && rect.bottom >= 100
      })
      if (current) setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('scroll', handleSectionObserver)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scroll', handleSectionObserver)
    }
  }, [])

  const handleNavClick = (href: string) => {
    setIsMobileOpen(false)
    const id = href.replace('#', '')
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-white/5 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="relative flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center group-hover:border-cyan-400/60 transition-all duration-300 group-hover:shadow-glow-sm">
              <span className="text-sm font-bold text-gradient-cyan">AM</span>
            </div>
            <span className="hidden sm:block text-sm font-semibold text-foreground-muted group-hover:text-foreground transition-colors">
              Alex Mercer
            </span>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const sectionId = link.href.replace('#', '')
              const isActive = activeSection === sectionId
              return (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive
                      ? 'text-cyan-400'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 bg-cyan-500/10 rounded-md border border-cyan-500/20"
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </button>
              )
            })}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <CommandPalette />
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-foreground-muted">Available for hire</span>
            <button
              onClick={() => handleNavClick('#contact')}
              className="px-4 py-2 text-sm font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 hover:border-cyan-400/60 transition-all duration-200 hover:shadow-glow-sm"
            >
              Let&apos;s talk
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden relative w-9 h-9 flex flex-col justify-center items-center gap-1.5 group"
            aria-label="Toggle mobile menu"
          >
            <motion.span
              animate={isMobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block w-5 h-0.5 bg-foreground-muted group-hover:bg-cyan-400 transition-colors"
            />
            <motion.span
              animate={isMobileOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-5 h-0.5 bg-foreground-muted group-hover:bg-cyan-400 transition-colors"
            />
            <motion.span
              animate={isMobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block w-5 h-0.5 bg-foreground-muted group-hover:bg-cyan-400 transition-colors"
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-t border-white/5"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleNavClick(link.href)}
                  className="text-left px-4 py-3 text-sm font-medium text-foreground-muted hover:text-cyan-400 hover:bg-cyan-500/5 rounded-lg transition-all duration-200"
                >
                  {link.label}
                </motion.button>
              ))}
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-foreground-muted">Available for hire</span>
                </div>
                <button
                  onClick={() => handleNavClick('#contact')}
                  className="px-4 py-2 text-sm font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg"
                >
                  Let&apos;s talk
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NAV_LINKS, projects } from '@/lib/constants'

interface CommandItem {
  id: string
  label: string
  description?: string
  category: string
  action: () => void
  icon?: string
}

const SUGGESTED_PROMPTS = [
  'Generate a cover letter',
  'What are his key strengths?',
  'Generate a React component',
  'Why should we hire him?',
  'Prove this site was built with AI',
]

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setIsOpen(false)
  }, [])

  const sendToChat = useCallback((prompt: string) => {
    setIsOpen(false)
    setTimeout(() => {
      scrollToSection('playground')
      // Dispatch custom event to pre-fill chat
      window.dispatchEvent(new CustomEvent('chat-prompt', { detail: prompt }))
    }, 300)
  }, [scrollToSection])

  const allCommands: CommandItem[] = [
    ...NAV_LINKS.map((link) => ({
      id: `nav-${link.href}`,
      label: `Go to ${link.label}`,
      category: 'Navigation',
      icon: '→',
      action: () => scrollToSection(link.href.replace('#', '')),
    })),
    ...projects.map((p) => ({
      id: `project-${p.id}`,
      label: p.title,
      description: p.subtitle,
      category: 'Projects',
      icon: '◆',
      action: () => {
        scrollToSection('projects')
      },
    })),
    ...SUGGESTED_PROMPTS.map((prompt, i) => ({
      id: `prompt-${i}`,
      label: prompt,
      category: 'Ask AI',
      icon: '✦',
      action: () => sendToChat(prompt),
    })),
    {
      id: 'download-cv',
      label: 'Download CV (PDF)',
      category: 'Actions',
      icon: '↓',
      action: () => {
        setIsOpen(false)
        const link = document.createElement('a')
        link.href = '/cv.pdf'
        link.download = 'Alex-Mercer-CV.pdf'
        link.click()
      },
    },
  ]

  const filtered = query
    ? allCommands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.description?.toLowerCase().includes(query.toLowerCase()) ||
          cmd.category.toLowerCase().includes(query.toLowerCase())
      )
    : allCommands

  const groupedCommands = filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {})

  const flatFiltered = Object.values(groupedCommands).flat()

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
        setQuery('')
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, flatFiltered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (flatFiltered[selectedIndex]) {
        flatFiltered[selectedIndex].action()
      }
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const item = list.querySelector(`[data-index="${selectedIndex}"]`)
    if (item) {
      item.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  let flatIndex = 0

  return (
    <>
      {/* Keyboard shortcut hint */}
      <button
        onClick={() => { setIsOpen(true); setQuery('') }}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-foreground-muted text-xs hover:bg-white/10 transition-all"
        aria-label="Open command palette"
      >
        <span>Search</span>
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono">⌘K</kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4"
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

            {/* Palette */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="relative w-full max-w-lg bg-background-secondary border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
              onKeyDown={handleKeyDown}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                <span className="text-foreground-muted text-sm">⌕</span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search sections, projects, or ask AI..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-foreground-muted/60"
                />
                <kbd className="px-2 py-1 rounded bg-white/5 text-xs font-mono text-foreground-muted">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-72 overflow-y-auto py-2">
                {Object.entries(groupedCommands).length === 0 ? (
                  <div className="px-4 py-8 text-center text-foreground-muted text-sm">
                    No results for &quot;{query}&quot;
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, items]) => (
                    <div key={category}>
                      <div className="px-4 py-1.5 text-xs font-semibold text-foreground-muted/60 uppercase tracking-wider">
                        {category}
                      </div>
                      {items.map((item) => {
                        const itemIndex = flatIndex++
                        const isSelected = selectedIndex === itemIndex
                        return (
                          <button
                            key={item.id}
                            data-index={itemIndex}
                            onClick={item.action}
                            onMouseEnter={() => setSelectedIndex(itemIndex)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isSelected
                                ? 'bg-cyan-500/10 text-foreground'
                                : 'text-foreground-muted hover:text-foreground'
                            }`}
                          >
                            <span className={`text-base ${isSelected ? 'text-cyan-400' : ''}`}>
                              {item.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{item.label}</div>
                              {item.description && (
                                <div className="text-xs text-foreground-muted/60 truncate">
                                  {item.description}
                                </div>
                              )}
                            </div>
                            {isSelected && (
                              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono text-foreground-muted">
                                ↵
                              </kbd>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4 text-xs text-foreground-muted/50">
                <span><kbd className="font-mono">↑↓</kbd> navigate</span>
                <span><kbd className="font-mono">↵</kbd> select</span>
                <span><kbd className="font-mono">esc</kbd> close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

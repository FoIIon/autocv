'use client'

import { motion } from 'framer-motion'

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void
  disabled?: boolean
}

const PROMPTS = [
  { text: 'Génère une lettre de motivation', icon: '✉' },
  { text: 'Quels sont ses points forts ?', icon: '⚡' },
  { text: 'Pourquoi le recruter ?', icon: '★' },
  { text: 'Parle-moi de ses compétences IA', icon: '✦' },
  { text: 'Ce site a été construit comment ?', icon: '⚛' },
]

export default function SuggestedPrompts({ onSelect, disabled }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PROMPTS.map((prompt, i) => (
        <motion.button
          key={prompt.text}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          onClick={() => onSelect(prompt.text)}
          disabled={disabled}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
            bg-white/5 text-foreground-muted border border-white/8
            hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30
            transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed
            focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-background`}
        >
          <span className="text-xs">{prompt.icon}</span>
          <span>{prompt.text}</span>
        </motion.button>
      ))}
    </div>
  )
}

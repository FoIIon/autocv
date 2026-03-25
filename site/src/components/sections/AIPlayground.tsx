'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import ChatInterface from '@/components/ai/ChatInterface'
import SuggestedPrompts from '@/components/ai/SuggestedPrompts'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export default function AIPlayground() {
  const [pendingPrompt, setPendingPrompt] = useState<string | undefined>()
  const { ref: headingRef, isVisible: headingVisible } = useScrollReveal()

  const handlePromptSelect = useCallback((prompt: string) => {
    setPendingPrompt(prompt)
  }, [])

  const handlePromptConsumed = useCallback(() => {
    setPendingPrompt(undefined)
  }, [])

  return (
    <section
      id="playground"
      className="relative py-24 px-4 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-background-secondary" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 30% 50%, rgba(0, 212, 255, 0.05) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 70% 50%, rgba(124, 58, 237, 0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Heading */}
        <div
          ref={headingRef}
          className={`mb-12 transition-all duration-700 ${
            headingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-cyan-500" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.2em]">
              AI Demo
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gradient-cyan mb-4">
            AI Playground
          </h2>
          <p className="text-foreground-muted text-lg">
            Chat with an AI that knows everything about Alex — his experience, projects,
            philosophy, and code. This is what AI-native development looks like in practice.
          </p>
        </div>

        {/* Meta context box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/15 flex items-start gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-cyan-400 text-sm">✦</span>
          </div>
          <div className="text-sm">
            <p className="text-foreground-muted leading-relaxed">
              This chat interface is powered by{' '}
              <span className="text-cyan-400 font-medium">Claude claude-sonnet-4-6</span> via the Anthropic
              API. It has been given a detailed system prompt containing Alex&apos;s complete CV,
              project history, and personality. The entire portfolio — including this chat — was built
              with <span className="text-cyan-400 font-medium">Claude Code</span>.{' '}
              <span className="text-foreground-muted/70">
                10 free messages per session.
              </span>
            </p>
          </div>
        </motion.div>

        {/* Suggested prompts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-4"
        >
          <p className="text-xs text-foreground-muted/60 mb-3 font-mono uppercase tracking-wider">
            Try asking:
          </p>
          <SuggestedPrompts onSelect={handlePromptSelect} />
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ChatInterface
            initialPrompt={pendingPrompt}
            onPromptConsumed={handlePromptConsumed}
          />
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-foreground-muted/40 mt-4"
        >
          Responses are AI-generated and may not be 100% accurate. For direct contact, use the form below.
        </motion.p>
      </div>
    </section>
  )
}

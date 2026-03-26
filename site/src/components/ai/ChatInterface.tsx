'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MAX_CHAT_MESSAGES } from '@/lib/constants'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

interface ChatInterfaceProps {
  initialPrompt?: string
  onPromptConsumed?: () => void
}

export default function ChatInterface({ initialPrompt, onPromptConsumed }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Bonjour ! Je suis l'assistant IA de Sébastien. Je connais tout de son parcours, ses projets et ses compétences. Pose-moi n'importe quelle question — ou essaie un des prompts suggérés ci-dessus.",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messagesUsed, setMessagesUsed] = useState(0)
  const [rateLimitReached, setRateLimitReached] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Handle initial prompt from parent or custom event
  useEffect(() => {
    if (initialPrompt && !isLoading) {
      setInput(initialPrompt)
      onPromptConsumed?.()
    }
  }, [initialPrompt, isLoading, onPromptConsumed])

  // Listen for command palette chat events
  useEffect(() => {
    const handleChatPrompt = (e: Event) => {
      const custom = e as CustomEvent<string>
      setInput(custom.detail)
      inputRef.current?.focus()
    }
    window.addEventListener('chat-prompt', handleChatPrompt)
    return () => window.removeEventListener('chat-prompt', handleChatPrompt)
  }, [])

  const sendMessage = useCallback(async (messageText?: string) => {
    const text = (messageText ?? input).trim()
    if (!text || isLoading || rateLimitReached) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    }

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      isStreaming: true,
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setInput('')
    setIsLoading(true)

    // Build messages array for API (exclude welcome message)
    const apiMessages = [...messages.filter((m) => m.id !== 'welcome'), userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }))

    abortRef.current = new AbortController()

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 429) {
          setRateLimitReached(true)
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? {
                    ...m,
                    content: errorData.error ?? 'Rate limit reached.',
                    isStreaming: false,
                  }
                : m
            )
          )
          setIsLoading(false)
          return
        }
        throw new Error(errorData.error ?? 'Request failed')
      }

      // Update messages remaining
      const remaining = response.headers.get('X-Messages-Remaining')
      if (remaining !== null) {
        setMessagesUsed(MAX_CHAT_MESSAGES - parseInt(remaining, 10))
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      if (!reader) throw new Error('No response body')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) {
              throw new Error(parsed.error)
            }
            if (parsed.text) {
              accumulated += parsed.text
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id ? { ...m, content: accumulated } : m
                )
              )
            }
          } catch {
            // Ignore malformed SSE chunks
          }
        }
      }

      // Mark streaming done
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id ? { ...m, isStreaming: false } : m
        )
      )
      setMessagesUsed((prev) => prev + 1)
    } catch (error) {
      if ((error as Error).name === 'AbortError') return

      const errorMsg = error instanceof Error ? error.message : 'Something went wrong'
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, content: `Error: ${errorMsg}`, isStreaming: false }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, rateLimitReached])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handlePromptSelect = (prompt: string) => {
    sendMessage(prompt)
  }

  const messagesRemaining = MAX_CHAT_MESSAGES - messagesUsed

  return (
    <div className="flex flex-col h-[500px] rounded-2xl bg-background-secondary border border-white/8 overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-600/30 border border-cyan-500/30 flex items-center justify-center text-xs text-cyan-400 shrink-0 mt-1 mr-2">
                  ✦
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-cyan-500/15 text-foreground border border-cyan-500/20 rounded-br-sm'
                    : 'bg-white/5 text-foreground border border-white/5 rounded-bl-sm'
                }`}
              >
                <MessageContent content={message.content} isStreaming={message.isStreaming} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Rate limit notice */}
      {rateLimitReached && (
        <div className="px-4 py-2 bg-yellow-500/10 border-t border-yellow-500/20 text-yellow-400 text-xs text-center">
          Session limit reached (10 messages). Refresh to continue.
        </div>
      )}

      {/* Messages remaining */}
      {!rateLimitReached && messagesUsed > 0 && (
        <div className="px-4 pt-1 flex justify-end">
          <span className="text-xs text-foreground-muted/50">
            {messagesRemaining} message{messagesRemaining !== 1 ? 's' : ''} remaining
          </span>
        </div>
      )}

      {/* Input area */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={rateLimitReached ? 'Session limit reached' : 'Pose une question sur Sébastien...'}
            disabled={isLoading || rateLimitReached}
            rows={1}
            className="flex-1 resize-none bg-white/5 text-foreground text-sm rounded-xl px-4 py-3
              placeholder:text-foreground-muted/50 border border-white/8
              focus:outline-none focus:border-cyan-500/40 focus:bg-white/8
              transition-all duration-200 max-h-32 overflow-y-auto
              disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
          <motion.button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading || rateLimitReached}
            whileTap={{ scale: 0.95 }}
            className="shrink-0 w-10 h-10 rounded-xl bg-cyan-500 text-background
              flex items-center justify-center
              hover:bg-cyan-400 transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed
              shadow-glow-sm hover:shadow-glow"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-background/40 border-t-background rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </motion.button>
        </div>
        <p className="text-xs text-foreground-muted/40 mt-2 px-1">
          Shift+Enter for new line · Powered by Claude Sonnet
        </p>
      </div>
    </div>
  )
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function MessageContent({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  if (!content && isStreaming) return null

  const lines = content.split('\n')

  return (
    <div className="space-y-1 whitespace-pre-wrap">
      {lines.map((line, i) => {
        const escaped = escapeHtml(line)
        const rendered = escaped.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-white/10 font-mono text-cyan-300 text-xs">$1</code>')
        return (
          <span
            key={i}
            dangerouslySetInnerHTML={{ __html: i < lines.length - 1 ? rendered + '\n' : rendered }}
          />
        )
      })}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-0.5 align-middle rounded-sm" />
      )}
    </div>
  )
}

export { ChatInterface }
export type { ChatInterfaceProps }

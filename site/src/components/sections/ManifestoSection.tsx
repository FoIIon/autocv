'use client'

import { useRef, useEffect, useState } from 'react'

const MANIFESTO_WORDS = [
  { text: 'We', highlight: false },
  { text: 'are', highlight: false },
  { text: 'entering', highlight: false },
  { text: 'a', highlight: false },
  { text: 'new', highlight: true },
  { text: 'era.', highlight: false },
  { text: 'The', highlight: false },
  { text: 'most', highlight: false },
  { text: 'valuable', highlight: true },
  { text: 'skill', highlight: false },
  { text: 'is', highlight: false },
  { text: 'not', highlight: false },
  { text: 'what', highlight: false },
  { text: 'you', highlight: false },
  { text: 'know', highlight: false },
  { text: '—', highlight: false },
  { text: "it's", highlight: false },
  { text: 'how', highlight: false },
  { text: 'you', highlight: false },
  { text: 'collaborate', highlight: true },
  { text: 'with', highlight: false },
  { text: 'AI.', highlight: true },
]

const SECOND_LINE = [
  { text: 'I', highlight: false },
  { text: "don't", highlight: false },
  { text: 'use', highlight: false },
  { text: 'AI', highlight: true },
  { text: 'as', highlight: false },
  { text: 'a', highlight: false },
  { text: 'tool.', highlight: false },
  { text: 'I', highlight: false },
  { text: 'think', highlight: false },
  { text: 'with', highlight: false },
  { text: 'it.', highlight: true },
]

interface WordProps {
  text: string
  highlight: boolean
  delay: number
}

function AnimatedWord({ text, highlight, delay }: WordProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setVisible(true), delay)
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.unobserve(el)
  }, [delay])

  return (
    <span
      ref={ref}
      className={`inline-block transition-all duration-700 mr-[0.3em] ${
        visible
          ? 'opacity-100 translate-y-0 blur-none'
          : 'opacity-0 translate-y-4 blur-sm'
      } ${
        highlight
          ? 'text-cyan-400 glow-text-cyan font-bold'
          : 'text-foreground'
      }`}
      style={{ transitionDelay: visible ? '0ms' : `${delay}ms` }}
    >
      {text}
    </span>
  )
}

export default function ManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [sectionVisible, setSectionVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.unobserve(el)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center py-32 px-4 overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-background-secondary" />
      <div className="absolute inset-0 bg-glow-purple opacity-40 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(124, 58, 237, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Eyebrow */}
        <div
          className={`inline-flex items-center gap-2 mb-12 transition-all duration-700 ${
            sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="h-px w-8 bg-purple-500" />
          <span className="text-xs font-mono text-purple-400 uppercase tracking-[0.2em]">
            Philosophy
          </span>
          <div className="h-px w-8 bg-purple-500" />
        </div>

        {/* First line */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8">
          {MANIFESTO_WORDS.map((word, i) => (
            <AnimatedWord key={i} text={word.text} highlight={word.highlight} delay={i * 60} />
          ))}
        </h2>

        {/* Divider */}
        <div
          className={`flex items-center gap-4 my-10 transition-all duration-700 delay-1000 ${
            sectionVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-purple-500/30" />
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-purple-500/30" />
        </div>

        {/* Second line */}
        <p className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          {SECOND_LINE.map((word, i) => (
            <AnimatedWord
              key={i}
              text={word.text}
              highlight={word.highlight}
              delay={MANIFESTO_WORDS.length * 60 + 400 + i * 80}
            />
          ))}
        </p>

        {/* Bio text */}
        <div
          className={`mt-16 max-w-2xl mx-auto transition-all duration-700 ${
            sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '2000ms' }}
        >
          <p className="text-foreground-muted text-lg leading-relaxed">
            14 ans de développement et de data m&apos;ont appris une chose : les meilleurs résultats
            viennent quand l&apos;humain et la machine travaillent ensemble. Prompt engineering, Claude Code,
            automatisation n8n — chaque projet est conçu pour tirer le meilleur des deux.
          </p>
        </div>

        {/* Values grid */}
        <div
          className={`mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto transition-all duration-700 ${
            sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '2200ms' }}
        >
          {[
            "L'IA comme co-pilote, pas comme remplacement",
            'Automatiser tout ce qui peut l\'être',
            'La donnée fiable avant tout',
            'Pragmatisme et livraison',
            'Apprendre en continu',
            'Le contexte est clé',
          ].map((value) => (
            <div
              key={value}
              className="flex items-center gap-2 text-left px-4 py-3 rounded-xl bg-white/3 border border-white/5"
            >
              <span className="text-purple-400 text-sm">◆</span>
              <span className="text-foreground-muted text-sm">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

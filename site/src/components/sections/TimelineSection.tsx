'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { cv } from '@/lib/constants'

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Present'
  const [year, month] = dateStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function calculateDuration(start: string, end: string | null): string {
  const startDate = new Date(start)
  const endDate = end ? new Date(end) : new Date()
  const months =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    endDate.getMonth() -
    startDate.getMonth()
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years === 0) return `${remainingMonths}mo`
  if (remainingMonths === 0) return `${years}yr`
  return `${years}yr ${remainingMonths}mo`
}

interface TimelineEntryProps {
  exp: (typeof cv.experience)[0]
  index: number
  isLeft: boolean
}

function MobileTimelineEntry({ exp, index }: { exp: (typeof cv.experience)[0]; index: number }) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isVisible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative"
    >
      {/* Dot */}
      <div
        className={`absolute -left-[34px] top-4 w-3 h-3 rounded-full border-2 ${
          exp.end === null
            ? 'bg-cyan-500 border-cyan-400'
            : 'bg-background border-white/30'
        }`}
      />
      <div className="p-4 rounded-xl bg-background-secondary border border-white/5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="text-sm font-bold text-foreground">{exp.role}</div>
            <div className="text-xs text-cyan-400">{exp.company}</div>
          </div>
          <span className="text-xs text-foreground-muted/60 shrink-0">
            {formatDate(exp.start)} — {formatDate(exp.end)}
          </span>
        </div>
        <p className="text-xs text-foreground-muted leading-relaxed mb-2">
          {exp.description}
        </p>
        <ul className="space-y-0.5">
          {exp.achievements.slice(0, 2).map((a) => (
            <li key={a} className="flex items-start gap-1.5 text-xs text-foreground-muted">
              <span className="text-cyan-400 mt-0.5 shrink-0">▸</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

function TimelineEntry({ exp, index, isLeft }: TimelineEntryProps) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 })

  return (
    <div
      ref={ref}
      className={`relative flex items-start gap-0 ${
        isLeft ? 'flex-row-reverse' : 'flex-row'
      } md:flex-row`}
    >
      {/* Content card */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? 40 : -40 }}
        animate={isVisible ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`flex-1 ${isLeft ? 'md:mr-8 md:text-right' : 'md:ml-8'} mb-12`}
      >
        <div className="p-5 rounded-2xl bg-background-secondary border border-white/5 hover:border-white/10 transition-all duration-300 group">
          {/* Header */}
          <div className={`flex flex-col ${isLeft ? 'md:items-end' : 'items-start'} mb-3`}>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                  exp.end === null
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-white/5 text-foreground-muted border border-white/10'
                }`}
              >
                {exp.end === null ? 'Current' : formatDate(exp.start)}
              </span>
              <span className="text-xs text-foreground-muted/60">
                {calculateDuration(exp.start, exp.end)}
              </span>
            </div>

            <h3 className="text-lg font-bold text-foreground group-hover:text-cyan-400 transition-colors">
              {exp.role}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              {exp.url ? (
                <a
                  href={exp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors"
                >
                  {exp.company} ↗
                </a>
              ) : (
                <span className="text-cyan-400 text-sm font-medium">{exp.company}</span>
              )}
              <span className="text-xs text-foreground-muted/60">· {exp.location}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-foreground-muted leading-relaxed mb-3">
            {exp.description}
          </p>

          {/* Achievements */}
          <ul className={`space-y-1 mb-3 ${isLeft ? 'md:text-right' : ''}`}>
            {exp.achievements.slice(0, 3).map((achievement) => (
              <li
                key={achievement}
                className={`flex items-start gap-2 text-xs text-foreground-muted ${
                  isLeft ? 'md:flex-row-reverse' : ''
                }`}
              >
                <span className="text-cyan-400 mt-0.5 shrink-0">▸</span>
                <span>{achievement}</span>
              </li>
            ))}
          </ul>

          {/* Tech stack */}
          <div className={`flex flex-wrap gap-1 ${isLeft ? 'md:justify-end' : ''}`}>
            {exp.tech.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-xs rounded-md bg-white/5 text-foreground-muted border border-white/5"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Timeline dot (desktop) */}
      <div className="hidden md:flex flex-col items-center shrink-0">
        <motion.div
          initial={{ scale: 0 }}
          animate={isVisible ? { scale: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`w-4 h-4 rounded-full border-2 z-10 ${
            exp.end === null
              ? 'bg-cyan-500 border-cyan-400 shadow-glow-sm'
              : 'bg-background border-white/30'
          }`}
        />
      </div>

      {/* Spacer for alternating layout */}
      <div className="hidden md:block flex-1" />
    </div>
  )
}

export default function TimelineSection() {
  const { ref: headingRef, isVisible: headingVisible } = useScrollReveal()
  const lineRef = useRef<SVGLineElement>(null)
  const [lineProgress, setLineProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById('timeline')
      if (!section) return
      const rect = section.getBoundingClientRect()
      const progress = Math.max(
        0,
        Math.min(1, (window.innerHeight - rect.top) / (rect.height + window.innerHeight))
      )
      setLineProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section id="timeline" className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-background-secondary pointer-events-none" />
      <div
        className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 30% at 50% 0%, rgba(0, 212, 255, 0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Heading */}
        <div
          ref={headingRef}
          className={`mb-16 transition-all duration-700 ${
            headingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-cyan-500" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.2em]">
              Experience
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gradient-cyan mb-4">Career Timeline</h2>
          <p className="text-foreground-muted text-lg max-w-2xl">
            8 years building production systems at scale — from early-stage startup to public company.
          </p>
        </div>

        {/* Desktop: alternating layout with center line */}
        <div className="hidden md:block relative">
          {/* Animated center line */}
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px">
            <div className="w-full h-full bg-white/5" />
            <div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-cyan-500 to-purple-500 transition-all duration-300"
              style={{ height: `${lineProgress * 100}%` }}
            />
          </div>

          <div className="space-y-0">
            {cv.experience.map((exp, i) => (
              <TimelineEntry key={exp.company} exp={exp} index={i} isLeft={i % 2 === 1} />
            ))}
          </div>
        </div>

        {/* Mobile: simple vertical list */}
        <div className="md:hidden relative">
          {/* Line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />

          <div className="space-y-6 pl-10">
            {cv.experience.map((exp, i) => (
              <MobileTimelineEntry key={exp.company} exp={exp} index={i} />
            ))}
          </div>
        </div>

        {/* Education */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 p-6 rounded-2xl bg-background border border-white/5"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
              <span className="text-purple-400 text-sm">🎓</span>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {cv.education[0].degree} in {cv.education[0].field}
                  </h3>
                  <p className="text-cyan-400 text-sm">{cv.education[0].institution}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-foreground-muted">
                    {cv.education[0].start} — {cv.education[0].end}
                  </div>
                  <div className="text-xs text-purple-400">{cv.education[0].honors}</div>
                </div>
              </div>
              <p className="text-sm text-foreground-muted mb-3">GPA: {cv.education[0].gpa}/4.0</p>
              <ul className="space-y-1">
                {cv.education[0].highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-foreground-muted">
                    <span className="text-purple-400 shrink-0">◆</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import GlowCard from '@/components/ui/GlowCard'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { projects, type Project } from '@/lib/constants'

const STATUS_COLORS: Record<string, string> = {
  production: 'bg-green-500/10 text-green-400 border-green-500/20',
  'open-source': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  beta: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <GlowCard
        glowColor={index % 2 === 0 ? 'cyan' : 'purple'}
        className="h-full"
      >
        <div className="p-6 h-full flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                    STATUS_COLORS[project.status] ?? STATUS_COLORS.beta
                  }`}
                >
                  {project.status}
                </span>
                <span className="text-xs text-foreground-muted">{project.year}</span>
              </div>
              <h3 className="text-lg font-bold text-foreground group-hover:text-cyan-400 transition-colors leading-tight">
                {project.title}
              </h3>
              <p className="text-sm text-foreground-muted mt-0.5">{project.subtitle}</p>
            </div>

            {project.featured && (
              <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                ★ Featured
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-foreground-muted leading-relaxed">
            {expanded ? project.longDescription : project.description}
          </p>

          {/* Highlights */}
          <ul className="space-y-1">
            {project.highlights.slice(0, expanded ? undefined : 3).map((highlight) => (
              <li key={highlight} className="flex items-start gap-2 text-xs text-foreground-muted">
                <span className="text-cyan-400 mt-0.5 shrink-0">✓</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-xs rounded-md bg-white/5 text-foreground-muted border border-white/5 hover:border-cyan-500/20 hover:text-cyan-400 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-foreground-muted hover:text-cyan-400 transition-colors"
            >
              {expanded ? '↑ Less' : '↓ More details'}
            </button>
            <div className="flex-1" />
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-white/5"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors px-2 py-1 rounded-md hover:bg-cyan-500/5"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Live Demo
              </a>
            )}
          </div>
        </div>
      </GlowCard>
    </motion.div>
  )
}

export default function ProjectsSection() {
  const { ref: headingRef, isVisible: headingVisible } = useScrollReveal()
  const [filter, setFilter] = useState<string>('all')

  const statuses = ['all', ...Array.from(new Set(projects.map((p) => p.status)))]
  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter)

  return (
    <section id="projects" className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-background pointer-events-none" />
      <div
        className="absolute top-0 right-0 w-1/2 h-1/2 pointer-events-none opacity-50"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(0, 212, 255, 0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
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
              Work
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gradient-cyan mb-4">
            Featured Projects
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl">
            Du portfolio IA au CRM financier, en passant par l&apos;automatisation n8n
            et la data governance pour 20+ clients européens.
          </p>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mt-6">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-1.5 rounded-full text-sm capitalize transition-all duration-200 ${
                  filter === status
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'bg-white/5 text-foreground-muted border border-white/5 hover:bg-white/10'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>

        {/* Open Source CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 p-6 rounded-2xl bg-background-secondary border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              More on GitHub
            </h3>
            <p className="text-sm text-foreground-muted">
              Projets personnels, contributions et expérimentations IA.
            </p>
          </div>
          <a
            href="https://github.com/FoIIon"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-white/5 text-foreground border border-white/10 text-sm font-medium hover:bg-white/10 hover:border-cyan-500/30 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View all repos
          </a>
        </motion.div>
      </div>
    </section>
  )
}

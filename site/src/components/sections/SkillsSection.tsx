'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { cv } from '@/lib/constants'

// Orbital configuration: skill → orbit ring
const ORBITAL_CONFIG = {
  inner: ['LLM Integration', 'Prompt Engineering', 'React / Next.js', 'TypeScript', 'Node.js / Bun'],
  middle: ['RAG Systems', 'Python (FastAPI)', 'AWS (ECS, Lambda, S3)', 'PostgreSQL', 'Docker / Kubernetes', 'Claude Code', 'GitHub Actions'],
  outer: [
    'PyTorch', 'LangChain', 'Go', 'Redis', 'Kafka',
    'Fine-tuning', 'Framer Motion', 'Vector DBs (Pinecone, Weaviate)',
    'GraphQL (Apollo)', 'Tailwind CSS', 'Terraform', 'Vercel / Cloudflare',
  ],
}

const ORBIT_RADII = { inner: 120, middle: 190, outer: 265 }
const ORBIT_DURATIONS = { inner: 20, middle: 30, outer: 42 }
const ORBIT_COLORS = {
  inner: { text: 'text-cyan-400', border: 'border-cyan-500/40', bg: 'bg-cyan-500/10' },
  middle: { text: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10' },
  outer: { text: 'text-foreground-muted', border: 'border-white/15', bg: 'bg-white/5' },
}

type OrbitKey = keyof typeof ORBITAL_CONFIG

function OrbitRing({
  skills,
  radius,
  duration,
  orbitKey,
  reverse = false,
}: {
  skills: string[]
  radius: number
  duration: number
  orbitKey: OrbitKey
  reverse?: boolean
}) {
  const colors = ORBIT_COLORS[orbitKey]
  const circumference = 2 * Math.PI * radius

  return (
    <motion.div
      className="absolute"
      style={{
        width: radius * 2,
        height: radius * 2,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    >
      {/* Ring circle */}
      <div
        className="absolute inset-0 rounded-full border border-dashed"
        style={{ borderColor: 'rgba(255,255,255,0.04)' }}
      />

      {skills.map((skill, i) => {
        const angle = (360 / skills.length) * i
        const x = radius * Math.cos((angle * Math.PI) / 180)
        const y = radius * Math.sin((angle * Math.PI) / 180)

        return (
          <motion.div
            key={skill}
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            }}
            animate={{ rotate: reverse ? 360 : -360 }}
            transition={{ duration, repeat: Infinity, ease: 'linear' }}
            title={skill}
          >
            <div
              className={`
                px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap
                ${colors.bg} ${colors.text} border ${colors.border}
                backdrop-blur-sm cursor-default
                hover:scale-110 transition-transform duration-200
                shadow-sm
              `}
            >
              {skill.length > 18 ? skill.split(' ')[0] : skill}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

function SkillBar({ name, level, color }: { name: string; level: number; color: string }) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 })

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-foreground-muted">{name}</span>
        <span className="text-xs text-foreground-muted/60 font-mono">{level}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={isVisible ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  )
}

const SKILL_CATEGORIES = [
  { key: 'AI/ML' as const, label: 'AI/ML', color: 'bg-gradient-to-r from-cyan-500 to-cyan-400' },
  { key: 'Frontend' as const, label: 'Frontend', color: 'bg-gradient-to-r from-purple-500 to-purple-400' },
  { key: 'Backend' as const, label: 'Backend', color: 'bg-gradient-to-r from-cyan-600 to-blue-500' },
  { key: 'DevOps' as const, label: 'DevOps', color: 'bg-gradient-to-r from-orange-500 to-yellow-500' },
]

export default function SkillsSection() {
  const [activeTab, setActiveTab] = useState<'orbital' | 'bars'>('orbital')
  const [activeCategory, setActiveCategory] = useState('AI/ML')
  const { ref: headingRef, isVisible: headingVisible } = useScrollReveal()

  const activeSkills = cv.skills[activeCategory as keyof typeof cv.skills] ?? []

  return (
    <section id="skills" className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-background pointer-events-none" />
      <div
        className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 40% at 50% 100%, rgba(124, 58, 237, 0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Heading */}
        <div
          ref={headingRef}
          className={`mb-12 transition-all duration-700 ${
            headingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-purple-500" />
            <span className="text-xs font-mono text-purple-400 uppercase tracking-[0.2em]">
              Expertise
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gradient-cyan mb-4">
            Skills & Stack
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl">
            8+ years of depth across the full stack, with a special focus on AI integration
            and building production-grade systems.
          </p>

          {/* View toggle */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab('orbital')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'orbital'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                  : 'bg-white/5 text-foreground-muted border border-white/5 hover:bg-white/10'
              }`}
            >
              ◎ Orbital View
            </button>
            <button
              onClick={() => setActiveTab('bars')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'bars'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                  : 'bg-white/5 text-foreground-muted border border-white/5 hover:bg-white/10'
              }`}
            >
              ▤ Skill Levels
            </button>
          </div>
        </div>

        {/* Orbital View */}
        {activeTab === 'orbital' && (
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Orbital animation */}
            <div className="relative flex-shrink-0" style={{ width: 600, height: 600 }}>
              {/* Outer ring */}
              <OrbitRing
                skills={ORBITAL_CONFIG.outer}
                radius={ORBIT_RADII.outer}
                duration={ORBIT_DURATIONS.outer}
                orbitKey="outer"
                reverse
              />
              {/* Middle ring */}
              <OrbitRing
                skills={ORBITAL_CONFIG.middle}
                radius={ORBIT_RADII.middle}
                duration={ORBIT_DURATIONS.middle}
                orbitKey="middle"
              />
              {/* Inner ring */}
              <OrbitRing
                skills={ORBITAL_CONFIG.inner}
                radius={ORBIT_RADII.inner}
                duration={ORBIT_DURATIONS.inner}
                orbitKey="inner"
                reverse
              />

              {/* Center nucleus */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  {/* Pulse rings */}
                  <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping" style={{ width: 80, height: 80, left: -12, top: -12 }} />
                  <div className="absolute inset-0 rounded-full border border-purple-500/15" style={{ width: 100, height: 100, left: -22, top: -22 }} />

                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-600/30 border-2 border-cyan-500/50 flex flex-col items-center justify-center shadow-glow">
                    <span className="text-xs font-bold text-cyan-400 leading-tight text-center">
                      Human<br/>+ AI
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-6">
              <h3 className="text-xl font-semibold text-foreground">Technology Orbits</h3>
              {(Object.keys(ORBITAL_CONFIG) as OrbitKey[]).map((orbit) => (
                <div key={orbit} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        orbit === 'inner'
                          ? 'bg-cyan-500'
                          : orbit === 'middle'
                          ? 'bg-purple-500'
                          : 'bg-white/40'
                      }`}
                    />
                    <span className="text-sm font-medium text-foreground capitalize">
                      {orbit} Orbit — {orbit === 'inner' ? 'Core strengths' : orbit === 'middle' ? 'Primary stack' : 'Extended tooling'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-5">
                    {ORBITAL_CONFIG[orbit].map((skill) => (
                      <span
                        key={skill}
                        className={`text-xs px-2 py-0.5 rounded-full border ${ORBIT_COLORS[orbit].bg} ${ORBIT_COLORS[orbit].text} ${ORBIT_COLORS[orbit].border}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skill Bars View */}
        {activeTab === 'bars' && (
          <div>
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {SKILL_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === cat.key
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-white/5 text-foreground-muted border border-white/5 hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 max-w-4xl">
              {activeSkills.map((skill) => {
                const cat = SKILL_CATEGORIES.find((c) => c.key === activeCategory)
                return (
                  <SkillBar
                    key={skill.name}
                    name={skill.name}
                    level={skill.level}
                    color={cat?.color ?? 'bg-cyan-500'}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {cv.certifications.map((cert) => (
            <div
              key={cert.name}
              className="p-4 rounded-xl bg-background-secondary border border-white/5 hover:border-cyan-500/20 transition-all"
            >
              <div className="text-xs text-cyan-400 font-mono mb-1">{cert.year}</div>
              <div className="text-sm font-medium text-foreground mb-0.5">{cert.name}</div>
              <div className="text-xs text-foreground-muted">{cert.issuer}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

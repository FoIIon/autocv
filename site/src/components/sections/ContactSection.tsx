'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import MagneticButton from '@/components/ui/MagneticButton'
import { cv } from '@/lib/constants'

interface FormData {
  name: string
  email: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
  general?: string
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

const SOCIAL_LINKS = [
  {
    name: 'Email',
    icon: '✉',
    href: `mailto:${cv.contact.email}`,
    label: cv.contact.email,
    color: 'hover:text-cyan-400',
  },
  {
    name: 'LinkedIn',
    icon: 'in',
    href: cv.contact.linkedin,
    label: 'linkedin.com/in/alexmercer-dev',
    color: 'hover:text-blue-400',
  },
  {
    name: 'GitHub',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    href: cv.contact.github,
    label: 'github.com/alexmercer-ai',
    color: 'hover:text-foreground',
  },
  {
    name: 'Twitter',
    icon: '𝕏',
    href: cv.contact.twitter,
    label: '@alexmercer_ai',
    color: 'hover:text-sky-400',
  },
]

export default function ContactSection() {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<FormStatus>('idle')
  const { ref: headingRef, isVisible: headingVisible } = useScrollReveal()

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setStatus('submitting')
    setErrors({})

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          setErrors({ general: data.error ?? 'Something went wrong. Please try again.' })
        }
        setStatus('error')
        return
      }

      setStatus('success')
      setFormData({ name: '', email: '', message: '' })
    } catch {
      setErrors({ general: 'Network error. Please check your connection.' })
      setStatus('error')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <section id="contact" className="relative py-24 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(0, 212, 255, 0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Heading */}
        <div
          ref={headingRef}
          className={`mb-16 text-center transition-all duration-700 ${
            headingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-cyan-500" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.2em]">
              Contact
            </span>
            <div className="h-px w-8 bg-cyan-500" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gradient-cyan mb-6">
            Let&apos;s build the future
          </h2>
          <p className="text-foreground-muted text-xl max-w-2xl mx-auto">
            together.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Available for new opportunities
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Get in touch</h3>
              <p className="text-foreground-muted leading-relaxed">
                Whether you&apos;re looking to hire a principal engineer who deeply understands AI,
                collaborate on an open-source project, or just want to nerd out about LLMs and
                distributed systems — I&apos;d love to hear from you.
              </p>
            </div>

            {/* Social links */}
            <div className="space-y-3">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target={link.href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 p-3 rounded-xl bg-background-secondary border border-white/5
                    hover:border-white/10 transition-all group ${link.color}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm font-medium text-foreground-muted group-hover:bg-white/10 transition-colors">
                    {link.icon}
                  </div>
                  <div>
                    <div className="text-xs text-foreground-muted/60 font-mono">{link.name}</div>
                    <div className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
                      {link.label}
                    </div>
                  </div>
                  <span className="ml-auto text-foreground-muted/30 group-hover:text-foreground-muted transition-colors text-xs">
                    ↗
                  </span>
                </a>
              ))}
            </div>

            {/* CV Download */}
            <div className="p-4 rounded-xl bg-background-secondary border border-white/5">
              <h4 className="text-sm font-medium text-foreground mb-2">Download CV</h4>
              <p className="text-xs text-foreground-muted mb-3">
                Full resume with detailed experience, publications, and references.
              </p>
              <MagneticButton
                variant="secondary"
                className="text-sm"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = '/cv.pdf'
                  link.download = 'Alex-Mercer-CV.pdf'
                  link.click()
                }}
              >
                <span>↓</span>
                <span>Download CV (PDF)</span>
              </MagneticButton>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {status === 'success' ? (
              <div className="p-8 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
                <div className="text-4xl mb-4">✓</div>
                <h3 className="text-xl font-bold text-green-400 mb-2">Message sent!</h3>
                <p className="text-foreground-muted">
                  Thanks for reaching out. I&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-4 text-sm text-foreground-muted hover:text-foreground underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-6 rounded-2xl bg-background-secondary border border-white/5"
              >
                <h3 className="text-lg font-semibold text-foreground mb-6">Send a message</h3>

                {errors.general && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {errors.general}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground-muted mb-1.5"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 text-foreground text-sm
                      placeholder:text-foreground-muted/40 border transition-all duration-200
                      focus:outline-none focus:bg-white/8
                      ${errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/8 focus:border-cyan-500/40'}`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground-muted mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@company.com"
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 text-foreground text-sm
                      placeholder:text-foreground-muted/40 border transition-all duration-200
                      focus:outline-none focus:bg-white/8
                      ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/8 focus:border-cyan-500/40'}`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-foreground-muted mb-1.5"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Hi Alex, I'd love to talk about..."
                    rows={5}
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 text-foreground text-sm
                      placeholder:text-foreground-muted/40 border transition-all duration-200
                      focus:outline-none focus:bg-white/8 resize-none
                      ${errors.message ? 'border-red-500/50 focus:border-red-500' : 'border-white/8 focus:border-cyan-500/40'}`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-400">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-3 px-6 rounded-xl bg-cyan-500 text-background font-semibold text-sm
                    hover:bg-cyan-400 transition-all duration-200 shadow-glow-sm hover:shadow-glow
                    disabled:opacity-60 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
                >
                  {status === 'submitting' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-background/40 border-t-background rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <span>→</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-24 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground-muted/40"
        >
          <p>© 2024 Alex Mercer. Built with Next.js & Claude.</p>
          <p className="font-mono text-xs">
            $ echo &quot;AI-native since 2018&quot;
          </p>
        </motion.div>
      </div>
    </section>
  )
}

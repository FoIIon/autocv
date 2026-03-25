import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Alex Mercer — AI-Native Developer',
  description:
    'Senior full-stack developer and AI engineer specializing in LLM integration, RAG systems, and human-AI collaboration. Available for high-impact roles.',
  keywords: [
    'Alex Mercer',
    'AI Developer',
    'Full-Stack Engineer',
    'LLM Integration',
    'Machine Learning',
    'React',
    'Next.js',
    'TypeScript',
    'Anthropic',
    'Claude',
    'RAG',
    'AI-Native',
  ],
  authors: [{ name: 'Alex Mercer', url: 'https://alexmercer.dev' }],
  creator: 'Alex Mercer',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://alexmercer.dev',
    title: 'Alex Mercer — AI-Native Developer',
    description:
      'Senior full-stack developer and AI engineer. I build systems where human creativity and machine intelligence amplify each other.',
    siteName: 'Alex Mercer Portfolio',
    images: [
      {
        url: 'https://alexmercer.dev/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Alex Mercer — AI-Native Developer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alex Mercer — AI-Native Developer',
    description: 'Senior full-stack developer and AI engineer. Building the future of human-AI collaboration.',
    creator: '@alexmercer_ai',
    images: ['https://alexmercer.dev/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0f',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Alex Mercer',
  jobTitle: 'AI-Native Full-Stack Developer',
  description: 'Principal Engineer specializing in LLM integration, RAG systems, and human-AI collaboration.',
  url: 'https://alexmercer.dev',
  sameAs: [
    'https://linkedin.com/in/alexmercer-dev',
    'https://github.com/alexmercer-ai',
    'https://twitter.com/alexmercer_ai',
  ],
  knowsAbout: ['LLM Integration', 'RAG Systems', 'React', 'Next.js', 'TypeScript', 'Python', 'Anthropic Claude API'],
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'UC Berkeley',
  },
  worksFor: {
    '@type': 'Organization',
    name: 'Nexus AI Labs',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  )
}

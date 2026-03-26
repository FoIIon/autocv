import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sébastien Libert — Data Analyst & Developer IA',
  description:
    "Data Analyst & Full-Stack Developer avec 14 ans d'expérience IT. Spécialisé en IA, automatisation, et intégration LLM. Disponible pour de nouveaux projets.",
  keywords: [
    'Sébastien Libert',
    'Data Analyst',
    'Full-Stack Developer',
    'AI Automation',
    'LLM Integration',
    'React',
    'Next.js',
    'TypeScript',
    'Anthropic',
    'Claude',
    'n8n',
    'AI-Native',
  ],
  authors: [{ name: 'Sébastien Libert', url: 'https://sebastien-libert.dev' }],
  creator: 'Sébastien Libert',
  openGraph: {
    type: 'website',
    locale: 'fr_BE',
    url: 'https://sebastien-libert.dev',
    title: 'Sébastien Libert — Data Analyst & Developer IA',
    description:
      "Data Analyst & Full-Stack Developer. J'utilise l'IA comme co-pilote pour concevoir, automatiser et livrer plus vite.",
    siteName: 'Sébastien Libert Portfolio',
    images: [
      {
        url: 'https://sebastien-libert.dev/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sébastien Libert — Data Analyst & Developer IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sébastien Libert — Data Analyst & Developer IA',
    description: "Data Analyst & Full-Stack Developer. 14 ans d'expérience IT, IA & automatisation.",
    images: ['https://sebastien-libert.dev/og-image.png'],
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
  name: 'Sébastien Libert',
  jobTitle: 'Data Analyst & Full-Stack Developer — AI & Automation',
  description: 'Data Analyst et développeur full-stack avec 14 ans d\'expérience IT, spécialisé en IA et automatisation.',
  url: 'https://sebastien-libert.dev',
  sameAs: [
    'https://linkedin.com/in/sébastien-libert',
    'https://github.com/FoIIon',
  ],
  knowsAbout: ['LLM Integration', 'Data Analytics', 'React', 'Next.js', 'TypeScript', 'Python', 'Anthropic Claude API', 'n8n', 'Google Analytics'],
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'Haute École HELMo Saint-Laurent',
  },
  worksFor: {
    '@type': 'Organization',
    name: 'Knewledge',
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

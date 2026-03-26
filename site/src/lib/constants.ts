import cvData from '../../../data/cv.json'
import projectsData from '../../../data/projects.json'

export type Skill = {
  name: string
  level: number
}

export type Experience = {
  company: string
  url: string | null
  role: string
  start: string
  end: string | null
  location: string
  description: string
  achievements: string[]
  tech: string[]
}

export type Education = {
  institution: string
  degree: string
  field: string
  start: string
  end: string
  gpa: string
  honors: string
  highlights: string[]
}

export type Project = {
  id: string
  title: string
  subtitle: string
  description: string
  longDescription: string
  tech: string[]
  github: string | null
  demo: string | null
  image: string
  highlights: string[]
  status: string
  year: number
  featured: boolean
}

export type CV = {
  name: string
  title: string
  tagline: string
  bio: string
  contact: {
    email: string
    phone: string
    location: string
    linkedin: string
    github: string
    website: string
    twitter: string
  }
  skills: {
    'AI & Automation': Skill[]
    'Data & Analytics': Skill[]
    Development: Skill[]
    'Cloud & Systems': Skill[]
  }
  experience: Experience[]
  education: Education[]
  languages: Array<{ language: string; level: string }>
  certifications: Array<{ name: string; issuer: string; year: number }>
  openSource: Array<{ project: string; description: string; stars: number; url: string }>
  values: string[]
}

export const cv = cvData as CV
export const projects = projectsData as Project[]

export const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Playground', href: '#playground' },
  { label: 'Skills', href: '#skills' },
  { label: 'Timeline', href: '#timeline' },
  { label: 'Contact', href: '#contact' },
]

export const SITE_URL = 'https://sebastien-libert.dev'
export const MAX_CHAT_MESSAGES = 10

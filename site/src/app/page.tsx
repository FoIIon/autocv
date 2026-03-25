import Navigation from '@/components/ui/Navigation'
import HeroSection from '@/components/sections/HeroSection'
import ManifestoSection from '@/components/sections/ManifestoSection'
import ProjectsSection from '@/components/sections/ProjectsSection'
import AIPlayground from '@/components/sections/AIPlayground'
import SkillsSection from '@/components/sections/SkillsSection'
import TimelineSection from '@/components/sections/TimelineSection'
import ContactSection from '@/components/sections/ContactSection'

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Navigation />
      <HeroSection />
      <ManifestoSection />
      <ProjectsSection />
      <AIPlayground />
      <SkillsSection />
      <TimelineSection />
      <ContactSection />
    </main>
  )
}

import AboutSection from "../components/landing/AboutSection";
import EventsSection from "../components/landing/EventsSection";
import HeroSection from "../components/landing/HeroSection";
import HighlightsSection from "../components/landing/HighlightsSection";
import SponsorsSection from "../components/landing/SponsorsSection";
import TimelineSection from "../components/landing/TimelineSection";
import { ParallaxBackground } from "../components/ui/parallax-background";
import { KineticHUD } from "../components/ui/kinetic-hud";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <ParallaxBackground />
      <KineticHUD />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-0 sm:px-6 lg:px-8">
        <HeroSection />
        <div className="flex flex-col gap-24 py-24 sm:gap-32 sm:py-32">
          <AboutSection />
          <EventsSection />
          <TimelineSection />
          <HighlightsSection />
          <SponsorsSection />
        </div>
      </div>

      {/* Retro Footer Decal */}
      <footer className="relative z-10 py-10 border-t border-white/5 bg-black/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600">
            © 2026 AI4 IMPACT // ALL SYSTEMS OPERATIONAL
          </p>
        </div>
      </footer>
    </main>
  );
}

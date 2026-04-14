import AboutSection from "../components/landing/AboutSection";
import EventsSection from "../components/landing/EventsSection";
import HeroSection from "../components/landing/HeroSection";
import HighlightsSection from "../components/landing/HighlightsSection";
import LandingNavbar from "../components/landing/LandingNavbar";
import SponsorsSection from "../components/landing/SponsorsSection";
import TimelineSection from "../components/landing/TimelineSection";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050508] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-[45vw] w-[45vw] rounded-full bg-violet-900/40 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-[34vw] w-[34vw] rounded-full bg-blue-700/40 blur-3xl" />
        <div className="absolute left-1/3 top-1/3 h-[28vw] w-[28vw] rounded-full bg-fuchsia-700/25 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 pb-16 pt-6 sm:px-8 md:gap-14 lg:px-12">
        <LandingNavbar />
        <HeroSection />
        <AboutSection />
        <EventsSection />
        <TimelineSection />
        <HighlightsSection />
        <SponsorsSection />
      </div>
    </main>
  );
}

import Image from "next/image";

export default function HeroSection() {
  return (
    <section id="hero" className="grid min-h-[74vh] items-center gap-8 pt-8 md:grid-cols-2 md:gap-12 md:pt-12">
      <div>
        <p className="mb-4 inline-flex rounded-full border border-cyan-400/50 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-[0.3em] text-cyan-200">
          HACKATHON 2026
        </p>
        <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-[0.06em] sm:text-6xl lg:text-7xl">
          AI4
          <br />
          IMPACT
        </h1>
        <p className="mt-5 max-w-xl text-sm text-zinc-300 sm:text-base">
          Build practical AI solutions for real-world social impact with mentors, domain experts, and
          creators from across engineering, design, and policy.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="/auth"
            className="rounded-xl border border-fuchsia-300/60 bg-gradient-to-r from-fuchsia-500/25 to-blue-500/25 px-6 py-3 text-sm tracking-[0.18em] transition duration-300 hover:shadow-[0_0_24px_rgba(167,139,250,0.45)]"
          >
            REGISTER
          </a>
          <p className="text-xs tracking-[0.2em] text-zinc-400">JUNE 24 - JUNE 26</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl sm:p-9">
        <Image
          src="/hazard.svg"
          alt="Decorative hazard stripe"
          width={160}
          height={160}
          className="pointer-events-none absolute right-0 top-0 opacity-70"
        />
        <div className="relative mx-auto flex max-w-sm items-center justify-center">
          <Image
            src="/logo-w.svg"
            alt="AI4 Impact logo"
            width={420}
            height={420}
            className="h-auto w-full drop-shadow-[0_0_28px_rgba(255,255,255,0.2)]"
            priority
          />
        </div>
      </div>
    </section>
  );
}
const milestones = ["Registration", "Team Matching", "Build Sprint", "Final Demos"];

export default function TimelineSection() {
  return (
    <section id="timeline" className="space-y-5">
      <h2 className="bg-gradient-to-r from-white to-violet-300 bg-clip-text text-3xl uppercase tracking-[0.08em] text-transparent sm:text-4xl">
        Timeline
      </h2>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-7">
        <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-5 right-5 top-4 hidden h-px bg-gradient-to-r from-cyan-400/40 via-fuchsia-400/40 to-blue-400/40 lg:block" />

          {milestones.map((item) => (
            <div key={item} className="relative flex items-center gap-3 lg:flex-col lg:items-start">
              <span className="h-3 w-3 rounded-full border border-fuchsia-300/80 bg-[#050508] shadow-[0_0_14px_rgba(217,70,239,0.85)] lg:mb-5" />
              <p className="text-sm uppercase tracking-[0.09em] text-zinc-200 sm:text-base">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
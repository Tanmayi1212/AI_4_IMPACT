const events = [
  {
    title: "Build Sprint",
    detail: "36-hour product sprint with mentor checkpoints and technical office hours.",
  },
  {
    title: "Demo Arena",
    detail: "Pitch your prototype to judges across impact, innovation, and feasibility criteria.",
  },
];

export default function EventsSection() {
  return (
    <section id="events" className="space-y-5">
      <h2 className="bg-gradient-to-r from-white to-blue-300 bg-clip-text text-3xl uppercase tracking-[0.08em] text-transparent sm:text-4xl">
        Events
      </h2>
      <div className="space-y-4">
        {events.map((event, idx) => (
          <article
            key={event.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:border-blue-300/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl uppercase tracking-[0.08em] text-zinc-100 sm:text-2xl">
                {event.title}
              </h3>
              <span className="rounded-full border border-white/20 bg-gradient-to-r from-blue-500/20 to-fuchsia-500/20 px-3 py-1 text-xs tracking-[0.15em] text-zinc-300">
                PHASE 0{idx + 1}
              </span>
            </div>
            <p className="mt-3 text-sm text-zinc-300 sm:text-base">{event.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
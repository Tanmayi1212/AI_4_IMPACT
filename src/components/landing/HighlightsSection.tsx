const stats = [
  { label: "Tracks", value: "04" },
  { label: "Mentors", value: "30+" },
  { label: "Teams", value: "75" },
];

export default function HighlightsSection() {
  return (
    <section id="highlights" className="space-y-5">
      <h2 className="bg-gradient-to-r from-white to-fuchsia-300 bg-clip-text text-3xl uppercase tracking-[0.08em] text-transparent sm:text-4xl">
        Highlights
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/15 to-fuchsia-500/20 p-7 backdrop-blur-xl md:col-span-3">
          <p className="text-xs tracking-[0.2em] text-zinc-300">PRIZE POOL</p>
          <h3 className="mt-2 text-4xl uppercase tracking-[0.06em] text-white sm:text-5xl">
            Rs. 2,00,000+
          </h3>
        </article>

        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl"
          >
            <p className="text-4xl uppercase tracking-[0.08em] text-cyan-200 sm:text-5xl">
              {stat.value}
            </p>
            <p className="mt-2 text-xs tracking-[0.2em] text-zinc-400">{stat.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
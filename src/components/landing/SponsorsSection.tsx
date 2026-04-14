const sponsors = ["Cloud Partner", "AI Partner", "Education Partner", "Community Partner", "Media Partner"];

export default function SponsorsSection() {
  return (
    <section id="sponsors" className="space-y-5 pb-8">
      <h2 className="bg-gradient-to-r from-white to-blue-300 bg-clip-text text-3xl font-bold uppercase tracking-[0.08em] text-transparent sm:text-4xl">
        Sponsors
      </h2>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {sponsors.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500/15 to-fuchsia-500/15 px-4 py-6 text-center text-xs tracking-[0.13em] text-zinc-300"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <footer className="pt-5 text-center text-xl uppercase tracking-[0.3em] text-zinc-500">
        OC
      </footer>
    </section>
  );
}
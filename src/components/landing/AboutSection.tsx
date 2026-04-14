const cards = [
  {
    title: "Gap",
    text: "Critical impact sectors still struggle to translate AI prototypes into deployable and ethical products that communities can trust.",
  },
  {
    title: "Approach",
    text: "Teams pair with challenge owners and mentors to move from idea to tested proof-of-impact through rapid design, validation, and demos.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="space-y-5">
      <h2 className="bg-gradient-to-r from-white to-fuchsia-300 bg-clip-text text-3xl uppercase tracking-[0.08em] text-transparent sm:text-4xl">
        About
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-fuchsia-300/35"
          >
            <h3 className="text-2xl uppercase tracking-[0.08em] text-cyan-200">
              {card.title}
            </h3>
            <p className="mt-3 text-sm text-zinc-300 sm:text-base">{card.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
const navItems = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Events", href: "#events" },
  { label: "Timeline", href: "#timeline" },
  { label: "Highlights", href: "#highlights" },
  { label: "Sponsors", href: "#sponsors" },
];

export default function LandingNavbar() {
  return (
    <header className="sticky top-3 z-30">
      <nav className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <a href="#hero" className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-100 sm:text-base">
            AI4
          </a>

          <ul className="flex flex-wrap justify-end gap-2 sm:gap-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-zinc-300 transition hover:border-fuchsia-300/40 hover:bg-fuchsia-400/10 hover:text-white sm:text-xs"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
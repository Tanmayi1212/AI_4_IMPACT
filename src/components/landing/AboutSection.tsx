"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const cards = [
  {
    title: "The Vision Gap",
    text: "Critical impact sectors still struggle to translate AI prototypes into deployable and ethical products that communities can trust. We close this gap through rapid prototyping and domain-expert validation.",
    index: "01",
    accent: "fuchsia",
  },
  {
    title: "Strategic Impact",
    text: "Teams pair with challenge owners and mentors to move from idea to tested proof-of-impact through rapid design, validation, and demos. No fluff, just results.",
    index: "02",
    accent: "cyan",
  },
];

export default function AboutSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const xText = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  return (
    <section id="about" ref={containerRef} className="relative py-32 overflow-hidden">
      {/* Kinetic Background Text */}
      <motion.div 
        style={{ x: xText }}
        className="absolute top-10 whitespace-nowrap text-[12vw] font-black uppercase tracking-tighter text-white/[0.02] pointer-events-none select-none"
      >
        MISSION_PROTOCOL_2026 // SOCIAL_IMPACT_LAYER // 
      </motion.div>

      <div className="relative z-10 grid gap-20 lg:grid-cols-12">
        {/* Left Side: Header */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-8 bg-fuchsia-500" />
              <span className="text-[10px] font-black tracking-[0.5em] text-fuchsia-500">CORE_OBJECTIVE</span>
            </div>
            <h2 className="text-5xl font-black uppercase tracking-tighter text-white sm:text-7xl lg:text-8xl">
              THE <span className="bg-gradient-to-r from-fuchsia-400 to-fuchsia-600 bg-clip-text text-transparent">WHY</span>
            </h2>
            <p className="mt-8 text-xl text-zinc-500 max-w-sm leading-relaxed">
              Engineering solutions for the world's most pressing challenges.
              Where high-tech meets high-purpose.
            </p>
          </motion.div>
        </div>

        {/* Right Side: Overlapping Cards */}
        <div className="lg:col-span-7 relative pt-12 lg:pt-0">
          <div className="flex flex-col gap-12 lg:gap-0 lg:relative lg:h-[600px]">
            {cards.map((card, idx) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`relative group max-w-md ${
                  idx === 1 ? "lg:absolute lg:bottom-0 lg:right-0" : "lg:absolute lg:top-0 lg:left-0"
                }`}
              >
                <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-white/10 to-transparent blur-xl opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-black/60 p-10 backdrop-blur-3xl transition-all duration-500 group-hover:border-white/20">
                  <div className={`absolute -right-4 -top-4 text-9xl font-black transition-colors ${
                    card.accent === 'fuchsia' ? 'text-fuchsia-500/[0.03] group-hover:text-fuchsia-500/[0.08]' : 'text-cyan-500/[0.03] group-hover:text-cyan-500/[0.08]'
                  }`}>
                    {card.index}
                  </div>
                  
                  <h3 className={`text-3xl font-bold uppercase tracking-wide ${
                    card.accent === 'fuchsia' ? 'text-fuchsia-400' : 'text-cyan-400'
                  }`}>
                    {card.title}
                  </h3>
                  <p className="mt-6 text-lg leading-relaxed text-zinc-400">
                    {card.text}
                  </p>
                  
                  <div className={`mt-8 h-[2px] w-12 transition-all duration-700 group-hover:w-full ${
                    card.accent === 'fuchsia' ? 'bg-fuchsia-500/50' : 'bg-cyan-500/50'
                  }`} />
                </div>
              </motion.article>
            ))}
            
            {/* Decorative Connector (Desktop Only) */}
            <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/5 rounded-full blur-[1px] pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
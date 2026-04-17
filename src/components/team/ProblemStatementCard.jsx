import { motion } from "framer-motion";

export default function ProblemStatementCard({ problem, onClick, isSelected }) {
  const { title, description, currentCount, maxCount } = problem;
  const isFull = currentCount >= maxCount;

  return (
    <motion.div
      whileHover={!isFull ? { scale: 1.02, translateY: -5 } : {}}
      whileTap={!isFull ? { scale: 0.98 } : {}}
      onClick={!isFull ? onClick : undefined}
      className={`relative group perspective-1000 ${isFull ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className={`relative h-full backdrop-blur-xl rounded-[32px] border transition-all duration-500 overflow-hidden ${
        isSelected 
          ? 'bg-[#8D36D5]/20 border-[#8D36D5] shadow-[0_0_30px_rgba(141,54,213,0.3)]' 
          : 'bg-[#0F061C]/50 border-white/10 hover:border-[#00FFFF]/50 hover:shadow-[0_0_40px_rgba(0,255,255,0.15)]'
      }`}>
        {/* Hardware details */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none" />
        <div className="absolute top-4 left-4 h-1.5 w-8 rounded-full bg-white/10" />

        <div className="p-8 flex flex-col h-full gap-2">
          {/* Title Area with fixed height and original heading font */}
          <div className="flex justify-between items-start gap-4 min-h-[100px]">
            <h3 className="text-xl font-bold text-white uppercase tracking-tight leading-tight group-hover:text-[#00FFFF] transition-colors font-heading drop-shadow-sm">
              {title}
            </h3>
            <span className={`flex-shrink-0 text-[10px] font-black px-4 py-2 rounded-xl border-2 tracking-[0.1em] shadow-[0_0_20px_rgba(0,255,255,0.2)] font-body ${
              isFull 
                ? 'bg-rose-500 border-rose-400 text-white' 
                : 'bg-[#00FFFF] border-[#00FFFF] text-[#010101] font-black'
            }`}>
              {isFull ? "FULL" : `${currentCount}/${maxCount} SLOTS`}
            </span>
          </div>

          <p className="text-white/80 text-sm leading-relaxed line-clamp-3 font-medium font-body tracking-wide">
            {description}
          </p>

          <div className="mt-auto pt-6 flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase font-body opacity-60">
              ID: {problem.id}
            </span>
            <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
              <span className="text-[10px] font-black text-[#00FFFF] tracking-widest uppercase font-heading">VIEW DETAILS</span>
              <svg className="w-4 h-4 text-[#00FFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Scan effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00FFFF]/5 to-transparent -translate-y-full group-hover:animate-scan pointer-events-none" />
      </div>
    </motion.div>
  );
}

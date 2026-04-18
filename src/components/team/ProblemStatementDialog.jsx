import { motion, AnimatePresence } from "framer-motion";

export default function ProblemStatementDialog({ problem, onClose, onSelect }) {
  if (!problem) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Dialog Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-[#0F061C]/90 border border-white/20 rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-8 sm:p-10 border-b border-white/10 flex justify-between items-start gap-6 bg-white/5">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[#00FFFF] tracking-[0.4em] uppercase font-body opacity-80">PROBLEM_DEFINITION</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-tight leading-tight drop-shadow-lg font-heading">
                {problem.title}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all font-sans"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-8 sm:p-10 custom-scrollbar">
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                  <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase block mb-2 font-body">IDENTIFIER</span>
                  <span className="text-xl font-bold text-white font-mono">{problem.id}</span>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                  <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase block mb-2 font-body">AVAILABILITY</span>
                  <span className={`text-xl font-bold ${problem.currentCount >= problem.maxCount ? 'text-rose-400' : 'text-[#00FFFF]'} font-body`}>
                    {problem.currentCount} / {problem.maxCount} TEAMS
                  </span>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 border-l-4 border-l-[#8D36D5]">
                  <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase block mb-2 font-body">STATUS</span>
                  <span className="text-xl font-bold text-[#8D36D5] font-body">OPEN_FOR_ENTRY</span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-white/90 leading-relaxed font-medium font-body tracking-wide">
                  {problem.description}
                </p>
              </div>
            </div>
          </div>

          {/* Footer - Actions */}
          <div className="p-8 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-8 py-5 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/5 transition-all text-sm"
            >
              GO BACK TO GRID
            </button>
            <button
              onClick={() => onSelect(problem)}
              disabled={problem.currentCount >= problem.maxCount}
              className="flex-[2] relative group px-8 py-5 rounded-2xl bg-[#00FFFF] text-black font-black uppercase tracking-widest overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">SELECT THIS PROBLEM</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmationModal({ onConfirm, onCancel, problemTitle }) {
  const [inputValue, setInputValue] = useState("");

  const isConfirmed = inputValue.toUpperCase() === "YES";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-md bg-[#0F061C] border-2 border-rose-500/30 rounded-[32px] p-8 sm:p-10 shadow-[0_0_50px_rgba(244,63,94,0.2)]"
        >
          <div className="flex flex-col gap-6 text-center">
            <div className="h-20 w-20 rounded-full bg-rose-500/10 border-2 border-rose-500/20 flex items-center justify-center mx-auto mb-2 text-rose-500">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">CRITICAL LOCKIN</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                You are about to select <span className="text-white font-bold">&quot;{problemTitle}&quot;</span>.
                This action is <span className="text-rose-400 font-bold uppercase italic underline">permanent</span> and cannot be reversed.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-rose-500 tracking-[0.3em] uppercase">
                Type <span className="px-2 py-0.5 bg-rose-500 text-white rounded font-mono uppercase">YES</span> to confirm submission
              </p>
              <input
                type="text"
                autoFocus
                placeholder="TYPE YES HERE..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center font-black text-white placeholder:text-zinc-700 focus:outline-none focus:border-rose-500 transition-all uppercase"
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                disabled={!isConfirmed}
                onClick={onConfirm}
                className="w-full py-5 rounded-2xl bg-rose-500 text-white font-black uppercase tracking-widest transition-all hover:bg-rose-600 active:scale-[0.98] disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(244,63,94,0.3)]"
              >
                LOCK SELECTION
              </button>
              <button 
                onClick={onCancel}
                className="w-full py-4 rounded-2xl border border-white/5 text-zinc-500 font-bold uppercase tracking-widest text-xs hover:text-white transition-all"
              >
                ABORT_MISSION
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

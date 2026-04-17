import { motion } from "framer-motion";

export default function FrozenView() {
  return (
    <div className="p-12 sm:p-24 rounded-[48px] border-4 border-dashed border-zinc-800 bg-white/[0.01] text-center flex flex-col items-center gap-8">
      <div className="h-24 w-24 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center text-zinc-600 animate-pulse">
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <div className="space-y-4">
        <h3 className="text-3xl font-black text-zinc-500 uppercase tracking-tighter">PROBLEM_STATEMENT_FREEZED</h3>
        <p className="text-zinc-600 max-w-md mx-auto text-lg leading-relaxed font-medium">
          The 20-minute selection window has expired. Since no problem statement was chosen, the system is now locked. Please contact the organizers for support.
        </p>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
      >
        REFRESH_SYSTEM_CLIENT
      </button>
    </div>
  );
}

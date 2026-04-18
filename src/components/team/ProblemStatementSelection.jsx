import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DUMMY_PROBLEMS } from "../../../lib/constants/problem-statements";
import ProblemStatementCard from "./ProblemStatementCard";
import ProblemStatementDialog from "./ProblemStatementDialog";
import ConfirmationModal from "./ConfirmationModal";
import FrozenView from "./FrozenView";

// DEMO_MODE: Set to true to bypass countdown and show grid immediately
const IS_DEMO_MODE = true; 

const RELEASE_TIME = new Date("2026-04-17T11:30:00").getTime();
const SELECTION_DURATION_MS = 20 * 60 * 1000; // 20 minutes

export default function ProblemStatementSelection({ initialSelectedProblem = null }) {
  const [now, setNow] = useState(() => Date.now());
  const [selectedProblem, setSelectedProblem] = useState(initialSelectedProblem);
  const [activeProblem, setActiveProblem] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [liveStartTime] = useState(() =>
    IS_DEMO_MODE || Date.now() >= RELEASE_TIME ? Date.now() : RELEASE_TIME
  );

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine current phase
  const phase = useMemo(() => {
    if (selectedProblem) return "LOCKED";
    
    // DEMO MODE BYPASS
    if (IS_DEMO_MODE) return "LIVE";

    if (now < RELEASE_TIME) return "IDLE";
    
    const startTime = liveStartTime || RELEASE_TIME;
    if (now > startTime + SELECTION_DURATION_MS) return "FROZEN";
    
    return "LIVE";
  }, [now, selectedProblem, liveStartTime]);

  const handleSelectRequest = (problem) => {
    setActiveProblem(problem);
    setShowConfirm(true);
  };

  const handleConfirmSelection = () => {
    setSelectedProblem(activeProblem);
    setShowConfirm(false);
    setActiveProblem(null);
    // In a real app, this would hit an API
  };

  const getTimeRemaining = (target) => {
    const diff = target - now;
    if (diff <= 0) return "00:00:00";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (phase === "IDLE") {
    return (
      <div className="p-12 sm:p-24 rounded-[48px] bg-white/[0.02] border-4 border-dashed border-white/10 text-center transition-all hover:bg-white/[0.04] flex flex-col items-center gap-8">
        <div className="space-y-4">
          <p className="text-[11px] sm:text-[18px] font-black text-zinc-600 tracking-[0.6em] uppercase">SYSTEM_INITIATED: AWAITING_RELEASE</p>
          <div className="text-6xl sm:text-8xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            {getTimeRemaining(RELEASE_TIME)}
          </div>
          <p className="text-sm font-bold text-[#00FFFF] tracking-[0.3em] uppercase opacity-70">Problem Statements Unlocking at 11:30 AM</p>
        </div>
      </div>
    );
  }

  if (phase === "FROZEN") {
    return <FrozenView />;
  }

  if (phase === "LOCKED") {
    return (
      <div className="p-8 sm:p-14 rounded-[48px] bg-gradient-to-br from-[#8D36D5]/30 to-[#46067A]/15 border-2 border-[#8D36D5]/50 shadow-[0_40px_120px_rgba(0,0,0,0.8)] relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none text-white font-sans">
          <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
          </svg>
        </div>
        
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-[#8D36D5] tracking-[0.4em] uppercase">SELECTION_SECURED</span>
            <h3 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter pr-40 leading-tight">
              {selectedProblem.problem_title || selectedProblem.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-10 pt-8 border-t border-white/10">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">CHALLENGE ID</span>
              <span className="text-2xl font-black text-white font-mono bg-white/5 px-4 py-2 rounded-xl">
                #{selectedProblem.problem_id || selectedProblem.id}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">STATUS</span>
              <span className="text-base font-bold text-emerald-400 font-mono italic flex items-center gap-2 font-sans">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                LOCKED_AND_VERIFIED
              </span>
            </div>
          </div>

          <div className="bg-white/5 p-8 rounded-3xl border border-white/5 text-zinc-300 leading-relaxed font-medium">
            {selectedProblem.description}
          </div>
        </div>
      </div>
    );
  }

  // Phase is LIVE
  return (
    <div className="space-y-12">
      {/* 20-minute selection timer banner */}
      <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-3xl px-8 py-6 backdrop-blur-md">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-[#00FFFF] tracking-[0.2em] uppercase">TIME REMAINING TO SELECT</span>
          <div className="text-2xl font-black text-white font-mono tracking-widest tabular-nums">
            {getTimeRemaining((liveStartTime || RELEASE_TIME) + SELECTION_DURATION_MS)}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-zinc-500 font-sans">
           <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
           <span className="text-[10px] font-black tracking-widest uppercase">SYSTEM_LIVE: BROWSING_ENTRIES</span>
        </div>
      </div>

      {/* Grid of 3 cards per row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {DUMMY_PROBLEMS
          .filter(p => p.currentCount < p.maxCount) 
          .map((problem) => (
            <ProblemStatementCard 
              key={problem.id} 
              problem={problem} 
              onClick={() => setActiveProblem(problem)}
            />
          ))
        }
      </div>

      {/* Detail Dialog */}
      <ProblemStatementDialog 
        problem={activeProblem} 
        onClose={() => setActiveProblem(null)}
        onSelect={handleSelectRequest}
      />

      {/* Confirmation Modal */}
      {showConfirm && (
        <ConfirmationModal 
          problemTitle={activeProblem?.title}
          onConfirm={handleConfirmSelection}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}

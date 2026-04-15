"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { getUserRole, logoutAdmin, onUserAuthChange } from "../../../lib/auth";
import { toRuntimeApiUrl } from "../../../lib/api-base";
import { buildRuntimeIdTokenHeaders } from "../../../lib/runtime-auth";
import { ROLES } from "../../../lib/constants/roles";

function DashboardCard({ children, className = "", sheenColor = "rgba(141, 54, 213, 0.1)" }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mouseXSpring = useSpring(mouseX);
  const mouseYSpring = useSpring(mouseY);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["3deg", "-3deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-3deg", "3deg"]);
  const sheenX = useTransform(mouseXSpring, [-0.5, 0.5], ["20%", "-20%"]);
  const sheenY = useTransform(mouseYSpring, [-0.5, 0.5], ["20%", "-20%"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY }}
      className={`perspective-1000 preserve-3d group ${className}`}
    >
      <motion.div 
        className="relative backdrop-blur-[32px] overflow-hidden rounded-[32px] border border-white/10 bg-[#0F061C]/50 shadow-[0_32px_80px_rgba(0,0,0,0.5)] p-0.5 glass-sheen"
        style={{ "--sheen-x": sheenX, "--sheen-y": sheenY }}
      >
        <div className="scanning-ray opacity-10 group-hover:opacity-30 transition-opacity" />
        <div className="relative z-10 p-8 sm:p-10">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "pending").toLowerCase();

  const configMap = {
    verified: {
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/20",
      glowColor: "shadow-[0_0_15px_rgba(16,185,129,0.1)]",
      label: "VERIFIED_OK",
    },
    rejected: {
      bgColor: "bg-rose-500/10",
      textColor: "text-rose-400",
      borderColor: "border-rose-500/20",
      glowColor: "shadow-[0_0_15px_rgba(244,63,94,0.1)]",
      label: "SYNC_FAILED",
    },
    pending: {
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/20",
      glowColor: "shadow-[0_0_15px_rgba(245,158,11,0.1)]",
      label: "PENDING_VAL",
    },
  };

  const cfg = configMap[normalized] || configMap.pending;

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-black tracking-[0.2em] border ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor} ${cfg.glowColor} transition-all duration-300`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.textColor.replace('text-', 'bg-')} animate-pulse`} />
      {cfg.label}
    </span>
  );
}

export default function TeamLeadDashboard() {
  const router = useRouter();

  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (currentUser, isRefresh = false) => {
    if (!currentUser) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch(toRuntimeApiUrl("/api/team/dashboard"), {
        headers: buildRuntimeIdTokenHeaders(idToken),
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/auth");
          return;
        }

        throw new Error(data?.error || "Failed to load team dashboard.");
      }

      setDashboard(data?.dashboard || null);
    } catch (err) {
      setDashboard(null);
      setError(err?.message || "Failed to load team dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    let isActive = true;

    const unsub = onUserAuthChange(
      (nextUser) => {
        const resolve = async () => {
          if (!isActive) return;

          if (!nextUser) {
            setAuthChecking(false);
            router.replace("/auth");
            return;
          }

          const role = await getUserRole(nextUser);
          if (!isActive) return;

          if (role === ROLES.ADMIN) {
            router.replace("/admin");
            return;
          }

          setUser(nextUser);
          setAuthChecking(false);
          await fetchDashboard(nextUser, false);
        };

        void resolve();
      },
      () => {
        if (!isActive) return;
        setAuthChecking(false);
        router.replace("/auth");
      }
    );

    return () => {
      isActive = false;
      unsub();
    };
  }, [fetchDashboard, router]);

  const handleRefresh = async () => {
    if (!user || refreshing) return;
    await fetchDashboard(user, true);
  };

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace("/auth");
  };

  const createdAtLabel = useMemo(() => {
    const createdAt = dashboard?.team?.created_at;
    if (!createdAt) return "N/A";

    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [dashboard?.team?.created_at]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.3 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  if (authChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-sm font-bold tracking-[0.4em] text-[#00FFFF] uppercase animate-pulse">
          &gt;&gt; LOADING_TEAM_TERMINAL...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07020E] text-[#EDE8F5] selection:bg-[#8D36D5]/30 relative overflow-hidden font-[var(--font-body)]">
      {/* Immersive Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute inset-0 animate-breathing"
          style={{ 
            backgroundImage: `repeating-linear-gradient(0deg, rgba(141,54,213,0.06) 0px, transparent 1px, transparent 100px, rgba(141,54,213,0.06) 100px), repeating-linear-gradient(90deg, rgba(141,54,213,0.06) 0px, transparent 1px, transparent 100px, rgba(141,54,213,0.06) 100px)`,
            maskImage: "radial-gradient(ellipse at 50% 50%, black 0%, transparent 90%)"
          }} 
        />
        
        <motion.div
          className="absolute -left-24 -top-28 w-[600px] h-[600px] rounded-full blur-[100px] opacity-[0.1] bg-[#46067A]"
          animate={{ x: [0, 50], y: [0, 80], scale: [1, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-20 top-[40%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.08] bg-[#8D36D5]"
          animate={{ x: [0, -60], y: [0, 100], scale: [1, 1.2, 1] }}
          transition={{ duration: 30, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        
        <div className="noise-overlay opacity-[0.03]" />
      </div>

      {/* HUD Header */}
      <div className="sticky top-[78px] sm:top-[98px] z-[100] border-b border-white/10 bg-[#0F061C]/80 backdrop-blur-[40px] px-6 py-4 shadow-[0_20px_80px_rgba(0,0,0,0.7)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center sm:px-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h1 className="text-xl font-black uppercase tracking-tighter sm:text-3xl flex items-center gap-2 text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60"
                style={{ textShadow: '0 0 20px rgba(141, 54, 213, 0.4)' }}>
              CORE<span className="text-[#8D36D5]">_</span>DASH
              <span className="hidden sm:inline-block h-2 w-2 rounded-full bg-[#00FFFF] animate-pulse ml-2 shadow-[0_0_10px_#00FFFF]" />
            </h1>
            <div className="flex items-center gap-3 opacity-80 mt-1">
              <span className="text-[10px] font-bold text-[#00FFFF] tracking-[0.2em] uppercase">
                NODE_AUTH: {user?.email?.split('@')[0] || "TEMP_USER"}
              </span>
              <span className="h-1 w-1 rounded-full bg-zinc-700" />
              <div className="flex items-center gap-1.5">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                 <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">ENCRYPTED_LINK_ACTIVE</span>
              </div>
            </div>
          </motion.div>
          <div className="flex gap-4">
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 overflow-hidden"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <div className="absolute inset-0 bg-white/[0.05] border border-white/10 group-hover:bg-white/[0.08] transition-colors" />
              <span className="relative text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-white">
                <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">{refreshing ? "SYNCING..." : "REFRESH_DATA"}</span>
              </span>
            </motion.button>
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-6 py-2.5 rounded-xl transition-all overflow-hidden"
              onClick={handleLogout}
            >
              <div className="absolute inset-0 bg-rose-500/10 border border-rose-500/20 group-hover:bg-rose-500/20 transition-all" />
              <span className="relative text-[10px] font-black uppercase tracking-widest text-rose-400 group-hover:text-rose-300 transition-colors">
                EXIT_SYSTEM
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto pt-8 pb-24 px-6 sm:px-12 relative z-10 lg:pt-12"
      >
        {error && (
          <motion.div 
            variants={itemVariants}
            className="mb-8 p-6 rounded-[24px] bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-[11px] tracking-widest flex items-center gap-4 uppercase shadow-xl"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-sm">!</div>
            <span>ALERT_OVERRIDE: {error}</span>
          </motion.div>
        )}

        {dashboard && (
          <div className="grid grid-cols-1 gap-8 sm:gap-12">
            {/* 01 Identification Matrix */}
            <motion.div variants={itemVariants}>
              <DashboardCard>
                <div className="flex justify-between items-start mb-10">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black tracking-[0.6em] text-[#8D36D5] uppercase opacity-90">01 // IDENTIFICATION_MATRIX</span>
                    <div className="h-0.5 w-16 bg-gradient-to-r from-[#8D36D5] to-transparent" />
                  </div>
                  <div className="p-4 rounded-2xl bg-[#8D36D5]/5 border border-[#8D36D5]/10 shadow-[0_0_20px_rgba(141,54,213,0.1)]">
                    <svg className="w-6 h-6 text-[#8D36D5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "TEAM_DESIGNATOR", val: dashboard.team?.team_name, color: "text-white" },
                    { label: "ORBITAL_BASE", val: dashboard.team?.college, color: "text-zinc-400" },
                    { label: "UNIT_CAPACITY", val: dashboard.team?.team_size, color: "text-[#00FFFF]" },
                    { label: "COMMISSION_DATE", val: createdAtLabel, color: "text-zinc-500" }
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col gap-3 group/item">
                      <span className="text-[9px] font-black text-zinc-600 tracking-[0.3em] uppercase transition-colors group-hover/item:text-[#8D36D5]">
                        {item.label}
                      </span>
                      <div className="h-12 flex items-center">
                        <span className={`text-lg font-black uppercase truncate transition-all duration-300 group-hover/item:translate-x-1 ${item.color}`}>
                          {item.val || "NULL_SEC"}
                        </span>
                      </div>
                      <div className="h-[1px] w-full bg-white/5 group-hover/item:bg-white/20 transition-all duration-700" />
                    </div>
                  ))}
                </div>
              </DashboardCard>
            </motion.div>

            {/* 02 Transaction Protocol */}
            <motion.div variants={itemVariants}>
              <DashboardCard sheenColor="rgba(0, 255, 255, 0.1)">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black tracking-[0.6em] text-[#00FFFF] uppercase opacity-90">02 // TRANSACTION_CORE</span>
                    <div className="h-0.5 w-16 bg-gradient-to-r from-[#00FFFF] to-transparent" />
                  </div>
                  <div className="p-4 rounded-2xl bg-[#00FFFF]/5 border border-[#00FFFF]/10 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
                    <svg className="w-6 h-6 text-[#00FFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center gap-12">
                   <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-12">
                      <div className="flex flex-col gap-3">
                        <span className="text-[9px] font-black text-zinc-600 tracking-[0.3em] uppercase">QUOTA_VALUE</span>
                        <span className="text-4xl font-black text-white tracking-tighter" style={{ textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>₹{dashboard.payment?.amount ?? 800}</span>
                      </div>
                      <div className="flex flex-col gap-3">
                        <span className="text-[9px] font-black text-zinc-600 tracking-[0.3em] uppercase">UPLINK_REFERENCE</span>
                        <span className="text-[11px] font-bold text-[#00FFFF] font-mono tracking-tighter uppercase break-all bg-white/[0.03] p-4 rounded-2xl border border-white/10 shadow-inner group/ref">
                          {dashboard.payment?.upi_transaction_id || "NOT_ASSIGNED"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-3">
                        <span className="text-[9px] font-black text-zinc-600 tracking-[0.3em] uppercase">SYNC_STATUS</span>
                        <div className="flex items-center">
                          <StatusBadge status={dashboard.payment?.status} />
                        </div>
                      </div>
                   </div>

                  {dashboard.payment?.screenshot_url && (
                    <div className="flex items-center lg:justify-end">
                      <a
                        href={dashboard.payment.screenshot_url}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative flex w-full sm:w-auto items-center justify-center overflow-hidden rounded-2xl px-10 py-5 transition-all hover:scale-[1.05] active:scale-[0.95]"
                      >
                        <div className="absolute inset-0 bg-white text-black transition-all duration-500 group-hover:bg-[#00FFFF] shadow-[0_20px_40px_rgba(0,0,0,0.5)]" />
                        <span className="relative text-[10px] font-black uppercase tracking-[0.5em] text-black">
                          OPEN_MANIFEST
                        </span>
                      </a>
                    </div>
                  )}
                </div>
              </DashboardCard>
            </motion.div>

            {/* 03 Personnel Database */}
            <motion.div variants={itemVariants}>
              <DashboardCard>
                <div className="flex justify-between items-start mb-10">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black tracking-[0.6em] text-[#8D36D5] uppercase opacity-90">03 // PERSONNEL_DB</span>
                    <div className="h-0.5 w-16 bg-gradient-to-r from-[#8D36D5] to-transparent" />
                  </div>
                  <span className="text-[10px] font-black text-zinc-700 tracking-[0.4em] uppercase">LEVEL_4_ENCRYPT</span>
                </div>

                <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0 custom-scrollbar">
                  <table className="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                      <tr className="text-[10px] font-bold text-zinc-600 tracking-[0.4em] uppercase opacity-70">
                        <th className="pb-4 px-6">DESIGNATION</th>
                        <th className="pb-4 px-6">IDENTIFIER_NAME</th>
                        <th className="pb-4 px-6">UPLINK_COMM</th>
                        <th className="pb-4 px-6 text-right">SYSTEM_KEY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dashboard.members || []).map((member) => (
                        <tr key={member.participant_id} className="group/row transition-all duration-500">
                          <td className="py-5 px-6 rounded-l-[20px] bg-white/[0.02] border-y border-l border-white/5 group-hover/row:bg-white/[0.06] group-hover/row:border-[#8D36D5]/40 transition-all">
                            <span className={`text-[9px] font-black px-4 py-1.5 rounded-lg tracking-[0.25em] uppercase ${member.is_leader ? "bg-[#8D36D5]/20 text-[#8D36D5] border border-[#8D36D5]/30 shadow-[0_0_20px_rgba(141,54,213,0.2)]" : "bg-white/5 text-zinc-600 border border-white/5"}`}>
                              {member.is_leader ? "CMD_LEAD" : "UNIT_REP"}
                            </span>
                          </td>
                          <td className="py-5 px-6 bg-white/[0.02] border-y border-white/5 group-hover/row:bg-white/[0.06] transition-all">
                            <span className="text-sm font-black text-white uppercase tracking-tight group-hover/row:text-[#8D36D5] transition-colors">{member.name || "UNNAMED_ENTITY"}</span>
                          </td>
                          <td className="py-5 px-6 bg-white/[0.02] border-y border-white/5 group-hover/row:bg-white/[0.06] transition-all">
                            <span className="text-[11px] font-medium text-zinc-500 lowercase font-mono opacity-80 group-hover/row:opacity-100 transition-opacity">
                              {member.email || "---"}
                            </span>
                          </td>
                          <td className="py-5 px-6 rounded-r-[20px] bg-white/[0.02] border-y border-r border-white/5 group-hover/row:bg-white/[0.06] transition-all text-right">
                            <span className="text-[11px] font-mono text-zinc-600 group-hover/row:text-[#00FFFF] transition-colors tracking-tighter">
                              {member.phone || "---"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DashboardCard>
            </motion.div>

            {/* 04 & 05 Mission Container */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
               {/* 04 Mission Objective */}
               <motion.div variants={itemVariants} className="lg:col-span-2">
                 <DashboardCard sheenColor="rgba(0, 255, 255, 0.1)">
                    <div className="flex justify-between items-start mb-10">
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black tracking-[0.6em] text-[#00FFFF] uppercase opacity-90">04 // MISSION_OBJECTIVE</span>
                        <div className="h-0.5 w-16 bg-gradient-to-r from-[#00FFFF] to-transparent" />
                      </div>
                    </div>
                    
                    {dashboard.selected_problem ? (
                      <div className="p-10 rounded-[40px] bg-gradient-to-br from-[#8D36D5]/20 to-[#46067A]/5 border border-[#8D36D5]/40 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative group/card transition-all overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--sheen-x)_var(--sheen-y),rgba(141,54,213,0.1),transparent_50%)] pointer-events-none" />
                        <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover/card:opacity-20 transition-opacity">
                           <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                             <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                           </svg>
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase mb-6 leading-tight tracking-tight sm:text-3xl drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                          {dashboard.selected_problem.problem_title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-10 pt-8 border-t border-white/10">
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">OBJ_ID:</span>
                            <span className="text-xs font-black text-[#8D36D5] font-mono tracking-tighter shadow-[0_0_10px_rgba(141,54,213,0.3)] bg-[#8D36D5]/5 px-3 py-1 rounded-md">{dashboard.selected_problem.problem_id}</span>
                          </div>
                          <div className="h-6 w-[1px] bg-white/10" />
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">LOCK_TIME:</span>
                            <span className="text-xs font-black text-zinc-400 font-mono tracking-tighter">{dashboard.selected_problem.selected_at}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-16 rounded-[40px] bg-white/[0.01] border border-dashed border-white/10 text-center group/empty">
                        <p className="text-[11px] font-black text-zinc-800 tracking-[0.8em] uppercase group-hover/empty:text-zinc-600 transition-colors">AWAITING_SELECTION_UPLINK</p>
                      </div>
                    )}
                 </DashboardCard>
               </motion.div>

               {/* 05 System Logs */}
               <motion.div variants={itemVariants}>
                 <DashboardCard>
                    <div className="flex justify-between items-start mb-10">
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black tracking-[0.6em] text-[#8D36D5] uppercase opacity-90">05 // SYS_LOGS</span>
                        <div className="h-0.5 w-16 bg-gradient-to-r from-[#8D36D5] to-transparent" />
                      </div>
                    </div>
                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                      {(dashboard.updates || []).length === 0 ? (
                        <p className="text-[10px] font-black text-zinc-900 tracking-[0.6em] uppercase text-center mt-32">IDLE_STATE</p>
                      ) : (
                        (dashboard.updates || []).map((update, idx) => (
                          <div key={idx} className="flex gap-5 items-start group/log p-4 rounded-2xl hover:bg-[#8D36D5]/5 transition-all border border-transparent hover:border-[#8D36D5]/20">
                            <span className="text-[10px] font-black text-[#8D36D5]/40 mt-1 font-mono">[{String(idx + 1).padStart(2, '0')}]</span>
                            <p className="text-[11px] font-bold text-zinc-500 tracking-wide uppercase leading-relaxed group-hover:text-zinc-300 transition-colors">{update}</p>
                          </div>
                        ))
                      )}
                    </div>
                 </DashboardCard>
               </motion.div>
            </div>
          </div>
        )}
      </motion.main>
    </div>
  );
}

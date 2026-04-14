"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserRole, logoutAdmin, onUserAuthChange } from "../../../lib/auth";
import { toRuntimeApiUrl } from "../../../lib/api-base";
import { buildRuntimeIdTokenHeaders } from "../../../lib/runtime-auth";
import { ROLES } from "../../../lib/constants/roles";

function StatusBadge({ status }) {
  const normalized = String(status || "pending").toLowerCase();

  const configMap = {
    verified: {
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      label: "VERIFIED",
    },
    rejected: {
      bgColor: "bg-rose-500/10",
      textColor: "text-rose-400",
      borderColor: "border-rose-500/30",
      label: "REJECTED",
    },
    pending: {
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/30",
      label: "PENDING",
    },
  };

  const cfg = configMap[normalized] || configMap.pending;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor} uppercase`}>
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
    <div className="min-h-screen bg-black text-white selection:bg-[#8D36D5]/30">
      {/* HUD Header */}
      <div className="sticky top-0 z-[100] bg-black/80 backdrop-blur-2xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center sm:px-8">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter sm:text-3xl">
              TEAM<span className="text-[#8D36D5]">_</span>DASHBOARD
            </h1>
            <p className="text-[10px] font-bold text-[#00FFFF] tracking-widest sm:text-xs">
              {user?.email || "AUTHENTICATED_SECURE_NODE"}
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all sm:px-6 sm:py-3 sm:text-xs"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? "RECOVERY..." : "REFRESH()"}
            </button>
            <button 
              className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500/20 transition-all sm:px-6 sm:py-3 sm:text-xs"
              onClick={handleLogout}
            >
              LOGOUT()
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto pt-12 pb-24 px-0 sm:px-8">
        {error && (
          <div className="mx-6 mb-8 p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-sm tracking-wide sm:mx-0">
            [ ERROR ] {error}
          </div>
        )}

        {!dashboard && !error && (
          <div className="mx-6 p-12 rounded-[2rem] bg-white/5 border border-white/10 text-center sm:mx-0">
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
              NO_TEAM_DATA_FOUND_IN_NODE
            </p>
          </div>
        )}

        {dashboard && (
          <div className="grid grid-cols-1 gap-8">
            {/* Overview Section */}
            <section className="px-6 sm:px-0">
              <div className="cyber-card group p-8 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2rem] overflow-hidden relative">
                <div className="scanning-ray opacity-20" />
                <div className="flex justify-between items-start mb-10">
                  <span className="text-[10px] font-black tracking-[0.3em] text-[#8D36D5]">SYSTEM_OVERVIEW</span>
                  <span className="text-2xl font-black text-white/10 uppercase">/01</span>
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "TEAM_NAME", val: dashboard.team?.team_name },
                    { label: "COLLEGE", val: dashboard.team?.college },
                    { label: "ORG_SIZE", val: dashboard.team?.team_size },
                    { label: "TIMESTAMP", val: createdAtLabel }
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col gap-2">
                      <span className="text-[10px] font-black text-zinc-600 tracking-[0.2em]">{item.label}</span>
                      <span className="text-sm font-bold text-white uppercase truncate">{item.val || "N/A"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Payment Section */}
            <section className="px-6 sm:px-0">
              <div className="cyber-card group p-8 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2rem] overflow-hidden relative">
                <div className="flex justify-between items-start mb-10">
                  <span className="text-[10px] font-black tracking-[0.3em] text-[#00FFFF]">TRANSACTION_LAYER</span>
                  <span className="text-2xl font-black text-white/10 uppercase">/02</span>
                </div>
                <div className="flex flex-wrap items-center gap-12">
                   <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-zinc-600 tracking-[0.2em]">UNIT_VALUE</span>
                    <span className="text-3xl font-black text-white">₹{dashboard.payment?.amount ?? 800}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-zinc-600 tracking-[0.2em]">UPI_NODE_ID</span>
                    <span className="text-sm font-bold text-zinc-400 font-mono tracking-tighter uppercase">{dashboard.payment?.upi_transaction_id || "N/A"}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-zinc-600 tracking-[0.2em]">LINK_VERIFY</span>
                    <StatusBadge status={dashboard.payment?.status} />
                  </div>
                  {dashboard.payment?.screenshot_url && (
                    <a
                      href={dashboard.payment.screenshot_url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto px-6 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                    >
                      VIEW_EVIDENCE
                    </a>
                  )}
                </div>
              </div>
            </section>

            {/* Members Section */}
            <section className="px-6 sm:px-0">
              <div className="cyber-card group p-8 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2rem] overflow-hidden relative">
                <div className="flex justify-between items-start mb-10">
                  <span className="text-[10px] font-black tracking-[0.3em] text-[#8D36D5]">PERSONNEL_DATABASE</span>
                  <span className="text-2xl font-black text-white/10 uppercase">/03</span>
                </div>
                <div className="overflow-x-auto -mx-8 px-8 sm:mx-0 sm:px-0">
                  <table className="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                      <tr className="text-[10px] font-black text-zinc-600 tracking-[0.2em] uppercase">
                        <th className="pb-4">ROLE</th>
                        <th className="pb-4">IDENTITY</th>
                        <th className="pb-4">COMMUNICATION</th>
                        <th className="pb-4">CONTACT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dashboard.members || []).map((member) => (
                        <tr key={member.participant_id} className="group/row bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all">
                          <td className="py-4 px-6 rounded-l-2xl border-y border-l border-white/5">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full ${member.is_leader ? "bg-[#8D36D5]/20 text-[#8D36D5]" : "bg-white/10 text-zinc-400"}`}>
                              {member.is_leader ? "LEADER" : "OPERATIVE"}
                            </span>
                          </td>
                          <td className="py-4 px-6 border-y border-white/5">
                            <span className="text-sm font-bold text-white uppercase">{member.name || "N/A"}</span>
                          </td>
                          <td className="py-4 px-6 border-y border-white/5">
                            <span className="text-sm font-medium text-zinc-500 lowercase">{member.email || "N/A"}</span>
                          </td>
                          <td className="py-4 px-6 rounded-r-2xl border-y border-r border-white/5">
                            <span className="text-sm font-mono text-zinc-400">{member.phone || "N/A"}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Problem Statements */}
            <section className="px-6 sm:px-0">
              <div className="cyber-card group p-8 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2rem] overflow-hidden relative">
                 <div className="flex justify-between items-start mb-10">
                  <span className="text-[10px] font-black tracking-[0.3em] text-[#00FFFF]">CHALLENGE_MATRIX</span>
                  <span className="text-2xl font-black text-white/10 uppercase">/04</span>
                </div>
                
                {dashboard.selected_problem ? (
                  <div className="mb-12 p-8 rounded-2xl bg-fuchsia-500/5 border border-fuchsia-500/20">
                    <span className="text-[10px] font-black text-fuchsia-500 tracking-[0.2em] uppercase mb-4 block">ACTIVE_SELECTION</span>
                    <h3 className="text-xl font-black text-white uppercase mb-2 sm:text-2xl">{dashboard.selected_problem.problem_title || "SELECTED_PS"}</h3>
                    <p className="text-xs font-bold text-zinc-500 tracking-widest uppercase">ID: {dashboard.selected_problem.problem_id || "N/A"} | SECURED: {dashboard.selected_problem.selected_at || "N/A"}</p>
                  </div>
                ) : (
                  <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                    <p className="text-xs font-black text-zinc-600 tracking-[0.4em] uppercase">NO_CHALLENGE_LOCKED_IN</p>
                  </div>
                )}

                <h4 className="text-[10px] font-black text-zinc-400 tracking-[0.5em] uppercase mb-8 ml-2">AVAILABLE_CHANNELS</h4>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {(dashboard.problem_statements || []).length === 0 ? (
                    <p className="text-sm text-zinc-700 font-bold uppercase italic p-8 border border-dashed border-white/5 rounded-2xl">DATA_ENCRYPTION_ACTIVE: PENDING_PUBLISH</p>
                  ) : (
                    dashboard.problem_statements.map((problem) => (
                      <div key={problem.problem_id} className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-white/30 transition-all group/ps">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-2 w-2 rounded-full bg-[#8D36D5] group-hover/ps:animate-ping" />
                           <h5 className="font-black text-sm uppercase tracking-tight text-white">{problem.title}</h5>
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed font-medium">{problem.description || "NO_DESCRIPTION_AVAILABLE"}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Updates Section */}
            <section className="px-6 sm:px-0">
               <div className="cyber-card group p-8 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2rem] overflow-hidden relative">
                 <div className="flex justify-between items-start mb-10">
                  <span className="text-[10px] font-black tracking-[0.3em] text-[#8D36D5]">LOGS_AND_NOTICES</span>
                  <span className="text-2xl font-black text-white/10 uppercase">/05</span>
                </div>
                <div className="space-y-4">
                  {(dashboard.updates || []).length === 0 ? (
                    <p className="text-xs font-black text-zinc-700 tracking-[0.3em] uppercase">TERMINAL_QUIET</p>
                  ) : (
                    (dashboard.updates || []).map((update, idx) => (
                      <div key={idx} className="flex gap-4 items-start group/log">
                        <span className="text-[10px] font-black text-[#8D36D5]/50 group-hover/log:text-[#8D36D5] transition-colors mt-1">[{idx + 1}]</span>
                        <p className="text-sm font-bold text-zinc-400 tracking-wide uppercase group-hover:text-white transition-colors">{update}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

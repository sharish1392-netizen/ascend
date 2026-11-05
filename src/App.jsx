import React, { useState, useEffect } from 'react';
import { 
  Flame, Award, CheckCircle, Clock, BookOpen, TrendingUp, 
  Send, Shield, ChevronRight, Sparkles, RefreshCw
} from 'lucide-react';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxw-R8QfMxEghzmZGlYLnLmlN_Xz4nrtBu_PKHRsyCBWYwl7hd_JUZb9H8IFRfcb00c/exec";

// Day 1 Clean Baseline (Defaults to 0 streaks if sheet is loading or empty)
const CLEAN_DAY_ONE_TEAM = [
  {
    id: "IE-001",
    name: "Jaswanth Singh",
    role: "Visual Communication Head",
    dept: "Creative & Marketing",
    level: "L3 Advanced",
    kras: "Dexter Box marketing collateral, packaging shoots, ad creatives, video editing, social media assets",
    streak: 0,
    xp: 0,
    activeSkill: "MDF & Digital 3D CAD Design",
    skillProgress: 0,
    milestonesDone: 0,
    milestonesTotal: 3
  },
  {
    id: "IE-002",
    name: "Swetha",
    role: "Playzone Facilitator & Video Producer",
    dept: "Content & Facilitation",
    level: "L2 Independent",
    kras: "Grade 1-2 practical science sessions, weekly Reels & podcast production, AI video tools",
    streak: 0,
    xp: 0,
    activeSkill: "Advanced AI Video Generation (Runway / Pika)",
    skillProgress: 0,
    milestonesDone: 0,
    milestonesTotal: 3
  },
  {
    id: "IE-003",
    name: "Arunachalam",
    role: "STEM Trainer & School Success Exec",
    dept: "Training & Delivery",
    level: "L2 Independent",
    kras: "Daily STEM training across 4 partner schools (600+ students), student robotics projects",
    streak: 0,
    xp: 0,
    activeSkill: "Raspberry Pi & Python for Robotics",
    skillProgress: 0,
    milestonesDone: 0,
    milestonesTotal: 3
  },
  {
    id: "IE-004",
    name: "Dhananjayan",
    role: "STEM Facilitator & Trainer",
    dept: "Training & Labs",
    level: "L2 Independent",
    kras: "District-level STEM workshops across TN, hands-on robotics, drone tech & IoT modules",
    streak: 0,
    xp: 0,
    activeSkill: "Drone Tech & Microprocessors (ESP32)",
    skillProgress: 0,
    milestonesDone: 0,
    milestonesTotal: 3
  },
  {
    id: "IE-005",
    name: "Aarthi",
    role: "ATL Operations & CSR Growth",
    dept: "Operations & BD",
    level: "L3 Advanced",
    kras: "ATL school compliance, CSR proposal drafting, partnership pitching, renewals",
    streak: 0,
    xp: 0,
    activeSkill: "B2B CSR Outreach & Grant Proposals",
    skillProgress: 0,
    milestonesDone: 0,
    milestonesTotal: 3
  },
  {
    id: "IE-006",
    name: "Alamelu",
    role: "Accounts & Documentation",
    dept: "Finance & Admin",
    level: "L2 Independent",
    kras: "Zoho Books ledgers, GST return filing, sales/purchase invoicing, audit documentation",
    streak: 0,
    xp: 0,
    activeSkill: "Zoho Books Advanced Ledgers & Costing",
    skillProgress: 0,
    milestonesDone: 0,
    milestonesTotal: 3
  }
];

const TASK_CATEGORIES = [
  { id: "DEL", label: "DEL - Core Delivery (R&R)", color: "bg-blue-600/30 text-blue-300 border-blue-500/40" },
  { id: "STR", label: "STR - Monthly Strategic Goal", color: "bg-emerald-600/30 text-emerald-300 border-emerald-500/40" },
  { id: "LRN", label: "LRN - Applied Learning", color: "bg-purple-600/30 text-purple-300 border-purple-500/40" },
  { id: "OPS", label: "OPS - Admin / Housekeeping", color: "bg-amber-600/30 text-amber-300 border-amber-500/40" },
  { id: "INP", label: "INP - Innovation & Testing", color: "bg-rose-600/30 text-rose-300 border-rose-500/40" }
];

export default function App() {
  const [team, setTeam] = useState(CLEAN_DAY_ONE_TEAM);
  const [currentUserEmail, setCurrentUserEmail] = useState("admin");
  const [activeTab, setActiveTab] = useState("cockpit");
  const [isLoading, setIsLoading] = useState(false);

  // Daily Check-in Form State
  const [taskCategory, setTaskCategory] = useState("DEL");
  const [taskDescription, setTaskDescription] = useState("");
  const [learningMinutes, setLearningMinutes] = useState(30);
  const [blockerNotes, setBlockerNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const isManager = currentUserEmail === "admin";
  const currentMember = team.find(m => m.name.toLowerCase().includes(currentUserEmail.split('@')[0].toLowerCase())) || team[0];

  // Fetch Live Goals and Streaks from Google Sheets on load
  const syncWithSheet = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getGoals&email=admin`);
      const data = await res.json();
      if (data.status === "success" && data.goals && data.goals.length > 0) {
        setTeam(prev => prev.map(member => {
          const memberGoals = data.goals.filter(g => 
            g.employeeName.toLowerCase().includes(member.name.toLowerCase().split(" ")[0])
          );
          if (memberGoals.length > 0) {
            const completed = memberGoals.filter(g => g.status === "Completed").length;
            const latestStreak = memberGoals[0].streakDays ? Number(memberGoals[0].streakDays) : member.streak;
            return {
              ...member,
              milestonesDone: completed,
              milestonesTotal: memberGoals.length,
              streak: latestStreak
            };
          }
          return member;
        }));
      }
    } catch (err) {
      console.log("Sheet sync notice: running on clean local baseline", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    syncWithSheet();
  }, []);

  const handleCheckinSubmit = async (e) => {
    e.preventDefault();
    if (!taskDescription.trim()) return;

    setIsSubmitting(true);

    const payload = {
      action: "submitDailyCheckin",
      employeeName: currentMember.name,
      category: taskCategory,
      description: taskDescription,
      status: "Done",
      learningMinutes: Number(learningMinutes),
      currentStreak: currentMember.streak,
      notes: blockerNotes
    };

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
      }).catch(err => console.log("Background sync error:", err));

      const xpGained = 10 + (Number(learningMinutes) > 0 ? 15 : 0);
      setTeam(prev => prev.map(m => {
        if (m.id === currentMember.id) {
          return {
            ...m,
            streak: m.streak + 1,
            xp: m.xp + xpGained
          };
        }
        return m;
      }));

      setToastMessage(`🔥 Day 1 streak started! Earned +${xpGained} XP! Logged to Google Sheet.`);
      setTaskDescription("");
      setBlockerNotes("");
    } catch (err) {
      setToastMessage("Saved locally. Streak advanced!");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                Ascend Tracker
              </span>
              <span className="text-xs text-slate-500 block">Day 1 Live Environment</span>
            </div>
          </div>

          {/* Sync status & User Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={syncWithSheet}
              title="Sync with Google Sheet"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs">
              <button 
                onClick={() => { setCurrentUserEmail("admin"); setActiveTab("manager"); }}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
                  isManager ? "bg-blue-600 text-white font-medium" : "text-slate-400 hover:text-white"
                }`}
              >
                <Shield className="h-3.5 w-3.5" /> Founder / Lead View
              </button>
              <select
                value={currentUserEmail}
                onChange={(e) => {
                  setCurrentUserEmail(e.target.value);
                  if (e.target.value !== "admin") setActiveTab("cockpit");
                }}
                className="bg-transparent border-none text-slate-300 text-xs px-2 py-1 focus:outline-none"
              >
                <option value="admin" className="bg-slate-900">Switch Employee...</option>
                <option value="jaswanth" className="bg-slate-900">Jaswanth Singh</option>
                <option value="swetha" className="bg-slate-900">Swetha</option>
                <option value="arunachalam" className="bg-slate-900">Arunachalam</option>
                <option value="dhananjayan" className="bg-slate-900">Dhananjayan</option>
                <option value="aarthi" className="bg-slate-900">Aarthi</option>
                <option value="alamelu" className="bg-slate-900">Alamelu</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="max-w-md mx-auto mt-4 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm flex items-center gap-2 shadow-lg animate-pulse">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {activeTab === "manager" ? (
          /* ================= MANAGER / FOUNDER VIEW ================= */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Leadership Dashboard</h1>
                <p className="text-sm text-slate-400">Team execution streaks, milestone progress, and active learning</p>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Team Headcount</span>
                <div className="text-2xl font-bold mt-1 text-white">{team.length} Members</div>
                <span className="text-xs text-emerald-400 mt-1 block">Ready for Day 1</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Current Team Streak</span>
                <div className="text-2xl font-bold mt-1 text-amber-400 flex items-center gap-1">
                  <Flame className="h-6 w-6 text-amber-500 fill-amber-500" />
                  {Math.round(team.reduce((acc, curr) => acc + curr.streak, 0) / team.length)} Days
                </div>
                <span className="text-xs text-slate-400 mt-1 block">Awaiting today's check-ins</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Milestone Delivery</span>
                <div className="text-2xl font-bold mt-1 text-blue-400">
                  {team.reduce((acc, curr) => acc + curr.milestonesTotal, 0) > 0 
                    ? Math.round((team.reduce((acc, curr) => acc + curr.milestonesDone, 0) / team.reduce((acc, curr) => acc + curr.milestonesTotal, 0)) * 100) 
                    : 0}%
                </div>
                <span className="text-xs text-slate-400 mt-1 block">New cycle starting</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Learners</span>
                <div className="text-2xl font-bold mt-1 text-purple-400">{team.length} / {team.length}</div>
                <span className="text-xs text-purple-400 mt-1 block">Upskilling tracks active</span>
              </div>
            </div>

            {/* Team Roster & Health Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <h3 className="font-semibold text-sm text-slate-200">Team Performance & Growth Rollup</h3>
                <span className="text-xs text-slate-400">Live synced with Google Sheet</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950/60 text-slate-400 text-xs border-b border-slate-800 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Member & Role</th>
                      <th className="px-5 py-3">Level</th>
                      <th className="px-5 py-3">Work Streak</th>
                      <th className="px-5 py-3">Monthly Goals</th>
                      <th className="px-5 py-3">Active Learning Skill</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {team.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-slate-200">{member.name}</div>
                          <div className="text-xs text-slate-500">{member.role}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">
                            {member.level}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                            <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
                            {member.streak} Days
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-xs text-slate-300 mb-1">{member.milestonesDone} of {member.milestonesTotal} Done</div>
                          <div className="w-28 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-500 h-full rounded-full" 
                              style={{ width: `${member.milestonesTotal > 0 ? (member.milestonesDone / member.milestonesTotal) * 100 : 0}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-xs text-purple-300 font-medium">{member.activeSkill}</div>
                          <div className="text-xs text-slate-500">{member.skillProgress}% Verified</div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setCurrentUserEmail(member.name.toLowerCase().split(' ')[0]);
                              setActiveTab("cockpit");
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 justify-end ml-auto"
                          >
                            Open Cockpit <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* ================= INDIVIDUAL EMPLOYEE COCKPIT ================= */
          <div className="space-y-6">
            {/* Employee Header */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/20">
                    {currentMember.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">{currentMember.name}</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/30">
                        {currentMember.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{currentMember.role} • {currentMember.dept}</p>
                  </div>
                </div>

                {/* Gamified Badges */}
                <div className="flex items-center gap-3">
                  <div className="bg-slate-950/70 border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-2">
                    <Flame className="h-6 w-6 text-amber-500 fill-amber-500 animate-bounce" />
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Work Streak</div>
                      <div className="text-base font-bold text-amber-400">{currentMember.streak} Days</div>
                    </div>
                  </div>
                  <div className="bg-slate-950/70 border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-2">
                    <Award className="h-6 w-6 text-purple-400" />
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Experience XP</div>
                      <div className="text-base font-bold text-purple-300">{currentMember.xp} XP</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily 60-Second Check-In Form */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 border border-blue-500/30 rounded-2xl p-5 shadow-xl shadow-blue-950/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="font-semibold text-base text-slate-100">Daily 60-Second Check-In</h3>
                </div>
                <span className="text-xs text-slate-400">Day 1: Start your execution streak</span>
              </div>

              <form onSubmit={handleCheckinSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Task Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {TASK_CATEGORIES.map(cat => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setTaskCategory(cat.id)}
                        className={`text-xs p-2 rounded-lg border font-medium transition text-left truncate ${
                          taskCategory === cat.id 
                            ? cat.color + " ring-1 ring-white/20" 
                            : "bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">What did you complete today?</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Delivered robotics session at School A, tested 4 kit sensors"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1.5">Learning Minutes Spent Today

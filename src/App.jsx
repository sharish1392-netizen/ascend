import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, Award, CheckCircle, Clock, BookOpen, Send, Shield, 
  ChevronRight, Sparkles, RefreshCw, FolderPlus, UserPlus, 
  ListPlus, CalendarCheck, CheckSquare, Zap, GraduationCap, LayoutGrid,
  Plus, Trash2, CheckCircle2, AlertCircle, BarChart3, Sliders, ArrowUpRight, 
  UserCheck, Users, PieChart, Activity, Calendar
} from 'lucide-react';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw9dwtPvz3EOGWNDcSSFxCUQftWb7zDa632MatuA1MzMQIYlHSuDr8ZpF6ZfCJzY7t6Iw/exec";

function getCurrentMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function App() {
  const [viewRole, setViewRole] = useState("founder"); // 'founder' | 'employee'
  const [activeEmployeeEmail, setActiveEmployeeEmail] = useState("");
  const [founderTab, setFounderTab] = useState("workload"); // 'workload' | 'analytics' | 'live' | 'team'
  const [employeeTab, setEmployeeTab] = useState("workboard"); // 'workboard' | 'levels' | 'catalog' | 'rnr'
  
  // Sheet Data
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [learningModules, setLearningModules] = useState([]);
  const [weeklyPulses, setWeeklyPulses] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Founder Filtering States
  const [selectedFounderEmp, setSelectedFounderEmp] = useState("ALL");
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState("WEEK"); // 'WEEK' | 'MONTH' | 'ALL'

  // Modals
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [showPrjModal, setShowPrjModal] = useState(false);
  const [showTskModal, setShowTskModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // In-Card Logging Modal
  const [activeLoggingItem, setActiveLoggingItem] = useState(null);
  const [sessionSliderHours, setSessionSliderHours] = useState(1);
  const [sessionSliderMins, setSessionSliderMins] = useState(30);
  const [sessionProgress, setSessionProgress] = useState(50);
  const [sessionLearningModule, setSessionLearningModule] = useState("None");
  const [sessionNotes, setSessionNotes] = useState("");
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);

  // Add Item / Assign Task Form
  const [newItemProject, setNewItemProject] = useState("");
  const [newItemTaskCode, setNewItemTaskCode] = useState("");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Forms
  const [newEmp, setNewEmp] = useState({ name: "", email: "", roleTitle: "", department: "Training & Delivery", level: "L3 Advanced", rnrSummary: "" });
  const [newPrj, setNewPrj] = useState({ projectId: "", projectName: "", priority: "P1 Critical", ownerEmail: "" });
  const [newTsk, setNewTsk] = useState({ taskCode: "", taskTitle: "", category: "DEL" });

  const currentMondayStr = getCurrentMonday();
  const todayStr = getTodayStr();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchSheetData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getBootstrapData`);
      const data = await res.json();
      if (data.status === "success") {
        setEmployees(data.employees || []);
        setProjects(data.projects || []);
        setTasks(data.tasks || []);
        setLearningModules(data.learningModules || []);
        setWeeklyPulses(data.weeklyPulses || []);
        setDailyLogs(data.dailyLogs || []);

        if (data.employees?.length > 0 && !activeEmployeeEmail) {
          setActiveEmployeeEmail(data.employees[0].Email);
          setAssigneeEmail(data.employees[0].Email);
        }
        if (data.projects?.length > 0 && !newItemProject) {
          setNewItemProject(data.projects[0].Project_ID);
        }
        if (data.tasks?.length > 0 && !newItemTaskCode) {
          setNewItemTaskCode(data.tasks[0].Task_Code);
        }
      }
    } catch (err) {
      console.log("Sheet fetch notice:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetData();
  }, []);

  const currentEmp = employees.find(e => (e.Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase()) || {
    Name: "Team Member",
    Email: "",
    Role_Title: "Onboard via Founder View",
    Department: "General",
    Level: "L1",
    "R&R_Summary": "Responsibilities will appear once onboarded."
  };

  const empDailyLogs = dailyLogs.filter(l => (l.Emp_Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase());
  const currentStreak = empDailyLogs.length > 0 ? Number(empDailyLogs[empDailyLogs.length - 1].Streak_Count || 0) : 0;
  const currentXP = empDailyLogs.length * 35;

  const currentWorkboard = weeklyPulses.filter(p => 
    (p.Emp_Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase() &&
    p.Week_Start_Date === currentMondayStr
  );

  const collectionMetrics = useMemo(() => {
    if (currentWorkboard.length === 0) return { percent: 0, totalMinutes: 0, completedCount: 0 };
    const totalProg = currentWorkboard.reduce((acc, c) => acc + Number(c.Auto_Task_Hours || 0), 0);
    const totalMins = currentWorkboard.reduce((acc, c) => acc + Number(c.Auto_Learning_Hours || 0), 0);
    const completed = currentWorkboard.filter(c => Number(c.Auto_Task_Hours || 0) >= 100).length;
    return {
      percent: Math.round(totalProg / currentWorkboard.length),
      totalMinutes: totalMins,
      completedCount: completed
    };
  }, [currentWorkboard]);

  const filteredAnalyticsLogs = useMemo(() => {
    const now = new Date();
    const currentMonthPrefix = now.toISOString().slice(0, 7);

    return dailyLogs.filter(log => {
      if (selectedFounderEmp !== "ALL" && (log.Emp_Email || "").toLowerCase() !== selectedFounderEmp.toLowerCase()) {
        return false;
      }
      if (analyticsTimeframe === "WEEK") {
        return (log.Date || "") >= currentMondayStr;
      }
      if (analyticsTimeframe === "MONTH") {
        return (log.Date || "").startsWith(currentMonthPrefix);
      }
      return true;
    });
  }, [dailyLogs, selectedFounderEmp, analyticsTimeframe, currentMondayStr]);

  const projectTimeBreakdown = useMemo(() => {
    const map = {};
    let grandTotalMins = 0;

    filteredAnalyticsLogs.forEach(log => {
      const p = log.Project_ID || "UNASSIGNED";
      const val = Number(log.Task_Hours || 0);
      const mins = val > 24 ? val : Math.round(val * 60);
      map[p] = (map[p] || 0) + mins;
      grandTotalMins += mins;
    });

    return Object.entries(map).map(([projectId, mins]) => ({
      projectId,
      hours: (mins / 60).toFixed(1),
      minutes: mins,
      percentage: grandTotalMins > 0 ? Math.round((mins / grandTotalMins) * 100) : 0
    })).sort((a, b) => b.minutes - a.minutes);
  }, [filteredAnalyticsLogs]);

  const taskTimeBreakdown = useMemo(() => {
    const map = {};
    let grandTotalMins = 0;

    filteredAnalyticsLogs.forEach(log => {
      const t = log.Task_Code || "GENERAL";
      const val = Number(log.Task_Hours || 0);
      const mins = val > 24 ? val : Math.round(val * 60);
      map[t] = (map[t] || 0) + mins;
      grandTotalMins += mins;
    });

    return Object.entries(map).map(([taskCode, mins]) => ({
      taskCode,
      hours: (mins / 60).toFixed(1),
      minutes: mins,
      percentage: grandTotalMins > 0 ? Math.round((mins / grandTotalMins) * 100) : 0
    })).sort((a, b) => b.minutes - a.minutes);
  }, [filteredAnalyticsLogs]);

  const employeeWorkloadBuckets = useMemo(() => {
    return employees.map(emp => {
      const empEmail = (emp.Email || "").toLowerCase();
      const empPulses = weeklyPulses.filter(p => (p.Emp_Email || "").toLowerCase() === empEmail && p.Week_Start_Date === currentMondayStr);
      const activeTasks = empPulses.filter(p => Number(p.Auto_Task_Hours || 0) < 100);
      const doneTasks = empPulses.filter(p => Number(p.Auto_Task_Hours || 0) >= 100);
      const totalLoggedMins = empPulses.reduce((sum, p) => sum + Number(p.Auto_Learning_Hours || 0), 0);
      const todayLogs = dailyLogs.filter(l => (l.Emp_Email || "").toLowerCase() === empEmail && l.Date === todayStr);

      return {
        ...emp,
        totalTasks: empPulses.length,
        activeCount: activeTasks.length,
        doneCount: doneTasks.length,
        totalLoggedMins,
        totalLoggedHours: (totalLoggedMins / 60).toFixed(1),
        activeTasksList: activeTasks,
        doneTasksList: doneTasks,
        todayLogsCount: todayLogs.length,
        lastActiveProject: todayLogs.length > 0 ? todayLogs[todayLogs.length - 1].Project_ID : (empPulses.length > 0 ? empPulses[0].Project_ID : "Idle"),
        lastActiveTask: todayLogs.length > 0 ? todayLogs[todayLogs.length - 1].Task_Code : "None"
      };
    });
  }, [employees, weeklyPulses, dailyLogs, currentMondayStr, todayStr]);

  const todayLiveLogs = useMemo(() => {
    return dailyLogs.filter(l => l.Date === todayStr).reverse();
  }, [dailyLogs, todayStr]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    const entry = {
      Emp_ID: "IE-" + ("00" + (employees.length + 1)).slice(-3),
      Name: newEmp.name,
      Email: newEmp.email.toLowerCase().trim(),
      Role_Title: newEmp.roleTitle,
      Department: newEmp.department,
      Level: newEmp.level,
      "R&R_Summary": newEmp.rnrSummary,
      Status: "Active"
    };

    setEmployees(prev => [...prev, entry]);
    if (!activeEmployeeEmail) setActiveEmployeeEmail(entry.Email);
    setShowEmpModal(false);
    showToast(`Employee ${newEmp.name} onboarded!`);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "addEmployee", ...newEmp })
      });
    } catch (err) { console.log(err); }
    setNewEmp({ name: "", email: "", roleTitle: "", department: "Training & Delivery", level: "L3 Advanced", rnrSummary: "" });
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    const entry = {
      Project_ID: newPrj.projectId.toUpperCase().trim(),
      Project_Name: newPrj.projectName,
      Priority_Level: newPrj.priority,
      Owner_Email: (newPrj.ownerEmail || "").toLowerCase().trim(),
      Status: "Active"
    };

    setProjects(prev => [...prev, entry]);
    setShowPrjModal(false);
    showToast(`Project ${newPrj.projectId} created!`);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "createProject", ...newPrj })
      });
    } catch (err) { console.log(err); }
    setNewPrj({ projectId: "", projectName: "", priority: "P1 Critical", ownerEmail: "" });
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    const entry = {
      Task_Code: newTsk.taskCode.toUpperCase().trim(),
      Task_Title: newTsk.taskTitle,
      Category: newTsk.category
    };

    setTasks(prev => [...prev, entry]);
    setShowTskModal(false);
    showToast(`Task code ${newTsk.taskCode} added!`);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "createTask", ...newTsk })
      });
    } catch (err) { console.log(err); }
    setNewTsk({ taskCode: "", taskTitle: "", category: "DEL" });
  };

  const handleAddWorkboardItem = async (e) => {
    e.preventDefault();
    if (!newItemTitle.trim()) { showToast("Enter a task title"); return; }
    setIsAddingItem(true);

    const targetEmail = viewRole === "founder" ? (assigneeEmail || activeEmployeeEmail) : activeEmployeeEmail;
    const assignedBy = viewRole === "founder" ? "Founder" : "Self";

    const newItem = {
      Pulse_ID: "TSK-" + Date.now(),
      Week_Start_Date: currentMondayStr,
      Emp_Email: targetEmail,
      Project_ID: newItemProject,
      Task_Code: newItemTaskCode,
      Monday_Commitment: newItemTitle,
      Auto_Task_Hours: 0,
      Auto_Learning_Hours: 0,
      Friday_Outcome: assignedBy,
      Status: "In Progress"
    };

    setWeeklyPulses(prev => [...prev, newItem]);
    showToast(`Task added to ${assignedBy === "Founder" ? targetEmail : "your"} bucket!`);
    setNewItemTitle("");
    setShowAssignModal(false);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "addWorkboardItem",
          weekStartDate: currentMondayStr,
          email: targetEmail,
          projectId: newItemProject,
          taskCode: newItemTaskCode,
          commitmentTitle: newItemTitle,
          progressPercent: 0,
          loggedMinutes: 0,
          assignedBy: assignedBy,
          status: "In Progress"
        })
      });
    } catch (err) { console.log(err); }
    finally { setIsAddingItem(false); }
  };

  const handleOpenLogModal = (item) => {
    setActiveLoggingItem(item);
    setSessionProgress(Number(item.Auto_Task_Hours || 0));
    setSessionSliderHours(1);
    setSessionSliderMins(30);
    setSessionNotes("");
  };

  const handleSaveTaskSession = async (e) => {
    e.preventDefault();
    if (!activeLoggingItem) return;
    setIsSubmittingSession(true);

    const sessionMinutes = (sessionSliderHours * 60) + sessionSliderMins;
    const nextStreak = currentStreak + 1;

    setWeeklyPulses(prev => prev.map(p => {
      if (p.Pulse_ID === activeLoggingItem.Pulse_ID) {
        return {
          ...p,
          Auto_Task_Hours: sessionProgress,
          Auto_Learning_Hours: Number(p.Auto_Learning_Hours || 0) + sessionMinutes,
          Status: sessionProgress >= 100 ? "Completed" : "In Progress"
        };
      }
      return p;
    }));

    setDailyLogs(prev => [...prev, {
      Log_ID: "LOG-" + Date.now(),
      Date: todayStr,
      Emp_Email: activeEmployeeEmail,
      Project_ID: activeLoggingItem.Project_ID,
      Task_Code: activeLoggingItem.Task_Code,
      Task_Hours: sessionMinutes,
      Learning_Module_Code: sessionLearningModule,
      Learning_Hours: 0,
      Status: sessionProgress >= 100 ? "Done" : "In Progress",
      Streak_Count: nextStreak
    }]);

    showToast(`Logged ${sessionMinutes}m on "${activeLoggingItem.Monday_Commitment}"!`);
    setActiveLoggingItem(null);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "logTaskSession",
          pulseId: activeLoggingItem.Pulse_ID,
          email: activeEmployeeEmail,
          projectId: activeLoggingItem.Project_ID,
          taskCode: activeLoggingItem.Task_Code,
          taskMinutes: sessionMinutes,
          learningModuleCode: sessionLearningModule,
          learningMinutes: 0,
          progressPercent: sessionProgress,
          currentStreak: currentStreak,
          status: sessionProgress >= 100 ? "Done" : "In Progress",
          notes: sessionNotes
        })
      });
    } catch (err) { console.log(err); }
    finally { setIsSubmittingSession(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                IE Goal Tracker
              </span>
              <span className="text-xs text-slate-500 block">Executive Governance & Workload Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={fetchSheetData} title="Sync with Sheet" className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs">
              <button 
                onClick={() => setViewRole("founder")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${viewRole === "founder" ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-600/30" : "text-slate-400 hover:text-white"}`}
              >
                <Shield className="h-3.5 w-3.5" /> Founder View
              </button>

              <button 
                onClick={() => setViewRole("employee")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${viewRole === "employee" ? "bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-white"}`}
              >
                Employee Cockpit
              </button>

              {employees.length > 0 && (
                <select
                  value={activeEmployeeEmail}
                  onChange={(e) => setActiveEmployeeEmail(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2 py-1 rounded focus:outline-none"
                >
                  {employees.map(emp => (
                    <option key={emp.Email} value={emp.Email}>{emp.Name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </header>

      {toastMessage && (
        <div className="max-w-md mx-auto mt-4 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm flex items-center gap-2 shadow-lg animate-pulse">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {viewRole === "founder" ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Executive Workload & Analytics Hub</h1>
                <p className="text-sm text-slate-400">Inspect employee buckets, audit real-time activity, and analyze project capital allocation</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setShowAssignModal(true)} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-indigo-600/20">
                  <UserCheck className="h-3.5 w-3.5" /> + Assign to Bucket
                </button>
                <button onClick={() => setShowPrjModal(true)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5">
                  <FolderPlus className="h-3.5 w-3.5 text-blue-400" /> + Project
                </button>
                <button onClick={() => setShowTskModal(true)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5">
                  <ListPlus className="h-3.5 w-3.5 text-blue-400" /> + Task Code
                </button>
                <button onClick={() => setShowEmpModal(true)} className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-blue-600/20">
                  <UserPlus className="h-3.5 w-3.5" /> + Onboard
                </button>
              </div>
            </div>

            <div className="flex border-b border-slate-800 text-sm gap-6 overflow-x-auto">
              <button onClick={() => setFounderTab("workload")} className={`pb-3 font-medium transition flex items-center gap-1.5 shrink-0 ${founderTab === "workload" ? "text-blue-400 border-b-2 border-blue-500" : "text-slate-400 hover:text-white"}`}>
                <Users className="h-4 w-4" /> Team Workload Buckets
              </button>
              <button onClick={() => setFounderTab("analytics")} className={`pb-3 font-medium transition flex items-center gap-1.5 shrink-0 ${founderTab === "analytics" ? "text-indigo-400 border-b-2 border-indigo-500" : "text-slate-400 hover:text-white"}`}>
                <PieChart className="h-4 w-4" /> Project & Task Time Allocation
              </button>
              <button onClick={() => setFounderTab("live")} className={`pb-3 font-medium transition flex items-center gap-1.5 shrink-0 ${founderTab === "live" ? "text-emerald-400 border-b-2 border-emerald-500" : "text-slate-400 hover:text-white"}`}>
                <Activity className="h-4 w-4" /> Today's Live Execution Feed ({todayLiveLogs.length})
              </button>
              <button onClick={() => setFounderTab("team")} className={`pb-3 font-medium transition flex items-center gap-1.5 shrink-0 ${founderTab === "team" ? "text-purple-400 border-b-2 border-purple-500" : "text-slate-400 hover:text-white"}`}>
                <BookOpen className="h-4 w-4" /> Roster, Levels & KRAs
              </button>
            </div>

            {founderTab === "workload" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {employeeWorkloadBuckets.map(b => (
                    <div key={b.Email} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-base text-white">{b.Name}</h3>
                            <span className="text-xs text-slate-400">{b.Role_Title}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-300 font-mono border border-blue-500/20">
                            {b.Level}
                          </span>
                        </div>

                        <div className="mb-4 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${b.todayLogsCount > 0 ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                            Current / Today:
                          </span>
                          <span className="font-mono font-medium text-emerald-300">
                            {b.lastActiveProject} • {b.lastActiveTask}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-xs text-slate-400 font-medium">
                            <span>Active Bucket ({b.activeCount} tasks)</span>
                            <span className="text-amber-400 font-mono">{b.totalLoggedHours}h logged this week</span>
                          </div>

                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {b.activeTasksList.length === 0 && b.doneTasksList.length === 0 && (
                              <p className="text-[11px] text-slate-500 italic">No tasks in bucket this week.</p>
                            )}

                            {b.activeTasksList.map(item => (
                              <div key={item.Pulse_ID} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                                <div className="flex justify-between text-[11px] mb-1">
                                  <span className="font-mono text-blue-400">[{item.Project_ID} • {item.Task_Code}]</span>
                                  <span className="font-mono text-emerald-400 font-bold">{item.Auto_Task_Hours || 0}%</span>
                                </div>
                                <div className="text-slate-200 text-xs truncate">{item.Monday_Commitment}</div>
                              </div>
                            ))}

                            {b.doneTasksList.map(item => (
                              <div key={item.Pulse_ID} className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs">
                                <div className="flex justify-between text-[11px] mb-1">
                                  <span className="font-mono text-emerald-300 line-through">[{item.Project_ID} • {item.Task_Code}]</span>
                                  <span className="font-mono text-emerald-400 font-bold">100% ✓</span>
                                </div>
                                <div className="text-slate-400 text-xs line-through truncate">{item.Monday_Commitment}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveEmployeeEmail(b.Email);
                          setViewRole("employee");
                        }}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition border border-slate-700"
                      >
                        Inspect Full Cockpit <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {founderTab === "analytics" && (
              <div className="space-y-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Filter Member:</span>
                    <select
                      value={selectedFounderEmp}
                      onChange={e => setSelectedFounderEmp(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-lg"
                    >
                      <option value="ALL">Entire Company (All Members)</option>
                      {employees.map(e => <option key={e.Email} value={e.Email}>{e.Name}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    <button 
                      onClick={() => setAnalyticsTimeframe("WEEK")}
                      className={`px-3 py-1 rounded-lg transition ${analyticsTimeframe === "WEEK" ? "bg-blue-600 text-white font-medium" : "text-slate-400 hover:text-white"}`}
                    >
                      This Week
                    </button>
                    <button 
                      onClick={() => setAnalyticsTimeframe("MONTH")}
                      className={`px-3 py-1 rounded-lg transition ${analyticsTimeframe === "MONTH" ? "bg-blue-600 text-white font-medium" : "text-slate-400 hover:text-white"}`}
                    >
                      This Month
                    </button>
                    <button 
                      onClick={() => setAnalyticsTimeframe("ALL")}
                      className={`px-3 py-1 rounded-lg transition ${analyticsTimeframe === "ALL" ? "bg-blue-600 text-white font-medium" : "text-slate-400 hover:text-white"}`}
                    >
                      All-Time / Yearly
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                          <FolderPlus className="h-4 w-4 text-blue-400" /> Time Spent by Project
                        </h3>
                        <span className="text-xs text-slate-400">Use to budget operational costs and resource distribution</span>
                      </div>
                    </div>

                    {projectTimeBreakdown.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">No time logged for this filter window.</p>
                    ) : (
                      <div className="space-y-4">
                        {projectTimeBreakdown.map(p => (
                          <div key={p.projectId} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="font-mono text-blue-400 font-semibold">{p.projectId}</span>
                              <span className="font-mono text-slate-200">{p.hours} hrs ({p.minutes}m) • <span className="text-emerald-400 font-bold">{p.percentage}%</span></span>
                            </div>
                            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full" style={{ width: `${p.percentage}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                          <ListPlus className="h-4 w-4 text-emerald-400" /> Time Spent by Functional Task Code
                        </h3>
                        <span className="text-xs text-slate-400">Identifies high-friction operational vs delivery bottlenecks</span>
                      </div>
                    </div>

                    {taskTimeBreakdown.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">No time logged for this filter window.</p>
                    ) : (
                      <div className="space-y-4">
                        {taskTimeBreakdown.map(t => (
                          <div key={t.taskCode} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="font-mono text-emerald-400 font-semibold">{t.taskCode}</span>
                              <span className="font-mono text-slate-200">{t.hours} hrs ({t.minutes}m) • <span className="text-emerald-400 font-bold">{t.percentage}%</span></span>
                            </div>
                            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full" style={{ width: `${t.percentage}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {founderTab === "live" && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                  <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" /> Live Daily Execution Stream (Today: {todayStr})
                  </h3>
                  <span className="text-xs text-slate-400">Real-time check-in log</span>
                </div>
                {todayLiveLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No sessions logged yet today. Team members log time as they progress through their task cards.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {todayLiveLogs.map(log => (
                      <div key={log.Log_ID} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-100">{log.Emp_Email}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                              {log.Project_ID} • {log.Task_Code}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                              {log.Status}
                            </span>
                          </div>
                          {log.Notes && <p className="text-xs text-slate-300 mt-1 italic">"{log.Notes}"</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold font-mono text-amber-400">
                            {log.Task_Hours} mins ({(Number(log.Task_Hours || 0)/60).toFixed(1)}h)
                          </span>
                          <span className="text-[11px] text-slate-500 block">Streak: 🔥 {log.Streak_Count || 1} Days</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {founderTab === "team" && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                  <h3 className="font-semibold text-sm text-slate-200">Master Team Directory & Permanent KRAs</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950/60 text-slate-400 text-xs border-b border-slate-800 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Member & Email</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="px-5 py-3">Autonomy Level</th>
                        <th className="px-5 py-3">Baseline KRAs</th>
                        <th className="px-5 py-3 text-right">Cockpit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {employees.map(emp => (
                        <tr key={emp.Email} className="hover:bg-slate-800/40 transition">
                          <td className="px-5 py-3.5">
                            <div className="font-medium text-slate-200">{emp.Name}</div>
                            <div className="text-xs text-slate-500">{emp.Email}</div>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-300">{emp.Role_Title}</td>
                          <td className="px-5 py-3.5">
                            <span className="px-2.5 py-1 rounded text-xs bg-blue-500/10 text-blue-300 border border-blue-500/30 font-medium">
                              {emp.Level}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-300 max-w-sm truncate">{emp["R&R_Summary"]}</td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => {
                                setActiveEmployeeEmail(emp.Email);
                                setViewRole("employee");
                              }}
                              className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                            >
                              Open <ChevronRight className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/20">
                  {currentEmp.Name ? currentEmp.Name[0] : "E"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{currentEmp.Name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30">
                      {currentEmp.Level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{currentEmp.Role_Title} • {currentEmp.Department}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-slate-950/70 border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-2">
                  <Flame className="h-6 w-6 text-amber-500 fill-amber-500 animate-bounce" />
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Work Streak</div>
                    <div className="text-base font-bold text-amber-400">{currentStreak} Days</div>
                  </div>
                </div>
                <div className="bg-slate-950/70 border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-2">
                  <Award className="h-6 w-6 text-purple-400" />
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Experience XP</div>
                    <div className="text-base font-bold text-purple-300">{currentXP} XP</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex border-b border-slate-800 text-sm gap-6 overflow-x-auto">
              <button onClick={() => setEmployeeTab("workboard")} className={`pb-3 font-medium transition shrink-0 flex items-center gap-1.5 ${employeeTab === "workboard" ? "text-blue-400 border-b-2 border-blue-500" : "text-slate-400 hover:text-white"}`}>
                <CalendarCheck className="h-4 w-4" /> My Weekly Workboard ({currentWorkboard.length})
              </button>
              <button onClick={() => setEmployeeTab("levels")} className={`pb-3 font-medium transition shrink-0 flex items-center gap-1.5 ${employeeTab === "levels" ? "text-amber-400 border-b-2 border-amber-500" : "text-slate-400 hover:text-white"}`}>
                <BarChart3 className="h-4 w-4" /> L1–L4 Autonomy
              </button>
              <button onClick={() => setEmployeeTab("catalog")} className={`pb-3 font-medium transition shrink-0 flex items-center gap-1.5 ${employeeTab === "catalog" ? "text-emerald-400 border-b-2 border-emerald-500" : "text-slate-400 hover:text-white"}`}>
                <LayoutGrid className="h-4 w-4" /> Company Catalog
              </button>
              <button onClick={() => setEmployeeTab("rnr")} className={`pb-3 font-medium transition shrink-0 flex items-center gap-1.5 ${employeeTab === "rnr" ? "text-purple-400 border-b-2 border-purple-500" : "text-slate-400 hover:text-white"}`}>
                <BookOpen className="h-4 w-4" /> My R&R
              </button>
            </div>

            {employeeTab === "workboard" && (
              <div className="space-y-6">
                <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-5 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-base text-slate-100 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-400" /> Current Week Goal Completion
                      </h3>
                      <span className="text-xs text-slate-400">
                        {collectionMetrics.completedCount} of {currentWorkboard.length} tasks completed • Total Logged: {collectionMetrics.totalMinutes} mins ({(collectionMetrics.totalMinutes/60).toFixed(1)} hrs)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold font-mono text-emerald-400">{collectionMetrics.percent}%</span>
                      <span className="text-xs text-slate-500 block">Overall Progress</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-500" style={{ width: `${collectionMetrics.percent}%` }} />
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5 text-blue-400" /> Add Task to My Bucket
                    </span>
                    <span className="text-[11px] text-slate-500">Add on Monday morning or ad-hoc during the week</span>
                  </div>

                  <form onSubmit={handleAddWorkboardItem} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Project</label>
                        <select value={newItemProject} onChange={e => setNewItemProject(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200">
                          {projects.map(p => <option key={p.Project_ID} value={p.Project_ID}>[{p.Project_ID}] {p.Project_Name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Reusable Task Code</label>
                        <select value={newItemTaskCode} onChange={e => setNewItemTaskCode(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200">
                          {tasks.map(t => <option key={t.Task_Code} value={t.Task_Code}>[{t.Task_Code}] {t.Task_Title}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Deliverable Statement</label>
                        <input 
                          type="text" 
                          required
                          value={newItemTitle} 
                          onChange={e => setNewItemTitle(e.target.value)} 
                          placeholder="e.g. Conduct hands-on STEM sessions in 4 schools" 
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200" 
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={isAddingItem} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg">
                      <Plus className="h-4 w-4" /> {isAddingItem ? "Adding..." : "+ Add to Bucket"}
                    </button>
                  </form>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm text-slate-200">My Task Collection ({currentWorkboard.length})</h4>
                    <span className="text-xs text-slate-400">Click "Log Session" on any card to update hours & progress</span>
                  </div>

                  {currentWorkboard.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-500 text-sm">
                      Your collection is empty for this week.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentWorkboard.map(item => {
                        const progress = Number(item.Auto_Task_Hours || 0);
                        const mins = Number(item.Auto_Learning_Hours || 0);
                        const isDone = progress >= 100;

                        return (
                          <div key={item.Pulse_ID} className={`p-4 rounded-2xl border transition ${isDone ? "bg-slate-900/40 border-emerald-500/30" : "bg-slate-900/90 border-slate-800 hover:border-slate-700"}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-medium">
                                  {item.Project_ID} {item.Task_Code ? `• ${item.Task_Code}` : ''}
                                </span>
                                {item.Friday_Outcome === "Founder" && (
                                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    Assigned by Leadership
                                  </span>
                                )}
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${isDone ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-300"}`}>
                                {progress}%
                              </span>
                            </div>

                            <h5 className="font-medium text-sm text-white mb-3">{item.Monday_Commitment}</h5>

                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-3">
                              <div className={`h-full transition-all duration-300 ${isDone ? "bg-emerald-400" : "bg-blue-500"}`} style={{ width: `${Math.min(100, progress)}%` }} />
                            </div>

                            <div className="flex justify-between items-center pt-1 border-t border-slate-800/60 text-xs">
                              <span className="text-slate-400 font-mono flex items-center gap-1">
                                <Clock className="h-3 w-3 text-amber-400" /> {mins} mins logged ({(mins/60).toFixed(1)}h)
                              </span>
                              <button
                                onClick={() => handleOpenLogModal(item)}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                              >
                                <Sliders className="h-3 w-3" /> Log Session
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {employeeTab === "levels" && (
              <div className="space-y-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <h3 className="font-bold text-base text-slate-100 mb-1 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-amber-400" /> Organizational Autonomy Levels (L1 – L4)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-blue-400 font-bold border border-slate-700">Level 1</span>
                      <h4 className="font-semibold text-sm text-white mt-1">Foundational / Guided Execution</h4>
                      <p className="text-xs text-slate-400 mt-2">Follows SOPs and kit assembly workflows with direct guidance.</p>
                    </div>
                    <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-blue-400 font-bold border border-slate-700">Level 2</span>
                      <h4 className="font-semibold text-sm text-white mt-1">Independent Contributor</h4>
                      <p className="text-xs text-slate-400 mt-2">Owns school workshops and design deliverables end-to-end without constant oversight.</p>
                    </div>
                    <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-indigo-400 font-bold border border-slate-700">Level 3</span>
                      <h4 className="font-semibold text-sm text-white mt-1">Advanced / Lead Execution</h4>
                      <p className="text-xs text-slate-400 mt-2">Leads multi-school rollouts, builds kit experiments, and mentors L1/L2 peers.</p>
                    </div>
                    <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-purple-400 font-bold border border-slate-700">Level 4</span>
                      <h4 className="font-semibold text-sm text-white mt-1">Strategic / Pillar Owner</h4>
                      <p className="text-xs text-slate-400 mt-2">Drives business growth roadmaps, ATL operations, and product scaling.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {employeeTab === "catalog" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <h4 className="font-semibold text-sm text-slate-200 mb-3 flex items-center gap-2">
                    <FolderPlus className="h-4 w-4 text-blue-400" /> Active Projects ({projects.length})
                  </h4>
                  <div className="divide-y divide-slate-800/60">
                    {projects.map(p => (
                      <div key={p.Project_ID} className="py-2.5 flex justify-between items-center text-xs">
                        <span className="font-mono text-blue-400">[{p.Project_ID}] {p.Project_Name}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{p.Priority_Level}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <h4 className="font-semibold text-sm text-slate-200 mb-3 flex items-center gap-2">
                    <ListPlus className="h-4 w-4 text-emerald-400" /> Reusable Task Codes ({tasks.length})
                  </h4>
                  <div className="divide-y divide-slate-800/60">
                    {tasks.map(t => (
                      <div key={t.Task_Code} className="py-2.5 flex justify-between items-center text-xs">
                        <span className="font-mono text-emerald-400">[{t.Task_Code}] {t.Task_Title}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{t.Category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {employeeTab === "rnr" && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  <h4 className="font-semibold text-sm text-slate-200">Baseline KRAs & Core Responsibilities</h4>
                </div>
                <div className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800 whitespace-pre-line">
                  {currentEmp["R&R_Summary"]}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: IN-CARD LOGGING SLIDERS */}
      {activeLoggingItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-medium">
                  {activeLoggingItem.Project_ID} • {activeLoggingItem.Task_Code}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{activeLoggingItem.Monday_Commitment}</h3>
              </div>
              <button onClick={() => setActiveLoggingItem(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveTaskSession} className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Session Duration:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold border border-blue-500/30">
                    {sessionSliderHours}h {sessionSliderMins}m ({(sessionSliderHours * 60) + sessionSliderMins} mins)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Hours</span>
                      <span className="font-semibold text-white">{sessionSliderHours}h</span>
                    </div>
                    <input 
                      type="range" min="0" max="8" step="1" 
                      value={sessionSliderHours} 
                      onChange={e => setSessionSliderHours(Number(e.target.value))} 
                      className="w-full accent-blue-500 cursor-pointer" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Minutes</span>
                      <span className="font-semibold text-white">{sessionSliderMins}m</span>
                    </div>
                    <input 
                      type="range" min="0" max="45" step="15" 
                      value={sessionSliderMins} 
                      onChange={e => setSessionSliderMins(Number(e.target.value))} 
                      className="w-full accent-blue-500 cursor-pointer" 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Update Progress:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                    {sessionProgress}% {sessionProgress >= 100 ? "• Completed!" : ""}
                  </span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5" 
                  value={sessionProgress} 
                  onChange={e => setSessionProgress(Number(e.target.value))} 
                  className="w-full accent-emerald-500 cursor-pointer" 
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Session Context Note</label>
                <input 
                  type="text" 
                  value={sessionNotes} 
                  onChange={e => setSessionNotes(e.target.value)} 
                  placeholder="e.g. Conducted morning workshops in 2 classrooms" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" 
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setActiveLoggingItem(null)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={isSubmittingSession} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-medium rounded-lg shadow-lg">
                  {isSubmittingSession ? "Saving..." : "Save Session & Advance Streak (+35 XP)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN TASK TO EMPLOYEE BUCKET */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Assign Task to Employee Bucket</h3>
            <form onSubmit={handleAddWorkboardItem} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Assignee</label>
                <select required value={assigneeEmail} onChange={e => setAssigneeEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200">
                  {employees.map(e => <option key={e.Email} value={e.Email}>{e.Name} ({e.Email})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Project</label>
                <select required value={newItemProject} onChange={e => setNewItemProject(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200">
                  {projects.map(p => <option key={p.Project_ID} value={p.Project_ID}>[{p.Project_ID}] {p.Project_Name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Task Code</label>
                <select required value={newItemTaskCode} onChange={e => setNewItemTaskCode(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200">
                  {tasks.map(t => <option key={t.Task_Code} value={t.Task_Code}>[{t.Task_Code}] {t.Task_Title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Goal / Deliverable Statement</label>
                <input required type="text" value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} placeholder="e.g. Prepare Maharishi school pitch presentation" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={isAddingItem} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium">Assign to Bucket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOUNDER MASTER CREATION MODALS */}
      {showEmpModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Onboard Team Member</h3>
            <form onSubmit={handleAddEmployee} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                <input required type="text" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" placeholder="e.g. Harish Srinivasan" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Email</label>
                <input required type="email" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" placeholder="e.g. harish@infiniteengineers.in" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Role Title</label>
                  <input required type="text" value={newEmp.roleTitle} onChange={e => setNewEmp({...newEmp, roleTitle: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" placeholder="e.g. STEM Trainer" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Autonomy Level</label>
                  <select value={newEmp.level} onChange={e => setNewEmp({...newEmp, level: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200">
                    <option value="L1 Foundational">L1 Foundational</option>
                    <option value="L2 Independent">L2 Independent</option>
                    <option value="L3 Advanced">L3 Advanced</option>
                    <option value="L4 Strategic">L4 Strategic</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Concise Baseline KRAs</label>
                <textarea rows="3" required value={newEmp.rnrSummary} onChange={e => setNewEmp({...newEmp, rnrSummary: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" placeholder="e.g. 1. Deliver STEM workshops in 4 schools&#10;2. Calibrate lab kits&#10;3. Zero delivery escalations" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowEmpModal(false)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">Save & Onboard</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPrjModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Create New Project</h3>
            <form onSubmit={handleAddProject} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Project Code</label>
                <input required type="text" value={newPrj.projectId} onChange={e => setNewPrj({...newPrj, projectId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 uppercase" placeholder="e.g. PRJ-DEXTER" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Project Name</label>
                <input required type="text" value={newPrj.projectName} onChange={e => setNewPrj({...newPrj, projectName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" placeholder="e.g. Dexter Box Science Kits" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Priority</label>
                <select value={newPrj.priority} onChange={e => setNewPrj({...newPrj, priority: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200">
                  <option value="P1 Critical">P1 Critical</option>
                  <option value="P2 High">P2 High</option>
                  <option value="P3 Supporting">P3 Supporting</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPrjModal(false)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Add Global Reusable Task Code</h3>
            <form onSubmit={handleAddTask} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Task Code</label>
                <input required type="text" value={newTsk.taskCode} onChange={e => setNewTsk({...newTsk, taskCode: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 uppercase" placeholder="e.g. TSK-DESIGN" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Task Title</label>
                <input required type="text" value={newTsk.taskTitle} onChange={e => setNewTsk({...newTsk, taskTitle: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" placeholder="e.g. Presentation & Collateral Design" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Category</label>
                <select value={newTsk.category} onChange={e => setNewTsk({...newTsk, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200">
                  <option value="DEL">Core Delivery / Execution</option>
                  <option value="STR">Strategic Priority</option>
                  <option value="OPS">Operations & Admin</option>
                  <option value="INP">Innovation & Prototyping</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowTskModal(false)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">Add to Library</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

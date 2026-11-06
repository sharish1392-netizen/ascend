import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, Award, CheckCircle, Clock, BookOpen, Send, Shield, 
  ChevronRight, Sparkles, RefreshCw, FolderPlus, UserPlus, 
  ListPlus, CalendarCheck, CheckSquare, Zap, GraduationCap, LayoutGrid,
  Plus, Trash2, CheckCircle2, AlertCircle, BarChart3, Sliders
} from 'lucide-react';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7ZFH8WtVf33bh98R9eMwo4rCYr4Evk2WeHmYdkjKgFgCGrrEPMFxrYwX0bQlZSrjUhQ/exec";

function getCurrentMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

export default function App() {
  const [viewRole, setViewRole] = useState("founder"); // 'founder' | 'employee'
  const [activeEmployeeEmail, setActiveEmployeeEmail] = useState("");
  const [activeTab, setActiveTab] = useState("daily"); // 'daily' | 'weekly' | 'catalog' | 'levels' | 'rnr'
  
  // Sheet Data
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [learningModules, setLearningModules] = useState([]);
  const [weeklyPulses, setWeeklyPulses] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Founder Creation Modals
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [showPrjModal, setShowPrjModal] = useState(false);
  const [showTskModal, setShowTskModal] = useState(false);
  const [showLrnModal, setShowLrnModal] = useState(false);

  // Forms for Founder
  const [newEmp, setNewEmp] = useState({ name: "", email: "", roleTitle: "", department: "Training & Delivery", level: "L3 Advanced", rnrSummary: "" });
  const [newPrj, setNewPrj] = useState({ projectId: "", projectName: "", priority: "P1 Critical", ownerEmail: "" });
  const [newTsk, setNewTsk] = useState({ taskCode: "", taskTitle: "", category: "DEL" });
  const [newLrn, setNewLrn] = useState({ moduleCode: "", domain: "STEM Hardware", topicTitle: "", targetProficiency: "Intermediate" });

  // Dual Hour & Minute Sliders State (Daily Logger)
  const [taskSliderHours, setTaskSliderHours] = useState(1);
  const [taskSliderMins, setTaskSliderMins] = useState(30);
  const totalTaskMins = (Number(taskSliderHours) * 60) + Number(taskSliderMins);

  const [lrnSliderHours, setLrnSliderHours] = useState(0);
  const [lrnSliderMins, setLrnSliderMins] = useState(30);
  const totalLrnMins = (Number(lrnSliderHours) * 60) + Number(lrnSliderMins);

  // Multi-Entry Daily Logger Staging Queue
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTaskCode, setSelectedTaskCode] = useState("");
  const [selectedLearningModule, setSelectedLearningModule] = useState("None");
  const [dailyNotes, setDailyNotes] = useState("");
  const [taskStatus, setTaskStatus] = useState("Done");
  const [stagedLogs, setStagedLogs] = useState([]);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  // Monday Structured Commitment Matrix State
  const [mondayProject, setMondayProject] = useState("");
  const [mondayTaskCode, setMondayTaskCode] = useState("");
  const [mondayGoalText, setMondayGoalText] = useState("");
  const [stagedCommitments, setStagedCommitments] = useState([]);
  const [isSubmittingMonday, setIsSubmittingMonday] = useState(false);

  // Friday Reflection State
  const [fridayOutcome, setFridayOutcome] = useState("");
  const [isSubmittingFriday, setIsSubmittingFriday] = useState(false);

  const currentMondayStr = getCurrentMonday();

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
        }
        if (data.projects?.length > 0 && !selectedProject) {
          setSelectedProject(data.projects[0].Project_ID);
          setMondayProject(data.projects[0].Project_ID);
        }
        if (data.tasks?.length > 0 && !selectedTaskCode) {
          setSelectedTaskCode(data.tasks[0].Task_Code);
          setMondayTaskCode(data.tasks[0].Task_Code);
        }
      }
    } catch (err) {
      console.log("Sheet sync notice:", err);
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

  // Filter logs recorded this week
  const thisWeekLogs = useMemo(() => {
    return empDailyLogs.filter(l => l.Date >= currentMondayStr);
  }, [empDailyLogs, currentMondayStr]);

  // Total task minutes and hours
  const autoTaskMinutesTotal = useMemo(() => {
    return thisWeekLogs.reduce((acc, curr) => {
      const val = Number(curr.Task_Hours || 0);
      return acc + (val > 24 ? val : Math.round(val * 60));
    }, 0);
  }, [thisWeekLogs]);

  const autoLearningMinutesTotal = useMemo(() => {
    return thisWeekLogs.reduce((acc, curr) => {
      const val = Number(curr.Learning_Hours || 0);
      return acc + (val > 24 ? val : Math.round(val * 60));
    }, 0);
  }, [thisWeekLogs]);

  // Current Week's Pulses for Active Employee
  const currentWeekPulses = weeklyPulses.filter(p => 
    (p.Emp_Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase() &&
    p.Week_Start_Date === currentMondayStr
  );

  // Reconcile Monday Commitments against Actual Logged Tasks
  const weeklyReconciliation = useMemo(() => {
    if (currentWeekPulses.length === 0) return { total: 0, completed: 0, percent: 0, items: [] };

    let completedCount = 0;
    const items = currentWeekPulses.map(pulse => {
      // Find matching daily logs for same project and task code
      const matching = thisWeekLogs.filter(log => 
        log.Project_ID === pulse.Project_ID && 
        (pulse.Task_Code ? log.Task_Code === pulse.Task_Code : true)
      );
      
      const loggedMins = matching.reduce((sum, l) => {
        const v = Number(l.Task_Hours || 0);
        return sum + (v > 24 ? v : Math.round(v * 60));
      }, 0);

      const isDone = matching.length > 0;
      if (isDone) completedCount++;

      return {
        pulseId: pulse.Pulse_ID,
        project: pulse.Project_ID,
        taskCode: pulse.Task_Code || "General",
        commitment: pulse.Monday_Commitment,
        entriesCount: matching.length,
        loggedMinutes: loggedMins,
        isCompleted: isDone
      };
    });

    const percent = Math.round((completedCount / currentWeekPulses.length) * 100);
    return { total: currentWeekPulses.length, completed: completedCount, percent, items };
  }, [currentWeekPulses, thisWeekLogs]);

  // Founder Creation Handlers
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    const employeeEntry = {
      Emp_ID: "IE-" + ("00" + (employees.length + 1)).slice(-3),
      Name: newEmp.name,
      Email: newEmp.email.toLowerCase().trim(),
      Role_Title: newEmp.roleTitle,
      Department: newEmp.department,
      Level: newEmp.level,
      "R&R_Summary": newEmp.rnrSummary,
      Status: "Active"
    };

    setEmployees(prev => [...prev, employeeEntry]);
    if (!activeEmployeeEmail) setActiveEmployeeEmail(employeeEntry.Email);
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
    const projectEntry = {
      Project_ID: newPrj.projectId.toUpperCase().trim(),
      Project_Name: newPrj.projectName,
      Priority_Level: newPrj.priority,
      Owner_Email: (newPrj.ownerEmail || "").toLowerCase().trim(),
      Status: "Active"
    };

    setProjects(prev => [...prev, projectEntry]);
    if (!selectedProject) setSelectedProject(projectEntry.Project_ID);
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
    const taskEntry = {
      Task_Code: newTsk.taskCode.toUpperCase().trim(),
      Task_Title: newTsk.taskTitle,
      Category: newTsk.category
    };

    setTasks(prev => [...prev, taskEntry]);
    if (!selectedTaskCode) setSelectedTaskCode(taskEntry.Task_Code);
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

  const handleAddLearningModule = async (e) => {
    e.preventDefault();
    const lrnEntry = {
      Module_Code: newLrn.moduleCode.toUpperCase().trim(),
      Domain: newLrn.domain,
      Topic_Title: newLrn.topicTitle,
      Target_Proficiency: newLrn.targetProficiency
    };

    setLearningModules(prev => [...prev, lrnEntry]);
    setShowLrnModal(false);
    showToast(`Learning module ${newLrn.moduleCode} added!`);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "createLearningModule", ...newLrn })
      });
    } catch (err) { console.log(err); }
    setNewLrn({ moduleCode: "", domain: "STEM Hardware", topicTitle: "", targetProficiency: "Intermediate" });
  };

  // Add Item to Staged Batch Queue
  const handleStageTask = () => {
    if (!selectedProject || !selectedTaskCode) {
      showToast("Select a project and task code first.");
      return;
    }
    if (totalTaskMins === 0 && totalLrnMins === 0) {
      showToast("Please select time using the slider.");
      return;
    }

    const item = {
      id: Date.now(),
      projectId: selectedProject,
      taskCode: selectedTaskCode,
      taskMinutes: totalTaskMins,
      learningModuleCode: selectedLearningModule,
      learningMinutes: totalLrnMins,
      notes: dailyNotes || "",
      status: taskStatus
    };

    setStagedLogs(prev => [...prev, item]);
    setDailyNotes("");
    showToast("Task added to queue. Add another or hit Submit All.");
  };

  const removeStagedLog = (id) => {
    setStagedLogs(prev => prev.filter(item => item.id !== id));
  };

  // Submit All Staged Logs or Single Entry
  const handleBatchSubmit = async () => {
    const logsToSend = stagedLogs.length > 0 ? stagedLogs : [{
      id: Date.now(),
      projectId: selectedProject,
      taskCode: selectedTaskCode,
      taskMinutes: totalTaskMins,
      learningModuleCode: selectedLearningModule,
      learningMinutes: totalLrnMins,
      notes: dailyNotes || "",
      status: taskStatus
    }];

    if (logsToSend[0].taskMinutes === 0 && logsToSend[0].learningMinutes === 0) {
      showToast("Time cannot be 0. Adjust the sliders.");
      return;
    }

    setIsSubmittingBatch(true);
    let nextStreak = currentStreak + 1;

    for (const log of logsToSend) {
      const payload = {
        action: "submitDailyLog",
        email: activeEmployeeEmail,
        projectId: log.projectId,
        taskCode: log.taskCode,
        taskHours: log.taskMinutes, // stores exact minutes
        learningModuleCode: log.learningModuleCode || "None",
        learningHours: log.learningMinutes,
        status: log.status,
        currentStreak: nextStreak - 1,
        notes: log.notes
      };

      try {
        fetch(APPS_SCRIPT_URL, {
          method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(payload)
        });
      } catch (err) { console.log(err); }

      setDailyLogs(prev => [...prev, {
        Log_ID: "LOG-" + log.id,
        Date: new Date().toISOString().split('T')[0],
        Emp_Email: activeEmployeeEmail,
        Project_ID: log.projectId,
        Task_Code: log.taskCode,
        Task_Hours: log.taskMinutes,
        Learning_Module_Code: log.learningModuleCode,
        Learning_Hours: log.learningMinutes,
        Status: log.status,
        Streak_Count: nextStreak
      }]);
    }

    setStagedLogs([]);
    setDailyNotes("");
    setIsSubmittingBatch(false);
    showToast(`🚀 Successfully logged ${logsToSend.length} task(s)! Streak advanced.`);
  };

  // Monday Staged Commitments
  const handleStageCommitment = () => {
    if (!mondayGoalText.trim()) {
      showToast("Enter a concrete deliverable goal statement.");
      return;
    }

    const item = {
      id: Date.now(),
      projectId: mondayProject,
      taskCode: mondayTaskCode,
      commitment: mondayGoalText
    };

    setStagedCommitments(prev => [...prev, item]);
    setMondayGoalText("");
  };

  const removeStagedCommitment = (id) => {
    setStagedCommitments(prev => prev.filter(item => item.id !== id));
  };

  const handleMondaySubmitBatch = async () => {
    const toSend = stagedCommitments.length > 0 ? stagedCommitments : (mondayGoalText.trim() ? [{
      id: Date.now(),
      projectId: mondayProject,
      taskCode: mondayTaskCode,
      commitment: mondayGoalText
    }] : []);

    if (toSend.length === 0) {
      showToast("Please enter at least one Monday commitment.");
      return;
    }

    setIsSubmittingMonday(true);

    for (const c of toSend) {
      const payload = {
        action: "submitMondayCommitment",
        email: activeEmployeeEmail,
        projectId: c.projectId,
        taskCode: c.taskCode,
        weekStartDate: currentMondayStr,
        commitment: c.commitment
      };

      try {
        fetch(APPS_SCRIPT_URL, {
          method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(payload)
        });
      } catch (err) { console.log(err); }

      setWeeklyPulses(prev => [...prev, {
        Pulse_ID: "PLS-" + c.id,
        Week_Start_Date: currentMondayStr,
        Emp_Email: activeEmployeeEmail,
        Project_ID: c.projectId,
        Task_Code: c.taskCode,
        Monday_Commitment: c.commitment,
        Auto_Task_Hours: 0,
        Auto_Learning_Hours: 0,
        Status: "Committed"
      }]);
    }

    setStagedCommitments([]);
    setMondayGoalText("");
    setIsSubmittingMonday(false);
    showToast("🎯 Monday targets locked in! (+20 XP)");
  };

  // Friday Review Handler
  const handleFridaySubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingFriday(true);

    const payload = {
      action: "submitFridayReview",
      pulseId: currentWeekPulses.length > 0 ? currentWeekPulses[0].Pulse_ID : "",
      email: activeEmployeeEmail,
      weekStartDate: currentMondayStr,
      projectId: currentWeekPulses.length > 0 ? currentWeekPulses[0].Project_ID : selectedProject,
      commitment: currentWeekPulses.length > 0 ? currentWeekPulses[0].Monday_Commitment : "Weekly Targets",
      autoTaskHours: autoTaskMinutesTotal,
      autoLearningHours: autoLearningMinutesTotal,
      fridayOutcome: fridayOutcome || `Completed ${weeklyReconciliation.percent}% of committed deliverables.`
    };

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
      });
      showToast("🎉 Friday review auto-submitted! (+50 XP)");
      setFridayOutcome("");
      setTimeout(fetchSheetData, 1500);
    } catch (err) {
      console.log(err);
    } finally {
      setIsSubmittingFriday(false);
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
                IE Goal Tracker
              </span>
              <span className="text-xs text-slate-500 block">Infinite Engineers • Precision Cadence</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={fetchSheetData} title="Sync with Sheet" className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs">
              <button 
                onClick={() => setViewRole("founder")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${viewRole === "founder" ? "bg-blue-600 text-white font-medium" : "text-slate-400 hover:text-white"}`}
              >
                <Shield className="h-3.5 w-3.5" /> Founder View
              </button>

              <button 
                onClick={() => setViewRole("employee")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${viewRole === "employee" ? "bg-indigo-600 text-white font-medium" : "text-slate-400 hover:text-white"}`}
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

      {/* Toast Alert */}
      {toastMessage && (
        <div className="max-w-md mx-auto mt-4 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm flex items-center gap-2 shadow-lg animate-pulse">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {viewRole === "founder" ? (
          /* ================= FOUNDER CONTROL VIEW ================= */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Founder Control Center</h1>
                <p className="text-sm text-slate-400">Configure global projects, company tasks, learning modules, and audit team execution</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setShowPrjModal(true)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5">
                  <FolderPlus className="h-3.5 w-3.5 text-blue-400" /> + Project
                </button>
                <button onClick={() => setShowTskModal(true)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5">
                  <ListPlus className="h-3.5 w-3.5 text-blue-400" /> + Task Code
                </button>
                <button onClick={() => setShowLrnModal(true)} className="px-3 py-2 bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 rounded-xl text-xs font-medium border border-purple-700 flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-purple-400" /> + Learning Module
                </button>
                <button onClick={() => setShowEmpModal(true)} className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-blue-600/20">
                  <UserPlus className="h-3.5 w-3.5" /> + Onboard Employee
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Team</span>
                <div className="text-2xl font-bold mt-1 text-white">{employees.length} Members</div>
                <span className="text-xs text-slate-500 mt-1 block">Live Onboarded</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Projects</span>
                <div className="text-2xl font-bold mt-1 text-blue-400">{projects.length} Initiatives</div>
                <span className="text-xs text-slate-500 mt-1 block">Reusable pairing</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Master Task Codes</span>
                <div className="text-2xl font-bold mt-1 text-slate-100">{tasks.length} Codes</div>
                <span className="text-xs text-slate-500 mt-1 block">Cross-cutting library</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Weekly Pulses</span>
                <div className="text-2xl font-bold mt-1 text-purple-400">{weeklyPulses.length} Pulses</div>
                <span className="text-xs text-slate-500 mt-1 block">Monday/Friday matrix</span>
              </div>
            </div>

            {/* Live Team Roster with Level & R&R */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <h3 className="font-semibold text-sm text-slate-200">Team Roster, Autonomy Levels & R&R</h3>
                <span className="text-xs text-slate-400">Synced with Sheet</span>
              </div>
              {employees.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No team members onboarded yet. Click "+ Onboard Employee" to begin.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950/60 text-slate-400 text-xs border-b border-slate-800 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Member & Email</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="px-5 py-3">Autonomy Level</th>
                        <th className="px-5 py-3">Core Baseline R&R</th>
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
              )}
            </div>

            {/* Weekly Cadence Rollup with Real-time Progress Bar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <h3 className="font-semibold text-sm text-slate-200">Execution Cadence Rollup (Week of {currentMondayStr})</h3>
                <span className="text-xs text-slate-400">Real-time Goal Fulfillment</span>
              </div>
              {weeklyPulses.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No commitments logged this week yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950/60 text-slate-400 text-xs border-b border-slate-800 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Member</th>
                        <th className="px-5 py-3">Committed Goal</th>
                        <th className="px-5 py-3">Project & Task</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {weeklyPulses.map(pulse => (
                        <tr key={pulse.Pulse_ID} className="hover:bg-slate-800/40 transition">
                          <td className="px-5 py-3.5 font-medium text-slate-200">{pulse.Emp_Email}</td>
                          <td className="px-5 py-3.5 text-xs text-slate-300 max-w-sm">{pulse.Monday_Commitment}</td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                              {pulse.Project_ID} {pulse.Task_Code ? `• ${pulse.Task_Code}` : ''}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${pulse.Status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"}`}>
                              {pulse.Status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ================= EMPLOYEE COCKPIT VIEW ================= */
          <div className="space-y-6">
            {/* Header Profile Card */}
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

            {/* Nav Tabs */}
            <div className="flex border-b border-slate-800 text-sm gap-6 overflow-x-auto">
              <button onClick={() => setActiveTab("daily")} className={`pb-3 font-medium transition shrink-0 ${activeTab === "daily" ? "text-blue-400 border-b-2 border-blue-500" : "text-slate-400 hover:text-white"}`}>
                Daily Precision Logger
              </button>
              <button onClick={() => setActiveTab("weekly")} className={`pb-3 font-medium transition shrink-0 flex items-center gap-1.5 ${activeTab === "weekly" ? "text-indigo-400 border-b-2 border-indigo-500" : "text-slate-400 hover:text-white"}`}>
                <CalendarCheck className="h-4 w-4" /> Weekly Cadence (Monday & Friday)
              </button>
              <button onClick={() => setActiveTab("levels")} className={`pb-3 font-medium transition shrink-0 flex items-center gap-1.5 ${activeTab === "levels" ? "text-amber-400 border-b-2 border-amber-500" : "text-slate-400 hover:text-white"}`}>
                <BarChart3 className="h-4 w-4" /> L1–L4 Autonomy Matrix
              </button>
              <button onClick={() => setActiveTab("catalog")} className={`pb-3 font-medium transition shrink-0 flex items-center gap-1.5 ${activeTab === "catalog" ? "text-emerald-400 border-b-2 border-emerald-500" : "text-slate-400 hover:text-white"}`}>
                <LayoutGrid className="h-4 w-4" /> Company Catalog
              </button>
              <button onClick={() => setActiveTab("rnr")} className={`pb-3 font-medium transition shrink-0 flex items-center gap-1.5 ${activeTab === "rnr" ? "text-purple-400 border-b-2 border-purple-500" : "text-slate-400 hover:text-white"}`}>
                <BookOpen className="h-4 w-4" /> My R&R
              </button>
            </div>

            {/* TAB 1: DAILY DUAL SLIDER PRECISION LOGGER (LOG-AS-YOU-GO OR MULTI-TASK QUEUE) */}
            {activeTab === "daily" && (
              <div className="space-y-6">
                <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-5 shadow-xl shadow-blue-950/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <h3 className="font-semibold text-base text-slate-100">Log Daily Tasks & Learning (Sliders)</h3>
                    </div>
                    <span className="text-xs text-slate-400">Log instantly or stack multiple tasks into the queue below</span>
                  </div>

                  {projects.length === 0 || tasks.length === 0 ? (
                    <div className="p-6 bg-slate-950/60 rounded-xl text-center text-sm text-slate-400 border border-slate-800">
                      Switch to <strong>Founder View</strong> to create at least one Project and one Global Task Code first.
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Section 1: Project Execution Pairing */}
                      <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-4">
                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block">1. Project Execution Track</span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Target Project</label>
                            <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
                              {projects.map(p => <option key={p.Project_ID} value={p.Project_ID}>[{p.Project_ID}] {p.Project_Name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Reusable Task Code</label>
                            <select value={selectedTaskCode} onChange={e => setSelectedTaskCode(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
                              {tasks.map(t => <option key={t.Task_Code} value={t.Task_Code}>[{t.Task_Code}] {t.Task_Title} ({t.Category})</option>)}
                            </select>
                          </div>
                        </div>

                        {/* Interactive Dual Sliders for Task Time */}
                        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-300 font-medium flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-blue-400" /> Task Time:
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold text-xs border border-blue-500/30">
                              {taskSliderHours}h {taskSliderMins}m ({totalTaskMins} mins / {(totalTaskMins/60).toFixed(2)} hrs)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <div>
                              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                                <span>Hours</span>
                                <span className="font-semibold text-white">{taskSliderHours} hrs</span>
                              </div>
                              <input 
                                type="range" min="0" max="10" step="1" 
                                value={taskSliderHours} 
                                onChange={e => setTaskSliderHours(Number(e.target.value))}
                                className="w-full accent-blue-500 cursor-pointer" 
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                                <span>Minutes</span>
                                <span className="font-semibold text-white">{taskSliderMins} mins</span>
                              </div>
                              <input 
                                type="range" min="0" max="45" step="15" 
                                value={taskSliderMins} 
                                onChange={e => setTaskSliderMins(Number(e.target.value))}
                                className="w-full accent-blue-500 cursor-pointer" 
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Deliberate Learning Track */}
                      <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-4">
                        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider block">2. Deliberate Learning Track (Multi-Module Compatible)</span>
                        
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Learning Module</label>
                          <select value={selectedLearningModule} onChange={e => setSelectedLearningModule(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
                            <option value="None">None for this entry</option>
                            {learningModules.map(m => <option key={m.Module_Code} value={m.Module_Code}>[{m.Module_Code}] {m.Topic_Title} ({m.Domain})</option>)}
                          </select>
                        </div>

                        {selectedLearningModule !== "None" && (
                          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                                <GraduationCap className="h-3.5 w-3.5 text-purple-400" /> Learning Time:
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold text-xs border border-purple-500/30">
                                {lrnSliderHours}h {lrnSliderMins}m ({totalLrnMins} mins)
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                              <div>
                                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                                  <span>Hours</span>
                                  <span className="font-semibold text-white">{lrnSliderHours} hrs</span>
                                </div>
                                <input 
                                  type="range" min="0" max="4" step="1" 
                                  value={lrnSliderHours} 
                                  onChange={e => setLrnSliderHours(Number(e.target.value))}
                                  className="w-full accent-purple-500 cursor-pointer" 
                                />
                              </div>
                              <div>
                                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                                  <span>Minutes</span>
                                  <span className="font-semibold text-white">{lrnSliderMins} mins</span>
                                </div>
                                <input 
                                  type="range" min="0" max="45" step="15" 
                                  value={lrnSliderMins} 
                                  onChange={e => setLrnSliderMins(Number(e.target.value))}
                                  className="w-full accent-purple-500 cursor-pointer" 
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Notes & Status */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-xs text-slate-400 block mb-1">Context Notes / Proof Link (Optional)</label>
                          <input type="text" value={dailyNotes} onChange={e => setDailyNotes(e.target.value)} placeholder="e.g. Conducted robotics session with 40 students & calibrated sensors" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Status</label>
                          <select value={taskStatus} onChange={e => setTaskStatus(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200">
                            <option value="Done">Done (Builds Streak)</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Blocked">Blocked</option>
                          </select>
                        </div>
                      </div>

                      {/* Action Buttons: Add to Queue vs Log Immediately */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button 
                          type="button" 
                          onClick={handleStageTask} 
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 border border-slate-700 transition"
                        >
                          <Plus className="h-4 w-4 text-emerald-400" /> + Add to Today's Multi-Task Queue
                        </button>

                        <button 
                          type="button" 
                          disabled={isSubmittingBatch}
                          onClick={handleBatchSubmit} 
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-medium py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-blue-500/20"
                        >
                          <Send className="h-4 w-4" /> {isSubmittingBatch ? "Logging..." : (stagedLogs.length > 0 ? `Submit All (${stagedLogs.length}) Staged Tasks (+35 XP)` : "Log This Single Task (+35 XP)")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Staged Multi-Task Queue List */}
                {stagedLogs.length > 0 && (
                  <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Queued for Submission Today ({stagedLogs.length} Activities)
                      </h4>
                      <span className="text-xs text-slate-400 font-mono">
                        Total Queued: {stagedLogs.reduce((acc, c) => acc + c.taskMinutes, 0)} mins
                      </span>
                    </div>

                    <div className="divide-y divide-slate-800/80">
                      {stagedLogs.map(item => (
                        <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-mono text-blue-400 font-semibold">[{item.projectId} • {item.taskCode}]</span>{" "}
                            <span className="text-slate-200">{item.taskMinutes} mins</span>
                            {item.learningModuleCode !== "None" && (
                              <span className="text-purple-400 ml-2 font-mono">• Lrn: [{item.learningModuleCode}] {item.learningMinutes}m</span>
                            )}
                            {item.notes && <span className="text-slate-400 block mt-0.5 italic">"{item.notes}"</span>}
                          </div>
                          <button onClick={() => removeStagedLog(item.id)} className="text-rose-400 hover:text-rose-300 p-1">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: WEEKLY CADENCE (MONDAY STRUCTURED MATRIX & FRIDAY AUTO-RECONCILIATION) */}
            {activeTab === "weekly" && (
              <div className="space-y-6">
                {/* 1. MONDAY COMMITMENT MATRIX */}
                <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-400" />
                      <h3 className="font-semibold text-base text-slate-100">Step 1: Monday Structured Target Matrix</h3>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono">Week of {currentMondayStr}</span>
                  </div>

                  <p className="text-xs text-slate-400 mb-4">
                    Commit your tangible, high-priority deliverables for this week. You can add multiple commitments across projects.
                  </p>

                  {/* Add Commitment Line Item */}
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3 mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Target Project</label>
                        <select value={mondayProject} onChange={e => setMondayProject(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
                          {projects.map(p => <option key={p.Project_ID} value={p.Project_ID}>[{p.Project_ID}] {p.Project_Name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Expected Primary Task Code</label>
                        <select value={mondayTaskCode} onChange={e => setMondayTaskCode(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
                          {tasks.map(t => <option key={t.Task_Code} value={t.Task_Code}>[{t.Task_Code}] {t.Task_Title}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Deliverable Commitment Statement</label>
                      <input 
                        type="text" 
                        value={mondayGoalText} 
                        onChange={e => setMondayGoalText(e.target.value)} 
                        placeholder="e.g. Conduct hands-on workshops in 4 partner schools & calibrate 20 lab sensors" 
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200" 
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button 
                        type="button" 
                        onClick={handleStageCommitment}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5 text-blue-400" /> + Add Another Goal
                      </button>
                      <button 
                        type="button" 
                        disabled={isSubmittingMonday}
                        onClick={handleMondaySubmitBatch}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg shadow-lg flex items-center gap-1.5"
                      >
                        <CheckSquare className="h-3.5 w-3.5" /> {isSubmittingMonday ? "Locking..." : "Lock All Monday Commitments (+20 XP)"}
                      </button>
                    </div>
                  </div>

                  {/* Staged Goals Queue */}
                  {stagedCommitments.length > 0 && (
                    <div className="mb-4 bg-slate-950/80 p-3 rounded-xl border border-blue-500/30">
                      <span className="text-xs font-semibold text-blue-300 block mb-2">Queued Monday Goals (Hit 'Lock All' to Save):</span>
                      <div className="space-y-1.5">
                        {stagedCommitments.map(item => (
                          <div key={item.id} className="flex justify-between items-center text-xs bg-slate-900 p-2 rounded border border-slate-800">
                            <div>
                              <span className="font-mono text-blue-400 font-medium">[{item.projectId} • {item.taskCode}]</span>{" "}
                              <span className="text-slate-200">{item.commitment}</span>
                            </div>
                            <button onClick={() => removeStagedCommitment(item.id)} className="text-rose-400 hover:text-rose-300">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Committed Goals from Google Sheet */}
                  {currentWeekPulses.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">Locked Weekly Targets:</span>
                      <div className="space-y-2">
                        {currentWeekPulses.map(pulse => (
                          <div key={pulse.Pulse_ID} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                            <div>
                              <span className="font-mono text-blue-400 font-semibold">[{pulse.Project_ID} {pulse.Task_Code ? `• ${pulse.Task_Code}` : ''}]</span>{" "}
                              <span className="text-slate-200 font-medium">{pulse.Monday_Commitment}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                              Locked
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. FRIDAY AUTO-RECONCILIATION & PROGRESS ENGINE */}
                <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                      <h3 className="font-semibold text-base text-slate-100">Step 2: Friday Auto-Reconciliation & Review</h3>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono">Friday 5 PM Review</span>
                  </div>

                  {/* Goal Completion Progress Bar */}
                  <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 mb-4 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-300">Committed Goals Fulfilled:</span>
                      <span className="font-bold text-emerald-400 font-mono text-sm">{weeklyReconciliation.percent}% ({weeklyReconciliation.completed}/{weeklyReconciliation.total} Goals)</span>
                    </div>

                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-500" 
                        style={{ width: `${weeklyReconciliation.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Reconciled Line Items Comparison */}
                  {weeklyReconciliation.items.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Goal vs. Actual Work Audit:</span>
                      <div className="divide-y divide-slate-800/80 bg-slate-950/60 rounded-xl border border-slate-800 p-2">
                        {weeklyReconciliation.items.map(item => (
                          <div key={item.pulseId} className="py-2 px-2 flex justify-between items-center text-xs">
                            <div>
                              <div className="text-slate-200 font-medium">{item.commitment}</div>
                              <span className="font-mono text-slate-500">[{item.project} • {item.taskCode}]</span>
                            </div>
                            <div className="text-right">
                              {item.isCompleted ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> {item.entriesCount} Logs ({item.loggedMinutes}m)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                                  <AlertCircle className="h-3.5 w-3.5" /> 0 Logs this week
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Aggregated Hours Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Project Execution Total:</span>
                      <div className="text-xl font-bold text-blue-400">{autoTaskMinutesTotal} Mins ({(autoTaskMinutesTotal / 60).toFixed(1)} hrs)</div>
                      <span className="text-xs text-slate-500 block mt-0.5">Calculated from Monday through Friday logs</span>
                    </div>

                    <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Deliberate Learning Total:</span>
                      <div className="text-xl font-bold text-purple-400">{autoLearningMinutesTotal} Mins ({(autoLearningMinutesTotal / 60).toFixed(1)} hrs)</div>
                      <span className="text-xs text-slate-500 block mt-0.5">Calculated from module upskilling</span>
                    </div>
                  </div>

                  <form onSubmit={handleFridaySubmit} className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">1-Sentence Wrap-up & Reflection</label>
                      <input 
                        type="text" 
                        value={fridayOutcome} 
                        onChange={e => setFridayOutcome(e.target.value)} 
                        placeholder={`e.g. Achieved ${weeklyReconciliation.percent}% of deliverables across scheduled workshops.`}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200" 
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSubmittingFriday} 
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-medium py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Send className="h-4 w-4" /> Submit Friday Review (+50 XP)
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 3: L1–L4 AUTONOMY MATRIX EXPLANATION */}
            {activeTab === "levels" && (
              <div className="space-y-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <h3 className="font-bold text-base text-slate-100 mb-1 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-amber-400" /> Organizational Autonomy Levels (L1 – L4)
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Clear expectations for communication, ownership, and progression across the company.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-blue-400 font-bold border border-slate-700">Level 1</span>
                        <h4 className="font-semibold text-sm text-white">Foundational / Guided Execution</h4>
                      </div>
                      <p className="text-xs text-amber-300 font-mono mb-2">"I deliver defined tasks with guidance."</p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Follows standard operating procedures, kit assembly guidelines, and training scripts. Focused on building speed, punctuality, and error-free execution.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-blue-400 font-bold border border-slate-700">Level 2</span>
                        <h4 className="font-semibold text-sm text-white">Independent Contributor</h4>
                      </div>
                      <p className="text-xs text-emerald-300 font-mono mb-2">"I own my schedule and solve routine bottlenecks."</p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Executes school workshops, design collateral, or accounts end-to-end without daily supervision. Anticipates missing materials and resolves minor school delays proactively.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-indigo-400 font-bold border border-slate-700">Level 3</span>
                        <h4 className="font-semibold text-sm text-white">Advanced / Lead Execution</h4>
                      </div>
                      <p className="text-xs text-indigo-300 font-mono mb-2">"I optimize systems, mentor others, and deliver complex outcomes."</p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Leads multi-school rollouts, develops new kit experiments, or builds automated tools. Mentors L1/L2 teammates and creates reusable company playbooks.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-purple-400 font-bold border border-slate-700">Level 4</span>
                        <h4 className="font-semibold text-sm text-white">Strategic / Pillar Owner</h4>
                      </div>
                      <p className="text-xs text-purple-300 font-mono mb-2">"I create the roadmap, align resources, and drive company growth."</p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Directs business pillars (B2B School Growth, Dexter Box Product Line, ATL Operations). Translates leadership priorities into quarter-long roadmaps.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: COMPANY CATALOG & LIBRARIES */}
            {activeTab === "catalog" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                    <h4 className="font-semibold text-sm text-slate-200 mb-3 flex items-center gap-2">
                      <FolderPlus className="h-4 w-4 text-blue-400" /> Active Projects ({projects.length})
                    </h4>
                    {projects.length === 0 ? (
                      <p className="text-xs text-slate-500">No active projects created yet.</p>
                    ) : (
                      <div className="divide-y divide-slate-800/60">
                        {projects.map(p => (
                          <div key={p.Project_ID} className="py-2.5 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-mono text-blue-400 font-medium">[{p.Project_ID}]</span>{" "}
                              <span className="text-slate-200">{p.Project_Name}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              {p.Priority_Level}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                    <h4 className="font-semibold text-sm text-slate-200 mb-3 flex items-center gap-2">
                      <ListPlus className="h-4 w-4 text-emerald-400" /> Master Reusable Task Codes ({tasks.length})
                    </h4>
                    {tasks.length === 0 ? (
                      <p className="text-xs text-slate-500">No task codes in library yet.</p>
                    ) : (
                      <div className="divide-y divide-slate-800/60">
                        {tasks.map(t => (
                          <div key={t.Task_Code} className="py-2.5 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-mono text-emerald-400 font-medium">[{t.Task_Code}]</span>{" "}
                              <span className="text-slate-200">{t.Task_Title}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              {t.Category}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <h4 className="font-semibold text-sm text-slate-200 mb-3 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-purple-400" /> Deliberate Learning Modules ({learningModules.length})
                  </h4>
                  {learningModules.length === 0 ? (
                    <p className="text-xs text-slate-500">No learning modules added yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {learningModules.map(m => (
                        <div key={m.Module_Code} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1">
                          <span className="font-mono text-purple-400 font-medium">[{m.Module_Code}]</span>
                          <div className="text-slate-200 font-medium">{m.Topic_Title}</div>
                          <div className="text-slate-500">{m.Domain} • {m.Target_Proficiency}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: MY R&R (CONCISE BASELINE KRAS) */}
            {activeTab === "rnr" && (
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

      {/* FOUNDER MODALS */}
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
                  <input required type="text" value={newEmp.roleTitle} onChange={e => setNewEmp({...newEmp, roleTitle: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" placeholder="e.g. Founder & STEM Lead" />
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
                <label className="text-xs text-slate-400 block mb-1">Concise Baseline R&R (3-4 bullet KRAs)</label>
                <textarea rows="3" required value={newEmp.rnrSummary} onChange={e => setNewEmp({...newEmp, rnrSummary: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" placeholder="e.g. 1. Deliver STEM workshops in 4 schools weekly&#10;2. Calibrate & audit lab kits weekly&#10;3. Zero school delivery escalations" />
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

      {showLrnModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Add Deliberate Learning Module</h3>
            <form onSubmit={handleAddLearningModule} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Module Code</label>
                <input required type="text" value={newLrn.moduleCode} onChange={e => setNewLrn({...newLrn, moduleCode: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 uppercase" placeholder="e.g. LRN-ROB-01" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Domain</label>
                <select value={newLrn.domain} onChange={e => setNewLrn({...newLrn, domain: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200">
                  <option value="STEM Hardware">STEM Hardware & Sensors</option>
                  <option value="AI & Digital Media">AI & Digital Media</option>
                  <option value="Design & Prototyping">Design & Prototyping (CAD/MDF)</option>
                  <option value="Pedagogy & Classroom">Pedagogy & Delivery</option>
                  <option value="Finance & Growth">Finance, Ops & Growth</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Topic Title</label>
                <input required type="text" value={newLrn.topicTitle} onChange={e => setNewLrn({...newLrn, topicTitle: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" placeholder="e.g. Raspberry Pi Python GPIO Control" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Proficiency</label>
                <select value={newLrn.targetProficiency} onChange={e => setNewLrn({...newLrn, targetProficiency: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200">
                  <option value="Foundational">Foundational</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced Mastery</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowLrnModal(false)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium">Add to Library</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

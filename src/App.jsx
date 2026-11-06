import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, Award, CheckCircle, Clock, BookOpen, Send, Shield, 
  ChevronRight, Sparkles, RefreshCw, FolderPlus, UserPlus, 
  ListPlus, CalendarCheck, CheckSquare, Zap, GraduationCap, LayoutGrid
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
  const [activeTab, setActiveTab] = useState("daily"); // 'daily' | 'weekly' | 'catalog' | 'rnr'
  
  // Sheet Data
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [learningModules, setLearningModules] = useState([]);
  const [weeklyPulses, setWeeklyPulses] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [showPrjModal, setShowPrjModal] = useState(false);
  const [showTskModal, setShowTskModal] = useState(false);
  const [showLrnModal, setShowLrnModal] = useState(false);

  // Forms
  const [newEmp, setNewEmp] = useState({ name: "", email: "", roleTitle: "", department: "Training & Delivery", level: "L3 Advanced", rnrSummary: "" });
  const [newPrj, setNewPrj] = useState({ projectId: "", projectName: "", priority: "P1 Critical", ownerEmail: "" });
  const [newTsk, setNewTsk] = useState({ taskCode: "", taskTitle: "", category: "DEL" });
  const [newLrn, setNewLrn] = useState({ moduleCode: "", domain: "STEM Hardware", topicTitle: "", targetProficiency: "Intermediate" });

  // Logging State
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTaskCode, setSelectedTaskCode] = useState("");
  const [taskHours, setTaskHours] = useState("2.0");
  const [selectedLearningModule, setSelectedLearningModule] = useState("");
  const [learningHours, setLearningHours] = useState("0.5");
  const [taskStatus, setTaskStatus] = useState("Done");
  const [dailyNotes, setDailyNotes] = useState("");
  const [isSubmittingDaily, setIsSubmittingDaily] = useState(false);

  // Cadence State
  const [mondayCommitment, setMondayCommitment] = useState("");
  const [mondayProject, setMondayProject] = useState("");
  const [isSubmittingMonday, setIsSubmittingMonday] = useState(false);
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

  const currentWeekPulse = weeklyPulses.find(p => 
    (p.Emp_Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase() &&
    p.Week_Start_Date === currentMondayStr
  );

  const thisWeekLogs = useMemo(() => {
    return empDailyLogs.filter(l => l.Date >= currentMondayStr);
  }, [empDailyLogs, currentMondayStr]);

  const autoTaskHoursTotal = useMemo(() => {
    return thisWeekLogs.reduce((acc, curr) => acc + Number(curr.Task_Hours || 0), 0);
  }, [thisWeekLogs]);

  const autoLearningHoursTotal = useMemo(() => {
    return thisWeekLogs.reduce((acc, curr) => acc + Number(curr.Learning_Hours || 0), 0);
  }, [thisWeekLogs]);

  // Founder Creation Handlers (Optimistic UI + Background Sync)
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
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "addEmployee", ...newEmp })
      });
    } catch (err) {
      console.log("Sheet post error:", err);
    }

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
    if (!selectedProject) {
      setSelectedProject(projectEntry.Project_ID);
      setMondayProject(projectEntry.Project_ID);
    }
    setShowPrjModal(false);
    showToast(`Project ${newPrj.projectId} created!`);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "createProject", ...newPrj })
      });
    } catch (err) {
      console.log("Sheet post error:", err);
    }

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
    showToast(`Global task code ${newTsk.taskCode} added to library!`);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "createTask", ...newTsk })
      });
    } catch (err) {
      console.log("Sheet post error:", err);
    }

    setNewTsk({ taskCode: "", taskTitle: "", category: "DEL" });
  };

  const handleAddLearningModule = async (e) => {
    e.preventDefault();
    const learningEntry = {
      Module_Code: newLrn.moduleCode.toUpperCase().trim(),
      Domain: newLrn.domain,
      Topic_Title: newLrn.topicTitle,
      Target_Proficiency: newLrn.targetProficiency
    };

    setLearningModules(prev => [...prev, learningEntry]);
    setShowLrnModal(false);
    showToast(`Learning module ${newLrn.moduleCode} added!`);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "createLearningModule", ...newLrn })
      });
    } catch (err) {
      console.log("Sheet post error:", err);
    }

    setNewLrn({ moduleCode: "", domain: "STEM Hardware", topicTitle: "", targetProficiency: "Intermediate" });
  };

  // Employee Logging Handlers
  const handleDailySubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject || !selectedTaskCode) { showToast("Please select both a project and a task code"); return; }
    setIsSubmittingDaily(true);

    const logEntry = {
      Log_ID: "LOG-" + Date.now(),
      Date: new Date().toISOString().split('T')[0],
      Emp_Email: activeEmployeeEmail,
      Project_ID: selectedProject,
      Task_Code: selectedTaskCode,
      Task_Hours: taskHours,
      Learning_Module_Code: selectedLearningModule || "None",
      Learning_Hours: learningHours,
      Status: taskStatus,
      Streak_Count: currentStreak + 1
    };

    setDailyLogs(prev => [...prev, logEntry]);
    showToast("🔥 Task logged! Streak advanced.");

    const payload = {
      action: "submitDailyLog",
      email: activeEmployeeEmail,
      projectId: selectedProject,
      taskCode: selectedTaskCode,
      taskHours,
      learningModuleCode: selectedLearningModule || "None",
      learningHours,
      status: taskStatus,
      currentStreak,
      notes: dailyNotes
    };

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
      });
      setDailyNotes("");
    } catch (err) {
      console.log("Sheet post error:", err);
    } finally {
      setIsSubmittingDaily(false);
    }
  };

  const handleMondaySubmit = async (e) => {
    e.preventDefault();
    if (!mondayCommitment.trim()) return;
    setIsSubmittingMonday(true);

    const pulseEntry = {
      Pulse_ID: "PLS-" + Date.now(),
      Week_Start_Date: currentMondayStr,
      Emp_Email: activeEmployeeEmail,
      Project_ID: mondayProject,
      Monday_Commitment: mondayCommitment,
      Auto_Task_Hours: 0,
      Auto_Learning_Hours: 0,
      Status: "Committed"
    };

    setWeeklyPulses(prev => [...prev, pulseEntry]);
    showToast("🎯 Monday goal committed! (+20 XP)");

    const payload = {
      action: "submitMondayCommitment",
      email: activeEmployeeEmail,
      projectId: mondayProject,
      weekStartDate: currentMondayStr,
      commitment: mondayCommitment
    };

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
      });
      setMondayCommitment("");
    } catch (err) {
      console.log("Sheet post error:", err);
    } finally {
      setIsSubmittingMonday(false);
    }
  };

  const handleFridaySubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingFriday(true);

    const payload = {
      action: "submitFridayReview",
      pulseId: currentWeekPulse ? currentWeekPulse.Pulse_ID : "",
      email: activeEmployeeEmail,
      weekStartDate: currentMondayStr,
      projectId: currentWeekPulse ? currentWeekPulse.Project_ID : selectedProject,
      commitment: currentWeekPulse ? currentWeekPulse.Monday_Commitment : "Weekly Goals",
      autoTaskHours: autoTaskHoursTotal,
      autoLearningHours: autoLearningHoursTotal,
      fridayOutcome: fridayOutcome || "All weekly targets shipped."
    };

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
      });
      showToast("🎉 Friday review auto-submitted! (+50 XP)");
      setFridayOutcome("");
      setTimeout(fetchSheetData, 1500);
    } catch (err) {
      console.log("Sheet post error:", err);
    } finally {
      setIsSubmittingFriday(false);
    }
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
              <span className="text-xs text-slate-500 block">Infinite Engineers • Global Task Matrix</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={fetchSheetData} title="Sync with Google Sheet" className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
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
                <h1 className="text-2xl font-bold tracking-tight">Founder Control Center</h1>
                <p className="text-sm text-slate-400">Configure global projects, reusable company task codes, and upskilling modules</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setShowPrjModal(true)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5">
                  <FolderPlus className="h-3.5 w-3.5 text-blue-400" /> + New Project
                </button>
                <button onClick={() => setShowTskModal(true)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5">
                  <ListPlus className="h-3.5 w-3.5 text-blue-400" /> + Global Task Code
                </button>
                <button onClick={() => setShowLrnModal(true)} className="px-3 py-2 bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 rounded-xl text-xs font-medium border border-purple-700 flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-purple-400" /> + Learning Module
                </button>
                <button onClick={() => setShowEmpModal(true)} className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-blue-600/20">
                  <UserPlus className="h-3.5 w-3.5" /> + Onboard Employee
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Team Roster</span>
                <div className="text-2xl font-bold mt-1 text-white">{employees.length} Members</div>
                <span className="text-xs text-slate-500 mt-1 block">Live Roster</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Projects</span>
                <div className="text-2xl font-bold mt-1 text-blue-400">{projects.length} Initiatives</div>
                <span className="text-xs text-slate-500 mt-1 block">Linkable to any task</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Reusable Tasks</span>
                <div className="text-2xl font-bold mt-1 text-slate-100">{tasks.length} Codes</div>
                <span className="text-xs text-slate-500 mt-1 block">Global company library</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Learning Modules</span>
                <div className="text-2xl font-bold mt-1 text-purple-400">{learningModules.length} Modules</div>
                <span className="text-xs text-slate-500 mt-1 block">Competencies</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <h3 className="font-semibold text-sm text-slate-200">Team Roster</h3>
                <span className="text-xs text-slate-400">Live synced with Google Sheet</span>
              </div>
              {employees.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No team members onboarded yet. Click <strong>"+ Onboard Employee"</strong> to add yourself and test the flow.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950/60 text-slate-400 text-xs border-b border-slate-800 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Member & Email</th>
                        <th className="px-5 py-3">Role Title</th>
                        <th className="px-5 py-3">Level</th>
                        <th className="px-5 py-3">Department</th>
                        <th className="px-5 py-3 text-right">Action</th>
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
                            <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">
                              {emp.Level}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-400">{emp.Department}</td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => {
                                setActiveEmployeeEmail(emp.Email);
                                setViewRole("employee");
                              }}
                              className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                            >
                              Open Cockpit <ChevronRight className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <h3 className="font-semibold text-sm text-slate-200">Company Execution & Learning Rollup</h3>
                <span className="text-xs text-slate-400">Week of {currentMondayStr}</span>
              </div>
              {weeklyPulses.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No weekly commitments recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950/60 text-slate-400 text-xs border-b border-slate-800 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Member</th>
                        <th className="px-5 py-3">Project</th>
                        <th className="px-5 py-3">Monday Target</th>
                        <th className="px-5 py-3">Project Hours</th>
                        <th className="px-5 py-3">Learning Hours</th>
                        <th className="px-5 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {weeklyPulses.map(pulse => (
                        <tr key={pulse.Pulse_ID} className="hover:bg-slate-800/40 transition">
                          <td className="px-5 py-3.5 font-medium text-slate-200">{pulse.Emp_Email}</td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                              {pulse.Project_ID}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-300 max-w-xs">{pulse.Monday_Commitment}</td>
                          <td className="px-5 py-3.5 text-xs font-semibold text-blue-400">{pulse.Auto_Task_Hours || 0} hrs</td>
                          <td className="px-5 py-3.5 text-xs font-semibold text-purple-400">{pulse.Auto_Learning_Hours || 0} hrs</td>
                          <td className="px-5 py-3.5 text-right">
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
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/20">
                  {currentEmp.Name ? currentEmp.Name[0] : "E"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{currentEmp.Name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/30">
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
              <button onClick={() => setActiveTab("daily")} className={`pb-3 font-medium transition shrink-0 ${activeTab === "daily" ? "text-blue-400 border-b-2 border-blue-500" : "text-slate-400 hover:text-white"}`}>
                Daily Dual-Track Logger (20-Sec)
              </button>
              <button onClick={() => setActiveTab("weekly")} className={`pb-3 font-medium transition shrink-0 flex items-center gap-1.5 ${activeTab === "weekly" ? "text-indigo-400 border-b-2 border-indigo-500" : "text-slate-400 hover:text-white"}`}>
                <CalendarCheck className="h-4 w-4" /> Weekly Cadence (Monday & Friday)
              </button>
              <button onClick={() => setActiveTab("catalog")} className={`pb-3 font-medium transition shrink-0 flex items-center gap-1.5 ${activeTab === "catalog" ? "text-emerald-400 border-b-2 border-emerald-500" : "text-slate-400 hover:text-white"}`}>
                <LayoutGrid className="h-4 w-4" /> Company Catalog & Libraries
              </button>
              <button onClick={() => setActiveTab("rnr")} className={`pb-3 font-medium transition shrink-0 flex items-center gap-1.5 ${activeTab === "rnr" ? "text-purple-400 border-b-2 border-purple-500" : "text-slate-400 hover:text-white"}`}>
                <BookOpen className="h-4 w-4" /> My R&R
              </button>
            </div>

            {activeTab === "daily" && (
              <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-5 shadow-xl shadow-blue-950/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <h3 className="font-semibold text-base text-slate-100">Log Daily Work & Learning</h3>
                  </div>
                  <span className="text-xs text-slate-400">Pair any project with any reusable task code</span>
                </div>

                {projects.length === 0 || tasks.length === 0 ? (
                  <div className="p-6 bg-slate-950/60 rounded-xl text-center text-sm text-slate-400 border border-slate-800">
                    Switch to <strong>Founder View</strong> to create at least one Project and one Global Task Code first.
                  </div>
                ) : (
                  <form onSubmit={handleDailySubmit} className="space-y-4">
                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block">1. Project Execution Track (Dynamic Pairing)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Select Project</label>
                          <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
                            {projects.map(p => <option key={p.Project_ID} value={p.Project_ID}>[{p.Project_ID}] {p.Project_Name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Select Reusable Task Code</label>
                          <select value={selectedTaskCode} onChange={e => setSelectedTaskCode(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
                            {tasks.map(t => <option key={t.Task_Code} value={t.Task_Code}>[{t.Task_Code}] {t.Task_Title} ({t.Category})</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Task Hours</label>
                          <select value={taskHours} onChange={e => setTaskHours(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
                            <option value="1.0">1.0 Hour</option>
                            <option value="2.0">2.0 Hours</option>
                            <option value="3.0">3.0 Hours</option>
                            <option value="4.0">4.0 Hours</option>
                            <option value="6.0">6.0 Hours</option>
                            <option value="8.0">8.0 Full Day</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
                      <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider block">2. Deliberate Learning Track</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Learning Module</label>
                          <select value={selectedLearningModule} onChange={e => setSelectedLearningModule(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
                            <option value="None">None today</option>
                            {learningModules.map(m => <option key={m.Module_Code} value={m.Module_Code}>[{m.Module_Code}] {m.Topic_Title} ({m.Domain})</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Learning Time</label>
                          <select value={learningHours} onChange={e => setLearningHours(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
                            <option value="0.0">0 Hours</option>
                            <option value="0.5">30 Mins (0.5 hrs)</option>
                            <option value="1.0">1.0 Hour</option>
                            <option value="1.5">1.5 Hours</option>
                            <option value="2.0">2.0 Hours</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Context Notes / Milestone Context (Optional)</label>
                      <input type="text" value={dailyNotes} onChange={e => setDailyNotes(e.target.value)} placeholder="e.g. Completed slide deck for school pitch and tested 4 sensors" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200" />
                    </div>

                    <button type="submit" disabled={isSubmittingDaily} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition disabled:opacity-50">
                      <Send className="h-4 w-4" />
                      {isSubmittingDaily ? "Logging..." : "Log Work & Learning (+35 XP)"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeTab === "weekly" && (
              <div className="space-y-6">
                <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-400" />
                      <h3 className="font-semibold text-base text-slate-100">Step 1: Monday Commitment</h3>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono">Week of {currentMondayStr}</span>
                  </div>

                  {currentWeekPulse ? (
                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Committed Target:</span>
                      <p className="text-sm text-emerald-300 font-medium">{currentWeekPulse.Monday_Commitment}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleMondaySubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Target Project</label>
                          <select value={mondayProject} onChange={e => setMondayProject(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200">
                            {projects.map(p => <option key={p.Project_ID} value={p.Project_ID}>[{p.Project_ID}] {p.Project_Name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Deliverable by Friday</label>
                          <input required type="text" value={mondayCommitment} onChange={e => setMondayCommitment(e.target.value)} placeholder="e.g. Conduct 4 school training sessions and complete lab audits" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200" />
                        </div>
                      </div>
                      <button type="submit" disabled={isSubmittingMonday} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-xl text-sm flex items-center justify-center gap-2">
                        <CheckSquare className="h-4 w-4" /> Lock Monday Commitment (+20 XP)
                      </button>
                    </form>
                  )}
                </div>

                <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                      <h3 className="font-semibold text-base text-slate-100">Step 2: Friday Auto-Compiled Review</h3>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono">Friday 5 PM Routine</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Auto-Compiled Project Hours:</span>
                      <div className="text-xl font-bold text-blue-400">{autoTaskHoursTotal} Hours</div>
                      <span className="text-xs text-slate-500 block mt-0.5">Monday through Friday entries</span>
                    </div>

                    <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Auto-Compiled Learning Hours:</span>
                      <div className="text-xl font-bold text-purple-400">{autoLearningHoursTotal} Hours</div>
                      <span className="text-xs text-slate-500 block mt-0.5">Competency upskilling logs</span>
                    </div>
                  </div>

                  <form onSubmit={handleFridaySubmit} className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Final Outcome / Highlights</label>
                      <input type="text" value={fridayOutcome} onChange={e => setFridayOutcome(e.target.value)} placeholder="e.g. Completed all school workshops and finalized kit assembly." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200" />
                    </div>
                    <button type="submit" disabled={isSubmittingFriday} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-medium py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                      <Send className="h-4 w-4" /> Submit Friday Review (+50 XP)
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "catalog" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                    <h4 className="font-semibold text-sm text-slate-200 mb-3 flex items-center gap-2">
                      <FolderPlus className="h-4 w-4 text-blue-400" /> Active Company Projects ({projects.length})
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
                      <ListPlus className="h-4 w-4 text-emerald-400" /> Reusable Task Codes ({tasks.length})
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

            {activeTab === "rnr" && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  <h4 className="font-semibold text-sm text-slate-200">Role Baseline & Permanent KRAs</h4>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  {currentEmp["R&R_Summary"]}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

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
                  <label className="text-xs text-slate-400 block mb-1">Level</label>
                  <select value={newEmp.level} onChange={e => setNewEmp({...newEmp, level: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200">
                    <option value="L1 Foundational">L1 Foundational</option>
                    <option value="L2 Independent">L2 Independent</option>
                    <option value="L3 Advanced">L3 Advanced</option>
                    <option value="L4 Strategic">L4 Strategic</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">R&R Baseline KRAs</label>
                <textarea rows="3" required value={newEmp.rnrSummary} onChange={e => setNewEmp({...newEmp, rnrSummary: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" placeholder="Core baseline KRAs and responsibilities..." />
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

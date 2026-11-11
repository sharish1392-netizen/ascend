import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, CheckCircle, Clock, BookOpen, Building2, 
  RefreshCw, FolderPlus, UserPlus, CalendarCheck, 
  GraduationCap, Plus, Trash2, BarChart3, Users, 
  Edit3, Rocket, Check, X, Sun, Moon, Table, 
  CheckSquare, Square, ChevronRight, ChevronDown, 
  AlertCircle, ListChecks, Filter
} from 'lucide-react';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxVSWyKgHY3S9vkno226SPnwDUCvW3QAhNgm1wopuP4qmGB-SWXsiYHv7OPIw4C58PE/exec";

const DEFAULT_PROJECTS = [
  { Project_ID: "PRJ-DEXTER", Project_Name: "Dexter Box", Full_Name: "Dexter Box Science Kits", Priority_Level: "P1 Critical", Status: "Active" },
  { Project_ID: "PRJ-MAKER", Project_Name: "Maker Lab", Full_Name: "Maker Lab & School Studios", Priority_Level: "P1 Critical", Status: "Active" },
  { Project_ID: "PRJ-ATL", Project_Name: "ATL Lab", Full_Name: "Atal Tinkering Labs (ATL)", Priority_Level: "P1 Critical", Status: "Active" },
  { Project_ID: "PRJ-CSR", Project_Name: "CSR & NGO", Full_Name: "CSR & NGO Partnerships", Priority_Level: "P2 High", Status: "Active" },
  { Project_ID: "PRJ-STEP", Project_Name: "Teacher Training", Full_Name: "Teacher Training & Workshops (STEP)", Priority_Level: "P2 High", Status: "Active" },
  { Project_ID: "PRJ-ADMIN", Project_Name: "Admin & Ops", Full_Name: "Office Admin, HR & Internal Ops", Priority_Level: "P3 Supporting", Status: "Active" }
];

const DEFAULT_TASKS = [
  { Task_Code: "TSK-PROP", Task_Title: "Proposals & Estimates", Category: "BD & Client Proposals" },
  { Task_Code: "TSK-DECK", Task_Title: "Pitch Decks & PPTs", Category: "BD & Client Proposals" },
  { Task_Code: "TSK-FOLLOW", Task_Title: "Client Follow-ups & Mail", Category: "BD & Client Proposals" },
  { Task_Code: "TSK-MEET", Task_Title: "Client Meetings & Demos", Category: "BD & Client Proposals" },
  { Task_Code: "TSK-RND", Task_Title: "Product R&D & Prototyping", Category: "R&D & Product Engineering" },
  { Task_Code: "TSK-BOM", Task_Title: "BOM, Sourcing & Costing", Category: "R&D & Product Engineering" },
  { Task_Code: "TSK-CURR", Task_Title: "Curriculum & Manuals", Category: "R&D & Product Engineering" },
  { Task_Code: "TSK-DES-PROD", Task_Title: "Product & Box Design", Category: "Design & Digital Media" },
  { Task_Code: "TSK-DES-MKT", Task_Title: "Marketing Posters & Social", Category: "Design & Digital Media" },
  { Task_Code: "TSK-DES-EVT", Task_Title: "Event Signage & Backdrops", Category: "Design & Digital Media" },
  { Task_Code: "TSK-VIDEO", Task_Title: "Video Shoot & Editing", Category: "Design & Digital Media" },
  { Task_Code: "TSK-TRN-STU", Task_Title: "Student Sessions", Category: "Training & Field Execution" },
  { Task_Code: "TSK-TRN-TCH", Task_Title: "Teacher Training", Category: "Training & Field Execution" },
  { Task_Code: "TSK-EXPO", Task_Title: "School Expo & Event Support", Category: "Training & Field Execution" },
  { Task_Code: "TSK-KIT-OPS", Task_Title: "Kit Packing, QC & Dispatch", Category: "Operations & Supply Chain" },
  { Task_Code: "TSK-LAB-AUD", Task_Title: "Lab Setup & Audit", Category: "Operations & Supply Chain" },
  { Task_Code: "TSK-FIN", Task_Title: "Accounts, Bills & Payroll", Category: "HR, Finance & Office Admin" },
  { Task_Code: "TSK-HR-ADM", Task_Title: "HR & Office Admin", Category: "HR, Finance & Office Admin" }
];

const DEFAULT_LEARNING = [
  { Module_Code: "LRN-HARD-01", Domain: "STEM Hardware", Topic_Title: "Microcontrollers, Sensors & Electronics" },
  { Module_Code: "LRN-CAD-01", Domain: "Design & Prototyping", Topic_Title: "3D CAD Modeling, Laser Cutting & 3D Printing" },
  { Module_Code: "LRN-PED-01", Domain: "Pedagogy & Classroom", Topic_Title: "Experiential STEM Facilitation & Constructionism" },
  { Module_Code: "LRN-MED-01", Domain: "AI & Digital Media", Topic_Title: "Educational Video Production & Storytelling" },
  { Module_Code: "LRN-OPS-01", Domain: "Finance & Growth", Topic_Title: "B2B School Sales, Proposals & Operations" }
];

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getCurrentMondayStr() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  return `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, '0')}-${String(mon.getDate()).padStart(2, '0')}`;
}

function normalizeDateStr(val) {
  if (!val) return "";
  const str = String(val);
  if (str.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
  }
  return str;
}

function mergeById(remoteArr, localArr, idKey) {
  const map = new Map();
  (remoteArr || []).forEach(item => { if (item && item[idKey]) map.set(item[idKey], item); });
  (localArr || []).forEach(item => { if (item && item[idKey] && !map.has(item[idKey])) map.set(item[idKey], item); });
  return Array.from(map.values());
}

function parseSubtasks(row) {
  if (!row) return [];
  if (Array.isArray(row.subtasks)) return row.subtasks;
  if (row.Subtasks_JSON) {
    try {
      const parsed = JSON.parse(row.Subtasks_JSON);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }
  return [];
}

function calculateUniqueDayStreak(userLogs) {
  if (!userLogs || userLogs.length === 0) return 0;
  const uniqueDates = Array.from(new Set(userLogs.map(l => normalizeDateStr(l.Date)).filter(Boolean))).sort().reverse();
  if (uniqueDates.length === 0) return 0;

  const today = getTodayStr();
  const yestDate = new Date();
  yestDate.setDate(yestDate.getDate() - 1);
  const yesterday = normalizeDateStr(yestDate.toISOString());

  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

  let streak = 1;
  let curr = new Date(uniqueDates[0]);
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i]);
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) { streak++; curr = prev; }
    else if (diffDays > 1) break;
  }
  return streak;
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("ie_theme") || "light");
  // 4 Simple Spreadsheet-Style Workbook Tabs
  const [activeSheetTab, setActiveSheetTab] = useState("my_tasks"); // 'my_tasks' | 'company_sheet' | 'monthly_review' | 'learning'
  const [activeEmployeeEmail, setActiveEmployeeEmail] = useState(() => localStorage.getItem("ie_v3_active_emp") || "");

  useEffect(() => { localStorage.setItem("ie_theme", theme); }, [theme]);

  const [employees, setEmployees] = useState(() => JSON.parse(localStorage.getItem("ie_v3_employees") || "[]"));
  const [projects, setProjects] = useState(() => mergeById(JSON.parse(localStorage.getItem("ie_v3_projects") || "[]"), DEFAULT_PROJECTS, "Project_ID"));
  const [tasks, setTasks] = useState(() => mergeById(JSON.parse(localStorage.getItem("ie_v3_tasks") || "[]"), DEFAULT_TASKS, "Task_Code"));
  const [learningModules, setLearningModules] = useState(() => mergeById(JSON.parse(localStorage.getItem("ie_v3_learning") || "[]"), DEFAULT_LEARNING, "Module_Code"));
  const [weeklyPulses, setWeeklyPulses] = useState(() => JSON.parse(localStorage.getItem("ie_v3_pulses") || "[]"));
  const [dailyLogs, setDailyLogs] = useState(() => JSON.parse(localStorage.getItem("ie_v3_logs") || "[]"));

  const todayStr = getTodayStr();
  const currentMondayStr = getCurrentMondayStr();

  // New Task Row Builder State (Supports inline Sub-Tasks & Collaborators)
  const [quickRowTitle, setQuickRowTitle] = useState("");
  const [quickRowProject, setQuickRowProject] = useState("PRJ-MAKER");
  const [quickRowTaskCode, setQuickRowTaskCode] = useState("TSK-EXPO");
  const [quickRowDeadline, setQuickRowDeadline] = useState(todayStr);
  const [quickRowSubtasksText, setQuickRowSubtasksText] = useState("");
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [showCollabPicker, setShowCollabPicker] = useState(false);

  // Expanded Task Rows (for viewing/checking off Sub-Tasks)
  const [expandedRowIds, setExpandedRowIds] = useState({});
  const [newSubtaskInputs, setNewSubtaskInputs] = useState({});
  const [showCompletedRows, setShowCompletedRows] = useState(false);

  // Company Master Sheet Filters
  const [companyFilterProject, setCompanyFilterProject] = useState("ALL");
  const [companyFilterMember, setCompanyFilterMember] = useState("ALL");
  const [companyFilterStatus, setCompanyFilterStatus] = useState("ALL"); // 'ALL' | 'ACTIVE' | 'DONE' | 'OVERDUE'
  const [expandedCompanyKeys, setExpandedCompanyKeys] = useState({});

  // Review Tab & R&R State
  const [reviewPeriod, setReviewPeriod] = useState("MONTH"); // 'WEEK' | 'MONTH'
  const [isEditingRnR, setIsEditingRnR] = useState(false);
  const [rnrDraft, setRnrDraft] = useState("");

  // Learning Quick Form State
  const [lrnModule, setLrnModule] = useState("LRN-HARD-01");
  const [lrnMinutes, setLrnMinutes] = useState(45);
  const [lrnNotes, setLrnNotes] = useState("");

  // Admin Modals
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [showPrjModal, setShowPrjModal] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: "", email: "", roleTitle: "", department: "Training & Delivery", level: "L3 Advanced", rnrSummary: "" });
  const [newPrj, setNewPrj] = useState({ projectId: "", projectName: "", priority: "P1 Critical" });

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => { localStorage.setItem("ie_v3_employees", JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem("ie_v3_projects", JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem("ie_v3_tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("ie_v3_learning", JSON.stringify(learningModules)); }, [learningModules]);
  useEffect(() => { localStorage.setItem("ie_v3_pulses", JSON.stringify(weeklyPulses)); }, [weeklyPulses]);
  useEffect(() => { localStorage.setItem("ie_v3_logs", JSON.stringify(dailyLogs)); }, [dailyLogs]);
  useEffect(() => {
    if (activeEmployeeEmail) {
      localStorage.setItem("ie_v3_active_emp", activeEmployeeEmail);
      setSelectedCollaborators([activeEmployeeEmail]);
    }
  }, [activeEmployeeEmail]);

  const fetchSheetData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getBootstrapData`);
      const data = await res.json();
      if (data.status === "success") {
        if (data.employees?.length > 0) {
          setEmployees(prev => mergeById(data.employees, prev, "Email"));
          if (!activeEmployeeEmail) setActiveEmployeeEmail(data.employees[0].Email);
        }
        setProjects(prev => mergeById(data.projects || [], prev, "Project_ID"));
        setTasks(prev => mergeById(data.tasks || [], prev, "Task_Code"));
        setLearningModules(prev => mergeById(data.learningModules || [], prev, "Module_Code"));

        if (data.weeklyPulses) {
          setWeeklyPulses(prev => {
            const remoteMap = new Map();
            data.weeklyPulses.forEach(p => remoteMap.set(p.Pulse_ID, p));
            prev.forEach(localP => { if (!remoteMap.has(localP.Pulse_ID)) remoteMap.set(localP.Pulse_ID, localP); });
            return Array.from(remoteMap.values());
          });
        }
        if (data.dailyLogs) {
          setDailyLogs(prev => mergeById(data.dailyLogs, prev, "Log_ID"));
        }
      }
    } catch (err) {
      console.log("Using local state:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSheetData(); }, []);

  const currentEmp = employees.find(e => (e.Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase()) || {
    Name: "Team Member",
    Email: activeEmployeeEmail || "",
    Role_Title: "Click '+ Member' to Onboard",
    Department: "Infinite Engineers",
    Level: "L3",
    "R&R_Summary": "Click 'Edit' to list your core monthly goals and responsibilities."
  };

  useEffect(() => { setRnrDraft(currentEmp["R&R_Summary"] || ""); }, [currentEmp]);

  const empDailyLogs = useMemo(() => {
    return dailyLogs.filter(l => (l.Emp_Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase());
  }, [dailyLogs, activeEmployeeEmail]);

  const currentStreak = useMemo(() => calculateUniqueDayStreak(empDailyLogs), [empDailyLogs]);

  const empAllPulses = useMemo(() => {
    return weeklyPulses.filter(p => (p.Emp_Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase());
  }, [weeklyPulses, activeEmployeeEmail]);

  const activeRows = useMemo(() => empAllPulses.filter(p => Number(p.Auto_Task_Hours || 0) < 100), [empAllPulses]);
  const completedRows = useMemo(() => empAllPulses.filter(p => Number(p.Auto_Task_Hours || 0) >= 100), [empAllPulses]);

  const getProjectLabel = (prjId) => {
    const found = projects.find(p => p.Project_ID === prjId);
    return found ? (found.Project_Name || found.Full_Name || prjId) : prjId;
  };

  const getEmployeeName = (email) => {
    const found = employees.find(e => (e.Email || "").toLowerCase() === (email || "").toLowerCase().trim());
    return found ? found.Name : email;
  };

  // ================= UNIFIED COMPANY MASTER SHEET AGGREGATION =================
  // Groups collaborative clones together so leadership sees 1 unified row per deliverable with combined team hours & shared sub-tasks
  const companyMasterTasks = useMemo(() => {
    const groupedMap = new Map();

    weeklyPulses.forEach(p => {
      const key = `${(p.Project_ID || "").toUpperCase()}::${(p.Monday_Commitment || "").trim().toLowerCase()}`;
      const existing = groupedMap.get(key);
      const mins = Number(p.Auto_Learning_Hours || 0);
      const prog = Number(p.Auto_Task_Hours || 0);
      const subtasks = parseSubtasks(p);

      if (!existing) {
        groupedMap.set(key, {
          groupKey: key,
          pulseId: p.Pulse_ID,
          title: p.Monday_Commitment,
          projectId: p.Project_ID,
          taskCode: p.Task_Code || "TSK-EXPO",
          createdDate: normalizeDateStr(p.Created_Date || p.Week_Start_Date) || todayStr,
          targetDeadline: normalizeDateStr(p.Target_Deadline),
          completedDate: normalizeDateStr(p.Completed_Date),
          owners: [p.Emp_Email].filter(Boolean),
          totalMinutes: mins,
          progress: prog,
          subtasks: subtasks
        });
      } else {
        if (p.Emp_Email && !existing.owners.includes(p.Emp_Email)) {
          existing.owners.push(p.Emp_Email);
        }
        existing.totalMinutes += mins;
        existing.progress = Math.max(existing.progress, prog);
        if (subtasks.length > existing.subtasks.length) {
          existing.subtasks = subtasks;
        }
      }
    });

    return Array.from(groupedMap.values()).reverse();
  }, [weeklyPulses, todayStr]);

  const filteredCompanyTasks = useMemo(() => {
    return companyMasterTasks.filter(t => {
      if (companyFilterProject !== "ALL" && t.projectId !== companyFilterProject) return false;
      if (companyFilterMember !== "ALL" && !t.owners.some(o => o.toLowerCase() === companyFilterMember.toLowerCase())) return false;
      const isDone = t.progress >= 100;
      const isOverdue = !isDone && t.targetDeadline && t.targetDeadline < todayStr;
      if (companyFilterStatus === "ACTIVE" && isDone) return false;
      if (companyFilterStatus === "DONE" && !isDone) return false;
      if (companyFilterStatus === "OVERDUE" && !isOverdue) return false;
      return true;
    });
  }, [companyMasterTasks, companyFilterProject, companyFilterMember, companyFilterStatus, todayStr]);

  const companyOverviewStats = useMemo(() => {
    const total = companyMasterTasks.length;
    const completed = companyMasterTasks.filter(t => t.progress >= 100).length;
    const inProgress = companyMasterTasks.filter(t => t.progress < 100).length;
    const overdue = companyMasterTasks.filter(t => t.progress < 100 && t.targetDeadline && t.targetDeadline < todayStr).length;
    const totalProg = companyMasterTasks.reduce((acc, t) => acc + t.progress, 0);
    const avgProgress = total > 0 ? Math.round(totalProg / total) : 0;
    const totalMins = companyMasterTasks.reduce((acc, t) => acc + t.totalMinutes, 0);

    return {
      total,
      completed,
      inProgress,
      overdue,
      avgProgress,
      totalHours: (totalMins / 60).toFixed(1)
    };
  }, [companyMasterTasks, todayStr]);

  // ================= MONTHLY & WEEKLY REVIEW ANALYTICS =================
  const reviewMetrics = useMemo(() => {
    const currentMonthPrefix = todayStr.slice(0, 7);
    const periodLogs = empDailyLogs.filter(l => {
      const d = normalizeDateStr(l.Date);
      return reviewPeriod === "WEEK" ? d >= currentMondayStr : d.startsWith(currentMonthPrefix);
    });

    let projectMins = 0;
    let learningMins = 0;
    const byProject = {};

    periodLogs.forEach(l => {
      const rt = Number(l.Task_Hours || 0);
      const tMins = rt > 24 ? rt : Math.round(rt * 60);
      const rl = Number(l.Learning_Hours || 0);
      const lMins = rl > 24 ? rl : Math.round(rl * 60);

      projectMins += tMins;
      learningMins += lMins;

      if (tMins > 0) {
        const pKey = l.Project_ID || "PRJ-MAKER";
        byProject[pKey] = (byProject[pKey] || 0) + tMins;
      }
      if (lMins > 0) {
        byProject["Learning & Upskilling"] = (byProject["Learning & Upskilling"] || 0) + lMins;
      }
    });

    const totalMins = projectMins + learningMins;
    const bars = Object.entries(byProject).map(([key, mins]) => ({
      key,
      label: getProjectLabel(key),
      hours: (mins / 60).toFixed(1),
      percent: totalMins > 0 ? Math.round((mins / totalMins) * 100) : 0
    })).sort((a, b) => Number(b.hours) - Number(a.hours));

    const totalGoals = empAllPulses.length;
    const completedGoals = completedRows.length;
    const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    return {
      totalHours: (totalMins / 60).toFixed(1),
      projectHours: (projectMins / 60).toFixed(1),
      learningHours: (learningMins / 60).toFixed(1),
      totalGoals,
      completedGoals,
      activeGoals: activeRows.length,
      goalCompletionRate,
      bars
    };
  }, [empDailyLogs, reviewPeriod, currentMondayStr, todayStr, empAllPulses, completedRows, activeRows, projects]);

  // ================= SUB-TASK AUTO-PROGRESS ENGINE =================
  const syncSubtasksAndProgress = (rowItem, updatedSubtasks) => {
    const totalSub = updatedSubtasks.length;
    const doneSub = updatedSubtasks.filter(s => s.done).length;
    const autoProgress = totalSub > 0 ? Math.round((doneSub / totalSub) * 100) : Number(rowItem.Auto_Task_Hours || 0);
    const jsonStr = JSON.stringify(updatedSubtasks);

    const targetTitle = (rowItem.Monday_Commitment || "").trim().toLowerCase();
    const targetPrj = (rowItem.Project_ID || "").toUpperCase();

    // Update this row AND any collaborator clones sharing the same deliverable title + project
    setWeeklyPulses(prev => prev.map(p => {
      const isSameDeliverable = (p.Monday_Commitment || "").trim().toLowerCase() === targetTitle && (p.Project_ID || "").toUpperCase() === targetPrj;
      if (p.Pulse_ID === rowItem.Pulse_ID || isSameDeliverable) {
        return {
          ...p,
          Auto_Task_Hours: autoProgress,
          Status: autoProgress >= 100 ? "Completed" : "In Progress",
          Completed_Date: autoProgress >= 100 ? todayStr : "",
          Subtasks_JSON: jsonStr,
          subtasks: updatedSubtasks
        };
      }
      return p;
    }));

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "updateSubtasks",
          pulseId: rowItem.Pulse_ID,
          projectId: rowItem.Project_ID,
          commitmentTitle: rowItem.Monday_Commitment,
          progressPercent: autoProgress,
          subtasksJson: jsonStr
        })
      });
    } catch (err) {}
  };

  const handleAddSubtaskToRow = (rowItem) => {
    const text = (newSubtaskInputs[rowItem.Pulse_ID] || "").trim();
    if (!text) return;
    const currentList = parseSubtasks(rowItem);
    const updated = [...currentList, { id: "SUB-" + Date.now() + "-" + Math.floor(Math.random() * 100), title: text, done: false }];
    setNewSubtaskInputs(prev => ({ ...prev, [rowItem.Pulse_ID]: "" }));
    syncSubtasksAndProgress(rowItem, updated);
    showToast(`Added sub-task (${updated.filter(s => s.done).length}/${updated.length} done)`);
  };

  const handleToggleSubtask = (rowItem, subId) => {
    const currentList = parseSubtasks(rowItem);
    const updated = currentList.map(s => s.id === subId ? { ...s, done: !s.done } : s);
    syncSubtasksAndProgress(rowItem, updated);
  };

  const handleDeleteSubtask = (rowItem, subId) => {
    const currentList = parseSubtasks(rowItem);
    const updated = currentList.filter(s => s.id !== subId);
    syncSubtasksAndProgress(rowItem, updated);
  };

  // ================= 1-TAP TIME LOGGING & ROW COMPLETION =================
  const handleQuickLogTimeOnRow = (rowItem, addMinutes, forceDone = false) => {
    let currentSubtasks = parseSubtasks(rowItem);
    let newProg = Number(rowItem.Auto_Task_Hours || 0);

    if (forceDone) {
      newProg = 100;
      if (currentSubtasks.length > 0) {
        currentSubtasks = currentSubtasks.map(s => ({ ...s, done: true }));
      }
    } else if (currentSubtasks.length > 0) {
      const doneCount = currentSubtasks.filter(s => s.done).length;
      newProg = Math.round((doneCount / currentSubtasks.length) * 100);
    }

    const jsonStr = JSON.stringify(currentSubtasks);

    setWeeklyPulses(prev => prev.map(p => {
      if (p.Pulse_ID === rowItem.Pulse_ID) {
        return {
          ...p,
          Auto_Task_Hours: newProg,
          Auto_Learning_Hours: Number(p.Auto_Learning_Hours || 0) + addMinutes,
          Status: newProg >= 100 ? "Completed" : "In Progress",
          Completed_Date: newProg >= 100 ? todayStr : "",
          Subtasks_JSON: jsonStr,
          subtasks: currentSubtasks
        };
      }
      return p;
    }));

    if (addMinutes > 0) {
      setDailyLogs(prev => [...prev, {
        Log_ID: "LOG-" + Date.now(),
        Date: todayStr,
        Emp_Email: activeEmployeeEmail,
        Project_ID: rowItem.Project_ID,
        Task_Code: rowItem.Task_Code || "TSK-EXPO",
        Task_Hours: addMinutes,
        Learning_Module_Code: "None",
        Learning_Hours: 0,
        Status: newProg >= 100 ? "Done" : "In Progress",
        Streak_Count: currentStreak || 1,
        Notes: rowItem.Monday_Commitment
      }]);
    }

    showToast(
      forceDone
        ? `✓ Completed "${rowItem.Monday_Commitment}"!`
        : `🕒 Logged +${addMinutes}m on "${rowItem.Monday_Commitment}"`
    );

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "logTaskSession",
          pulseId: rowItem.Pulse_ID,
          email: activeEmployeeEmail,
          projectId: rowItem.Project_ID,
          taskCode: rowItem.Task_Code || "TSK-EXPO",
          taskMinutes: addMinutes,
          progressPercent: newProg,
          subtasksJson: jsonStr,
          currentStreak: currentStreak || 1,
          status: newProg >= 100 ? "Done" : "In Progress",
          notes: rowItem.Monday_Commitment
        })
      });
    } catch (err) {}
  };

  // Add New Task Row (With Optional Comma-Separated Initial Sub-Tasks & Collaborators)
  const handleQuickRowSubmit = (e) => {
    e.preventDefault();
    if (!quickRowTitle.trim()) return;

    const initialSubtasks = quickRowSubtasksText
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .map((s, idx) => ({ id: `SUB-${Date.now()}-${idx}`, title: s, done: false }));

    const assignees = selectedCollaborators.length > 0 ? selectedCollaborators : [activeEmployeeEmail];
    const collabStr = assignees.join(", ");
    const subtasksJson = JSON.stringify(initialSubtasks);

    const createdItems = assignees.map((email, idx) => ({
      Pulse_ID: `TSK-${Date.now()}-${idx}`,
      Created_Date: todayStr,
      Emp_Email: (email || "").toLowerCase().trim(),
      Project_ID: quickRowProject,
      Task_Code: quickRowTaskCode,
      Monday_Commitment: quickRowTitle.trim(),
      Auto_Task_Hours: 0,
      Auto_Learning_Hours: 0,
      Friday_Outcome: "Self",
      Status: "In Progress",
      Target_Deadline: quickRowDeadline || todayStr,
      Completed_Date: "",
      Collaborators: collabStr,
      Subtasks_JSON: subtasksJson,
      subtasks: initialSubtasks
    }));

    setWeeklyPulses(prev => [...prev, ...createdItems]);
    if (initialSubtasks.length > 0 && createdItems[0]) {
      setExpandedRowIds(prev => ({ ...prev, [createdItems[0].Pulse_ID]: true }));
    }

    setQuickRowTitle("");
    setQuickRowSubtasksText("");
    setShowCollabPicker(false);
    showToast(`Added "${quickRowTitle.trim()}" ${initialSubtasks.length > 0 ? `with ${initialSubtasks.length} sub-tasks` : ""}!`);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "addWorkboardBatch", items: createdItems })
      });
    } catch (err) {}
  };

  // Log Standalone Learning
  const handleAddLearningLog = (e) => {
    e.preventDefault();
    if (!lrnNotes.trim()) return;

    const newLog = {
      Log_ID: "LRN-" + Date.now(),
      Date: todayStr,
      Emp_Email: activeEmployeeEmail,
      Project_ID: "UPSKILLING",
      Task_Code: "TSK-LRN",
      Task_Hours: 0,
      Learning_Module_Code: lrnModule,
      Learning_Hours: Number(lrnMinutes),
      Status: "Done",
      Streak_Count: currentStreak || 1,
      Notes: lrnNotes.trim()
    };

    setDailyLogs(prev => [...prev, newLog]);
    setLrnNotes("");
    showToast(`🎓 Logged ${lrnMinutes}m of learning!`);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "logStandaloneLearning",
          email: activeEmployeeEmail,
          learningModuleCode: lrnModule,
          learningMinutes: Number(lrnMinutes),
          currentStreak: currentStreak || 1,
          notes: newLog.Notes
        })
      });
    } catch (err) {}
  };

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* ================= CLEAN MINIMAL TOP BAR ================= */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white/95 border-slate-200"}`}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Table className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight">IE Workspace</span>
              <span className="text-[11px] text-slate-400 hidden sm:inline ml-2">Task & Sub-Task Sheet</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Company Completion Pill */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
              <Rocket className="h-3.5 w-3.5 text-indigo-500" />
              <span className="font-medium">Company Completion:</span>
              <span className="font-mono font-bold text-indigo-500">{companyOverviewStats.avgProgress}%</span>
              <span className="text-slate-400">({companyOverviewStats.completed}/{companyOverviewStats.total})</span>
            </div>

            {/* Distinct-Day Streak Pill */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>{currentStreak}d Streak</span>
            </div>

            {/* Active Employee Switcher */}
            {employees.length > 0 && (
              <select
                value={activeEmployeeEmail}
                onChange={(e) => setActiveEmployeeEmail(e.target.value)}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"}`}
              >
                {employees.map(emp => (
                  <option key={emp.Email} value={emp.Email}>{emp.Name}</option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={() => setShowEmpModal(true)}
              title="Add Team Member"
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 ${isDark ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"}`}
            >
              <UserPlus className="h-3.5 w-3.5 text-indigo-500" />
              <span className="hidden sm:inline">+ Member</span>
            </button>

            <button
              type="button"
              onClick={fetchSheetData}
              title="Sync with Google Sheet"
              className={`p-1.5 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-500 hover:text-slate-900"}`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`p-1.5 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-amber-400" : "bg-white border-slate-200 text-slate-600"}`}
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-medium flex items-center gap-2 shadow-xl z-50">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= MAIN WORKSPACE ================= */}
      <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full space-y-5">

        {/* EXCEL-STYLE WORKBOOK TABS */}
        <div className={`flex items-center justify-between border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <div className="flex items-center gap-1 text-xs sm:text-sm overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveSheetTab("my_tasks")}
              className={`px-4 py-2.5 font-semibold rounded-t-xl border-t border-x transition flex items-center gap-1.5 shrink-0 ${
                activeSheetTab === "my_tasks"
                  ? (isDark ? "bg-slate-900 border-slate-800 text-indigo-400" : "bg-white border-slate-200 text-indigo-600 shadow-sm")
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <ListChecks className="h-4 w-4" /> My Tasks & Sub-Tasks ({activeRows.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveSheetTab("company_sheet")}
              className={`px-4 py-2.5 font-semibold rounded-t-xl border-t border-x transition flex items-center gap-1.5 shrink-0 ${
                activeSheetTab === "company_sheet"
                  ? (isDark ? "bg-slate-900 border-slate-800 text-indigo-400" : "bg-white border-slate-200 text-indigo-600 shadow-sm")
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Building2 className="h-4 w-4" /> Company Master View ({companyMasterTasks.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveSheetTab("monthly_review")}
              className={`px-4 py-2.5 font-semibold rounded-t-xl border-t border-x transition flex items-center gap-1.5 shrink-0 ${
                activeSheetTab === "monthly_review"
                  ? (isDark ? "bg-slate-900 border-slate-800 text-indigo-400" : "bg-white border-slate-200 text-indigo-600 shadow-sm")
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <BarChart3 className="h-4 w-4" /> Monthly & Goal Review ({reviewMetrics.totalHours}h)
            </button>

            <button
              type="button"
              onClick={() => setActiveSheetTab("learning")}
              className={`px-4 py-2.5 font-semibold rounded-t-xl border-t border-x transition flex items-center gap-1.5 shrink-0 ${
                activeSheetTab === "learning"
                  ? (isDark ? "bg-slate-900 border-slate-800 text-indigo-400" : "bg-white border-slate-200 text-indigo-600 shadow-sm")
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <GraduationCap className="h-4 w-4" /> Learning Log
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowPrjModal(true)}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 mb-1 rounded-lg text-xs border ${isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            <FolderPlus className="h-3.5 w-3.5 text-indigo-500" /> + Project
          </button>
        </div>

        {/* ================= TAB 1: MY TASKS & SUB-TASKS SHEET ================= */}
        {activeSheetTab === "my_tasks" && (
          <div className="space-y-4">
            {/* Simple Top-of-Sheet Task & Sub-Task Entry Bar */}
            <form onSubmit={handleQuickRowSubmit} className={`p-3.5 rounded-2xl border shadow-sm space-y-2.5 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    required
                    value={quickRowTitle}
                    onChange={(e) => setQuickRowTitle(e.target.value)}
                    placeholder="1. Main Task (e.g. AMT School Science Expo)"
                    className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"}`}
                  />
                </div>

                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={quickRowSubtasksText}
                    onChange={(e) => setQuickRowSubtasksText(e.target.value)}
                    placeholder="2. Sub-tasks, comma separated (e.g. Pack kits, Print banners)"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700 focus:bg-white"}`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={quickRowProject}
                    onChange={(e) => setQuickRowProject(e.target.value)}
                    className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                  >
                    {projects.map(p => <option key={p.Project_ID} value={p.Project_ID}>{p.Project_Name}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2 flex items-center gap-1.5">
                  <input
                    type="date"
                    value={quickRowDeadline}
                    onChange={(e) => setQuickRowDeadline(e.target.value)}
                    className={`w-full px-2 py-2 rounded-xl text-xs font-mono border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-700"}`}
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shrink-0 shadow-sm cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Optional Collaborator Tagging */}
              {employees.length > 1 && (
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setShowCollabPicker(!showCollabPicker)}
                      className="text-[11px] text-indigo-500 font-medium flex items-center gap-1 hover:underline"
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>{selectedCollaborators.length > 1 ? `Collaborating (${selectedCollaborators.length} members)` : "+ Tag Collaborators on this task"}</span>
                    </button>

                    {showCollabPicker && employees.map(emp => {
                      const isSel = selectedCollaborators.includes(emp.Email);
                      return (
                        <button
                          key={emp.Email}
                          type="button"
                          onClick={() => {
                            if (isSel && selectedCollaborators.length > 1) setSelectedCollaborators(selectedCollaborators.filter(e => e !== emp.Email));
                            else if (!isSel) setSelectedCollaborators([...selectedCollaborators, emp.Email]);
                          }}
                          className={`px-2 py-0.5 rounded-full text-[11px] border transition ${isSel ? "bg-indigo-600 text-white border-indigo-600" : isDark ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"}`}
                        >
                          {emp.Name} {isSel && "✓"}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[11px] text-slate-400 hidden md:inline">
                    Tip: Progress % is calculated automatically as you check off sub-tasks!
                  </span>
                </div>
              )}
            </form>

            {/* Spreadsheet Table */}
            <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className={`border-b text-[11px] uppercase tracking-wider font-semibold ${isDark ? "bg-slate-950/60 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                      <th className="py-3 px-3 w-10 text-center">Done</th>
                      <th className="py-3 px-3">Deliverable & Sub-Tasks (Click row to expand)</th>
                      <th className="py-3 px-3 w-32">Project</th>
                      <th className="py-3 px-3 w-28">Due Date</th>
                      <th className="py-3 px-3 w-40">Sub-Task Progress</th>
                      <th className="py-3 px-3 w-20 text-right">Logged</th>
                      <th className="py-3 px-4 w-44 text-right">Log Effort</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200/70"}`}>
                    {activeRows.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-10 text-center text-slate-400 text-xs">
                          No active tasks in your sheet. Add a task and its sub-tasks above to get started!
                        </td>
                      </tr>
                    ) : (
                      activeRows.map(row => {
                        const mins = Number(row.Auto_Learning_Hours || 0);
                        const subtasks = parseSubtasks(row);
                        const doneSubCount = subtasks.filter(s => s.done).length;
                        const prog = subtasks.length > 0
                          ? Math.round((doneSubCount / subtasks.length) * 100)
                          : Number(row.Auto_Task_Hours || 0);

                        const due = normalizeDateStr(row.Target_Deadline);
                        const isOverdue = due && due < todayStr;
                        const isExpanded = Boolean(expandedRowIds[row.Pulse_ID]);

                        return (
                          <React.Fragment key={row.Pulse_ID}>
                            <tr className={`transition ${isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50/80"}`}>
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleQuickLogTimeOnRow(row, 0, true)}
                                  title="Mark 100% Complete"
                                  className="text-slate-400 hover:text-emerald-500 transition"
                                >
                                  <Square className="h-4 w-4" />
                                </button>
                              </td>

                              <td
                                className="py-3 px-3 font-medium cursor-pointer"
                                onClick={() => setExpandedRowIds(prev => ({ ...prev, [row.Pulse_ID]: !isExpanded }))}
                              >
                                <div className="flex items-center gap-1.5">
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-indigo-500 shrink-0" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                                  )}
                                  <span>{row.Monday_Commitment}</span>
                                  {subtasks.length > 0 && (
                                    <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold ${isDark ? "bg-slate-800 text-indigo-300" : "bg-slate-100 text-indigo-700"}`}>
                                      {doneSubCount}/{subtasks.length} ☑
                                    </span>
                                  )}
                                  {row.Collaborators && row.Collaborators.includes(",") && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-medium">
                                      👥 Collab
                                    </span>
                                  )}
                                  {isOverdue && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 font-semibold">
                                      Overdue
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${isDark ? "bg-indigo-500/10 text-indigo-300" : "bg-indigo-50 text-indigo-700"}`}>
                                  {getProjectLabel(row.Project_ID)}
                                </span>
                              </td>

                              <td className="py-3 px-3 text-xs text-slate-400 font-mono">
                                {due || "Rolling"}
                              </td>

                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-20 h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                                    <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${prog}%` }} />
                                  </div>
                                  <span className="text-xs font-mono font-bold text-indigo-500">{prog}%</span>
                                </div>
                              </td>

                              <td className="py-3 px-3 text-right font-mono text-xs font-semibold">
                                {(mins / 60).toFixed(1)}h
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleQuickLogTimeOnRow(row, 30, false)}
                                    className={`px-2 py-1 rounded text-[11px] font-mono font-semibold border transition ${isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"}`}
                                  >
                                    +30m
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickLogTimeOnRow(row, 60, false)}
                                    className={`px-2 py-1 rounded text-[11px] font-mono font-semibold border transition ${isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"}`}
                                  >
                                    +1h
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickLogTimeOnRow(row, 0, true)}
                                    className="px-2 py-1 rounded text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition"
                                  >
                                    Done ✓
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* EXPANDED SUB-TASK CHECKLIST DRAWER */}
                            {isExpanded && (
                              <tr className={isDark ? "bg-slate-950/70" : "bg-indigo-50/30"}>
                                <td></td>
                                <td colSpan="6" className="py-3 px-4">
                                  <div className="max-w-xl space-y-2">
                                    <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500 flex items-center justify-between">
                                      <span>Sub-Task Checklist ({doneSubCount} of {subtasks.length} completed = {prog}%)</span>
                                    </div>

                                    {subtasks.length === 0 ? (
                                      <p className="text-xs text-slate-400 italic">
                                        Add sub-tasks below so progress % calculates automatically as you tick each step.
                                      </p>
                                    ) : (
                                      <div className="space-y-1.5">
                                        {subtasks.map((sub, sIdx) => (
                                          <div
                                            key={sub.id}
                                            className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs ${
                                              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                                            }`}
                                          >
                                            <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                                              <input
                                                type="checkbox"
                                                checked={sub.done}
                                                onChange={() => handleToggleSubtask(row, sub.id)}
                                                className="h-3.5 w-3.5 rounded accent-indigo-600 cursor-pointer"
                                              />
                                              <span className={sub.done ? "line-through text-slate-400" : "font-medium"}>
                                                {sIdx + 1}. {sub.title}
                                              </span>
                                            </label>
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteSubtask(row, sub.id)}
                                              className="text-slate-400 hover:text-rose-500 p-0.5"
                                            >
                                              <X className="h-3.5 w-3.5" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Add Sub-Task Input */}
                                    <div className="flex items-center gap-2 pt-1">
                                      <input
                                        type="text"
                                        value={newSubtaskInputs[row.Pulse_ID] || ""}
                                        onChange={(e) => setNewSubtaskInputs(prev => ({ ...prev, [row.Pulse_ID]: e.target.value }))}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddSubtaskToRow(row);
                                          }
                                        }}
                                        placeholder="+ Add a sub-task step and press Enter..."
                                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs border focus:outline-none ${
                                          isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"
                                        }`}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleAddSubtaskToRow(row)}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                                      >
                                        Add Step
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Completed Tasks Drawer */}
              {completedRows.length > 0 && (
                <div className={`border-t px-4 py-2.5 text-xs ${isDark ? "border-slate-800 bg-slate-950/50" : "border-slate-200 bg-slate-50"}`}>
                  <button
                    type="button"
                    onClick={() => setShowCompletedRows(!showCompletedRows)}
                    className="font-semibold text-slate-500 hover:text-indigo-500 flex items-center gap-1.5"
                  >
                    <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{showCompletedRows ? "Hide" : "Show"} Completed Tasks ({completedRows.length})</span>
                  </button>

                  {showCompletedRows && (
                    <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-200/50">
                      {completedRows.map(c => (
                        <div key={c.Pulse_ID} className="flex items-center justify-between py-1 text-slate-400">
                          <span className="line-through">{c.Monday_Commitment} ({getProjectLabel(c.Project_ID)})</span>
                          <span className="font-mono text-emerald-500 font-semibold">
                            ✓ 100% Done ({(Number(c.Auto_Learning_Hours || 0) / 60).toFixed(1)}h)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: UNIFIED COMPANY MASTER VIEW ================= */}
        {activeSheetTab === "company_sheet" && (
          <div className="space-y-4">
            {/* Company-Wide Pulse Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className={`p-3.5 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <span className="text-[11px] text-slate-400 block">All Company Tasks</span>
                <span className="text-xl font-bold font-mono">{companyOverviewStats.total}</span>
                <span className="text-[11px] text-indigo-500 font-semibold block">{companyOverviewStats.avgProgress}% avg progress</span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <span className="text-[11px] text-slate-400 block">Completed (100%)</span>
                <span className="text-xl font-bold font-mono text-emerald-500">{companyOverviewStats.completed}</span>
                <span className="text-[11px] text-slate-400 block">Shipped deliverables</span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <span className="text-[11px] text-slate-400 block">In Progress</span>
                <span className="text-xl font-bold font-mono text-blue-500">{companyOverviewStats.inProgress}</span>
                <span className="text-[11px] text-slate-400 block">Active on board</span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <span className="text-[11px] text-slate-400 block">Overdue Alerts</span>
                <span className="text-xl font-bold font-mono text-rose-500">{companyOverviewStats.overdue}</span>
                <span className="text-[11px] text-slate-400 block">Past target date</span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <span className="text-[11px] text-slate-400 block">Cumulative Effort</span>
                <span className="text-xl font-bold font-mono text-amber-500">{companyOverviewStats.totalHours}h</span>
                <span className="text-[11px] text-slate-400 block">Total team hours</span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-2 text-xs ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-3.5 w-3.5 text-indigo-500" />
                <select
                  value={companyFilterProject}
                  onChange={(e) => setCompanyFilterProject(e.target.value)}
                  className={`px-2.5 py-1.5 rounded-lg border font-medium ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                >
                  <option value="ALL">All Projects</option>
                  {projects.map(p => <option key={p.Project_ID} value={p.Project_ID}>{p.Project_Name}</option>)}
                </select>

                <select
                  value={companyFilterMember}
                  onChange={(e) => setCompanyFilterMember(e.target.value)}
                  className={`px-2.5 py-1.5 rounded-lg border font-medium ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                >
                  <option value="ALL">All Team Members</option>
                  {employees.map(emp => <option key={emp.Email} value={emp.Email}>{emp.Name}</option>)}
                </select>

                <div className={`flex p-0.5 rounded-lg border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
                  {[
                    { id: "ALL", label: "All" },
                    { id: "ACTIVE", label: "In Progress" },
                    { id: "DONE", label: "Completed" },
                    { id: "OVERDUE", label: "Overdue" }
                  ].map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setCompanyFilterStatus(st.id)}
                      className={`px-2.5 py-1 rounded-md font-semibold transition ${
                        companyFilterStatus === st.id
                          ? (isDark ? "bg-slate-800 text-white" : "bg-white text-slate-900 shadow-sm")
                          : "text-slate-400"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <span className="text-slate-400">
                Click any row to inspect sub-task checklist
              </span>
            </div>

            {/* Unified Master Table */}
            <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className={`border-b text-[11px] uppercase font-semibold ${isDark ? "bg-slate-950/60 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                      <th className="py-3 px-4">Deliverable & Sub-Tasks</th>
                      <th className="py-3 px-3">Project</th>
                      <th className="py-3 px-3">Owner(s)</th>
                      <th className="py-3 px-3">Target Date</th>
                      <th className="py-3 px-3">Sub-Tasks</th>
                      <th className="py-3 px-3 w-40">Progress</th>
                      <th className="py-3 px-4 text-right">Team Hours</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200/70"}`}>
                    {filteredCompanyTasks.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                          No tasks match the current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredCompanyTasks.map(item => {
                        const isDone = item.progress >= 100;
                        const isOverdue = !isDone && item.targetDeadline && item.targetDeadline < todayStr;
                        const doneSub = item.subtasks.filter(s => s.done).length;
                        const isExp = Boolean(expandedCompanyKeys[item.groupKey]);

                        return (
                          <React.Fragment key={item.groupKey}>
                            <tr
                              onClick={() => setExpandedCompanyKeys(prev => ({ ...prev, [item.groupKey]: !isExp }))}
                              className={`cursor-pointer transition ${isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50/80"}`}
                            >
                              <td className="py-3 px-4 font-medium">
                                <div className="flex items-center gap-1.5">
                                  {isExp ? (
                                    <ChevronDown className="h-4 w-4 text-indigo-500 shrink-0" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                                  )}
                                  <span className={isDone ? "line-through text-slate-400" : ""}>{item.title}</span>
                                  {isOverdue && (
                                    <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 text-[10px] font-semibold">
                                      Overdue
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${isDark ? "bg-indigo-500/10 text-indigo-300" : "bg-indigo-50 text-indigo-700"}`}>
                                  {getProjectLabel(item.projectId)}
                                </span>
                              </td>

                              <td className="py-3 px-3 text-xs">
                                {item.owners.map(getEmployeeName).join(", ")}
                              </td>

                              <td className="py-3 px-3 font-mono text-xs text-slate-400">
                                {item.targetDeadline || "Rolling"}
                              </td>

                              <td className="py-3 px-3 font-mono text-xs">
                                {item.subtasks.length > 0 ? (
                                  <span className="px-2 py-0.5 rounded bg-slate-500/10 font-semibold">
                                    {doneSub} / {item.subtasks.length} ☑
                                  </span>
                                ) : (
                                  <span className="text-slate-400">1-step task</span>
                                )}
                              </td>

                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-20 h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                                    <div
                                      className={`h-full ${isDone ? "bg-emerald-500" : "bg-indigo-600"}`}
                                      style={{ width: `${item.progress}%` }}
                                    />
                                  </div>
                                  <span className={`font-mono text-xs font-bold ${isDone ? "text-emerald-500" : "text-indigo-500"}`}>
                                    {item.progress}%
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-right font-mono text-xs font-semibold">
                                {(item.totalMinutes / 60).toFixed(1)}h
                              </td>
                            </tr>

                            {isExp && (
                              <tr className={isDark ? "bg-slate-950/70" : "bg-slate-50"}>
                                <td colSpan="7" className="py-3 px-8">
                                  {item.subtasks.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">No sub-tasks defined for this deliverable.</p>
                                  ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                      {item.subtasks.map((sub, idx) => (
                                        <div
                                          key={sub.id}
                                          className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 ${
                                            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                                          }`}
                                        >
                                          <span className={sub.done ? "text-emerald-500 font-bold" : "text-slate-400"}>
                                            {sub.done ? "☑" : "☐"}
                                          </span>
                                          <span className={sub.done ? "line-through text-slate-400" : ""}>
                                            {idx + 1}. {sub.title}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: MONTHLY & GOAL REVIEW ================= */}
        {activeSheetTab === "monthly_review" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">My Progress & Monthly Review</h2>
              <div className={`flex p-1 rounded-xl border text-xs ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <button
                  type="button"
                  onClick={() => setReviewPeriod("WEEK")}
                  className={`px-3 py-1 rounded-lg font-semibold ${reviewPeriod === "WEEK" ? "bg-indigo-600 text-white" : "text-slate-500"}`}
                >
                  This Week
                </button>
                <button
                  type="button"
                  onClick={() => setReviewPeriod("MONTH")}
                  className={`px-3 py-1 rounded-lg font-semibold ${reviewPeriod === "MONTH" ? "bg-indigo-600 text-white" : "text-slate-500"}`}
                >
                  This Month
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <span className="text-xs text-slate-400 block">Goal Completion</span>
                <span className="text-2xl font-bold font-mono text-emerald-500">{reviewMetrics.goalCompletionRate}%</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">{reviewMetrics.completedGoals} of {reviewMetrics.totalGoals} tasks done</span>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <span className="text-xs text-slate-400 block">Total Logged Time</span>
                <span className="text-2xl font-bold font-mono text-indigo-500">{reviewMetrics.totalHours}h</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">{reviewMetrics.projectHours}h Projects</span>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <span className="text-xs text-slate-400 block">Upskilling Hours</span>
                <span className="text-2xl font-bold font-mono text-purple-500">{reviewMetrics.learningHours}h</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Deliberate Learning</span>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <span className="text-xs text-slate-400 block">Work Streak</span>
                <span className="text-2xl font-bold font-mono text-amber-500">{currentStreak} Days</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Unique active days</span>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border space-y-3 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
              <h3 className="font-bold text-sm">Where My Time Went ({reviewPeriod === "WEEK" ? "This Week" : "This Month"})</h3>
              {reviewMetrics.bars.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">No hours logged yet in this period.</p>
              ) : (
                <div className="space-y-3">
                  {reviewMetrics.bars.map(bar => (
                    <div key={bar.key} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold">{bar.label}</span>
                        <span className="font-mono text-slate-400">{bar.hours} hrs ({bar.percent}%)</span>
                      </div>
                      <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${bar.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`p-5 rounded-2xl border space-y-3 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-indigo-500" /> My Core Roles & Responsibilities (KRAs)
                </h3>
                {!isEditingRnR ? (
                  <button type="button" onClick={() => setIsEditingRnR(true)} className="text-xs text-indigo-500 font-semibold flex items-center gap-1">
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEmployees(prev => prev.map(e => (e.Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase() ? { ...e, "R&R_Summary": rnrDraft } : e));
                      setIsEditingRnR(false);
                      showToast("Saved Roles & Responsibilities!");
                      try {
                        fetch(APPS_SCRIPT_URL, {
                          method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
                          body: JSON.stringify({ action: "updateEmployeeRnR", email: activeEmployeeEmail, rnrSummary: rnrDraft })
                        });
                      } catch (err) {}
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Save
                  </button>
                )}
              </div>
              {isEditingRnR ? (
                <textarea rows="4" value={rnrDraft} onChange={(e) => setRnrDraft(e.target.value)} className={`w-full rounded-xl p-3 text-xs border ${isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`} />
              ) : (
                <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed">{currentEmp["R&R_Summary"]}</p>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 4: LEARNING LOG SHEET ================= */}
        {activeSheetTab === "learning" && (
          <div className="space-y-4">
            <form onSubmit={handleAddLearningLog} className={`p-3.5 rounded-2xl border shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-2 items-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div className="sm:col-span-4">
                <select
                  value={lrnModule}
                  onChange={(e) => setLrnModule(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                >
                  {learningModules.map(m => <option key={m.Module_Code} value={m.Module_Code}>[{m.Module_Code}] {m.Topic_Title}</option>)}
                </select>
              </div>
              <div className="sm:col-span-5">
                <input
                  type="text"
                  required
                  value={lrnNotes}
                  onChange={(e) => setLrnNotes(e.target.value)}
                  placeholder="What skill, tool, or concept did you practice?"
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                />
              </div>
              <div className="sm:col-span-3 flex items-center gap-2">
                <select
                  value={lrnMinutes}
                  onChange={(e) => setLrnMinutes(Number(e.target.value))}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-mono border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                >
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shrink-0">
                  + Log
                </button>
              </div>
            </form>

            <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className={`border-b text-[11px] uppercase font-semibold ${isDark ? "bg-slate-950/60 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 px-4">What I Learned / Practiced</th>
                    <th className="py-3 px-4 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200/60"}`}>
                  {empDailyLogs.filter(l => Number(l.Learning_Hours || 0) > 0).length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400 text-xs">
                        No learning sessions logged yet. Use the row above to log deliberate upskilling!
                      </td>
                    </tr>
                  ) : (
                    empDailyLogs.filter(l => Number(l.Learning_Hours || 0) > 0).slice().reverse().map(l => (
                      <tr key={l.Log_ID}>
                        <td className="py-3 px-4 font-mono text-xs text-slate-400">{normalizeDateStr(l.Date)}</td>
                        <td className="py-3 px-4 font-semibold text-purple-500">{l.Learning_Module_Code}</td>
                        <td className="py-3 px-4">{l.Notes}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">{l.Learning_Hours} mins</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add Team Member Modal */}
      {showEmpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 text-xs ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold">Add Team Member</h3>
              <button type="button" onClick={() => setShowEmpModal(false)}><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const entry = { Emp_ID: "IE-" + ("00" + (employees.length + 1)).slice(-3), Name: newEmp.name, Email: newEmp.email.toLowerCase().trim(), Role_Title: newEmp.roleTitle, Department: newEmp.department, Level: newEmp.level, "R&R_Summary": newEmp.rnrSummary, Status: "Active" };
              setEmployees(prev => [...prev, entry]);
              setActiveEmployeeEmail(entry.Email);
              setShowEmpModal(false);
              showToast(`Added ${entry.Name}!`);
              try {
                fetch(APPS_SCRIPT_URL, {
                  method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
                  body: JSON.stringify({ action: "addEmployee", ...newEmp })
                });
              } catch (err) {}
            }} className="space-y-3">
              <input required type="text" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className={`w-full rounded-xl p-2.5 border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="Full Name" />
              <input required type="email" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} className={`w-full rounded-xl p-2.5 border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="Email Address" />
              <input required type="text" value={newEmp.roleTitle} onChange={e => setNewEmp({...newEmp, roleTitle: e.target.value})} className={`w-full rounded-xl p-2.5 border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="Role Title" />
              <textarea rows="3" required value={newEmp.rnrSummary} onChange={e => setNewEmp({...newEmp, rnrSummary: e.target.value})} className={`w-full rounded-xl p-2.5 border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="Core Responsibilities / Monthly Goals..." />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowEmpModal(false)} className="px-3 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl">Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showPrjModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 text-xs ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold">Add Project Pillar</h3>
              <button type="button" onClick={() => setShowPrjModal(false)}><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const entry = { Project_ID: newPrj.projectId.toUpperCase().trim(), Project_Name: newPrj.projectName, Priority_Level: newPrj.priority, Status: "Active" };
              setProjects(prev => [...prev, entry]);
              setShowPrjModal(false);
              showToast(`Added project ${entry.Project_Name}!`);
              try {
                fetch(APPS_SCRIPT_URL, {
                  method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
                  body: JSON.stringify({ action: "createProject", ...newPrj })
                });
              } catch (err) {}
            }} className="space-y-3">
              <input required type="text" value={newPrj.projectId} onChange={e => setNewPrj({...newPrj, projectId: e.target.value})} className={`w-full rounded-xl p-2.5 uppercase border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="Code (e.g. PRJ-ROBO)" />
              <input required type="text" value={newPrj.projectName} onChange={e => setNewPrj({...newPrj, projectName: e.target.value})} className={`w-full rounded-xl p-2.5 border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="Project Name (e.g. Robotics Series)" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowPrjModal(false)} className="px-3 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

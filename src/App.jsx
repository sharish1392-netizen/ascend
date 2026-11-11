import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, CheckCircle, Clock, BookOpen, Building2, 
  RefreshCw, FolderPlus, UserPlus, CalendarCheck, 
  GraduationCap, Plus, Trash2, BarChart3, Users, 
  Edit3, Rocket, Check, X, Sun, Moon, Table, 
  CheckSquare, Square, ChevronRight, ChevronDown, 
  AlertCircle, ListChecks, Filter, Tag, Calendar, 
  Award, TrendingUp, HelpCircle
} from 'lucide-react';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz5BOqMU1e5maZBs2xyWRMPxWIjiJvZbRvJs1GvRgZamk6tKQKbDOdSWTQzp5ut9KL-/exec";

// Master Operational Pillars
const DEFAULT_PROJECTS = [
  { Project_ID: "PRJ-DEXTER", Project_Name: "Dexter Box", Full_Name: "Dexter Box Science Kits" },
  { Project_ID: "PRJ-MAKER", Project_Name: "Maker Lab", Full_Name: "Maker Lab & School Studios" },
  { Project_ID: "PRJ-ATL", Project_Name: "ATL Lab", Full_Name: "Atal Tinkering Labs (ATL)" },
  { Project_ID: "PRJ-CSR", Project_Name: "CSR & NGO", Full_Name: "CSR & NGO Partnerships" },
  { Project_ID: "PRJ-STEP", Project_Name: "Teacher Training", Full_Name: "Teacher Training & Workshops (STEP)" },
  { Project_ID: "PRJ-ADMIN", Project_Name: "Admin & Ops", Full_Name: "Office Admin, HR & Operations" }
];

// Master Tag Library (Replacing rigid task codes)
const MASTER_TAG_LIBRARY = [
  "#Meeting",
  "#SchoolVisit",
  "#ClientFollowup",
  "#Proposal",
  "#BOMCosting",
  "#R&D",
  "#Design",
  "#Assembly",
  "#Accounts",
  "#HR",
  "#General"
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

// Get Monday of any given date
function getMondayOfDate(dStr) {
  const d = new Date(dStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  return `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, '0')}-${String(mon.getDate()).padStart(2, '0')}`;
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("ie_theme") || "light");
  // 4 Core Tabs in Exact Requested Order
  const [activeTab, setActiveTab] = useState("my_tasks"); // 'my_tasks' | 'learning' | 'monthly_review' | 'company_master'
  const [activeEmployeeEmail, setActiveEmployeeEmail] = useState(() => localStorage.getItem("ie_v3_active_emp") || "");

  useEffect(() => { localStorage.setItem("ie_theme", theme); }, [theme]);

  const [employees, setEmployees] = useState(() => JSON.parse(localStorage.getItem("ie_v3_employees") || "[]"));
  const [projects, setProjects] = useState(() => mergeById(JSON.parse(localStorage.getItem("ie_v3_projects") || "[]"), DEFAULT_PROJECTS, "Project_ID"));
  const [weeklyPulses, setWeeklyPulses] = useState(() => JSON.parse(localStorage.getItem("ie_v3_pulses") || "[]"));
  const [dailyLogs, setDailyLogs] = useState(() => JSON.parse(localStorage.getItem("ie_v3_logs") || "[]"));

  const todayStr = getTodayStr();
  const currentMondayStr = getCurrentMondayStr();

  // Create Task Form State
  const [quickTitle, setQuickTitle] = useState("");
  const [quickProject, setQuickProject] = useState("PRJ-MAKER");
  const [quickTag, setQuickTag] = useState("#General");
  const [quickDeadline, setQuickDeadline] = useState(todayStr);
  const [quickSubtasksText, setQuickSubtasksText] = useState("");
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [showCollabPicker, setShowCollabPicker] = useState(false);

  // Expanded Subtask Drawers
  const [expandedRowIds, setExpandedRowIds] = useState({});
  const [newSubtaskInputs, setNewSubtaskInputs] = useState({});
  const [showCompletedRows, setShowCompletedRows] = useState(false);

  // Guarded Completion Modal/Inline Prompt (Cannot complete with 0h logged)
  const [completionGuardTarget, setCompletionGuardTarget] = useState(null); // task row waiting for hours
  const [guardDurationInput, setGuardDurationInput] = useState(60);

  // In-Place Cell Editing State
  const [editingCell, setEditingCell] = useState(null); // { pulseId, field }

  // Streak & GP Popovers
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showGpModal, setShowGpModal] = useState(false);

  // Free-Form Learning Log Form
  const [lrnTopic, setLrnTopic] = useState("");
  const [lrnTag, setLrnTag] = useState("#Electronics");
  const [lrnMinutes, setLrnMinutes] = useState(45);

  // Monthly & Goal Review State
  const [reviewPeriod, setReviewPeriod] = useState("MONTH");
  const [isEditingRnR, setIsEditingRnR] = useState(false);
  const [rnrDraft, setRnrDraft] = useState("");

  // Company Master View Filters
  const [companyFilterProject, setCompanyFilterProject] = useState("ALL");
  const [companyFilterMember, setCompanyFilterMember] = useState("ALL");
  const [companyFilterStatus, setCompanyFilterStatus] = useState("ALL");
  const [expandedMasterKeys, setExpandedMasterKeys] = useState({});

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
  useEffect(() => { localStorage.setItem("ie_v3_pulses", JSON.stringify(weeklyPulses)); }, [weeklyPulses]);
  useEffect(() => { localStorage.setItem("ie_v3_logs", JSON.stringify(dailyLogs)); }, [dailyLogs]);
  useEffect(() => {
    if (activeEmployeeEmail) {
      localStorage.setItem("ie_v3_active_emp", activeEmployeeEmail);
      if (selectedCollaborators.length === 0) setSelectedCollaborators([activeEmployeeEmail]);
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
    "R&R_Summary": "Click 'Edit' to list your monthly core responsibilities and KRAs."
  };

  useEffect(() => { setRnrDraft(currentEmp["R&R_Summary"] || ""); }, [currentEmp]);

  const empDailyLogs = useMemo(() => {
    return dailyLogs.filter(l => (l.Emp_Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase());
  }, [dailyLogs, activeEmployeeEmail]);

  const currentStreak = useMemo(() => calculateUniqueDayStreak(empDailyLogs), [empDailyLogs]);

  // Active & Completed rows for the logged-in user
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

  // ================= TRANSPARENT INDIVIDUAL GP FORMULA & LEDGER =================
  const personalGpData = useMemo(() => {
    let totalGp = 0;
    const history = [];

    // 1. Task Completions & On-Time Bonuses
    completedRows.forEach(row => {
      totalGp += 50;
      history.push({ date: normalizeDateStr(row.Completed_Date) || todayStr, title: `Completed "${row.Monday_Commitment}"`, gp: 50, tag: "Task" });
      const compD = normalizeDateStr(row.Completed_Date);
      const deadD = normalizeDateStr(row.Target_Deadline);
      if (compD && deadD && compD <= deadD) {
        totalGp += 25;
        history.push({ date: compD, title: `⚡ On-Time Bonus for "${row.Monday_Commitment}"`, gp: 25, tag: "Bonus" });
      }
    });

    // 2. Effort Execution (5 GP per 15 mins) & Learning (15 GP per 30 mins)
    empDailyLogs.forEach(l => {
      const rt = Number(l.Task_Hours || 0);
      const tMins = rt > 24 ? rt : Math.round(rt * 60);
      if (tMins > 0) {
        const effortGp = Math.round((tMins / 15) * 5);
        totalGp += effortGp;
        history.push({ date: normalizeDateStr(l.Date), title: `Logged ${tMins}m on ${l.Task_Code || "Task"}`, gp: effortGp, tag: "Effort" });
      }
      const rl = Number(l.Learning_Hours || 0);
      const lMins = rl > 24 ? rl : Math.round(rl * 60);
      if (lMins > 0) {
        const lrnGp = Math.round((lMins / 30) * 15);
        totalGp += lrnGp;
        history.push({ date: normalizeDateStr(l.Date), title: `Learning: ${l.Learning_Module_Code || l.Notes} (${lMins}m)`, gp: lrnGp, tag: "Upskilling" });
      }
    });

    history.sort((a, b) => b.date.localeCompare(a.date));
    return { totalGp, history: history.slice(0, 15) };
  }, [completedRows, empDailyLogs, todayStr]);

  // ================= WEEKLY TEAM LAUNCH TOWER ENGINE (WEEK-BY-WEEK HEIGHT) =================
  const towerData = useMemo(() => {
    const weeklyPointsMap = {};

    weeklyPulses.forEach(row => {
      if (Number(row.Auto_Task_Hours || 0) >= 100) {
        const cDate = normalizeDateStr(row.Completed_Date) || todayStr;
        const wkMon = getMondayOfDate(cDate);
        weeklyPointsMap[wkMon] = (weeklyPointsMap[wkMon] || 0) + 50;
        const dDate = normalizeDateStr(row.Target_Deadline);
        if (dDate && cDate <= dDate) {
          weeklyPointsMap[wkMon] = (weeklyPointsMap[wkMon] || 0) + 25;
        }
      }
    });

    dailyLogs.forEach(l => {
      const lDate = normalizeDateStr(l.Date) || todayStr;
      const wkMon = getMondayOfDate(lDate);
      const rt = Number(l.Task_Hours || 0);
      const tMins = rt > 24 ? rt : Math.round(rt * 60);
      if (tMins > 0) weeklyPointsMap[wkMon] = (weeklyPointsMap[wkMon] || 0) + Math.round((tMins / 15) * 5);

      const rl = Number(l.Learning_Hours || 0);
      const lMins = rl > 24 ? rl : Math.round(rl * 60);
      if (lMins > 0) weeklyPointsMap[wkMon] = (weeklyPointsMap[wkMon] || 0) + Math.round((lMins / 30) * 15);
    });

    const currentWkPoints = weeklyPointsMap[currentMondayStr] || 0;
    const sortedWeeks = Object.keys(weeklyPointsMap).sort();
    const currIdx = sortedWeeks.indexOf(currentMondayStr);
    const lastWkMon = currIdx > 0 ? sortedWeeks[currIdx - 1] : null;
    const lastWkPoints = lastWkMon ? weeklyPointsMap[lastWkMon] : 0;
    const delta = currentWkPoints - lastWkPoints;

    const allScores = Object.values(weeklyPointsMap);
    const recordHeight = allScores.length > 0 ? Math.max(...allScores, 1500) : 1500;
    const last4 = allScores.slice(-4);
    const rollingAvg = last4.length > 0 ? Math.round(last4.reduce((a, b) => a + b, 0) / last4.length) : currentWkPoints;

    // Generic Clean Milestones
    let currentTier = "Base (Level 1)";
    if (currentWkPoints >= 2500) currentTier = "Peak / Summit Level";
    else if (currentWkPoints >= 1800) currentTier = "Tier 3 (Level 4)";
    else if (currentWkPoints >= 1000) currentTier = "Tier 2 (Level 3)";
    else if (currentWkPoints >= 500) currentTier = "Tier 1 (Level 2)";

    const heightPercent = Math.min(100, Math.round((currentWkPoints / 2500) * 100));

    // Last 4 weeks bar data for comparison visual
    const historyBars = sortedWeeks.slice(-4).map(wk => ({
      weekMon: wk,
      points: weeklyPointsMap[wk],
      isCurrent: wk === currentMondayStr,
      percent: Math.min(100, Math.round((weeklyPointsMap[wk] / Math.max(recordHeight, 2500)) * 100))
    }));

    return {
      currentWkPoints,
      lastWkPoints,
      delta,
      currentTier,
      heightPercent,
      recordHeight,
      rollingAvg,
      historyBars
    };
  }, [weeklyPulses, dailyLogs, currentMondayStr, todayStr]);

  // ================= COMPANY MASTER SHEET AGGREGATION & DYNAMIC METRICS =================
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
          tag: p.Task_Code || "#General",
          createdDate: normalizeDateStr(p.Created_Date || p.Week_Start_Date) || todayStr,
          targetDeadline: normalizeDateStr(p.Target_Deadline),
          completedDate: normalizeDateStr(p.Completed_Date),
          owners: [p.Emp_Email].filter(Boolean),
          totalMinutes: mins,
          progress: prog,
          subtasks: subtasks
        });
      } else {
        if (p.Emp_Email && !existing.owners.includes(p.Emp_Email)) existing.owners.push(p.Emp_Email);
        existing.totalMinutes += mins;
        existing.progress = Math.max(existing.progress, prog);
        if (subtasks.length > existing.subtasks.length) existing.subtasks = subtasks;
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

  // Context-Aware KPI Cards (Changes to reflect individual when a person is filtered!)
  const masterKpiStats = useMemo(() => {
    const list = companyFilterMember === "ALL" 
      ? companyMasterTasks 
      : companyMasterTasks.filter(t => t.owners.some(o => o.toLowerCase() === companyFilterMember.toLowerCase()));

    const total = list.length;
    const completed = list.filter(t => t.progress >= 100).length;
    const inProgress = list.filter(t => t.progress < 100).length;
    const overdue = list.filter(t => t.progress < 100 && t.targetDeadline && t.targetDeadline < todayStr).length;
    const totalProg = list.reduce((acc, t) => acc + t.progress, 0);
    const avgProgress = total > 0 ? Math.round(totalProg / total) : 0;
    const totalMins = list.reduce((acc, t) => acc + t.totalMinutes, 0);

    return {
      total,
      completed,
      inProgress,
      overdue,
      avgProgress,
      totalHours: (totalMins / 60).toFixed(1),
      filteredMemberName: companyFilterMember === "ALL" ? null : getEmployeeName(companyFilterMember)
    };
  }, [companyMasterTasks, companyFilterMember, todayStr, employees]);

  // ================= MONTHLY & GOAL REVIEW ANALYTICS =================
  const reviewMetrics = useMemo(() => {
    const currentMonthPrefix = todayStr.slice(0, 7);
    const periodLogs = empDailyLogs.filter(l => {
      const d = normalizeDateStr(l.Date);
      return reviewPeriod === "WEEK" ? d >= currentMondayStr : d.startsWith(currentMonthPrefix);
    });

    let projectMins = 0;
    let learningMins = 0;
    const byTag = {};

    periodLogs.forEach(l => {
      const rt = Number(l.Task_Hours || 0);
      const tMins = rt > 24 ? rt : Math.round(rt * 60);
      const rl = Number(l.Learning_Hours || 0);
      const lMins = rl > 24 ? rl : Math.round(rl * 60);

      projectMins += tMins;
      learningMins += lMins;

      const tagKey = l.Task_Code || "#General";
      if (tMins > 0) byTag[tagKey] = (byTag[tagKey] || 0) + tMins;
      if (lMins > 0) byTag["#Learning"] = (byTag["#Learning"] || 0) + lMins;
    });

    const totalMins = projectMins + learningMins;
    const tagBars = Object.entries(byTag).map(([tag, mins]) => ({
      tag,
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
      tagBars
    };
  }, [empDailyLogs, reviewPeriod, currentMondayStr, todayStr, empAllPulses, completedRows, activeRows]);

  // ================= SUB-TASK ENGINE & COLLABORATOR SYNC =================
  const syncSubtasksAndProgress = (rowItem, updatedSubtasks) => {
    const totalSub = updatedSubtasks.length;
    const doneSub = updatedSubtasks.filter(s => s.done).length;
    const autoProgress = totalSub > 0 ? Math.round((doneSub / totalSub) * 100) : Number(rowItem.Auto_Task_Hours || 0);
    const jsonStr = JSON.stringify(updatedSubtasks);

    const targetTitle = (rowItem.Monday_Commitment || "").trim().toLowerCase();
    const targetPrj = (rowItem.Project_ID || "").toUpperCase();

    // Check guard: if hitting 100% but 0h logged, trigger prompt!
    if (autoProgress >= 100 && Number(rowItem.Auto_Learning_Hours || 0) === 0) {
      setCompletionGuardTarget({ ...rowItem, pendingSubtasks: updatedSubtasks });
      return;
    }

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

  // ================= GUARDED TIME LOGGING & COMPLETION =================
  const handleQuickLogTimeOnRow = (rowItem, addMinutes, forceDone = false) => {
    const currentMins = Number(rowItem.Auto_Learning_Hours || 0) + addMinutes;

    // GUARD: If trying to mark done but total hours is 0, require duration input!
    if (forceDone && currentMins === 0) {
      setCompletionGuardTarget(rowItem);
      return;
    }

    let currentSubtasks = parseSubtasks(rowItem);
    let newProg = Number(rowItem.Auto_Task_Hours || 0);

    if (forceDone) {
      newProg = 100;
      if (currentSubtasks.length > 0) currentSubtasks = currentSubtasks.map(s => ({ ...s, done: true }));
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
          Auto_Learning_Hours: currentMins,
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
        Task_Code: rowItem.Task_Code || "#General",
        Task_Hours: addMinutes,
        Learning_Module_Code: "None",
        Learning_Hours: 0,
        Status: newProg >= 100 ? "Done" : "In Progress",
        Streak_Count: currentStreak || 1,
        Notes: rowItem.Monday_Commitment
      }]);
    }

    showToast(forceDone ? `✓ Completed "${rowItem.Monday_Commitment}"!` : `🕒 Logged +${addMinutes}m`);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "logTaskSession",
          pulseId: rowItem.Pulse_ID,
          email: activeEmployeeEmail,
          projectId: rowItem.Project_ID,
          taskTag: rowItem.Task_Code || "#General",
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

  // Resolve Guarded Completion Once User Picks Hours
  const handleResolveGuardedCompletion = (mins) => {
    if (!completionGuardTarget) return;
    const target = completionGuardTarget;
    setCompletionGuardTarget(null);
    handleQuickLogTimeOnRow(target, Number(mins), true);
  };

  // In-Place Row Attribute Editing (Saves directly to Sheet)
  const handleUpdateRowAttribute = (pulseId, field, value) => {
    setWeeklyPulses(prev => prev.map(p => p.Pulse_ID === pulseId ? { ...p, [field]: value } : p));
    setEditingCell(null);
    showToast("Updated!");

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "updateRowField",
          pulseId: pulseId,
          [field === "Monday_Commitment" ? "title" : field === "Project_ID" ? "projectId" : field === "Task_Code" ? "tag" : field === "Target_Deadline" ? "deadline" : "collaborators"]: value
        })
      });
    } catch (err) {}
  };

  // Add Task Row Submit
  const handleCreateTaskRow = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const initialSubtasks = quickSubtasksText
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
      Project_ID: quickProject,
      Task_Code: quickTag,
      Monday_Commitment: quickTitle.trim(),
      Auto_Task_Hours: 0,
      Auto_Learning_Hours: 0,
      Friday_Outcome: "Self",
      Status: "In Progress",
      Target_Deadline: quickDeadline || todayStr,
      Completed_Date: "",
      Collaborators: collabStr,
      Subtasks_JSON: subtasksJson,
      subtasks: initialSubtasks
    }));

    setWeeklyPulses(prev => [...prev, ...createdItems]);
    if (initialSubtasks.length > 0 && createdItems[0]) {
      setExpandedRowIds(prev => ({ ...prev, [createdItems[0].Pulse_ID]: true }));
    }

    setQuickTitle("");
    setQuickSubtasksText("");
    setShowCollabPicker(false);
    showToast(`Added "${quickTitle.trim()}"!`);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "addWorkboardBatch", items: createdItems })
      });
    } catch (err) {}
  };

  // Free-Form Learning Submit
  const handleLogLearning = (e) => {
    e.preventDefault();
    if (!lrnTopic.trim()) return;

    const newLog = {
      Log_ID: "LRN-" + Date.now(),
      Date: todayStr,
      Emp_Email: activeEmployeeEmail,
      Project_ID: "UPSKILLING",
      Task_Code: lrnTag,
      Task_Hours: 0,
      Learning_Module_Code: lrnTopic.trim(),
      Learning_Hours: Number(lrnMinutes),
      Status: "Done",
      Streak_Count: currentStreak || 1,
      Notes: lrnTopic.trim()
    };

    setDailyLogs(prev => [...prev, newLog]);
    setLrnTopic("");
    showToast(`🎓 Logged ${lrnMinutes}m of learning! (+${Math.round((lrnMinutes / 30) * 15)} GP)`);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "logLearningSession",
          email: activeEmployeeEmail,
          topicTitle: newLog.Learning_Module_Code,
          skillTag: lrnTag,
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
      
      {/* ================= MINIMAL TOP NAV ================= */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white/95 border-slate-200"}`}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Table className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight">IE Workspace</span>
              <span className="text-[11px] text-slate-400 hidden sm:inline ml-2">Goal & Time OS</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Clickable Goal Points Pill (Opens Transparent Personal Ledger) */}
            <button
              type="button"
              onClick={() => setShowGpModal(true)}
              title="Click to view personal GP receipt"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 hover:bg-indigo-500/20 transition cursor-pointer"
            >
              <Award className="h-3.5 w-3.5" />
              <span>{personalGpData.totalGp} GP</span>
            </button>

            {/* Clickable Streak Pill (Opens 14-Day Activity Heatmap) */}
            <button
              type="button"
              onClick={() => setShowStreakModal(true)}
              title="Click to view activity history"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer"
            >
              <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>{currentStreak}d Streak</span>
            </button>

            {/* User Switcher (Unrestricted for Testing) */}
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

        {/* 4 WORKBOOK TABS IN EXACT REQUESTED SEQUENCE */}
        <div className={`flex items-center justify-between border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <div className="flex items-center gap-1 text-xs sm:text-sm overflow-x-auto">
            {/* TAB 1 */}
            <button
              type="button"
              onClick={() => setActiveTab("my_tasks")}
              className={`px-4 py-2.5 font-semibold rounded-t-xl border-t border-x transition flex items-center gap-1.5 shrink-0 ${
                activeTab === "my_tasks"
                  ? (isDark ? "bg-slate-900 border-slate-800 text-indigo-400" : "bg-white border-slate-200 text-indigo-600 shadow-sm")
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <ListChecks className="h-4 w-4" /> 1. My Tasks & Sub-Tasks ({activeRows.length})
            </button>

            {/* TAB 2 */}
            <button
              type="button"
              onClick={() => setActiveTab("learning")}
              className={`px-4 py-2.5 font-semibold rounded-t-xl border-t border-x transition flex items-center gap-1.5 shrink-0 ${
                activeTab === "learning"
                  ? (isDark ? "bg-slate-900 border-slate-800 text-indigo-400" : "bg-white border-slate-200 text-indigo-600 shadow-sm")
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <GraduationCap className="h-4 w-4" /> 2. Learning Log
            </button>

            {/* TAB 3 */}
            <button
              type="button"
              onClick={() => setActiveTab("monthly_review")}
              className={`px-4 py-2.5 font-semibold rounded-t-xl border-t border-x transition flex items-center gap-1.5 shrink-0 ${
                activeTab === "monthly_review"
                  ? (isDark ? "bg-slate-900 border-slate-800 text-indigo-400" : "bg-white border-slate-200 text-indigo-600 shadow-sm")
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <BarChart3 className="h-4 w-4" /> 3. Monthly & Goal Review
            </button>

            {/* TAB 4 */}
            <button
              type="button"
              onClick={() => setActiveTab("company_master")}
              className={`px-4 py-2.5 font-semibold rounded-t-xl border-t border-x transition flex items-center gap-1.5 shrink-0 ${
                activeTab === "company_master"
                  ? (isDark ? "bg-slate-900 border-slate-800 text-indigo-400" : "bg-white border-slate-200 text-indigo-600 shadow-sm")
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Building2 className="h-4 w-4" /> 4. Company Master View
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

        {/* ================= TAB 1: MY TASKS & SUB-TASKS ================= */}
        {activeTab === "my_tasks" && (
          <div className="space-y-4">
            {/* Task Entry Bar (Predictable Form - No Smart Add Voice Interference) */}
            <form onSubmit={handleCreateTaskRow} className={`p-3.5 rounded-2xl border shadow-sm space-y-2.5 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    required
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    placeholder="Deliverable (e.g. AMT School Expo Booth)"
                    className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"}`}
                  />
                </div>

                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={quickSubtasksText}
                    onChange={(e) => setQuickSubtasksText(e.target.value)}
                    placeholder="Sub-tasks, comma-separated (e.g. Pack kits, Print posters)"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700 focus:bg-white"}`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={quickProject}
                    onChange={(e) => setQuickProject(e.target.value)}
                    className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                  >
                    {projects.map(p => <option key={p.Project_ID} value={p.Project_ID}>{p.Project_Name}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <select
                    value={quickTag}
                    onChange={(e) => setQuickTag(e.target.value)}
                    className={`w-full px-2 py-2 rounded-xl text-xs font-medium border ${isDark ? "bg-slate-950 border-slate-800 text-indigo-300" : "bg-slate-50 border-slate-200 text-indigo-700"}`}
                  >
                    {MASTER_TAG_LIBRARY.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2 flex items-center gap-1.5">
                  <input
                    type="date"
                    value={quickDeadline}
                    onChange={(e) => setQuickDeadline(e.target.value)}
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

              {/* Collaborator Tagging */}
              {employees.length > 1 && (
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setShowCollabPicker(!showCollabPicker)}
                      className="text-[11px] text-indigo-500 font-medium flex items-center gap-1 hover:underline"
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>{selectedCollaborators.length > 1 ? `Assigned to ${selectedCollaborators.length} members` : "+ Assign Co-Owners / Collaborators"}</span>
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
                    Check off sub-tasks to auto-calculate progress %
                  </span>
                </div>
              )}
            </form>

            {/* Tasks Spreadsheet Table */}
            <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className={`border-b text-[11px] uppercase tracking-wider font-semibold ${isDark ? "bg-slate-950/60 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                      <th className="py-3 px-3 w-10 text-center">Done</th>
                      <th className="py-3 px-3">Deliverable & Sub-Tasks (Click row to expand)</th>
                      <th className="py-3 px-3 w-28">Project</th>
                      <th className="py-3 px-3 w-24">Activity Tag</th>
                      <th className="py-3 px-3 w-28">Due Date</th>
                      <th className="py-3 px-3 w-36">Sub-Task Progress</th>
                      <th className="py-3 px-3 w-20 text-right">Logged</th>
                      <th className="py-3 px-4 w-44 text-right">Log Effort</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200/70"}`}>
                    {activeRows.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-10 text-center text-slate-400 text-xs">
                          Your active sheet is clear! Add your tasks and sub-tasks above.
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
                                  title="Mark Done"
                                  className="text-slate-400 hover:text-emerald-500 transition"
                                >
                                  <Square className="h-4 w-4" />
                                </button>
                              </td>

                              <td className="py-3 px-3 font-medium">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedRowIds(prev => ({ ...prev, [row.Pulse_ID]: !isExpanded }))}
                                    className="p-0.5 hover:text-indigo-500"
                                  >
                                    {isExpanded ? <ChevronDown className="h-4 w-4 text-indigo-500" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                                  </button>

                                  {/* Inline Edit Title */}
                                  {editingCell?.pulseId === row.Pulse_ID && editingCell?.field === "title" ? (
                                    <input
                                      autoFocus
                                      type="text"
                                      defaultValue={row.Monday_Commitment}
                                      onBlur={(e) => handleUpdateRowAttribute(row.Pulse_ID, "Monday_Commitment", e.target.value)}
                                      onKeyDown={(e) => { if (e.key === "Enter") handleUpdateRowAttribute(row.Pulse_ID, "Monday_Commitment", e.target.value); }}
                                      className={`px-2 py-0.5 rounded border text-xs ${isDark ? "bg-slate-950 border-slate-700" : "bg-white border-slate-300"}`}
                                    />
                                  ) : (
                                    <span
                                      onClick={() => setEditingCell({ pulseId: row.Pulse_ID, field: "title" })}
                                      className="cursor-pointer hover:underline"
                                      title="Click to edit title"
                                    >
                                      {row.Monday_Commitment}
                                    </span>
                                  )}

                                  {subtasks.length > 0 && (
                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold ${isDark ? "bg-slate-800 text-indigo-300" : "bg-slate-100 text-indigo-700"}`}>
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

                              {/* Inline Edit Project */}
                              <td className="py-3 px-3">
                                <select
                                  value={row.Project_ID}
                                  onChange={(e) => handleUpdateRowAttribute(row.Pulse_ID, "Project_ID", e.target.value)}
                                  className={`px-2 py-0.5 rounded text-xs font-medium border ${isDark ? "bg-slate-900 border-slate-700 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-700"}`}
                                >
                                  {projects.map(p => <option key={p.Project_ID} value={p.Project_ID}>{p.Project_Name}</option>)}
                                </select>
                              </td>

                              {/* Inline Edit Activity Tag */}
                              <td className="py-3 px-3">
                                <select
                                  value={row.Task_Code || "#General"}
                                  onChange={(e) => handleUpdateRowAttribute(row.Pulse_ID, "Task_Code", e.target.value)}
                                  className={`px-1.5 py-0.5 rounded text-[11px] font-medium border ${isDark ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"}`}
                                >
                                  {MASTER_TAG_LIBRARY.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </td>

                              {/* Inline Edit Due Date */}
                              <td className="py-3 px-3 text-xs font-mono">
                                <input
                                  type="date"
                                  value={due || todayStr}
                                  onChange={(e) => handleUpdateRowAttribute(row.Pulse_ID, "Target_Deadline", e.target.value)}
                                  className={`bg-transparent text-xs font-mono border-b border-transparent hover:border-slate-400 focus:outline-none`}
                                />
                              </td>

                              {/* Auto-Calculated Progress Bar */}
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-16 h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                                    <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${prog}%` }} />
                                  </div>
                                  <span className="text-xs font-mono font-bold text-indigo-500">{prog}%</span>
                                </div>
                              </td>

                              <td className="py-3 px-3 text-right font-mono text-xs font-semibold">
                                {(mins / 60).toFixed(1)}h
                              </td>

                              {/* 1-Tap Time Log Buttons */}
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

                            {/* EXPANDED SUBTASK CHECKLIST ROW */}
                            {isExpanded && (
                              <tr className={isDark ? "bg-slate-950/70" : "bg-indigo-50/30"}>
                                <td></td>
                                <td colSpan="7" className="py-3 px-4">
                                  <div className="max-w-xl space-y-2">
                                    <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500 flex items-center justify-between">
                                      <span>Checklist ({doneSubCount} of {subtasks.length} completed = {prog}%)</span>
                                    </div>

                                    {subtasks.length === 0 ? (
                                      <p className="text-xs text-slate-400 italic">
                                        No sub-tasks defined yet. Add the steps below to track concrete progress.
                                      </p>
                                    ) : (
                                      <div className="space-y-1.5">
                                        {subtasks.map((sub, sIdx) => (
                                          <div
                                            key={sub.id}
                                            className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
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
                                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs border focus:outline-none ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"}`}
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
                          <span className="line-through">{c.Monday_Commitment} ({getProjectLabel(c.Project_ID)}) • {c.Task_Code}</span>
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

        {/* ================= TAB 2: LEARNING LOG (FREE-FORM & MATCHING DESIGN) ================= */}
        {activeTab === "learning" && (
          <div className="space-y-4">
            {/* Free-form learning input */}
            <form onSubmit={handleLogLearning} className={`p-4 rounded-2xl border shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div className="sm:col-span-6">
                <input
                  type="text"
                  required
                  value={lrnTopic}
                  onChange={(e) => setLrnTopic(e.target.value)}
                  placeholder="What skill, tool, or concept did you study/practice?"
                  className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                />
              </div>

              <div className="sm:col-span-3">
                <input
                  type="text"
                  value={lrnTag}
                  onChange={(e) => setLrnTag(e.target.value)}
                  placeholder="#Electronics, #Pedagogy"
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none font-medium ${isDark ? "bg-slate-950 border-slate-800 text-purple-300" : "bg-slate-50 border-slate-200 text-purple-700"}`}
                />
              </div>

              <div className="sm:col-span-3 flex items-center gap-2">
                <select
                  value={lrnMinutes}
                  onChange={(e) => setLrnMinutes(Number(e.target.value))}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-mono border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                >
                  <option value={30}>30 mins (+15 GP)</option>
                  <option value={45}>45 mins (+22 GP)</option>
                  <option value={60}>1 hour (+30 GP)</option>
                  <option value={90}>1.5 hours (+45 GP)</option>
                  <option value={120}>2 hours (+60 GP)</option>
                </select>
                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer">
                  + Log
                </button>
              </div>
            </form>

            {/* Learning Log Table */}
            <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className={`border-b text-[11px] uppercase font-semibold ${isDark ? "bg-slate-950/60 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">What I Learned / Practiced</th>
                    <th className="py-3 px-4">Skill Tag</th>
                    <th className="py-3 px-4 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200/60"}`}>
                  {empDailyLogs.filter(l => Number(l.Learning_Hours || 0) > 0).length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400 text-xs">
                        No learning logged yet. Enter your practice session above!
                      </td>
                    </tr>
                  ) : (
                    empDailyLogs.filter(l => Number(l.Learning_Hours || 0) > 0).slice().reverse().map(l => (
                      <tr key={l.Log_ID}>
                        <td className="py-3 px-4 font-mono text-xs text-slate-400">{normalizeDateStr(l.Date)}</td>
                        <td className="py-3 px-4 font-medium">{l.Learning_Module_Code}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 font-semibold text-xs">
                            {l.Task_Code || "#Learning"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-purple-400">{l.Learning_Hours} mins</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: MONTHLY & GOAL REVIEW (PERSONAL SELF-REFLECTION) ================= */}
        {activeTab === "monthly_review" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Personal Monthly & Goal Review</h2>
                <p className="text-xs text-slate-400">Strictly personal to {currentEmp.Name} — reflecting on effort, tags & baseline KRAs</p>
              </div>
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
                <span className="text-xs text-slate-400 block">Personal Goal Completion</span>
                <span className="text-2xl font-bold font-mono text-emerald-500">{reviewMetrics.goalCompletionRate}%</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">{reviewMetrics.completedGoals} of {reviewMetrics.totalGoals} goals shipped</span>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <span className="text-xs text-slate-400 block">Total Logged Hours</span>
                <span className="text-2xl font-bold font-mono text-indigo-500">{reviewMetrics.totalHours}h</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">{reviewMetrics.projectHours}h Projects</span>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <span className="text-xs text-slate-400 block">Upskilling Logged</span>
                <span className="text-2xl font-bold font-mono text-purple-500">{reviewMetrics.learningHours}h</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Deliberate Practice</span>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <span className="text-xs text-slate-400 block">Active Consistency</span>
                <span className="text-2xl font-bold font-mono text-amber-500">{currentStreak} Days</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Continuous Streak</span>
              </div>
            </div>

            {/* Time Spent by Activity Tag Breakdown (Answers user's meeting/field question!) */}
            <div className={`p-5 rounded-2xl border space-y-3 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
              <h3 className="font-bold text-sm">Where My Time Went by Activity Tag ({reviewPeriod === "WEEK" ? "This Week" : "This Month"})</h3>
              {reviewMetrics.tagBars.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">No hours logged yet in this period.</p>
              ) : (
                <div className="space-y-3">
                  {reviewMetrics.tagBars.map(bar => (
                    <div key={bar.tag} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold">{bar.tag}</span>
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

            {/* Personal KRAs */}
            <div className={`p-5 rounded-2xl border space-y-3 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-indigo-500" /> My Baseline Roles & Responsibilities (KRAs)
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
                      showToast("Saved KRAs!");
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

        {/* ================= TAB 4: COMPANY MASTER VIEW (LAUNCH TOWER + DYNAMIC CARDS) ================= */}
        {activeTab === "company_master" && (
          <div className="space-y-5">
            {/* 1. WEEKLY TEAM LAUNCH TOWER WIDGET (Week-by-Week Comparison) */}
            <div className={`p-5 rounded-2xl border shadow-sm space-y-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-200/50">
                <div>
                  <div className="flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-indigo-500" />
                    <h3 className="font-bold text-sm">Weekly Team Launch Tower</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-500">
                      {towerData.currentTier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Height this week: <strong className="text-indigo-500 font-mono">{towerData.currentWkPoints} GP</strong>
                    {" "}({towerData.delta >= 0 ? `▲ +${towerData.delta} GP higher than last week` : `▼ ${towerData.delta} GP vs last week`})
                  </p>
                </div>
                <div className="text-left sm:text-right text-xs">
                  <span className="text-slate-400 block">4-Week Moving Avg: <strong className="font-mono text-slate-200">{towerData.rollingAvg} GP</strong></span>
                  <span className="text-amber-500 font-semibold block">🏆 Highest Tower Record: {towerData.recordHeight} GP</span>
                </div>
              </div>

              {/* Weekly Tower Comparison Bar Chart */}
              <div className="grid grid-cols-4 gap-3 items-end pt-2 h-36">
                {towerData.historyBars.map(bar => (
                  <div key={bar.weekMon} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[11px] font-mono font-bold">{bar.points} GP</span>
                    <div className={`w-full rounded-t-xl transition-all duration-500 ${bar.isCurrent ? "bg-indigo-600 shadow-md shadow-indigo-500/20" : isDark ? "bg-slate-800" : "bg-slate-200"}`} style={{ height: `${Math.max(15, bar.percent)}%` }} />
                    <span className={`text-[10px] font-mono ${bar.isCurrent ? "font-bold text-indigo-500" : "text-slate-400"}`}>
                      {bar.isCurrent ? "This Wk" : bar.weekMon.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. DYNAMIC CONTEXT-AWARE KPI CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className={`p-3.5 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <span className="text-[11px] text-slate-400 block">
                  {masterKpiStats.filteredMemberName ? `${masterKpiStats.filteredMemberName}'s Tasks` : "All Company Tasks"}
                </span>
                <span className="text-xl font-bold font-mono">{masterKpiStats.total}</span>
                <span className="text-[11px] text-indigo-500 font-semibold block">{masterKpiStats.avgProgress}% completion</span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <span className="text-[11px] text-slate-400 block">Completed (100%)</span>
                <span className="text-xl font-bold font-mono text-emerald-500">{masterKpiStats.completed}</span>
                <span className="text-[11px] text-slate-400 block">Shipped deliverables</span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <span className="text-[11px] text-slate-400 block">In Progress</span>
                <span className="text-xl font-bold font-mono text-blue-500">{masterKpiStats.inProgress}</span>
                <span className="text-[11px] text-slate-400 block">Active execution</span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <span className="text-[11px] text-slate-400 block">Overdue Alerts</span>
                <span className="text-xl font-bold font-mono text-rose-500">{masterKpiStats.overdue}</span>
                <span className="text-[11px] text-slate-400 block">Past committed date</span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <span className="text-[11px] text-slate-400 block">Invested Effort</span>
                <span className="text-xl font-bold font-mono text-amber-500">{masterKpiStats.totalHours}h</span>
                <span className="text-[11px] text-slate-400 block">Combined hours</span>
              </div>
            </div>

            {/* 3. FILTER BAR */}
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
                  <option value="ALL">All Team Members (Company View)</option>
                  {employees.map(emp => <option key={emp.Email} value={emp.Email}>{emp.Name}</option>)}
                </select>

                <div className={`flex p-0.5 rounded-lg border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
                  {[
                    { id: "ALL", label: "All" },
                    { id: "ACTIVE", label: "Active" },
                    { id: "DONE", label: "Done" },
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
                Click any row to view sub-task progress
              </span>
            </div>

            {/* 4. MASTER ROADMAP TABLE */}
            <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className={`border-b text-[11px] uppercase font-semibold ${isDark ? "bg-slate-950/60 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                      <th className="py-3 px-4">Deliverable</th>
                      <th className="py-3 px-3">Project</th>
                      <th className="py-3 px-3">Tag</th>
                      <th className="py-3 px-3">Owner(s)</th>
                      <th className="py-3 px-3">Due Date</th>
                      <th className="py-3 px-3">Sub-Tasks</th>
                      <th className="py-3 px-3 w-36">Progress</th>
                      <th className="py-3 px-4 text-right">Combined Effort</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200/70"}`}>
                    {filteredCompanyTasks.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-slate-400 text-xs">
                          No deliverables found matching the filter.
                        </td>
                      </tr>
                    ) : (
                      filteredCompanyTasks.map(item => {
                        const isDone = item.progress >= 100;
                        const isOverdue = !isDone && item.targetDeadline && item.targetDeadline < todayStr;
                        const doneSub = item.subtasks.filter(s => s.done).length;
                        const isExp = Boolean(expandedMasterKeys[item.groupKey]);

                        return (
                          <React.Fragment key={item.groupKey}>
                            <tr
                              onClick={() => setExpandedMasterKeys(prev => ({ ...prev, [item.groupKey]: !isExp }))}
                              className={`cursor-pointer transition ${isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50/80"}`}
                            >
                              <td className="py-3 px-4 font-medium">
                                <div className="flex items-center gap-1.5">
                                  {isExp ? <ChevronDown className="h-4 w-4 text-indigo-500" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
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

                              <td className="py-3 px-3">
                                <span className="px-1.5 py-0.5 rounded bg-slate-500/10 text-[11px] font-medium">
                                  {item.tag}
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
                                  <span className="text-slate-400">1-step</span>
                                )}
                              </td>

                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-16 h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
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
                                <td colSpan="8" className="py-3 px-8">
                                  {item.subtasks.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">No sub-tasks defined for this deliverable.</p>
                                  ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                      {item.subtasks.map((sub, idx) => (
                                        <div
                                          key={sub.id}
                                          className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
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
      </main>

      {/* ================= GUARDED COMPLETION MODAL (CANNOT COMPLETE WITH 0h) ================= */}
      {completionGuardTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className="flex items-center gap-2 text-amber-500">
              <Clock className="h-5 w-5" />
              <h3 className="font-bold text-sm">Log Time Before Completing</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              You're marking <strong>"{completionGuardTarget.Monday_Commitment}"</strong> as Done, but 0 hours are currently logged. How much time did this take to finish?
            </p>

            <div className="grid grid-cols-4 gap-2 text-xs font-mono font-semibold">
              {[30, 60, 90, 120].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleResolveGuardedCompletion(m)}
                  className={`py-2 rounded-xl border transition ${isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-white" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"}`}
                >
                  {m >= 60 ? `${m / 60}h` : `${m}m`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="number"
                min="5"
                step="5"
                value={guardDurationInput}
                onChange={(e) => setGuardDurationInput(Number(e.target.value))}
                placeholder="Minutes"
                className={`w-28 px-3 py-1.5 rounded-xl text-xs border ${isDark ? "bg-slate-950 border-slate-700" : "bg-slate-50 border-slate-200"}`}
              />
              <span className="text-xs text-slate-400">mins</span>
              <button
                type="button"
                onClick={() => handleResolveGuardedCompletion(guardDurationInput)}
                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs"
              >
                Done ✓
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setCompletionGuardTarget(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PERSONAL GP LEDGER MODAL ================= */}
      {showGpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 text-xs ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className="flex justify-between items-center border-b pb-2.5 border-slate-200/50">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-indigo-500" />
                <h3 className="font-bold text-sm">Personal Goal Points Ledger</h3>
              </div>
              <button type="button" onClick={() => setShowGpModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex justify-between items-center">
              <span>Total Earned by {currentEmp.Name}:</span>
              <span className="text-xl font-bold font-mono text-indigo-500">{personalGpData.totalGp} GP</span>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {personalGpData.history.length === 0 ? (
                <p className="text-center text-slate-400 py-4">No points logged yet. Complete tasks or log learning to earn GP!</p>
              ) : (
                personalGpData.history.map((h, i) => (
                  <div key={i} className={`p-2 rounded-lg border flex items-center justify-between ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <div>
                      <span className="font-medium block">{h.title}</span>
                      <span className="text-[10px] text-slate-400">{h.date} • {h.tag}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-500">+{h.gp} GP</span>
                  </div>
                ))
              )}
            </div>

            <div className="text-[11px] text-slate-400 border-t pt-2 border-slate-200/50">
              Points Formula: <strong>+50 GP</strong> (Task 100%), <strong>+25 GP</strong> (On-time), <strong>+5 GP</strong> (per 15m effort), <strong>+15 GP</strong> (per 30m learning).
            </div>
          </div>
        </div>
      )}

      {/* ================= STREAK 14-DAY CALENDAR MODAL ================= */}
      {showStreakModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-xs ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className="flex justify-between items-center border-b pb-2 border-slate-200/50">
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                <h3 className="font-bold text-sm">Consistency Tracker ({currentStreak} Days)</h3>
              </div>
              <button type="button" onClick={() => setShowStreakModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>

            <p className="text-xs text-slate-400">
              Unique working days (Mon–Sat) with logged task effort or learning:
            </p>

            {/* 14-Day Heatmap grid */}
            <div className="grid grid-cols-7 gap-2 pt-1 text-center font-mono">
              {Array.from({ length: 14 }).map((_, i) => {
                const targetD = new Date();
                targetD.setDate(targetD.getDate() - (13 - i));
                const dStr = normalizeDateStr(targetD.toISOString());
                const hasWorked = empDailyLogs.some(l => normalizeDateStr(l.Date) === dStr);
                const isToday = dStr === todayStr;

                return (
                  <div key={dStr} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400">{dStr.slice(8)}</span>
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs transition ${
                        hasWorked 
                          ? "bg-amber-500 text-white shadow-sm" 
                          : isDark ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"
                      } ${isToday ? "ring-2 ring-indigo-500" : ""}`}
                    >
                      {hasWorked ? "✓" : "·"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-right pt-2 border-t border-slate-200/50">
              <button type="button" onClick={() => setShowStreakModal(false)} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ONBOARD MEMBER MODAL ================= */}
      {showEmpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 text-xs ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold">Onboard Team Member</h3>
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

      {/* ================= ADD PROJECT MODAL ================= */}
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

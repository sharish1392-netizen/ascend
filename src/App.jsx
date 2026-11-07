import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, CheckCircle, Clock, BookOpen, Send, Building2, 
  ChevronRight, Sparkles, RefreshCw, FolderPlus, UserPlus, 
  ListPlus, CalendarCheck, Zap, GraduationCap, LayoutGrid,
  Plus, Trash2, BarChart3, Sliders, UserCheck, Users, 
  PieChart, Activity, Edit3, Rocket, Filter, Check, Database
} from 'lucide-react';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzMjWhJeFcAfKqdTT4aDENa2Pfp7gnIhVQ_rGQPPMh6UYuXle50niV3Tym-vgC_37RnTg/exec";

// Pre-populated Master Projects (Always available even before sheet sync)
const DEFAULT_PROJECTS = [
  { Project_ID: "PRJ-DEXTER", Project_Name: "Dexter Box Science Kits", Priority_Level: "P1 Critical", Status: "Active" },
  { Project_ID: "PRJ-MAKER", Project_Name: "Maker Lab & School Studios", Priority_Level: "P1 Critical", Status: "Active" },
  { Project_ID: "PRJ-ATL", Project_Name: "Atal Tinkering Labs (ATL)", Priority_Level: "P1 Critical", Status: "Active" },
  { Project_ID: "PRJ-CSR", Project_Name: "CSR & NGO Partnerships", Priority_Level: "P2 High", Status: "Active" },
  { Project_ID: "PRJ-STEP", Project_Name: "Teacher Training & Workshops (STEP)", Priority_Level: "P2 High", Status: "Active" },
  { Project_ID: "PRJ-ADMIN", Project_Name: "Office Admin, HR & Internal Ops", Priority_Level: "P3 Supporting", Status: "Active" }
];

// Pre-populated Categorized Task Codes
const DEFAULT_TASKS = [
  // Bucket 1: BD & Client Proposals
  { Task_Code: "TSK-PROP", Task_Title: "Concept Notes, Proposals & Estimates", Category: "BD & Client Proposals" },
  { Task_Code: "TSK-DECK", Task_Title: "Client Pitch Decks & Presentations", Category: "BD & Client Proposals" },
  { Task_Code: "TSK-FOLLOW", Task_Title: "Client Mailing, Follow-ups & Coordination", Category: "BD & Client Proposals" },
  { Task_Code: "TSK-MEET", Task_Title: "Client Meetings, School Visits & Demos", Category: "BD & Client Proposals" },
  // Bucket 2: R&D & Product Engineering
  { Task_Code: "TSK-RND", Task_Title: "Product R&D, Prototyping & Experiments", Category: "R&D & Product Engineering" },
  { Task_Code: "TSK-BOM", Task_Title: "Bill of Materials (BOM), Sourcing & Costing", Category: "R&D & Product Engineering" },
  { Task_Code: "TSK-CURR", Task_Title: "Curriculum Mapping, Manuals & Lesson Plans", Category: "R&D & Product Engineering" },
  // Bucket 3: Design & Digital Media
  { Task_Code: "TSK-DES-PROD", Task_Title: "Product & Packaging Design (Boxes/Manuals)", Category: "Design & Digital Media" },
  { Task_Code: "TSK-DES-MKT", Task_Title: "Marketing Collaterals & Social Media Posters", Category: "Design & Digital Media" },
  { Task_Code: "TSK-DES-EVT", Task_Title: "Event, Expo & Workshop Signage/Backdrops", Category: "Design & Digital Media" },
  { Task_Code: "TSK-VIDEO", Task_Title: "Video Scripting, Shooting & Editing", Category: "Design & Digital Media" },
  // Bucket 4: Training & Field Execution
  { Task_Code: "TSK-TRN-STU", Task_Title: "Student Classroom Facilitation & Sessions", Category: "Training & Field Execution" },
  { Task_Code: "TSK-TRN-TCH", Task_Title: "Teacher Training Workshops & Mentorship", Category: "Training & Field Execution" },
  { Task_Code: "TSK-EXPO", Task_Title: "School Expo, Science Mela & Event Support", Category: "Training & Field Execution" },
  // Bucket 5: Operations & Supply Chain
  { Task_Code: "TSK-KIT-OPS", Task_Title: "Kit Assembly, QC, Packing & Dispatch", Category: "Operations & Supply Chain" },
  { Task_Code: "TSK-LAB-AUD", Task_Title: "School Lab Setup, Audit & Maintenance", Category: "Operations & Supply Chain" },
  // Bucket 6: HR, Finance & Office Admin
  { Task_Code: "TSK-FIN", Task_Title: "Salary Processing, Invoicing & Accounts", Category: "HR, Finance & Office Admin" },
  { Task_Code: "TSK-HR-ADM", Task_Title: "HR, Scheduling & General Office Admin", Category: "HR, Finance & Office Admin" }
];

// Pre-populated Deliberate Learning Modules
const DEFAULT_LEARNING = [
  { Module_Code: "LRN-HARD-01", Domain: "STEM Hardware", Topic_Title: "Microcontrollers, Sensors & Electronics", Target_Proficiency: "Advanced" },
  { Module_Code: "LRN-CAD-01", Domain: "Design & Prototyping", Topic_Title: "3D CAD Modeling, Laser Cutting & 3D Printing", Target_Proficiency: "Intermediate" },
  { Module_Code: "LRN-PED-01", Domain: "Pedagogy & Classroom", Topic_Title: "Experiential STEM Facilitation & Constructionism", Target_Proficiency: "Advanced" },
  { Module_Code: "LRN-MED-01", Domain: "AI & Digital Media", Topic_Title: "Educational Video Production & Storytelling", Target_Proficiency: "Intermediate" },
  { Module_Code: "LRN-OPS-01", Domain: "Finance & Growth", Topic_Title: "B2B School Sales, Proposals & Operations", Target_Proficiency: "Intermediate" }
];

function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentMondayStr() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  const year = mon.getFullYear();
  const month = String(mon.getMonth() + 1).padStart(2, '0');
  const dt = String(mon.getDate()).padStart(2, '0');
  return `${year}-${month}-${dt}`;
}

function normalizeDateStr(val) {
  if (!val) return "";
  const str = String(val);
  if (str.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return str;
}

// Merge sheet data with localStorage cache so page refreshes never lose newly added items
function mergeById(remoteArr, localArr, idKey) {
  const map = new Map();
  (remoteArr || []).forEach(item => {
    if (item && item[idKey]) map.set(item[idKey], item);
  });
  (localArr || []).forEach(item => {
    if (item && item[idKey] && !map.has(item[idKey])) {
      map.set(item[idKey], item);
    }
  });
  return Array.from(map.values());
}

// True Unique-Day Streak Calculation (Multiple logs on the same day = 1 Day)
function calculateUniqueDayStreak(userLogs) {
  if (!userLogs || userLogs.length === 0) return 0;
  const uniqueDates = Array.from(
    new Set(userLogs.map(l => normalizeDateStr(l.Date)).filter(Boolean))
  ).sort().reverse();
  
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
    if (diffDays === 1) {
      streak++;
      curr = prev;
    } else if (diffDays > 1) {
      break;
    }
  }
  return streak;
}

export default function App() {
  const [viewRole, setViewRole] = useState("company"); // 'company' | 'employee'
  const [activeEmployeeEmail, setActiveEmployeeEmail] = useState(() => localStorage.getItem("ie_v3_active_emp") || "");
  const [companyTab, setCompanyTab] = useState("workload"); // 'workload' | 'analytics' | 'live' | 'catalog' | 'team'
  const [employeeTab, setEmployeeTab] = useState("workboard"); // 'workboard' | 'learning' | 'rnr' | 'levels'

  // Persistent State Initialized from Local Cache + Default Catalogs
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem("ie_v3_employees");
    return saved ? JSON.parse(saved) : [];
  });
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem("ie_v3_projects");
    return saved ? mergeById(JSON.parse(saved), DEFAULT_PROJECTS, "Project_ID") : DEFAULT_PROJECTS;
  });
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("ie_v3_tasks");
    return saved ? mergeById(JSON.parse(saved), DEFAULT_TASKS, "Task_Code") : DEFAULT_TASKS;
  });
  const [learningModules, setLearningModules] = useState(() => {
    const saved = localStorage.getItem("ie_v3_learning");
    return saved ? mergeById(JSON.parse(saved), DEFAULT_LEARNING, "Module_Code") : DEFAULT_LEARNING;
  });
  const [weeklyPulses, setWeeklyPulses] = useState(() => {
    const saved = localStorage.getItem("ie_v3_pulses");
    return saved ? JSON.parse(saved) : [];
  });
  const [dailyLogs, setDailyLogs] = useState(() => {
    const saved = localStorage.getItem("ie_v3_logs");
    return saved ? JSON.parse(saved) : [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters
  const [selectedCompanyEmp, setSelectedCompanyEmp] = useState("ALL");
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState("WEEK"); // 'WEEK' | 'MONTH' | 'ALL'
  const [personalFocusTimeframe, setPersonalFocusTimeframe] = useState("WEEK"); // 'WEEK' | 'MONTH'
  const [workboardSearch, setWorkboardSearch] = useState("");

  // Modals
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [showPrjModal, setShowPrjModal] = useState(false);
  const [showTskModal, setShowTskModal] = useState(false);
  const [showLrnModal, setShowLrnModal] = useState(false);
  const [showStandaloneLearning, setShowStandaloneLearning] = useState(false);

  // Editing Catalog Item States
  const [editingProject, setEditingProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // In-Card Logging Modal State
  const [activeLoggingItem, setActiveLoggingItem] = useState(null);
  const [sessionSliderHours, setSessionSliderHours] = useState(1);
  const [sessionSliderMins, setSessionSliderMins] = useState(30);
  const [sessionProgress, setSessionProgress] = useState(50);
  const [sessionLearningModule, setSessionLearningModule] = useState("None");
  const [sessionLearningMins, setSessionLearningMins] = useState(30);
  const [sessionNotes, setSessionNotes] = useState("");
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);

  // Standalone Learning Modal State
  const [standaloneModule, setStandaloneModule] = useState("LRN-HARD-01");
  const [standaloneHours, setStandaloneHours] = useState(0);
  const [standaloneMins, setStandaloneMins] = useState(45);
  const [standaloneNotes, setStandaloneNotes] = useState("");
  const [isSubmittingStandalone, setIsSubmittingStandalone] = useState(false);

  // Multi-Row Quick Stack Task Builder State
  const todayStr = getTodayStr();
  const currentMondayStr = getCurrentMondayStr();

  const [draftRows, setDraftRows] = useState([
    { id: 1, projectId: "PRJ-MAKER", category: "Training & Field Execution", taskCode: "TSK-EXPO", title: "", deadline: todayStr }
  ]);
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [isAddingBatch, setIsAddingBatch] = useState(false);

  // Inline Editable R&R State
  const [isEditingRnR, setIsEditingRnR] = useState(false);
  const [rnrDraft, setRnrDraft] = useState("");
  const [isSavingRnR, setIsSavingRnR] = useState(false);

  // Master Creation Forms
  const [newEmp, setNewEmp] = useState({ name: "", email: "", roleTitle: "", department: "Training & Delivery", level: "L3 Advanced", rnrSummary: "" });
  const [newPrj, setNewPrj] = useState({ projectId: "", projectName: "", priority: "P1 Critical" });
  const [newTsk, setNewTsk] = useState({ taskCode: "", taskTitle: "", category: "BD & Client Proposals", customCategory: "" });
  const [newLrn, setNewLrn] = useState({ moduleCode: "", domain: "STEM Hardware", topicTitle: "", targetProficiency: "Intermediate" });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Save state to localStorage automatically whenever updated
  useEffect(() => { localStorage.setItem("ie_v3_employees", JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem("ie_v3_projects", JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem("ie_v3_tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("ie_v3_learning", JSON.stringify(learningModules)); }, [learningModules]);
  useEffect(() => { localStorage.setItem("ie_v3_pulses", JSON.stringify(weeklyPulses)); }, [weeklyPulses]);
  useEffect(() => { localStorage.setItem("ie_v3_logs", JSON.stringify(dailyLogs)); }, [dailyLogs]);
  useEffect(() => { if (activeEmployeeEmail) localStorage.setItem("ie_v3_active_emp", activeEmployeeEmail); }, [activeEmployeeEmail]);

  const fetchSheetData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getBootstrapData`);
      const data = await res.json();
      if (data.status === "success") {
        if (data.employees?.length > 0) {
          setEmployees(prev => mergeById(data.employees, prev, "Email"));
          if (!activeEmployeeEmail) {
            setActiveEmployeeEmail(data.employees[0].Email);
            setSelectedCollaborators([data.employees[0].Email]);
          }
        }
        setProjects(prev => mergeById(data.projects || [], prev, "Project_ID"));
        setTasks(prev => mergeById(data.tasks || [], prev, "Task_Code"));
        setLearningModules(prev => mergeById(data.learningModules || [], prev, "Module_Code"));

        if (data.weeklyPulses) {
          setWeeklyPulses(prev => {
            const remoteMap = new Map();
            data.weeklyPulses.forEach(p => remoteMap.set(p.Pulse_ID, p));
            // Keep any local optimistic tasks not yet reflected in remote sheet
            prev.forEach(localP => {
              if (!remoteMap.has(localP.Pulse_ID)) {
                remoteMap.set(localP.Pulse_ID, localP);
              }
            });
            return Array.from(remoteMap.values());
          });
        }
        if (data.dailyLogs) {
          setDailyLogs(prev => mergeById(data.dailyLogs, prev, "Log_ID"));
        }
      }
    } catch (err) {
      console.log("Sheet sync notice (using local cache):", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetData();
  }, []);

  // Ensure active employee is in collaborator list by default when switching profiles
  useEffect(() => {
    if (activeEmployeeEmail && selectedCollaborators.length === 0) {
      setSelectedCollaborators([activeEmployeeEmail]);
    }
  }, [activeEmployeeEmail]);

  // Distinct Task Categories for Cascading Dropdowns
  const taskCategories = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.Category || "General")));
  }, [tasks]);

  const currentEmp = employees.find(e => (e.Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase()) || {
    Name: "Team Member",
    Email: activeEmployeeEmail || "",
    Role_Title: "Onboard in Company View",
    Department: "Infinite Engineers",
    Level: "L4 Strategic",
    "R&R_Summary": "Click 'Edit R&R' to define your North Star metric and core KRAs."
  };

  useEffect(() => {
    setRnrDraft(currentEmp["R&R_Summary"] || "");
  }, [currentEmp]);

  const empDailyLogs = useMemo(() => {
    return dailyLogs.filter(l => (l.Emp_Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase());
  }, [dailyLogs, activeEmployeeEmail]);

  const currentStreak = useMemo(() => calculateUniqueDayStreak(empDailyLogs), [empDailyLogs]);

  // Persistent Workboard for Active Employee:
  // Keeps ALL unfinished tasks (<100%) regardless of creation week + tasks completed during the current Mon-Sat cycle
  const currentWorkboard = useMemo(() => {
    return weeklyPulses.filter(p => {
      const isMine = (p.Emp_Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase();
      if (!isMine) return false;

      if (workboardSearch.trim() !== "") {
        const q = workboardSearch.toLowerCase();
        const matchTitle = (p.Monday_Commitment || "").toLowerCase().includes(q);
        const matchPrj = (p.Project_ID || "").toLowerCase().includes(q);
        const matchTsk = (p.Task_Code || "").toLowerCase().includes(q);
        if (!matchTitle && !matchPrj && !matchTsk) return false;
      }

      const prog = Number(p.Auto_Task_Hours || 0);
      const isUnfinished = prog < 100;
      const compDate = normalizeDateStr(p.Completed_Date);
      const createdDate = normalizeDateStr(p.Created_Date || p.Week_Start_Date);
      const finishedThisWeek = prog >= 100 && (compDate >= currentMondayStr || createdDate >= currentMondayStr);

      return isUnfinished || finishedThisWeek;
    });
  }, [weeklyPulses, activeEmployeeEmail, currentMondayStr, workboardSearch]);

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

  // ================= PERSONAL FOCUS VISUALIZER (NO 40H/48H QUOTA PRESSURE) =================
  const personalFocusData = useMemo(() => {
    const currentMonthPrefix = todayStr.slice(0, 7);
    const filtered = empDailyLogs.filter(l => {
      const d = normalizeDateStr(l.Date);
      if (personalFocusTimeframe === "WEEK") return d >= currentMondayStr;
      return d.startsWith(currentMonthPrefix);
    });

    let projectMins = 0;
    let learningMins = 0;
    const byProject = {};
    const byTask = {};

    filtered.forEach(l => {
      const rawTask = Number(l.Task_Hours || 0);
      const tMins = rawTask > 24 ? rawTask : Math.round(rawTask * 60);
      const rawLrn = Number(l.Learning_Hours || 0);
      const lMins = rawLrn > 24 ? rawLrn : Math.round(rawLrn * 60);

      projectMins += tMins;
      learningMins += lMins;

      if (tMins > 0) {
        const pKey = l.Project_ID || "GENERAL";
        byProject[pKey] = (byProject[pKey] || 0) + tMins;

        const tKey = l.Task_Code || "GENERAL";
        byTask[tKey] = (byTask[tKey] || 0) + tMins;
      }
      if (lMins > 0) {
        byProject["DELIBERATE LEARNING"] = (byProject["DELIBERATE LEARNING"] || 0) + lMins;
      }
    });

    const totalCombinedMins = projectMins + learningMins;

    const projectBars = Object.entries(byProject).map(([key, mins]) => {
      const prjObj = projects.find(p => p.Project_ID === key);
      return {
        code: key,
        name: prjObj ? prjObj.Project_Name : key,
        minutes: mins,
        hours: (mins / 60).toFixed(1),
        percent: totalCombinedMins > 0 ? Math.round((mins / totalCombinedMins) * 100) : 0
      };
    }).sort((a, b) => b.minutes - a.minutes);

    const taskBars = Object.entries(byTask).map(([key, mins]) => {
      const tskObj = tasks.find(t => t.Task_Code === key);
      return {
        code: key,
        name: tskObj ? tskObj.Task_Title : key,
        minutes: mins,
        hours: (mins / 60).toFixed(1),
        percent: projectMins > 0 ? Math.round((mins / projectMins) * 100) : 0
      };
    }).sort((a, b) => b.minutes - a.minutes);

    return {
      totalCombinedMins,
      totalCombinedHours: (totalCombinedMins / 60).toFixed(1),
      projectMins,
      projectHours: (projectMins / 60).toFixed(1),
      learningMins,
      learningHours: (learningMins / 60).toFixed(1),
      projectBars,
      taskBars
    };
  }, [empDailyLogs, personalFocusTimeframe, currentMondayStr, todayStr, projects, tasks]);

  // ================= COLLECTIVE LAUNCH ORBIT (GOAL POINTS) =================
  const collectiveOrbit = useMemo(() => {
    let totalTaskMins = 0;
    let totalLrnMins = 0;
    dailyLogs.forEach(l => {
      const rt = Number(l.Task_Hours || 0);
      totalTaskMins += (rt > 24 ? rt : Math.round(rt * 60));
      const rl = Number(l.Learning_Hours || 0);
      totalLrnMins += (rl > 24 ? rl : Math.round(rl * 60));
    });

    let completedTasks = 0;
    let onTimeBonuses = 0;
    weeklyPulses.forEach(p => {
      if (Number(p.Auto_Task_Hours || 0) >= 100) {
        completedTasks++;
        const compD = normalizeDateStr(p.Completed_Date);
        const deadD = normalizeDateStr(p.Target_Deadline);
        if (compD && deadD && compD <= deadD) {
          onTimeBonuses++;
        }
      }
    });

    const pooledPoints = Math.round((totalTaskMins / 15) * 5) + Math.round((totalLrnMins / 30) * 15) + (completedTasks * 50) + (onTimeBonuses * 25);
    const targetOrbitPoints = 2500;
    const progressPercent = Math.min(100, Math.round((pooledPoints / targetOrbitPoints) * 100));

    let currentTier = "Tier 1: Lab Ignition";
    if (pooledPoints >= 1500) currentTier = "Tier 3: Orbit Launch";
    else if (pooledPoints >= 500) currentTier = "Tier 2: School Delivery Cruise";

    return { pooledPoints, targetOrbitPoints, progressPercent, completedTasks, totalLrnMins, currentTier };
  }, [dailyLogs, weeklyPulses]);

  // ================= COMPANY VIEW AGGREGATIONS =================
  const filteredAnalyticsLogs = useMemo(() => {
    const currentMonthPrefix = todayStr.slice(0, 7);
    return dailyLogs.filter(log => {
      if (selectedCompanyEmp !== "ALL" && (log.Emp_Email || "").toLowerCase() !== selectedCompanyEmp.toLowerCase()) {
        return false;
      }
      const d = normalizeDateStr(log.Date);
      if (analyticsTimeframe === "WEEK") return d >= currentMondayStr;
      if (analyticsTimeframe === "MONTH") return d.startsWith(currentMonthPrefix);
      return true;
    });
  }, [dailyLogs, selectedCompanyEmp, analyticsTimeframe, currentMondayStr, todayStr]);

  const companyProjectBreakdown = useMemo(() => {
    const map = {};
    let grandTotalMins = 0;
    filteredAnalyticsLogs.forEach(log => {
      const p = log.Project_ID || "UNASSIGNED";
      const val = Number(log.Task_Hours || 0);
      const mins = val > 24 ? val : Math.round(val * 60);
      if (mins > 0) {
        map[p] = (map[p] || 0) + mins;
        grandTotalMins += mins;
      }
    });
    return Object.entries(map).map(([projectId, mins]) => {
      const pObj = projects.find(pr => pr.Project_ID === projectId);
      return {
        projectId,
        projectName: pObj ? pObj.Project_Name : projectId,
        hours: (mins / 60).toFixed(1),
        minutes: mins,
        percentage: grandTotalMins > 0 ? Math.round((mins / grandTotalMins) * 100) : 0
      };
    }).sort((a, b) => b.minutes - a.minutes);
  }, [filteredAnalyticsLogs, projects]);

  const companyTaskBreakdown = useMemo(() => {
    const map = {};
    let grandTotalMins = 0;
    filteredAnalyticsLogs.forEach(log => {
      const t = log.Task_Code || "GENERAL";
      const val = Number(log.Task_Hours || 0);
      const mins = val > 24 ? val : Math.round(val * 60);
      if (mins > 0) {
        map[t] = (map[t] || 0) + mins;
        grandTotalMins += mins;
      }
    });
    return Object.entries(map).map(([taskCode, mins]) => {
      const tObj = tasks.find(ts => ts.Task_Code === taskCode);
      return {
        taskCode,
        taskTitle: tObj ? tObj.Task_Title : taskCode,
        category: tObj ? tObj.Category : "General",
        hours: (mins / 60).toFixed(1),
        minutes: mins,
        percentage: grandTotalMins > 0 ? Math.round((mins / grandTotalMins) * 100) : 0
      };
    }).sort((a, b) => b.minutes - a.minutes);
  }, [filteredAnalyticsLogs, tasks]);

  const employeeWorkloadBuckets = useMemo(() => {
    return employees.map(emp => {
      const empEmail = (emp.Email || "").toLowerCase();
      const empPulses = weeklyPulses.filter(p => (p.Emp_Email || "").toLowerCase() === empEmail);
      const activeTasks = empPulses.filter(p => Number(p.Auto_Task_Hours || 0) < 100);
      const doneTasks = empPulses.filter(p => Number(p.Auto_Task_Hours || 0) >= 100);

      // Weekly logged minutes for this employee
      const empWeekLogs = dailyLogs.filter(l => (l.Emp_Email || "").toLowerCase() === empEmail && normalizeDateStr(l.Date) >= currentMondayStr);
      const weekMins = empWeekLogs.reduce((sum, l) => {
        const vt = Number(l.Task_Hours || 0);
        const vl = Number(l.Learning_Hours || 0);
        return sum + (vt > 24 ? vt : Math.round(vt * 60)) + (vl > 24 ? vl : Math.round(vl * 60));
      }, 0);

      const todayLogs = dailyLogs.filter(l => (l.Emp_Email || "").toLowerCase() === empEmail && normalizeDateStr(l.Date) === todayStr);

      return {
        ...emp,
        activeCount: activeTasks.length,
        doneCount: doneTasks.length,
        weekLoggedHours: (weekMins / 60).toFixed(1),
        activeTasksList: activeTasks,
        doneTasksList: doneTasks.slice(-3),
        todayLogsCount: todayLogs.length,
        lastActiveProject: todayLogs.length > 0 ? todayLogs[todayLogs.length - 1].Project_ID : (activeTasks.length > 0 ? activeTasks[0].Project_ID : "Ready"),
        lastActiveTask: todayLogs.length > 0 ? todayLogs[todayLogs.length - 1].Task_Code : (activeTasks.length > 0 ? activeTasks[0].Task_Code : " Standby")
      };
    });
  }, [employees, weeklyPulses, dailyLogs, currentMondayStr, todayStr]);

  const todayLiveLogs = useMemo(() => {
    return dailyLogs.filter(l => normalizeDateStr(l.Date) === todayStr).slice().reverse();
  }, [dailyLogs, todayStr]);

  // ================= ACTION HANDLERS =================

  // Multi-Row Quick Stack Handlers
  const handleAddDraftRow = () => {
    setDraftRows(prev => [
      ...prev,
      { id: Date.now() + Math.random(), projectId: projects[0]?.Project_ID || "PRJ-MAKER", category: taskCategories[0] || "BD & Client Proposals", taskCode: tasks[0]?.Task_Code || "TSK-PROP", title: "", deadline: todayStr }
    ]);
  };

  const handleRemoveDraftRow = (id) => {
    if (draftRows.length <= 1) return;
    setDraftRows(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateDraftRow = (id, field, value) => {
    setDraftRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      if (field === "category") {
        const firstTaskInCat = tasks.find(t => t.Category === value);
        return { ...row, category: value, taskCode: firstTaskInCat ? firstTaskInCat.Task_Code : row.taskCode };
      }
      return { ...row, [field]: value };
    }));
  };

  // Submit Multi-Row & Multi-Collaborator Batch to Bucket
  const handleCommitBatchToBucket = async (e) => {
    e.preventDefault();
    const validRows = draftRows.filter(r => r.title.trim() !== "");
    if (validRows.length === 0) {
      showToast("Please enter a deliverable description for at least one row.");
      return;
    }

    setIsAddingBatch(true);
    const assignees = selectedCollaborators.length > 0 ? selectedCollaborators : [activeEmployeeEmail];
    const originTag = viewRole === "company" ? "Company Lead" : "Self";
    const collabString = assignees.join(", ");

    const createdItems = [];
    validRows.forEach(row => {
      assignees.forEach(email => {
        createdItems.push({
          Pulse_ID: "TSK-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
          Created_Date: todayStr,
          Emp_Email: email.toLowerCase().trim(),
          Project_ID: row.projectId,
          Task_Code: row.taskCode,
          Monday_Commitment: row.title.trim(),
          Auto_Task_Hours: 0,
          Auto_Learning_Hours: 0,
          Friday_Outcome: originTag,
          Status: "In Progress",
          Target_Deadline: row.deadline || todayStr,
          Completed_Date: "",
          Collaborators: collabString
        });
      });
    });

    setWeeklyPulses(prev => [...prev, ...createdItems]);
    setDraftRows([{ id: Date.now(), projectId: projects[0]?.Project_ID || "PRJ-MAKER", category: taskCategories[0] || "BD & Client Proposals", taskCode: tasks[0]?.Task_Code || "TSK-PROP", title: "", deadline: todayStr }]);
    showToast(`Committed ${validRows.length} deliverable(s) across ${assignees.length} member bucket(s)!`);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "addWorkboardBatch", items: createdItems })
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsAddingBatch(false);
    }
  };

  // Direct In-Card Session Logging
  const handleOpenLogModal = (item) => {
    setActiveLoggingItem(item);
    setSessionProgress(Number(item.Auto_Task_Hours || 0));
    setSessionSliderHours(1);
    setSessionSliderMins(30);
    setSessionLearningModule("None");
    setSessionLearningMins(30);
    setSessionNotes("");
  };

  const handleSaveTaskSession = async (e) => {
    e.preventDefault();
    if (!activeLoggingItem) return;
    setIsSubmittingSession(true);

    const sessionMinutes = (sessionSliderHours * 60) + sessionSliderMins;
    const lrnMins = sessionLearningModule !== "None" ? Number(sessionLearningMins) : 0;

    setWeeklyPulses(prev => prev.map(p => {
      if (p.Pulse_ID === activeLoggingItem.Pulse_ID) {
        return {
          ...p,
          Auto_Task_Hours: sessionProgress,
          Auto_Learning_Hours: Number(p.Auto_Learning_Hours || 0) + sessionMinutes,
          Status: sessionProgress >= 100 ? "Completed" : "In Progress",
          Completed_Date: sessionProgress >= 100 ? todayStr : ""
        };
      }
      return p;
    }));

    const newLog = {
      Log_ID: "LOG-" + Date.now(),
      Date: todayStr,
      Emp_Email: activeEmployeeEmail,
      Project_ID: activeLoggingItem.Project_ID,
      Task_Code: activeLoggingItem.Task_Code,
      Task_Hours: sessionMinutes,
      Learning_Module_Code: sessionLearningModule,
      Learning_Hours: lrnMins,
      Status: sessionProgress >= 100 ? "Done" : "In Progress",
      Streak_Count: currentStreak || 1,
      Notes: sessionNotes
    };

    setDailyLogs(prev => [...prev, newLog]);
    showToast(`🚀 Logged ${sessionMinutes}m on "${activeLoggingItem.Monday_Commitment}"! (+Goal Points)`);
    setActiveLoggingItem(null);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "logTaskSession",
          pulseId: activeLoggingItem.Pulse_ID,
          email: activeEmployeeEmail,
          projectId: activeLoggingItem.Project_ID,
          taskCode: activeLoggingItem.Task_Code,
          taskMinutes: sessionMinutes,
          learningModuleCode: sessionLearningModule,
          learningMinutes: lrnMins,
          progressPercent: sessionProgress,
          currentStreak: currentStreak || 1,
          status: sessionProgress >= 100 ? "Done" : "In Progress",
          notes: sessionNotes
        })
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsSubmittingSession(false);
    }
  };

  // Standalone Learning Log
  const handleSaveStandaloneLearning = async (e) => {
    e.preventDefault();
    const totalMins = (Number(standaloneHours) * 60) + Number(standaloneMins);
    if (totalMins === 0) {
      showToast("Please select a duration greater than 0 mins.");
      return;
    }
    setIsSubmittingStandalone(true);

    const newLog = {
      Log_ID: "LRN-" + Date.now(),
      Date: todayStr,
      Emp_Email: activeEmployeeEmail,
      Project_ID: "UPSKILLING",
      Task_Code: "TSK-LRN",
      Task_Hours: 0,
      Learning_Module_Code: standaloneModule,
      Learning_Hours: totalMins,
      Status: "Done",
      Streak_Count: currentStreak || 1,
      Notes: standaloneNotes || "Deliberate upskilling session"
    };

    setDailyLogs(prev => [...prev, newLog]);
    showToast(`🎓 Logged ${totalMins}m of deliberate learning! (+Goal Points)`);
    setShowStandaloneLearning(false);
    setStandaloneNotes("");

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "logStandaloneLearning",
          email: activeEmployeeEmail,
          learningModuleCode: standaloneModule,
          learningMinutes: totalMins,
          currentStreak: currentStreak || 1,
          notes: standaloneNotes
        })
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsSubmittingStandalone(false);
    }
  };

  // Save Inline Edited R&R
  const handleSaveRnR = async () => {
    setIsSavingRnR(true);
    setEmployees(prev => prev.map(e => {
      if ((e.Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase()) {
        return { ...e, "R&R_Summary": rnrDraft };
      }
      return e;
    }));
    showToast("Roles & Responsibilities saved!");
    setIsEditingRnR(false);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "updateEmployeeRnR", email: activeEmployeeEmail, rnrSummary: rnrDraft })
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsSavingRnR(false);
    }
  };

  // Sync Pre-Populated Default Catalog to Google Sheet
  const handleSeedCatalogToSheet = async () => {
    showToast("Seeding master Projects, Task Categories & Learning Modules to Google Sheet...");
    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "seedDefaultCatalog",
          projects: projects,
          tasks: tasks,
          learningModules: learningModules
        })
      });
    } catch (err) {
      console.log(err);
    }
  };

  // Save Inline Edited Project or Task in Catalog Tab
  const handleSaveEditedProject = (p) => {
    setProjects(prev => prev.map(item => item.Project_ID === p.Project_ID ? p : item));
    setEditingProject(null);
    showToast(`Updated project ${p.Project_ID}`);
    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "updateProject", projectId: p.Project_ID, projectName: p.Project_Name, priority: p.Priority_Level })
      });
    } catch (err) {}
  };

  const handleSaveEditedTask = (t) => {
    setTasks(prev => prev.map(item => item.Task_Code === t.Task_Code ? t : item));
    setEditingTask(null);
    showToast(`Updated task ${t.Task_Code}`);
    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "updateTask", taskCode: t.Task_Code, taskTitle: t.Task_Title, category: t.Category })
      });
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                IE Goal Tracker
              </span>
              <span className="text-xs text-slate-400 block">Infinite Engineers • Shared Mission & Focus OS</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={fetchSheetData} title="Sync with Google Sheet" className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            <div className="flex items-center gap-2 bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
              <button 
                onClick={() => setViewRole("company")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${viewRole === "company" ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-600/30" : "text-slate-400 hover:text-white"}`}
              >
                <Building2 className="h-3.5 w-3.5" /> Company View
              </button>

              <button 
                onClick={() => setViewRole("employee")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${viewRole === "employee" ? "bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-white"}`}
              >
                Employee Cockpit
              </button>

              {employees.length > 0 && (
                <select
                  value={activeEmployeeEmail}
                  onChange={(e) => {
                    setActiveEmployeeEmail(e.target.value);
                    setSelectedCollaborators([e.target.value]);
                  }}
                  className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg focus:outline-none"
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

      {/* Collective Company Launch Orbit Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-indigo-500/20 py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <Rocket className="h-4 w-4 text-indigo-400 animate-bounce" />
            <span className="font-semibold text-white">Company Mission Orbit:</span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold">
              {collectiveOrbit.pooledPoints} / {collectiveOrbit.targetOrbitPoints} Goal Points
            </span>
            <span className="text-emerald-400 font-medium">{collectiveOrbit.currentTier}</span>
            <span className="text-slate-400 hidden md:inline">
              • {collectiveOrbit.completedTasks} deliverables shipped • {(collectiveOrbit.totalLrnMins / 60).toFixed(1)}h team learning
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-48 bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full transition-all duration-500" 
                style={{ width: `${collectiveOrbit.progressPercent}%` }} 
              />
            </div>
            <span className="font-mono text-emerald-400 font-bold">{collectiveOrbit.progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="max-w-md mx-auto mt-4 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-sm flex items-center gap-2 shadow-lg">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {viewRole === "company" ? (
          /* ================= COMPANY VIEW ================= */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Company View & Collaborative Hub</h1>
                <p className="text-sm text-slate-400">Transparent team buckets, shared project momentum, and customizable task catalogs</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setShowPrjModal(true)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5">
                  <FolderPlus className="h-3.5 w-3.5 text-blue-400" /> + Project
                </button>
                <button onClick={() => setShowTskModal(true)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5">
                  <ListPlus className="h-3.5 w-3.5 text-emerald-400" /> + Task / Category
                </button>
                <button onClick={() => setShowLrnModal(true)} className="px-3 py-2 bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 rounded-xl text-xs font-medium border border-purple-700 flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-purple-400" /> + Learning Module
                </button>
                <button onClick={() => setShowEmpModal(true)} className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-blue-600/20">
                  <UserPlus className="h-3.5 w-3.5" /> + Onboard Member
                </button>
              </div>
            </div>

            {/* Company Navigation Tabs */}
            <div className="flex border-b border-slate-800 text-sm gap-6 overflow-x-auto">
              <button onClick={() => setCompanyTab("workload")} className={`pb-3 font-medium transition flex items-center gap-1.5 shrink-0 ${companyTab === "workload" ? "text-blue-400 border-b-2 border-blue-500" : "text-slate-400 hover:text-white"}`}>
                <Users className="h-4 w-4" /> Team Buckets & Dispatch
              </button>
              <button onClick={() => setCompanyTab("analytics")} className={`pb-3 font-medium transition flex items-center gap-1.5 shrink-0 ${companyTab === "analytics" ? "text-indigo-400 border-b-2 border-indigo-500" : "text-slate-400 hover:text-white"}`}>
                <PieChart className="h-4 w-4" /> Cumulative Project & Task Analytics
              </button>
              <button onClick={() => setCompanyTab("live")} className={`pb-3 font-medium transition flex items-center gap-1.5 shrink-0 ${companyTab === "live" ? "text-emerald-400 border-b-2 border-emerald-500" : "text-slate-400 hover:text-white"}`}>
                <Activity className="h-4 w-4" /> Today's Live Stream ({todayLiveLogs.length})
              </button>
              <button onClick={() => setCompanyTab("catalog")} className={`pb-3 font-medium transition flex items-center gap-1.5 shrink-0 ${companyTab === "catalog" ? "text-amber-400 border-b-2 border-amber-500" : "text-slate-400 hover:text-white"}`}>
                <LayoutGrid className="h-4 w-4" /> Editable Catalog Manager
              </button>
              <button onClick={() => setCompanyTab("team")} className={`pb-3 font-medium transition flex items-center gap-1.5 shrink-0 ${companyTab === "team" ? "text-purple-400 border-b-2 border-purple-500" : "text-slate-400 hover:text-white"}`}>
                <BookOpen className="h-4 w-4" /> Team Directory & R&R
              </button>
            </div>

            {/* TAB 1: TEAM BUCKETS & MULTI-ROW COLLABORATIVE DISPATCH */}
            {companyTab === "workload" && (
              <div className="space-y-6">
                {/* Multi-Row Collaborative Task Dispatcher */}
                <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-indigo-400" /> Dispatch / Stack Collaborative Tasks to Team Buckets
                      </h3>
                      <span className="text-xs text-slate-400">
                        Select one or multiple teammates below — each selected member receives a linked card in their bucket to log their own hours.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddDraftRow}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1 shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" /> + Add Another Row
                    </button>
                  </div>

                  <form onSubmit={handleCommitBatchToBucket} className="space-y-3">
                    {draftRows.map((row) => {
                      const filteredTasks = tasks.filter(t => t.Category === row.category);
                      return (
                        <div key={row.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800 items-end">
                          <div className="sm:col-span-2">
                            <label className="text-[11px] text-slate-400 block mb-1">1. Project Pillar</label>
                            <select value={row.projectId} onChange={e => handleUpdateDraftRow(row.id, "projectId", e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
                              {projects.map(p => <option key={p.Project_ID} value={p.Project_ID}>{p.Project_Name}</option>)}
                            </select>
                          </div>
                          <div className="sm:col-span-3">
                            <label className="text-[11px] text-slate-400 block mb-1">2. Category Bucket</label>
                            <select value={row.category} onChange={e => handleUpdateDraftRow(row.id, "category", e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
                              {taskCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[11px] text-slate-400 block mb-1">3. Specific Task</label>
                            <select value={row.taskCode} onChange={e => handleUpdateDraftRow(row.id, "taskCode", e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
                              {(filteredTasks.length > 0 ? filteredTasks : tasks).map(t => (
                                <option key={t.Task_Code} value={t.Task_Code}>[{t.Task_Code}] {t.Task_Title}</option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-3">
                            <label className="text-[11px] text-slate-400 block mb-1">4. Deliverable / School / Client Context</label>
                            <input
                              type="text"
                              required
                              value={row.title}
                              onChange={e => handleUpdateDraftRow(row.id, "title", e.target.value)}
                              placeholder="e.g. AMT School Expo booth & student mentoring"
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                            />
                          </div>
                          <div className="sm:col-span-2 flex items-center gap-1.5">
                            <div className="flex-1">
                              <label className="text-[11px] text-slate-400 block mb-1">5. Target Date</label>
                              <input
                                type="date"
                                value={row.deadline}
                                onChange={e => handleUpdateDraftRow(row.id, "deadline", e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                              />
                            </div>
                            {draftRows.length > 1 && (
                              <button type="button" onClick={() => handleRemoveDraftRow(row.id)} className="p-2 text-rose-400 hover:text-rose-300">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Collaborator Multi-Select Pills */}
                    {employees.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-indigo-400" /> Assign to / Collaborate:
                        </span>
                        {employees.map(emp => {
                          const isSelected = selectedCollaborators.includes(emp.Email);
                          return (
                            <button
                              key={emp.Email}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  if (selectedCollaborators.length > 1) {
                                    setSelectedCollaborators(selectedCollaborators.filter(e => e !== emp.Email));
                                  }
                                } else {
                                  setSelectedCollaborators([...selectedCollaborators, emp.Email]);
                                }
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-medium border transition flex items-center gap-1 ${isSelected ? "bg-indigo-600 text-white border-indigo-400 shadow-sm" : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"}`}
                            >
                              {emp.Name} {isSelected && <Check className="h-3 w-3" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <button type="submit" disabled={isAddingBatch} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 text-white font-medium py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg">
                      <Send className="h-3.5 w-3.5" />
                      {isAddingBatch ? "Dispatching..." : `Add ${draftRows.length} Task(s) to ${selectedCollaborators.length || 1} Teammate Bucket(s)`}
                    </button>
                  </form>
                </div>

                {/* Team Member Workload Cards */}
                {employees.length === 0 ? (
                  <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center text-sm text-slate-400">
                    No team members onboarded yet. Click <strong>"+ Onboard Member"</strong> in the top right to add yourself and your team.
                  </div>
                ) : (
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
                              <span className={`h-2 w-2 rounded-full ${b.todayLogsCount > 0 ? "bg-emerald-400 animate-ping" : "bg-slate-600"}`} />
                              Current Focus:
                            </span>
                            <span className="font-mono font-medium text-emerald-300">
                              {b.lastActiveProject} • {b.lastActiveTask}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-xs text-slate-400 font-medium">
                              <span>Active Bucket ({b.activeCount})</span>
                              <span className="text-amber-400 font-mono">{b.weekLoggedHours}h logged this week</span>
                            </div>

                            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                              {b.activeTasksList.length === 0 && b.doneTasksList.length === 0 && (
                                <p className="text-[11px] text-slate-500 italic py-2">Bucket is clear.</p>
                              )}
                              {b.activeTasksList.map(item => {
                                const deadD = normalizeDateStr(item.Target_Deadline);
                                const isOverdue = deadD && deadD < todayStr;
                                return (
                                  <div key={item.Pulse_ID} className={`p-2.5 rounded-xl bg-slate-950 border ${isOverdue ? "border-amber-500/50" : "border-slate-800"} text-xs`}>
                                    <div className="flex justify-between text-[11px] mb-1">
                                      <span className="font-mono text-blue-400 font-semibold">[{item.Project_ID} • {item.Task_Code}]</span>
                                      <span className="font-mono text-emerald-400 font-bold">{item.Auto_Task_Hours || 0}%</span>
                                    </div>
                                    <div className="text-slate-200 text-xs">{item.Monday_Commitment}</div>
                                    <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                                      <span>Due: {deadD || "Flexible"}</span>
                                      {isOverdue && <span className="text-amber-400 font-semibold">⚠️ Overdue</span>}
                                    </div>
                                  </div>
                                );
                              })}
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
                          Open Member Cockpit <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CUMULATIVE PROJECT & TASK ANALYTICS */}
            {companyTab === "analytics" && (
              <div className="space-y-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-slate-400 font-medium">Filter Member:</span>
                    <select
                      value={selectedCompanyEmp}
                      onChange={e => setSelectedCompanyEmp(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-lg"
                    >
                      <option value="ALL">Entire Company (Cumulative Team Effort)</option>
                      {employees.map(e => <option key={e.Email} value={e.Email}>{e.Name}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    <button onClick={() => setAnalyticsTimeframe("WEEK")} className={`px-3 py-1 rounded-lg transition ${analyticsTimeframe === "WEEK" ? "bg-blue-600 text-white font-medium" : "text-slate-400 hover:text-white"}`}>
                      This Week (Mon–Sat)
                    </button>
                    <button onClick={() => setAnalyticsTimeframe("MONTH")} className={`px-3 py-1 rounded-lg transition ${analyticsTimeframe === "MONTH" ? "bg-blue-600 text-white font-medium" : "text-slate-400 hover:text-white"}`}>
                      This Month
                    </button>
                    <button onClick={() => setAnalyticsTimeframe("ALL")} className={`px-3 py-1 rounded-lg transition ${analyticsTimeframe === "ALL" ? "bg-blue-600 text-white font-medium" : "text-slate-400 hover:text-white"}`}>
                      All-Time / Yearly
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Project Breakdown */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                    <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 mb-1">
                      <FolderPlus className="h-4 w-4 text-blue-400" /> Cumulative Hours by Project Pillar
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">Automatically sums individual and collaborative hours across the team</p>

                    {companyProjectBreakdown.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">No hours logged in this timeframe yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {companyProjectBreakdown.map(p => (
                          <div key={p.projectId} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-slate-200">
                                <span className="font-mono text-blue-400">[{p.projectId}]</span> {p.projectName}
                              </span>
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

                  {/* Task Code Breakdown */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                    <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 mb-1">
                      <ListPlus className="h-4 w-4 text-emerald-400" /> Cumulative Hours by Task Category
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">Shows operational distribution across R&D, Design, Proposals, and Delivery</p>

                    {companyTaskBreakdown.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">No hours logged in this timeframe yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {companyTaskBreakdown.map(t => (
                          <div key={t.taskCode} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-slate-200">
                                <span className="font-mono text-emerald-400">[{t.taskCode}]</span> {t.taskTitle}
                              </span>
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

            {/* TAB 3: TODAY'S LIVE STREAM */}
            {companyTab === "live" && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                  <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" /> Today's Live Execution & Learning Stream ({todayStr})
                  </h3>
                </div>
                {todayLiveLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">No sessions logged yet today.</div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {todayLiveLogs.map(log => (
                      <div key={log.Log_ID} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-white">{log.Emp_Email}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                              {log.Project_ID} • {log.Task_Code}
                            </span>
                            {log.Learning_Module_Code && log.Learning_Module_Code !== "None" && (
                              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                                🎓 {log.Learning_Module_Code} ({log.Learning_Hours}m)
                              </span>
                            )}
                          </div>
                          {log.Notes && <p className="text-xs text-slate-300 mt-1 italic">"{log.Notes}"</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold font-mono text-amber-400">
                            {Number(log.Task_Hours || 0) + Number(log.Learning_Hours || 0)} mins
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: EDITABLE CATALOG MANAGER */}
            {companyTab === "catalog" && (
              <div className="space-y-6">
                <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Database className="h-4 w-4 text-amber-400" /> Master Projects & Categorized Task Library
                    </h3>
                    <p className="text-xs text-slate-400">Edit any project or task title/category inline, or push the default catalog to your Google Sheet with 1 click.</p>
                  </div>
                  <button
                    onClick={handleSeedCatalogToSheet}
                    className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold shrink-0"
                  >
                    ⚡ Sync Master Catalog to Google Sheet
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Editable Projects List */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                    <h4 className="font-semibold text-sm text-slate-200 mb-3">Core Project Pillars ({projects.length})</h4>
                    <div className="divide-y divide-slate-800/60">
                      {projects.map(p => (
                        <div key={p.Project_ID} className="py-2.5 flex justify-between items-center text-xs gap-2">
                          {editingProject?.Project_ID === p.Project_ID ? (
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="text"
                                value={editingProject.Project_Name}
                                onChange={e => setEditingProject({ ...editingProject, Project_Name: e.target.value })}
                                className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                              />
                              <button onClick={() => handleSaveEditedProject(editingProject)} className="px-2.5 py-1 bg-emerald-600 text-white rounded">Save</button>
                            </div>
                          ) : (
                            <>
                              <div>
                                <span className="font-mono text-blue-400 font-semibold">[{p.Project_ID}]</span>{" "}
                                <span className="text-slate-200">{p.Project_Name}</span>
                              </div>
                              <button onClick={() => setEditingProject(p)} className="text-slate-400 hover:text-white flex items-center gap-1">
                                <Edit3 className="h-3.5 w-3.5" /> Edit
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Editable Categorized Tasks List */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                    <h4 className="font-semibold text-sm text-slate-200 mb-3">Categorized Task Codes ({tasks.length})</h4>
                    <div className="divide-y divide-slate-800/60 max-h-96 overflow-y-auto pr-1">
                      {tasks.map(t => (
                        <div key={t.Task_Code} className="py-2.5 flex justify-between items-center text-xs gap-2">
                          {editingTask?.Task_Code === t.Task_Code ? (
                            <div className="flex flex-col sm:flex-row gap-2 w-full">
                              <input
                                type="text"
                                value={editingTask.Task_Title}
                                onChange={e => setEditingTask({ ...editingTask, Task_Title: e.target.value })}
                                className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                              />
                              <input
                                type="text"
                                value={editingTask.Category}
                                onChange={e => setEditingTask({ ...editingTask, Category: e.target.value })}
                                className="w-40 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-300"
                              />
                              <button onClick={() => handleSaveEditedTask(editingTask)} className="px-2.5 py-1 bg-emerald-600 text-white rounded">Save</button>
                            </div>
                          ) : (
                            <>
                              <div>
                                <span className="font-mono text-emerald-400 font-semibold">[{t.Task_Code}]</span>{" "}
                                <span className="text-slate-200">{t.Task_Title}</span>
                                <span className="block text-[10px] text-slate-500">{t.Category}</span>
                              </div>
                              <button onClick={() => setEditingTask(t)} className="text-slate-400 hover:text-white flex items-center gap-1 shrink-0">
                                <Edit3 className="h-3.5 w-3.5" /> Edit
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: TEAM DIRECTORY */}
            {companyTab === "team" && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-800 bg-slate-900">
                  <h3 className="font-semibold text-sm text-slate-200">Team Directory & Autonomy Levels</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950/60 text-slate-400 text-xs border-b border-slate-800 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Member</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="px-5 py-3">Level</th>
                        <th className="px-5 py-3">Baseline KRAs</th>
                        <th className="px-5 py-3 text-right">Cockpit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {employees.map(emp => (
                        <tr key={emp.Email} className="hover:bg-slate-800/40 transition">
                          <td className="px-5 py-3.5 font-medium text-slate-200">{emp.Name}</td>
                          <td className="px-5 py-3.5 text-xs text-slate-300">{emp.Role_Title}</td>
                          <td className="px-5 py-3.5">
                            <span className="px-2.5 py-1 rounded text-xs bg-blue-500/10 text-blue-300 border border-blue-500/30">
                              {emp.Level}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-400 max-w-md truncate">{emp["R&R_Summary"]}</td>
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
          /* ================= EMPLOYEE COCKPIT VIEW ================= */
          <div className="space-y-6">
            {/* Employee Profile Banner */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/20">
                  {currentEmp.Name ? currentEmp.Name[0] : "I"}
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

              <div className="flex items-center gap-3 flex-wrap">
                <div className="bg-slate-950/70 border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-2">
                  <Flame className="h-6 w-6 text-amber-500 fill-amber-500" />
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Distinct-Day Streak</div>
                    <div className="text-base font-bold text-amber-400">{currentStreak} Days</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowStandaloneLearning(true)}
                  className="px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-2 transition shadow-lg"
                >
                  <GraduationCap className="h-4 w-4 text-purple-400" /> + Log Upskilling Session
                </button>
              </div>
            </div>

            {/* PERSONAL TIME & FOCUS VISUALIZER (NO 40H/48H PRESSURE QUOTA) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-400" /> Where My Time Went (Self-Reflection Visualizer)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cumulative Logged Focus: <strong className="text-emerald-400 font-mono">{personalFocusData.totalCombinedHours} hrs ({personalFocusData.totalCombinedMins} mins)</strong>
                    {" "}— Split: <span className="text-blue-300">{personalFocusData.projectHours}h Projects</span> • <span className="text-purple-300">{personalFocusData.learningHours}h Learning</span>
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs self-start">
                  <button
                    onClick={() => setPersonalFocusTimeframe("WEEK")}
                    className={`px-3 py-1 rounded-lg transition ${personalFocusTimeframe === "WEEK" ? "bg-indigo-600 text-white font-medium" : "text-slate-400 hover:text-white"}`}
                  >
                    This Week (Mon–Sat)
                  </button>
                  <button
                    onClick={() => setPersonalFocusTimeframe("MONTH")}
                    className={`px-3 py-1 rounded-lg transition ${personalFocusTimeframe === "MONTH" ? "bg-indigo-600 text-white font-medium" : "text-slate-400 hover:text-white"}`}
                  >
                    This Month
                  </button>
                </div>
              </div>

              {personalFocusData.totalCombinedMins === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  Log your first task or learning session this week to visualize your focus distribution bar graph.
                </p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Project Focus Bars */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Focus by Project Pillar</span>
                    {personalFocusData.projectBars.map(bar => (
                      <div key={bar.code} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-200 font-medium">{bar.name}</span>
                          <span className="font-mono text-slate-300">{bar.hours}h ({bar.minutes}m) • <strong className="text-blue-400">{bar.percent}%</strong></span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full transition-all duration-500" style={{ width: `${bar.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Activity / Task Type Bars */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Focus by Activity Type</span>
                    {personalFocusData.taskBars.map(bar => (
                      <div key={bar.code} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-200 font-medium">[{bar.code}] {bar.name}</span>
                          <span className="font-mono text-slate-300">{bar.hours}h ({bar.minutes}m) • <strong className="text-emerald-400">{bar.percent}%</strong></span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500" style={{ width: `${bar.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Employee Cockpit Navigation Tabs */}
            <div className="flex border-b border-slate-800 text-sm gap-6 overflow-x-auto">
              <button onClick={() => setEmployeeTab("workboard")} className={`pb-3 font-medium transition shrink-0 flex items-center gap-1.5 ${employeeTab === "workboard" ? "text-blue-400 border-b-2 border-blue-500" : "text-slate-400 hover:text-white"}`}>
                <CalendarCheck className="h-4 w-4" /> My Active Workboard ({currentWorkboard.length})
              </button>
              <button onClick={() => setEmployeeTab("learning")} className={`pb-3 font-medium transition shrink-0 flex items-center gap-1.5 ${employeeTab === "learning" ? "text-purple-400 border-b-2 border-purple-500" : "text-slate-400 hover:text-white"}`}>
                <GraduationCap className="h-4 w-4" /> My Learning Log
              </button>
              <button onClick={() => setEmployeeTab("rnr")} className={`pb-3 font-medium transition shrink-0 flex items-center gap-1.5 ${employeeTab === "rnr" ? "text-emerald-400 border-b-2 border-emerald-500" : "text-slate-400 hover:text-white"}`}>
                <BookOpen className="h-4 w-4" /> My Editable R&R
              </button>
              <button onClick={() => setEmployeeTab("levels")} className={`pb-3 font-medium transition shrink-0 flex items-center gap-1.5 ${employeeTab === "levels" ? "text-amber-400 border-b-2 border-amber-500" : "text-slate-400 hover:text-white"}`}>
                <Zap className="h-4 w-4" /> L1–L4 Autonomy Guide
              </button>
            </div>

            {/* TAB 1: ACTIVE WORKBOARD & MULTI-ROW ADD */}
            {employeeTab === "workboard" && (
              <div className="space-y-6">
                {/* Multi-Row Task Builder for Employee */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="h-4 w-4 text-blue-400" /> Stack Tasks into Your Active Bucket (Mon–Sat Rolling)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddDraftRow}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1 self-start"
                    >
                      <Plus className="h-3.5 w-3.5" /> + Add Row
                    </button>
                  </div>

                  <form onSubmit={handleCommitBatchToBucket} className="space-y-3">
                    {draftRows.map((row) => {
                      const filteredTasks = tasks.filter(t => t.Category === row.category);
                      return (
                        <div key={row.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800 items-end">
                          <div className="sm:col-span-2">
                            <label className="text-[11px] text-slate-400 block mb-1">Project Pillar</label>
                            <select value={row.projectId} onChange={e => handleUpdateDraftRow(row.id, "projectId", e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
                              {projects.map(p => <option key={p.Project_ID} value={p.Project_ID}>{p.Project_Name}</option>)}
                            </select>
                          </div>
                          <div className="sm:col-span-3">
                            <label className="text-[11px] text-slate-400 block mb-1">Task Category</label>
                            <select value={row.category} onChange={e => handleUpdateDraftRow(row.id, "category", e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
                              {taskCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[11px] text-slate-400 block mb-1">Specific Task</label>
                            <select value={row.taskCode} onChange={e => handleUpdateDraftRow(row.id, "taskCode", e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
                              {(filteredTasks.length > 0 ? filteredTasks : tasks).map(t => (
                                <option key={t.Task_Code} value={t.Task_Code}>[{t.Task_Code}] {t.Task_Title}</option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-3">
                            <label className="text-[11px] text-slate-400 block mb-1">Deliverable / Client / School</label>
                            <input
                              type="text"
                              required
                              value={row.title}
                              onChange={e => handleUpdateDraftRow(row.id, "title", e.target.value)}
                              placeholder="e.g. AMT School Expo support & kit prep"
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                            />
                          </div>
                          <div className="sm:col-span-2 flex items-center gap-1.5">
                            <div className="flex-1">
                              <label className="text-[11px] text-slate-400 block mb-1">Target Deadline</label>
                              <input
                                type="date"
                                value={row.deadline}
                                onChange={e => handleUpdateDraftRow(row.id, "deadline", e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                              />
                            </div>
                            {draftRows.length > 1 && (
                              <button type="button" onClick={() => handleRemoveDraftRow(row.id)} className="p-2 text-rose-400 hover:text-rose-300">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Optional Peer Collaboration Selector */}
                    {employees.length > 1 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-indigo-400" /> Tag Collaborators (also places card in their bucket):
                        </span>
                        {employees.map(emp => {
                          const isSelected = selectedCollaborators.includes(emp.Email);
                          return (
                            <button
                              key={emp.Email}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  if (selectedCollaborators.length > 1) {
                                    setSelectedCollaborators(selectedCollaborators.filter(e => e !== emp.Email));
                                  }
                                } else {
                                  setSelectedCollaborators([...selectedCollaborators, emp.Email]);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${isSelected ? "bg-indigo-600 text-white border-indigo-400" : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"}`}
                            >
                              {emp.Name} {isSelected && "✓"}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <button type="submit" disabled={isAddingBatch} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg">
                      <Plus className="h-4 w-4" /> {isAddingBatch ? "Committing..." : `Commit ${draftRows.length} Task(s) to Bucket`}
                    </button>
                  </form>
                </div>

                {/* Search & Fulfillment Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    Showing <strong className="text-white">{currentWorkboard.length}</strong> tasks in bucket ({collectionMetrics.completedCount} completed • {collectionMetrics.percent}% avg fulfillment)
                  </div>
                  <input
                    type="text"
                    value={workboardSearch}
                    onChange={e => setWorkboardSearch(e.target.value)}
                    placeholder="Search by school, client, project, or task..."
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 w-full sm:w-72 focus:outline-none"
                  />
                </div>

                {/* Task Cards Grid */}
                {currentWorkboard.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-500 text-sm">
                    No matching tasks in your bucket. Add tasks above to begin logging sessions.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentWorkboard.map(item => {
                      const progress = Number(item.Auto_Task_Hours || 0);
                      const mins = Number(item.Auto_Learning_Hours || 0);
                      const isDone = progress >= 100;
                      const createdD = normalizeDateStr(item.Created_Date || item.Week_Start_Date) || todayStr;
                      const deadD = normalizeDateStr(item.Target_Deadline);
                      const compD = normalizeDateStr(item.Completed_Date);
                      const isOverdue = !isDone && deadD && deadD < todayStr;

                      return (
                        <div key={item.Pulse_ID} className={`p-4 rounded-2xl border transition ${isDone ? "bg-slate-900/40 border-emerald-500/30" : isOverdue ? "bg-slate-900/90 border-amber-500/50" : "bg-slate-900/90 border-slate-800 hover:border-slate-700"}`}>
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-semibold">
                                {item.Project_ID} • {item.Task_Code}
                              </span>
                              {item.Collaborators && item.Collaborators.includes(",") && (
                                <span title={`Collaborators: ${item.Collaborators}`} className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                                  <Users className="h-3 w-3" /> Collab
                                </span>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${isDone ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-300"}`}>
                              {progress}%
                            </span>
                          </div>

                          <h5 className="font-medium text-sm text-white mb-2">{item.Monday_Commitment}</h5>

                          {/* Lifecycle Timestamps */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mb-3">
                            <span>Created: {createdD}</span>
                            <span>•</span>
                            <span className={isOverdue ? "text-amber-400 font-bold" : ""}>
                              Committed Due: {deadD || "Rolling"} {isOverdue && "⚠️ Overdue"}
                            </span>
                            {isDone && compD && (
                              <span className="text-emerald-400 font-semibold">• Completed: {compD} ✓</span>
                            )}
                          </div>

                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-3">
                            <div className={`h-full transition-all duration-300 ${isDone ? "bg-emerald-400" : "bg-blue-500"}`} style={{ width: `${Math.min(100, progress)}%` }} />
                          </div>

                          <div className="flex justify-between items-center pt-1 border-t border-slate-800/60 text-xs">
                            <span className="text-slate-400 font-mono flex items-center gap-1">
                              <Clock className="h-3 w-3 text-amber-400" /> {mins} mins logged ({(mins / 60).toFixed(1)}h)
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
            )}

            {/* TAB 2: DELIBERATE LEARNING LOG */}
            {employeeTab === "learning" && (
              <div className="space-y-4">
                <div className="bg-slate-900/80 border border-purple-500/30 rounded-2xl p-5 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-purple-400" /> Deliberate Upskilling History
                    </h4>
                    <p className="text-xs text-slate-400">Tracks both standalone study sessions and learning paired during project delivery</p>
                  </div>
                  <button
                    onClick={() => setShowStandaloneLearning(true)}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
                  >
                    + Log Upskilling Session
                  </button>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl divide-y divide-slate-800/60">
                  {empDailyLogs.filter(l => Number(l.Learning_Hours || 0) > 0).length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">No learning sessions logged yet.</div>
                  ) : (
                    empDailyLogs.filter(l => Number(l.Learning_Hours || 0) > 0).slice().reverse().map(l => (
                      <div key={l.Log_ID} className="p-4 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-mono text-purple-400 font-semibold">[{l.Learning_Module_Code}]</span>{" "}
                          <span className="text-slate-200">{l.Notes || "Deliberate skill practice"}</span>
                          <span className="block text-[11px] text-slate-500 mt-0.5">Date: {normalizeDateStr(l.Date)}</span>
                        </div>
                        <span className="font-mono font-bold text-purple-300">{l.Learning_Hours} mins</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: INLINE EDITABLE R&R */}
            {employeeTab === "rnr" && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-400" />
                    <h4 className="font-semibold text-sm text-slate-200">My Roles, Responsibilities & Baseline KRAs</h4>
                  </div>
                  {!isEditingRnR ? (
                    <button onClick={() => setIsEditingRnR(true)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 flex items-center gap-1.5">
                      <Edit3 className="h-3.5 w-3.5 text-emerald-400" /> Edit R&R
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setIsEditingRnR(false)} className="px-3 py-1.5 text-slate-400 hover:text-white text-xs">Cancel</button>
                      <button onClick={handleSaveRnR} disabled={isSavingRnR} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg font-medium">
                        {isSavingRnR ? "Saving..." : "Save R&R to Sheet"}
                      </button>
                    </div>
                  )}
                </div>

                {isEditingRnR ? (
                  <textarea
                    rows="7"
                    value={rnrDraft}
                    onChange={e => setRnrDraft(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-200 focus:outline-none"
                    placeholder="Enter North Star Metric and 3-4 bulleted core responsibilities..."
                  />
                ) : (
                  <div className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800 whitespace-pre-line">
                    {currentEmp["R&R_Summary"]}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: L1-L4 AUTONOMY GUIDE */}
            {employeeTab === "levels" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-blue-400 font-bold">Level 1 • Foundational</span>
                  <p className="text-xs text-amber-300 font-mono mt-1">"I deliver defined tasks with guidance."</p>
                  <p className="text-xs text-slate-400 mt-1">Follows structured SOPs, kit assembly checklists, and session plans with direct check-ins.</p>
                </div>
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-emerald-400 font-bold">Level 2 • Independent</span>
                  <p className="text-xs text-emerald-300 font-mono mt-1">"I own my schedule and solve routine bottlenecks."</p>
                  <p className="text-xs text-slate-400 mt-1">Executes school sessions, design deliverables, or lab setups end-to-end without daily oversight.</p>
                </div>
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-indigo-400 font-bold">Level 3 • Advanced Lead</span>
                  <p className="text-xs text-indigo-300 font-mono mt-1">"I optimize systems, mentor peers, and drive complex outcomes."</p>
                  <p className="text-xs text-slate-400 mt-1">Leads multi-school expos, R&D prototypes, and mentors L1/L2 teammates.</p>
                </div>
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-purple-400 font-bold">Level 4 • Strategic Pillar Owner</span>
                  <p className="text-xs text-purple-300 font-mono mt-1">"I create the roadmap, align resources, and drive company growth."</p>
                  <p className="text-xs text-slate-400 mt-1">Owns core pillars (Dexter Box, Maker Lab, ATL, CSR) and long-term partner relationships.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL 1: IN-CARD SESSION LOGGING (DUAL SLIDER + PAIRED LEARNING) */}
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
                      <span>Hours (0–8h)</span>
                      <span className="font-semibold text-white">{sessionSliderHours}h</span>
                    </div>
                    <input type="range" min="0" max="8" step="1" value={sessionSliderHours} onChange={e => setSessionSliderHours(Number(e.target.value))} className="w-full accent-blue-500 cursor-pointer" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Minutes (0–45m)</span>
                      <span className="font-semibold text-white">{sessionSliderMins}m</span>
                    </div>
                    <input type="range" min="0" max="45" step="15" value={sessionSliderMins} onChange={e => setSessionSliderMins(Number(e.target.value))} className="w-full accent-blue-500 cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Task Completion Progress:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                    {sessionProgress}% {sessionProgress >= 100 ? "• Completed! (+50 GP)" : ""}
                  </span>
                </div>
                <input type="range" min="0" max="100" step="5" value={sessionProgress} onChange={e => setSessionProgress(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer" />
              </div>

              <div className="p-3 bg-purple-950/20 rounded-xl border border-purple-500/30 space-y-2">
                <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider block">
                  Pair Deliberate Learning (Optional):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <select value={sessionLearningModule} onChange={e => setSessionLearningModule(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200">
                    <option value="None">None during this session</option>
                    {learningModules.map(m => <option key={m.Module_Code} value={m.Module_Code}>[{m.Module_Code}] {m.Topic_Title}</option>)}
                  </select>
                  {sessionLearningModule !== "None" && (
                    <select value={sessionLearningMins} onChange={e => setSessionLearningMins(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono">
                      <option value="15">+15 mins learning</option>
                      <option value="30">+30 mins learning</option>
                      <option value="45">+45 mins learning</option>
                      <option value="60">+60 mins learning</option>
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Session Notes / What was achieved?</label>
                <input type="text" value={sessionNotes} onChange={e => setSessionNotes(e.target.value)} placeholder="e.g. Completed BOM costing and tested 3 sensor modules" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setActiveLoggingItem(null)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={isSubmittingSession} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-medium rounded-lg shadow-lg">
                  {isSubmittingSession ? "Saving..." : "Save Session (+Goal Points)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: STANDALONE DELIBERATE LEARNING MODAL */}
      {showStandaloneLearning && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-purple-400" /> Log Deliberate Upskilling Session
            </h3>
            <form onSubmit={handleSaveStandaloneLearning} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Learning Module</label>
                <select value={standaloneModule} onChange={e => setStandaloneModule(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200">
                  {learningModules.map(m => <option key={m.Module_Code} value={m.Module_Code}>[{m.Module_Code}] {m.Topic_Title} ({m.Domain})</option>)}
                </select>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Learning Duration:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
                    {standaloneHours}h {standaloneMins}m ({(standaloneHours * 60) + standaloneMins} mins)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Hours: {standaloneHours}h</span>
                    <input type="range" min="0" max="4" step="1" value={standaloneHours} onChange={e => setStandaloneHours(Number(e.target.value))} className="w-full accent-purple-500" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Minutes: {standaloneMins}m</span>
                    <input type="range" min="0" max="45" step="15" value={standaloneMins} onChange={e => setStandaloneMins(Number(e.target.value))} className="w-full accent-purple-500" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Key Takeaway / Practice Output</label>
                <input type="text" required value={standaloneNotes} onChange={e => setStandaloneNotes(e.target.value)} placeholder="e.g. Practiced CAD enclosure joints for new kit" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowStandaloneLearning(false)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={isSubmittingStandalone} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium">
                  Save Learning (+Goal Points)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD TASK / CATEGORY BUCKET */}
      {showTskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Add Task Code & Category Bucket</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const finalCat = newTsk.category === "NEW" ? (newTsk.customCategory || "Custom Category") : newTsk.category;
              const entry = { Task_Code: newTsk.taskCode.toUpperCase().trim(), Task_Title: newTsk.taskTitle, Category: finalCat };
              setTasks(prev => [...prev, entry]);
              setShowTskModal(false);
              showToast(`Added ${entry.Task_Code} under ${finalCat}`);
              try { fetch(APPS_SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ action: "createTask", taskCode: entry.Task_Code, taskTitle: entry.Task_Title, category: finalCat }) }); } catch (err) {}
            }} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Task Code</label>
                <input required type="text" value={newTsk.taskCode} onChange={e => setNewTsk({...newTsk, taskCode: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 uppercase" placeholder="e.g. TSK-CAD" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Task Title</label>
                <input required type="text" value={newTsk.taskTitle} onChange={e => setNewTsk({...newTsk, taskTitle: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" placeholder="e.g. 3D Enclosure & Print Prep" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Category Bucket</label>
                <select value={newTsk.category} onChange={e => setNewTsk({...newTsk, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200">
                  {taskCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="NEW">+ Create New Category Bucket...</option>
                </select>
              </div>
              {newTsk.category === "NEW" && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">New Category Bucket Name</label>
                  <input required type="text" value={newTsk.customCategory} onChange={e => setNewTsk({...newTsk, customCategory: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" placeholder="e.g. Software & Web Tools" />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowTskModal(false)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE PROJECT */}
      {showPrjModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Create Project Pillar</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const entry = { Project_ID: newPrj.projectId.toUpperCase().trim(), Project_Name: newPrj.projectName, Priority_Level: newPrj.priority, Status: "Active" };
              setProjects(prev => [...prev, entry]);
              setShowPrjModal(false);
              showToast(`Project ${entry.Project_ID} added!`);
              try { fetch(APPS_SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ action: "createProject", ...newPrj }) }); } catch (err) {}
            }} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Project Code</label>
                <input required type="text" value={newPrj.projectId} onChange={e => setNewPrj({...newPrj, projectId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 uppercase" placeholder="e.g. PRJ-ROBO" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Project Name</label>
                <input required type="text" value={newPrj.projectName} onChange={e => setNewPrj({...newPrj, projectName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" placeholder="e.g. Robotics Competition Series" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPrjModal(false)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ONBOARD EMPLOYEE */}
      {showEmpModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Onboard Team Member</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const entry = { Emp_ID: "IE-" + ("00" + (employees.length + 1)).slice(-3), Name: newEmp.name, Email: newEmp.email.toLowerCase().trim(), Role_Title: newEmp.roleTitle, Department: newEmp.department, Level: newEmp.level, "R&R_Summary": newEmp.rnrSummary, Status: "Active" };
              setEmployees(prev => [...prev, entry]);
              if (!activeEmployeeEmail) {
                setActiveEmployeeEmail(entry.Email);
                setSelectedCollaborators([entry.Email]);
              }
              setShowEmpModal(false);
              showToast(`Onboarded ${entry.Name}!`);
              try { fetch(APPS_SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ action: "addEmployee", ...newEmp }) }); } catch (err) {}
            }} className="space-y-3 text-sm">
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
                  <input required type="text" value={newEmp.roleTitle} onChange={e => setNewEmp({...newEmp, roleTitle: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" placeholder="e.g. Co-Founder & STEM Lead" />
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
                <label className="text-xs text-slate-400 block mb-1">Baseline KRAs (Editable anytime in R&R tab)</label>
                <textarea rows="3" required value={newEmp.rnrSummary} onChange={e => setNewEmp({...newEmp, rnrSummary: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" placeholder="North Star metric & 3-4 core responsibilities..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowEmpModal(false)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">Save & Onboard</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: ADD LEARNING MODULE */}
      {showLrnModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Add Deliberate Learning Module</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const entry = { Module_Code: newLrn.moduleCode.toUpperCase().trim(), Domain: newLrn.domain, Topic_Title: newLrn.topicTitle, Target_Proficiency: newLrn.targetProficiency };
              setLearningModules(prev => [...prev, entry]);
              setShowLrnModal(false);
              showToast(`Added learning module ${entry.Module_Code}`);
              try { fetch(APPS_SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ action: "createLearningModule", ...newLrn }) }); } catch (err) {}
            }} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Module Code</label>
                <input required type="text" value={newLrn.moduleCode} onChange={e => setNewLrn({...newLrn, moduleCode: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 uppercase" placeholder="e.g. LRN-IOT-02" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Topic Title</label>
                <input required type="text" value={newLrn.topicTitle} onChange={e => setNewLrn({...newLrn, topicTitle: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" placeholder="e.g. ESP32 Wi-Fi Telemetry & Sensors" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowLrnModal(false)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium">Add Module</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

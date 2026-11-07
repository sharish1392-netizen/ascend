import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Flame, CheckCircle, Clock, BookOpen, Send, Building2, 
  ChevronRight, Sparkles, RefreshCw, FolderPlus, UserPlus, 
  ListPlus, CalendarCheck, Zap, GraduationCap, LayoutGrid,
  Plus, Trash2, BarChart3, Sliders, UserCheck, Users, 
  PieChart, Activity, Edit3, Rocket, Filter, Check, Database,
  Mic, MicOff, Wand2, Smartphone, Monitor, Key, X, ArrowRight,
  Sun, Moon
} from 'lucide-react';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzndaT445SmAD43Zr0Lknj9CqDu-TFWaixA_AC-5ewCJqcewJppOezLCdHO3gKq8vRe7Q/exec";

const DEFAULT_PROJECTS = [
  { Project_ID: "PRJ-DEXTER", Project_Name: "Dexter Box Science Kits", Priority_Level: "P1 Critical", Status: "Active" },
  { Project_ID: "PRJ-MAKER", Project_Name: "Maker Lab & School Studios", Priority_Level: "P1 Critical", Status: "Active" },
  { Project_ID: "PRJ-ATL", Project_Name: "Atal Tinkering Labs (ATL)", Priority_Level: "P1 Critical", Status: "Active" },
  { Project_ID: "PRJ-CSR", Project_Name: "CSR & NGO Partnerships", Priority_Level: "P2 High", Status: "Active" },
  { Project_ID: "PRJ-STEP", Project_Name: "Teacher Training & Workshops (STEP)", Priority_Level: "P2 High", Status: "Active" },
  { Project_ID: "PRJ-ADMIN", Project_Name: "Office Admin, HR & Internal Ops", Priority_Level: "P3 Supporting", Status: "Active" }
];

const DEFAULT_TASKS = [
  { Task_Code: "TSK-PROP", Task_Title: "Concept Notes, Proposals & Estimates", Category: "BD & Client Proposals", Aliases: "proposal, estimate, concept note, quote, tender, rfp" },
  { Task_Code: "TSK-DECK", Task_Title: "Client Pitch Decks & Presentations", Category: "BD & Client Proposals", Aliases: "deck, ppt, presentation, slides" },
  { Task_Code: "TSK-FOLLOW", Task_Title: "Client Mailing, Follow-ups & Coordination", Category: "BD & Client Proposals", Aliases: "follow up, mail, email, calling" },
  { Task_Code: "TSK-MEET", Task_Title: "Client Meetings, School Visits & Demos", Category: "BD & Client Proposals", Aliases: "meeting, school visit, demo, pitch" },
  { Task_Code: "TSK-RND", Task_Title: "Product R&D, Prototyping & Experiments", Category: "R&D & Product Engineering", Aliases: "rnd, r&d, prototype, experiment, 3d print, laser cut, cad" },
  { Task_Code: "TSK-BOM", Task_Title: "Bill of Materials (BOM), Sourcing & Costing", Category: "R&D & Product Engineering", Aliases: "bom, bill of materials, sourcing, vendor, supplier, procurement" },
  { Task_Code: "TSK-CURR", Task_Title: "Curriculum Mapping, Manuals & Lesson Plans", Category: "R&D & Product Engineering", Aliases: "curriculum, manual, workbook, lesson plan" },
  { Task_Code: "TSK-DES-PROD", Task_Title: "Product & Packaging Design (Boxes/Manuals)", Category: "Design & Digital Media", Aliases: "packaging, box design, sticker, label" },
  { Task_Code: "TSK-DES-MKT", Task_Title: "Marketing Collaterals & Social Media Posters", Category: "Design & Digital Media", Aliases: "poster, social media, brochure, flyer" },
  { Task_Code: "TSK-DES-EVT", Task_Title: "Event, Expo & Workshop Signage/Backdrops", Category: "Design & Digital Media", Aliases: "backdrop, banner, standee, signage" },
  { Task_Code: "TSK-VIDEO", Task_Title: "Video Scripting, Shooting & Editing", Category: "Design & Digital Media", Aliases: "video, shooting, editing, script, montage, reel" },
  { Task_Code: "TSK-TRN-STU", Task_Title: "Student Classroom Facilitation & Sessions", Category: "Training & Field Execution", Aliases: "student training, classroom session, facilitation, workshop" },
  { Task_Code: "TSK-TRN-TCH", Task_Title: "Teacher Training Workshops & Mentorship", Category: "Training & Field Execution", Aliases: "teacher training, educator workshop, step program" },
  { Task_Code: "TSK-EXPO", Task_Title: "School Expo, Science Mela & Event Support", Category: "Training & Field Execution", Aliases: "expo, science mela, exhibition, booth setup, amt" },
  { Task_Code: "TSK-KIT-OPS", Task_Title: "Kit Assembly, QC, Packing & Dispatch", Category: "Operations & Supply Chain", Aliases: "packing, kit assembly, dispatch, quality check, qc" },
  { Task_Code: "TSK-LAB-AUD", Task_Title: "School Lab Setup, Audit & Maintenance", Category: "Operations & Supply Chain", Aliases: "lab setup, inventory audit, calibration, maintenance" },
  { Task_Code: "TSK-FIN", Task_Title: "Salary Processing, Invoicing & Accounts", Category: "HR, Finance & Office Admin", Aliases: "salary, payroll, invoice, billing, accounts" },
  { Task_Code: "TSK-HR-ADM", Task_Title: "HR, Scheduling & General Office Admin", Category: "HR, Finance & Office Admin", Aliases: "hr, recruitment, onboarding, admin" }
];

const DEFAULT_LEARNING = [
  { Module_Code: "LRN-HARD-01", Domain: "STEM Hardware", Topic_Title: "Microcontrollers, Sensors & Electronics", Target_Proficiency: "Advanced" },
  { Module_Code: "LRN-CAD-01", Domain: "Design & Prototyping", Topic_Title: "3D CAD Modeling, Laser Cutting & 3D Printing", Target_Proficiency: "Intermediate" },
  { Module_Code: "LRN-PED-01", Domain: "Pedagogy & Classroom", Topic_Title: "Experiential STEM Facilitation & Constructionism", Target_Proficiency: "Advanced" },
  { Module_Code: "LRN-MED-01", Domain: "AI & Digital Media", Topic_Title: "Educational Video Production & Storytelling", Target_Proficiency: "Intermediate" },
  { Module_Code: "LRN-OPS-01", Domain: "Finance & Growth", Topic_Title: "B2B School Sales, Proposals & Operations", Target_Proficiency: "Intermediate" }
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

// ================= GEMINI 2.5 FLASH AI NATIVE PARSER =================
async function geminiSmartParse(inputText, apiKey, projects, tasks, employees, activeEmail, currentWorkboard) {
  const today = getTodayStr();
  const prompt = `You are an elite operational AI assistant for Infinite Engineers (IE Skool).
Today's date is ${today}. Active user email: ${activeEmail}.
Available Projects: ${JSON.stringify(projects.map(p => ({ id: p.Project_ID, name: p.Project_Name })))}
Available Tasks: ${JSON.stringify(tasks.map(t => ({ code: t.Task_Code, title: t.Task_Title, category: t.Category, aliases: t.Aliases || "" })))}
Available Team Members: ${JSON.stringify(employees.map(e => ({ name: e.Name, email: e.Email })))}

Analyze the user's natural language input. It may contain MULTIPLE distinct tasks, time logs, and learning logs combined in one sentence.
Input: "${inputText}"

Instructions:
1. Split the input into all distinct operational items mentioned.
2. For each item, determine:
   - "intent": "ADD_TASK" (if planning/adding to bucket), "LOG_TIME" (if time was spent/completed), or "LOG_LEARNING" (if upskilling/studying).
   - "projectId": best matching Project_ID from Available Projects (default PRJ-MAKER).
   - "taskCode": best matching Task_Code from Available Tasks. If genuinely new, set "isNewTask": true, invent a clean "taskCode" (format "TSK-XXXX"), "newTaskTitle", and "newTaskCategory".
   - "isNewTask": boolean.
   - "newTaskTitle": string.
   - "newTaskCategory": string.
   - "title": clean deliverable description (preserving school/client names).
   - "minutes": integer minutes spent (0 if ADD_TASK).
   - "progress": integer 0 to 100 (100 if LOG_TIME completed, 50 if in progress, 0 if ADD_TASK).
   - "deadline": YYYY-MM-DD (default "${today}").
   - "collaborators": array of emails (include "${activeEmail}" plus any mentioned teammates).
Return ONLY a valid JSON array of objects.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
  const parsed = JSON.parse(rawText);

  return (Array.isArray(parsed) ? parsed : [parsed]).map((item, idx) => {
    const existsInCatalog = tasks.some(t => t.Task_Code === item.taskCode);
    let matchedPulseId = null;
    if (item.intent === "LOG_TIME" && currentWorkboard?.length > 0) {
      const match = currentWorkboard.find(p => p.Project_ID === item.projectId && p.Task_Code === item.taskCode && Number(p.Auto_Task_Hours || 0) < 100);
      if (match) matchedPulseId = match.Pulse_ID;
    }
    return {
      id: Date.now() + idx + Math.random(),
      intent: item.intent || "ADD_TASK",
      projectId: item.projectId || "PRJ-MAKER",
      taskCode: item.taskCode || "TSK-EXPO",
      newTaskTitle: item.newTaskTitle || "Specialized Execution",
      newTaskCategory: item.newTaskCategory || "Operations & Supply Chain",
      isNewTask: Boolean(item.isNewTask && !existsInCatalog),
      title: item.title || inputText,
      minutes: Number(item.minutes || 0),
      progress: Number(item.progress ?? (item.intent === "LOG_TIME" ? 100 : 0)),
      deadline: item.deadline || today,
      collaborators: Array.isArray(item.collaborators) && item.collaborators.length > 0 ? item.collaborators : [activeEmail],
      matchedPulseId,
      engine: "Gemini 2.5 Flash AI"
    };
  });
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("ie_theme") || "light");
  const [viewRole, setViewRole] = useState("employee");
  const [activeEmployeeEmail, setActiveEmployeeEmail] = useState(() => localStorage.getItem("ie_v3_active_emp") || "");
  const [companyTab, setCompanyTab] = useState("workload");
  const [employeeTab, setEmployeeTab] = useState("workboard");

  const [isMobileScreen, setIsMobileScreen] = useState(() => window.innerWidth < 768);
  const [forceMobilePreview, setForceMobilePreview] = useState(false);
  const isCompactMobile = isMobileScreen || forceMobilePreview;

  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => { localStorage.setItem("ie_theme", theme); }, [theme]);

  const [employees, setEmployees] = useState(() => JSON.parse(localStorage.getItem("ie_v3_employees") || "[]"));
  const [projects, setProjects] = useState(() => mergeById(JSON.parse(localStorage.getItem("ie_v3_projects") || "[]"), DEFAULT_PROJECTS, "Project_ID"));
  const [tasks, setTasks] = useState(() => mergeById(JSON.parse(localStorage.getItem("ie_v3_tasks") || "[]"), DEFAULT_TASKS, "Task_Code"));
  const [learningModules, setLearningModules] = useState(() => mergeById(JSON.parse(localStorage.getItem("ie_v3_learning") || "[]"), DEFAULT_LEARNING, "Module_Code"));
  const [weeklyPulses, setWeeklyPulses] = useState(() => JSON.parse(localStorage.getItem("ie_v3_pulses") || "[]"));
  const [dailyLogs, setDailyLogs] = useState(() => JSON.parse(localStorage.getItem("ie_v3_logs") || "[]"));

  const [smartInput, setSmartInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isParsingAI, setIsParsingAI] = useState(false);
  const [parsedPreviews, setParsedPreviews] = useState([]);
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem("ie_gemini_api_key") || "");
  const [showApiKeyModal, setShowApiKeyModal] = useState(true); // Prompt for key if missing
  const [showManualForm, setShowManualForm] = useState(false);
  const recognitionRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [selectedCompanyEmp, setSelectedCompanyEmp] = useState("ALL");
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState("WEEK");
  const [personalFocusTimeframe, setPersonalFocusTimeframe] = useState("WEEK");
  const [workboardSearch, setWorkboardSearch] = useState("");

  const [showEmpModal, setShowEmpModal] = useState(false);
  const [showPrjModal, setShowPrjModal] = useState(false);
  const [showTskModal, setShowTskModal] = useState(false);
  const [showStandaloneLearning, setShowStandaloneLearning] = useState(false);

  const [activeLoggingItem, setActiveLoggingItem] = useState(null);
  const [sessionSliderHours, setSessionSliderHours] = useState(1);
  const [sessionSliderMins, setSessionSliderMins] = useState(30);
  const [sessionProgress, setSessionProgress] = useState(50);
  const [sessionLearningModule, setSessionLearningModule] = useState("None");
  const [sessionLearningMins, setSessionLearningMins] = useState(30);
  const [sessionNotes, setSessionNotes] = useState("");
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);

  const [standaloneModule, setStandaloneModule] = useState("LRN-HARD-01");
  const [standaloneHours, setStandaloneHours] = useState(0);
  const [standaloneMins, setStandaloneMins] = useState(45);
  const [standaloneNotes, setStandaloneNotes] = useState("");

  const todayStr = getTodayStr();
  const currentMondayStr = getCurrentMondayStr();

  const [draftRows, setDraftRows] = useState([
    { id: 1, projectId: "PRJ-MAKER", category: "Training & Field Execution", taskCode: "TSK-EXPO", title: "", deadline: todayStr }
  ]);
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [isAddingBatch, setIsAddingBatch] = useState(false);

  const [isEditingRnR, setIsEditingRnR] = useState(false);
  const [rnrDraft, setRnrDraft] = useState("");
  const [isSavingRnR, setIsSavingRnR] = useState(false);

  const [newEmp, setNewEmp] = useState({ name: "", email: "", roleTitle: "", department: "Training & Delivery", level: "L3 Advanced", rnrSummary: "" });
  const [newPrj, setNewPrj] = useState({ projectId: "", projectName: "", priority: "P1 Critical" });
  const [newTsk, setNewTsk] = useState({ taskCode: "", taskTitle: "", category: "BD & Client Proposals", customCategory: "" });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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
            prev.forEach(localP => { if (!remoteMap.has(localP.Pulse_ID)) remoteMap.set(localP.Pulse_ID, localP); });
            return Array.from(remoteMap.values());
          });
        }
        if (data.dailyLogs) {
          setDailyLogs(prev => mergeById(data.dailyLogs, prev, "Log_ID"));
        }
      }
    } catch (err) {
      console.log("Using cached state:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSheetData(); }, []);

  useEffect(() => {
    if (activeEmployeeEmail && selectedCollaborators.length === 0) {
      setSelectedCollaborators([activeEmployeeEmail]);
    }
  }, [activeEmployeeEmail]);

  const taskCategories = useMemo(() => Array.from(new Set(tasks.map(t => t.Category || "General"))), [tasks]);

  const currentEmp = employees.find(e => (e.Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase()) || {
    Name: "Team Member",
    Email: activeEmployeeEmail || "",
    Role_Title: "Onboard in Company View",
    Department: "Infinite Engineers",
    Level: "L4 Strategic",
    "R&R_Summary": "Click 'Edit R&R' to define your North Star metric and core KRAs."
  };

  useEffect(() => { setRnrDraft(currentEmp["R&R_Summary"] || ""); }, [currentEmp]);

  const empDailyLogs = useMemo(() => {
    return dailyLogs.filter(l => (l.Emp_Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase());
  }, [dailyLogs, activeEmployeeEmail]);

  const currentStreak = useMemo(() => calculateUniqueDayStreak(empDailyLogs), [empDailyLogs]);

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
        if (compD && deadD && compD <= deadD) onTimeBonuses++;
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

  const filteredAnalyticsLogs = useMemo(() => {
    const currentMonthPrefix = todayStr.slice(0, 7);
    return dailyLogs.filter(log => {
      if (selectedCompanyEmp !== "ALL" && (log.Emp_Email || "").toLowerCase() !== selectedCompanyEmp.toLowerCase()) return false;
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
      if (mins > 0) { map[p] = (map[p] || 0) + mins; grandTotalMins += mins; }
    });
    return Object.entries(map).map(([projectId, mins]) => {
      const pObj = projects.find(pr => pr.Project_ID === projectId);
      return { projectId, projectName: pObj ? pObj.Project_Name : projectId, hours: (mins / 60).toFixed(1), minutes: mins, percentage: grandTotalMins > 0 ? Math.round((mins / grandTotalMins) * 100) : 0 };
    }).sort((a, b) => b.minutes - a.minutes);
  }, [filteredAnalyticsLogs, projects]);

  const companyTaskBreakdown = useMemo(() => {
    const map = {};
    let grandTotalMins = 0;
    filteredAnalyticsLogs.forEach(log => {
      const t = log.Task_Code || "GENERAL";
      const val = Number(log.Task_Hours || 0);
      const mins = val > 24 ? val : Math.round(val * 60);
      if (mins > 0) { map[t] = (map[t] || 0) + mins; grandTotalMins += mins; }
    });
    return Object.entries(map).map(([taskCode, mins]) => {
      const tObj = tasks.find(ts => ts.Task_Code === taskCode);
      return { taskCode, taskTitle: tObj ? tObj.Task_Title : taskCode, category: tObj ? tObj.Category : "General", hours: (mins / 60).toFixed(1), minutes: mins, percentage: grandTotalMins > 0 ? Math.round((mins / grandTotalMins) * 100) : 0 };
    }).sort((a, b) => b.minutes - a.minutes);
  }, [filteredAnalyticsLogs, tasks]);

  const employeeWorkloadBuckets = useMemo(() => {
    return employees.map(emp => {
      const empEmail = (emp.Email || "").toLowerCase();
      const empPulses = weeklyPulses.filter(p => (p.Emp_Email || "").toLowerCase() === empEmail);
      const activeTasks = empPulses.filter(p => Number(p.Auto_Task_Hours || 0) < 100);
      const doneTasks = empPulses.filter(p => Number(p.Auto_Task_Hours || 0) >= 100);

      const empWeekLogs = dailyLogs.filter(l => (l.Emp_Email || "").toLowerCase() === empEmail && normalizeDateStr(l.Date) >= currentMondayStr);
      const weekMins = empWeekLogs.reduce((sum, l) => {
        const vt = Number(l.Task_Hours || 0);
        const vl = Number(l.Learning_Hours || 0);
        return sum + (vt > 24 ? vt : Math.round(vt * 60)) + (vl > 24 ? vl : Math.round(vl * 60));
      }, 0);

      const todayLogs = dailyLogs.filter(l => (l.Emp_Email || "").toLowerCase() === empEmail && normalizeDateStr(l.Date) === todayStr);

      return { ...emp, activeCount: activeTasks.length, doneCount: doneTasks.length, weekLoggedHours: (weekMins / 60).toFixed(1), activeTasksList: activeTasks, doneTasksList: doneTasks.slice(-3), todayLogsCount: todayLogs.length };
    });
  }, [employees, weeklyPulses, dailyLogs, currentMondayStr, todayStr]);

  const todayLiveLogs = useMemo(() => {
    return dailyLogs.filter(l => normalizeDateStr(l.Date) === todayStr).slice().reverse();
  }, [dailyLogs, todayStr]);

  const handleToggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Voice input is supported in Chrome, Edge, and Safari.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSmartInput(prev => (prev ? `${prev} and then ${transcript}` : transcript));
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleAnalyzeSmartInput = async (e) => {
    e.preventDefault();
    if (!smartInput.trim()) return;
    if (!geminiApiKey.trim()) {
      setShowApiKeyModal(true);
      showToast("Please enter your Gemini API key to enable multi-task AI parsing.");
      return;
    }

    setIsParsingAI(true);
    try {
      const results = await geminiSmartParse(smartInput, geminiApiKey.trim(), projects, tasks, employees, activeEmployeeEmail, currentWorkboard);
      setParsedPreviews(results);
    } catch (err) {
      console.log("Gemini parse error:", err);
      showToast("AI parsing failed. Please check your Gemini API key.");
    } finally {
      setIsParsingAI(false);
    }
  };

  const handleConfirmSmartPreviews = async () => {
    if (parsedPreviews.length === 0) return;

    const newPulsesBatch = [];
    const newLogsBatch = [];
    const newlyMintedTasks = [];

    parsedPreviews.forEach(item => {
      const alreadyExists = tasks.some(t => t.Task_Code === item.taskCode) || newlyMintedTasks.some(t => t.Task_Code === item.taskCode);
      if (item.isNewTask && !alreadyExists) {
        const mintedEntry = { Task_Code: item.taskCode.toUpperCase().trim(), Task_Title: item.newTaskTitle || item.title, Category: item.newTaskCategory || "Operations & Supply Chain", Aliases: item.title.toLowerCase() };
        newlyMintedTasks.push(mintedEntry);
        try {
          fetch(APPS_SCRIPT_URL, {
            method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ action: "createTask", taskCode: mintedEntry.Task_Code, taskTitle: mintedEntry.Task_Title, category: mintedEntry.Category, aliases: mintedEntry.Aliases })
          });
        } catch (err) {}
      }

      const assignees = item.collaborators?.length > 0 ? item.collaborators : [activeEmployeeEmail];
      const collabStr = assignees.join(", ");

      if (item.intent === "ADD_TASK") {
        assignees.forEach(email => {
          newPulsesBatch.push({
            Pulse_ID: "TSK-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
            Created_Date: todayStr,
            Emp_Email: (email || "").toLowerCase().trim(),
            Project_ID: item.projectId,
            Task_Code: item.taskCode,
            Monday_Commitment: item.title,
            Auto_Task_Hours: 0,
            Auto_Learning_Hours: 0,
            Friday_Outcome: viewRole === "company" ? "Company Lead" : "Gemini AI",
            Status: "In Progress",
            Target_Deadline: item.deadline || todayStr,
            Completed_Date: "",
            Collaborators: collabStr
          });
        });
      } else if (item.intent === "LOG_TIME") {
        const logEntry = {
          Log_ID: "LOG-" + Date.now(),
          Date: todayStr,
          Emp_Email: activeEmployeeEmail,
          Project_ID: item.projectId,
          Task_Code: item.taskCode,
          Task_Hours: Number(item.minutes || 60),
          Learning_Module_Code: "None",
          Learning_Hours: 0,
          Status: item.progress >= 100 ? "Done" : "In Progress",
          Streak_Count: currentStreak || 1,
          Notes: item.title
        };
        newLogsBatch.push(logEntry);

        if (item.matchedPulseId) {
          setWeeklyPulses(prev => prev.map(p => {
            if (p.Pulse_ID === item.matchedPulseId) {
              return { ...p, Auto_Task_Hours: item.progress, Auto_Learning_Hours: Number(p.Auto_Learning_Hours || 0) + Number(item.minutes || 60), Status: item.progress >= 100 ? "Completed" : "In Progress", Completed_Date: item.progress >= 100 ? todayStr : "" };
            }
            return p;
          }));
        } else {
          newPulsesBatch.push({
            Pulse_ID: "TSK-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
            Created_Date: todayStr,
            Emp_Email: activeEmployeeEmail,
            Project_ID: item.projectId,
            Task_Code: item.taskCode,
            Monday_Commitment: item.title,
            Auto_Task_Hours: item.progress,
            Auto_Learning_Hours: Number(item.minutes || 60),
            Friday_Outcome: "Gemini Log",
            Status: item.progress >= 100 ? "Completed" : "In Progress",
            Target_Deadline: todayStr,
            Completed_Date: item.progress >= 100 ? todayStr : "",
            Collaborators: collabStr
          });
        }
      } else if (item.intent === "LOG_LEARNING") {
        newLogsBatch.push({
          Log_ID: "LRN-" + Date.now(),
          Date: todayStr,
          Emp_Email: activeEmployeeEmail,
          Project_ID: "UPSKILLING",
          Task_Code: "TSK-LRN",
          Task_Hours: 0,
          Learning_Module_Code: item.learningModuleCode || "LRN-HARD-01",
          Learning_Hours: Number(item.minutes || 45),
          Status: "Done",
          Streak_Count: currentStreak || 1,
          Notes: item.title
        });
      }
    });

    if (newlyMintedTasks.length > 0) setTasks(prev => [...prev, ...newlyMintedTasks]);
    if (newPulsesBatch.length > 0) setWeeklyPulses(prev => [...prev, ...newPulsesBatch]);
    if (newLogsBatch.length > 0) setDailyLogs(prev => [...prev, ...newLogsBatch]);

    showToast(`✨ Approved & saved ${parsedPreviews.length} AI-parsed item(s)!`);
    setParsedPreviews([]);
    setSmartInput("");
  };

  const handleAddDraftRow = () => {
    setDraftRows(prev => [...prev, { id: Date.now() + Math.random(), projectId: projects[0]?.Project_ID || "PRJ-MAKER", category: taskCategories[0] || "BD & Client Proposals", taskCode: tasks[0]?.Task_Code || "TSK-PROP", title: "", deadline: todayStr }]);
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

  const handleCommitBatchToBucket = (e) => {
    e.preventDefault();
    const validRows = draftRows.filter(r => r.title.trim() !== "");
    if (validRows.length === 0) return;

    setIsAddingBatch(true);
    const assignees = selectedCollaborators.length > 0 ? selectedCollaborators : [activeEmployeeEmail];
    const createdItems = [];
    validRows.forEach(row => {
      assignees.forEach(email => {
        createdItems.push({
          Pulse_ID: "TSK-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
          Created_Date: todayStr,
          Emp_Email: (email || "").toLowerCase().trim(),
          Project_ID: row.projectId,
          Task_Code: row.taskCode,
          Monday_Commitment: row.title.trim(),
          Auto_Task_Hours: 0,
          Auto_Learning_Hours: 0,
          Friday_Outcome: viewRole === "company" ? "Company Lead" : "Self",
          Status: "In Progress",
          Target_Deadline: row.deadline || todayStr,
          Completed_Date: "",
          Collaborators: assignees.join(", ")
        });
      });
    });

    setWeeklyPulses(prev => [...prev, ...createdItems]);
    setDraftRows([{ id: Date.now(), projectId: projects[0]?.Project_ID || "PRJ-MAKER", category: taskCategories[0] || "BD & Client Proposals", taskCode: tasks[0]?.Task_Code || "TSK-PROP", title: "", deadline: todayStr }]);
    setShowManualForm(false);
    showToast(`Added ${validRows.length} deliverable(s)!`);
    setIsAddingBatch(false);
  };

  const handleOpenLogModal = (item) => {
    setActiveLoggingItem(item);
    setSessionProgress(Number(item.Auto_Task_Hours || 0));
    setSessionSliderHours(1);
    setSessionSliderMins(30);
    setSessionLearningModule("None");
    setSessionLearningMins(30);
    setSessionNotes("");
  };

  const handleSaveTaskSession = (e) => {
    e.preventDefault();
    if (!activeLoggingItem) return;
    setIsSubmittingSession(true);

    const sessionMinutes = (sessionSliderHours * 60) + sessionSliderMins;
    setWeeklyPulses(prev => prev.map(p => {
      if (p.Pulse_ID === activeLoggingItem.Pulse_ID) {
        return { ...p, Auto_Task_Hours: sessionProgress, Auto_Learning_Hours: Number(p.Auto_Learning_Hours || 0) + sessionMinutes, Status: sessionProgress >= 100 ? "Completed" : "In Progress", Completed_Date: sessionProgress >= 100 ? todayStr : "" };
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
      Learning_Hours: sessionLearningModule !== "None" ? Number(sessionLearningMins) : 0,
      Status: sessionProgress >= 100 ? "Done" : "In Progress",
      Streak_Count: currentStreak || 1,
      Notes: sessionNotes
    }]);

    showToast(`Logged ${sessionMinutes}m session!`);
    setActiveLoggingItem(null);
    setIsSubmittingSession(false);
  };

  const handleSaveStandaloneLearning = (e) => {
    e.preventDefault();
    const totalMins = (Number(standaloneHours) * 60) + Number(standaloneMins);
    if (totalMins === 0) return;

    setDailyLogs(prev => [...prev, {
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
    }]);

    showToast(`Logged ${totalMins}m learning!`);
    setShowStandaloneLearning(false);
    setStandaloneNotes("");
  };

  const handleSaveRnR = () => {
    setIsSavingRnR(true);
    setEmployees(prev => prev.map(e => (e.Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase() ? { ...e, "R&R_Summary": rnrDraft } : e));
    showToast("R&R updated!");
    setIsEditingRnR(false);
    setIsSavingRnR(false);
  };

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex flex-col font-sans pb-20 md:pb-8 transition-colors duration-200 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-950"} ${forceMobilePreview ? "max-w-md mx-auto border-x shadow-2xl " + (isDark ? "border-slate-800" : "border-slate-200") : ""}`}>
      
      {/* Top Header */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur transition-colors ${isDark ? "border-slate-800 bg-slate-900/90" : "border-slate-200 bg-white/90"}`}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight">IE Goal Tracker</span>
              {!isCompactMobile && <span className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"} block`}>Gemini AI Multi-Task OS</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              title="Toggle Light/Dark Theme"
              className={`p-1.5 rounded-lg border transition ${isDark ? "bg-slate-800 border-slate-700 text-amber-400" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"}`}
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>

            <button
              onClick={() => setShowApiKeyModal(true)}
              title="Gemini AI Settings"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 transition ${geminiApiKey ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}
            >
              <Key className="h-3.5 w-3.5" />
              <span>{geminiApiKey ? "AI Enabled" : "Add AI Key"}</span>
            </button>

            <button onClick={fetchSheetData} title="Sync with Sheet" className={`p-1.5 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-500"}`}>
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            {!isCompactMobile && (
              <div className={`flex items-center p-0.5 rounded-lg border text-xs ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                <button
                  onClick={() => setViewRole("employee")}
                  className={`px-2.5 py-1 rounded-md transition ${viewRole === "employee" ? (isDark ? "bg-slate-900 text-white font-semibold shadow-sm" : "bg-white text-slate-900 font-semibold shadow-sm") : "text-slate-400 hover:text-white"}`}
                >
                  My Cockpit
                </button>
                <button
                  onClick={() => setViewRole("company")}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${viewRole === "company" ? (isDark ? "bg-slate-900 text-white font-semibold shadow-sm" : "bg-white text-slate-900 font-semibold shadow-sm") : "text-slate-400 hover:text-white"}`}
                >
                  <Building2 className="h-3 w-3" /> Company View
                </button>
              </div>
            )}

            {employees.length > 0 && (
              <select
                value={activeEmployeeEmail}
                onChange={(e) => {
                  setActiveEmployeeEmail(e.target.value);
                  setSelectedCollaborators([e.target.value]);
                }}
                className={`text-xs font-medium px-2 py-1.5 rounded-lg focus:outline-none border ${isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-800"}`}
              >
                {employees.map(emp => (
                  <option key={emp.Email} value={emp.Email}>{emp.Name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </header>

      {/* Mission Orbit Bar */}
      <div className={`border-b py-2 px-4 transition-colors ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 truncate">
            <Rocket className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Mission Orbit:</span>
            <span className="font-mono font-bold text-indigo-500">{collectiveOrbit.pooledPoints} GP</span>
            {!isCompactMobile && <span className={isDark ? "text-slate-400" : "text-slate-500"}>• {collectiveOrbit.currentTier} ({collectiveOrbit.completedTasks} shipped)</span>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className={`w-28 sm:w-44 h-2 rounded-full overflow-hidden border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
              <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${collectiveOrbit.progressPercent}%` }} />
            </div>
            <span className={`font-mono font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>{collectiveOrbit.progressPercent}%</span>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="max-w-md mx-auto mt-3 px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-medium flex items-center gap-2 shadow-lg z-50">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= GEMINI AI SMART COMMAND BAR ================= */}
      <div className="max-w-6xl mx-auto px-4 pt-5 w-full">
        <div className={`border rounded-2xl p-3 sm:p-4 shadow-sm transition-colors ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90"}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
              <Wand2 className="h-3.5 w-3.5" /> Gemini AI Multi-Task Command Bar
              <span className={`font-normal hidden sm:inline ${isDark ? "text-slate-400" : "text-slate-400"}`}>
                — Speak or type multiple tasks, time logs, and learning sessions in one go
              </span>
            </span>
            <button
              type="button"
              onClick={() => setShowManualForm(!showManualForm)}
              className={`text-[11px] font-medium underline ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
            >
              {showManualForm ? "Hide manual form" : "Use manual dropdowns"}
            </button>
          </div>

          <form onSubmit={handleAnalyzeSmartInput} className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleVoice}
              title="Speak multiple tasks"
              className={`p-2.5 rounded-xl border transition shrink-0 flex items-center justify-center ${
                isListening 
                  ? "bg-rose-500 text-white border-rose-600 animate-pulse shadow-md" 
                  : isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700" : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <input
              type="text"
              value={smartInput}
              onChange={(e) => setSmartInput(e.target.value)}
              placeholder='Speak or type: e.g. "Spent 2h on AMT Expo, 45m on Dexter BOM, and add CSR proposal"'
              className={`flex-1 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none transition ${
                isDark 
                  ? "bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500" 
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500"
              }`}
            />

            <button
              type="submit"
              disabled={isParsingAI || !smartInput.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-sm transition"
            >
              <span>{isParsingAI ? "Gemini Parsing..." : "Gemini AI Split"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Gemini AI Split Previews */}
          {parsedPreviews.length > 0 && (
            <div className={`mt-3 pt-3 border-t space-y-2.5 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  Gemini AI Split into {parsedPreviews.length} Ready-to-Approve Item(s):
                </span>
                <button onClick={() => setParsedPreviews([])} className="text-slate-400 hover:text-slate-600">
                  Clear All
                </button>
              </div>

              <div className="space-y-2">
                {parsedPreviews.map((item, idx) => (
                  <div key={item.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl border text-xs ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex flex-wrap items-center gap-1.5 flex-1">
                      <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-700"}`}>
                        #{idx + 1}
                      </span>

                      <select
                        value={item.intent}
                        onChange={(e) => {
                          const val = e.target.value;
                          setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, intent: val, progress: val === "ADD_TASK" ? 0 : 100 } : p));
                        }}
                        className={`font-bold px-2 py-1 rounded-md border text-[11px] ${
                          item.intent === "LOG_TIME" 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                            : item.intent === "LOG_LEARNING"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        }`}
                      >
                        <option value="ADD_TASK" className={isDark ? "bg-slate-900" : ""}>+ Add to Bucket</option>
                        <option value="LOG_TIME" className={isDark ? "bg-slate-900" : ""}>✓ Log Time Spent</option>
                        <option value="LOG_LEARNING" className={isDark ? "bg-slate-900" : ""}>🎓 Log Learning</option>
                      </select>

                      <select
                        value={item.projectId}
                        onChange={(e) => setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, projectId: e.target.value } : p))}
                        className={`font-mono text-[11px] px-2 py-1 rounded-md border ${isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-800"}`}
                      >
                        {projects.map(prj => <option key={prj.Project_ID} value={prj.Project_ID}>{prj.Project_ID}</option>)}
                      </select>

                      <select
                        value={item.taskCode}
                        onChange={(e) => setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, taskCode: e.target.value, isNewTask: false } : p))}
                        className={`font-mono text-[11px] px-2 py-1 rounded-md border ${item.isNewTask ? "bg-amber-500/10 text-amber-300 border-amber-500/30 font-bold" : isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-800"}`}
                      >
                        {item.isNewTask && <option value={item.taskCode}>✨ NEW: {item.taskCode} ({item.newTaskTitle})</option>}
                        {tasks.map(t => <option key={t.Task_Code} value={t.Task_Code}>{t.Task_Code} ({t.Task_Title.slice(0, 20)})</option>)}
                      </select>

                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, title: e.target.value } : p))}
                        className={`flex-1 min-w-[150px] border rounded-md px-2 py-1 font-medium ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                      />
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      {item.intent !== "ADD_TASK" && (
                        <div className={`flex items-center gap-1 border px-2 py-1 rounded-md ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}>
                          <Clock className="h-3 w-3 text-amber-500" />
                          <input type="number" min="5" step="5" value={item.minutes} onChange={(e) => setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, minutes: Number(e.target.value) } : p))} className={`w-11 text-right font-mono font-bold focus:outline-none ${isDark ? "bg-transparent text-white" : "text-slate-800"}`} />
                          <span className="text-[10px] text-slate-400">m</span>
                        </div>
                      )}
                      {item.intent === "LOG_TIME" && (
                        <div className={`flex items-center gap-1 border px-2 py-1 rounded-md ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}>
                          <input type="number" min="0" max="100" step="10" value={item.progress} onChange={(e) => setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, progress: Number(e.target.value) } : p))} className={`w-9 text-right font-mono font-bold text-emerald-400 focus:outline-none ${isDark ? "bg-transparent" : ""}`} />
                          <span className="text-[10px] text-slate-400">%</span>
                        </div>
                      )}
                      <button type="button" onClick={() => setParsedPreviews(prev => prev.filter((_, i) => i !== idx))} className="p-1 text-slate-400 hover:text-rose-400">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={handleConfirmSmartPreviews} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm">
                  <Check className="h-3.5 w-3.5" /> Approve & Save All ({parsedPreviews.length})
                </button>
              </div>
            </div>
          )}

          {showManualForm && (
            <form onSubmit={handleCommitBatchToBucket} className={`mt-4 pt-4 border-t space-y-3 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <div className="flex justify-between items-center">
                <span className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Manual Multi-Row Task Builder</span>
                <button type="button" onClick={handleAddDraftRow} className="text-xs text-indigo-500 font-medium">+ Add Row</button>
              </div>
              {draftRows.map((row) => {
                const filteredTasks = tasks.filter(t => t.Category === row.category);
                return (
                  <div key={row.id} className={`grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-xl border items-end ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Project</label>
                      <select value={row.projectId} onChange={e => handleUpdateDraftRow(row.id, "projectId", e.target.value)} className={`w-full rounded-lg p-1.5 text-xs ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200"}`}>
                        {projects.map(p => <option key={p.Project_ID} value={p.Project_ID}>{p.Project_Name}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Category</label>
                      <select value={row.category} onChange={e => handleUpdateDraftRow(row.id, "category", e.target.value)} className={`w-full rounded-lg p-1.5 text-xs ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200"}`}>
                        {taskCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Task Code</label>
                      <select value={row.taskCode} onChange={e => handleUpdateDraftRow(row.id, "taskCode", e.target.value)} className={`w-full rounded-lg p-1.5 text-xs ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200"}`}>
                        {(filteredTasks.length > 0 ? filteredTasks : tasks).map(t => (
                          <option key={t.Task_Code} value={t.Task_Code}>[{t.Task_Code}] {t.Task_Title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Deliverable / Client</label>
                      <input type="text" required value={row.title} onChange={e => handleUpdateDraftRow(row.id, "title", e.target.value)} placeholder="e.g. AMT School Expo" className={`w-full rounded-lg p-1.5 text-xs ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200"}`} />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-1">
                      <input type="date" value={row.deadline} onChange={e => handleUpdateDraftRow(row.id, "deadline", e.target.value)} className={`w-full rounded-lg p-1.5 text-xs ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200"}`} />
                      {draftRows.length > 1 && (
                        <button type="button" onClick={() => handleRemoveDraftRow(row.id)} className="p-1 text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
                      )}
                    </div>
                  </div>
                );
              })}
              <button type="submit" disabled={isAddingBatch} className={`w-full font-medium py-2 rounded-xl text-xs ${isDark ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-slate-900 text-white hover:bg-slate-800"}`}>
                {isAddingBatch ? "Saving..." : "Commit Manual Rows to Bucket"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-5 flex-1 w-full">
        {viewRole === "company" ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Company View</h1>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Transparent team buckets, live execution stream, and cumulative effort analytics</p>
              </div>
              {!isCompactMobile && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => setShowPrjModal(true)} className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1 shadow-sm ${isDark ? "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                    <FolderPlus className="h-3.5 w-3.5 text-indigo-500" /> + Project
                  </button>
                  <button onClick={() => setShowTskModal(true)} className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1 shadow-sm ${isDark ? "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                    <ListPlus className="h-3.5 w-3.5 text-emerald-500" /> + Task Code
                  </button>
                  <button onClick={() => setShowEmpModal(true)} className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm">
                    <UserPlus className="h-3.5 w-3.5" /> + Onboard Member
                  </button>
                </div>
              )}
            </div>

            <div className={`flex border-b text-xs sm:text-sm gap-5 overflow-x-auto ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <button onClick={() => setCompanyTab("workload")} className={`pb-2.5 font-semibold transition flex items-center gap-1.5 shrink-0 ${companyTab === "workload" ? "text-indigo-500 border-b-2 border-indigo-500" : "text-slate-400 hover:text-white"}`}>
                <Users className="h-4 w-4" /> Team Buckets
              </button>
              <button onClick={() => setCompanyTab("analytics")} className={`pb-2.5 font-semibold transition flex items-center gap-1.5 shrink-0 ${companyTab === "analytics" ? "text-indigo-500 border-b-2 border-indigo-500" : "text-slate-400 hover:text-white"}`}>
                <PieChart className="h-4 w-4" /> Project & Task Hours
              </button>
              <button onClick={() => setCompanyTab("live")} className={`pb-2.5 font-semibold transition flex items-center gap-1.5 shrink-0 ${companyTab === "live" ? "text-indigo-500 border-b-2 border-indigo-500" : "text-slate-400 hover:text-white"}`}>
                <Activity className="h-4 w-4" /> Live Today ({todayLiveLogs.length})
              </button>
            </div>

            {companyTab === "workload" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employeeWorkloadBuckets.map(b => (
                  <div key={b.Email} className={`border rounded-2xl p-4 flex flex-col justify-between shadow-sm transition-colors ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{b.Name}</h3>
                          <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{b.Role_Title}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                          {b.weekLoggedHours}h wk
                        </span>
                      </div>

                      <div className="space-y-1.5 my-3 max-h-48 overflow-y-auto pr-1">
                        {b.activeTasksList.length === 0 && <p className="text-xs text-slate-400 italic py-2">No active tasks.</p>}
                        {b.activeTasksList.map(item => (
                          <div key={item.Pulse_ID} className={`p-2.5 rounded-xl border text-xs ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200/80"}`}>
                            <div className="flex justify-between text-[11px] mb-0.5">
                              <span className="font-mono text-indigo-400 font-semibold">{item.Project_ID} • {item.Task_Code}</span>
                              <span className="font-mono font-bold text-slate-300">{item.Auto_Task_Hours || 0}%</span>
                            </div>
                            <div className={`font-medium truncate ${isDark ? "text-slate-200" : "text-slate-800"}`}>{item.Monday_Commitment}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => { setActiveEmployeeEmail(b.Email); setViewRole("employee"); }}
                      className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition ${isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
                    >
                      View Cockpit <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {companyTab === "analytics" && (
              <div className="space-y-5">
                <div className={`border rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                  <select
                    value={selectedCompanyEmp}
                    onChange={e => setSelectedCompanyEmp(e.target.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium border ${isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                  >
                    <option value="ALL">All Team Members (Cumulative)</option>
                    {employees.map(e => <option key={e.Email} value={e.Email}>{e.Name}</option>)}
                  </select>

                  <div className={`flex items-center gap-1 p-1 rounded-lg text-xs border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
                    {["WEEK", "MONTH", "ALL"].map(tf => (
                      <button
                        key={tf}
                        onClick={() => setAnalyticsTimeframe(tf)}
                        className={`px-2.5 py-1 rounded-md transition ${analyticsTimeframe === tf ? (isDark ? "bg-slate-800 text-white font-semibold" : "bg-white text-slate-900 font-semibold shadow-sm") : "text-slate-400"}`}
                      >
                        {tf === "WEEK" ? "This Week" : tf === "MONTH" ? "Month" : "All-Time"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className={`border rounded-2xl p-5 shadow-sm space-y-3 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                    <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>Hours by Project Pillar</h3>
                    {companyProjectBreakdown.map(p => (
                      <div key={p.projectId} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-800"}`}>{p.projectName}</span>
                          <span className="font-mono text-slate-400">{p.hours}h ({p.percentage}%)</span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
                          <div className="bg-indigo-600 h-full" style={{ width: `${p.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={`border rounded-2xl p-5 shadow-sm space-y-3 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                    <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>Hours by Task Code</h3>
                    {companyTaskBreakdown.map(t => (
                      <div key={t.taskCode} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-800"}`}>[{t.taskCode}] {t.taskTitle}</span>
                          <span className="font-mono text-slate-400">{t.hours}h ({t.percentage}%)</span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
                          <div className="bg-emerald-500 h-full" style={{ width: `${t.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {companyTab === "live" && (
              <div className={`border rounded-2xl divide-y shadow-sm ${isDark ? "bg-slate-900 border-slate-800 divide-slate-800" : "bg-white border-slate-200 divide-slate-100"}`}>
                {todayLiveLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">No activity logged yet today.</div>
                ) : (
                  todayLiveLogs.map(log => (
                    <div key={log.Log_ID} className="p-4 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{log.Emp_Email}</span>{" "}
                        <span className="font-mono text-indigo-400 font-semibold">[{log.Project_ID} • {log.Task_Code}]</span>
                        {log.Notes && <p className={`mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>"{log.Notes}"</p>}
                      </div>
                      <span className="font-mono font-bold text-amber-400 shrink-0">{Number(log.Task_Hours || 0) + Number(log.Learning_Hours || 0)}m</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          /* ================= EMPLOYEE COCKPIT VIEW ================= */
          <div className="space-y-5">
            <div className={`border rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  {currentEmp.Name ? currentEmp.Name[0] : "I"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{currentEmp.Name}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      {currentEmp.Level}
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{currentEmp.Role_Title}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-amber-400">{currentStreak}d Streak</span>
                </div>
              </div>
            </div>

            {!isCompactMobile && (
              <div className={`flex border-b text-xs sm:text-sm gap-6 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                <button onClick={() => setEmployeeTab("workboard")} className={`pb-2.5 font-semibold transition flex items-center gap-1.5 ${employeeTab === "workboard" ? "text-indigo-500 border-b-2 border-indigo-500" : "text-slate-400 hover:text-white"}`}>
                  <CalendarCheck className="h-4 w-4" /> Active Workboard ({currentWorkboard.length})
                </button>
                <button onClick={() => setEmployeeTab("focus")} className={`pb-2.5 font-semibold transition flex items-center gap-1.5 ${employeeTab === "focus" ? "text-indigo-500 border-b-2 border-indigo-500" : "text-slate-400 hover:text-white"}`}>
                  <BarChart3 className="h-4 w-4" /> My Time & Focus
                </button>
                <button onClick={() => setEmployeeTab("rnr")} className={`pb-2.5 font-semibold transition flex items-center gap-1.5 ${employeeTab === "rnr" ? "text-indigo-500 border-b-2 border-indigo-500" : "text-slate-400 hover:text-white"}`}>
                  <BookOpen className="h-4 w-4" /> Editable R&R
                </button>
              </div>
            )}

            {employeeTab === "workboard" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Active Bucket ({currentWorkboard.length} tasks • {collectionMetrics.percent}% completed)
                  </span>
                  <input
                    type="text"
                    value={workboardSearch}
                    onChange={e => setWorkboardSearch(e.target.value)}
                    placeholder="Filter tasks..."
                    className={`rounded-lg px-2.5 py-1 text-xs w-40 sm:w-56 focus:outline-none border ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"}`}
                  />
                </div>

                {currentWorkboard.length === 0 ? (
                  <div className={`p-8 text-center rounded-2xl border text-xs ${isDark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-400"}`}>
                    Your bucket is clear. Speak or type tasks into the command bar above!
                  </div>
                ) : (
                  <div className={`grid grid-cols-1 ${isCompactMobile ? "" : "md:grid-cols-2"} gap-3.5`}>
                    {currentWorkboard.map(item => {
                      const progress = Number(item.Auto_Task_Hours || 0);
                      const mins = Number(item.Auto_Learning_Hours || 0);
                      const isDone = progress >= 100;
                      const deadD = normalizeDateStr(item.Target_Deadline);
                      const isOverdue = !isDone && deadD && deadD < todayStr;

                      return (
                        <div key={item.Pulse_ID} className={`p-4 rounded-2xl border transition shadow-sm ${isDone ? "border-emerald-500/30 bg-emerald-500/5" : isOverdue ? "border-amber-500/40" : isDark ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-mono font-semibold border border-indigo-500/20">
                              {item.Project_ID} • {item.Task_Code}
                            </span>
                            <span className={`text-xs font-mono font-bold ${isDone ? "text-emerald-400" : isDark ? "text-slate-300" : "text-slate-700"}`}>
                              {progress}%
                            </span>
                          </div>

                          <h4 className={`font-semibold text-sm mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{item.Monday_Commitment}</h4>

                          <div className={`w-full h-1.5 rounded-full overflow-hidden mb-3 ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
                            <div className={`h-full transition-all duration-300 ${isDone ? "bg-emerald-500" : "bg-indigo-600"}`} style={{ width: `${Math.min(100, progress)}%` }} />
                          </div>

                          <div className="flex justify-between items-center text-xs pt-1">
                            <span className="font-mono text-slate-400">🕒 {(mins / 60).toFixed(1)}h • Due {deadD || "Rolling"}</span>
                            <button onClick={() => handleOpenLogModal(item)} className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm">
                              <Sliders className="h-3 w-3" /> Log Time
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {employeeTab === "focus" && (
              <div className={`border rounded-2xl p-5 shadow-sm space-y-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>Where My Time Went</h3>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Cumulative Logged: <strong className="text-indigo-400 font-mono">{personalFocusData.totalCombinedHours} hrs</strong> ({personalFocusData.projectHours}h Projects • {personalFocusData.learningHours}h Learning)
                </p>
                <div className="space-y-2.5">
                  {personalFocusData.projectBars.map(bar => (
                    <div key={bar.code} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className={isDark ? "text-slate-300" : "text-slate-800"}>{bar.name}</span>
                        <span className="font-mono text-slate-400">{bar.hours}h ({bar.percent}%)</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
                        <div className="bg-indigo-600 h-full" style={{ width: `${bar.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {employeeTab === "rnr" && (
              <div className={`border rounded-2xl p-5 shadow-sm space-y-3 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <div className="flex justify-between items-center">
                  <h4 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>My Roles & Responsibilities</h4>
                  {!isEditingRnR ? (
                    <button onClick={() => setIsEditingRnR(true)} className={`px-3 py-1 text-xs rounded-lg font-medium border ${isDark ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-100 border-slate-200 text-slate-700"}`}>Edit</button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setIsEditingRnR(false)} className="text-xs text-slate-400">Cancel</button>
                      <button onClick={handleSaveRnR} disabled={isSavingRnR} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg font-semibold">Save</button>
                    </div>
                  )}
                </div>
                {isEditingRnR ? (
                  <textarea rows="6" value={rnrDraft} onChange={e => setRnrDraft(e.target.value)} className={`w-full rounded-xl p-3 text-sm border focus:outline-none ${isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`} />
                ) : (
                  <div className={`text-sm leading-relaxed p-4 rounded-xl border whitespace-pre-line ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
                    {currentEmp["R&R_Summary"]}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      {isCompactMobile && (
        <nav className={`fixed bottom-0 left-0 right-0 border-t h-14 flex items-center justify-around z-40 max-w-md mx-auto transition-colors ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <button onClick={() => { setViewRole("employee"); setEmployeeTab("workboard"); }} className={`flex flex-col items-center gap-0.5 text-[11px] font-medium ${viewRole === "employee" && employeeTab === "workboard" ? "text-indigo-500" : "text-slate-400"}`}>
            <CalendarCheck className="h-4 w-4" /><span>Workboard</span>
          </button>
          <button onClick={() => { setViewRole("employee"); setEmployeeTab("focus"); }} className={`flex flex-col items-center gap-0.5 text-[11px] font-medium ${viewRole === "employee" && employeeTab === "focus" ? "text-indigo-500" : "text-slate-400"}`}>
            <BarChart3 className="h-4 w-4" /><span>My Focus</span>
          </button>
          <button onClick={() => setShowStandaloneLearning(true)} className="flex flex-col items-center gap-0.5 text-[11px] font-medium text-purple-400">
            <GraduationCap className="h-4 w-4" /><span>+ Learning</span>
          </button>
          <button onClick={() => setViewRole("company")} className={`flex flex-col items-center gap-0.5 text-[11px] font-medium ${viewRole === "company" ? "text-indigo-500" : "text-slate-400"}`}>
            <Building2 className="h-4 w-4" /><span>Company</span>
          </button>
        </nav>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 text-xs ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <Key className="h-4 w-4 text-indigo-500" /> Gemini AI API Key Setup
              </h3>
              {!showApiKeyModal && <button onClick={() => setShowApiKeyModal(false)} className="text-slate-400"><X className="h-4 w-4" /></button>}
            </div>
            <p className="text-slate-400 leading-relaxed">
              To enable Gemini AI to intelligently split multi-task voice inputs, time logs, and learning records, please paste your free Gemini API key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-indigo-400 underline">Google AI Studio</a>.
            </p>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => {
                setGeminiApiKey(e.target.value);
                localStorage.setItem("ie_gemini_api_key", e.target.value);
              }}
              placeholder="Paste AIzaSy... Gemini API Key"
              className={`w-full rounded-xl p-2.5 font-mono border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
            />
            <div className="flex justify-end">
              <button onClick={() => { setShowApiKeyModal(false); showToast("Gemini AI API Key saved!"); }} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl">
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Member Modal */}
      {showEmpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 text-xs ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <h3 className="text-sm font-bold">Onboard Team Member</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const entry = { Emp_ID: "IE-" + ("00" + (employees.length + 1)).slice(-3), Name: newEmp.name, Email: newEmp.email.toLowerCase().trim(), Role_Title: newEmp.roleTitle, Department: newEmp.department, Level: newEmp.level, "R&R_Summary": newEmp.rnrSummary, Status: "Active" };
              setEmployees(prev => [...prev, entry]);
              if (!activeEmployeeEmail) setActiveEmployeeEmail(entry.Email);
              setShowEmpModal(false);
              showToast(`Onboarded ${entry.Name}!`);
            }} className="space-y-3">
              <input required type="text" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className={`w-full rounded-xl p-2.5 border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="Full Name" />
              <input required type="email" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} className={`w-full rounded-xl p-2.5 border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="Email Address" />
              <input required type="text" value={newEmp.roleTitle} onChange={e => setNewEmp({...newEmp, roleTitle: e.target.value})} className={`w-full rounded-xl p-2.5 border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="Role Title" />
              <textarea rows="3" required value={newEmp.rnrSummary} onChange={e => setNewEmp({...newEmp, rnrSummary: e.target.value})} className={`w-full rounded-xl p-2.5 border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="Baseline KRAs..." />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowEmpModal(false)} className="px-3 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl">Onboard</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showPrjModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 text-xs ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <h3 className="text-sm font-bold">Add Project Pillar</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const entry = { Project_ID: newPrj.projectId.toUpperCase().trim(), Project_Name: newPrj.projectName, Priority_Level: newPrj.priority, Status: "Active" };
              setProjects(prev => [...prev, entry]);
              setShowPrjModal(false);
              showToast(`Project ${entry.Project_ID} added!`);
            }} className="space-y-3">
              <input required type="text" value={newPrj.projectId} onChange={e => setNewPrj({...newPrj, projectId: e.target.value})} className={`w-full rounded-xl p-2.5 uppercase border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="Code (e.g. PRJ-ROBO)" />
              <input required type="text" value={newPrj.projectName} onChange={e => setNewPrj({...newPrj, projectName: e.target.value})} className={`w-full rounded-xl p-2.5 border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="Project Name" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowPrjModal(false)} className="px-3 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Code Modal */}
      {showTskModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 text-xs ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <h3 className="text-sm font-bold">Add Task Code</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const finalCat = newTsk.category === "NEW" ? (newTsk.customCategory || "General") : newTsk.category;
              const entry = { Task_Code: newTsk.taskCode.toUpperCase().trim(), Task_Title: newTsk.taskTitle, Category: finalCat };
              setTasks(prev => [...prev, entry]);
              setShowTskModal(false);
              showToast(`Added task ${entry.Task_Code}`);
            }} className="space-y-3">
              <input required type="text" value={newTsk.taskCode} onChange={e => setNewTsk({...newTsk, taskCode: e.target.value})} className={`w-full rounded-xl p-2.5 uppercase border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="Code (e.g. TSK-CAD)" />
              <input required type="text" value={newTsk.taskTitle} onChange={e => setNewTsk({...newTsk, taskTitle: e.target.value})} className={`w-full rounded-xl p-2.5 border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="Task Title" />
              <select value={newTsk.category} onChange={e => setNewTsk({...newTsk, category: e.target.value})} className={`w-full rounded-xl p-2.5 border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}>
                {taskCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                <option value="NEW">+ New Category Bucket...</option>
              </select>
              {newTsk.category === "NEW" && (
                <input required type="text" value={newTsk.customCategory} onChange={e => setNewTsk({...newTsk, customCategory: e.target.value})} className={`w-full rounded-xl p-2.5 border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="New Category Name" />
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowTskModal(false)} className="px-3 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

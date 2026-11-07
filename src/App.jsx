import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Flame, CheckCircle, Clock, BookOpen, Send, Building2, 
  ChevronRight, Sparkles, RefreshCw, FolderPlus, UserPlus, 
  ListPlus, CalendarCheck, Zap, GraduationCap, LayoutGrid,
  Plus, Trash2, BarChart3, Sliders, UserCheck, Users, 
  PieChart, Activity, Edit3, Rocket, Filter, Check, Database,
  Mic, MicOff, Wand2, Smartphone, Monitor, Key, X, ArrowRight
} from 'lucide-react';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzMjWhJeFcAfKqdTT4aDENa2Pfp7gnIhVQ_rGQPPMh6UYuXle50niV3Tym-vgC_37RnTg/exec";

const DEFAULT_PROJECTS = [
  { Project_ID: "PRJ-DEXTER", Project_Name: "Dexter Box Science Kits", Priority_Level: "P1 Critical", Status: "Active" },
  { Project_ID: "PRJ-MAKER", Project_Name: "Maker Lab & School Studios", Priority_Level: "P1 Critical", Status: "Active" },
  { Project_ID: "PRJ-ATL", Project_Name: "Atal Tinkering Labs (ATL)", Priority_Level: "P1 Critical", Status: "Active" },
  { Project_ID: "PRJ-CSR", Project_Name: "CSR & NGO Partnerships", Priority_Level: "P2 High", Status: "Active" },
  { Project_ID: "PRJ-STEP", Project_Name: "Teacher Training & Workshops (STEP)", Priority_Level: "P2 High", Status: "Active" },
  { Project_ID: "PRJ-ADMIN", Project_Name: "Office Admin, HR & Internal Ops", Priority_Level: "P3 Supporting", Status: "Active" }
];

const DEFAULT_TASKS = [
  { Task_Code: "TSK-PROP", Task_Title: "Concept Notes, Proposals & Estimates", Category: "BD & Client Proposals" },
  { Task_Code: "TSK-DECK", Task_Title: "Client Pitch Decks & Presentations", Category: "BD & Client Proposals" },
  { Task_Code: "TSK-FOLLOW", Task_Title: "Client Mailing, Follow-ups & Coordination", Category: "BD & Client Proposals" },
  { Task_Code: "TSK-MEET", Task_Title: "Client Meetings, School Visits & Demos", Category: "BD & Client Proposals" },
  { Task_Code: "TSK-RND", Task_Title: "Product R&D, Prototyping & Experiments", Category: "R&D & Product Engineering" },
  { Task_Code: "TSK-BOM", Task_Title: "Bill of Materials (BOM), Sourcing & Costing", Category: "R&D & Product Engineering" },
  { Task_Code: "TSK-CURR", Task_Title: "Curriculum Mapping, Manuals & Lesson Plans", Category: "R&D & Product Engineering" },
  { Task_Code: "TSK-DES-PROD", Task_Title: "Product & Packaging Design (Boxes/Manuals)", Category: "Design & Digital Media" },
  { Task_Code: "TSK-DES-MKT", Task_Title: "Marketing Collaterals & Social Media Posters", Category: "Design & Digital Media" },
  { Task_Code: "TSK-DES-EVT", Task_Title: "Event, Expo & Workshop Signage/Backdrops", Category: "Design & Digital Media" },
  { Task_Code: "TSK-VIDEO", Task_Title: "Video Scripting, Shooting & Editing", Category: "Design & Digital Media" },
  { Task_Code: "TSK-TRN-STU", Task_Title: "Student Classroom Facilitation & Sessions", Category: "Training & Field Execution" },
  { Task_Code: "TSK-TRN-TCH", Task_Title: "Teacher Training Workshops & Mentorship", Category: "Training & Field Execution" },
  { Task_Code: "TSK-EXPO", Task_Title: "School Expo, Science Mela & Event Support", Category: "Training & Field Execution" },
  { Task_Code: "TSK-KIT-OPS", Task_Title: "Kit Assembly, QC, Packing & Dispatch", Category: "Operations & Supply Chain" },
  { Task_Code: "TSK-LAB-AUD", Task_Title: "School Lab Setup, Audit & Maintenance", Category: "Operations & Supply Chain" },
  { Task_Code: "TSK-FIN", Task_Title: "Salary Processing, Invoicing & Accounts", Category: "HR, Finance & Office Admin" },
  { Task_Code: "TSK-HR-ADM", Task_Title: "HR, Scheduling & General Office Admin", Category: "HR, Finance & Office Admin" }
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

// ================= HYBRID SMART PARSER (LOCAL KEYWORD + GEMINI AI) =================
function localSmartParse(inputText, employees, currentWorkboard, activeEmail) {
  const today = getTodayStr();
  // Split multiple tasks if user says "and also", "plus", or uses semicolons
  const segments = inputText
    .split(/\s+(?:and also|plus|then)\s+|;/i)
    .map(s => s.trim())
    .filter(Boolean);

  return segments.map((seg, idx) => {
    const lower = seg.toLowerCase();

    // 1. Detect Duration (Hours & Minutes)
    let minutes = 0;
    const hrMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h\b)/);
    const minMatch = lower.match(/(\d+)\s*(?:minutes?|mins?|m\b)/);
    if (hrMatch) minutes += Math.round(parseFloat(hrMatch[1]) * 60);
    if (minMatch) minutes += parseInt(minMatch[1], 10);
    if (lower.includes("half an hour") || lower.includes("half hour")) minutes += 30;
    if (lower.includes("one hour") || lower.includes("an hour")) minutes = Math.max(minutes, 60);
    if (lower.includes("two hours")) minutes = Math.max(minutes, 120);
    if (lower.includes("three hours")) minutes = Math.max(minutes, 180);

    // 2. Detect Progress %
    let progress = minutes > 0 ? 100 : 0;
    const progMatch = lower.match(/(\d+)\s*%/);
    if (progMatch) {
      progress = Math.min(100, Math.max(0, parseInt(progMatch[1], 10)));
    } else if (lower.includes("half done") || lower.includes("in progress")) {
      progress = 50;
    } else if (lower.includes("completed") || lower.includes("finished") || lower.includes("done")) {
      progress = 100;
    }

    // 3. Detect Intent: LOG_TIME vs ADD_TASK vs LEARNING
    let intent = minutes > 0 ? "LOG_TIME" : "ADD_TASK";
    if (lower.startsWith("add task") || lower.startsWith("plan ") || lower.startsWith("todo") || lower.includes("need to")) {
      intent = "ADD_TASK";
    }
    if (lower.includes("upskill") || lower.includes("studied") || lower.includes("learned") || lower.includes("practiced")) {
      if (minutes > 0) intent = "LOG_LEARNING";
    }

    // 4. Detect Project Pillar
    let projectId = "PRJ-MAKER";
    if (/dexter|kit|box|grade/.test(lower)) projectId = "PRJ-DEXTER";
    else if (/atl|atal|tinkering|niti/.test(lower)) projectId = "PRJ-ATL";
    else if (/csr|ngo|sponsor|foundation/.test(lower)) projectId = "PRJ-CSR";
    else if (/step|teacher|faculty|educator|pedagogy/.test(lower)) projectId = "PRJ-STEP";
    else if (/admin|salary|payroll|hr|invoice|account|office/.test(lower)) projectId = "PRJ-ADMIN";
    else if (/maker|studio|lab|amt|expo|school/.test(lower)) projectId = "PRJ-MAKER";

    // 5. Detect Specific Task Code
    let taskCode = "TSK-EXPO";
    if (/proposal|estimate|concept note|quote|rfp/.test(lower)) taskCode = "TSK-PROP";
    else if (/deck|ppt|presentation|slide/.test(lower)) taskCode = "TSK-DECK";
    else if (/follow|mail|email|call/.test(lower)) taskCode = "TSK-FOLLOW";
    else if (/meet|visit|demo|pitch/.test(lower)) taskCode = "TSK-MEET";
    else if (/bom|bill of material|sourcing|vendor|costing/.test(lower)) taskCode = "TSK-BOM";
    else if (/rnd|r&d|prototype|experiment|3d|cad|circuit/.test(lower)) taskCode = "TSK-RND";
    else if (/curriculum|manual|lesson|workbook/.test(lower)) taskCode = "TSK-CURR";
    else if (/packaging|box art|sticker|label/.test(lower)) taskCode = "TSK-DES-PROD";
    else if (/poster|social|insta|reel| flyer|marketing|brochure/.test(lower)) taskCode = "TSK-DES-MKT";
    else if (/backdrop|banner|signage|standee/.test(lower)) taskCode = "TSK-DES-EVT";
    else if (/video|shoot|edit|script|montage|audio/.test(lower)) taskCode = "TSK-VIDEO";
    else if (/teacher|educator|step/.test(lower)) taskCode = "TSK-TRN-TCH";
    else if (/student|class|session|workshop/.test(lower)) taskCode = "TSK-TRN-STU";
    else if (/expo|mela|competition|event|amt/.test(lower)) taskCode = "TSK-EXPO";
    else if (/pack|dispatch|qc|assembly|inventory/.test(lower)) taskCode = "TSK-KIT-OPS";
    else if (/audit|maintenance|setup/.test(lower)) taskCode = "TSK-LAB-AUD";
    else if (/salary|invoice|bill|finance|tax|gst/.test(lower)) taskCode = "TSK-FIN";
    else if (/hr|leave|schedule|admin/.test(lower)) taskCode = "TSK-HR-ADM";

    // 6. Detect Collaborators by Name
    const collaborators = [activeEmail].filter(Boolean);
    (employees || []).forEach(emp => {
      const firstName = (emp.Name || "").split(" ")[0].toLowerCase();
      if (firstName.length > 2 && lower.includes(firstName) && !collaborators.includes(emp.Email)) {
        collaborators.push(emp.Email);
      }
    });

    // 7. Match Existing Card in Workboard if Logging Time
    let matchedPulseId = null;
    if (intent === "LOG_TIME" && currentWorkboard?.length > 0) {
      const match = currentWorkboard.find(p => 
        p.Project_ID === projectId && p.Task_Code === taskCode && Number(p.Auto_Task_Hours || 0) < 100
      ) || currentWorkboard.find(p => 
        p.Project_ID === projectId && Number(p.Auto_Task_Hours || 0) < 100
      );
      if (match) matchedPulseId = match.Pulse_ID;
    }

    // 8. Clean Title
    let cleanTitle = seg
      .replace(/^(add task|log|spent|worked|did|completed|finished)\s*:?\s*/i, "")
      .replace(/\b\d+\s*(?:hours?|hrs?|h|minutes?|mins?|m)\b/gi, "")
      .replace(/\b\d+\s*%/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (cleanTitle.length < 3) cleanTitle = seg;
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    return {
      id: Date.now() + idx,
      intent,
      projectId,
      taskCode,
      title: cleanTitle,
      minutes: minutes || (intent === "LOG_TIME" ? 60 : 0),
      progress: intent === "ADD_TASK" ? 0 : progress,
      deadline: today,
      collaborators,
      matchedPulseId,
      learningModuleCode: "LRN-HARD-01",
      engine: "Smart Local Rules"
    };
  });
}

async function geminiSmartParse(inputText, apiKey, projects, tasks, employees, activeEmail, currentWorkboard) {
  const today = getTodayStr();
  const prompt = `You are an operational task & time parser for Infinite Engineers (IE Skool).
Today's date is ${today}. Active user email: ${activeEmail}.
Available Projects: ${JSON.stringify(projects.map(p => ({ id: p.Project_ID, name: p.Project_Name })))}
Available Tasks: ${JSON.stringify(tasks.map(t => ({ code: t.Task_Code, title: t.Task_Title, category: t.Category })))}
Available Team Members: ${JSON.stringify(employees.map(e => ({ name: e.Name, email: e.Email })))}

Parse the following user voice/text input into a JSON array of objects.
Input: "${inputText}"

Rules:
- Each object must have:
  - "intent": "ADD_TASK" (if planning/creating a task with no time spent yet) or "LOG_TIME" (if logging time spent/worked/completed) or "LOG_LEARNING" (if upskilling/studying).
  - "projectId": best matching Project_ID from Available Projects.
  - "taskCode": best matching Task_Code from Available Tasks.
  - "title": concise, clean deliverable description (include school/client names like AMT School if mentioned).
  - "minutes": integer minutes spent (e.g., 1.5 hours = 90; 0 if intent is ADD_TASK).
  - "progress": integer 0 to 100 (default 100 if LOG_TIME unless user specifies partial %; 0 if ADD_TASK).
  - "deadline": YYYY-MM-DD (default "${today}").
  - "collaborators": array of emails (always include "${activeEmail}", plus any mentioned teammate emails).
Return ONLY valid JSON array.`;

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
    let matchedPulseId = null;
    if (item.intent === "LOG_TIME" && currentWorkboard?.length > 0) {
      const match = currentWorkboard.find(p => p.Project_ID === item.projectId && p.Task_Code === item.taskCode && Number(p.Auto_Task_Hours || 0) < 100);
      if (match) matchedPulseId = match.Pulse_ID;
    }
    return {
      id: Date.now() + idx,
      intent: item.intent || "ADD_TASK",
      projectId: item.projectId || "PRJ-MAKER",
      taskCode: item.taskCode || "TSK-EXPO",
      title: item.title || inputText,
      minutes: Number(item.minutes || 0),
      progress: Number(item.progress ?? (item.intent === "LOG_TIME" ? 100 : 0)),
      deadline: item.deadline || today,
      collaborators: Array.isArray(item.collaborators) && item.collaborators.length > 0 ? item.collaborators : [activeEmail],
      matchedPulseId,
      learningModuleCode: "LRN-HARD-01",
      engine: "Gemini 2.5 Flash AI"
    };
  });
}

export default function App() {
  const [viewRole, setViewRole] = useState("employee"); // 'employee' | 'company'
  const [activeEmployeeEmail, setActiveEmployeeEmail] = useState(() => localStorage.getItem("ie_v3_active_emp") || "");
  const [companyTab, setCompanyTab] = useState("workload");
  const [employeeTab, setEmployeeTab] = useState("workboard");

  // Responsive Mobile Detection + Manual Preview Toggle
  const [isMobileScreen, setIsMobileScreen] = useState(() => window.innerWidth < 768);
  const [forceMobilePreview, setForceMobilePreview] = useState(false);
  const isCompactMobile = isMobileScreen || forceMobilePreview;

  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Persistent Data States
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

  // Smart Voice / AI Command Bar States
  const [smartInput, setSmartInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isParsingAI, setIsParsingAI] = useState(false);
  const [parsedPreviews, setParsedPreviews] = useState([]);
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem("ie_gemini_api_key") || "");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const recognitionRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters
  const [selectedCompanyEmp, setSelectedCompanyEmp] = useState("ALL");
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState("WEEK");
  const [personalFocusTimeframe, setPersonalFocusTimeframe] = useState("WEEK");
  const [workboardSearch, setWorkboardSearch] = useState("");

  // Modals
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [showPrjModal, setShowPrjModal] = useState(false);
  const [showTskModal, setShowTskModal] = useState(false);
  const [showLrnModal, setShowLrnModal] = useState(false);
  const [showStandaloneLearning, setShowStandaloneLearning] = useState(false);

  const [editingProject, setEditingProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // In-Card Logging Modal
  const [activeLoggingItem, setActiveLoggingItem] = useState(null);
  const [sessionSliderHours, setSessionSliderHours] = useState(1);
  const [sessionSliderMins, setSessionSliderMins] = useState(30);
  const [sessionProgress, setSessionProgress] = useState(50);
  const [sessionLearningModule, setSessionLearningModule] = useState("None");
  const [sessionLearningMins, setSessionLearningMins] = useState(30);
  const [sessionNotes, setSessionNotes] = useState("");
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);

  // Standalone Learning Modal
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
  const [newLrn, setNewLrn] = useState({ moduleCode: "", domain: "STEM Hardware", topicTitle: "", targetProficiency: "Intermediate" });

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
            prev.forEach(localP => {
              if (!remoteMap.has(localP.Pulse_ID)) remoteMap.set(localP.Pulse_ID, localP);
            });
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
        lastActiveTask: todayLogs.length > 0 ? todayLogs[todayLogs.length - 1].Task_Code : (activeTasks.length > 0 ? activeTasks[0].Task_Code : "Standby")
      };
    });
  }, [employees, weeklyPulses, dailyLogs, currentMondayStr, todayStr]);

  const todayLiveLogs = useMemo(() => {
    return dailyLogs.filter(l => normalizeDateStr(l.Date) === todayStr).slice().reverse();
  }, [dailyLogs, todayStr]);

  // ================= VOICE & SMART COMMAND BAR HANDLERS =================
  const handleToggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Voice input works best in Chrome, Edge, or Safari.");
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
      setSmartInput(prev => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleAnalyzeSmartInput = async (e) => {
    e.preventDefault();
    if (!smartInput.trim()) return;
    setIsParsingAI(true);

    try {
      let results = [];
      if (geminiApiKey.trim()) {
        try {
          results = await geminiSmartParse(smartInput, geminiApiKey.trim(), projects, tasks, employees, activeEmployeeEmail, currentWorkboard);
        } catch (aiErr) {
          console.log("Gemini fallback to local parser:", aiErr);
          results = localSmartParse(smartInput, employees, currentWorkboard, activeEmployeeEmail);
        }
      } else {
        results = localSmartParse(smartInput, employees, currentWorkboard, activeEmployeeEmail);
      }
      setParsedPreviews(results);
    } finally {
      setIsParsingAI(false);
    }
  };

  const handleConfirmSmartPreviews = async () => {
    if (parsedPreviews.length === 0) return;

    const newPulsesBatch = [];
    const newLogsBatch = [];

    parsedPreviews.forEach(item => {
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
            Friday_Outcome: viewRole === "company" ? "Company Lead" : "Voice/Smart Bar",
            Status: "In Progress",
            Target_Deadline: item.deadline || todayStr,
            Completed_Date: "",
            Collaborators: collabStr
          });
        });
      } else if (item.intent === "LOG_TIME") {
        const logEntry = {
          Log_ID: "LOG-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
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
              return {
                ...p,
                Auto_Task_Hours: item.progress,
                Auto_Learning_Hours: Number(p.Auto_Learning_Hours || 0) + Number(item.minutes || 60),
                Status: item.progress >= 100 ? "Completed" : "In Progress",
                Completed_Date: item.progress >= 100 ? todayStr : ""
              };
            }
            return p;
          }));
          try {
            fetch(APPS_SCRIPT_URL, {
              method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
              body: JSON.stringify({
                action: "logTaskSession",
                pulseId: item.matchedPulseId,
                email: activeEmployeeEmail,
                projectId: item.projectId,
                taskCode: item.taskCode,
                taskMinutes: Number(item.minutes || 60),
                learningModuleCode: "None",
                learningMinutes: 0,
                progressPercent: item.progress,
                currentStreak: currentStreak || 1,
                status: item.progress >= 100 ? "Done" : "In Progress",
                notes: item.title
              })
            });
          } catch (err) {}
        } else {
          // Create completed/active card on workboard AND log time
          const newPulseId = "TSK-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
          const createdCard = {
            Pulse_ID: newPulseId,
            Created_Date: todayStr,
            Emp_Email: activeEmployeeEmail,
            Project_ID: item.projectId,
            Task_Code: item.taskCode,
            Monday_Commitment: item.title,
            Auto_Task_Hours: item.progress,
            Auto_Learning_Hours: Number(item.minutes || 60),
            Friday_Outcome: "Smart Log",
            Status: item.progress >= 100 ? "Completed" : "In Progress",
            Target_Deadline: todayStr,
            Completed_Date: item.progress >= 100 ? todayStr : "",
            Collaborators: collabStr
          };
          newPulsesBatch.push(createdCard);
          try {
            fetch(APPS_SCRIPT_URL, {
              method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
              body: JSON.stringify({
                action: "logTaskSession",
                pulseId: newPulseId,
                email: activeEmployeeEmail,
                projectId: item.projectId,
                taskCode: item.taskCode,
                taskMinutes: Number(item.minutes || 60),
                learningModuleCode: "None",
                learningMinutes: 0,
                progressPercent: item.progress,
                currentStreak: currentStreak || 1,
                status: item.progress >= 100 ? "Done" : "In Progress",
                notes: item.title
              })
            });
          } catch (err) {}
        }
      } else if (item.intent === "LOG_LEARNING") {
        const lrnEntry = {
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
        };
        newLogsBatch.push(lrnEntry);
        try {
          fetch(APPS_SCRIPT_URL, {
            method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
              action: "logStandaloneLearning",
              email: activeEmployeeEmail,
              learningModuleCode: lrnEntry.Learning_Module_Code,
              learningMinutes: lrnEntry.Learning_Hours,
              currentStreak: currentStreak || 1,
              notes: item.title
            })
          });
        } catch (err) {}
      }
    });

    if (newPulsesBatch.length > 0) {
      setWeeklyPulses(prev => [...prev, ...newPulsesBatch]);
      try {
        fetch(APPS_SCRIPT_URL, {
          method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({ action: "addWorkboardBatch", items: newPulsesBatch })
        });
      } catch (err) {}
    }

    if (newLogsBatch.length > 0) {
      setDailyLogs(prev => [...prev, ...newLogsBatch]);
    }

    showToast(`✨ Processed ${parsedPreviews.length} smart action(s) into your workspace!`);
    setParsedPreviews([]);
    setSmartInput("");
  };

  // Manual Multi-Row Handlers
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

  const handleCommitBatchToBucket = async (e) => {
    e.preventDefault();
    const validRows = draftRows.filter(r => r.title.trim() !== "");
    if (validRows.length === 0) {
      showToast("Please enter a deliverable description.");
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
    setShowManualForm(false);
    showToast(`Added ${validRows.length} deliverable(s) to bucket!`);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "addWorkboardBatch", items: createdItems })
      });
    } catch (err) {} finally {
      setIsAddingBatch(false);
    }
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
          learningMinutes: lrnMins,
          progressPercent: sessionProgress,
          currentStreak: currentStreak || 1,
          status: sessionProgress >= 100 ? "Done" : "In Progress",
          notes: sessionNotes
        })
      });
    } catch (err) {} finally {
      setIsSubmittingSession(false);
    }
  };

  const handleSaveStandaloneLearning = async (e) => {
    e.preventDefault();
    const totalMins = (Number(standaloneHours) * 60) + Number(standaloneMins);
    if (totalMins === 0) return;

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
    showToast(`Logged ${totalMins}m of deliberate learning!`);
    setShowStandaloneLearning(false);
    setStandaloneNotes("");

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "logStandaloneLearning",
          email: activeEmployeeEmail,
          learningModuleCode: standaloneModule,
          learningMinutes: totalMins,
          currentStreak: currentStreak || 1,
          notes: standaloneNotes
        })
      });
    } catch (err) {}
  };

  const handleSaveRnR = async () => {
    setIsSavingRnR(true);
    setEmployees(prev => prev.map(e => {
      if ((e.Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase()) {
        return { ...e, "R&R_Summary": rnrDraft };
      }
      return e;
    }));
    showToast("Roles & Responsibilities updated!");
    setIsEditingRnR(false);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "updateEmployeeRnR", email: activeEmployeeEmail, rnrSummary: rnrDraft })
      });
    } catch (err) {} finally {
      setIsSavingRnR(false);
    }
  };

  const handleSeedCatalogToSheet = async () => {
    showToast("Syncing master catalog to Google Sheet...");
    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "seedDefaultCatalog", projects, tasks, learningModules })
      });
    } catch (err) {}
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-20 md:pb-8 ${forceMobilePreview ? "max-w-md mx-auto border-x border-slate-200 shadow-2xl" : ""}`}>
      {/* Minimalist White Top Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900">IE Goal Tracker</span>
              {!isCompactMobile && <span className="text-[11px] text-slate-500 block">Minimalist Voice & Focus OS</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile / Web Layout Toggle Button */}
            {!isMobileScreen && (
              <button
                onClick={() => setForceMobilePreview(!forceMobilePreview)}
                title="Toggle Mobile Minimal View"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition ${forceMobilePreview ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"}`}
              >
                {forceMobilePreview ? <Monitor className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
                <span>{forceMobilePreview ? "Full Web" : "Mobile View"}</span>
              </button>
            )}

            <button
              onClick={() => setShowApiKeyModal(true)}
              title="Configure Optional Gemini AI Key"
              className={`p-1.5 rounded-lg border transition ${geminiApiKey ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"}`}
            >
              <Key className="h-3.5 w-3.5" />
            </button>

            <button onClick={fetchSheetData} title="Sync with Sheet" className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg border border-slate-200 bg-white">
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            {!isCompactMobile && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  onClick={() => setViewRole("employee")}
                  className={`px-2.5 py-1 rounded-md transition ${viewRole === "employee" ? "bg-white text-slate-900 font-semibold shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  My Cockpit
                </button>
                <button
                  onClick={() => setViewRole("company")}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${viewRole === "company" ? "bg-white text-slate-900 font-semibold shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
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
                className="bg-white border border-slate-200 text-slate-800 text-xs font-medium px-2 py-1.5 rounded-lg focus:outline-none"
              >
                {employees.map(emp => (
                  <option key={emp.Email} value={emp.Email}>{emp.Name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </header>

      {/* Clean Light Mission Orbit Bar */}
      <div className="bg-white border-b border-slate-200 py-2 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 truncate">
            <Rocket className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
            <span className="font-semibold text-slate-800">Mission Orbit:</span>
            <span className="font-mono font-bold text-indigo-600">{collectiveOrbit.pooledPoints} GP</span>
            {!isCompactMobile && <span className="text-slate-500">• {collectiveOrbit.currentTier} ({collectiveOrbit.completedTasks} shipped)</span>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-28 sm:w-44 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
              <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${collectiveOrbit.progressPercent}%` }} />
            </div>
            <span className="font-mono font-semibold text-slate-700">{collectiveOrbit.progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="max-w-md mx-auto mt-3 px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-medium flex items-center gap-2 shadow-lg z-50">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= UNIFIED VOICE & AI SMART COMMAND BAR ================= */}
      <div className="max-w-6xl mx-auto px-4 pt-5 w-full">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <Wand2 className="h-3.5 w-3.5" /> Voice & Text Smart Command Bar
              <span className="text-slate-400 font-normal hidden sm:inline">
                — Speak or type to add tasks OR log completed hours automatically
              </span>
            </span>
            <button
              type="button"
              onClick={() => setShowManualForm(!showManualForm)}
              className="text-[11px] text-slate-500 hover:text-slate-900 font-medium underline"
            >
              {showManualForm ? "Hide manual form" : "Use manual dropdowns"}
            </button>
          </div>

          <form onSubmit={handleAnalyzeSmartInput} className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleVoice}
              title={isListening ? "Stop listening" : "Speak task or time log"}
              className={`p-2.5 rounded-xl border transition shrink-0 flex items-center justify-center ${
                isListening 
                  ? "bg-rose-500 text-white border-rose-600 animate-pulse shadow-md" 
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <input
              type="text"
              value={smartInput}
              onChange={(e) => setSmartInput(e.target.value)}
              placeholder={
                isCompactMobile
                  ? 'Say "2h on AMT School Expo" or "Add Dexter BOM"...'
                  : 'Speak or type: e.g. "Spent 2h with Jay on AMT School Expo" or "Add task: Finish CSR proposal"'
              }
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition"
            />

            <button
              type="submit"
              disabled={isParsingAI || !smartInput.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-sm transition"
            >
              <span>{isParsingAI ? "Sorting..." : "Auto-Bucket"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Smart Parsed Preview Pills (Editable Before Confirmation) */}
          {parsedPreviews.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Auto-Categorized Preview ({parsedPreviews[0]?.engine}):
                </span>
                <button onClick={() => setParsedPreviews([])} className="text-slate-400 hover:text-slate-600">
                  Clear
                </button>
              </div>

              <div className="space-y-2">
                {parsedPreviews.map((item, idx) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5 flex-1">
                      {/* Action Type Selector */}
                      <select
                        value={item.intent}
                        onChange={(e) => {
                          const val = e.target.value;
                          setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, intent: val, progress: val === "ADD_TASK" ? 0 : 100 } : p));
                        }}
                        className={`font-bold px-2 py-1 rounded-md border text-[11px] ${
                          item.intent === "LOG_TIME" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : item.intent === "LOG_LEARNING"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        <option value="ADD_TASK">+ Add to Bucket</option>
                        <option value="LOG_TIME">✓ Log Time Spent</option>
                        <option value="LOG_LEARNING">🎓 Log Learning</option>
                      </select>

                      {/* Project Selector */}
                      <select
                        value={item.projectId}
                        onChange={(e) => setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, projectId: e.target.value } : p))}
                        className="bg-white border border-slate-200 text-slate-800 font-mono text-[11px] px-2 py-1 rounded-md"
                      >
                        {projects.map(prj => <option key={prj.Project_ID} value={prj.Project_ID}>{prj.Project_ID}</option>)}
                      </select>

                      {/* Task Selector */}
                      <select
                        value={item.taskCode}
                        onChange={(e) => setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, taskCode: e.target.value } : p))}
                        className="bg-white border border-slate-200 text-slate-800 font-mono text-[11px] px-2 py-1 rounded-md"
                      >
                        {tasks.map(t => <option key={t.Task_Code} value={t.Task_Code}>{t.Task_Code} ({t.Task_Title.slice(0, 18)})</option>)}
                      </select>

                      {/* Editable Deliverable Title */}
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, title: e.target.value } : p))}
                        className="flex-1 min-w-[160px] bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-900 font-medium"
                      />
                    </div>

                    {/* Duration & Progress Controls */}
                    <div className="flex items-center gap-2">
                      {item.intent !== "ADD_TASK" && (
                        <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-md">
                          <Clock className="h-3 w-3 text-amber-500" />
                          <input
                            type="number"
                            min="5"
                            step="5"
                            value={item.minutes}
                            onChange={(e) => setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, minutes: Number(e.target.value) } : p))}
                            className="w-12 text-right font-mono font-bold text-slate-800 focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-400">m</span>
                        </div>
                      )}
                      {item.intent === "LOG_TIME" && (
                        <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-md">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="10"
                            value={item.progress}
                            onChange={(e) => setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, progress: Number(e.target.value) } : p))}
                            className="w-10 text-right font-mono font-bold text-emerald-600 focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-400">%</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleConfirmSmartPreviews}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="h-3.5 w-3.5" /> Confirm & Save All ({parsedPreviews.length})
                </button>
              </div>
            </div>
          )}

          {/* Collapsible Manual Multi-Row Form */}
          {showManualForm && (
            <form onSubmit={handleCommitBatchToBucket} className="mt-4 pt-4 border-t border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-700">Manual Multi-Row Task Builder</span>
                <button type="button" onClick={handleAddDraftRow} className="text-xs text-indigo-600 font-medium">+ Add Row</button>
              </div>
              {draftRows.map((row) => {
                const filteredTasks = tasks.filter(t => t.Category === row.category);
                return (
                  <div key={row.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 items-end">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-500 block mb-0.5">Project</label>
                      <select value={row.projectId} onChange={e => handleUpdateDraftRow(row.id, "projectId", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs">
                        {projects.map(p => <option key={p.Project_ID} value={p.Project_ID}>{p.Project_Name}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-[10px] text-slate-500 block mb-0.5">Category</label>
                      <select value={row.category} onChange={e => handleUpdateDraftRow(row.id, "category", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs">
                        {taskCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-500 block mb-0.5">Task Code</label>
                      <select value={row.taskCode} onChange={e => handleUpdateDraftRow(row.id, "taskCode", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs">
                        {(filteredTasks.length > 0 ? filteredTasks : tasks).map(t => (
                          <option key={t.Task_Code} value={t.Task_Code}>[{t.Task_Code}] {t.Task_Title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-[10px] text-slate-500 block mb-0.5">Deliverable / Client</label>
                      <input type="text" required value={row.title} onChange={e => handleUpdateDraftRow(row.id, "title", e.target.value)} placeholder="e.g. AMT School Expo" className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs" />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-1">
                      <input type="date" value={row.deadline} onChange={e => handleUpdateDraftRow(row.id, "deadline", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs" />
                      {draftRows.length > 1 && (
                        <button type="button" onClick={() => handleRemoveDraftRow(row.id)} className="p-1 text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
                      )}
                    </div>
                  </div>
                );
              })}

              {employees.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">Collaborators:</span>
                  {employees.map(emp => {
                    const isSelected = selectedCollaborators.includes(emp.Email);
                    return (
                      <button
                        key={emp.Email}
                        type="button"
                        onClick={() => {
                          if (isSelected && selectedCollaborators.length > 1) setSelectedCollaborators(selectedCollaborators.filter(e => e !== emp.Email));
                          else if (!isSelected) setSelectedCollaborators([...selectedCollaborators, emp.Email]);
                        }}
                        className={`px-2.5 py-0.5 rounded-full text-xs border ${isSelected ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200"}`}
                      >
                        {emp.Name}
                      </button>
                    );
                  })}
                </div>
              )}

              <button type="submit" disabled={isAddingBatch} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-xl text-xs">
                {isAddingBatch ? "Saving..." : "Commit Manual Rows to Bucket"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-5 flex-1 w-full">
        {viewRole === "company" ? (
          /* ================= COMPANY VIEW ================= */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Company View</h1>
                <p className="text-xs text-slate-500">Transparent team buckets, live execution stream, and cumulative effort analytics</p>
              </div>
              {!isCompactMobile && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => setShowPrjModal(true)} className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 flex items-center gap-1 shadow-sm">
                    <FolderPlus className="h-3.5 w-3.5 text-indigo-600" /> + Project
                  </button>
                  <button onClick={() => setShowTskModal(true)} className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 flex items-center gap-1 shadow-sm">
                    <ListPlus className="h-3.5 w-3.5 text-emerald-600" /> + Task Code
                  </button>
                  <button onClick={() => setShowEmpModal(true)} className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm">
                    <UserPlus className="h-3.5 w-3.5" /> + Onboard Member
                  </button>
                </div>
              )}
            </div>

            {/* Company View Tabs */}
            <div className="flex border-b border-slate-200 text-xs sm:text-sm gap-5 overflow-x-auto">
              <button onClick={() => setCompanyTab("workload")} className={`pb-2.5 font-semibold transition flex items-center gap-1.5 shrink-0 ${companyTab === "workload" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"}`}>
                <Users className="h-4 w-4" /> Team Buckets
              </button>
              <button onClick={() => setCompanyTab("analytics")} className={`pb-2.5 font-semibold transition flex items-center gap-1.5 shrink-0 ${companyTab === "analytics" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"}`}>
                <PieChart className="h-4 w-4" /> Project & Task Hours
              </button>
              <button onClick={() => setCompanyTab("live")} className={`pb-2.5 font-semibold transition flex items-center gap-1.5 shrink-0 ${companyTab === "live" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"}`}>
                <Activity className="h-4 w-4" /> Live Today ({todayLiveLogs.length})
              </button>
              {!isCompactMobile && (
                <button onClick={() => setCompanyTab("catalog")} className={`pb-2.5 font-semibold transition flex items-center gap-1.5 shrink-0 ${companyTab === "catalog" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"}`}>
                  <LayoutGrid className="h-4 w-4" /> Catalog Manager
                </button>
              )}
            </div>

            {companyTab === "workload" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employeeWorkloadBuckets.map(b => (
                  <div key={b.Email} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900">{b.Name}</h3>
                          <span className="text-xs text-slate-500">{b.Role_Title}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700 font-medium">
                          {b.weekLoggedHours}h wk
                        </span>
                      </div>

                      <div className="space-y-1.5 my-3 max-h-48 overflow-y-auto pr-1">
                        {b.activeTasksList.length === 0 && (
                          <p className="text-xs text-slate-400 italic py-2">No active tasks in bucket.</p>
                        )}
                        {b.activeTasksList.map(item => (
                          <div key={item.Pulse_ID} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                            <div className="flex justify-between text-[11px] mb-0.5">
                              <span className="font-mono text-indigo-600 font-semibold">{item.Project_ID} • {item.Task_Code}</span>
                              <span className="font-mono font-bold text-slate-700">{item.Auto_Task_Hours || 0}%</span>
                            </div>
                            <div className="text-slate-800 font-medium truncate">{item.Monday_Commitment}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveEmployeeEmail(b.Email);
                        setViewRole("employee");
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                    >
                      View Cockpit <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {companyTab === "analytics" && (
              <div className="space-y-5">
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <select
                    value={selectedCompanyEmp}
                    onChange={e => setSelectedCompanyEmp(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 text-xs px-3 py-1.5 rounded-lg font-medium"
                  >
                    <option value="ALL">All Team Members (Cumulative)</option>
                    {employees.map(e => <option key={e.Email} value={e.Email}>{e.Name}</option>)}
                  </select>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                    {["WEEK", "MONTH", "ALL"].map(tf => (
                      <button
                        key={tf}
                        onClick={() => setAnalyticsTimeframe(tf)}
                        className={`px-2.5 py-1 rounded-md transition ${analyticsTimeframe === tf ? "bg-white text-slate-900 font-semibold shadow-sm" : "text-slate-600"}`}
                      >
                        {tf === "WEEK" ? "This Week" : tf === "MONTH" ? "Month" : "All-Time"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <h3 className="font-bold text-sm text-slate-900">Hours by Project Pillar</h3>
                    {companyProjectBreakdown.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4">No hours logged in this window.</p>
                    ) : (
                      companyProjectBreakdown.map(p => (
                        <div key={p.projectId} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-800">{p.projectName}</span>
                            <span className="font-mono text-slate-600">{p.hours}h ({p.percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full" style={{ width: `${p.percentage}%` }} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <h3 className="font-bold text-sm text-slate-900">Hours by Task Category</h3>
                    {companyTaskBreakdown.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4">No hours logged in this window.</p>
                    ) : (
                      companyTaskBreakdown.map(t => (
                        <div key={t.taskCode} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-800">[{t.taskCode}] {t.taskTitle}</span>
                            <span className="font-mono text-slate-600">{t.hours}h ({t.percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: `${t.percentage}%` }} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {companyTab === "live" && (
              <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm">
                {todayLiveLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">No activity logged yet today ({todayStr}).</div>
                ) : (
                  todayLiveLogs.map(log => (
                    <div key={log.Log_ID} className="p-4 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{log.Emp_Email}</span>{" "}
                        <span className="font-mono text-indigo-600 font-semibold">[{log.Project_ID} • {log.Task_Code}]</span>
                        {log.Notes && <p className="text-slate-600 mt-0.5">"{log.Notes}"</p>}
                      </div>
                      <span className="font-mono font-bold text-slate-800 shrink-0">
                        {Number(log.Task_Hours || 0) + Number(log.Learning_Hours || 0)}m
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {companyTab === "catalog" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Master Catalog Sync</h3>
                    <p className="text-xs text-slate-500">Push default projects and task categories to Google Sheets</p>
                  </div>
                  <button onClick={handleSeedCatalogToSheet} className="px-3.5 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold">
                    ⚡ Sync Catalog to Sheet
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ================= EMPLOYEE COCKPIT VIEW (WEB & MOBILE ADAPTIVE) ================= */
          <div className="space-y-5">
            {/* Compact Employee Header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  {currentEmp.Name ? currentEmp.Name[0] : "I"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">{currentEmp.Name}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {currentEmp.Level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{currentEmp.Role_Title}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-amber-800">{currentStreak}d Streak</span>
                </div>
                {!isCompactMobile && (
                  <button
                    onClick={() => setShowStandaloneLearning(true)}
                    className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <GraduationCap className="h-4 w-4" /> + Log Learning
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Sub-Tabs (Hidden on Mobile because Mobile uses Bottom Bar) */}
            {!isCompactMobile && (
              <div className="flex border-b border-slate-200 text-xs sm:text-sm gap-6">
                <button onClick={() => setEmployeeTab("workboard")} className={`pb-2.5 font-semibold transition flex items-center gap-1.5 ${employeeTab === "workboard" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>
                  <CalendarCheck className="h-4 w-4" /> Active Workboard ({currentWorkboard.length})
                </button>
                <button onClick={() => setEmployeeTab("focus")} className={`pb-2.5 font-semibold transition flex items-center gap-1.5 ${employeeTab === "focus" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>
                  <BarChart3 className="h-4 w-4" /> My Time & Focus ({personalFocusData.totalCombinedHours}h)
                </button>
                <button onClick={() => setEmployeeTab("rnr")} className={`pb-2.5 font-semibold transition flex items-center gap-1.5 ${employeeTab === "rnr" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>
                  <BookOpen className="h-4 w-4" /> Editable R&R
                </button>
              </div>
            )}

            {/* TAB 1: MINIMALIST TASK CARDS */}
            {employeeTab === "workboard" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600">
                    Active Bucket ({currentWorkboard.length} tasks • {collectionMetrics.percent}% avg completion)
                  </span>
                  <input
                    type="text"
                    value={workboardSearch}
                    onChange={e => setWorkboardSearch(e.target.value)}
                    placeholder="Filter tasks..."
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 w-40 sm:w-56 focus:outline-none"
                  />
                </div>

                {currentWorkboard.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                    Your bucket is clear. Use the voice/text bar above to add tasks or log work.
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
                        <div key={item.Pulse_ID} className={`p-4 rounded-2xl bg-white border transition shadow-sm ${isDone ? "border-emerald-200 bg-emerald-50/20" : isOverdue ? "border-amber-300" : "border-slate-200 hover:border-slate-300"}`}>
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-semibold border border-indigo-100">
                                {item.Project_ID} • {item.Task_Code}
                              </span>
                              {item.Collaborators && item.Collaborators.includes(",") && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium flex items-center gap-1">
                                  <Users className="h-3 w-3" /> Collab
                                </span>
                              )}
                            </div>
                            <span className={`text-xs font-mono font-bold ${isDone ? "text-emerald-600" : "text-slate-700"}`}>
                              {progress}%
                            </span>
                          </div>

                          <h4 className="font-semibold text-sm text-slate-900 mb-2">{item.Monday_Commitment}</h4>

                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-3">
                            <div className={`h-full transition-all duration-300 ${isDone ? "bg-emerald-500" : "bg-indigo-600"}`} style={{ width: `${Math.min(100, progress)}%` }} />
                          </div>

                          <div className="flex justify-between items-center text-xs pt-1">
                            <div className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span className="font-mono text-slate-700 font-medium">🕒 {(mins / 60).toFixed(1)}h</span>
                              <span>• Due {deadD || "Rolling"}</span>
                            </div>
                            <button
                              onClick={() => handleOpenLogModal(item)}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                            >
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

            {/* TAB 2: PERSONAL FOCUS BAR GRAPH */}
            {employeeTab === "focus" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Where My Time Went</h3>
                    <p className="text-xs text-slate-500">
                      Cumulative Logged: <strong className="text-indigo-600 font-mono">{personalFocusData.totalCombinedHours} hrs</strong> ({personalFocusData.projectHours}h Projects • {personalFocusData.learningHours}h Learning)
                    </p>
                  </div>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
                    <button onClick={() => setPersonalFocusTimeframe("WEEK")} className={`px-2.5 py-1 rounded-md ${personalFocusTimeframe === "WEEK" ? "bg-white font-semibold shadow-sm" : "text-slate-600"}`}>Week</button>
                    <button onClick={() => setPersonalFocusTimeframe("MONTH")} className={`px-2.5 py-1 rounded-md ${personalFocusTimeframe === "MONTH" ? "bg-white font-semibold shadow-sm" : "text-slate-600"}`}>Month</button>
                  </div>
                </div>

                {personalFocusData.totalCombinedMins === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No hours logged yet for this period.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <span className="text-xs font-semibold text-slate-500 uppercase">By Project Pillar</span>
                      {personalFocusData.projectBars.map(bar => (
                        <div key={bar.code} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-800">{bar.name}</span>
                            <span className="font-mono text-slate-600">{bar.hours}h ({bar.percent}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full" style={{ width: `${bar.percent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-xs font-semibold text-slate-500 uppercase">By Activity Type</span>
                      {personalFocusData.taskBars.map(bar => (
                        <div key={bar.code} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-800">[{bar.code}] {bar.name}</span>
                            <span className="font-mono text-slate-600">{bar.hours}h ({bar.percent}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: `${bar.percent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: EDITABLE R&R */}
            {employeeTab === "rnr" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-slate-900">My Roles & Responsibilities</h4>
                  {!isEditingRnR ? (
                    <button onClick={() => setIsEditingRnR(true)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg font-medium flex items-center gap-1">
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setIsEditingRnR(false)} className="text-xs text-slate-500">Cancel</button>
                      <button onClick={handleSaveRnR} disabled={isSavingRnR} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg font-semibold">Save</button>
                    </div>
                  )}
                </div>
                {isEditingRnR ? (
                  <textarea rows="6" value={rnrDraft} onChange={e => setRnrDraft(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800" />
                ) : (
                  <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/70 whitespace-pre-line">
                    {currentEmp["R&R_Summary"]}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {isCompactMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-14 flex items-center justify-around z-40 max-w-md mx-auto">
          <button
            onClick={() => { setViewRole("employee"); setEmployeeTab("workboard"); }}
            className={`flex flex-col items-center gap-0.5 text-[11px] font-medium ${viewRole === "employee" && employeeTab === "workboard" ? "text-indigo-600" : "text-slate-400"}`}
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Workboard</span>
          </button>
          <button
            onClick={() => { setViewRole("employee"); setEmployeeTab("focus"); }}
            className={`flex flex-col items-center gap-0.5 text-[11px] font-medium ${viewRole === "employee" && employeeTab === "focus" ? "text-indigo-600" : "text-slate-400"}`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>My Focus</span>
          </button>
          <button
            onClick={() => setShowStandaloneLearning(true)}
            className="flex flex-col items-center gap-0.5 text-[11px] font-medium text-purple-600"
          >
            <GraduationCap className="h-4 w-4" />
            <span>+ Learning</span>
          </button>
          <button
            onClick={() => setViewRole("company")}
            className={`flex flex-col items-center gap-0.5 text-[11px] font-medium ${viewRole === "company" ? "text-indigo-600" : "text-slate-400"}`}
          >
            <Building2 className="h-4 w-4" />
            <span>Company</span>
          </button>
        </nav>
      )}

      {/* MODAL 1: IN-CARD LOGGING SLIDERS (LIGHT THEME) */}
      {activeLoggingItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-semibold">
                  {activeLoggingItem.Project_ID} • {activeLoggingItem.Task_Code}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{activeLoggingItem.Monday_Commitment}</h3>
              </div>
              <button onClick={() => setActiveLoggingItem(null)} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleSaveTaskSession} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-semibold">Duration:</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-mono font-bold">
                    {sessionSliderHours}h {sessionSliderMins}m ({(sessionSliderHours * 60) + sessionSliderMins}m)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Hours: {sessionSliderHours}h</span>
                    <input type="range" min="0" max="8" step="1" value={sessionSliderHours} onChange={e => setSessionSliderHours(Number(e.target.value))} className="w-full accent-indigo-600" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Minutes: {sessionSliderMins}m</span>
                    <input type="range" min="0" max="45" step="15" value={sessionSliderMins} onChange={e => setSessionSliderMins(Number(e.target.value))} className="w-full accent-indigo-600" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-semibold">Completion %:</span>
                  <span className="font-mono font-bold text-emerald-600">{sessionProgress}%</span>
                </div>
                <input type="range" min="0" max="100" step="5" value={sessionProgress} onChange={e => setSessionProgress(Number(e.target.value))} className="w-full accent-emerald-600" />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Notes (Optional)</label>
                <input type="text" value={sessionNotes} onChange={e => setSessionNotes(e.target.value)} placeholder="What was completed?" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900" />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setActiveLoggingItem(null)} className="px-3 py-2 text-slate-500">Cancel</button>
                <button type="submit" disabled={isSubmittingSession} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl">
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: OPTIONAL GEMINI AI API KEY SETUP */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Key className="h-4 w-4 text-indigo-600" /> Hybrid AI Engine Settings
              </h3>
              <button onClick={() => setShowApiKeyModal(false)} className="text-slate-400"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-slate-600 leading-relaxed">
              By default, the Smart Bar uses the <strong>Instant Local Keyword Engine</strong> (zero API key required). Paste a free <strong>Gemini API Key</strong> below to enable deep natural language sentence splitting via Gemini 2.5 Flash.
            </p>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => {
                setGeminiApiKey(e.target.value);
                localStorage.setItem("ie_gemini_api_key", e.target.value);
              }}
              placeholder="Paste AIzaSy... Gemini API Key (Optional)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
            />
            <div className="flex justify-end">
              <button onClick={() => { setShowApiKeyModal(false); showToast("Smart Engine preference saved!"); }} className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: STANDALONE LEARNING */}
      {showStandaloneLearning && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Log Deliberate Upskilling</h3>
            <form onSubmit={handleSaveStandaloneLearning} className="space-y-3">
              <select value={standaloneModule} onChange={e => setStandaloneModule(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800">
                {learningModules.map(m => <option key={m.Module_Code} value={m.Module_Code}>[{m.Module_Code}] {m.Topic_Title}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block mb-1">Hours: {standaloneHours}h</span>
                  <input type="range" min="0" max="4" step="1" value={standaloneHours} onChange={e => setStandaloneHours(Number(e.target.value))} className="w-full accent-purple-600" />
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Minutes: {standaloneMins}m</span>
                  <input type="range" min="0" max="45" step="15" value={standaloneMins} onChange={e => setStandaloneMins(Number(e.target.value))} className="w-full accent-purple-600" />
                </div>
              </div>
              <input type="text" required value={standaloneNotes} onChange={e => setStandaloneNotes(e.target.value)} placeholder="What did you practice or build?" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowStandaloneLearning(false)} className="px-3 py-2 text-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-xl">Save Learning</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ONBOARD MEMBER */}
      {showEmpModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Onboard Team Member</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const entry = { Emp_ID: "IE-" + ("00" + (employees.length + 1)).slice(-3), Name: newEmp.name, Email: newEmp.email.toLowerCase().trim(), Role_Title: newEmp.roleTitle, Department: newEmp.department, Level: newEmp.level, "R&R_Summary": newEmp.rnrSummary, Status: "Active" };
              setEmployees(prev => [...prev, entry]);
              if (!activeEmployeeEmail) setActiveEmployeeEmail(entry.Email);
              setShowEmpModal(false);
              showToast(`Onboarded ${entry.Name}!`);
              try { fetch(APPS_SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ action: "addEmployee", ...newEmp }) }); } catch (err) {}
            }} className="space-y-3">
              <input required type="text" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5" placeholder="Full Name" />
              <input required type="email" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5" placeholder="Email Address" />
              <input required type="text" value={newEmp.roleTitle} onChange={e => setNewEmp({...newEmp, roleTitle: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5" placeholder="Role Title" />
              <textarea rows="3" required value={newEmp.rnrSummary} onChange={e => setNewEmp({...newEmp, rnrSummary: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5" placeholder="Baseline KRAs..." />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowEmpModal(false)} className="px-3 py-2 text-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl">Onboard</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD PROJECT */}
      {showPrjModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Add Project Pillar</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const entry = { Project_ID: newPrj.projectId.toUpperCase().trim(), Project_Name: newPrj.projectName, Priority_Level: newPrj.priority, Status: "Active" };
              setProjects(prev => [...prev, entry]);
              setShowPrjModal(false);
              try { fetch(APPS_SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ action: "createProject", ...newPrj }) }); } catch (err) {}
            }} className="space-y-3">
              <input required type="text" value={newPrj.projectId} onChange={e => setNewPrj({...newPrj, projectId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 uppercase" placeholder="Code (e.g. PRJ-ROBO)" />
              <input required type="text" value={newPrj.projectName} onChange={e => setNewPrj({...newPrj, projectName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5" placeholder="Project Name" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowPrjModal(false)} className="px-3 py-2 text-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: ADD TASK CODE */}
      {showTskModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Add Task Code</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const finalCat = newTsk.category === "NEW" ? (newTsk.customCategory || "General") : newTsk.category;
              const entry = { Task_Code: newTsk.taskCode.toUpperCase().trim(), Task_Title: newTsk.taskTitle, Category: finalCat };
              setTasks(prev => [...prev, entry]);
              setShowTskModal(false);
              try { fetch(APPS_SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ action: "createTask", taskCode: entry.Task_Code, taskTitle: entry.Task_Title, category: finalCat }) }); } catch (err) {}
            }} className="space-y-3">
              <input required type="text" value={newTsk.taskCode} onChange={e => setNewTsk({...newTsk, taskCode: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 uppercase" placeholder="Code (e.g. TSK-CAD)" />
              <input required type="text" value={newTsk.taskTitle} onChange={e => setNewTsk({...newTsk, taskTitle: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5" placeholder="Task Title" />
              <select value={newTsk.category} onChange={e => setNewTsk({...newTsk, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                {taskCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                <option value="NEW">+ New Category Bucket...</option>
              </select>
              {newTsk.category === "NEW" && (
                <input required type="text" value={newTsk.customCategory} onChange={e => setNewTsk({...newTsk, customCategory: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5" placeholder="New Category Name" />
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowTskModal(false)} className="px-3 py-2 text-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

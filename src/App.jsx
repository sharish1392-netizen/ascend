import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Flame, CheckCircle, Clock, BookOpen, Building2, 
  Sparkles, RefreshCw, FolderPlus, UserPlus, 
  ListPlus, CalendarCheck, GraduationCap,
  Plus, Trash2, BarChart3, Users, 
  Edit3, Rocket, Check,
  Mic, MicOff, Wand2, Key, X, ArrowRight,
  Sun, Moon, Table, CheckSquare, Square, RotateCcw
} from 'lucide-react';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz4v1XX9-m0Zu_xEgEzyeCI361wydctuHupDCxgPEhfDWuqgD-AtVrESJ-s6cE4kA2xtA/exec";

const DEFAULT_PROJECTS = [
  { Project_ID: "PRJ-DEXTER", Project_Name: "Dexter Box", Full_Name: "Dexter Box Science Kits", Priority_Level: "P1 Critical", Status: "Active" },
  { Project_ID: "PRJ-MAKER", Project_Name: "Maker Lab", Full_Name: "Maker Lab & School Studios", Priority_Level: "P1 Critical", Status: "Active" },
  { Project_ID: "PRJ-ATL", Project_Name: "ATL Lab", Full_Name: "Atal Tinkering Labs (ATL)", Priority_Level: "P1 Critical", Status: "Active" },
  { Project_ID: "PRJ-CSR", Project_Name: "CSR & NGO", Full_Name: "CSR & NGO Partnerships", Priority_Level: "P2 High", Status: "Active" },
  { Project_ID: "PRJ-STEP", Project_Name: "Teacher Training", Full_Name: "Teacher Training & Workshops (STEP)", Priority_Level: "P2 High", Status: "Active" },
  { Project_ID: "PRJ-ADMIN", Project_Name: "Admin & Ops", Full_Name: "Office Admin, HR & Internal Ops", Priority_Level: "P3 Supporting", Status: "Active" }
];

const DEFAULT_TASKS = [
  { Task_Code: "TSK-PROP", Task_Title: "Proposals & Estimates", Category: "BD & Client Proposals", Aliases: "proposal, estimate, concept note, quote, tender, rfp, mou" },
  { Task_Code: "TSK-DECK", Task_Title: "Pitch Decks & PPTs", Category: "BD & Client Proposals", Aliases: "deck, ppt, presentation, slides" },
  { Task_Code: "TSK-FOLLOW", Task_Title: "Client Follow-ups & Mail", Category: "BD & Client Proposals", Aliases: "follow up, followup, mail, email, calling" },
  { Task_Code: "TSK-MEET", Task_Title: "Client Meetings & Demos", Category: "BD & Client Proposals", Aliases: "meeting, school visit, demo, pitch" },
  { Task_Code: "TSK-RND", Task_Title: "Product R&D & Prototyping", Category: "R&D & Product Engineering", Aliases: "rnd, r&d, prototype, experiment, 3d print, laser cut, cad, mdf" },
  { Task_Code: "TSK-BOM", Task_Title: "BOM, Sourcing & Costing", Category: "R&D & Product Engineering", Aliases: "bom, bill of materials, sourcing, vendor, supplier, procurement" },
  { Task_Code: "TSK-CURR", Task_Title: "Curriculum & Manuals", Category: "R&D & Product Engineering", Aliases: "curriculum, manual, workbook, lesson plan, syllabus" },
  { Task_Code: "TSK-DES-PROD", Task_Title: "Product & Box Design", Category: "Design & Digital Media", Aliases: "packaging, box design, sticker, label" },
  { Task_Code: "TSK-DES-MKT", Task_Title: "Marketing Posters & Social", Category: "Design & Digital Media", Aliases: "poster, social media, brochure, flyer, marketing" },
  { Task_Code: "TSK-DES-EVT", Task_Title: "Event Signage & Backdrops", Category: "Design & Digital Media", Aliases: "backdrop, banner, standee, signage" },
  { Task_Code: "TSK-VIDEO", Task_Title: "Video Shoot & Editing", Category: "Design & Digital Media", Aliases: "video, shooting, editing, script, montage, reel, audio" },
  { Task_Code: "TSK-TRN-STU", Task_Title: "Student Sessions", Category: "Training & Field Execution", Aliases: "student training, classroom session, facilitation, workshop, class" },
  { Task_Code: "TSK-TRN-TCH", Task_Title: "Teacher Training", Category: "Training & Field Execution", Aliases: "teacher training, educator workshop, step program, faculty" },
  { Task_Code: "TSK-EXPO", Task_Title: "School Expo & Event Support", Category: "Training & Field Execution", Aliases: "expo, science mela, exhibition, booth setup, amt, teacon" },
  { Task_Code: "TSK-KIT-OPS", Task_Title: "Kit Packing, QC & Dispatch", Category: "Operations & Supply Chain", Aliases: "packing, kit assembly, dispatch, quality check, qc, kitting" },
  { Task_Code: "TSK-LAB-AUD", Task_Title: "Lab Setup & Audit", Category: "Operations & Supply Chain", Aliases: "lab setup, inventory audit, calibration, maintenance" },
  { Task_Code: "TSK-FIN", Task_Title: "Accounts, Bills & Payroll", Category: "HR, Finance & Office Admin", Aliases: "salary, payroll, invoice, billing, accounts, gst, receipt" },
  { Task_Code: "TSK-HR-ADM", Task_Title: "HR & Office Admin", Category: "HR, Finance & Office Admin", Aliases: "hr, recruitment, onboarding, admin, schedule" }
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

// ================= ANTI-DUPLICATE EXISTING TASK MATCHER =================
function findBestExistingTaskMatch(segmentTitle, projectId, taskCode, currentWorkboard) {
  if (!currentWorkboard || currentWorkboard.length === 0) return null;
  const unfinished = currentWorkboard.filter(p => Number(p.Auto_Task_Hours || 0) < 100);
  if (unfinished.length === 0) return null;

  const stopWords = new Set(["spent", "worked", "hours", "hour", "mins", "minutes", "with", "for", "the", "and", "task", "add", "done", "completed", "finished", "today", "project", "logged", "update", "on", "in"]);
  const segWords = (segmentTitle || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));

  let bestMatch = null;
  let bestScore = 0;

  unfinished.forEach(item => {
    let score = 0;
    const itemTitle = (item.Monday_Commitment || "").toLowerCase();
    if (item.Project_ID === projectId) score += 2;
    if (item.Task_Code === taskCode) score += 2;

    segWords.forEach(w => {
      if (itemTitle.includes(w)) score += 3;
    });

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  });

  // Require either a keyword overlap in title OR exact project + taskCode match
  return bestScore >= 4 ? bestMatch : null;
}

// ================= ROBUST MULTI-CLAUSE SPLITTER =================
function splitSpokenMultiTasks(rawInput) {
  if (!rawInput) return [];
  let text = rawInput
    .replace(/\bone and a half hours?\b/gi, "1.5 hours")
    .replace(/\ba couple of hours\b/gi, "2 hours")
    .replace(/\ban hour\b/gi, "1 hour")
    .replace(/\bone hour\b/gi, "1 hour")
    .replace(/\btwo hours\b/gi, "2 hours")
    .replace(/\bthree hours\b/gi, "3 hours")
    .replace(/\bfour hours\b/gi, "4 hours")
    .replace(/\bhalf an hour\b/gi, "30 mins")
    .replace(/\bhalf hour\b/gi, "30 mins");

  // 1. Split on explicit transition words
  text = text.replace(/\s*(?:;|\band then\b|\balso\b|\bplus\b|\bafter that\b|\bnext\b|\bsecondly\b|\bthirdly\b|\bapart from that\b|\bas well as\b)\s*/gi, " ||| ");

  // 2. Split on comma or "and" when followed by an action verb or a time duration
  text = text.replace(/(?:,\s*|\s+and\s+)(?=(?:spent|worked|did|completed|finished|logged|add|create|plan|need to|have to|studied|learned|practiced|upskilled|updated|\d+(?:\.\d+)?\s*(?:hours?|hrs?|h|minutes?|mins?|m)\b))/gi, " ||| ");

  // 3. Split when a duration is at the end of a clause followed by comma/and (e.g. " worked on AMT expo for 2 hours and Dexter BOM for 45 mins")
  text = text.replace(/(\b\d+(?:\.\d+)?\s*(?:hours?|hrs?|h|minutes?|mins?|m)\b)\s*(?:,\s*|\s+and\s+)(?=[a-zA-Z])/gi, "$1 ||| ");

  const parts = text.split("|||").map(s => s.trim()).filter(Boolean);
  return parts.length > 0 ? parts : [rawInput.trim()];
}

function matchOrMintTaskCode(segmentText, tasksCatalog, learnedAliasesMap) {
  const lower = segmentText.toLowerCase();
  const stopWords = new Set(["spent", "worked", "hours", "hour", "mins", "minutes", "with", "for", "the", "and", "task", "add", "done", "completed", "finished", "today", "school", "project", "team", "from", "into", "that", "this", "bucket", "need"]);
  const tokens = lower.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));

  let bestTask = null;
  let highestScore = 0;

  tasksCatalog.forEach(t => {
    let score = 0;
    const codeKey = t.Task_Code;
    const combinedText = `${t.Task_Title} ${t.Category} ${t.Aliases || ""} ${(learnedAliasesMap[codeKey] || []).join(" ")}`.toLowerCase();
    const aliasList = `${t.Aliases || ""}, ${(learnedAliasesMap[codeKey] || []).join(", ")}`.split(",").map(a => a.trim().toLowerCase()).filter(Boolean);

    aliasList.forEach(alias => { if (alias.length > 2 && lower.includes(alias)) score += 4; });
    tokens.forEach(tok => {
      const stem = tok.replace(/(?:ing|ed|s|es)$/, "");
      if (stem.length >= 3 && combinedText.includes(stem)) score += 2;
    });

    if (score > highestScore) { highestScore = score; bestTask = t; }
  });

  if (bestTask && highestScore >= 2) {
    return { taskCode: bestTask.Task_Code, taskTitle: bestTask.Task_Title, category: bestTask.Category || "General", isNewTask: false, triggerToken: tokens[0] || "" };
  }

  return {
    taskCode: "TSK-EXPO",
    taskTitle: "General Execution",
    category: "Training & Field Execution",
    isNewTask: false,
    triggerToken: ""
  };
}

function localSmartParse(inputText, employees, tasksCatalog, learnedAliasesMap, currentWorkboard, activeEmail) {
  const today = getTodayStr();
  const segments = splitSpokenMultiTasks(inputText);

  return segments.map((seg, idx) => {
    const lower = seg.toLowerCase();
    let minutes = 0;
    const hrMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h\b)/);
    const minMatch = lower.match(/(\d+)\s*(?:minutes?|mins?|m\b)/);
    if (hrMatch) minutes += Math.round(parseFloat(hrMatch[1]) * 60);
    if (minMatch) minutes += parseInt(minMatch[1], 10);

    let progress = minutes > 0 ? 100 : 0;
    const progMatch = lower.match(/(\d+)\s*%/);
    if (progMatch) progress = Math.min(100, Math.max(0, parseInt(progMatch[1], 10)));
    else if (lower.includes("half done") || lower.includes("in progress") || lower.includes("working on")) progress = 50;
    else if (lower.includes("completed") || lower.includes("finished") || lower.includes("done")) progress = 100;

    let projectId = "PRJ-MAKER";
    if (/dexter|kit|box|grade/.test(lower)) projectId = "PRJ-DEXTER";
    else if (/atl|atal|tinkering/.test(lower)) projectId = "PRJ-ATL";
    else if (/csr|ngo|sponsor/.test(lower)) projectId = "PRJ-CSR";
    else if (/step|teacher|pedagogy/.test(lower)) projectId = "PRJ-STEP";
    else if (/admin|salary|hr|invoice|account|receipt|bill/.test(lower)) projectId = "PRJ-ADMIN";

    const taskMatch = matchOrMintTaskCode(seg, tasksCatalog, learnedAliasesMap);

    let cleanTitle = seg
      .replace(/^(add task to bucket|add task|add to bucket|add|create|log|spent|worked|did|completed|finished|need to|studied|learned|practiced)\s*:?\s*/i, "")
      .replace(/\b(?:for|on|in)\s+\d+(?:\.\d+)?\s*(?:hours?|hrs?|h|minutes?|mins?|m)\b/gi, "")
      .replace(/\b\d+(?:\.\d+)?\s*(?:hours?|hrs?|h|minutes?|mins?|m)\b/gi, "")
      .replace(/^\s*(?:on|for|in|to)\b\s+/i, "")
      .replace(/\b\d+\s*%/g, "")
      .trim();
    if (cleanTitle.length < 3) cleanTitle = seg.trim();
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    // Check if this matches an existing task on the user's board!
    const existingMatch = findBestExistingTaskMatch(cleanTitle, projectId, taskMatch.taskCode, currentWorkboard);

    let intent = minutes > 0 ? "LOG_TIME" : "ADD_TASK";
    if (lower.startsWith("add ") || lower.startsWith("plan ") || lower.startsWith("create ") || lower.includes("need to") || lower.includes("to bucket")) {
      intent = "ADD_TASK";
    } else if (existingMatch && !lower.startsWith("add ")) {
      // If user mentions an existing task without saying "add", default to updating/logging on that existing task!
      intent = "LOG_TIME";
      if (minutes === 0) minutes = 60;
    }

    if (lower.includes("upskill") || lower.includes("studied") || lower.includes("learned") || lower.includes("practiced") || lower.includes("learning")) {
      intent = "LOG_LEARNING";
      if (minutes === 0) minutes = 45;
    }

    const collaborators = [activeEmail].filter(Boolean);
    (employees || []).forEach(emp => {
      const firstName = (emp.Name || "").split(" ")[0].toLowerCase();
      if (firstName.length > 2 && lower.includes(firstName) && !collaborators.includes(emp.Email)) collaborators.push(emp.Email);
    });

    return {
      id: Date.now() + idx + Math.random(),
      intent,
      projectId: existingMatch ? existingMatch.Project_ID : projectId,
      taskCode: existingMatch ? existingMatch.Task_Code : taskMatch.taskCode,
      title: existingMatch ? existingMatch.Monday_Commitment : cleanTitle,
      minutes: minutes || (intent === "LOG_TIME" ? 60 : intent === "LOG_LEARNING" ? 45 : 0),
      progress: intent === "ADD_TASK" ? 0 : progress,
      deadline: today,
      collaborators,
      matchedPulseId: existingMatch ? existingMatch.Pulse_ID : null,
      learningModuleCode: "LRN-HARD-01",
      engine: "Smart Sheet Parser"
    };
  });
}

async function geminiSmartParse(inputText, apiKey, projects, tasks, learningModules, employees, activeEmail, currentWorkboard) {
  const today = getTodayStr();
  const activeBoardList = (currentWorkboard || [])
    .filter(p => Number(p.Auto_Task_Hours || 0) < 100)
    .map(p => ({ pulseId: p.Pulse_ID, title: p.Monday_Commitment, projectId: p.Project_ID, taskCode: p.Task_Code }));

  const prompt = `You are an operational AI assistant for Infinite Engineers (IE Skool).
Today is ${today}. User email: "${activeEmail}".
Projects: ${JSON.stringify(projects.map(p => ({ id: p.Project_ID, name: p.Project_Name })))}
Tasks: ${JSON.stringify(tasks.map(t => ({ code: t.Task_Code, title: t.Task_Title })))}
Learning Modules: ${JSON.stringify(learningModules.map(l => ({ code: l.Module_Code, title: l.Topic_Title })))}
User's Currently Active Tasks on Board: ${JSON.stringify(activeBoardList)}

CRITICAL RULES:
1. Split the user's input into ALL separate tasks, work logs, and learning logs mentioned. Never combine multiple items into one.
2. PREVENT DUPLICATES: If an item refers to work done on one of the "User's Currently Active Tasks on Board", set "intent": "LOG_TIME" and set "matchedPulseId" to that active task's "pulseId" so we update the existing row instead of creating a duplicate task!
3. If the user mentions an administrative action like a receipt, bill, or invoice, map it to projectId "PRJ-ADMIN" and taskCode "TSK-FIN".

User Input: "${inputText}"`;

  const responseSchema = {
    type: "ARRAY",
    items: {
      type: "OBJECT",
      properties: {
        intent: { type: "STRING", enum: ["ADD_TASK", "LOG_TIME", "LOG_LEARNING"] },
        projectId: { type: "STRING" },
        taskCode: { type: "STRING" },
        learningModuleCode: { type: "STRING" },
        matchedPulseId: { type: "STRING" },
        title: { type: "STRING" },
        minutes: { type: "INTEGER" },
        progress: { type: "INTEGER" },
        deadline: { type: "STRING" }
      },
      required: ["intent", "projectId", "taskCode", "title", "minutes", "progress"]
    }
  };

  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey.trim())}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json",
              responseSchema: responseSchema
            }
          })
        }
      );

      const data = await response.json();
      if (!response.ok || data.error) {
        lastError = new Error(data?.error?.message || `HTTP ${response.status}`);
        continue;
      }

      const parts = data?.candidates?.[0]?.content?.parts || [];
      const textPart = parts.find(p => typeof p.text === "string" && !p.thought) || parts[parts.length - 1];
      let rawText = (textPart?.text || "[]").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

      let parsed = JSON.parse(rawText);
      if (!Array.isArray(parsed)) parsed = [parsed];

      return parsed.map((item, idx) => {
        const fallbackMatch = !item.matchedPulseId
          ? findBestExistingTaskMatch(item.title, item.projectId, item.taskCode, currentWorkboard)
          : currentWorkboard.find(p => p.Pulse_ID === item.matchedPulseId);

        return {
          id: Date.now() + idx + Math.random(),
          intent: item.intent || "ADD_TASK",
          projectId: item.projectId || "PRJ-MAKER",
          taskCode: item.taskCode || "TSK-EXPO",
          learningModuleCode: item.learningModuleCode || "LRN-HARD-01",
          title: fallbackMatch && item.intent === "LOG_TIME" ? fallbackMatch.Monday_Commitment : (item.title || inputText),
          minutes: Number(item.minutes || (item.intent === "LOG_TIME" ? 60 : item.intent === "LOG_LEARNING" ? 45 : 0)),
          progress: Number(item.progress ?? (item.intent === "LOG_TIME" ? 100 : 0)),
          deadline: item.deadline || today,
          collaborators: [activeEmail],
          matchedPulseId: fallbackMatch ? fallbackMatch.Pulse_ID : null,
          engine: `Gemini AI`
        };
      });
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("Gemini API request failed");
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("ie_theme") || "light");
  // 4 Simple Spreadsheet-Style Workbook Tabs
  const [activeSheetTab, setActiveSheetTab] = useState("my_tasks"); // 'my_tasks' | 'monthly_review' | 'learning' | 'company_sheet'
  const [activeEmployeeEmail, setActiveEmployeeEmail] = useState(() => localStorage.getItem("ie_v3_active_emp") || "");

  useEffect(() => { localStorage.setItem("ie_theme", theme); }, [theme]);

  const [employees, setEmployees] = useState(() => JSON.parse(localStorage.getItem("ie_v3_employees") || "[]"));
  const [projects, setProjects] = useState(() => mergeById(JSON.parse(localStorage.getItem("ie_v3_projects") || "[]"), DEFAULT_PROJECTS, "Project_ID"));
  const [tasks, setTasks] = useState(() => mergeById(JSON.parse(localStorage.getItem("ie_v3_tasks") || "[]"), DEFAULT_TASKS, "Task_Code"));
  const [learnedAliases] = useState(() => JSON.parse(localStorage.getItem("ie_v4_learned_aliases") || "{}"));
  const [learningModules, setLearningModules] = useState(() => mergeById(JSON.parse(localStorage.getItem("ie_v3_learning") || "[]"), DEFAULT_LEARNING, "Module_Code"));
  const [weeklyPulses, setWeeklyPulses] = useState(() => JSON.parse(localStorage.getItem("ie_v3_pulses") || "[]"));
  const [dailyLogs, setDailyLogs] = useState(() => JSON.parse(localStorage.getItem("ie_v3_logs") || "[]"));

  // Smart Bar States
  const [smartInput, setSmartInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isParsingAI, setIsParsingAI] = useState(false);
  const [parsedPreviews, setParsedPreviews] = useState([]);
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem("ie_gemini_api_key") || "");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const recognitionRef = useRef(null);

  // Quick Inline Spreadsheet Row Add State
  const todayStr = getTodayStr();
  const currentMondayStr = getCurrentMondayStr();
  const [quickRowTitle, setQuickRowTitle] = useState("");
  const [quickRowProject, setQuickRowProject] = useState("PRJ-MAKER");
  const [quickRowDeadline, setQuickRowDeadline] = useState(todayStr);
  const [showCompletedRows, setShowCompletedRows] = useState(false);

  // Review Tab Timeframe
  const [reviewPeriod, setReviewPeriod] = useState("MONTH"); // 'WEEK' | 'MONTH'
  const [isEditingRnR, setIsEditingRnR] = useState(false);
  const [rnrDraft, setRnrDraft] = useState("");

  // Admin Modals
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: "", email: "", roleTitle: "", department: "Training & Delivery", level: "L3 Advanced", rnrSummary: "" });

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

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

  // Employee's Active & Completed Tasks
  const empAllPulses = useMemo(() => {
    return weeklyPulses.filter(p => (p.Emp_Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase());
  }, [weeklyPulses, activeEmployeeEmail]);

  const activeRows = useMemo(() => empAllPulses.filter(p => Number(p.Auto_Task_Hours || 0) < 100), [empAllPulses]);
  const completedRows = useMemo(() => empAllPulses.filter(p => Number(p.Auto_Task_Hours || 0) >= 100), [empAllPulses]);

  // Friendly Project Name Helper (Hides PRJ- codes from cluttering the UI)
  const getProjectLabel = (prjId) => {
    const found = projects.find(p => p.Project_ID === prjId);
    return found ? (found.Project_Name || found.Full_Name || prjId) : prjId;
  };

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

  // Collective Team Goal Points
  const teamOrbitPercent = useMemo(() => {
    let mins = 0;
    dailyLogs.forEach(l => {
      const rt = Number(l.Task_Hours || 0);
      mins += (rt > 24 ? rt : Math.round(rt * 60));
    });
    const doneCount = weeklyPulses.filter(p => Number(p.Auto_Task_Hours || 0) >= 100).length;
    const gp = Math.round((mins / 15) * 5) + (doneCount * 50);
    return Math.min(100, Math.round((gp / 2500) * 100));
  }, [dailyLogs, weeklyPulses]);

  // ================= 1-TAP INLINE TABLE ACTIONS =================
  const handleQuickLogTimeOnRow = (rowItem, addMinutes, markDone = false) => {
    const newProg = markDone ? 100 : Math.min(95, Number(rowItem.Auto_Task_Hours || 0) + 25);

    setWeeklyPulses(prev => prev.map(p => {
      if (p.Pulse_ID === rowItem.Pulse_ID) {
        return {
          ...p,
          Auto_Task_Hours: newProg,
          Auto_Learning_Hours: Number(p.Auto_Learning_Hours || 0) + addMinutes,
          Status: newProg >= 100 ? "Completed" : "In Progress",
          Completed_Date: newProg >= 100 ? todayStr : ""
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

    showToast(markDone ? `✓ Marked "${rowItem.Monday_Commitment}" Complete!` : `🕒 Added +${addMinutes}m to "${rowItem.Monday_Commitment}"`);

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
          learningModuleCode: "None",
          learningMinutes: 0,
          progressPercent: newProg,
          currentStreak: currentStreak || 1,
          status: newProg >= 100 ? "Done" : "In Progress",
          notes: rowItem.Monday_Commitment
        })
      });
    } catch (err) {}
  };

  // Direct Spreadsheet Bottom-Row Add
  const handleQuickRowSubmit = (e) => {
    e.preventDefault();
    if (!quickRowTitle.trim()) return;

    const newItem = {
      Pulse_ID: "TSK-" + Date.now(),
      Created_Date: todayStr,
      Emp_Email: activeEmployeeEmail,
      Project_ID: quickRowProject,
      Task_Code: "TSK-EXPO",
      Monday_Commitment: quickRowTitle.trim(),
      Auto_Task_Hours: 0,
      Auto_Learning_Hours: 0,
      Friday_Outcome: "Self",
      Status: "In Progress",
      Target_Deadline: quickRowDeadline || todayStr,
      Completed_Date: "",
      Collaborators: activeEmployeeEmail
    };

    setWeeklyPulses(prev => [...prev, newItem]);
    setQuickRowTitle("");
    showToast("Added new row to your sheet!");

    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "addWorkboardBatch", items: [newItem] })
      });
    } catch (err) {}
  };

  // Voice & Smart Bar Handlers
  const handleToggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Voice input works in Chrome, Edge, or Safari.");
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
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSmartInput(prev => (prev ? `${prev}, and ${transcript}` : transcript));
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleAnalyzeSmartInput = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!smartInput.trim()) return;

    setIsParsingAI(true);
    try {
      if (geminiApiKey && geminiApiKey.trim().length > 10) {
        try {
          const aiResults = await geminiSmartParse(smartInput, geminiApiKey, projects, tasks, learningModules, employees, activeEmployeeEmail, activeRows);
          if (aiResults && aiResults.length > 0) {
            setParsedPreviews(aiResults);
            return;
          }
        } catch (err) {
          console.warn("Falling back to local splitter:", err);
        }
      }
      const localResults = localSmartParse(smartInput, employees, tasks, learnedAliases, activeRows, activeEmployeeEmail);
      setParsedPreviews(localResults);
    } finally {
      setIsParsingAI(false);
    }
  };

  const handleConfirmSmartPreviews = () => {
    if (parsedPreviews.length === 0) return;
    const newPulsesBatch = [];
    const newLogsBatch = [];

    parsedPreviews.forEach(item => {
      if (item.intent === "ADD_TASK") {
        newPulsesBatch.push({
          Pulse_ID: "TSK-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
          Created_Date: todayStr,
          Emp_Email: activeEmployeeEmail,
          Project_ID: item.projectId,
          Task_Code: item.taskCode,
          Monday_Commitment: item.title,
          Auto_Task_Hours: 0,
          Auto_Learning_Hours: 0,
          Friday_Outcome: "Smart Bar",
          Status: "In Progress",
          Target_Deadline: item.deadline || todayStr,
          Completed_Date: "",
          Collaborators: activeEmployeeEmail
        });
      } else if (item.intent === "LOG_TIME") {
        newLogsBatch.push({
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
        });

        if (item.matchedPulseId) {
          // Updates existing row — NO duplicate task created!
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
            Friday_Outcome: "Smart Log",
            Status: item.progress >= 100 ? "Completed" : "In Progress",
            Target_Deadline: todayStr,
            Completed_Date: item.progress >= 100 ? todayStr : "",
            Collaborators: activeEmployeeEmail
          });
        }
      } else if (item.intent === "LOG_LEARNING") {
        newLogsBatch.push({
          Log_ID: "LRN-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
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

    if (newPulsesBatch.length > 0) setWeeklyPulses(prev => [...prev, ...newPulsesBatch]);
    if (newLogsBatch.length > 0) setDailyLogs(prev => [...prev, ...newLogsBatch]);

    showToast(`✓ Saved ${parsedPreviews.length} item(s) to your sheet!`);
    setParsedPreviews([]);
    setSmartInput("");
  };

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* ================= CLEAN MINIMAL TOP BAR ================= */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white/95 border-slate-200"}`}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Table className="h-4 w-4" />
            </div>
            <span className="font-bold text-base tracking-tight">IE Workspace</span>
          </div>

          {/* Right Status Pills: Team Goal, Streak, User Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs border ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
              <Rocket className="h-3.5 w-3.5 text-indigo-500" />
              <span className="font-medium">Team Goal:</span>
              <span className="font-mono font-bold text-indigo-500">{teamOrbitPercent}%</span>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>{currentStreak}d Streak</span>
            </div>

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
              className={`p-1.5 rounded-lg border text-xs ${isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"}`}
            >
              <UserPlus className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setShowApiKeyModal(true)}
              title="Gemini AI Key"
              className={`p-1.5 rounded-lg border ${geminiApiKey ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : isDark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-white border-slate-200 text-slate-500"}`}
            >
              <Key className="h-3.5 w-3.5" />
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

      {/* ================= MAIN WORKSPACE CONTAINER ================= */}
      <main className="max-w-5xl mx-auto px-4 py-6 flex-1 w-full space-y-5">

        {/* 1. ONE SIMPLE VOICE / TEXT INPUT BAR */}
        <div className={`border rounded-2xl p-3.5 shadow-sm transition-colors ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleVoice}
              title="Click to Speak"
              className={`p-2.5 rounded-xl border transition shrink-0 ${
                isListening 
                  ? "bg-rose-500 text-white border-rose-600 animate-pulse" 
                  : isDark ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <input
              type="text"
              value={smartInput}
              onChange={(e) => setSmartInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAnalyzeSmartInput(e);
                }
              }}
              placeholder='Speak or type: e.g. "Worked 2h on AMT Expo, 45m on Dexter BOM, and add CSR proposal"'
              className={`flex-1 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none border ${
                isDark 
                  ? "bg-slate-950 border-slate-800 text-white placeholder:text-slate-500" 
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white"
              }`}
            />

            <button
              type="button"
              onClick={handleAnalyzeSmartInput}
              disabled={isParsingAI || !smartInput.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
            >
              <Wand2 className="h-3.5 w-3.5" />
              <span>{isParsingAI ? "Splitting..." : "Smart Add"}</span>
            </button>
          </div>

          {/* CLEAN SPLIT PREVIEW LIST (Prevents Duplicates!) */}
          {parsedPreviews.length > 0 && (
            <div className={`mt-3 pt-3 border-t space-y-2 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-500">
                  Ready to save {parsedPreviews.length} item(s) — Review & Confirm:
                </span>
                <button type="button" onClick={() => setParsedPreviews([])} className="text-xs text-slate-400 hover:text-rose-500">Cancel</button>
              </div>

              {parsedPreviews.map((item, idx) => (
                <div key={item.id} className={`flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl border text-xs ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    {/* Badge showing whether it updates an existing row or creates a new row */}
                    {item.matchedPulseId ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20 shrink-0">
                        🔄 Update Existing Row
                      </span>
                    ) : (
                      <select
                        value={item.intent}
                        onChange={(e) => setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, intent: e.target.value } : p))}
                        className={`font-semibold px-2 py-0.5 rounded border text-[11px] ${isDark ? "bg-slate-900 border-slate-700 text-blue-400" : "bg-white border-slate-200 text-blue-700"}`}
                      >
                        <option value="ADD_TASK">➕ New Task Row</option>
                        <option value="LOG_TIME">✓ Log Completed Work</option>
                        <option value="LOG_LEARNING">🎓 Log Learning</option>
                      </select>
                    )}

                    <select
                      value={item.projectId}
                      onChange={(e) => setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, projectId: e.target.value } : p))}
                      className={`px-2 py-0.5 rounded border text-[11px] font-medium ${isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}
                    >
                      {projects.map(p => <option key={p.Project_ID} value={p.Project_ID}>{p.Project_Name}</option>)}
                    </select>

                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, title: e.target.value } : p))}
                      className={`flex-1 px-2 py-0.5 rounded border font-medium ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {item.intent !== "ADD_TASK" && (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="15"
                          min="0"
                          value={item.minutes}
                          onChange={(e) => setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, minutes: Number(e.target.value) } : p))}
                          className={`w-14 text-right px-1.5 py-0.5 rounded border font-mono font-bold ${isDark ? "bg-slate-900 border-slate-700 text-amber-400" : "bg-white border-slate-200 text-slate-800"}`}
                        />
                        <span className="text-[11px] text-slate-400">mins</span>
                      </div>
                    )}
                    <button type="button" onClick={() => setParsedPreviews(prev => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-500">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleConfirmSmartPreviews}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" /> Confirm & Save ({parsedPreviews.length})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. FAMILIAR EXCEL-STYLE WORKBOOK TABS */}
        <div className={`flex items-center gap-1 border-b text-xs sm:text-sm overflow-x-auto ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <button
            type="button"
            onClick={() => setActiveSheetTab("my_tasks")}
            className={`px-4 py-2.5 font-semibold rounded-t-xl border-t border-x transition flex items-center gap-1.5 shrink-0 ${
              activeSheetTab === "my_tasks"
                ? (isDark ? "bg-slate-900 border-slate-800 text-indigo-400" : "bg-white border-slate-200 text-indigo-600 shadow-sm")
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <CalendarCheck className="h-4 w-4" /> My Active Sheet ({activeRows.length})
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

          <button
            type="button"
            onClick={() => setActiveSheetTab("company_sheet")}
            className={`px-4 py-2.5 font-semibold rounded-t-xl border-t border-x transition flex items-center gap-1.5 shrink-0 ${
              activeSheetTab === "company_sheet"
                ? (isDark ? "bg-slate-900 border-slate-800 text-indigo-400" : "bg-white border-slate-200 text-indigo-600 shadow-sm")
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="h-4 w-4" /> Company Master Sheet
          </button>
        </div>

        {/* ================= TAB 1: MY ACTIVE SHEET (CLEAN SPREADSHEET TABLE) ================= */}
        {activeSheetTab === "my_tasks" && (
          <div className={`border rounded-b-2xl rounded-tr-2xl overflow-hidden shadow-sm ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className={`border-b text-[11px] uppercase tracking-wider font-semibold ${isDark ? "bg-slate-950/60 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                    <th className="py-3 px-4 w-10 text-center">Done</th>
                    <th className="py-3 px-3">Deliverable / Task</th>
                    <th className="py-3 px-3 w-36">Project</th>
                    <th className="py-3 px-3 w-28">Target Date</th>
                    <th className="py-3 px-3 w-28">Progress</th>
                    <th className="py-3 px-3 w-24 text-right">Logged</th>
                    <th className="py-3 px-4 w-44 text-right">Quick Log Time</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200/70"}`}>
                  {activeRows.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                        Your active sheet is clear! Type a task in the bottom row below or use the Voice Bar above.
                      </td>
                    </tr>
                  ) : (
                    activeRows.map(row => {
                      const mins = Number(row.Auto_Learning_Hours || 0);
                      const prog = Number(row.Auto_Task_Hours || 0);
                      const due = normalizeDateStr(row.Target_Deadline);
                      const isOverdue = due && due < todayStr;

                      return (
                        <tr key={row.Pulse_ID} className={`transition ${isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50/80"}`}>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleQuickLogTimeOnRow(row, 0, true)}
                              title="Mark 100% Complete"
                              className="text-slate-400 hover:text-emerald-500 transition"
                            >
                              <Square className="h-4 w-4" />
                            </button>
                          </td>
                          <td className="py-3 px-3 font-medium">
                            {row.Monday_Commitment}
                            {isOverdue && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-semibold">Overdue</span>}
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
                              <div className={`w-14 h-1.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                                <div className="bg-indigo-600 h-full" style={{ width: `${prog}%` }} />
                              </div>
                              <span className="text-xs font-mono text-slate-400">{prog}%</span>
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
                                onClick={() => handleQuickLogTimeOnRow(row, 60, true)}
                                className="px-2 py-1 rounded text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition"
                              >
                                Done ✓
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {/* SPREADSHEET QUICK-ADD ROW AT THE BOTTOM */}
                  <tr className={isDark ? "bg-slate-950/40" : "bg-slate-50/60"}>
                    <td className="py-2.5 px-4 text-center text-indigo-500">
                      <Plus className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={quickRowTitle}
                        onChange={(e) => setQuickRowTitle(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleQuickRowSubmit(e); }}
                        placeholder="Click to type a new task row directly..."
                        className="w-full bg-transparent text-xs sm:text-sm focus:outline-none placeholder:text-slate-400"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={quickRowProject}
                        onChange={(e) => setQuickRowProject(e.target.value)}
                        className={`text-xs px-2 py-1 rounded border ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"}`}
                      >
                        {projects.map(p => <option key={p.Project_ID} value={p.Project_ID}>{p.Project_Name}</option>)}
                      </select>
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="date"
                        value={quickRowDeadline}
                        onChange={(e) => setQuickRowDeadline(e.target.value)}
                        className={`text-xs px-2 py-1 rounded border font-mono ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-700"}`}
                      />
                    </td>
                    <td colSpan="3" className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={handleQuickRowSubmit}
                        disabled={!quickRowTitle.trim()}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold"
                      >
                        + Add Row
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Collapsible Completed Rows Drawer */}
            {completedRows.length > 0 && (
              <div className={`border-t px-4 py-2.5 text-xs ${isDark ? "border-slate-800 bg-slate-950/50" : "border-slate-200 bg-slate-50"}`}>
                <button
                  type="button"
                  onClick={() => setShowCompletedRows(!showCompletedRows)}
                  className="font-semibold text-slate-500 hover:text-indigo-500 flex items-center gap-1.5"
                >
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{showCompletedRows ? "Hide" : "Show"} Completed Rows ({completedRows.length})</span>
                </button>

                {showCompletedRows && (
                  <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-200/50">
                    {completedRows.map(c => (
                      <div key={c.Pulse_ID} className="flex items-center justify-between py-1 text-slate-400">
                        <span className="line-through">{c.Monday_Commitment} ({getProjectLabel(c.Project_ID)})</span>
                        <span className="font-mono text-emerald-500 font-semibold">✓ Done ({(Number(c.Auto_Learning_Hours || 0) / 60).toFixed(1)}h)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: MONTHLY & GOAL REVIEW (TEAMMATE'S SUGGESTED TAB) ================= */}
        {activeSheetTab === "monthly_review" && (
          <div className="space-y-5">
            {/* Period Switcher + 4 Key Summary KPI Cards */}
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

            {/* Visual Bar Chart: Where My Hours Went */}
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

            {/* Editable Core Responsibilities (R&R) */}
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

        {/* ================= TAB 3: LEARNING LOG SHEET ================= */}
        {activeSheetTab === "learning" && (
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
              <tbody className="divide-y divide-slate-200/50">
                {empDailyLogs.filter(l => Number(l.Learning_Hours || 0) > 0).length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400 text-xs">
                      No learning logged yet. Tip: Just type "Studied ESP32 for 30 mins" in the top bar!
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
        )}

        {/* ================= TAB 4: COMPANY MASTER SHEET ================= */}
        {activeSheetTab === "company_sheet" && (
          <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className={`border-b text-[11px] uppercase font-semibold ${isDark ? "bg-slate-950/60 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                    <th className="py-3 px-4">Team Member</th>
                    <th className="py-3 px-4">Deliverable / Task</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Hours Logged</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200/70"}`}>
                  {weeklyPulses.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">No company tasks logged yet.</td>
                    </tr>
                  ) : (
                    weeklyPulses.slice().reverse().map(p => {
                      const empObj = employees.find(e => (e.Email || "").toLowerCase() === (p.Emp_Email || "").toLowerCase());
                      const isDone = Number(p.Auto_Task_Hours || 0) >= 100;
                      return (
                        <tr key={p.Pulse_ID}>
                          <td className="py-3 px-4 font-semibold">{empObj ? empObj.Name : p.Emp_Email}</td>
                          <td className="py-3 px-4">{p.Monday_Commitment}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-xs font-medium">
                              {getProjectLabel(p.Project_ID)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isDone ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
                              {isDone ? "✓ Completed" : `${p.Auto_Task_Hours || 0}% Active`}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold">
                            {(Number(p.Auto_Learning_Hours || 0) / 60).toFixed(1)}h
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 text-xs ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Optional Gemini AI Key</h3>
              <button type="button" onClick={() => setShowApiKeyModal(false)}><X className="h-4 w-4" /></button>
            </div>
            <p className="text-slate-400">
              The built-in Smart Sheet Parser splits tasks and matches existing rows automatically. Optionally paste a Gemini API Key for cloud AI parsing.
            </p>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => {
                setGeminiApiKey(e.target.value);
                localStorage.setItem("ie_gemini_api_key", e.target.value);
              }}
              placeholder="AIzaSy..."
              className={`w-full rounded-xl p-2.5 font-mono border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
            />
            <div className="flex justify-end">
              <button type="button" onClick={() => setShowApiKeyModal(false)} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Member Modal */}
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
    </div>
  );
}

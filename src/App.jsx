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

const APPS_SCRIPT_URL = "[https://script.google.com/macros/s/AKfycbz4v1XX9-m0Zu_xEgEzyeCI361wydctuHupDCxgPEhfDWuqgD-AtVrESJ-s6cE4kA2xtA/exec](https://script.google.com/macros/s/AKfycbz4v1XX9-m0Zu_xEgEzyeCI361wydctuHupDCxgPEhfDWuqgD-AtVrESJ-s6cE4kA2xtA/exec)";

const DEFAULT_PROJECTS = [
  { Project_ID: "PRJ-DEXTER", Project_Name: "Dexter Box Science Kits", Priority_Level: "P1 Critical", Status: "Active" },
  { Project_ID: "PRJ-MAKER", Project_Name: "Maker Lab & School Studios", Priority_Level: "P1 Critical", Status: "Active" },
  { Project_ID: "PRJ-ATL", Project_Name: "Atal Tinkering Labs (ATL)", Priority_Level: "P1 Critical", Status: "Active" },
  { Project_ID: "PRJ-CSR", Project_Name: "CSR & NGO Partnerships", Priority_Level: "P2 High", Status: "Active" },
  { Project_ID: "PRJ-STEP", Project_Name: "Teacher Training & Workshops (STEP)", Priority_Level: "P2 High", Status: "Active" },
  { Project_ID: "PRJ-ADMIN", Project_Name: "Office Admin, HR & Internal Ops", Priority_Level: "P3 Supporting", Status: "Active" }
];

const DEFAULT_TASKS = [
  { Task_Code: "TSK-PROP", Task_Title: "Concept Notes, Proposals & Estimates", Category: "BD & Client Proposals", Aliases: "proposal, estimate, concept note, quote, costing sheet, tender, rfp, mou" },
  { Task_Code: "TSK-DECK", Task_Title: "Client Pitch Decks & Presentations", Category: "BD & Client Proposals", Aliases: "deck, ppt, presentation, slides, pitch deck" },
  { Task_Code: "TSK-FOLLOW", Task_Title: "Client Mailing, Follow-ups & Coordination", Category: "BD & Client Proposals", Aliases: "follow up, followup, mail, email, calling, client call, lead coordination" },
  { Task_Code: "TSK-MEET", Task_Title: "Client Meetings, School Visits & Demos", Category: "BD & Client Proposals", Aliases: "meeting, school visit, principal meet, demo, pitch meeting, client visit" },
  { Task_Code: "TSK-RND", Task_Title: "Product R&D, Prototyping & Experiments", Category: "R&D & Product Engineering", Aliases: "rnd, r&d, prototype, prototyping, experiment, testing, 3d print, laser cut, mdf, circuit, breadboard, cad" },
  { Task_Code: "TSK-BOM", Task_Title: "Bill of Materials (BOM), Sourcing & Costing", Category: "R&D & Product Engineering", Aliases: "bom, bill of materials, sourcing, vendor, supplier, procurement, component buying, price negotiation" },
  { Task_Code: "TSK-CURR", Task_Title: "Curriculum Mapping, Manuals & Lesson Plans", Category: "R&D & Product Engineering", Aliases: "curriculum, manual, workbook, lesson plan, activity guide, worksheet, syllabus, textbook" },
  { Task_Code: "TSK-DES-PROD", Task_Title: "Product & Packaging Design (Boxes/Manuals)", Category: "Design & Digital Media", Aliases: "packaging, box design, sticker, label, manual layout, kit box" },
  { Task_Code: "TSK-DES-MKT", Task_Title: "Marketing Collaterals & Social Media Posters", Category: "Design & Digital Media", Aliases: "poster, social media, instagram, linkedin, brochure, flyer, pamphlet, marketing design, creative" },
  { Task_Code: "TSK-DES-EVT", Task_Title: "Event, Expo & Workshop Signage/Backdrops", Category: "Design & Digital Media", Aliases: "backdrop, banner, standee, signage, certificate design, badge, event poster" },
  { Task_Code: "TSK-VIDEO", Task_Title: "Video Scripting, Shooting & Editing", Category: "Design & Digital Media", Aliases: "video, shooting, editing, script, scripting, montage, reel, voiceover, camera, studio shoot" },
  { Task_Code: "TSK-TRN-STU", Task_Title: "Student Classroom Facilitation & Sessions", Category: "Training & Field Execution", Aliases: "student training, classroom session, facilitation, maker session, school class, teaching, workshop" },
  { Task_Code: "TSK-TRN-TCH", Task_Title: "Teacher Training Workshops & Mentorship", Category: "Training & Field Execution", Aliases: "teacher training, educator workshop, step program, faculty training, mentorship" },
  { Task_Code: "TSK-EXPO", Task_Title: "School Expo, Science Mela & Event Support", Category: "Training & Field Execution", Aliases: "expo, science mela, exhibition, competition, booth setup, amt, teacon, showcase" },
  { Task_Code: "TSK-KIT-OPS", Task_Title: "Kit Assembly, QC, Packing & Dispatch", Category: "Operations & Supply Chain", Aliases: "packing, kit assembly, dispatch, courier, quality check, qc, kitting, carton, delivery" },
  { Task_Code: "TSK-LAB-AUD", Task_Title: "School Lab Setup, Audit & Maintenance", Category: "Operations & Supply Chain", Aliases: "lab setup, inventory audit, stock check, calibration, tool maintenance, stocktaking" },
  { Task_Code: "TSK-FIN", Task_Title: "Salary Processing, Invoicing & Accounts", Category: "HR, Finance & Office Admin", Aliases: "salary, payroll, invoice, billing, gst, accounts, reimbursement, payment, bank, tally" },
  { Task_Code: "TSK-HR-ADM", Task_Title: "HR, Scheduling & General Office Admin", Category: "HR, Finance & Office Admin", Aliases: "hr, recruitment, interview, onboarding, office admin, housekeeping, schedule, leave" }
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

// ================= ENHANCED MULTI-INTENT LOCAL SPLITTER (FALLBACK & INSTANT ENGINE) =================
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

  // Replace common spoken multi-task transitions with a pipe delimiter "|"
  text = text
    .replace(/\s*(?:;|\band then\b|\balso\b|\bplus\b|\bafter that\b|\bnext\b|\bsecondly\b|\bthirdly\b|\bapart from that\b|\bas well as\b)\s*/gi, " | ")
    .replace(/,\s*(?=(?:spent|worked|did|completed|finished|logged|add|create|plan|need to|have to|studied|learned|upskilled|practiced|\d+(?:\.\d+)?\s*(?:hours?|hrs?|h|minutes?|mins?|m)\b))/gi, " | ")
    .replace(/\s+\band\b\s+(?=(?:spent|worked|did|completed|finished|logged|add|create|plan|need to|have to|studied|learned|upskilled|practiced|\d+(?:\.\d+)?\s*(?:hours?|hrs?|h|minutes?|mins?|m)\b))/gi, " | ");

  const parts = text.split("|").map(s => s.trim()).filter(Boolean);
  return parts.length > 0 ? parts : [rawInput.trim()];
}

function matchOrMintTaskCode(segmentText, tasksCatalog, learnedAliasesMap) {
  const lower = segmentText.toLowerCase();
  const stopWords = new Set(["spent", "worked", "hours", "hour", "mins", "minutes", "with", "for", "the", "and", "task", "add", "done", "completed", "finished", "today", "school", "project", "team", "from", "into", "that", "this", "need", "have", "bucket"]);
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

  const meaningfulWords = tokens.filter(w => !/^(dexter|maker|atl|atal|csr|ngo|step|amt|maharishi|velammal)$/.test(w));
  const rootWord = (meaningfulWords[0] || tokens[0] || "WORK").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
  const candidateCode = `TSK-${rootWord.length >= 3 ? rootWord : "GEN"}`;

  const existingCodeMatch = tasksCatalog.find(t => t.Task_Code === candidateCode);
  if (existingCodeMatch) {
    return { taskCode: existingCodeMatch.Task_Code, taskTitle: existingCodeMatch.Task_Title, category: existingCodeMatch.Category || "General", isNewTask: false, triggerToken: tokens[0] || "" };
  }

  let inferredCategory = "Operations & Supply Chain";
  if (/legal|patent|ip|trademark|compliance|safety|policy/.test(lower)) inferredCategory = "HR, Finance & Office Admin";
  else if (/web|app|code|software|bug|server|portal|sheet/.test(lower)) inferredCategory = "R&D & Product Engineering";
  else if (/pr|press|media|podcast|youtube|blog/.test(lower)) inferredCategory = "Design & Digital Media";
  else if (/partner|mou|tieup|franchise|dealer/.test(lower)) inferredCategory = "BD & Client Proposals";

  const cleanNewTitle = meaningfulWords.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Specialized Activity";

  return { taskCode: candidateCode, taskTitle: `${cleanNewTitle} & Execution`, category: inferredCategory, isNewTask: true, triggerToken: meaningfulWords.join(", ") };
}

function localSmartParse(inputText, employees, tasksCatalog, learnedAliasesMap, currentWorkboard, activeEmail, engineLabel = "Smart Multi-Task Local Engine") {
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
    else if (lower.includes("half done") || lower.includes("in progress")) progress = 50;
    else if (lower.includes("completed") || lower.includes("finished") || lower.includes("done")) progress = 100;

    let intent = minutes > 0 ? "LOG_TIME" : "ADD_TASK";
    if (/^(?:add|create|plan|todo|need to|have to)\b/i.test(lower) || lower.includes("add to bucket") || lower.includes("add task")) {
      intent = "ADD_TASK";
    }
    if (/upskill|studied|study|learned|learning|practiced|course/i.test(lower)) {
      intent = "LOG_LEARNING";
      if (minutes === 0) minutes = 45;
    }

    let projectId = "PRJ-MAKER";
    if (/dexter|kit|box|grade/.test(lower)) projectId = "PRJ-DEXTER";
    else if (/atl|atal|tinkering/.test(lower)) projectId = "PRJ-ATL";
    else if (/csr|ngo|sponsor/.test(lower)) projectId = "PRJ-CSR";
    else if (/step|teacher|pedagogy/.test(lower)) projectId = "PRJ-STEP";
    else if (/admin|salary|hr|invoice|account/.test(lower)) projectId = "PRJ-ADMIN";

    let learningModuleCode = "LRN-HARD-01";
    if (/cad|3d|laser|print|enclosure/.test(lower)) learningModuleCode = "LRN-CAD-01";
    else if (/pedagogy|teaching|class|student/.test(lower)) learningModuleCode = "LRN-PED-01";
    else if (/video|edit|script|story|media/.test(lower)) learningModuleCode = "LRN-MED-01";
    else if (/sales|finance|ops|proposal/.test(lower)) learningModuleCode = "LRN-OPS-01";

    const taskMatch = matchOrMintTaskCode(seg, tasksCatalog, learnedAliasesMap);
    const collaborators = [activeEmail].filter(Boolean);
    (employees || []).forEach(emp => {
      const firstName = (emp.Name || "").split(" ")[0].toLowerCase();
      if (firstName.length > 2 && lower.includes(firstName) && !collaborators.includes(emp.Email)) collaborators.push(emp.Email);
    });

    let matchedPulseId = null;
    if (intent === "LOG_TIME" && currentWorkboard?.length > 0) {
      const match = currentWorkboard.find(p => p.Project_ID === projectId && p.Task_Code === taskMatch.taskCode && Number(p.Auto_Task_Hours || 0) < 100) ||
                    currentWorkboard.find(p => p.Project_ID === projectId && Number(p.Auto_Task_Hours || 0) < 100);
      if (match) matchedPulseId = match.Pulse_ID;
    }

    let cleanTitle = seg
      .replace(/^(add task to bucket|add to bucket|add task|create task|add|log|spent|worked|did|completed|finished|need to|have to|studied|learned)\s*:?\s*/i, "")
      .replace(/\b\d+(?:\.\d+)?\s*(?:hours?|hrs?|h|minutes?|mins?|m)\b/gi, "")
      .replace(/^\s*(?:on|for|in|to)\b\s*/i, "")
      .replace(/\b\d+\s*%/g, "")
      .trim();
    if (cleanTitle.length < 3) cleanTitle = seg.trim();
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    return {
      id: Date.now() + idx + Math.random(),
      intent,
      projectId,
      taskCode: taskMatch.taskCode,
      newTaskTitle: taskMatch.taskTitle,
      newTaskCategory: taskMatch.category,
      isNewTask: taskMatch.isNewTask,
      triggerToken: taskMatch.triggerToken,
      title: cleanTitle,
      minutes: minutes || (intent === "LOG_TIME" ? 60 : intent === "LOG_LEARNING" ? 45 : 0),
      progress: intent === "ADD_TASK" ? 0 : progress,
      deadline: today,
      collaborators,
      matchedPulseId,
      learningModuleCode,
      engine: engineLabel
    };
  });
}

// ================= BULLETPROOF GEMINI AI NATIVE PARSER =================
async function geminiSmartParse(inputText, apiKey, projects, tasks, learningModules, employees, activeEmail, currentWorkboard) {
  const today = getTodayStr();
  const prompt = `You are an operational AI assistant for Infinite Engineers (IE Skool).
Today's date is ${today}. Active user email: "${activeEmail}".
Available Projects: ${JSON.stringify(projects.map(p => ({ id: p.Project_ID, name: p.Project_Name })))}
Available Tasks: ${JSON.stringify(tasks.map(t => ({ code: t.Task_Code, title: t.Task_Title, category: t.Category, aliases: t.Aliases || "" })))}
Available Learning Modules: ${JSON.stringify(learningModules.map(l => ({ code: l.Module_Code, title: l.Topic_Title })))}
Available Team Members: ${JSON.stringify(employees.map(e => ({ name: e.Name, email: e.Email })))}

Split the user's natural language input into ALL distinct items (tasks to add to bucket, time worked logs, and learning logs).
User Input: "${inputText}"

Rules:
1. If the user mentions multiple activities (e.g., worked on X, also worked on Y, add task Z, studied W), you MUST output a separate JSON object for each activity in the array.
2. Set "intent" to:
   - "ADD_TASK" if it is a future task/to-do to add to the bucket (no time logged yet).
   - "LOG_TIME" if they spent time / worked on a project or task.
   - "LOG_LEARNING" if they studied, learned, practiced, or upskilled.
3. Map "projectId" to the best matching Project_ID from Available Projects.
4. Map "taskCode" to the closest existing Task_Code from Available Tasks. ONLY if the activity is completely unrepresented, set "isNewTask": true and invent a short "taskCode" (format "TSK-XXXX"), "newTaskTitle", and "newTaskCategory".
5. If intent is "LOG_LEARNING", map "learningModuleCode" to the closest Module_Code from Available Learning Modules (default "LRN-HARD-01").
6. Convert any spoken duration into integer "minutes" (e.g., 2 hours = 120, 45 mins = 45; if LOG_TIME has no duration mentioned, default to 60; if ADD_TASK, set 0).
7. Return ONLY a raw JSON array of objects.`;

  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await fetch(`[https://generativelanguage.googleapis.com/v1beta/models/$](https://generativelanguage.googleapis.com/v1beta/models/$){modelName}:generateContent?key=${encodeURIComponent(apiKey.trim())}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json"
          }
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data?.error?.message || `HTTP ${response.status}`);
      }

      // Extract non-thought text part (Gemini 2.5 Flash can include thought parts)
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const textPart = parts.find(p => typeof p.text === "string" && !p.thought) || parts[parts.length - 1];
      let rawText = textPart?.text || "[]";

      // Strip markdown code fences if present
      rawText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const parsed = JSON.parse(rawText);
      const arr = Array.isArray(parsed) ? parsed : (parsed.items || parsed.tasks || [parsed]);

      if (!arr || arr.length === 0) throw new Error("Empty array returned");

      return arr.map((item, idx) => {
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
          triggerToken: "",
          title: item.title || inputText,
          minutes: Number(item.minutes ?? (item.intent === "ADD_TASK" ? 0 : 60)),
          progress: Number(item.progress ?? (item.intent === "LOG_TIME" ? 100 : 0)),
          deadline: item.deadline || today,
          collaborators: Array.isArray(item.collaborators) && item.collaborators.length > 0 ? item.collaborators : [activeEmail],
          matchedPulseId,
          learningModuleCode: item.learningModuleCode || "LRN-HARD-01",
          engine: `✨ Gemini AI (${modelName})`
        };
      });
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Gemini request failed");
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
  const [learnedAliases, setLearnedAliases] = useState(() => JSON.parse(localStorage.getItem("ie_v4_learned_aliases") || "{}"));
  const [learningModules, setLearningModules] = useState(() => mergeById(JSON.parse(localStorage.getItem("ie_v3_learning") || "[]"), DEFAULT_LEARNING, "Module_Code"));
  const [weeklyPulses, setWeeklyPulses] = useState(() => JSON.parse(localStorage.getItem("ie_v3_pulses") || "[]"));
  const [dailyLogs, setDailyLogs] = useState(() => JSON.parse(localStorage.getItem("ie_v3_logs") || "[]"));

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
    setTimeout(() => setToastMessage(null), 4500);
  };

  useEffect(() => { localStorage.setItem("ie_v3_employees", JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem("ie_v3_projects", JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem("ie_v3_tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("ie_v4_learned_aliases", JSON.stringify(learnedAliases)); }, [learnedAliases]);
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

  // ================= HYBRID GEMINI AI + MULTI-TASK FALLBACK HANDLER =================
  const handleAnalyzeSmartInput = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanInput = smartInput.trim();
    if (!cleanInput) {
      showToast("Speak or type your tasks/logs into the bar first.");
      return;
    }

    setIsParsingAI(true);
    try {
      if (geminiApiKey.trim()) {
        try {
          const aiResults = await geminiSmartParse(
            cleanInput,
            geminiApiKey.trim(),
            projects,
            tasks,
            learningModules,
            employees,
            activeEmployeeEmail,
            currentWorkboard
          );
          setParsedPreviews(aiResults);
          return;
        } catch (aiErr) {
          console.warn("Gemini API fallback triggered:", aiErr);
          const fallbackResults = localSmartParse(
            cleanInput,
            employees,
            tasks,
            learnedAliases,
            currentWorkboard,
            activeEmployeeEmail,
            "⚡ Local Multi-Splitter (AI Key Fallback)"
          );
          setParsedPreviews(fallbackResults);
          showToast(`Split into ${fallbackResults.length} item(s) via Local Engine (Check Gemini API key in settings).`);
          return;
        }
      } else {
        const localResults = localSmartParse(
          cleanInput,
          employees,
          tasks,
          learnedAliases,
          currentWorkboard,
          activeEmployeeEmail,
          "⚡ Local Multi-Task Splitter"
        );
        setParsedPreviews(localResults);
      }
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
            Friday_Outcome: viewRole === "company" ? "Company Lead" : "Smart Split",
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
              return { ...p, Auto_Task_Hours: item.progress, Auto_Learning_Hours: Number(p.Auto_Learning_Hours || 0) + Number(item.minutes || 60), Status: item.progress >= 100 ? "Completed" : "In Progress", Completed_Date: item.progress >= 100 ? todayStr : "" };
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
          const newPulseId = "TSK-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
          newPulsesBatch.push({
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
          });
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

    if (newlyMintedTasks.length > 0) setTasks(prev => [...prev, ...newlyMintedTasks]);
    if (newPulsesBatch.length > 0) {
      setWeeklyPulses(prev => [...prev, ...newPulsesBatch]);
      try {
        fetch(APPS_SCRIPT_URL, {
          method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({ action: "addWorkboardBatch", items: newPulsesBatch })
        });
      } catch (err) {}
    }
    if (newLogsBatch.length > 0) setDailyLogs(prev => [...prev, ...newLogsBatch]);

    showToast(`✨ Approved & saved ${parsedPreviews.length} item(s)!`);
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
    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "addWorkboardBatch", items: createdItems })
      });
    } catch (err) {}

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
          learningMinutes: sessionLearningModule !== "None" ? Number(sessionLearningMins) : 0,
          progressPercent: sessionProgress,
          currentStreak: currentStreak || 1,
          status: sessionProgress >= 100 ? "Done" : "In Progress",
          notes: sessionNotes
        })
      });
    } catch (err) {}

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

    showToast(`Logged ${totalMins}m learning!`);
    setShowStandaloneLearning(false);
    setStandaloneNotes("");
  };

  const handleSaveRnR = () => {
    setIsSavingRnR(true);
    setEmployees(prev => prev.map(e => (e.Email || "").toLowerCase() === (activeEmployeeEmail || "").toLowerCase() ? { ...e, "R&R_Summary": rnrDraft } : e));
    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "updateEmployeeRnR", email: activeEmployeeEmail, rnrSummary: rnrDraft })
      });
    } catch (err) {}
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
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              title="Toggle Light/Dark Theme"
              className={`p-1.5 rounded-lg border transition ${isDark ? "bg-slate-800 border-slate-700 text-amber-400" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"}`}
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>

            {!isMobileScreen && (
              <button
                type="button"
                onClick={() => setForceMobilePreview(!forceMobilePreview)}
                title="Toggle Mobile Minimal View"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition ${forceMobilePreview ? "bg-indigo-50 text-indigo-700 border-indigo-200" : isDark ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"}`}
              >
                {forceMobilePreview ? <Monitor className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
                <span>{forceMobilePreview ? "Full Web" : "Mobile View"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowApiKeyModal(true)}
              title="Gemini AI Settings"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 transition ${geminiApiKey ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-amber-500/10 border-amber-500/30 text-amber-500"}`}
            >
              <Key className="h-3.5 w-3.5" />
              <span>{geminiApiKey ? "AI Key Active" : "Set AI Key"}</span>
            </button>

            <button type="button" onClick={fetchSheetData} title="Sync with Sheet" className={`p-1.5 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-500"}`}>
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            {!isCompactMobile && (
              <div className={`flex items-center p-0.5 rounded-lg border text-xs ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                <button
                  type="button"
                  onClick={() => setViewRole("employee")}
                  className={`px-2.5 py-1 rounded-md transition ${viewRole === "employee" ? (isDark ? "bg-slate-900 text-white font-semibold shadow-sm" : "bg-white text-slate-900 font-semibold shadow-sm") : "text-slate-400 hover:text-white"}`}
                >
                  My Cockpit
                </button>
                <button
                  type="button"
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

      {/* ================= GEMINI AI + MULTI-TASK SMART COMMAND BAR ================= */}
      <div className="max-w-6xl mx-auto px-4 pt-5 w-full">
        <div className={`border rounded-2xl p-3 sm:p-4 shadow-sm transition-colors ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90"}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
              <Wand2 className="h-3.5 w-3.5" /> Gemini AI Multi-Task Command Bar
              <span className={`font-normal hidden sm:inline ${isDark ? "text-slate-400" : "text-slate-400"}`}>
                — Speak or type multiple tasks, time logs, and learning sessions in one sentence
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

          <div className="flex items-center gap-2">
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAnalyzeSmartInput(e);
                }
              }}
              placeholder='Try: "Spent 2h on AMT Expo, 45m on Dexter BOM, add CSR proposal, and 30m learning CAD"'
              className={`flex-1 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none transition ${
                isDark 
                  ? "bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500" 
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500"
              }`}
            />

            <button
              type="button"
              onClick={handleAnalyzeSmartInput}
              disabled={isParsingAI || !smartInput.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-sm transition cursor-pointer"
            >
              <span>{isParsingAI ? "Splitting..." : "Gemini AI Split"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Split Previews */}
          {parsedPreviews.length > 0 && (
            <div className={`mt-3 pt-3 border-t space-y-2.5 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  Split into {parsedPreviews.length} Ready-to-Approve Item(s) <span className="text-indigo-500 font-normal">({parsedPreviews[0]?.engine})</span>:
                </span>
                <button type="button" onClick={() => setParsedPreviews([])} className="text-slate-400 hover:text-slate-600">
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
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" 
                            : item.intent === "LOG_LEARNING"
                            ? "bg-purple-500/10 text-purple-500 border-purple-500/30"
                            : "bg-blue-500/10 text-blue-500 border-blue-500/30"
                        }`}
                      >
                        <option value="ADD_TASK" className={isDark ? "bg-slate-900" : ""}>+ Add to Bucket</option>
                        <option value="LOG_TIME" className={isDark ? "bg-slate-900" : ""}>✓ Log Time Spent</option>
                        <option value="LOG_LEARNING" className={isDark ? "bg-slate-900" : ""}>🎓 Log Learning</option>
                      </select>

                      {item.intent === "LOG_LEARNING" ? (
                        <select
                          value={item.learningModuleCode || "LRN-HARD-01"}
                          onChange={(e) => setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, learningModuleCode: e.target.value } : p))}
                          className={`font-mono text-[11px] px-2 py-1 rounded-md border ${isDark ? "bg-slate-900 border-slate-700 text-purple-300" : "bg-white border-slate-200 text-purple-700"}`}
                        >
                          {learningModules.map(m => <option key={m.Module_Code} value={m.Module_Code}>{m.Module_Code} ({m.Topic_Title.slice(0, 18)})</option>)}
                        </select>
                      ) : (
                        <>
                          <select
                            value={item.projectId}
                            onChange={(e) => setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, projectId: e.target.value } : p))}
                            className={`font-mono text-[11px] px-2 py-1 rounded-md border ${isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-800"}`}
                          >
                            {projects.map(prj => <option key={prj.Project_ID} value={prj.Project_ID}>{prj.Project_ID}</option>)}
                          </select>

                          <select
                            value={item.taskCode}
                            onChange={(e) => {
                              const chosenCode = e.target.value;
                              if (item.triggerToken) {
                                setLearnedAliases(prev => ({ ...prev, [chosenCode]: Array.from(new Set([...(prev[chosenCode] || []), item.triggerToken])) }));
                              }
                              setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, taskCode: chosenCode, isNewTask: false } : p));
                            }}
                            className={`font-mono text-[11px] px-2 py-1 rounded-md border ${item.isNewTask ? "bg-amber-500/10 text-amber-500 border-amber-500/30 font-bold" : isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-800"}`}
                          >
                            {item.isNewTask && <option value={item.taskCode}>✨ NEW: {item.taskCode} ({item.newTaskTitle})</option>}
                            {tasks.map(t => <option key={t.Task_Code} value={t.Task_Code}>{t.Task_Code} ({t.Task_Title.slice(0, 20)})</option>)}
                          </select>
                        </>
                      )}

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
                          <input type="number" min="5" step="5" value={item.minutes} onChange={(e) => setParsedPreviews(prev => prev.map((p, i) => i === idx ? { ...p, minutes: Number(e.target.value) } : p))} className={

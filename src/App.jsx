import React, { useState } from 'react';
import { 
  Flame, Award, CheckCircle, Clock, BookOpen, TrendingUp, 
  Send, Shield, Users, User, ChevronRight, AlertCircle, Sparkles
} from 'lucide-react';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxw-R8QfMxEghzmZGlYLnLmlN_Xz4nrtBu_PKHRsyCBWYwl7hd_JUZb9H8IFRfcb00c/exec";

const INITIAL_TEAM = [
  {
    id: "IE-001",
    name: "Jaswanth Singh",
    role: "Visual Communication Head",
    dept: "Creative & Marketing",
    level: "L3 Advanced",
    kras: "Dexter Box marketing collateral, packaging shoots, ad creatives, video editing, social media assets",
    streak: 24,
    xp: 3450,
    activeSkill: "MDF & Digital 3D CAD Design",
    skillProgress: 85,
    milestonesDone: 2,
    milestonesTotal: 3
  },
  {
    id: "IE-002",
    name: "Swetha",
    role: "Playzone Facilitator & Video Producer",
    dept: "Content & Facilitation",
    level: "L2 Independent",
    kras: "Grade 1-2 practical science sessions, weekly Reels & podcast production, AI video tools",
    streak: 18,
    xp: 2450,
    activeSkill: "Advanced AI Video Generation (Runway / Pika)",
    skillProgress: 90,
    milestonesDone: 2,
    milestonesTotal: 3
  },
  {
    id: "IE-003",
    name: "Arunachalam",
    role: "STEM Trainer & School Success Exec",
    dept: "Training & Delivery",
    level: "L2 Independent",
    kras: "Daily STEM training across 4 partner schools (600+ students), student robotics projects",
    streak: 22,
    xp: 2800,
    activeSkill: "Raspberry Pi & Python for Robotics",
    skillProgress: 75,
    milestonesDone: 2,
    milestonesTotal: 3
  },
  {
    id: "IE-004",
    name: "Dhananjayan",
    role: "STEM Facilitator & Trainer",
    dept: "Training & Labs",
    level: "L2 Independent",
    kras: "District-level STEM workshops across TN, hands-on robotics, drone tech & IoT modules",
    streak: 20,
    xp: 2600,
    activeSkill: "Drone Tech & Microprocessors (ESP32)",
    skillProgress: 80,
    milestonesDone: 2,
    milestonesTotal: 3
  },
  {
    id: "IE-005",
    name: "Aarthi",
    role: "ATL Operations & CSR Growth",
    dept: "Operations & BD",
    level: "L3 Advanced",
    kras: "ATL school compliance, CSR proposal drafting, partnership pitching, renewals",
    streak: 26,
    xp: 3900,
    activeSkill: "B2B CSR Outreach & Grant Proposals",
    skillProgress: 100,
    milestonesDone: 2,
    milestonesTotal: 3
  },
  {
    id: "IE-006",
    name: "Alamelu",
    role: "Accounts & Documentation",
    dept: "Finance & Admin",
    level: "L2 Independent",
    kras: "Zoho Books ledgers, GST return filing, sales/purchase invoicing, audit documentation",
    streak: 25,
    xp: 3100,
    activeSkill: "Zoho Books Advanced Ledgers & Costing",
    skillProgress: 100,
    milestonesDone: 3,
    milestonesTotal: 3
  }
];

const TASK_CATEGORIES = [
  { id: "DEL", label: "DEL - Core Delivery (R&R)", color: "bg-blue-600/30 text-blue-300 border-blue-500/40" },
  { id: "STR", label: "STR - Monthly Strategic Goal", color: "bg-emerald-600/30 text-emerald-300 border-emerald-500/40" },
  { id: "LRN", label: "LRN - Applied Learning", color: "bg-purple-600/30 text-purple-300 border-purple-500/40" },
  { id: "OPS", label: "OPS - Admin / Housekeeping", color: "bg-amber-600/30 text-amber-300 border-amber-5

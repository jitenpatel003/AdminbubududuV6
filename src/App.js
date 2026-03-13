// ═══════════════════════════════════════════════════════════════
//  BUBU DUDU — ADMIN PANEL v4.0
//  Light Theme Only · 7-Stage Status · Production-Focused
//  Firebase · Fully Updated to Match Booking Form
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useEffect, useRef } from "react";
import {
  LayoutDashboard, Calendar, Bell, Search,
  ChevronLeft, ChevronRight, X, Check, AlertTriangle, Clock,
  Video, User, Mail, MessageCircle, Link2, Tag, Download,
  Archive, RotateCcw, Star, Zap, TrendingUp,
  AlertCircle, CheckCircle2, FileText, Send, Pencil,
  Plus, Copy, Globe, Truck, Hash, Activity,
  ArrowLeft, Filter, Package,
  ChevronDown, Inbox, BarChart2, History, Settings,
  Clipboard, Layers, ChevronUp, CheckSquare, Square,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, onSnapshot, doc, updateDoc,
  query, orderBy, addDoc,
} from "firebase/firestore";

// ── FIREBASE CONFIG ───────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBrzaNDH7LY4S_Tm587G8m-M5sZwJojWGg",
  authDomain: "bubu-dudu-orders.firebaseapp.com",
  projectId: "bubu-dudu-orders",
  storageBucket: "bubu-dudu-orders.firebasestorage.app",
  messagingSenderId: "777698426354",
  appId: "1:777698426354:web:c2850904fcf0b024dabf6b",
};
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

const ADMIN_PIN = "bubu2024";

const STATUSES = [
  { key: "Script Review",    label: "Script Review",    color: "#fff", bg: "#2563EB", pct: 0  },
  { key: "Script Approved",  label: "Script Approved",  color: "#fff", bg: "#7C3AED", pct: 20 },
  { key: "In Progress",      label: "In Progress",      color: "#fff", bg: "#D97706", pct: 50 },
  { key: "Preview Sent",     label: "Preview Sent",     color: "#fff", bg: "#6D28D9", pct: 75 },
  { key: "Completed",        label: "Completed",        color: "#fff", bg: "#15803D", pct: 100 },
];
const ARCHIVED_STATUS = { key: "Archived", label: "Archived", color: "#fff", bg: "#6B7280", pct: 0 };
const ALL_STATUSES = [...STATUSES, ARCHIVED_STATUS];
const ARCHIVE_REASONS = ["Customer cancelled", "Not suitable request", "Duplicate order", "Rejected project", "Other"];
const PRODUCTION_STATUSES = ["Script Approved", "In Progress", "Preview Sent"];

const PRIORITIES = [
  { key: "Normal",        label: "Normal",        color: "#6B7280", bg: "#F3F4F6" },
  { key: "High Priority", label: "High Priority", color: "#EA580C", bg: "#FFF7ED" },
  { key: "VIP",           label: "VIP",           color: "#6D28D9", bg: "#EDE9FE" },
];

const TAGS_OPTIONS = [
  "Birthday","Anniversary","Wedding","Proposal",
  "Romantic","Friendship","Holiday","Custom",
];

const DEFAULT_TASKS = [
  "Script written",
  "Voice recorded",
  "Animation started",
  "Preview exported",
  "Final rendered",
];

// ── LIGHT THEME ONLY ─────────────────────────────────────────
const C = {
  pu:"#6D28D9", gr:"#16A34A", or:"#EA580C", re:"#DC2626",
  bl:"#2563EB", ye:"#D97706", dg:"#15803D",
  bg:"#F8F9FC", sb:"#0F172A", sbh:"#1E293B", ca:"#FFFFFF",
  bo:"#E5E7EB", tx:"#111827", su:"#6B7280", li:"#F3F4F6",
  th:"#EEF2FF", in:"#FFFFFF",
};

// ── FLAGS ─────────────────────────────────────────────────────
const FLAGS = {
  "United States":"🇺🇸","Canada":"🇨🇦","Germany":"🇩🇪","India":"🇮🇳",
  "Japan":"🇯🇵","Brazil":"🇧🇷","France":"🇫🇷","Australia":"🇦🇺",
  "United Kingdom":"🇬🇧","China":"🇨🇳","Mexico":"🇲🇽","Italy":"🇮🇹",
  "Spain":"🇪🇸","South Korea":"🇰🇷","Argentina":"🇦🇷","Netherlands":"🇳🇱",
  "Sweden":"🇸🇪","Norway":"🇳🇴","Denmark":"🇩🇰","Portugal":"🇵🇹",
  "Turkey":"🇹🇷","Egypt":"🇪🇬","South Africa":"🇿🇦","Pakistan":"🇵🇰",
  "Indonesia":"🇮🇩","Malaysia":"🇲🇾","Philippines":"🇵🇭","Thailand":"🇹🇭",
  "Singapore":"🇸🇬","Saudi Arabia":"🇸🇦","Russia":"🇷🇺","Ukraine":"🇺🇦",
  "Greece":"🇬🇷","Switzerland":"🇨🇭","New Zealand":"🇳🇿","Ireland":"🇮🇪",
  "Colombia":"🇨🇴",
};

// ── TIMEZONE MAP ─────────────────────────────────────────────
const TIMEZONE_MAP = {
  "United States":"America/New_York","Canada":"America/Toronto","Germany":"Europe/Berlin",
  "India":"Asia/Kolkata","Japan":"Asia/Tokyo","Brazil":"America/Sao_Paulo","France":"Europe/Paris",
  "Australia":"Australia/Sydney","United Kingdom":"Europe/London","China":"Asia/Shanghai",
  "Mexico":"America/Mexico_City","Italy":"Europe/Rome","Spain":"Europe/Madrid",
  "South Korea":"Asia/Seoul","Argentina":"America/Argentina/Buenos_Aires","Netherlands":"Europe/Amsterdam",
  "Sweden":"Europe/Stockholm","Norway":"Europe/Oslo","Denmark":"Europe/Copenhagen",
  "Portugal":"Europe/Lisbon","Turkey":"Europe/Istanbul","Egypt":"Africa/Cairo",
  "South Africa":"Africa/Johannesburg","Pakistan":"Asia/Karachi","Indonesia":"Asia/Jakarta",
  "Malaysia":"Asia/Kuala_Lumpur","Philippines":"Asia/Manila","Thailand":"Asia/Bangkok",
  "Singapore":"Asia/Singapore","Saudi Arabia":"Asia/Riyadh","Russia":"Europe/Moscow",
  "Ukraine":"Europe/Kyiv","Greece":"Europe/Athens","Switzerland":"Europe/Zurich",
  "New Zealand":"Pacific/Auckland","Ireland":"Europe/Dublin","Colombia":"America/Bogota",
};

// ── HELPERS ───────────────────────────────────────────────────
const flag      = (c) => FLAGS[c] || "🏳";
const LEGACY_STATUS_MAP = {
  "Script Writing": { key: "Script Approved", label: "Script Approved", color: "#fff", bg: "#7C3AED", pct: 20 },
  "Waiting For Approval": { key: "Script Approved", label: "Script Approved", color: "#fff", bg: "#7C3AED", pct: 20 },
  "Animation In Progress": { key: "In Progress", label: "In Progress", color: "#fff", bg: "#D97706", pct: 50 },
  "Final Delivery": { key: "Completed", label: "Completed", color: "#fff", bg: "#15803D", pct: 100 },
  "Draft": { key: "Archived", label: "Archived", color: "#fff", bg: "#6B7280", pct: 0 },
};
const sCfg = (k) => ALL_STATUSES.find((s) => s.key === k) || LEGACY_STATUS_MAP[k] || STATUSES[0];
const pCfg      = (k) => PRIORITIES.find((p) => p.key === k) || PRIORITIES[0];
const isArchived = (o) => o.status === "Archived" || o.status === "Draft";
const hoursLeft = (d) => Math.ceil((new Date(d) - new Date()) / 3600000);
const smartDL   = (d) => {
  const h = hoursLeft(d);
  if (h < 0)    return `${Math.abs(Math.ceil(h / 24))}d overdue`;
  if (h <= 24)  return `${h}h left`;
  return `${Math.ceil(h / 24)}d left`;
};
const dlCol = (d) => {
  const h = hoursLeft(d);
  if (h < 0)    return C.re;
  if (h <= 48)  return C.or;
  if (h <= 168) return C.ye;
  return C.gr;
};
const dlBg = (d) => {
  const h = hoursLeft(d);
  if (h < 0)    return "#FEF2F2";
  if (h <= 48)  return "#FFF7ED";
  if (h <= 168) return "#FEFCE8";
  return "#F0FDF4";
};
const fmtDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
const fmtTS = () => {
  const n = new Date();
  return n.toLocaleDateString("en-GB") + " " + n.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const getUrgencyLevel = (o) => {
  if (!o) return null;
  const h = hoursLeft(o.deadline);
  if (h < 0)  return { label: "OVERDUE",   color: "#DC2626", emoji: "🔴" };
  if (h <= 24) return { label: "URGENT",   color: "#EA580C", emoji: "🔥" };
  if (o.priority === "VIP") return { label: "VIP",       color: "#6D28D9", emoji: "⭐" };
  if (o.delivery?.includes("Emergency")) return { label: "EMERGENCY", color: "#EA580C", emoji: "⚡" };
  if (o.priority === "High Priority")    return { label: "HIGH",      color: "#EA580C", emoji: "⚡" };
  return null;
};

const playBeep = () => {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
  } catch (_) {}
};

// ═══════════════════════════════════════════════════════════════
// ROOT COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function AdminPanel() {

  // ── AUTH ───────────────────────────────────────────────────
  const [authed,  setAuthed]  = useState(false);
  const [pin,     setPin]     = useState("");
  const [pinErr,  setPinErr]  = useState("");
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("connecting");
  const [page,    setPage]    = useState("dash");
  const [selId,   setSelId]   = useState(null);

  // ── MOBILE ────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // ── FILTERS (Orders page) ─────────────────────────────────
  const [fStatus,   setFS]    = useState("All");
  const [fCountry,  setFC]    = useState("All");
  const [fLength,   setFL]    = useState("All");
  const [fLanguage, setFLang] = useState("All");
  const [fDelivery, setFD]    = useState("All");
  const [fPriority, setFP]    = useState("All");
  const [fTag,      setFTag]  = useState("All");
  const [search,    setSearch] = useState("");
  const [sortK,     setSortK] = useState("date");
  const [sortD,     setSortD] = useState("desc");
  const [filterOpen, setFilterOpen] = useState(false);

  // ── LAZY LOADING ──────────────────────────────────────────
  const [visible, setVisible] = useState(30);
  useEffect(() => { setVisible(30); }, [fStatus, fCountry, fLength, fLanguage, fDelivery, fPriority, fTag, search]);

  // ── NOTIFICATIONS ─────────────────────────────────────────
  const [toast,     setToast]     = useState("");
  const [newAlert,  setNewAlert]  = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [newOrders, setNewOrders] = useState([]);

  // ── MODALS ────────────────────────────────────────────────
  const [changeModal,      setChangeModal]      = useState(false);
  const [changeTxt,        setChangeTxt]        = useState("");
  const [calSheet,         setCalSheet]         = useState(null);
  const [custHistModal,    setCustHistModal]    = useState(false);
  const [tagModalOpen,     setTagModalOpen]     = useState(false);
  const [archiveReasonModal, setArchiveReasonModal] = useState(false);
  const [pendingArchiveOrd,  setPendingArchiveOrd]  = useState(null);
  const [archiveReasonSel,   setArchiveReasonSel]   = useState(ARCHIVE_REASONS[0]);
  const [revenueView,      setRevenueView]      = useState(false);

  // ── CALENDAR ──────────────────────────────────────────────
  const [calYear,  setCalYear]  = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  // ── NOTES ─────────────────────────────────────────────────
  const [noteInput, setNoteInput] = useState("");

  // ── BULK ──────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkMode,    setBulkMode]    = useState(false);
  const [activeOrdersTab, setActiveOrdersTab] = useState("active");
  const DEFAULT_SETTINGS = {
    shortPrice: 40, longPrice: 80, maxCapacity: 8, orderIdPrefix: "BD",
    soundEnabled: true,
    workingHoursStart: "09:00", workingHoursEnd: "20:00",
    adminName: "Admin", businessName: "Bubu Dudu", adminPhoto: "",
    briefingTime: "09:00",
    emailTemplates: {
      scriptApproved: { subject: "Your Script Is Approved! 🎬", body: "Hi {name},\n\nGreat news! Your script has been approved and we are now starting the animation.\n\nOrder ID: {orderId}\n\nWe'll send you a preview soon!\n\nBubu Dudu Team" },
      previewReady:   { subject: "Your Preview Is Ready! 👀", body: "Hi {name},\n\nYour video preview is ready for review.\n\nOrder ID: {orderId}\n\nPlease check and let us know if any changes are needed.\n\nBubu Dudu Team" },
      finalDelivery:  { subject: "Your Final Video Is Ready! 🎉", body: "Hi {name},\n\nYour final video has been completed and delivered!\n\nOrder ID: {orderId}\n\nThank you for choosing Bubu Dudu. We hope you love it!\n\nBubu Dudu Team" },
      paymentRequest: { subject: "Payment Request — Bubu Dudu 💳", body: "Hi {name},\n\nThis is a friendly reminder that payment is due for your order.\n\nOrder ID: {orderId}\nAmount: ${amount}\n\nPlease complete payment at your earliest convenience.\n\nBubu Dudu Team" },
    },
  };
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("bubududu_settings");
      if (!saved) return { ...DEFAULT_SETTINGS };
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed, emailTemplates: { ...DEFAULT_SETTINGS.emailTemplates, ...(parsed.emailTemplates || {}) } };
    } catch { return { ...DEFAULT_SETTINGS }; }
  });
  const [settingsTab,      setSettingsTab]      = useState("settings");
  const [dailyBriefingDismissed, setDailyBriefingDismissed] = useState(() => {
    try { return localStorage.getItem("bubududu_briefing_date") === new Date().toISOString().split("T")[0]; }
    catch { return false; }
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [milestoneMsg,     setMilestoneMsg]     = useState("");

  const prevCountRef = useRef(0);
  const font = "'Nunito', sans-serif";
  const sh   = "0 1px 8px rgba(0,0,0,0.06)";
  const shMd = "0 4px 20px rgba(0,0,0,0.1)";

  const calcRevenue = (o) => (o.length?.includes("40") || o.length?.toLowerCase().includes("short")) ? settings.shortPrice : settings.longPrice;

  const toast_ = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  // ── FIREBASE LISTENER ─────────────────────────────────────
  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ ...d.data(), _docId: d.id }));
      if (prevCountRef.current > 0 && data.length > prevCountRef.current) {
        const newest = data[0];
        setNewAlert(newest);
        setNewOrders((p) => [newest, ...p]);
        if (settings.soundEnabled !== false) playBeep();
        setTimeout(() => setNewAlert(null), 8000);
      }
      prevCountRef.current = data.length;
      setOrders(data);
      setLoading(false);
      setSyncStatus("live");
    }, (err) => {
      console.error(err);
      setSyncStatus("error");
      setLoading(false);
    });
    return () => unsub();
  }, [authed]);

  // ── DERIVED LISTS (useMemo for performance) ───────────────
  const archivedOrders  = useMemo(() => orders.filter(isArchived), [orders]);
  const activeOrders    = useMemo(() => orders.filter((o) => !isArchived(o) && o.status !== "Completed"), [orders]);
  const completedOrders = useMemo(() => orders.filter((o) => o.status === "Completed"), [orders]);
  const approvedOrders  = useMemo(() => orders.filter((o) => !isArchived(o)), [orders]);

  // ── STATS ─────────────────────────────────────────────────
  const stats = useMemo(() => ({
    totalApproved: approvedOrders.length,
    totalRevenue:  completedOrders.reduce((s, o) => s + calcRevenue(o), 0),
    inProgress:    activeOrders.filter(o => PRODUCTION_STATUSES.includes(o.status) || ["Script Writing","Waiting For Approval","Animation In Progress","Final Delivery"].includes(o.status)).length,
    completed:     completedOrders.length,
    totalReceived: orders.length,
    overdue:       activeOrders.filter((o) => hoursLeft(o.deadline) < 0).length,
    urgent:        activeOrders.filter((o) => { const h = hoursLeft(o.deadline); return h >= 0 && h <= 48; }).length,
  }), [approvedOrders, completedOrders, activeOrders, orders, settings.shortPrice, settings.longPrice]);

  // ── ALL-ORDERS FILTER (Orders page) ───────────────────────
  const filteredAll = useMemo(() => {
    let a = [...orders];
    if (activeOrdersTab === "active") a = a.filter(o => !isArchived(o) && o.status !== "Completed");
    else if (activeOrdersTab === "archived") a = a.filter(isArchived);
    if (fStatus   !== "All") a = a.filter((o) => o.status   === fStatus);
    if (fCountry  !== "All") a = a.filter((o) => o.country  === fCountry);
    if (fLanguage !== "All") a = a.filter((o) => o.language === fLanguage);
    if (fLength   !== "All") a = a.filter((o) => {
      if (fLength === "Short") return o.length?.includes("40");
      if (fLength === "Long")  return !o.length?.includes("40");
      return true;
    });
    if (fDelivery !== "All") a = a.filter((o) => o.delivery === fDelivery);
    if (fPriority !== "All") a = a.filter((o) => (o.priority || "Normal") === fPriority);
    if (fTag      !== "All") a = a.filter((o) => (o.tags || []).includes(fTag));
    if (search.trim()) {
      const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
      a = a.filter((o) =>
        terms.every((t) =>
          o.id?.toLowerCase().includes(t) ||
          o.name?.toLowerCase().includes(t) ||
          o.country?.toLowerCase().includes(t) ||
          o.email?.toLowerCase().includes(t) ||
          o.status?.toLowerCase().includes(t)
        )
      );
    }
    a.sort((x, y) => {
      let vx = x[sortK], vy = y[sortK];
      if (sortK === "date" || sortK === "deadline") { vx = new Date(vx); vy = new Date(vy); }
      return sortD === "asc" ? (vx < vy ? -1 : vx > vy ? 1 : 0) : (vx > vy ? -1 : vx < vy ? 1 : 0);
    });
    return a;
  }, [orders, activeOrdersTab, fStatus, fCountry, fLanguage, fLength, fDelivery, fPriority, fTag, search, sortK, sortD]);

  // ── SMART NOTIFICATIONS ───────────────────────────────────
  const smartNotifications = useMemo(() => {
    const notifs = [];
    newOrders.forEach((n) =>
      notifs.push({ type: "new", order: n, msg: `New order: ${n.name} (${n.id})`, color: "#16A34A" })
    );
    activeOrders.forEach((o) => {
      const h = hoursLeft(o.deadline);
      if (h < 0)     notifs.push({ type: "overdue",  order: o, msg: `${o.id} is OVERDUE!`, color: "#DC2626" });
      else if (h <= 12) notifs.push({ type: "urgent", order: o, msg: `${o.id} — ${h}h left!`, color: "#EA580C" });
      if (o.priority === "VIP" && h > 12)
        notifs.push({ type: "vip", order: o, msg: `VIP order: ${o.name} (${o.id})`, color: "#6D28D9" });
    });
    activeOrders.forEach(o => {
      const lastEvent = (o.timeline || []).slice(-1)[0];
      if (lastEvent) {
        const daysSince = (Date.now() - new Date(lastEvent.ts).getTime()) / 86400000;
        if (daysSince >= 3) notifs.push({ type: "stalled", order: o, msg: `${o.id} stalled (${Math.floor(daysSince)}d no activity)`, color: "#D97706" });
      }
    });
    return notifs;
  }, [activeOrders, newOrders]);

  const countries  = useMemo(() => ["All", ...Array.from(new Set(orders.map((o) => o.country).filter(Boolean))).sort()], [orders]);

  const returningCustomers = useMemo(() => {
    const emailCount = {};
    orders.forEach(o => { if (o.email) emailCount[o.email] = (emailCount[o.email] || 0) + 1; });
    return new Set(Object.entries(emailCount).filter(([,c]) => c > 1).map(([e]) => e));
  }, [orders]);

  const order      = orders.find((o) => o.id === selId);
  const customerHistory = order ? orders.filter((o) => o.email === order.email && o.id !== order.id) : [];

  // ── UPDATE HELPERS ────────────────────────────────────────
  const updateOrder = async (ord, changes) => {
    if (!ord._docId) return;
    try { await updateDoc(doc(db, "orders", ord._docId), changes); }
    catch (e) { toast_("Save failed — check connection"); }
  };

  const setStatus = async (ord, s) => {
    const prevTimeline = ord.timeline || [];
    const entry = { event: `Status → ${s}`, ts: fmtTS() };
    await updateOrder(ord, { status: s, timeline: [...prevTimeline, entry] });
    toast_(`Status updated: ${s}`);
    if (s === "Completed") {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      const newCount = completedOrders.length + 1;
      const MILESTONES = [10, 25, 50, 100, 250, 500];
      if (MILESTONES.includes(newCount)) {
        setMilestoneMsg(`🎉 Amazing! You just completed your ${newCount}th order!`);
        setTimeout(() => setMilestoneMsg(""), 6000);
      }
    }
  };

  const setPri = async (ord, p) => {
    const prevTimeline = ord.timeline || [];
    const entry = { event: `Priority → ${p}`, ts: fmtTS() };
    await updateOrder(ord, { priority: p, timeline: [...prevTimeline, entry] });
  };

  const addNote = async (ord) => {
    if (!noteInput.trim()) return;
    const prev = ord.adminNotesList || [];
    const newNote = { text: noteInput.trim(), ts: fmtTS() };
    const prevTimeline = ord.timeline || [];
    const entry = { event: `Note added`, ts: fmtTS() };
    await updateOrder(ord, { adminNotesList: [...prev, newNote], timeline: [...prevTimeline, entry] });
    setNoteInput("");
    toast_("Note saved");
  };

  const copyScript = () => {
    if (order?.scriptText) {
      navigator.clipboard.writeText(order.scriptText).then(() => toast_("Script copied!"));
    }
  };

  const toggleTag = async (ord, tag) => {
    const cur  = ord.tags || [];
    const next = cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag];
    await updateOrder(ord, { tags: next });
  };

  const moveToArchive = (ord) => {
    setPendingArchiveOrd(ord);
    setArchiveReasonSel(ARCHIVE_REASONS[0]);
    setArchiveReasonModal(true);
  };

  const confirmMoveToArchive = async () => {
    if (!pendingArchiveOrd) return;
    const prevTimeline = pendingArchiveOrd.timeline || [];
    const entry = { event: `Archived: ${archiveReasonSel}`, ts: fmtTS() };
    await updateOrder(pendingArchiveOrd, {
      status: "Archived",
      archiveReason: archiveReasonSel,
      timeline: [...prevTimeline, entry],
    });
    toast_(`Archived: ${archiveReasonSel}`);
    setArchiveReasonModal(false);
    setPendingArchiveOrd(null);
    if (page === "detail") setPage("orders");
  };

  const restoreFromArchive = async (ord) => {
    const prevTimeline = ord.timeline || [];
    const entry = { event: `Restored from Archive`, ts: fmtTS() };
    await updateOrder(ord, { status: "Script Review", archiveReason: "", timeline: [...prevTimeline, entry] });
    toast_("Restored to active");
  };

  const toggleTask = async (ord, idx) => {
    const tasks = (ord.tasks && ord.tasks.length > 0)
      ? ord.tasks
      : DEFAULT_TASKS.map((t) => ({ label: t, done: false }));
    const updated = tasks.map((task, i) => i === idx ? { ...task, done: !task.done } : task);
    await updateOrder(ord, { tasks: updated });
  };

  const duplicateOrder = async (ord) => {
    const newId = `${ord.id}-DUP`;
    const copy  = { ...ord };
    delete copy._docId;
    Object.assign(copy, {
      id: newId, status: "Script Review",
      timeline: [{ event: `Duplicated from ${ord.id}`, ts: fmtTS() }],
      adminNotesList: [], tasks: [],
      createdAt: new Date().toISOString(),
      date: new Date().toISOString().split("T")[0],
      draftReason: "",
    });
    try {
      await addDoc(collection(db, "orders"), copy);
      toast_(`Duplicated as ${newId}`);
    } catch (e) { toast_("Duplicate failed — check connection"); }
  };

  const bulkMarkCompleted = async () => {
    for (const id of selectedIds) {
      const ord = orders.find((o) => o.id === id);
      if (ord) await setStatus(ord, "Completed");
    }
    toast_(`${selectedIds.size} orders marked completed`);
    setSelectedIds(new Set()); setBulkMode(false);
  };

  const exportCSV = () => {
    const headers = ["ID","Customer","Country","Language","Email","Status","Priority","Video Length","Delivery","Deadline","Submitted","Revenue"];
    const rows = filteredAll.map((o) => [
      o.id, o.name, o.country, o.language || "—", o.email, o.status,
      o.priority || "Normal", o.length, o.delivery, o.deadline, o.date, calcRevenue(o),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `bubududu-orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast_("CSV exported!");
  };

  // ── SHARED UI COMPONENTS ──────────────────────────────────

  const Badge = ({ status }) => {
    const s = sCfg(status);
    const animate = (status === "In Progress" || status === "Animation In Progress") ? "statusPulse 2s ease-in-out infinite" : "none";
    return (
      <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", fontFamily: font, animation: animate }}>
        {s.label}
      </span>
    );
  };

  const PBadge = ({ priority }) => {
    if (!priority || priority === "Normal") return null;
    const p    = pCfg(priority);
    const Icon = priority === "VIP" ? Star : Zap;
    return (
      <span style={{ background: p.bg, color: p.color, padding: "3px 9px", borderRadius: 6, fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}>
        <Icon size={9} /> {p.label}
      </span>
    );
  };

  const UrgencyBadge = ({ order: o }) => {
    const u = getUrgencyLevel(o);
    if (!u) return null;
    const animate = u.label === "OVERDUE" ? "glowRed 1.5s ease-in-out infinite" : "none";
    return (
      <span style={{ background: u.color + "22", color: u.color, padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, whiteSpace: "nowrap", animation: animate }}>
        {u.emoji} {u.label}
      </span>
    );
  };

  const DLChip = ({ deadline }) => {
    const col  = dlCol(deadline);
    const bg_  = dlBg(deadline);
    const pulse = hoursLeft(deadline) < 0;
    return (
      <span style={{
        background: bg_, color: col, padding: "3px 9px", borderRadius: 6,
        fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
        display: "inline-flex", alignItems: "center", gap: 4,
        animation: pulse ? "pulse 1s infinite" : "none",
        border: pulse ? `1px solid ${col}44` : "none",
      }}>
        <Clock size={10} /> {smartDL(deadline)}
      </span>
    );
  };

  const TagChip = ({ tag, onRemove }) => (
    <span style={{ background: "#EFF6FF", color: C.bl, padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
      <Tag size={9} /> {tag}
      {onRemove && <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: C.su, padding: 0, display: "flex" }}><X size={10} /></button>}
    </span>
  );

  const Sec = ({ title, icon: Icon, children, action }) => (
    <div style={{ background: C.ca, borderRadius: 12, border: `1px solid ${C.bo}`, padding: isMobile ? "14px 16px" : "18px 20px", marginBottom: 14, boxShadow: sh }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: C.su, letterSpacing: 1, display: "flex", alignItems: "center", gap: 6 }}>
          {Icon && <Icon size={12} />} {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );

  const Row = ({ label, value }) => (
    <div style={{ display: "flex", gap: 12, marginBottom: 9, alignItems: "flex-start" }}>
      <span style={{ fontSize: 12, color: C.su, fontWeight: 600, minWidth: isMobile ? 100 : 130, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: C.tx, fontWeight: 600, flex: 1 }}>{value || "—"}</span>
    </div>
  );

  const Btn = ({ children, onClick, color = C.pu, size = "md", outline = false, icon: BtnIcon, disabled }) => {
    const pad = size === "sm" ? "6px 14px" : "9px 18px";
    const fs  = size === "sm" ? 11 : 13;
    return (
      <button onClick={onClick} disabled={disabled} style={{ padding: pad, borderRadius: 8, background: disabled ? C.li : outline ? "transparent" : color, color: disabled ? C.su : outline ? color : "#fff", border: outline ? `1.5px solid ${color}` : "none", fontSize: fs, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", fontFamily: font, display: "inline-flex", alignItems: "center", gap: 5 }}>
        {BtnIcon && <BtnIcon size={fs - 2} />} {children}
      </button>
    );
  };

  // ── LOGIN ─────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, padding: 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ background: "#1E293B", borderRadius: 20, padding: "40px 36px", maxWidth: 380, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", textAlign: "center", border: "1px solid #334155" }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "#6D28D9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>🐼</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#F1F5F9", marginBottom: 4 }}>Bubu Dudu</div>
        <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 28 }}>Admin Panel v4 · @dudu_phudu</div>
        <div style={{ textAlign: "left", marginBottom: 8 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: 0.8, display: "block", marginBottom: 6 }}>ADMIN PIN</label>
          <input type="password" value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (pin === ADMIN_PIN ? setAuthed(true) : setPinErr("Incorrect PIN. Try again."))}
            placeholder="Enter your PIN…"
            style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: `1.5px solid ${pinErr ? "#DC2626" : "#334155"}`, fontSize: 16, fontFamily: font, color: "#F1F5F9", background: "#0F172A", outline: "none", boxSizing: "border-box", textAlign: "center", letterSpacing: 8 }} />
          {pinErr && <div style={{ fontSize: 12, color: "#F87171", marginTop: 6, fontWeight: 600 }}>{pinErr}</div>}
        </div>
        <button onClick={() => pin === ADMIN_PIN ? setAuthed(true) : setPinErr("Incorrect PIN. Try again.")}
          style={{ width: "100%", padding: 13, borderRadius: 10, background: "#6D28D9", color: "#fff", border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font, marginTop: 8 }}>
          Enter Admin Panel
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid ${C.pu}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ fontSize: 14, color: C.su, fontWeight: 600 }}>Connecting to Firebase…</div>
      </div>
    </div>
  );

  // ── SIDEBAR (Desktop) ─────────────────────────────────────
  const navItems = [
    { id: "dash",      label: "Dashboard",       Icon: LayoutDashboard },
    { id: "orders",    label: "Orders",           Icon: Package },
    { id: "cal",       label: "Calendar",         Icon: Calendar },
    { id: "completed", label: "Completed Orders", Icon: CheckCircle2 },
    { id: "settings",  label: "Settings",         Icon: Settings },
  ];

  const Sidebar = () => (
    <div style={{ width: 220, minHeight: "100vh", background: C.sb, padding: "20px 0", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
      <div style={{ padding: "0 18px 18px", borderBottom: "1px solid #1E293B" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {settings.adminPhoto && /^(https?:\/\/|data:image\/)/.test(settings.adminPhoto) ? (
            <img src={settings.adminPhoto} alt="admin" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover" }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#6D28D9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🐼</div>
          )}
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#F1F5F9" }}>{settings.businessName || "Bubu Dudu"}</div>
            <div style={{ fontSize: 10, color: "#64748B" }}>{settings.adminName || "Admin"}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 10px 0", flex: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#475569", letterSpacing: 1, padding: "0 8px", marginBottom: 4 }}>MAIN</div>
        {navItems.map(({ id, label, Icon: Ic }) => {
          const active = page === id;
          return (
            <button key={id} onClick={() => setPage(id)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 9, padding: "9px 10px", width: "100%", background: active ? "#1E293B" : "transparent", border: "none", cursor: "pointer", color: active ? "#F1F5F9" : "#CBD5E1", fontSize: 13, fontFamily: font, fontWeight: active ? 700 : 600, borderRadius: 8, textAlign: "left" }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#1E293B"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
              <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Ic size={15} /> {label}
              </span>
              {id === "orders"    && orders.length > 0    && <span style={{ background: "#334155", color: "#94A3B8", borderRadius: 20, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{orders.length}</span>}
              {id === "completed" && stats.completed > 0  && <span style={{ background: "#15803D", color: "#fff", borderRadius: 20, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{stats.completed}</span>}
              {id === "dash"      && stats.inProgress > 0 && <span style={{ background: "#6D28D9", color: "#fff", borderRadius: 20, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{stats.inProgress}</span>}
            </button>
          );
        })}

        <div style={{ height: 1, background: "#1E293B", margin: "10px 0" }} />
        <button onClick={() => { setNotifOpen((o) => !o); setNewOrders([]); }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 10px", width: "100%", background: "transparent", border: "none", cursor: "pointer", color: "#CBD5E1", fontSize: 13, fontFamily: font, fontWeight: 600, borderRadius: 8 }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#1E293B"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
          <span style={{ display: "flex", alignItems: "center", gap: 9 }}><Bell size={15} /> Notifications</span>
          {smartNotifications.length > 0 && <span style={{ background: "#DC2626", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{Math.min(smartNotifications.length, 9)}</span>}
        </button>

        {notifOpen && (
          <div style={{ margin: "4px 0 0", background: "#0F172A", borderRadius: 10, padding: 10, maxHeight: 260, overflowY: "auto", border: "1px solid #1E293B" }}>
            {smartNotifications.length === 0 ? (
              <div style={{ fontSize: 11, color: "#475569", textAlign: "center", padding: "10px 0" }}>All clear! No alerts.</div>
            ) : smartNotifications.map((n, i) => (
              <div key={i} onClick={() => { setSelId(n.order.id); setPage("detail"); setNotifOpen(false); }}
                style={{ padding: "8px 10px", borderRadius: 8, marginBottom: 4, background: "#1E293B", cursor: "pointer", borderLeft: `3px solid ${n.color}` }}>
                <div style={{ fontSize: 11, color: "#E2E8F0", fontWeight: 700 }}>{n.msg}</div>
                <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>{flag(n.order.country)} {n.order.id}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "14px 10px", borderTop: "1px solid #1E293B" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: syncStatus === "live" ? "#4ADE80" : syncStatus === "error" ? "#F87171" : "#FCD34D" }} />
          <span style={{ fontSize: 10, color: "#64748B" }}>
            {syncStatus === "live" ? `Live · ${orders.length} orders` : syncStatus === "error" ? "Error" : "Connecting…"}
          </span>
        </div>
      </div>
    </div>
  );

  // ── BOTTOM NAV (Mobile) ───────────────────────────────────
  const BottomNav = () => (
    <div style={{ position: "fixed", bottom: 0, left: 0, width: "100%", height: 60, background: C.ca, borderTop: `1px solid ${C.bo}`, display: "flex", justifyContent: "space-around", alignItems: "center", zIndex: 100, boxShadow: "0 -4px 16px rgba(0,0,0,0.08)" }}>
      {[
        [LayoutDashboard, "Dash",     () => setPage("dash"),      page === "dash"],
        [Package,         "Orders",   () => setPage("orders"),    page === "orders"],
        [Calendar,        "Calendar", () => setPage("cal"),       page === "cal"],
        [CheckCircle2,    "Done",     () => setPage("completed"), page === "completed"],
        [Settings,        "Settings", () => setPage("settings"),  page === "settings"],
      ].map(([Ic, lb, fn, active]) => (
        <button key={lb} onClick={fn} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", color: active ? C.pu : C.su, padding: "6px 10px", borderRadius: 8 }}>
          <Ic size={19} />
          <span style={{ fontSize: 9, fontWeight: 700, fontFamily: font }}>{lb}</span>
        </button>
      ))}
    </div>
  );

  // ── ORDER CARD — Minimal redesign ─────────────────────────
  const OrderCard = ({ o, showRevenue = false }) => {
    const urgency = getUrgencyLevel(o);
    return (
      <div
        onClick={() => { setSelId(o.id); setPage("detail"); }}
        style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${urgency ? urgency.color + "44" : C.bo}`, marginBottom: 10, background: C.ca, boxShadow: sh, cursor: "pointer", transition: "box-shadow 0.15s" }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = shMd}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = sh}
      >
        {/* Top row: Order ID + priority */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontWeight: 900, color: C.pu, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{o.id}</span>
          <div style={{ display: "flex", gap: 5 }}>
            {urgency && <span style={{ background: urgency.color + "20", color: urgency.color, fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4 }}>{urgency.emoji} {urgency.label}</span>}
            <PBadge priority={o.priority} />
          </div>
        </div>

        {/* Customer */}
        <div style={{ fontSize: 14, fontWeight: 700, color: C.tx, marginBottom: 3 }}>{o.name}</div>
        <div style={{ fontSize: 12, color: C.su, marginBottom: 8 }}>{flag(o.country)} {o.country}</div>
        {returningCustomers.has(o.email) && (
          <span style={{ display: "inline-block", background: "#EFF6FF", color: "#2563EB", fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4, marginBottom: 4 }}>↩ Returning</span>
        )}

        {/* Order details */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: C.su }}>
            🎬 {o.length?.includes("40") ? "Short" : "Long"}
          </span>
          {o.deadline && <DLChip deadline={o.deadline} />}
          {showRevenue && <span style={{ fontSize: 12, fontWeight: 700, color: C.gr }}>${calcRevenue(o)}</span>}
        </div>

        {/* Status */}
        <Badge status={o.status} />
      </div>
    );
  };

  // ── FILTER DRAWER (Mobile, Orders page) ──────────────────
  const FilterDrawer = () => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "flex-end" }} onClick={() => setFilterOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.ca, borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.tx }}>Filters</div>
          <button onClick={() => setFilterOpen(false)} style={{ background: C.li, border: "none", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.su }}><X size={14} /></button>
        </div>
        {[
          ["Status",       fStatus,   setFS,    ["All", ...STATUSES.map(s => s.key), "Archived"], "All Statuses"],
          ["Country",      fCountry,  setFC,    countries,                                       "All Countries"],
          ["Video Length", fLength,   setFL,    ["All", "Short", "Long"],                        "All Lengths"],
          ["Language",     fLanguage, setFLang, ["All", "English", "Hindi"],                     "All Languages"],
          ["Priority",     fPriority, setFP,    ["All", ...PRIORITIES.map(p => p.key)],          "All Priorities"],
          ["Delivery",     fDelivery, setFD,    ["All","Standard (5–7 Days)","Emergency (24–48 Hours)","Custom Date"], "All Deliveries"],
          ["Tag",          fTag,      setFTag,  ["All", ...TAGS_OPTIONS],                        "All Tags"],
        ].map(([label, val, fn, opts, ph]) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.su, letterSpacing: 0.8, marginBottom: 6 }}>{label.toUpperCase()}</div>
            <select value={val} onChange={(e) => fn(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.bo}`, fontSize: 13, fontFamily: font, color: C.tx, background: C.in, cursor: "pointer", outline: "none" }}>
              {opts.map((o) => <option key={o} value={o}>{o === "All" ? ph : o}</option>)}
            </select>
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button onClick={() => { setFS("All"); setFC("All"); setFL("All"); setFLang("All"); setFD("All"); setFP("All"); setFTag("All"); setSearch(""); }}
            style={{ flex: 1, padding: 12, borderRadius: 10, background: C.li, border: `1px solid ${C.bo}`, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, color: C.su }}>
            Reset
          </button>
          <button onClick={() => setFilterOpen(false)}
            style={{ flex: 2, padding: 12, borderRadius: 10, background: C.pu, border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: font, color: "#fff" }}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );

  // ── DASHBOARD VIEW — approved orders only, no mail buttons ─
  const DashView = () => {
    // Approved = all non-Draft
    const dashOrders = orders
      .filter((o) => PRODUCTION_STATUSES.includes(o.status))
      .sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""));

    return (
      <div style={{ padding: isMobile ? "16px" : "28px 32px", flex: 1, overflowY: "auto", paddingBottom: isMobile ? 80 : undefined }}>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, color: C.tx }}>Dashboard</div>
            <div style={{ fontSize: 13, color: C.su, marginTop: 2 }}>Production overview · active orders only</div>
          </div>
          <button onClick={() => setRevenueView((v) => !v)}
            style={{ padding: "8px 16px", borderRadius: 8, background: C.li, border: `1px solid ${C.bo}`, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, color: C.su, display: "flex", alignItems: "center", gap: 6 }}>
            <BarChart2 size={14} /> {revenueView ? "Hide" : "Revenue"}
          </button>
        </div>

        {/* Stats Widgets */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Approved",    value: stats.totalApproved, color: C.pu, bg: "#EDE9FE", emoji: "📋" },
            { label: "Total Revenue",     value: `$${stats.totalRevenue}`, color: C.gr, bg: "#F0FDF4", emoji: "💰" },
            { label: "In Progress",       value: stats.inProgress, color: C.or, bg: "#FFF7ED", emoji: "⚙️" },
            { label: "Completed",         value: stats.completed,  color: C.dg, bg: "#F0FDF4", emoji: "✅" },
            { label: "Total Received",    value: stats.totalReceived, color: C.bl, bg: "#EFF6FF", emoji: "📥" },
          ].map(({ label, value, color, bg, emoji }) => (
            <div key={label} style={{ background: C.ca, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.bo}`, boxShadow: sh }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{emoji}</div>
              <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, color }}>{value}</div>
              <div style={{ fontSize: 11, color: C.su, fontWeight: 600, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Capacity indicator */}
        {(() => {
          const activeProductionCount = orders.filter(o => PRODUCTION_STATUSES.includes(o.status)).length;
          const maxCap = settings.maxCapacity;
          if (activeProductionCount >= maxCap) {
            return (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#DC2626" }}>🔴 At capacity! {activeProductionCount}/{maxCap} active orders</span>
              </div>
            );
          } else if (activeProductionCount >= maxCap - 1) {
            return (
              <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#D97706" }}>⚠️ Near capacity: {activeProductionCount}/{maxCap} active orders</span>
              </div>
            );
          }
          return null;
        })()}

        {/* Revenue chart */}
        {revenueView && <RevenueChart />}

        {/* Alert strip */}
        {(stats.overdue > 0 || stats.urgent > 0) && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 16px", marginBottom: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
            {stats.overdue > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: C.re }}>🔴 {stats.overdue} overdue</span>}
            {stats.urgent  > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: C.or }}>🔥 {stats.urgent} urgent (&lt;48h)</span>}
          </div>
        )}

        {/* Active Orders Table — no mail buttons, approved only */}
        <div style={{ background: C.ca, borderRadius: 14, border: `1px solid ${C.bo}`, boxShadow: sh, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.bo}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.tx }}>Active Orders ({dashOrders.length})</div>
            <div style={{ fontSize: 11, color: C.su, fontWeight: 600 }}>Archived & Completed excluded</div>
          </div>

          {isMobile ? (
            <div style={{ padding: "12px" }}>
              {dashOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: C.su }}>
                  <CheckCircle2 size={32} style={{ margin: "0 auto 10px" }} />
                  <div style={{ fontSize: 14, fontWeight: 700 }}>All caught up!</div>
                </div>
              ) : dashOrders.map((o) => <OrderCard key={o.id} o={o} />)}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Order ID","Customer","Country","Video","Deadline","Status","Progress","Priority"].map((h) => (
                      <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontWeight: 700, color: C.su, fontSize: 11, letterSpacing: 0.5, background: C.li, borderBottom: `1px solid ${C.bo}`, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dashOrders.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px 0", color: C.su, fontSize: 14 }}>No active orders</td></tr>
                  ) : dashOrders.map((o, i) => (
                    <tr key={o.id}
                      onClick={() => { setSelId(o.id); setPage("detail"); }}
                      style={{ background: i % 2 === 0 ? C.ca : "#FAFAFA", cursor: "pointer", transition: "background 0.1s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = C.th}
                      onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? C.ca : "#FAFAFA"}>
                      <td style={{ padding: "13px 14px", fontWeight: 800, color: C.pu, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                        {o.id}
                        <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                          <UrgencyBadge order={o} />
                        </div>
                      </td>
                      <td style={{ padding: "13px 14px", fontWeight: 700, color: C.tx }}>{o.name}</td>
                      <td style={{ padding: "13px 14px", color: C.tx, whiteSpace: "nowrap" }}>{flag(o.country)} {o.country}</td>
                      <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 12, color: C.su, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                          🎬 {o.length?.includes("40") ? "Short" : "Long"}
                        </span>
                      </td>
                      <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                        {o.deadline ? <DLChip deadline={o.deadline} /> : "—"}
                      </td>
                      <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }} onClick={(e) => e.stopPropagation()}>
                        <select value={o.status} onChange={(e) => setStatus(o, e.target.value)}
                          style={{ padding: "5px 9px", borderRadius: 6, border: "none", fontSize: 11, fontWeight: 700, color: sCfg(o.status).color, background: sCfg(o.status).bg, cursor: "pointer", fontFamily: font, outline: "none", appearance: "none" }}>
                          {STATUSES.map((s) => <option key={s.key} value={s.key} style={{ background: "#fff", color: "#333" }}>{s.label}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: "13px 14px", whiteSpace: "nowrap", minWidth: 100 }}>
                        <div style={{ height: 6, background: C.bo, borderRadius: 99, width: 80 }}>
                          <div style={{ height: 6, borderRadius: 99, width: `${sCfg(o.status).pct}%`, background: sCfg(o.status).bg, transition: "width 0.4s" }} />
                        </div>
                        <div style={{ fontSize: 10, color: C.su, marginTop: 3 }}>{sCfg(o.status).pct}%</div>
                      </td>
                      <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }} onClick={(e) => e.stopPropagation()}>
                        <select value={o.priority || "Normal"} onChange={(e) => setPri(o, e.target.value)}
                          style={{ padding: "5px 9px", borderRadius: 6, border: `1px solid ${pCfg(o.priority || "Normal").color}33`, fontSize: 11, fontWeight: 700, color: pCfg(o.priority || "Normal").color, background: pCfg(o.priority || "Normal").bg, cursor: "pointer", fontFamily: font, outline: "none", appearance: "none" }}>
                          {PRIORITIES.map((p) => <option key={p.key} value={p.key} style={{ background: "#fff", color: "#333" }}>{p.label}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── ALL ORDERS VIEW — every order with date dividers ──────
  const AllOrdersView = () => {
    // Group by date
    const grouped = useMemo(() => {
      const vis = filteredAll.slice(0, visible);
      const map = {};
      vis.forEach((o) => {
        const d = o.date || "Unknown";
        if (!map[d]) map[d] = [];
        map[d].push(o);
      });
      return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
    }, [filteredAll, visible]);

    const activeFilters = [fStatus, fCountry, fLength, fLanguage, fDelivery, fPriority, fTag].filter(v => v !== "All").length;

    return (
      <div style={{ padding: isMobile ? "16px" : "28px 32px", flex: 1, overflowY: "auto", paddingBottom: isMobile ? 80 : undefined }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, color: C.tx }}>All Orders</div>
            <div style={{ fontSize: 13, color: C.su, marginTop: 2 }}>{orders.length} total · {archivedOrders.length} archived</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={exportCSV}
              style={{ padding: "8px 14px", borderRadius: 8, background: C.li, border: `1px solid ${C.bo}`, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, color: C.su, display: "flex", alignItems: "center", gap: 5 }}>
              <Download size={13} /> CSV
            </button>
            {isMobile && (
              <button onClick={() => setFilterOpen(true)}
                style={{ padding: "8px 14px", borderRadius: 8, background: activeFilters > 0 ? C.pu : C.li, border: `1px solid ${activeFilters > 0 ? C.pu : C.bo}`, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, color: activeFilters > 0 ? "#fff" : C.su, display: "flex", alignItems: "center", gap: 5 }}>
                <Filter size={13} /> {activeFilters > 0 ? `${activeFilters} active` : "Filter"}
              </button>
            )}
          </div>
        </div>

        {/* Tab selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[["active","Active Orders"],["archived","Archived"]].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveOrdersTab(tab)}
              style={{ padding: "8px 20px", borderRadius: 8, background: activeOrdersTab === tab ? C.pu : C.ca, color: activeOrdersTab === tab ? "#fff" : C.su, border: `1px solid ${activeOrdersTab === tab ? C.pu : C.bo}`, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              {label} {tab === "active" ? `(${activeOrders.length})` : `(${archivedOrders.length})`}
            </button>
          ))}
        </div>

        {/* Search + filters (desktop) */}
        <div style={{ background: C.ca, borderRadius: 12, border: `1px solid ${C.bo}`, padding: "14px 16px", marginBottom: 16, boxShadow: sh }}>
          <div style={{ display: "flex", gap: 10, marginBottom: isMobile ? 0 : 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180, display: "flex", alignItems: "center", gap: 8, background: C.li, borderRadius: 8, padding: "8px 12px", border: `1px solid ${C.bo}` }}>
              <Search size={14} color={C.su} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, name, country, status…"
                style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, fontFamily: font, color: C.tx, outline: "none" }} />
              {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: C.su, padding: 0 }}><X size={13} /></button>}
            </div>
          </div>

          {!isMobile && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                ["Status",   fStatus,   setFS,    ["All", ...STATUSES.map(s => s.key), "Archived"]],
                ["Country",  fCountry,  setFC,    countries],
                ["Length",   fLength,   setFL,    ["All","Short","Long"]],
                ["Language", fLanguage, setFLang, ["All","English","Hindi"]],
                ["Priority", fPriority, setFP,    ["All", ...PRIORITIES.map(p => p.key)]],
                ["Delivery", fDelivery, setFD,    ["All","Standard (5–7 Days)","Emergency (24–48 Hours)","Custom Date"]],
                ["Tag",      fTag,      setFTag,  ["All", ...TAGS_OPTIONS]],
              ].map(([label, val, fn, opts]) => (
                <select key={label} value={val} onChange={(e) => fn(e.target.value)}
                  style={{ padding: "7px 10px", borderRadius: 8, border: `1px solid ${val !== "All" ? C.pu : C.bo}`, fontSize: 12, fontFamily: font, color: val !== "All" ? C.pu : C.su, background: val !== "All" ? "#EDE9FE" : C.in, cursor: "pointer", outline: "none", fontWeight: val !== "All" ? 700 : 500 }}>
                  <option value="All">{label}</option>
                  {opts.filter(o => o !== "All").map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ))}
              {activeFilters > 0 && (
                <button onClick={() => { setFS("All"); setFC("All"); setFL("All"); setFLang("All"); setFD("All"); setFP("All"); setFTag("All"); setSearch(""); }}
                  style={{ padding: "7px 12px", borderRadius: 8, background: "#FEF2F2", border: "1px solid #FECACA", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, color: C.re }}>
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {bulkMode && selectedIds.size > 0 && (
          <div style={{ background: C.pu + "15", border: `1px solid ${C.pu}44`, borderRadius: 10, padding: "10px 16px", marginBottom: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.pu }}>{selectedIds.size} selected</span>
            <button onClick={bulkMarkCompleted} style={{ padding: "6px 14px", borderRadius: 6, background: C.gr, color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Mark Completed</button>
            <button onClick={() => { setSelectedIds(new Set()); setBulkMode(false); }} style={{ padding: "6px 14px", borderRadius: 6, background: C.li, border: `1px solid ${C.bo}`, color: C.su, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Cancel</button>
          </div>
        )}

        {/* Grouped by date */}
        {filteredAll.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: C.su }}>
            <Inbox size={40} style={{ margin: "0 auto 12px" }} />
            <div style={{ fontSize: 16, fontWeight: 700 }}>No orders found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters</div>
          </div>
        ) : (
          <>
            {grouped.map(([date, dateOrders]) => (
              <div key={date}>
                {/* Date divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, marginTop: 4 }}>
                  <div style={{ height: 1, background: C.bo, flex: 1 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.su, whiteSpace: "nowrap", background: C.bg, padding: "2px 10px", borderRadius: 20, border: `1px solid ${C.bo}` }}>
                    📅 {fmtDate(date)} · {dateOrders.length} order{dateOrders.length > 1 ? "s" : ""}
                  </span>
                  <div style={{ height: 1, background: C.bo, flex: 1 }} />
                </div>

                {isMobile ? (
                  dateOrders.map((o) => <OrderCard key={o.id} o={o} />)
                ) : (
                  <div style={{ background: C.ca, borderRadius: 12, border: `1px solid ${C.bo}`, marginBottom: 12, overflow: "hidden", boxShadow: sh }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <tbody>
                        {dateOrders.map((o, i) => (
                          <tr key={o.id}
                            onClick={() => { setSelId(o.id); setPage("detail"); }}
                            style={{ background: i % 2 === 0 ? C.ca : "#FAFAFA", cursor: "pointer", borderBottom: i < dateOrders.length - 1 ? `1px solid ${C.bo}` : "none" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = C.th}
                            onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? C.ca : "#FAFAFA"}>
                            <td style={{ padding: "11px 14px", width: 40 }} onClick={(e) => { e.stopPropagation(); if (!bulkMode) setBulkMode(true); const n = new Set(selectedIds); n.has(o.id) ? n.delete(o.id) : n.add(o.id); setSelectedIds(n); }}>
                              {selectedIds.has(o.id) ? <CheckSquare size={15} color={C.pu} /> : <Square size={15} color={C.su} />}
                            </td>
                            <td style={{ padding: "11px 14px", fontWeight: 800, color: C.pu, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", minWidth: 100 }}>
                              {o.id}
                              <div style={{ marginTop: 2 }}><UrgencyBadge order={o} /></div>
                            </td>
                            <td style={{ padding: "11px 14px", minWidth: 130 }}>
                              <div style={{ fontWeight: 700, color: C.tx, fontSize: 13 }}>{o.name}</div>
                              <div style={{ fontSize: 11, color: C.su }}>{o.email}</div>
                            </td>
                            <td style={{ padding: "11px 14px", color: C.tx, whiteSpace: "nowrap" }}>{flag(o.country)} {o.country}</td>
                            <td style={{ padding: "11px 14px", whiteSpace: "nowrap", fontSize: 12, color: C.su }}>
                              🎬 {o.length?.includes("40") ? "Short" : "Long"}
                            </td>
                            <td style={{ padding: "11px 14px", fontSize: 12, color: C.su, whiteSpace: "nowrap" }}>
                              {o.language || "—"}
                            </td>
                            <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                              {o.deadline ? <DLChip deadline={o.deadline} /> : "—"}
                            </td>
                            <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                              <Badge status={o.status} />
                            </td>
                            <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                              <PBadge priority={o.priority} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}

            {visible < filteredAll.length && (
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <button onClick={() => setVisible((v) => v + 30)}
                  style={{ padding: "10px 28px", borderRadius: 10, background: C.li, border: `1px solid ${C.bo}`, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, color: C.su }}>
                  Load More ({filteredAll.length - visible} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // ── COMPLETED ORDERS VIEW ─────────────────────────────────
  const CompletedView = () => {
    const totalRev = completedOrders.reduce((s, o) => s + calcRevenue(o), 0);
    return (
      <div style={{ padding: isMobile ? "16px" : "28px 32px", flex: 1, overflowY: "auto", paddingBottom: isMobile ? 80 : undefined }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, color: C.tx }}>Completed Orders</div>
            <div style={{ fontSize: 13, color: C.su, marginTop: 2 }}>
              {completedOrders.length} orders · Total revenue: <strong style={{ color: C.gr }}>${totalRev}</strong>
            </div>
          </div>
        </div>

        {completedOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: C.su }}>
            <CheckCircle2 size={40} style={{ margin: "0 auto 12px" }} />
            <div style={{ fontSize: 15, fontWeight: 700 }}>No completed orders yet</div>
          </div>
        ) : isMobile ? (
          completedOrders.map((o) => <OrderCard key={o.id} o={o} showRevenue />)
        ) : (
          <div style={{ background: C.ca, borderRadius: 14, border: `1px solid ${C.bo}`, boxShadow: sh, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Order ID","Customer","Country","Video Length","Deadline","Completed Date","Revenue"].map((h) => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontWeight: 700, color: C.su, fontSize: 11, letterSpacing: 0.5, background: C.li, borderBottom: `1px solid ${C.bo}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completedOrders.map((o, i) => (
                  <tr key={o.id}
                    onClick={() => { setSelId(o.id); setPage("detail"); }}
                    style={{ background: i % 2 === 0 ? C.ca : "#FAFAFA", cursor: "pointer" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = C.th}
                    onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? C.ca : "#FAFAFA"}>
                    <td style={{ padding: "13px 16px", fontWeight: 800, color: C.pu, fontVariantNumeric: "tabular-nums" }}>{o.id}</td>
                    <td style={{ padding: "13px 16px", fontWeight: 700, color: C.tx }}>{o.name}</td>
                    <td style={{ padding: "13px 16px", color: C.tx, whiteSpace: "nowrap" }}>{flag(o.country)} {o.country}</td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: C.su, whiteSpace: "nowrap" }}>
                      🎬 {o.length?.includes("40") ? "Short" : "Long"}
                    </td>
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      {o.deadline ? <DLChip deadline={o.deadline} /> : "—"}
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: C.su, whiteSpace: "nowrap" }}>
                      {fmtDate(o.date)}
                    </td>
                    <td style={{ padding: "13px 16px", fontWeight: 800, color: C.gr, whiteSpace: "nowrap" }}>
                      ${calcRevenue(o)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#F0FDF4", borderTop: `2px solid ${C.bo}` }}>
                  <td colSpan={6} style={{ padding: "12px 16px", fontWeight: 800, color: C.tx, fontSize: 13 }}>Total Revenue</td>
                  <td style={{ padding: "12px 16px", fontWeight: 900, color: C.gr, fontSize: 15 }}>${totalRev}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    );
  };

  // ── REVENUE CHART ─────────────────────────────────────────
  const RevenueChart = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d  = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const rev = completedOrders.filter((o) => o.date === ds).reduce((s, o) => s + calcRevenue(o), 0);
      const cnt = completedOrders.filter((o) => o.date === ds).length;
      days.push({ ds, rev, cnt, label: d.toLocaleDateString("en-GB", { weekday: "short" }) });
    }
    const maxRev = Math.max(...days.map((d) => d.rev), 1);

    return (
      <div style={{ background: C.ca, borderRadius: 14, border: `1px solid ${C.bo}`, padding: "18px 20px", marginBottom: 20, boxShadow: sh }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.tx }}>Revenue (Last 7 Days · Completed Orders)</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 80 }}>
          {days.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{ fontSize: 8, color: C.su, fontWeight: 700 }}>{d.rev > 0 ? `$${d.rev}` : ""}</div>
              <div style={{ width: "100%", background: `linear-gradient(to top, ${C.pu}, ${C.bl})`, borderRadius: "4px 4px 0 0", height: `${Math.max((d.rev / maxRev) * 56, d.rev > 0 ? 4 : 0)}px`, minHeight: 1, transition: "height 0.4s" }} />
              <div style={{ fontSize: 9, color: C.su, fontWeight: 600 }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── CALENDAR VIEW — approved orders only ─────────────────
  const CalView = () => {
    const firstDay    = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const todayDate   = new Date().getDate();
    const todayMon    = new Date().getMonth();
    const todayYr     = new Date().getFullYear();

    const byDay = {};
    orders.filter(o => PRODUCTION_STATUSES.includes(o.status)).forEach((o) => {
      if (!o.deadline) return;
      const parts = o.deadline.split("-");
      if (parseInt(parts[1]) - 1 === calMonth && parseInt(parts[0]) === calYear) {
        const d = parseInt(parts[2]);
        if (!byDay[d]) byDay[d] = [];
        byDay[d].push(o);
      }
    });

    const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
    const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
      <div style={{ padding: isMobile ? "16px" : "28px 32px", flex: 1, overflowY: "auto", paddingBottom: isMobile ? 80 : undefined }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: C.tx }}>Deadline Calendar</div>
            <div style={{ fontSize: 13, color: C.su, marginTop: 2 }}>Active production orders · Archived & Completed excluded</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: 8, background: C.ca, border: `1px solid ${C.bo}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.tx }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: isMobile ? 13 : 15, fontWeight: 800, color: C.tx, minWidth: 140, textAlign: "center" }}>
              {MONTH_NAMES[calMonth]} {calYear}
            </span>
            <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: 8, background: C.ca, border: `1px solid ${C.bo}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.tx }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div style={{ background: C.ca, borderRadius: 14, border: `1px solid ${C.bo}`, overflow: "hidden", boxShadow: sh }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: `1px solid ${C.bo}` }}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: isMobile ? 9 : 11, fontWeight: 700, color: C.su, padding: isMobile ? "8px 0" : "12px 0", background: C.li }}>
                {isMobile ? d.charAt(0) : d}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
            {cells.map((day, i) => {
              const isToday = day && day === todayDate && calMonth === todayMon && calYear === todayYr;
              const dos = day ? (byDay[day] || []) : [];
              return (
                <div key={i}
                  onClick={() => day && dos.length > 0 && setCalSheet({ day, orders: dos })}
                  style={{ borderRight: (i + 1) % 7 !== 0 ? `1px solid ${C.bo}` : "none", borderBottom: `1px solid ${C.bo}`, minHeight: isMobile ? 50 : 80, padding: isMobile ? 4 : 8, background: isToday ? "#F5F3FF" : C.ca, cursor: day && dos.length > 0 ? "pointer" : "default" }}
                  onMouseEnter={(e) => { if (day && dos.length > 0) e.currentTarget.style.background = "#F5F3FF"; }}
                  onMouseLeave={(e) => { if (day) e.currentTarget.style.background = isToday ? "#F5F3FF" : C.ca; }}>
                  {day && (
                    <>
                      <div style={{ fontSize: isMobile ? 10 : 13, fontWeight: isToday ? 900 : 600, color: isToday ? C.pu : C.tx, background: isToday ? "#EDE9FE" : "transparent", width: isMobile ? 18 : 24, height: isMobile ? 18 : 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{day}</div>
                      {dos.length > 0 && (
                        <div style={{ marginTop: isMobile ? 2 : 6 }}>
                          {!isMobile && dos.slice(0, 2).map((o) => (
                            <div key={o.id} style={{ fontSize: 9, color: dlCol(o.deadline), fontWeight: 700, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {o.name} · {o.length?.includes("40") ? "Short" : "Long"}
                            </div>
                          ))}
                          {!isMobile && dos.length > 2 && <div style={{ fontSize: 8, color: C.su, fontWeight: 700 }}>+{dos.length - 2} more</div>}
                          {isMobile && (
                            <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                              {dos.slice(0, 3).map((o) => (
                                <div key={o.id} style={{ width: 5, height: 5, borderRadius: "50%", background: dlCol(o.deadline) }} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
          {[["#DC2626","Overdue"],["#EA580C","< 48h"],["#D97706","< 1 week"],["#16A34A","On track"]].map(([col, lbl]) => (
            <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.su }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: col }} /> {lbl}
            </div>
          ))}
        </div>

        {/* Calendar sheet modal */}
        {calSheet && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 20 }}>
            <div style={{ background: C.ca, borderRadius: 16, padding: 24, maxWidth: 440, width: "100%", boxShadow: shMd, maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.tx }}>{MONTH_NAMES[calMonth]} {calSheet.day}</div>
                  <div style={{ fontSize: 12, color: C.su, marginTop: 2 }}>{calSheet.orders.length} order{calSheet.orders.length > 1 ? "s" : ""} due</div>
                </div>
                <button onClick={() => setCalSheet(null)} style={{ background: C.li, border: "none", cursor: "pointer", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: C.su }}><X size={16} /></button>
              </div>
              {calSheet.orders.map((o) => (
                <div key={o.id}
                  onClick={() => { setSelId(o.id); setPage("detail"); setCalSheet(null); }}
                  style={{ padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.bo}`, cursor: "pointer", marginBottom: 8, background: C.li }}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.th}
                  onMouseLeave={(e) => e.currentTarget.style.background = C.li}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 800, color: C.pu, fontSize: 13 }}>{o.id}</div>
                      <div style={{ fontWeight: 700, color: C.tx, fontSize: 13, marginTop: 2 }}>{o.name}</div>
                      <div style={{ fontSize: 12, color: C.su, marginTop: 2 }}>
                        {flag(o.country)} {o.country} · 🎬 {o.length?.includes("40") ? "Short" : "Long"}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                      <Badge status={o.status} />
                      {o.deadline && <DLChip deadline={o.deadline} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── DETAIL VIEW ───────────────────────────────────────────
  const DetailView = () => {
    if (!order) return (
      <div style={{ padding: 40, flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: C.su }}>
          <AlertCircle size={40} style={{ margin: "0 auto 12px" }} />
          <div>Order not found</div>
          <button onClick={() => setPage("dash")} style={{ marginTop: 12, padding: "8px 16px", borderRadius: 8, background: C.li, border: `1px solid ${C.bo}`, cursor: "pointer", color: C.tx, fontFamily: font, fontSize: 12 }}>Back to Dashboard</button>
        </div>
      </div>
    );

    const timeline  = order.timeline || [];
    const notesList = order.adminNotesList || (order.adminNotes ? [{ text: order.adminNotes, ts: "Imported" }] : []);
    const orderTags = order.tags || [];
    const taskList  = (order.tasks && order.tasks.length > 0)
      ? order.tasks
      : DEFAULT_TASKS.map((t) => ({ label: t, done: false }));
    const taskDone  = taskList.filter((t) => t.done).length;
    const urgency   = getUrgencyLevel(order);
    const [deliveryMethod_, setDeliveryMethod_] = useState(order.deliveryMethod || "");
    const [deliveryLink_,   setDeliveryLink_]   = useState(order.deliveryLink || "");

    return (
      <div style={{ padding: isMobile ? "16px" : "28px 32px", flex: 1, overflowY: "auto", paddingBottom: isMobile ? 80 : undefined }}>
        {/* Back + header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 14 }}>
            <button onClick={() => setPage("dash")} style={{ width: 36, height: 36, borderRadius: 8, background: C.ca, border: `1px solid ${C.bo}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.tx, boxShadow: sh, flexShrink: 0 }}>
              <ArrowLeft size={16} />
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: isMobile ? 16 : 20, fontWeight: 900, color: C.tx, fontVariantNumeric: "tabular-nums" }}>{order.id}</span>
                <Badge status={order.status} />
                <PBadge priority={order.priority} />
                {urgency && (
                  <span style={{ background: urgency.color + "20", color: urgency.color, padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800 }}>
                    {urgency.emoji} {urgency.label}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: C.su, marginTop: 3 }}>{order.name} · {flag(order.country)} {order.country}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(isArchived(order)) ? (
              <Btn color={C.gr} icon={RotateCcw} onClick={() => restoreFromArchive(order)}>Restore</Btn>
            ) : (
              <Btn color={C.su} outline icon={Archive} onClick={() => moveToArchive(order)}>Archive</Btn>
            )}
            <Btn color={C.bl} outline icon={Copy} onClick={() => duplicateOrder(order)}>Duplicate</Btn>
          </div>
        </div>

        {/* Progress tracker */}
        {!isArchived(order) && (
          <div style={{ background: C.ca, borderRadius: 12, border: `1px solid ${C.bo}`, padding: "16px 20px", marginBottom: 14, boxShadow: sh }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.su }}>Progress</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: sCfg(order.status).bg }}>{sCfg(order.status).pct}%</span>
            </div>
            <div style={{ height: 6, background: C.bo, borderRadius: 99, marginBottom: 12 }}>
              <div style={{ height: 6, borderRadius: 99, width: `${sCfg(order.status).pct}%`, background: sCfg(order.status).bg, transition: "width 0.5s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", overflowX: "auto", gap: 2 }}>
              {STATUSES.map((st) => {
                const done = sCfg(order.status).pct >= st.pct;
                const curr = order.status === st.key;
                return (
                  <div key={st.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: isMobile ? 36 : 50 }}>
                    <div style={{ width: isMobile ? 16 : 20, height: isMobile ? 16 : 20, borderRadius: "50%", background: curr ? st.bg : done ? st.bg + "88" : C.bo, display: "flex", alignItems: "center", justifyContent: "center", border: curr ? `2px solid ${st.bg}` : "none", boxShadow: curr ? `0 0 0 3px ${st.bg}22` : "none" }}>
                      {done ? <Check size={8} color="#fff" /> : <span style={{ fontSize: 7, color: C.su }}>{STATUSES.indexOf(st) + 1}</span>}
                    </div>
                    <span style={{ fontSize: isMobile ? 6 : 7, color: curr ? st.bg : C.su, marginTop: 3, textAlign: "center", fontWeight: curr ? 800 : 600, lineHeight: 1.2 }}>
                      {isMobile ? st.label.split(" ")[0] : st.label.split(" ").slice(0, 2).join(" ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!isArchived(order) && (
          <div style={{ background: C.ca, borderRadius: 12, border: `1px solid ${C.bo}`, padding: "14px 18px", marginBottom: 14, boxShadow: sh }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.su, letterSpacing: 1, marginBottom: 12 }}>QUICK ACTIONS</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                ["✅ Script Approved",  "Script Approved",  "#7C3AED"],
                ["🎬 In Progress",     "In Progress",      "#D97706"],
                ["👁 Preview Sent",     "Preview Sent",     "#6D28D9"],
                ["🏁 Completed",       "Completed",        "#15803D"],
                ["💬 WhatsApp",        null,               "#25D366"],
                ["📧 Email",           null,               "#2563EB"],
              ].map(([label, status, color]) => (
                <button key={label}
                  onClick={() => {
                    if (status) setStatus(order, status);
                    else if (label.includes("WhatsApp")) order.whatsapp ? window.open(`https://wa.me/${order.whatsapp.replace(/[^0-9]/g,"")}`) : toast_("No WhatsApp on file");
                    else if (label.includes("Email")) order.email ? window.open(`mailto:${order.email}`) : toast_("No email on file");
                  }}
                  style={{ padding: "8px 14px", borderRadius: 8, background: color + "18", color, border: `1px solid ${color}33`, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
          <div>
            {/* Status & Actions */}
            {!isArchived(order) && (
              <Sec title="STATUS & ACTIONS" icon={Settings}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  <select value={order.status} onChange={(e) => setStatus(order, e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.bo}`, fontSize: 12, fontFamily: font, color: C.tx, background: C.in, cursor: "pointer", outline: "none", flex: 1 }}>
                    {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                  <select value={order.priority || "Normal"} onChange={(e) => setPri(order, e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.bo}`, fontSize: 12, fontFamily: font, color: C.tx, background: C.in, cursor: "pointer", outline: "none", flex: 1 }}>
                    {PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Btn color={C.or} outline icon={Pencil} onClick={() => setChangeModal(true)}>Request Script Changes</Btn>
                </div>
              </Sec>
            )}

            {/* Customer */}
            <Sec title="CUSTOMER" icon={User} action={
              customerHistory.length > 0 && (
                <button onClick={() => setCustHistModal(true)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.bl, background: "none", border: "none", cursor: "pointer", fontFamily: font, fontWeight: 600 }}>
                  <History size={11} /> {customerHistory.length} prev orders
                </button>
              )
            }>
              <Row label="Full Name"  value={order.name} />
              <Row label="Country"    value={`${flag(order.country)} ${order.country}`} />
              <Row label="Email"      value={order.email} />
              {order.whatsapp  && <Row label="WhatsApp"  value={order.whatsapp} />}
              {order.instagram && <Row label="Instagram" value={order.instagram} />}

              <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: C.su, fontWeight: 600, minWidth: isMobile ? 100 : 130 }}>Payment Status</span>
                <select value={order.paymentStatus || "Pending"} 
                  onChange={async (e) => {
                    await updateOrder(order, { paymentStatus: e.target.value });
                    toast_(`Payment status updated to ${e.target.value}`);
                  }}
                  style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.bo}`, fontSize: 12, fontFamily: font, color: C.tx, background: C.in, cursor: "pointer", outline: "none" }}>
                  {["Pending","Partially Paid","Paid"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {customerHistory.length > 0 && (
                <div style={{ marginTop: 12, background: C.li, borderRadius: 8, padding: "10px 12px", border: `1px solid ${C.bo}` }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: C.su, letterSpacing: 0.8, marginBottom: 8 }}>ORDER HISTORY</div>
                  {customerHistory.slice(0, 3).map((o) => (
                    <div key={o.id} onClick={() => setSelId(o.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.bo}`, cursor: "pointer" }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.pu }}>{o.id}</div>
                        <div style={{ fontSize: 10, color: C.su }}>{fmtDate(o.date)}</div>
                      </div>
                      <Badge status={o.status} />
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {order.email && (
                  <a href={`mailto:${order.email}`} style={{ padding: "7px 14px", borderRadius: 8, background: "#EFF6FF", color: C.bl, fontSize: 12, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                    <Mail size={12} /> Email
                  </a>
                )}
                {order.whatsapp && (
                  <a href={`https://wa.me/${order.whatsapp.replace(/[^0-9]/g,"")}`} target="_blank" rel="noreferrer" style={{ padding: "7px 14px", borderRadius: 8, background: "#dcfce7", color: "#16A34A", fontSize: 12, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                    <MessageCircle size={12} /> WhatsApp
                  </a>
                )}
                {order.instagram && (
                  <a href={`https://instagram.com/${order.instagram.replace("@","")}`} target="_blank" rel="noreferrer" style={{ padding: "7px 14px", borderRadius: 8, background: "linear-gradient(135deg,#FCE4EC,#F3E8FF)", color: "#7C3AED", fontSize: 12, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                    <Link2 size={12} /> Instagram
                  </a>
                )}
              </div>
            </Sec>

            {/* Video Details — now includes Language + Scene Style */}
            <Sec title="VIDEO DETAILS" icon={Video}>
              <Row label="Orientation"    value={order.orientation} />
              <Row label="Length"         value={order.length} />
              <Row label="Language"       value={order.language} />
              <Row label="Scene Style"    value={order.sceneStyle} />
              <Row label="Delivery Speed" value={order.delivery} />
              {(order.archiveReason || order.draftReason) && <Row label="Archive Reason" value={order.archiveReason || order.draftReason} />}
              <Row label="Deadline"       value={fmtDate(order.deadline)} />
              {order.deadline && <div style={{ marginBottom: 8 }}><DLChip deadline={order.deadline} /></div>}
              <Row label="Mood"           value={order.mood} />
              <Row label="Background"     value={order.backgroundPref} />
            </Sec>

            {/* Tags */}
            <Sec title="TAGS" icon={Tag} action={
              <button onClick={() => setTagModalOpen(true)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.pu, background: "none", border: "none", cursor: "pointer", fontFamily: font, fontWeight: 600 }}>
                <Plus size={11} /> Edit
              </button>
            }>
              {orderTags.length === 0 ? (
                <div style={{ fontSize: 12, color: C.su, fontStyle: "italic" }}>No tags yet.</div>
              ) : (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {orderTags.map((t) => <TagChip key={t} tag={t} onRemove={() => toggleTag(order, t)} />)}
                </div>
              )}
            </Sec>

            {/* Task Checklist */}
            <Sec title="TASK CHECKLIST" icon={Clipboard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ height: 4, background: C.bo, borderRadius: 99, flex: 1, marginRight: 10 }}>
                  <div style={{ height: 4, borderRadius: 99, width: `${(taskDone / taskList.length) * 100}%`, background: taskDone === taskList.length ? C.gr : C.pu, transition: "width 0.3s" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.su }}>{taskDone}/{taskList.length}</span>
              </div>
              {taskList.map((task, idx) => (
                <div key={idx} onClick={() => toggleTask(order, idx)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: idx < taskList.length - 1 ? `1px solid ${C.bo}` : "none", cursor: "pointer" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${task.done ? C.gr : C.bo}`, background: task.done ? C.gr : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {task.done && <Check size={10} color="#fff" />}
                  </div>
                  <span style={{ fontSize: 13, color: task.done ? C.su : C.tx, textDecoration: task.done ? "line-through" : "none", fontWeight: 600 }}>{task.label}</span>
                </div>
              ))}
            </Sec>

            {/* Admin Notes */}
            <Sec title="ADMIN NOTES" icon={Pencil}>
              <div style={{ fontSize: 11, color: C.su, marginBottom: 10 }}>Private · saved to Firebase only</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input value={noteInput} onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNote(order)}
                  placeholder="Add a note… (Enter to save)"
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.bo}`, fontSize: 12, fontFamily: font, color: C.tx, background: C.in, outline: "none" }} />
                <Btn size="sm" color={C.pu} icon={Plus} onClick={() => addNote(order)}>Add</Btn>
              </div>
              {notesList.length === 0 ? (
                <div style={{ fontSize: 12, color: C.su, fontStyle: "italic" }}>No notes yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...notesList].reverse().map((n, i) => (
                    <div key={i} style={{ background: C.li, borderRadius: 8, padding: "10px 12px", border: `1px solid ${C.bo}` }}>
                      <div style={{ fontSize: 12, color: C.tx, lineHeight: 1.6 }}>{n.text}</div>
                      <div style={{ fontSize: 10, color: C.su, marginTop: 4 }}>{n.ts}</div>
                    </div>
                  ))}
                </div>
              )}
            </Sec>

            {/* Quick Emails */}
            <Sec title="QUICK EMAILS" icon={Send}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  ["Script Sent for Approval", C.pu],
                  ["Preview Ready",            C.or],
                  ["Final Payment Request",    C.re],
                  ["Project Completed",        C.gr],
                ].map(([l, c]) => (
                  <button key={l} onClick={() => toast_(`Email sent: ${l}`)}
                    style={{ padding: "7px 14px", borderRadius: 8, background: "#F9FAFB", color: c, border: `1.5px solid ${c}44`, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 5 }}>
                    <Send size={10} /> {l}
                  </button>
                ))}
              </div>
            </Sec>
          </div>

          <div>
            {/* Activity Timeline */}
            <Sec title="ADMIN ACTIVITY LOG" icon={Activity}>
              {timeline.length === 0 ? (
                <div style={{ fontSize: 12, color: C.su, fontStyle: "italic" }}>No activity recorded yet.</div>
              ) : (
                <div style={{ position: "relative", paddingLeft: 20 }}>
                  <div style={{ position: "absolute", left: 7, top: 0, bottom: 0, width: 2, background: C.bo }} />
                  {[...timeline].reverse().map((item, i) => (
                    <div key={i} style={{ position: "relative", marginBottom: 14, paddingLeft: 14 }}>
                      <div style={{ position: "absolute", left: -14, top: 3, width: 10, height: 10, borderRadius: "50%", background: i === 0 ? C.pu : C.bo, border: `2px solid ${C.ca}` }} />
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.tx }}>{item.event}</div>
                      <div style={{ fontSize: 10, color: C.su, marginTop: 2 }}>{item.ts}</div>
                    </div>
                  ))}
                  <div style={{ position: "relative", marginBottom: 6, paddingLeft: 14 }}>
                    <div style={{ position: "absolute", left: -14, top: 3, width: 10, height: 10, borderRadius: "50%", background: C.bo, border: `2px solid ${C.ca}` }} />
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.su }}>Order Created</div>
                    <div style={{ fontSize: 10, color: C.su, marginTop: 2 }}>{order.submittedAt || fmtDate(order.date)}</div>
                  </div>
                </div>
              )}
            </Sec>

            {/* Script Details — now includes yourName, partnerName, referenceLink, referenceText */}
            <Sec title="SCRIPT DETAILS" icon={FileText} action={
              order.scriptText && (
                <button onClick={copyScript} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.bl, background: "none", border: "none", cursor: "pointer", fontFamily: font, fontWeight: 600 }}>
                  <Copy size={11} /> Copy
                </button>
              )
            }>
              <Row label="Script by"     value={order.scriptChoice === "write" ? "Customer wrote it" : "Needs help writing"} />
              {order.yourName    && <Row label="Your Name"    value={order.yourName} />}
              {order.partnerName && <Row label="Partner Name" value={order.partnerName} />}

              {order.scriptChoice === "write" ? (
                <div style={{ background: C.li, borderRadius: 8, padding: "12px 14px", fontSize: 12, color: C.tx, lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "'Courier New',monospace", border: `1px solid ${C.bo}`, marginTop: 8 }}>
                  {order.scriptText || "No script provided."}
                </div>
              ) : (
                <>
                  <Row label="Occasion"   value={order.occasions?.join(", ")} />
                  <Row label="Short Idea" value={order.shortIdea} />
                  <Row label="Activities" value={order.activities?.join(", ")} />
                  <Row label="Story"      value={order.relationshipStory} />
                </>
              )}

              {order.referenceLink && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.su, marginBottom: 4 }}>REFERENCE LINK</div>
                  <a href={order.referenceLink} target="_blank" rel="noreferrer"
                    style={{ fontSize: 13, color: C.bl, fontWeight: 600, wordBreak: "break-all" }}>
                    {order.referenceLink}
                  </a>
                </div>
              )}
              {order.referenceText && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.su, marginBottom: 6 }}>REFERENCE TEXT</div>
                  <div style={{ background: C.li, borderRadius: 8, padding: "10px 12px", fontSize: 12, color: C.tx, lineHeight: 1.7, whiteSpace: "pre-wrap", border: `1px solid ${C.bo}` }}>
                    {order.referenceText}
                  </div>
                </div>
              )}
            </Sec>

            <Sec title="DELIVERY" icon={Truck}>
              {order.deliveryMethod && (
                <div style={{ marginBottom: 12, background: "#F0FDF4", borderRadius: 8, padding: "10px 12px", border: "1px solid #BBF7D0" }}>
                  <Row label="Method" value={order.deliveryMethod} />
                  {order.deliveryLink && <div style={{ marginBottom: 4 }}><span style={{ fontSize: 11, fontWeight: 700, color: C.su }}>LINK: </span><a href={order.deliveryLink} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.bl, fontWeight: 600, wordBreak: "break-all" }}>{order.deliveryLink}</a></div>}
                  {order.deliveredAt && <Row label="Delivered" value={order.deliveredAt} />}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <select value={deliveryMethod_} onChange={e => setDeliveryMethod_(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.bo}`, fontSize: 12, fontFamily: font, color: C.tx, background: C.in, cursor: "pointer", outline: "none" }}>
                  <option value="">Select delivery method…</option>
                  {["Google Drive","WeTransfer","WhatsApp"].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input value={deliveryLink_} onChange={e => setDeliveryLink_(e.target.value)} placeholder="Delivery link (optional)"
                  style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.bo}`, fontSize: 12, fontFamily: font, color: C.tx, background: C.in, outline: "none" }} />
                <Btn size="sm" color={C.gr} icon={Send} onClick={async () => {
                  if (!deliveryMethod_) { toast_("Select a delivery method"); return; }
                  await updateOrder(order, { deliveryMethod: deliveryMethod_, deliveryLink: deliveryLink_, deliveredAt: fmtTS() });
                  toast_("Delivery info saved!");
                }}>Save Delivery</Btn>
              </div>
            </Sec>

            {/* Customer Rating — new section */}
            {order.rating && (
              <Sec title="CUSTOMER REVIEW" icon={Star}>
                <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={18} fill={s <= order.rating ? "#F59E0B" : "none"} color={s <= order.rating ? "#F59E0B" : C.bo} />
                  ))}
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.tx, marginLeft: 6 }}>{order.rating}/5</span>
                </div>
                {order.review && (
                  <div style={{ background: "#FFFBEB", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: C.tx, lineHeight: 1.6, fontStyle: "italic", border: "1px solid #FDE68A" }}>
                    "{order.review}"
                  </div>
                )}
                {order.ratedAt && (
                  <div style={{ fontSize: 11, color: C.su, marginTop: 8 }}>Rated: {typeof order.ratedAt === "string" ? order.ratedAt : "via app"}</div>
                )}
              </Sec>
            )}
          </div>
        </div>

        {/* Tag Modal */}
        {tagModalOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600, padding: 20 }}>
            <div style={{ background: C.ca, borderRadius: 16, padding: 24, maxWidth: 380, width: "100%", boxShadow: shMd }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.tx }}>Edit Tags</div>
                <button onClick={() => setTagModalOpen(false)} style={{ background: C.li, border: "none", cursor: "pointer", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: C.su }}><X size={14} /></button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TAGS_OPTIONS.map((t) => {
                  const active = orderTags.includes(t);
                  return (
                    <button key={t} onClick={() => toggleTag(order, t)}
                      style={{ padding: "7px 14px", borderRadius: 20, background: active ? C.bl : C.li, color: active ? "#fff" : C.su, border: `1px solid ${active ? C.bl : C.bo}`, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Customer History Modal */}
        {custHistModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600, padding: 20 }}>
            <div style={{ background: C.ca, borderRadius: 16, padding: 24, maxWidth: 460, width: "100%", boxShadow: shMd, maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.tx }}>Customer History</div>
                  <div style={{ fontSize: 12, color: C.su, marginTop: 2 }}>{order.name} · {order.email}</div>
                </div>
                <button onClick={() => setCustHistModal(false)} style={{ background: C.li, border: "none", cursor: "pointer", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: C.su }}><X size={14} /></button>
              </div>
              {customerHistory.length === 0 ? (
                <div style={{ fontSize: 13, color: C.su, textAlign: "center", padding: "20px 0" }}>No previous orders found.</div>
              ) : customerHistory.map((o) => (
                <div key={o.id} onClick={() => { setSelId(o.id); setCustHistModal(false); }}
                  style={{ padding: "12px 14px", borderRadius: 10, background: C.li, border: `1px solid ${C.bo}`, cursor: "pointer", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.th}
                  onMouseLeave={(e) => e.currentTarget.style.background = C.li}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.pu }}>{o.id}</div>
                    <div style={{ fontSize: 11, color: C.su, marginTop: 2 }}>{fmtDate(o.date)} · {o.delivery}</div>
                  </div>
                  <Badge status={o.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── SETTINGS VIEW ─────────────────────────────────────────
  const SettingsView = () => {
    const [form, setForm] = useState({ ...settings, emailTemplates: JSON.parse(JSON.stringify(settings.emailTemplates)) });
    const [activeEmail, setActiveEmail] = useState("scriptApproved");
    const inpStyle = { width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.bo}`, fontSize: 13, fontFamily: font, color: C.tx, background: C.in, outline: "none", boxSizing: "border-box" };

    const save = () => {
      const toNum = (v, def) => { const n = Number(v); return (!isNaN(n) && n > 0) ? n : def; };
      const updated = {
        ...form,
        shortPrice:    toNum(form.shortPrice, 40),
        longPrice:     toNum(form.longPrice, 80),
        maxCapacity:   toNum(form.maxCapacity, 8),
        orderIdPrefix: form.orderIdPrefix || "BD",
      };
      setSettings(updated);
      localStorage.setItem("bubududu_settings", JSON.stringify(updated));
      toast_("Settings saved!");
    };

    // ── ANALYTICS sub-component ──────────────────────────────
    const AnalyticsMode = () => {
      const [customerTime, setCustomerTime] = useState({});
      useEffect(() => {
        const tick = () => {
          const times = {};
          orders.forEach(o => {
            const tz = TIMEZONE_MAP[o.country];
            if (tz) {
              try {
                times[o.id] = new Date().toLocaleString("en-GB", { timeZone: tz, day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true });
              } catch (_) {}
            }
          });
          setCustomerTime(times);
        };
        tick();
        const id = setInterval(tick, 30000);
        return () => clearInterval(id);
      }, []);

      // ── Analytics computations ─────────────────────────────
      const MS_PER_DAY = 86400000;
      // Normalize createdAt to a YYYY-MM-DD string regardless of its type
      // (ISO string, Firestore Timestamp, or Date object)
      const toDateStr = (createdAt) => {
        if (typeof createdAt === "string") return createdAt.split("T")[0];
        const d = createdAt && typeof createdAt.toDate === "function"
          ? createdAt.toDate()
          : new Date(createdAt);
        if (!d || isNaN(d.getTime())) return null;
        return d.toISOString().split("T")[0];
      };
      const avgCompletionDays = (() => {
        const withBoth = completedOrders.filter(o => o.date && o.createdAt && toDateStr(o.createdAt));
        if (!withBoth.length) return null;
        const avg = withBoth.reduce((s, o) => s + (new Date(o.date) - new Date(toDateStr(o.createdAt))) / MS_PER_DAY, 0) / withBoth.length;
        return Math.round(avg);
      })();

      const onTimeCount = completedOrders.filter(o => o.date && o.deadline && o.date <= o.deadline).length;
      const lateCount = completedOrders.filter(o => o.date && o.deadline && o.date > o.deadline).length;
      const completionRatePct = completedOrders.length ? Math.round((onTimeCount / completedOrders.length) * 100) : 0;

      const avgScriptApprovalDays = (() => {
        const withApproval = orders.filter(o => o.status !== "Script Review" && o.createdAt && o.date && toDateStr(o.createdAt));
        if (!withApproval.length) return null;
        const avg = withApproval.reduce((s, o) => s + (new Date(o.date) - new Date(toDateStr(o.createdAt))) / MS_PER_DAY, 0) / withApproval.length;
        return Math.max(0, Math.round(avg));
      })();

      // Orders per week (last 8 weeks)
      const weeklyOrders = (() => {
        const weeks = [];
        for (let w = 7; w >= 0; w--) {
          const from = new Date(); from.setDate(from.getDate() - (w + 1) * 7);
          const to   = new Date(); to.setDate(to.getDate() - w * 7);
          const cnt  = orders.filter(o => { if (!o.createdAt) return false; const d = new Date(o.createdAt); return d >= from && d < to; }).length;
          weeks.push({ label: `W-${w}`, cnt });
        }
        return weeks;
      })();
      const maxWeekly = Math.max(...weeklyOrders.map(w => w.cnt), 1);

      // Monthly growth
      const now = new Date();
      const thisMonth = orders.filter(o => { if (!o.createdAt) return false; const d = new Date(o.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length;
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonth = orders.filter(o => { if (!o.createdAt) return false; const d = new Date(o.createdAt); return d.getMonth() === prevMonthDate.getMonth() && d.getFullYear() === prevMonthDate.getFullYear(); }).length;
      const growthPct = prevMonth > 0 ? Math.round(((thisMonth - prevMonth) / prevMonth) * 100) : (thisMonth > 0 ? 100 : 0);

      // Revenue by country
      const revByCountry = (() => {
        const map = {};
        completedOrders.forEach(o => { map[o.country] = (map[o.country] || 0) + calcRevenue(o); });
        return Object.entries(map).sort(([,a],[,b]) => b - a).slice(0, 8);
      })();
      const maxCountryRev = Math.max(...revByCountry.map(([,v]) => v), 1);

      // Delivery split
      const standardCount  = orders.filter(o => o.delivery?.includes("Standard")).length;
      const expressCount   = orders.filter(o => o.delivery?.includes("Emergency") || o.delivery?.includes("Express")).length;
      const deliveryTotal  = standardCount + expressCount || 1;

      // Video length split
      const shortCount = orders.filter(o => o.length?.includes("40") || o.length?.toLowerCase().includes("short")).length;
      const longCount  = orders.length - shortCount;
      const vidTotal   = orders.length || 1;

      // Occasion distribution
      const occasionMap = {};
      orders.forEach(o => (o.tags || []).forEach(t => { occasionMap[t] = (occasionMap[t] || 0) + 1; }));
      const occasions = Object.entries(occasionMap).sort(([,a],[,b]) => b - a).slice(0, 8);
      const maxOcc = Math.max(...occasions.map(([,v]) => v), 1);

      // Busiest day
      const dayMap = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      orders.forEach(o => { if (o.createdAt) dayMap[new Date(o.createdAt).getDay()]++; });
      const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      const busiestDay = DAY_NAMES[Object.entries(dayMap).sort(([,a],[,b]) => b - a)[0]?.[0] ?? 0];
      const maxDay = Math.max(...Object.values(dayMap), 1);

      // Peak month
      const monthMap = {};
      orders.forEach(o => { if (o.createdAt) { const d = new Date(o.createdAt); const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2,"0")}`; monthMap[key] = (monthMap[key] || 0) + 1; } });
      const peakMonthKey = Object.entries(monthMap).sort(([,a],[,b]) => b - a)[0]?.[0];
      const peakMonthLabel = peakMonthKey ? `${MONTH_NAMES[parseInt(peakMonthKey.split("-")[1])]} ${peakMonthKey.split("-")[0]}` : "—";

      // Occasion seasonality (which month has most birthday/anniversary etc)
      const seasonMap = {};
      orders.forEach(o => {
        if (!o.createdAt) return;
        const m = new Date(o.createdAt).getMonth();
        (o.tags || []).forEach(t => {
          if (!seasonMap[t]) seasonMap[t] = Array(12).fill(0);
          seasonMap[t][m]++;
        });
      });
      const topOccasions = Object.keys(seasonMap).slice(0, 4);

      // Best month ever (by revenue)
      const bestMonthRevMap = {};
      completedOrders.forEach(o => {
        if (!o.createdAt) return;
        const d = new Date(o.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2,"0")}`;
        bestMonthRevMap[key] = (bestMonthRevMap[key] || 0) + calcRevenue(o);
      });
      const bestMonthEntry = Object.entries(bestMonthRevMap).sort(([,a],[,b]) => b - a)[0];
      const bestMonthLabel = bestMonthEntry ? `${MONTH_NAMES[parseInt(bestMonthEntry[0].split("-")[1])]} ${bestMonthEntry[0].split("-")[0]}` : "—";
      const bestMonthRevenue = bestMonthEntry ? bestMonthEntry[1] : 0;

      const StatCard = ({ emoji, title, value, sub, color = C.pu }) => (
        <div style={{ background: C.ca, borderRadius: 12, border: `1px solid ${C.bo}`, padding: "16px 18px", boxShadow: sh }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>{emoji}</div>
          <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color }}>{value}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.tx, marginTop: 2 }}>{title}</div>
          {sub && <div style={{ fontSize: 11, color: C.su, marginTop: 3 }}>{sub}</div>}
        </div>
      );

      const BarChart = ({ data, maxVal, colorFn, labelKey, valKey, height = 80, showLabel = true }) => (
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height }}>
          {data.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{ fontSize: 8, color: C.su, fontWeight: 700 }}>{d[valKey] > 0 ? d[valKey] : ""}</div>
              <div style={{ width: "100%", background: colorFn ? colorFn(i) : C.pu, borderRadius: "4px 4px 0 0", height: `${Math.max((d[valKey] / maxVal) * (height - 20), d[valKey] > 0 ? 4 : 0)}px`, transition: "height 0.4s" }} />
              {showLabel && <div style={{ fontSize: 8, color: C.su, fontWeight: 600, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{d[labelKey]}</div>}
            </div>
          ))}
        </div>
      );

      const PieSlice = ({ pct, color, label }) => {
        const deg = Math.round(pct * 3.6);
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: `conic-gradient(${color} ${deg}deg, ${C.bo} ${deg}deg)`, flexShrink: 0 }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: C.tx }}>{label}</div>
            <div style={{ fontSize: 11, color: C.su }}>{pct}%</div>
          </div>
        );
      };

      // Recent orders for timezone display
      const recentActive = activeOrders.slice(0, 5);

      return (
        <div>
          {/* ── Key Metrics ── */}
          <div style={{ fontSize: 12, fontWeight: 800, color: C.su, letterSpacing: 1, marginBottom: 12 }}>KEY METRICS</div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            <StatCard emoji="⏱️" title="Avg Completion Time" value={avgCompletionDays !== null ? `${avgCompletionDays}d` : "—"} sub="Days from order to delivery" color={C.bl} />
            <StatCard emoji="✅" title="On-Time Rate" value={`${completionRatePct}%`} sub={`${onTimeCount} on time · ${lateCount} late`} color={C.gr} />
            <StatCard emoji="📝" title="Script Approval Speed" value={avgScriptApprovalDays !== null ? `${avgScriptApprovalDays}d` : "—"} sub="Avg days to approve script" color={C.pu} />
            <StatCard emoji="📈" title="Monthly Growth" value={`${growthPct >= 0 ? "+" : ""}${growthPct}%`} sub={`${thisMonth} this month vs ${prevMonth} last`} color={growthPct >= 0 ? C.gr : C.re} />
          </div>

          {/* ── Orders Trend Chart ── */}
          <div style={{ background: C.ca, borderRadius: 14, border: `1px solid ${C.bo}`, padding: "18px 20px", marginBottom: 14, boxShadow: sh }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.su, letterSpacing: 1, marginBottom: 14 }}>📊 ORDERS TREND (LAST 8 WEEKS)</div>
            <BarChart data={weeklyOrders} maxVal={maxWeekly} labelKey="label" valKey="cnt"
              colorFn={(i) => `hsl(${220 + i * 8}, 70%, 55%)`} height={100} />
          </div>

          {/* ── Revenue by Country ── */}
          <div style={{ background: C.ca, borderRadius: 14, border: `1px solid ${C.bo}`, padding: "18px 20px", marginBottom: 14, boxShadow: sh }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.su, letterSpacing: 1, marginBottom: 14 }}>🌍 REVENUE BY COUNTRY</div>
            {revByCountry.length === 0 ? (
              <div style={{ textAlign: "center", color: C.su, fontSize: 13, padding: "16px 0" }}>No revenue data yet</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {revByCountry.map(([country, rev]) => (
                  <div key={country} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: isMobile ? 80 : 120, fontSize: 12, color: C.tx, fontWeight: 600, flexShrink: 0 }}>{flag(country)} {country}</div>
                    <div style={{ flex: 1, height: 8, background: C.bo, borderRadius: 99 }}>
                      <div style={{ height: 8, borderRadius: 99, width: `${Math.round((rev / maxCountryRev) * 100)}%`, background: `linear-gradient(to right, ${C.pu}, ${C.bl})`, transition: "width 0.4s" }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.gr, minWidth: 50, textAlign: "right" }}>${rev}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Delivery & Video split ── */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={{ background: C.ca, borderRadius: 14, border: `1px solid ${C.bo}`, padding: "18px 20px", boxShadow: sh }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.su, letterSpacing: 1, marginBottom: 14 }}>🚚 DELIVERY SPEED</div>
              <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                <PieSlice pct={Math.round((standardCount / deliveryTotal) * 100)} color={C.bl} label="Standard" />
                <PieSlice pct={Math.round((expressCount  / deliveryTotal) * 100)} color={C.or} label="Express" />
              </div>
            </div>
            <div style={{ background: C.ca, borderRadius: 14, border: `1px solid ${C.bo}`, padding: "18px 20px", boxShadow: sh }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.su, letterSpacing: 1, marginBottom: 14 }}>🎬 VIDEO LENGTH SPLIT</div>
              <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                <PieSlice pct={Math.round((shortCount / vidTotal) * 100)} color={C.pu} label="Short" />
                <PieSlice pct={Math.round((longCount  / vidTotal) * 100)} color={C.dg} label="Long" />
              </div>
            </div>
          </div>

          {/* ── Occasions & Busiest Day ── */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={{ background: C.ca, borderRadius: 14, border: `1px solid ${C.bo}`, padding: "18px 20px", boxShadow: sh }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.su, letterSpacing: 1, marginBottom: 14 }}>🎉 POPULAR OCCASIONS</div>
              {occasions.length === 0 ? (
                <div style={{ textAlign: "center", color: C.su, fontSize: 12, padding: "8px 0" }}>No tag data yet</div>
              ) : (
                <BarChart data={occasions.map(([label, cnt]) => ({ label, cnt }))} maxVal={maxOcc} labelKey="label" valKey="cnt"
                  colorFn={(i) => [C.pu, C.bl, C.gr, C.or, C.re, C.ye, "#EC4899", "#14B8A6"][i % 8]} height={90} />
              )}
            </div>
            <div style={{ background: C.ca, borderRadius: 14, border: `1px solid ${C.bo}`, padding: "18px 20px", boxShadow: sh }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.su, letterSpacing: 1, marginBottom: 14 }}>📅 BUSIEST DAY TRACKER</div>
              <BarChart data={DAY_NAMES.map((d, i) => ({ label: d, cnt: dayMap[i] }))} maxVal={maxDay} labelKey="label" valKey="cnt"
                colorFn={(i) => String(Object.entries(dayMap).sort(([,a],[,b]) => b-a)[0]?.[0]) === String(i) ? C.re : C.bl} height={90} />
              <div style={{ fontSize: 12, color: C.su, marginTop: 8 }}>Busiest: <strong style={{ color: C.tx }}>{busiestDay}</strong></div>
            </div>
          </div>

          {/* ── Peak Month & Best Month Ever ── */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={{ background: C.ca, borderRadius: 14, border: `1px solid ${C.bo}`, padding: "18px 20px", boxShadow: sh }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>📆</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.ye }}>{peakMonthLabel}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.tx, marginTop: 2 }}>Peak Month Indicator</div>
              <div style={{ fontSize: 11, color: C.su, marginTop: 3 }}>Highest order activity this year</div>
            </div>
            <div style={{ background: C.ca, borderRadius: 14, border: `1px solid ${C.bo}`, padding: "18px 20px", boxShadow: sh }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>🏆</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.gr }}>{bestMonthLabel}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.tx, marginTop: 2 }}>Best Month Ever</div>
              <div style={{ fontSize: 11, color: C.su, marginTop: 3 }}>Revenue: <strong style={{ color: C.gr }}>${bestMonthRevenue}</strong></div>
            </div>
          </div>

          {/* ── Occasion Seasonality ── */}
          {topOccasions.length > 0 && (
            <div style={{ background: C.ca, borderRadius: 14, border: `1px solid ${C.bo}`, padding: "18px 20px", marginBottom: 14, boxShadow: sh }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.su, letterSpacing: 1, marginBottom: 14 }}>🌸 OCCASION SEASONALITY</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {topOccasions.map((occ, oi) => (
                  <div key={occ}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.tx, marginBottom: 4 }}>{occ}</div>
                    <div style={{ display: "flex", gap: 3 }}>
                      {Array.from({length: 12}, (_, m) => {
                        const val = seasonMap[occ][m] || 0;
                        const maxV = Math.max(...seasonMap[occ], 1);
                        const pct  = val / maxV;
                        return (
                          <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                            <div style={{ width: "100%", height: 28, background: pct > 0 ? `rgba(109,40,217,${0.15 + pct * 0.85})` : C.li, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {val > 0 && <span style={{ fontSize: 8, fontWeight: 700, color: pct > 0.5 ? "#fff" : C.pu }}>{val}</span>}
                            </div>
                            <div style={{ fontSize: 7, color: C.su }}>{MONTH_NAMES[m].slice(0,3)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Country Map View (text-based) ── */}
          <div style={{ background: C.ca, borderRadius: 14, border: `1px solid ${C.bo}`, padding: "18px 20px", marginBottom: 14, boxShadow: sh }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.su, letterSpacing: 1, marginBottom: 14 }}>🗺️ CUSTOMER LOCATIONS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Array.from(new Set(orders.map(o => o.country).filter(Boolean))).sort().map(country => {
                const cnt = orders.filter(o => o.country === country).length;
                return (
                  <div key={country} style={{ background: C.li, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: C.tx, border: `1px solid ${C.bo}`, display: "flex", alignItems: "center", gap: 5 }}>
                    {flag(country)} {country} <span style={{ background: C.pu, color: "#fff", borderRadius: 10, padding: "0 6px", fontSize: 10, fontWeight: 700 }}>{cnt}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Customer Timezone Display ── */}
          <div style={{ background: C.ca, borderRadius: 14, border: `1px solid ${C.bo}`, padding: "18px 20px", marginBottom: 14, boxShadow: sh }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.su, letterSpacing: 1, marginBottom: 14 }}>🕐 CUSTOMER TIMEZONE (ACTIVE ORDERS)</div>
            {recentActive.length === 0 ? (
              <div style={{ textAlign: "center", color: C.su, fontSize: 13, padding: "8px 0" }}>No active orders</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {recentActive.map(o => (
                  <div key={o.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "10px 14px", background: C.li, borderRadius: 10, border: `1px solid ${C.bo}` }}>
                    <div style={{ fontSize: 22 }}>{flag(o.country)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.tx }}>{o.name} <span style={{ fontSize: 11, color: C.pu, fontWeight: 600 }}>{o.id}</span></div>
                      <div style={{ fontSize: 12, color: C.su, marginTop: 1 }}>{o.country}</div>
                      {customerTime[o.id] ? (
                        <>
                          <div style={{ fontSize: 13, fontWeight: 800, color: C.tx, marginTop: 4 }}>{flag(o.country)} {customerTime[o.id]}</div>
                          <div style={{ fontSize: 10, color: C.su }}>Current time in customer's location</div>
                        </>
                      ) : (
                        <div style={{ fontSize: 11, color: C.su, marginTop: 4 }}>Timezone not mapped</div>
                      )}
                      {o.createdAt && <div style={{ fontSize: 10, color: C.su, marginTop: 2 }}>Created on {new Date(o.createdAt).toLocaleString("en-GB", { day:"2-digit", month:"2-digit", year:"2-digit", hour:"2-digit", minute:"2-digit" })}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Notifications & Alerts System ── */}
          <div style={{ background: C.ca, borderRadius: 14, border: `1px solid ${C.bo}`, padding: "18px 20px", marginBottom: 14, boxShadow: sh }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.su, letterSpacing: 1, marginBottom: 14 }}>🔔 NOTIFICATIONS & ALERTS STATUS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Daily Briefing */}
              <div style={{ padding: "12px 14px", background: "#EFF6FF", borderRadius: 10, border: `1px solid ${C.bl}22` }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.bl, marginBottom: 4 }}>📋 Daily Briefing</div>
                <div style={{ fontSize: 12, color: C.tx }}>
                  Today you have: <strong>{activeOrders.filter(o => hoursLeft(o.deadline) < 0).length}</strong> overdue ·{" "}
                  <strong>{activeOrders.filter(o => { const h = hoursLeft(o.deadline); return h >= 0 && h <= 48; }).length}</strong> urgent ·{" "}
                  <strong>{activeOrders.filter(o => o.status === "Script Review").length}</strong> scripts pending
                </div>
              </div>
              {/* Stalled orders */}
              {(() => {
                const stalled = activeOrders.filter(o => {
                  const last = (o.timeline || []).slice(-1)[0];
                  return last && (Date.now() - new Date(last.ts).getTime()) / MS_PER_DAY >= 3;
                });
                return stalled.length > 0 ? (
                  <div style={{ padding: "12px 14px", background: "#FFFBEB", borderRadius: 10, border: `1px solid ${C.ye}44` }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: C.ye, marginBottom: 4 }}>⚠️ Stalled Orders ({stalled.length})</div>
                    {stalled.slice(0, 3).map(o => (
                      <div key={o.id} style={{ fontSize: 11, color: C.tx, marginTop: 2 }}>
                        <strong style={{ color: C.pu }}>{o.id}</strong> — {o.name} · no activity for 3+ days
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: "12px 14px", background: "#F0FDF4", borderRadius: 10, border: `1px solid ${C.gr}22` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.gr }}>✅ No stalled orders — great workflow!</div>
                  </div>
                );
              })()}
              {/* Milestone progress */}
              <div style={{ padding: "12px 14px", background: "#F5F3FF", borderRadius: 10, border: `1px solid ${C.pu}22` }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.pu, marginBottom: 4 }}>🏅 Milestone Progress</div>
                {(() => {
                  const MILESTONES = [10, 25, 50, 100, 250, 500];
                  const next = MILESTONES.find(m => m > completedOrders.length) || null;
                  return (
                    <div style={{ fontSize: 12, color: C.tx }}>
                      <strong>{completedOrders.length}</strong> orders completed.{" "}
                      {next ? <>Next milestone: <strong style={{ color: C.pu }}>{next}</strong> ({next - completedOrders.length} to go!)</> : "All major milestones reached! 🎉"}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div style={{ padding: isMobile ? "16px" : "28px 32px", flex: 1, overflowY: "auto", paddingBottom: isMobile ? 80 : undefined }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, color: C.tx }}>Settings & Analytics</div>
          <div style={{ fontSize: 13, color: C.su, marginTop: 2 }}>Configure your panel · View business insights</div>
        </div>

        {/* Toggle */}
        <div style={{ display: "inline-flex", background: C.li, borderRadius: 12, padding: 4, border: `1px solid ${C.bo}`, marginBottom: 24 }}>
          {[["settings","⚙️ Settings"],["analytics","📊 Analytics"]].map(([tab, label]) => (
            <button key={tab} onClick={() => setSettingsTab(tab)}
              style={{
                padding: "9px 28px", borderRadius: 9, background: settingsTab === tab ? C.ca : "transparent",
                color: settingsTab === tab ? C.pu : C.su, border: settingsTab === tab ? `1px solid ${C.bo}` : "1px solid transparent",
                fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: font,
                boxShadow: settingsTab === tab ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.2s ease",
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* ═══ SETTINGS MODE ═══ */}
        {settingsTab === "settings" && (
          <div style={{ maxWidth: 600 }}>
            {/* Admin Profile */}
            <Sec title="ADMIN PROFILE" icon={User}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 4 }}>
                  {form.adminPhoto && /^(https?:\/\/|data:image\/)/.test(form.adminPhoto) ? (
                    <img src={form.adminPhoto} alt="profile" style={{ width: 56, height: 56, borderRadius: 14, objectFit: "cover", border: `2px solid ${C.bo}` }} />
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, border: `2px solid ${C.bo}` }}>🐼</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.su, marginBottom: 4 }}>PROFILE PHOTO URL</div>
                    <input value={form.adminPhoto || ""} onChange={e => setForm(f => ({ ...f, adminPhoto: e.target.value }))} placeholder="https://..." style={inpStyle} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.su, marginBottom: 6 }}>ADMIN NAME</div>
                  <input value={form.adminName || ""} onChange={e => setForm(f => ({ ...f, adminName: e.target.value }))} style={inpStyle} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.su, marginBottom: 6 }}>BUSINESS NAME</div>
                  <input value={form.businessName || ""} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} style={inpStyle} />
                </div>
              </div>
            </Sec>

            {/* Pricing */}
            <Sec title="PRICING EDITOR" icon={TrendingUp}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.su, marginBottom: 6 }}>SHORT VIDEO PRICE ($)</div>
                  <input type="number" value={form.shortPrice} onChange={e => setForm(f => ({ ...f, shortPrice: e.target.value }))} style={inpStyle} />
                  <div style={{ fontSize: 11, color: C.su, marginTop: 4 }}>Auto-updates revenue calculations on Dashboard & Completed Orders.</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.su, marginBottom: 6 }}>LONG VIDEO PRICE ($)</div>
                  <input type="number" value={form.longPrice} onChange={e => setForm(f => ({ ...f, longPrice: e.target.value }))} style={inpStyle} />
                </div>
              </div>
            </Sec>

            {/* Email Templates */}
            <Sec title="EMAIL TEMPLATE EDITOR" icon={Mail}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {[
                  ["scriptApproved","Script Approved"],
                  ["previewReady","Preview Ready"],
                  ["finalDelivery","Final Delivery"],
                  ["paymentRequest","Payment Request"],
                ].map(([key, label]) => (
                  <button key={key} onClick={() => setActiveEmail(key)}
                    style={{ padding: "6px 14px", borderRadius: 8, background: activeEmail === key ? C.pu : C.li, color: activeEmail === key ? "#fff" : C.su, border: `1px solid ${activeEmail === key ? C.pu : C.bo}`, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                    {label}
                  </button>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.su, marginBottom: 6 }}>SUBJECT</div>
                <input value={form.emailTemplates[activeEmail]?.subject || ""} onChange={e => setForm(f => ({ ...f, emailTemplates: { ...f.emailTemplates, [activeEmail]: { ...f.emailTemplates[activeEmail], subject: e.target.value } } }))} style={inpStyle} />
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.su, marginBottom: 6 }}>MESSAGE BODY</div>
                <div style={{ fontSize: 10, color: C.su, marginBottom: 6 }}>Variables: {"{name}"} {"{orderId}"} {"{amount}"}</div>
                <textarea value={form.emailTemplates[activeEmail]?.body || ""} onChange={e => setForm(f => ({ ...f, emailTemplates: { ...f.emailTemplates, [activeEmail]: { ...f.emailTemplates[activeEmail], body: e.target.value } } }))}
                  rows={6} style={{ ...inpStyle, resize: "vertical", lineHeight: 1.5 }} />
              </div>
            </Sec>

            {/* Sound Toggle */}
            <Sec title="NOTIFICATION SOUND" icon={Bell}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.tx }}>New Order Alert Sound</div>
                  <div style={{ fontSize: 11, color: C.su, marginTop: 2 }}>Play a sound when new orders arrive</div>
                </div>
                <button onClick={() => setForm(f => ({ ...f, soundEnabled: !f.soundEnabled }))}
                  style={{ width: 52, height: 28, borderRadius: 99, background: form.soundEnabled ? C.gr : C.su, border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: form.soundEnabled ? 26 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                </button>
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: form.soundEnabled ? C.gr : C.su, fontWeight: 700 }}>
                {form.soundEnabled ? "🔔 Sound ON" : "🔕 Sound OFF"}
              </div>
            </Sec>

            {/* Working Hours */}
            <Sec title="WORKING HOURS" icon={Clock}>
              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.su, marginBottom: 6 }}>START TIME</div>
                  <input type="time" value={form.workingHoursStart || "09:00"} onChange={e => setForm(f => ({ ...f, workingHoursStart: e.target.value }))} style={inpStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.su, marginBottom: 6 }}>END TIME</div>
                  <input type="time" value={form.workingHoursEnd || "20:00"} onChange={e => setForm(f => ({ ...f, workingHoursEnd: e.target.value }))} style={inpStyle} />
                </div>
              </div>
              <div style={{ fontSize: 11, color: C.su, marginTop: 8 }}>Deadline warnings respect these hours. Urgent alerts adjust to your end time.</div>
            </Sec>

            {/* Capacity & Prefix */}
            <Sec title="WORKLOAD & ORDER ID" icon={Activity}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.su, marginBottom: 6 }}>MAX ACTIVE ORDERS</div>
                  <input type="number" value={form.maxCapacity} onChange={e => setForm(f => ({ ...f, maxCapacity: e.target.value }))} style={inpStyle} />
                  <div style={{ fontSize: 11, color: C.su, marginTop: 4 }}>Shows capacity warning on dashboard when near/at this limit.</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.su, marginBottom: 6 }}>ORDER ID PREFIX</div>
                  <input value={form.orderIdPrefix} onChange={e => setForm(f => ({ ...f, orderIdPrefix: e.target.value }))} style={inpStyle} />
                </div>
              </div>
            </Sec>

            <Btn color={C.pu} onClick={save} icon={Check}>Save Settings</Btn>
          </div>
        )}

        {/* ═══ ANALYTICS MODE ═══ */}
        {settingsTab === "analytics" && <AnalyticsMode />}
      </div>
    );
  };

  // ── MAIN RENDER ───────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: font, color: C.tx }}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes statusPulse { 0%,100% { opacity:1; } 50% { opacity:0.7; } }
        @keyframes glowRed { 0%,100% { box-shadow: 0 0 4px #DC262688; } 50% { box-shadow: 0 0 12px #DC2626; } }
        @keyframes confettiFall { to { transform: translateY(100vh) rotate(360deg); opacity: 0; } }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      {!isMobile && <Sidebar />}

      {page === "detail"    ? <DetailView />    :
       page === "cal"       ? <CalView />       :
       page === "completed" ? <CompletedView /> :
       page === "orders"    ? <AllOrdersView /> :
       page === "settings"  ? <SettingsView />  :
       <DashView />}

      {isMobile && <BottomNav />}
      {isMobile && filterOpen && <FilterDrawer />}

      {/* Archive Reason Modal */}
      {archiveReasonModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 700, padding: 20 }}>
          <div style={{ background: C.ca, borderRadius: 16, padding: 28, maxWidth: 400, width: "100%", boxShadow: shMd }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.tx, marginBottom: 6 }}>Archive Order</div>
            <p style={{ fontSize: 12, color: C.su, marginBottom: 16 }}>Why is this order being archived?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              {ARCHIVE_REASONS.map((r) => (
                <button key={r} onClick={() => setArchiveReasonSel(r)}
                  style={{ padding: "10px 14px", borderRadius: 10, background: archiveReasonSel === r ? C.pu + "20" : C.li, border: `1.5px solid ${archiveReasonSel === r ? C.pu : C.bo}`, color: archiveReasonSel === r ? C.pu : C.tx, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, textAlign: "left" }}>
                  {archiveReasonSel === r ? "✓ " : ""}{r}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setArchiveReasonModal(false); setPendingArchiveOrd(null); }}
                style={{ flex: 1, padding: 11, borderRadius: 8, background: C.li, border: `1px solid ${C.bo}`, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, color: C.su }}>Cancel</button>
              <button onClick={confirmMoveToArchive}
                style={{ flex: 1, padding: 11, borderRadius: 8, background: C.su, border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: font, color: "#fff" }}>Archive Order</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Notifications panel */}
      {isMobile && notifOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 400, display: "flex", alignItems: "flex-end" }} onClick={() => setNotifOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.ca, borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.tx }}>Notifications</div>
              <button onClick={() => setNotifOpen(false)} style={{ background: C.li, border: "none", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.su }}><X size={14} /></button>
            </div>
            {smartNotifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: C.su, fontSize: 13 }}>All clear! No alerts.</div>
            ) : smartNotifications.map((n, i) => (
              <div key={i} onClick={() => { setSelId(n.order.id); setPage("detail"); setNotifOpen(false); }}
                style={{ padding: "12px 14px", borderRadius: 10, background: C.li, border: `1.5px solid ${n.color}33`, borderLeft: `4px solid ${n.color}`, cursor: "pointer", marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.tx }}>{n.msg}</div>
                <div style={{ fontSize: 11, color: C.su, marginTop: 2 }}>{flag(n.order.country)} {n.order.country} · {n.order.id}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Order Alert */}
      {newAlert && (
        <div style={{ position: "fixed", top: 20, right: 20, background: C.ca, border: `1.5px solid ${C.gr}`, borderRadius: 14, padding: "16px 18px", maxWidth: 280, boxShadow: "0 8px 32px rgba(22,163,74,0.2)", zIndex: 9000 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, color: C.gr, fontSize: 12, marginBottom: 4 }}>
                <Bell size={12} /> New Order Received!
              </div>
              <div style={{ fontSize: 14, color: C.tx, fontWeight: 800 }}>{newAlert.name}</div>
              <div style={{ fontSize: 11, color: C.su }}>{flag(newAlert.country)} {newAlert.country}</div>
              <div style={{ fontSize: 11, color: C.su, marginTop: 2 }}>
                ID: <strong style={{ color: C.pu }}>{newAlert.id}</strong>
              </div>
            </div>
            <button onClick={() => setNewAlert(null)} style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: C.su, padding: 0 }}>×</button>
          </div>
          <button onClick={() => { setSelId(newAlert.id); setPage("detail"); setNewAlert(null); }}
            style={{ width: "100%", marginTop: 10, padding: "8px", borderRadius: 8, background: C.gr, color: "#fff", border: "none", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
            View Order →
          </button>
        </div>
      )}

      {showConfetti && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
          {Array.from({length: 30}).map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              left: `${(i * 37 + 13) % 100}%`,
              top: "-10px",
              width: 8, height: 8,
              borderRadius: (i % 2 === 0) ? "50%" : 0,
              background: ["#6D28D9","#16A34A","#EA580C","#2563EB","#D97706"][i % 5],
              animation: `confettiFall ${1.5 + (i % 10) * 0.15}s ease-in forwards`,
              animationDelay: `${(i % 5) * 0.1}s`,
            }} />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: isMobile ? 80 : 24, right: 24, background: C.sb, color: "#F1F5F9", padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.3)", zIndex: 9001, maxWidth: 300, display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle2 size={14} color={C.gr} /> {toast}
        </div>
      )}

      {/* Milestone Notification */}
      {milestoneMsg && (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg, ${C.pu}, ${C.bl})`, color: "#fff", padding: "16px 28px", borderRadius: 16, fontSize: 15, fontWeight: 800, boxShadow: "0 8px 32px rgba(109,40,217,0.4)", zIndex: 9002, textAlign: "center", maxWidth: 360 }}>
          {milestoneMsg}
        </div>
      )}

      {/* Daily Briefing Popup */}
      {!dailyBriefingDismissed && authed && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9003, padding: 20 }}>
          <div style={{ background: C.ca, borderRadius: 20, padding: 28, maxWidth: 380, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", border: `1px solid ${C.bo}` }}>
            <div style={{ fontSize: 28, marginBottom: 12, textAlign: "center" }}>☀️</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.tx, textAlign: "center", marginBottom: 6 }}>Good morning, {settings.adminName || "Admin"}!</div>
            <div style={{ fontSize: 13, color: C.su, textAlign: "center", marginBottom: 20 }}>Here's your daily briefing</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {[
                { emoji: "⏰", label: "Deadlines today", value: activeOrders.filter(o => { const h = hoursLeft(o.deadline); return h >= 0 && h <= 24; }).length, color: C.or },
                { emoji: "📝", label: "Scripts pending approval", value: activeOrders.filter(o => o.status === "Script Review").length, color: C.bl },
                { emoji: "🔴", label: "Overdue orders", value: activeOrders.filter(o => hoursLeft(o.deadline) < 0).length, color: C.re },
                { emoji: "⚙️", label: "In production", value: activeOrders.filter(o => PRODUCTION_STATUSES.includes(o.status)).length, color: C.pu },
              ].map(({ emoji, label, value, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.li, borderRadius: 10 }}>
                  <span style={{ fontSize: 13, color: C.tx }}>{emoji} {label}</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color }}>{value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => { setDailyBriefingDismissed(true); try { localStorage.setItem("bubududu_briefing_date", new Date().toISOString().split("T")[0]); } catch (_) {} }}
              style={{ width: "100%", padding: "12px", borderRadius: 10, background: C.pu, color: "#fff", border: "none", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
              Let's Go! 🚀
            </button>
          </div>
        </div>
      )}

      {/* Request Changes Modal */}
      {changeModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 700, padding: 20 }}>
          <div style={{ background: C.ca, borderRadius: 16, padding: 28, maxWidth: 440, width: "100%", boxShadow: shMd }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.tx }}>Request Script Changes</div>
              <button onClick={() => setChangeModal(false)} style={{ background: C.li, border: "none", cursor: "pointer", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: C.su }}><X size={14} /></button>
            </div>
            <p style={{ fontSize: 12, color: C.su, marginBottom: 14 }}>Describe what needs to change in the script.</p>
            <textarea value={changeTxt} onChange={(e) => setChangeTxt(e.target.value)} rows={5}
              placeholder="e.g. Please add a scene where Dudu gives flowers…"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${C.bo}`, fontSize: 13, fontFamily: font, resize: "vertical", boxSizing: "border-box", outline: "none", color: C.tx, background: C.in }} />
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={() => setChangeModal(false)} style={{ flex: 1, padding: 11, borderRadius: 8, background: C.li, border: `1px solid ${C.bo}`, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, color: C.su }}>Cancel</button>
              <button onClick={() => { toast_("Changes noted!"); setChangeModal(false); setChangeTxt(""); }}
                style={{ flex: 1, padding: 11, borderRadius: 8, background: C.pu, border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: font, color: "#fff" }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

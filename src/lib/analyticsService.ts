import { VisitorLog, AuditLog, OperatorProfile } from "../types";

const VISITOR_LOGS_KEY = "orbit_gizi_visitor_logs";
const AUDIT_LOGS_KEY = "orbit_gizi_audit_logs";
const OPERATOR_PROFILE_KEY = "orbit_gizi_active_operator";

const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;

function isWithinThreeMonths(timestampStr: string): boolean {
  try {
    const time = new Date(timestampStr).getTime();
    if (isNaN(time)) return true; // keep if invalid parse
    return Date.now() - time <= THREE_MONTHS_MS;
  } catch {
    return true;
  }
}

export function getVisitorLogs(): VisitorLog[] {
  try {
    const stored = localStorage.getItem(VISITOR_LOGS_KEY);
    if (!stored) return [];
    const parsed: VisitorLog[] = JSON.parse(stored);
    const cleaned = parsed.filter(log => isWithinThreeMonths(log.timestamp));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(VISITOR_LOGS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export async function fetchVisitorLogsApi(): Promise<VisitorLog[]> {
  try {
    const res = await fetch("/api/analytics/visitor-logs");
    const json = await res.json();
    if (json.success && Array.isArray(json.list)) {
      const cleaned = json.list.filter((log: VisitorLog) => isWithinThreeMonths(log.timestamp));
      localStorage.setItem(VISITOR_LOGS_KEY, JSON.stringify(cleaned));
      return cleaned;
    }
  } catch (err) {
    console.warn("Gagal mengambil log pengunjung dari server, menggunakan cache lokal:", err);
  }
  return getVisitorLogs();
}

export function recordVisitorAccess(email: string, role: "ADMIN" | "PENGUNJUNG", viewName: string): VisitorLog {
  const currentLogs = getVisitorLogs();
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "Web Browser";
  
  const newLog: VisitorLog = {
    id: "v_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    email: email || "pengunjung@public.go.id",
    role,
    viewName,
    deviceInfo: userAgent.includes("Mobile") ? "Perangkat Seluler" : "Komputer / Desktop"
  };

  const updated = [newLog, ...currentLogs].filter(log => isWithinThreeMonths(log.timestamp));
  localStorage.setItem(VISITOR_LOGS_KEY, JSON.stringify(updated));

  // Sync log to server asynchronously
  fetch("/api/analytics/visitor-logs/record", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newLog)
  }).catch(err => console.warn("Gagal mengirim log pengunjung ke server:", err));

  return newLog;
}

export function getAuditLogs(): AuditLog[] {
  try {
    const stored = localStorage.getItem(AUDIT_LOGS_KEY);
    if (!stored) return [];
    const parsed: AuditLog[] = JSON.parse(stored);
    const cleaned = parsed.filter(log => isWithinThreeMonths(log.timestamp));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export async function fetchAuditLogsApi(): Promise<AuditLog[]> {
  try {
    const res = await fetch("/api/analytics/audit-logs");
    const json = await res.json();
    if (json.success && Array.isArray(json.list)) {
      const cleaned = json.list.filter((log: AuditLog) => isWithinThreeMonths(log.timestamp));
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(cleaned));
      return cleaned;
    }
  } catch (err) {
    console.warn("Gagal mengambil log audit dari server, menggunakan cache lokal:", err);
  }
  return getAuditLogs();
}

export function recordAuditAction(
  operator: OperatorProfile,
  actionType: AuditLog["actionType"],
  description: string,
  targetName?: string
): AuditLog {
  const currentLogs = getAuditLogs();
  
  const newLog: AuditLog = {
    id: "a_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    operatorName: operator.name || "Petugas Anonim",
    operatorRole: operator.role || "Petugas Nakes",
    operatorInstansi: operator.instansi || "Dinas Kesehatan / Puskesmas",
    operatorEmail: operator.email || "admin@nagekeo.go.id",
    actionType,
    description,
    targetName
  };

  const updated = [newLog, ...currentLogs].filter(log => isWithinThreeMonths(log.timestamp));
  localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updated));

  // Sync audit log to server asynchronously
  fetch("/api/analytics/audit-logs/record", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newLog)
  }).catch(err => console.warn("Gagal mengirim log audit ke server:", err));

  return newLog;
}

export function getOperatorProfile(): OperatorProfile | null {
  try {
    const stored = sessionStorage.getItem(OPERATOR_PROFILE_KEY) || localStorage.getItem(OPERATOR_PROFILE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveOperatorProfile(profile: OperatorProfile): void {
  try {
    sessionStorage.setItem(OPERATOR_PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(OPERATOR_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Gagal menyimpan profil operator", e);
  }
}

export function clearVisitorLogs(): void {
  try {
    localStorage.removeItem(VISITOR_LOGS_KEY);
    fetch("/api/analytics/visitor-logs/clear", { method: "POST" }).catch(() => {});
  } catch (e) {
    console.error("Gagal menghapus log pengunjung:", e);
  }
}

export function clearAuditLogs(): void {
  try {
    localStorage.removeItem(AUDIT_LOGS_KEY);
    fetch("/api/analytics/audit-logs/clear", { method: "POST" }).catch(() => {});
  } catch (e) {
    console.error("Gagal menghapus log audit:", e);
  }
}

export function clearAllLogs(): void {
  try {
    localStorage.removeItem(VISITOR_LOGS_KEY);
    localStorage.removeItem(AUDIT_LOGS_KEY);
    fetch("/api/analytics/visitor-logs/clear", { method: "POST" }).catch(() => {});
    fetch("/api/analytics/audit-logs/clear", { method: "POST" }).catch(() => {});
  } catch (e) {
    console.error("Gagal menghapus semua log:", e);
  }
}

export function clearOldAnalytics(): { removedVisitors: number; removedAudits: number } {
  const visitors = getVisitorLogs();
  const audits = getAuditLogs();
  return {
    removedVisitors: visitors.length,
    removedAudits: audits.length
  };
}

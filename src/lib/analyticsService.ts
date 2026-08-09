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

export function getOperatorProfile(): OperatorProfile | null {
  try {
    const stored = sessionStorage.getItem(OPERATOR_PROFILE_KEY) || localStorage.getItem(OPERATOR_PROFILE_KEY);
    if (!stored) return null;
    const profile: OperatorProfile = JSON.parse(stored);
    
    // Check expiry
    if (profile.sessionExpiryTime) {
      const expiryMs = new Date(profile.sessionExpiryTime).getTime();
      const startMs = profile.sessionStartTime ? new Date(profile.sessionStartTime).getTime() : 0;
      const now = Date.now();

      // Hard limit 2 hours (120 minutes) or expired
      if (now >= expiryMs || (startMs > 0 && now - startMs >= 2 * 60 * 60 * 1000)) {
        sessionStorage.removeItem(OPERATOR_PROFILE_KEY);
        localStorage.removeItem(OPERATOR_PROFILE_KEY);
        return null;
      }
    } else {
      // If no session expiry time saved, default expire after 1 hour from start
      const startMs = profile.sessionStartTime ? new Date(profile.sessionStartTime).getTime() : Date.now();
      if (Date.now() - startMs >= 60 * 60 * 1000) {
        sessionStorage.removeItem(OPERATOR_PROFILE_KEY);
        localStorage.removeItem(OPERATOR_PROFILE_KEY);
        return null;
      }
    }
    return profile;
  } catch {
    return null;
  }
}

export function saveOperatorProfile(profile: Partial<OperatorProfile>, durationMinutes: number = 60): OperatorProfile {
  const clampedDuration = Math.min(Math.max(durationMinutes || 60, 15), 120); // max 2 hours (120 min)
  const now = new Date();
  const expiry = new Date(now.getTime() + clampedDuration * 60 * 1000);

  const fullProfile: OperatorProfile = {
    name: profile.name || "Petugas Nakes",
    role: profile.role || "Petugas Ahli Gizi / Nakes",
    instansi: profile.instansi || "Puskesmas / Dinkes",
    email: profile.email || "admin@nagekeo.go.id",
    phone: profile.phone || "",
    sessionId: profile.sessionId || ("sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6)),
    sessionStartTime: profile.sessionStartTime || now.toISOString(),
    sessionDurationMinutes: clampedDuration,
    sessionExpiryTime: expiry.toISOString(),
    inputCount: profile.inputCount || 0
  };

  try {
    sessionStorage.setItem(OPERATOR_PROFILE_KEY, JSON.stringify(fullProfile));
    localStorage.setItem(OPERATOR_PROFILE_KEY, JSON.stringify(fullProfile));
  } catch (e) {
    console.error("Gagal menyimpan profil operator", e);
  }

  return fullProfile;
}

export function incrementOperatorInputCount(): number {
  const profile = getOperatorProfile();
  if (!profile) return 1;

  const currentCount = (profile.inputCount || 0) + 1;
  profile.inputCount = currentCount;
  
  try {
    sessionStorage.setItem(OPERATOR_PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(OPERATOR_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Gagal update input count operator", e);
  }

  return currentCount;
}

export function recordAuditAction(
  operator: OperatorProfile,
  actionType: AuditLog["actionType"],
  description: string,
  targetName?: string
): AuditLog {
  const currentLogs = getAuditLogs();
  const currentInputSeq = incrementOperatorInputCount();
  
  const newLog: AuditLog = {
    id: "a_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    sessionId: operator.sessionId || ("sess_" + Date.now().toString(36)),
    sessionDurationMinutes: operator.sessionDurationMinutes || 60,
    sessionInputCount: currentInputSeq,
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
  return newLog;
}

export function clearAllLogs(): { removedVisitors: number; removedAudits: number } {
  const visitors = getVisitorLogs();
  const audits = getAuditLogs();
  
  localStorage.removeItem(VISITOR_LOGS_KEY);
  localStorage.removeItem(AUDIT_LOGS_KEY);

  return {
    removedVisitors: visitors.length,
    removedAudits: audits.length
  };
}

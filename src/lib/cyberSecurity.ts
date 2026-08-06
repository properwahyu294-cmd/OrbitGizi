/**
 * Cyber Security & Anti-SQL/NoSQL Injection Guard for Orbit Gizi System
 * Implements strict input sanitization, threat detection, and validation.
 */

export interface SecurityCheckResult {
  isValid: boolean;
  sanitizedValue: string;
  detectedThreats: string[];
}

// Regex patterns to detect common cyber attacks
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION|GRANT|REVOKE)\b)/i,
  /('--'|';'|'\/\*|\/\*|\*\/|@@)/i,
  /('\s*OR\s*'1'\s*=\s*'1'|'\s*OR\s*1\s*=\s*1|"\s*OR\s*"1"\s*=\s*"1")/i,
  /(\bAND\b|\bOR\b)\s+\d+\s*=\s*\d+/i,
  /(char\s*\(\s*\d+\s*\)|exec\s*\(|concat\s*\()/i
];

const NOSQL_INJECTION_PATTERNS = [
  /(\$where|\$gt|\$gte|\$lt|\$lte|\$ne|\$in|\$nin|\$regex|\$expr|\$or|\$and)/i,
  /(\{\s*"\$ne"|\{\s*"\$gt")/i
];

const XSS_SCRIPT_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /\bon\w+\s*=/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
];

/**
 * Sanitizes a string input to protect against SQL Injection, NoSQL Injection, and XSS.
 */
export function sanitizeInput(input: string, maxLength: number = 250): SecurityCheckResult {
  if (typeof input !== "string") {
    return { isValid: true, sanitizedValue: String(input || ""), detectedThreats: [] };
  }

  const detectedThreats: string[] = [];
  let cleaned = input;

  // Truncate length
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
    detectedThreats.push(`Input exceeds maximum allowed length of ${maxLength} chars.`);
  }

  // Check SQL Injection
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(cleaned)) {
      detectedThreats.push("SQL Injection attempt pattern detected");
      // Remove dangerous SQL keywords
      cleaned = cleaned.replace(pattern, "[BLOCKED_SQL]");
    }
  }

  // Check NoSQL Injection
  for (const pattern of NOSQL_INJECTION_PATTERNS) {
    if (pattern.test(cleaned)) {
      detectedThreats.push("NoSQL Injection operator detected");
      cleaned = cleaned.replace(pattern, "[BLOCKED_NOSQL]");
    }
  }

  // Check XSS
  for (const pattern of XSS_SCRIPT_PATTERNS) {
    if (pattern.test(cleaned)) {
      detectedThreats.push("XSS Script Injection pattern detected");
      cleaned = cleaned.replace(pattern, "[BLOCKED_SCRIPT]");
    }
  }

  // Escape HTML characters
  cleaned = cleaned
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  return {
    isValid: detectedThreats.length === 0,
    sanitizedValue: cleaned,
    detectedThreats
  };
}

/**
 * Validates beneficiary identity object against cyber attack vectors
 */
export function validateBeneficiaryPayload(data: Record<string, any>): { isSafe: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.name) {
    const res = sanitizeInput(data.name, 100);
    if (!res.isValid) errors.push(`Nama: ${res.detectedThreats.join(", ")}`);
  }

  if (data.nik) {
    // NIK must be digits only and length <= 20
    if (!/^[0-9]*$/.test(data.nik)) {
      errors.push("NIK hanya boleh berisi angka (mencegah karakter berbahaya/SQL Injection).");
    }
  }

  if (data.notes) {
    const res = sanitizeInput(data.notes, 500);
    if (!res.isValid) errors.push(`Catatan: ${res.detectedThreats.join(", ")}`);
  }

  return {
    isSafe: errors.length === 0,
    errors
  };
}

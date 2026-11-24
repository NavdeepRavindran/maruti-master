export function capitalizeWords(str?: string): string {
  if (!str) return "";
  return str
    .split(/\s+/)
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ")
    .trim();
}

export function sanitizeAlphabetsOnly(val: string): string {
  return val.replace(/[^a-zA-Z\s]/g, "");
}

export function formatSurname(str?: string): string {
  if (!str) return "";
  return sanitizeAlphabetsOnly(str).toUpperCase().trim();
}

/**
 * Splits and formats a client's display name so that:
 * - firstName is properly capitalized
 * - surname is uppercase
 * Handles legacy data or single-string full names gracefully.
 */
export function formatClientDisplayName(name?: string, surname?: string) {
  let first = (name || "").trim();
  let sur = (surname || "").trim();

  // If surname is provided and first name accidentally ends with the surname,
  // strip the duplicated surname from first name (e.g. "Sundaram A Ai SUNDARAM" with surname "SUNDARAM")
  if (sur && first.toUpperCase().endsWith(" " + sur.toUpperCase())) {
    first = first.substring(0, first.length - sur.length).trim();
  } else if (!sur && first.includes(" ")) {
    // If surname is empty but first name contains spaces, extract the last word as surname
    const parts = first.split(/\s+/);
    first = parts.slice(0, -1).join(" ") || parts[0];
    sur = parts.slice(-1).join(" ");
  }

  const cleanFirst = capitalizeWords(first);
  const cleanSur = sur ? sur.toUpperCase().trim() : "";
  const fullName = cleanSur ? `${cleanSur} ${cleanFirst}`.trim() : cleanFirst;

  return {
    firstName: cleanFirst,
    surname: cleanSur,
    fullName,
  };
}

export function formatFamilyName(str?: string): string {
  if (!str) return "";
  return sanitizeAlphabetsOnly(str)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Formats address so that in all words, ONLY the first letter is capitalized, and the rest is lowercase.
 * Preserves numbers, punctuation (commas, slashes, hashes, hyphens), and whitespace.
 * e.g. "12/4, GANDHI STREET, CHENNAI - 600001" -> "12/4, Gandhi Street, Chennai - 600001"
 */
export function formatAddress(str?: string): string {
  if (!str) return "";
  return str.replace(/\b([a-zA-Z])([a-zA-Z]*)\b/g, (_match, first, rest) => {
    return first.toUpperCase() + rest.toLowerCase();
  });
}

export const FAMILY_RELATIONSHIPS = [
  "Wife",
  "Husband",
  "Son",
  "Daughter",
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Other",
] as const;

export function getRecycleBinRetention(deletedAt?: string | null, maxRetentionDays = 90) {
  if (!deletedAt) {
    return { daysAgo: 0, daysRemaining: maxRetentionDays, isExpired: false, label: `${maxRetentionDays} days left` };
  }
  const diffMs = Date.now() - new Date(deletedAt).getTime();
  const daysAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, maxRetentionDays - daysAgo);
  const isExpired = daysRemaining === 0;
  return {
    daysAgo,
    daysRemaining,
    isExpired,
    label: isExpired ? "Expired (pending purge)" : `${daysRemaining} days left`,
  };
}

/**
 * Validates that a date is in YYYY-MM-DD format, has a full 4-digit year >= 1900,
 * and is not in the future.
 */
export function validateDateRange(
  dateStr?: string | null,
  fieldName = "Date"
): { isValid: boolean; error?: string } {
  if (!dateStr || !dateStr.trim()) return { isValid: true };
  const str = dateStr.trim();
  const parts = str.split("T")[0].split("-");
  if (parts.length !== 3) {
    return { isValid: false, error: `${fieldName} must be a valid date.` };
  }
  const [yearStr, monthStr, dayStr] = parts;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const currentYear = new Date().getFullYear();

  // Enforce full 4-digit year
  if (yearStr.length !== 4 || isNaN(year)) {
    return {
      isValid: false,
      error: `${fieldName} year must be a full 4-digit year (e.g. 1985). Partial or single-digit years are not allowed.`,
    };
  }

  // Enforce range from 1900 till present
  if (year < 1900) {
    return {
      isValid: false,
      error: `${fieldName} year cannot be earlier than 1900 (entered: ${yearStr}). Year must be from 1900 till present.`,
    };
  }

  if (year > currentYear) {
    return {
      isValid: false,
      error: `${fieldName} cannot be in the future (year ${yearStr}). Year must be from 1900 till ${currentYear}.`,
    };
  }

  if (isNaN(month) || month < 1 || month > 12 || isNaN(day) || day < 1 || day > 31) {
    return { isValid: false, error: `${fieldName} contains an invalid month or day.` };
  }

  const todayStr = new Date().toISOString().split("T")[0];
  if (str > todayStr) {
    return {
      isValid: false,
      error: `${fieldName} cannot be in the future. Please select today or a past date.`,
    };
  }

  return { isValid: true };
}

/**
 * Checks whether a date string has a valid year >= 1900 and not in the future.
 */
export function isValidDateYear(d?: string | null): boolean {
  if (!d) return false;
  const parts = d.split("T")[0].split("-");
  if (parts.length !== 3) return false;
  const year = parseInt(parts[0], 10);
  return !isNaN(year) && year >= 1900 && year <= new Date().getFullYear();
}

/**
 * Formats date strictly ensuring all 4 digits of the year are always displayed.
 * Enforces rule: dates before 1900 (e.g. 0001-01-01 dummy dates) return "-".
 * e.g. "01 Jan 1988", "15 Oct 2005".
 */
export function formatDate(d?: string | null): string {
  if (!d) return "-";
  try {
    const parts = d.split("T")[0].split("-");
    if (parts.length === 3) {
      const [yStr, mStr, dStr] = parts;
      const yNum = parseInt(yStr, 10);
      const mNum = parseInt(mStr, 10) - 1;
      const dNum = parseInt(dStr, 10);
      if (!isNaN(yNum) && !isNaN(mNum) && !isNaN(dNum) && mNum >= 0 && mNum <= 11) {
        // Enforce valid year >= 1900: dummy dates like 0001-01-01 return "-"
        if (yNum < 1900 || yNum > new Date().getFullYear()) {
          return "-";
        }
        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];
        const padYear = String(yNum).padStart(4, "0");
        const padDay = String(dNum).padStart(2, "0");
        return `${padDay} ${monthNames[mNum]} ${padYear}`;
      }
    }
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "-";
    if (dt.getFullYear() < 1900 || dt.getFullYear() > new Date().getFullYear()) return "-";
    const y = String(dt.getFullYear()).padStart(4, "0");
    const m = dt.toLocaleString("en-IN", { month: "short" });
    const day = String(dt.getDate()).padStart(2, "0");
    return `${day} ${m} ${y}`;
  } catch {
    return "-";
  }
}

/**
 * Calculates age in full years from DOB.
 * Safely guards against invalid or sub-1900 years (returns 0 instead of 2000+ years).
 */
export function getAge(dob?: string | null): number {
  if (!dob) return 0;
  try {
    const parts = dob.split("T")[0].split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
        return 0;
      }
    }
    const b = new Date(dob);
    if (isNaN(b.getTime()) || b.getFullYear() < 1900) return 0;
    const n = new Date();
    let a = n.getFullYear() - b.getFullYear();
    if (
      n.getMonth() < b.getMonth() ||
      (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())
    ) {
      a--;
    }
    return Math.max(0, a);
  } catch {
    return 0;
  }
}

/**
 * Returns the current date parts { year, month: 0-indexed, day } in Indian Standard Time (Asia/Kolkata).
 * If a YYYY-MM-DD string is supplied by client, uses that instead.
 */
export function getTodayDateParts(clientDateStr?: string | null): { year: number; month: number; day: number } {
  if (clientDateStr && /^\d{4}-\d{2}-\d{2}$/.test(clientDateStr)) {
    const [y, m, d] = clientDateStr.split("-").map(Number);
    return { year: y, month: m - 1, day: d };
  }
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const parts = formatter.formatToParts(new Date());
    let year = new Date().getFullYear();
    let month = new Date().getMonth();
    let day = new Date().getDate();
    for (const p of parts) {
      if (p.type === "year") year = parseInt(p.value, 10);
      if (p.type === "month") month = parseInt(p.value, 10) - 1;
      if (p.type === "day") day = parseInt(p.value, 10);
    }
    return { year, month, day };
  } catch {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  }
}

/**
 * Accurately calculates days until the next occurrence of an annual event (birthday, anniversary).
 * If event is TODAY (past midnight of the date in IST): returns 0.
 * If event was YESTERDAY or in the past this year: calculates days until next year's occurrence (e.g. 364 days),
 * ensuring past-midnight events are never incorrectly marked as Today or This Week.
 */
export function getDaysUntilAnnualEvent(
  dateStr?: string | null,
  ref?: { year: number; month: number; day: number }
): number {
  if (!dateStr) return -1;
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length < 3) return -1;
  const targetMonth = parseInt(parts[1], 10) - 1;
  const targetDay = parseInt(parts[2], 10);
  if (isNaN(targetMonth) || isNaN(targetDay)) return -1;

  const today = ref || getTodayDateParts();

  // If month and day match today's date exactly, it is TODAY (0 days remaining)
  if (targetMonth === today.month && targetDay === today.day) {
    return 0;
  }

  // Calculate day difference for this year's occurrence using UTC noon to prevent DST/midnight shifts
  const currentYearMs = Date.UTC(today.year, targetMonth, targetDay, 12, 0, 0);
  const todayMs = Date.UTC(today.year, today.month, today.day, 12, 0, 0);

  let diffDays = Math.round((currentYearMs - todayMs) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    // Event has already passed this year (e.g. yesterday Nov 24 when today is Nov 25)
    // Next occurrence is next year
    const nextYearMs = Date.UTC(today.year + 1, targetMonth, targetDay, 12, 0, 0);
    diffDays = Math.round((nextYearMs - todayMs) / (1000 * 60 * 60 * 24));
  }

  return diffDays;
}




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

  return {
    firstName: capitalizeWords(first),
    surname: sur ? sur.toUpperCase() : "",
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



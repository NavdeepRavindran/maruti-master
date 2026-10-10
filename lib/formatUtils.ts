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

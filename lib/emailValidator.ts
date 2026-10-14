/**
 * Strict Gmail Validator
 * Restricts email inputs strictly to valid @gmail.com addresses.
 * Rejects invalid domains (e.g. @snsct.or, @yahoo.com), typo domains (@gmial.com, @gamil.com),
 * invalid extensions (@gmail.co, @gmail.con), and enforces Gmail username rules.
 */

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

export function validateEmail(emailInput?: string | null): EmailValidationResult {
  if (!emailInput || !emailInput.trim()) {
    return { isValid: false, error: "Email address is required." };
  }

  const email = emailInput.trim().toLowerCase();

  // 1. Whitespace checks
  if (/\s/.test(email)) {
    return { isValid: false, error: "Email address cannot contain spaces." };
  }

  // 2. Exactly one @ symbol
  const atParts = email.split("@");
  if (atParts.length !== 2) {
    return {
      isValid: false,
      error: atParts.length === 1
        ? "Email is missing '@' symbol. Please enter a valid Gmail address (e.g. username@gmail.com)."
        : "Email cannot contain multiple '@' symbols.",
      suggestion: atParts.length === 1 && email.length >= 3 ? `${email}@gmail.com` : undefined,
    };
  }

  const [localPart, domainPart] = atParts;

  // 3. Local part (username) validation
  if (!localPart) {
    return { isValid: false, error: "Gmail username (before @) cannot be empty." };
  }

  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return { isValid: false, error: "Gmail username cannot start or end with a period." };
  }

  if (localPart.includes("..")) {
    return { isValid: false, error: "Gmail username cannot contain consecutive dots (..)." };
  }

  // Gmail usernames only allow letters, numbers, and periods
  if (!/^[a-z0-9.]+$/.test(localPart)) {
    return {
      isValid: false,
      error: "Gmail usernames can only contain letters (a-z), numbers (0-9), and periods (.).",
    };
  }

  // Clean length excluding dots
  const cleanLength = localPart.replace(/\./g, "").length;
  if (cleanLength < 6) {
    return {
      isValid: false,
      error: "Gmail username must be at least 6 characters long.",
      suggestion: `${localPart}@gmail.com`,
    };
  }

  if (cleanLength > 30) {
    return {
      isValid: false,
      error: "Gmail username cannot exceed 30 characters.",
    };
  }

  // 4. Strict Domain validation: MUST strictly be "gmail.com"
  if (domainPart !== "gmail.com") {
    // Specific friendly messages for common variations
    if (
      domainPart === "gmail.co" ||
      domainPart === "gmail.con" ||
      domainPart === "gmail.in" ||
      domainPart === "gmail.co.in" ||
      domainPart === "gmail.cm" ||
      domainPart === "gmail.net" ||
      domainPart === "gmail.org" ||
      domainPart.startsWith("gmail.")
    ) {
      return {
        isValid: false,
        error: `Invalid domain '@${domainPart}'. Gmail addresses must end strictly with '@gmail.com'.`,
        suggestion: `${localPart}@gmail.com`,
      };
    }

    if (
      domainPart === "gmial.com" ||
      domainPart === "gamil.com" ||
      domainPart === "gmaill.com" ||
      domainPart === "gmai.com" ||
      domainPart === "gmal.com" ||
      domainPart === "gmil.com" ||
      domainPart === "gmeil.com"
    ) {
      return {
        isValid: false,
        error: `Spelling typo in '@${domainPart}'. Did you mean '@gmail.com'?`,
        suggestion: `${localPart}@gmail.com`,
      };
    }

    return {
      isValid: false,
      error: `Invalid email domain '@${domainPart}'. Only '@gmail.com' addresses are allowed.`,
      suggestion: `${localPart}@gmail.com`,
    };
  }

  return { isValid: true };
}

export function isValidEmail(email?: string | null): boolean {
  return validateEmail(email).isValid;
}

export function getEmailError(email?: string | null): string | null {
  const res = validateEmail(email);
  return res.isValid ? null : (res.error || "Invalid Gmail address");
}

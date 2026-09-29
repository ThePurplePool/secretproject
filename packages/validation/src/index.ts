// packages/validation/src/index.ts
// Common input validation and normalization for Anti-Scam Uzbekistan microservices

export function normalizeUzbekPhoneNumber(raw: string): string | null {
  if (!raw) return null;
  // Clean all characters except digits and leading +
  const cleaned = raw.replace(/[^\d+]/g, '');
  // Format standard Uzbekistan phone numbers (+998XXXXXXXXX)
  if (cleaned.startsWith('+998') && cleaned.length === 13) {
    return cleaned;
  }
  if (cleaned.startsWith('998') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  if (cleaned.length === 9) {
    return `+998${cleaned}`;
  }
  return cleaned;
}

export function sanitizeString(input: string, maxLength = 1000): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // strip rudimentary html tags
}

export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (!username || typeof username !== 'string') {
    return { isValid: false, error: 'Имя пользователя обязательно' };
  }
  const trimmed = username.trim();
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Имя пользователя должно быть не менее 3 символов' };
  }
  if (trimmed.length > 50) {
    return { isValid: false, error: 'Имя пользователя не должно превышать 50 символов' };
  }
  if (!/^[a-zA-Z0-9_\u0400-\u04FF\s-]+$/.test(trimmed)) {
    return { isValid: false, error: 'Имя содержит недопустимые спецсимволы' };
  }
  return { isValid: true };
}

export function validateUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

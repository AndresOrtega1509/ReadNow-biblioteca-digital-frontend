export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;

export const PASSWORD_POLICY_TEXT =
  'Debe tener al menos 6 caracteres, una mayúscula, una letra, un número y un carácter especial.';

export function isValidPassword(password: string): boolean {
  return PASSWORD_PATTERN.test(password);
}

export type PasswordChecklist = {
  minLength: boolean;
  hasUppercase: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
};

export function getPasswordChecklist(password: string): PasswordChecklist {
  return {
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasLetter: /[A-Za-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z\d]/.test(password),
  };
}

/**
 * Mensaje en español solo con los requisitos que aún no cumple la contraseña.
 * Devuelve null si está vacía o ya es válida.
 */
export function getMissingPasswordRequirementsMessage(password: string): string | null {
  if (!password || isValidPassword(password)) return null;

  const c = getPasswordChecklist(password);
  const missing: string[] = [];
  if (!c.minLength) missing.push('al menos 6 caracteres');
  if (!c.hasUppercase) missing.push('una mayúscula');
  if (!c.hasLetter) missing.push('una letra');
  if (!c.hasNumber) missing.push('un número');
  if (!c.hasSpecial) missing.push('un carácter especial');

  if (missing.length === 0) return null;
  if (missing.length === 1) return `Falta ${missing[0]}.`;
  if (missing.length === 2) return `Faltan ${missing[0]} y ${missing[1]}.`;
  return `Faltan ${missing.slice(0, -1).join(', ')} y ${missing[missing.length - 1]}.`;
}

/**
 * @deprecated Use Zod schemas in `src/validation/authSchemas.ts` with React Hook Form.
 * Kept for backwards compatibility if imported elsewhere.
 */
import {
  loginSchema,
  registerSchema,
} from "../validation/authSchemas";

export function isValidEmail(email: string): boolean {
  return registerSchema.shape.email.safeParse(email).success;
}

export function validateLoginFields(
  username: string,
  password: string
): string | null {
  const result = loginSchema.safeParse({ username, password });

  if (result.success) {
    return null;
  }

  return result.error.issues[0]?.message ?? "Invalid login details";
}

export function validateRegisterFields(
  username: string,
  email: string,
  password: string,
  confirmPassword: string
): string | null {
  const result = registerSchema.safeParse({
    username,
    email,
    password,
    confirmPassword,
  });

  if (result.success) {
    return null;
  }

  return result.error.issues[0]?.message ?? "Invalid registration details";
}

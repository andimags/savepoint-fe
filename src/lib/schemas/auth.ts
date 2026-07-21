import { z } from "zod";

/** Shared username rule so registration and profile editing validate identically. */
const username = z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(20, "Username must be at most 20 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only.");

const password = z.string().min(8, "Password must be at least 8 characters.");

export const loginSchema = z.object({
    email: z.string().email("Enter a valid email."),
    password: z.string().min(1, "Password is required."),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    email: z.string().email("Enter a valid email."),
    username,
    password,
});
export type RegisterValues = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
    displayName: z.string().max(50, "Display name is too long.").optional(),
    username,
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const linkedAccountsSchema = z.object({
    steamUsername: z.string().max(40, "Too long.").optional(),
    psnUsername: z.string().max(40, "Too long.").optional(),
});
export type LinkedAccountsValues = z.infer<typeof linkedAccountsSchema>;

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: password,
});
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

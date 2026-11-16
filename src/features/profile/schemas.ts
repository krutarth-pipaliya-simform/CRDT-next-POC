import { z } from "zod";

export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be at most 50 characters")
        .optional(),
});

export const updatePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

/**
 * Where the profile page was opened from. Only a same-origin path is kept:
 * one leading slash, never `//` or `/\` (both read as another host), no
 * whitespace, and never the profile page itself. Anything else is dropped, so
 * the link back can never become an open redirect.
 */
export const profileSearchParamsSchema = z.object({
    from: z
        .string()
        .max(512)
        .regex(/^\/(?![/\\])\S*$/)
        .refine((path) => !/^\/profile(?:[/?#]|$)/.test(path))
        .optional()
        .catch(undefined),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

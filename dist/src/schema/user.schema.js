import z from 'zod';
export const userSchema = z.object({
    username: z
        .string()
        .min(3)
        .max(10)
        .regex(/[a-zA-Z]/, "Invalid username"),
    password: z
        .string()
        .min(8)
        .max(20)
        .regex(/[A-Z]/, "Need uppercase")
        .regex(/[a-z]/, "Need lowercase")
        .regex(/\d/, "Need number")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Need special character")
});
//# sourceMappingURL=user.schema.js.map
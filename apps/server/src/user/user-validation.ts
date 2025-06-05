import { z } from "zod";

export const profileSchema = z.object({
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    //avatar: z.string().url().optional(),
});
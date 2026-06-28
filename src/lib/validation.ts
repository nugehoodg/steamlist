import { z } from "zod";

export const CreateListSchema = z.object({
  creator_name: z
    .string()
    .trim()
    .min(2, "Creator name must be at least 2 characters")
    .max(30, "Creator name must be at most 30 characters"),
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(80, "Title must be at most 80 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .or(z.literal("")),
  app_ids: z
    .array(z.string().regex(/^\d+$/, "Invalid Steam App ID"))
    .min(1, "Add at least one game")
    .max(50, "Maximum 50 games per list"),
});

export type CreateListInput = z.infer<typeof CreateListSchema>;

export const SteamAppIdSchema = z
  .string()
  .regex(/^\d+$/, "Invalid Steam App ID")
  .min(1)
  .max(10);

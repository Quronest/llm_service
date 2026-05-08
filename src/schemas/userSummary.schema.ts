import { z } from "zod";

export const userSummarySchema = z.object({
  group: z.enum(["GROUP_A", "GROUP_B", "GROUP_C"]),
  phase: z.enum(["PHASE_1", "PHASE_2", "PHASE_3"]),
  summary: z.string(),
});

export type UserSummaryResponse = z.infer<typeof userSummarySchema>;

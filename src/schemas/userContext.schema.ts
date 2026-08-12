import { z } from "zod";

import {
  userGroupEnumList,
  phaseEnumList,
  engagementLevelEnumList,
  burnoutRiskEnumList,
} from "../enums";

export const userContextValidationSchema = z.object({
  current_group: z.enum(userGroupEnumList),
  current_phase: z.enum(phaseEnumList),
  current_stage: z.string().nullable(),
  current_day: z.number().int().nonnegative().optional().nullable(),
  engagement_level: z.enum(engagementLevelEnumList),
  burnout_risk: z.enum(burnoutRiskEnumList),
  is_on_track: z.boolean(),
  needs_intervention: z.boolean(),
  summary: z.string(),
});

export type UserContextType = z.infer<typeof userContextValidationSchema>;

import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

import {
  userGroupEnumList,
  phaseEnumList,
  engagementLevelEnumList,
  burnoutRiskEnumList,
  burnoutRisk,
  userGroup,
  phase,
  engagementLevel,
} from "../enums";

extendZodWithOpenApi(z);

export const userContextValidationSchema = z
  .object({
    current_group: z.enum(userGroupEnumList).openapi({ example: userGroup.GROUP_A }),

    current_phase: z.enum(phaseEnumList).openapi({ example: phase.PHASE_1 }),

    current_stage: z.string().openapi({
      example: "Independent Project Builder",
    }),

    current_day: z.number().int().nonnegative().openapi({
      example: 14,
    }),

    engagement_level: z
      .enum(engagementLevelEnumList)
      .openapi({ example: engagementLevel.HIGH }),

    burnout_risk: z.enum(burnoutRiskEnumList).openapi({ example: burnoutRisk.LOW }),

    is_on_track: z.boolean().openapi({ example: true }),

    needs_intervention: z.boolean().openapi({ example: false }),

    summary: z.string().openapi({}),
  })
  .openapi("UserContext");

export type userContextType = z.infer<typeof userContextValidationSchema>;

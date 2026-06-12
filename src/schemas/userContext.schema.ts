import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const userContextValidationSchema = z
  .object({
    current_group: z
      .enum(['GROUP_A', 'GROUP_B', 'GROUP_C'])
      .openapi({ example: 'GROUP_C' }),

    current_phase: z
      .enum(['PHASE_1', 'PHASE_2', 'PHASE_3'])
      .openapi({ example: 'PHASE_3' }),

    current_stage: z.string().openapi({
      example: 'Independent Project Builder',
    }),

    current_day: z.number().int().nonnegative().openapi({
      example: 14,
    }),

    engagement_level: z
      .enum(['Low', 'Medium', 'High'])
      .openapi({ example: 'High' }),

    burnout_risk: z
      .enum(['Low', 'Medium', 'High'])
      .openapi({ example: 'Low' }),

    is_on_track: z
      .enum(['True', 'False'])
      .openapi({ example: 'True' }),

    needs_intervention: z
      .enum(['True', 'False'])
      .openapi({ example: 'False' }),

    summary: z.string().openapi({
      example:
        'User is consistently active and building good projects, but needs to shift focus from guided tutorials to integrating external APIs and writing cleaner, production-level code to progress to Group C.',
    }),
  })
  .openapi('UserContext');

export type userContextType = z.infer<typeof userContextValidationSchema>;

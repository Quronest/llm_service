import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const personalDataValidationSchema = z
  .object({
    skills: z.array(z.string()).openapi({
      example: [
        'JavaScript',
        'React',
        'Node.js',
        'HTML/CSS',
        'Basic Python',
      ],
    }),

    primary_goal: z.string().openapi({
      example: 'Become a Full-Stack Developer within 6 months',
    }),

    experience: z.string().openapi({
      example:
        'Built 3 independent projects, completed 2 online courses',
    }),
  })
  .openapi('PersonalData');

export type academicDataType = z.infer<typeof personalDataValidationSchema>

import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const personalDataValidationSchema = z
  .object({
    skills: z.array(z.string()).openapi({
      example: ["JavaScript", "React", "Node.js", "HTML/CSS", "Basic Python"],
    }),

    primary_goal: z.string().openapi({
      example: "Become a Full-Stack Developer within 6 months",
    }),

    experience: z.string().openapi({
      example: "Built 3 independent projects, completed 2 online courses",
    }),

    interested_domains: z.array(z.string()).openapi({
      example: ["Web Development", "Cloud Computing", "DevOps"],
    }),

    description: z.string().openapi({
      example:
        "Currently pursuing engineering degree with focus on web development and cloud technologies.",
    }),
  })
  .openapi("PersonalData");

export type PersonalDataType = z.infer<typeof personalDataValidationSchema>;

export const academicDataValidationSchema = z
  .object({
    institute_name: z.string().openapi({
      example: "University of Technology, Mumbai",
    }),

    grade: z.string().openapi({
      example: "B.Tech",
    }),

    course: z.string().openapi({
      example: "Computer Science",
    }),

    description: z.string().openapi({
      example:
        "Currently pursuing engineering degree with focus on web development and cloud technologies.",
    }),
  })
  .openapi("AcademicData");

export type AcademicDataType = z.infer<typeof academicDataValidationSchema>;

export const userSummaryGenerationValidationSchema = z.object({
  academic_data: academicDataValidationSchema,
  personal_data: personalDataValidationSchema,
});

export type UserSummaryGenerateDataType = z.infer<
  typeof userSummaryGenerationValidationSchema
>;

export const swaggerUserSummaryGenerationSchema =
  userSummaryGenerationValidationSchema;

import { z } from "zod";

export const personalDataValidationSchema = z.object({
  skills: z.array(z.string()),
  primary_goal: z.string(),
  experience: z.string(),
  interested_domains: z.array(z.string()),
  description: z.string(),
});

export type PersonalDataType = z.infer<typeof personalDataValidationSchema>;

export const academicDataValidationSchema = z.object({
  institute_name: z.string(),
  grade: z.string(),
  course: z.string(),
  description: z.string(),
});

export type AcademicDataType = z.infer<typeof academicDataValidationSchema>;

export const userSummaryGenerationValidationSchema = z.object({
  academic_data: academicDataValidationSchema,
  personal_data: personalDataValidationSchema,
});

export type UserSummaryGenerateDataType = z.infer<
  typeof userSummaryGenerationValidationSchema
>;

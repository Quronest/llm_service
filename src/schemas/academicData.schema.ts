import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

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

    interested_domains: z.array(z.string()).openapi({
      example: ["Web Development", "Cloud Computing", "DevOps"],
    }),
  })
  .openapi("AcademicData");

export type academicDataType = z.infer<typeof academicDataValidationSchema>;

export const swaggerAcademicDataSchema = academicDataValidationSchema;

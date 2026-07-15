// swagger-config.ts
import swaggerJsdoc from "swagger-jsdoc";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

import { userContextValidationSchema } from "../schemas/userContext.schema";
import { swaggerUserSummaryGenerationSchema } from "../schemas/userSummaryData.schema";
import { apiResponseSchema } from "../schemas/apiResponse.schema";
import { taskGenerateValidationSchema } from "../schemas/taskGenerateValidation.schema";
import { dailyPlanGenerateInputValidationSchema } from "../schemas/dailyPlanGenerateInputValidation.schema";
import { assistantchatContextValidationSchema } from "../schemas/assistant.schema";
import { generateCodingProblemsResponseSchema } from "../chains/codingTask.chain";

const registry = new OpenAPIRegistry();

registry.register("UserContext", userContextValidationSchema);
registry.register("TaskCreateContxt", dailyPlanGenerateInputValidationSchema);
registry.register("UserSummaryData", swaggerUserSummaryGenerationSchema);
registry.register("ApiResponse", apiResponseSchema);
registry.register("TaskGenerateContext", taskGenerateValidationSchema);
registry.register("AssistantChat", assistantchatContextValidationSchema);
registry.register("CodingProblemsResponse", generateCodingProblemsResponseSchema);

const generator = new OpenApiGeneratorV3(registry.definitions);
const components = generator.generateComponents();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Quronest LLM service",
      description: "API endpoints for a Quronest LLM service",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:4000/",
        description: "Local server",
      },
      {
        url: "https://localhost.quronest.com/",
        description: "Local Quronest server",
      },
    ],
    components: {
      ...components.components,
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // looks for configuration in specified directories
  apis: ["./src/routes/*.ts"],
};
export const swaggerSpec = swaggerJsdoc(options);

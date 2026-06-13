// swagger-config.ts
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Quronest LLM service",
      description:
        "API endpoints for a Quronest LLM service",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:4000/",
        description: "Local server",
      },
      {
        url: "http://localhost.quronest.com/",
        description: "Local Quronest server",
      }
    ],
  },
  // looks for configuration in specified directories
  apis: ["./src/routes/*.ts"],
};
export const swaggerSpec = swaggerJsdoc(options);

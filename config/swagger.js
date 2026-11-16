import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const serverUrl =
  process.env.BASE_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  `http://localhost:${process.env.PORT || 5000}`;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DeskFlow Helpdesk API",
      version: "1.0.0",
      description: "Enterprise IT Helpdesk & Support Ticket Management System REST API",
    },
    servers: [
      {
        url: serverUrl,
        description:
          process.env.NODE_ENV === "production"
            ? "Production Server"
            : "Local Development Server",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);

export { swaggerUi, swaggerSpec };

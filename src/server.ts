/* eslint-disable no-console */
import { Server } from "http";
import app from "./app";
import envConfig from "./config/envConfig";

let server: Server;

async function officeManagementServer() {
  try {
    server = app.listen(envConfig.port, () => {
      console.log(
        `🚀 Server is running on http://localhost:${envConfig.port} `
      );
    });
  } catch (error) {
    console.error("Error during server startup:", error);
    process.exit(1);
  }
}

// Server off function to gracefully shut down the server

process.on("SIGTERM", () => {
  console.log("🧹 Shutting down gracefully due to SIGTERM...");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.log(
    "🧹 Shutting down gracefully due to unhandled rejection...",
    reason
  );

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", (reason) => {
  console.log(
    "🧹 Shutting down gracefully due to Uncaught Exception...",
    reason
  );

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

officeManagementServer();

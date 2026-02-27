import http from "http";
import express from "express";
import { initialize } from "@oas-tools/core";
import * as db from "./db.js";
import logger from "./logger.js";

const serverPort = process.env.PORT || 8080;
const app = express();

// CORS Configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json({ limit: "50mb" }));

const config = {
  oasFile: "./api/oas-doc.yaml",
  middleware: {
    security: {
      auth: {},
    },
  },
};

async function startServer() {
  await db.connect();

  const employees = await db.find({});
  if (employees.length === 0) {
    logger.info("Empty DB, loading initial data...");
    await db.init();
  } else {
    logger.info("DB has " + employees.length + " employees.");
  }

  await initialize(app, config);

  http.createServer(app).listen(serverPort, () => {
    logger.info("\nApp running at http://localhost:" + serverPort);
    logger.info(
      "________________________________________________________________",
    );
    if (!config?.middleware?.swagger?.disable) {
      logger.info(
        "API docs (Swagger UI) available on http://localhost:" +
          serverPort +
          "/docs",
      );
      logger.info(
        "________________________________________________________________",
      );
    }
  });
}

startServer();

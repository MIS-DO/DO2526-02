import http from "http";
import express from "express";
import { initialize } from "@oas-tools/core";
import * as db from "./data/db.js";
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
  logger: {
    customLogger: logger,
  },
};

async function start() {
  try {
    await db.connect();
    logger.info("Initializing DB...");
    const flights = await db.find({});
    if (flights.length === 0) {
      logger.info("Empty DB, loading initial data...");
      await db.init();
    } else {
      logger.info("DB already has " + flights.length + " flights.");
    }
  } catch (err) {
    logger.error("Error connecting to DB!", err);
    setTimeout(() => process.exit(1), 1000);
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

start();

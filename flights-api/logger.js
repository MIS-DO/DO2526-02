import winston from "winston";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, "logs");
const env = process.env.NODE_ENV || "development";

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

winston.addColors(winston.config.npm.colors);

const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.align(),
    winston.format.printf(
      (info) =>
        `${info.timestamp} ${info.level}: ${env === "development" && info.stack ? info.stack : info.message}`,
    ),
  ),
  transports: [
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      level: env === "development" ? "debug" : "info",
      filename: path.join(logDir, "logs.log"),
      maxsize: 1024 * 1024 * 10,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "exceptions.log"),
    }),
  ],
  exitOnError: false,
});

export default logger;

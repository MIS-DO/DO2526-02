import { MongoClient } from "mongodb";
import logger from "./logger.js";

const url = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = "employees";

const client = new MongoClient(url);

let _collection;

export async function connect() {
  if (_collection) {
    logger.warn("DB connection already exists!");
    return _collection;
  }
  try {
    await client.connect();
    _collection = client.db(dbName).collection(dbName);
    logger.info("Connected to MongoDB");
    return _collection;
  } catch (err) {
    logger.error("Error connecting to DB!", err);
    process.exit(1);
  }
}

export function getConnection() {
  if (!_collection) {
    throw new Error("DB not connected. Call connect() first.");
  }
  return _collection;
}

export async function init() {
  const sampleEmployees = [
    {
      id: 1,
      fullName: "Carlos Ruiz",
      email: "carlos.ruiz@company.com",
      salary: 45000,
      hireDate: "2022-03-15",
      teleworking: true,
      spokenLanguages: ["Spanish", "English"],
      performance: { lastRating: 4, reviewDate: "2024-12-01" },
    },
    {
      id: 2,
      fullName: "Ana García",
      email: "ana.garcia@company.com",
      salary: 52000,
      hireDate: "2021-06-01",
      teleworking: false,
      spokenLanguages: ["Spanish", "French"],
      performance: { lastRating: 5, reviewDate: "2024-11-15" },
    },
  ];
  const collection = getConnection();
  return collection.insertMany(sampleEmployees);
}

export async function find(query) {
  const collection = getConnection();
  return collection.find(query).toArray();
}

export async function findOne(query) {
  const collection = getConnection();
  return collection.findOne(query);
}

export async function insert(doc) {
  const collection = getConnection();
  const result = await collection.insertOne(doc);
  return result.insertedId;
}

export async function update(query, newDoc) {
  const collection = getConnection();
  const result = await collection.replaceOne(query, newDoc);
  return result.modifiedCount;
}

export async function remove(query) {
  const collection = getConnection();
  const result = await collection.deleteOne(query);
  return result.deletedCount;
}

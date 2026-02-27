import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const url = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "do2526";

const client = new MongoClient(url);

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("Connected successfully to DB for search API");
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
}

app.get("/api/v1/search", async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: "Missing 'city' query parameter" });
  }

  try {
    // We are going to perform EXACT case-insensitive regex searches
    const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const queryRegex = new RegExp(`^${escapedCity}$`, "i");

    // Employees has the 'city' property directly
    const employees = await db.collection("employees").find({ city: queryRegex }).toArray();

    // Flights have 'departure.city' and 'arrival.city'
    const flights = await db.collection("flights").find({
      $or: [
        { "departure.city": queryRegex },
        { "arrival.city": queryRegex }
      ]
    }).toArray();

    // SpaceMissions have 'launch.city'
    const spacemissions = await db.collection("spacemissions").find({
      "launch.city": queryRegex
    }).toArray();

    res.json({
      query: city,
      results: {
        employees,
        flights,
        spacemissions
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error during search" });
  }
});

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Search API listening on port ${port}`);
  });
});

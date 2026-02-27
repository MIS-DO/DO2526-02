"use strict";

import { MongoClient } from "mongodb";
import assert from "assert";
import logger from "../logger.js";

const url = process.env.MONGODB_URI || "mongodb://mongo:27017";

const dbName = process.env.DB_NAME || "do2526";
const collectionName = "flights";

const client = new MongoClient(url);

let _collection;

async function connect() {
  if (_collection) {
    logger.warn("Trying to create the DB connection again!");
    return _collection;
  }
  try {
    await client.connect();
    _collection = client.db(dbName).collection(collectionName);
    return _collection;
  } catch (err) {
    logger.error("Error connecting to DB!", err);
    setTimeout(() => process.exit(1), 1000);
  }
}

function getConnection() {
  assert.ok(
    _collection,
    "DB connection has not been created. Please call connect() first.",
  );
  return _collection;
}

async function init() {
  const sampleFlights = [
    {
      id: 1,
      flightNumber: "IB1234",
      airline: "Iberia",
      departure: {
        airport: "MAD",
        city: "Madrid",
        dateTime: "2026-02-15T08:30:00Z",
      },
      arrival: {
        airport: "BCN",
        city: "Barcelona",
        dateTime: "2026-02-15T09:45:00Z",
      },
      aircraft: "Airbus A320",
      seatCapacity: 180,
      seatsAvailable: 45,
      price: {
        amount: 89.99,
        currency: "EUR",
      },
      hasWifi: true,
    },
    {
      id: 2,
      flightNumber: "VY2001",
      airline: "Vueling",
      departure: {
        airport: "BCN",
        city: "Barcelona",
        dateTime: "2026-02-16T14:00:00Z",
      },
      arrival: {
        airport: "LHR",
        city: "London",
        dateTime: "2026-02-16T15:30:00Z",
      },
      aircraft: "Airbus A321",
      seatCapacity: 220,
      seatsAvailable: 78,
      price: {
        amount: 125.5,
        currency: "EUR",
      },
      hasWifi: true,
    },
    {
      id: 3,
      flightNumber: "FR8745",
      airline: "Ryanair",
      departure: {
        airport: "SVQ",
        city: "Sevilla",
        dateTime: "2026-02-17T06:15:00Z",
      },
      arrival: {
        airport: "FCO",
        city: "Roma",
        dateTime: "2026-02-17T08:45:00Z",
      },
      aircraft: "Boeing 737-800",
      seatCapacity: 189,
      seatsAvailable: 12,
      price: {
        amount: 49.99,
        currency: "EUR",
      },
      hasWifi: false,
    },
    {
      id: 4,
      flightNumber: "UX9023",
      airline: "Air Europa",
      departure: {
        airport: "MAD",
        city: "Madrid",
        dateTime: "2026-02-18T22:00:00Z",
      },
      arrival: {
        airport: "JFK",
        city: "New York",
        dateTime: "2026-02-19T01:30:00Z",
      },
      aircraft: "Boeing 787 Dreamliner",
      seatCapacity: 300,
      seatsAvailable: 156,
      price: {
        amount: 450.0,
        currency: "EUR",
      },
      hasWifi: true,
    },
  ];
  const collection = getConnection();
  return collection.insertMany(sampleFlights);
}

async function find(query) {
  const collection = getConnection();
  return collection.find(query).toArray();
}

async function insert(doc) {
  const collection = getConnection();
  const result = await collection.insertOne(doc);
  return result.insertedId;
}

async function update(query, newDoc) {
  const collection = getConnection();
  const result = await collection.replaceOne(query, newDoc);
  return result.modifiedCount;
}

async function remove(query) {
  const collection = getConnection();
  const result = await collection.deleteOne(query);
  return result.deletedCount;
}

export { connect, getConnection, init, find, insert, update, remove };

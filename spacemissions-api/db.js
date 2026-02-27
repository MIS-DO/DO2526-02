'use strict';

import { MongoClient } from 'mongodb';
import assert from 'assert';
import logger from './logger.js';

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';

const dbName = process.env.DB_NAME || 'do2526';
const collectionName = 'spacemissions';

const client = new MongoClient(url);

let _collection;

export async function connect() {
  if (_collection) {
    logger.warn('Trying to create the DB connection again!');
    return _collection;
  }
  try {
    await client.connect();
    _collection = client.db(dbName).collection(collectionName);
    return _collection;
  } catch (err) {
    logger.error('Error connecting to DB!', err);
    process.exit(1);
  }
}

export function getConnection() {
  assert.ok(_collection, 'DB connection has not been created. Please call connect() first.');
  return _collection;
}

export async function init() {
  const sampleSpaceMissions = [
    {
      "id": 1,
      "missionName": "Valkyrie-II Deep Survey",
      "status": "planned",
      "target": {
        "planet": "Mars",
        "region": "Valles Marineris"
      },
      "launch": {
        "year": 2028,
        "location": "Kennedy Space Center",
        "city": "Orlando"
      },
      "crew": {
        "isManned": true,
        "capacity": 6,
        "requiresLifeSupport": true
      },
      "financials": {
        "estimatedBudget": 4500000000,
        "currency": "USD"
      }
    },
    {
      "id": 2,
      "missionName": "Artemis III Lunar Return",
      "status": "active",
      "target": {
        "planet": "Moon",
        "region": "Lunar South Pole"
      },
      "launch": {
        "year": 2026,
        "location": "Boca Chica Base",
        "city": "Brownsville"
      },
      "crew": {
        "isManned": true,
        "capacity": 4,
        "requiresLifeSupport": true
      },
      "financials": {
        "estimatedBudget": 3200000000,
        "currency": "USD"
      }
    },
    {
      "id": 3,
      "missionName": "Europa Clipper",
      "status": "planned",
      "target": {
        "planet": "Jupiter",
        "region": "Europa Moon"
      },
      "launch": {
        "year": 2024,
        "location": "Cape Canaveral",
        "city": "Madrid"
      },
      "crew": {
        "isManned": false,
        "capacity": 0,
        "requiresLifeSupport": false
      },
      "financials": {
        "estimatedBudget": 5000000000,
        "currency": "EUR"
      }
    },
    {
      "id": 4,
      "missionName": "Solar probe X-1",
      "status": "completed",
      "target": {
        "planet": "Sun",
        "region": "Corona"
      },
      "launch": {
        "year": 2018,
        "location": "Madrid Deep Space",
        "city": "Madrid"
      },
      "crew": {
        "isManned": false,
        "capacity": 0,
        "requiresLifeSupport": false
      },
      "financials": {
        "estimatedBudget": 1500000000,
        "currency": "EUR"
      }
    }
  ];
  const collection = getConnection();
  return collection.insertMany(sampleSpaceMissions);
}

export async function find(query) {
  const collection = getConnection();
  return collection.find(query).toArray();
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

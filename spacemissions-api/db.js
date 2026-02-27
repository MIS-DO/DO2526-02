'use strict';

import { MongoClient } from 'mongodb';
import assert from 'assert';
import logger from './logger.js';

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';

const dbName = 'spacemissions';

const client = new MongoClient(url);

let _collection;

export async function connect() {
  if (_collection) {
    logger.warn('Trying to create the DB connection again!');
    return _collection;
  }
  try {
    await client.connect();
    _collection = client.db(dbName).collection(dbName);
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
        "location": "Kennedy Space Center"
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

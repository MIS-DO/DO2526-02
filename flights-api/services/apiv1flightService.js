"use strict";

import * as db from "../data/db.js";
import logger from "../logger.js";

export async function getflight(req, res) {
  logger.info("New GET request to the endpoint /flights");
  try {
    const flights = await db.find({});
    logger.info("Sending flights: " + JSON.stringify(flights, null, 2));
    res.send(flights);
  } catch (err) {
    logger.error("Error getting data from DB", err);
    res.status(500).send();
  }
}

export async function addFlights(req, res) {
  var newFlight = req.body;
  if (!newFlight) {
    logger.warn("New POST request to /flights/ without flight, sending 400...");
    res.status(400).send();
    return;
  }

  logger.info(
    "New POST request to /flights with body: " +
    JSON.stringify(newFlight, null, 2),
  );
  if (!newFlight.id) {
    logger.warn(
      "The flight " +
      JSON.stringify(newFlight, null, 2) +
      " is not well-formed, sending 422...",
    );
    res.status(422).send();
    return;
  }

  try {
    const flights = await db.find({ id: newFlight.id });
    if (flights.length > 0) {
      logger.warn(
        "The flight " +
        JSON.stringify(newFlight, null, 2) +
        " already exists, sending 409...",
      );
      res.status(409).send();
      return;
    }

    logger.info("Adding flight " + JSON.stringify(newFlight, null, 2));
    await db.insert(newFlight);
    res.status(201).send();
  } catch (err) {
    logger.error("Error getting data from DB", err);
    res.status(500).send();
  }
}

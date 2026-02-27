"use strict";

import * as db from "../data/db.js";
import logger from "../logger.js";

export async function findByid(req, res) {
  var id = parseInt(req.params.id);
  if (!id && id !== 0) {
    logger.warn("New GET request to /flights/:id without id, sending 400...");
    res.status(400).send();
    return;
  }

  logger.info("New GET request to /flights/" + id);
  try {
    const filteredFlights = await db.find({ id: id });
    if (filteredFlights.length > 0) {
      var flight = filteredFlights[0];
      logger.info("Sending flight: " + JSON.stringify(flight, null, 2));
      res.send(flight);
    } else {
      logger.warn("There are no flights with id " + id);
      res.status(404).send();
    }
  } catch (err) {
    logger.error("Error getting data from DB", err);
    res.status(500).send();
  }
}

export async function updateFlights(req, res) {
  var updatedFlight = req.body;
  var id = parseInt(req.params.id);
  if (!updatedFlight) {
    logger.warn("New PUT request to /flights/ without flight, sending 400...");
    res.status(400).send();
    return;
  }

  logger.info(
    "New PUT request to /flights/" +
    id +
    " with data " +
    JSON.stringify(updatedFlight, null, 2),
  );
  if (!updatedFlight.id) {
    logger.warn(
      "The flight " +
      JSON.stringify(updatedFlight, null, 2) +
      " is not well-formed, sending 422...",
    );
    res.status(422).send();
    return;
  }

  try {
    const flights = await db.find({ id: updatedFlight.id });
    if (flights.length > 0) {
      await db.update({ id: id }, updatedFlight);
      logger.info(
        "Modifying flight with id " +
        id +
        " with data " +
        JSON.stringify(updatedFlight, null, 2),
      );
      res.status(204).send();
    } else {
      logger.warn("There are not any flight with id " + id);
      res.status(404).send();
    }
  } catch (err) {
    logger.error("Error getting data from DB", err);
    res.status(500).send();
  }
}

export async function deleteFlights(req, res) {
  var id = parseInt(req.params.id);
  if (!id && id !== 0) {
    logger.warn(
      "New DELETE request to /flights/:id without id, sending 400...",
    );
    res.status(400).send();
    return;
  }

  logger.info("New DELETE request to /flights/" + id);
  try {
    var numRemoved = await db.remove({ id: id });
    logger.info("Flights removed: " + numRemoved);
    if (numRemoved === 1) {
      logger.info(
        "The flight with id " +
        id +
        " has been successfully deleted, sending 204...",
      );
      res.status(204).send();
    } else {
      logger.warn("There are no flights to delete");
      res.status(404).send();
    }
  } catch (err) {
    logger.error("Error removing data from DB", err);
    res.status(500).send();
  }
}

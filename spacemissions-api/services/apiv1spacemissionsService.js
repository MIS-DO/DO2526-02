'use strict'

import * as db from '../db.js';
import logger from '../logger.js';

export async function getSpaceMissions(req, res) {
  logger.info('New GET request to the endpoint /spacemissions');
  try {
    const spacemissions = await db.find({});
    logger.info('Sending spacemissions: ' + JSON.stringify(spacemissions, null, 2));
    res.send(spacemissions);
  } catch (err) {
    logger.error('Error getting data from DB', err);
    res.status(500).send();
  }
}

export async function addSpaceMission(req, res) {
  var newSpaceMission = req.body;
  if (!newSpaceMission) {
    logger.warn('New POST request to /spacemissions/ without spacemission, sending 400...');
    res.status(400).send();
    return;
  }

  logger.info('New POST request to /spacemissions with body: ' + JSON.stringify(newSpaceMission, null, 2));
  if (!newSpaceMission.id) {
    logger.warn('The spacemission ' + JSON.stringify(newSpaceMission, null, 2) + ' is not well-formed, sending 422...');
    res.status(422).send();
    return;
  }

  try {
    const spacemissions = await db.find({ id: newSpaceMission.id });
    if (spacemissions.length > 0) {
      logger.warn('The spacemission ' + JSON.stringify(newSpaceMission, null, 2) + ' already exists, sending 409...');
      res.status(409).send();
      return;
    }

    logger.info('Adding spacemission ' + JSON.stringify(newSpaceMission, null, 2));
    await db.insert(newSpaceMission);
    res.status(201).send();
  } catch (err) {
    logger.error('Error getting data from DB', err);
    res.status(500).send();
  }
}

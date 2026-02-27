'use strict'

import * as db from '../db.js';
import logger from '../logger.js';

export async function findByid(req, res) {
  var id = parseInt(req.params.id);
  if (isNaN(id)) {
    logger.warn('New GET request to /spacemissions/:id without valid id, sending 400...');
    res.status(400).send();
    return;
  }

  logger.info('New GET request to /spacemissions/' + id);
  try {
    const filteredSpaceMissions = await db.find({ id: id });
    if (filteredSpaceMissions.length > 0) {
      var spacemission = filteredSpaceMissions[0];
      logger.info('Sending spacemission: ' + JSON.stringify(spacemission, null, 2));
      res.send(spacemission);
    } else {
      logger.warn('There are no spacemissions with id ' + id);
      res.status(404).send();
    }
  } catch (err) {
    logger.error('Error getting data from DB', err);
    res.status(500).send();
  }
}


export async function updateSpaceMission(req, res) {
  var updatedSpaceMission = req.body;
  var id = parseInt(req.params.id);
  if (!updatedSpaceMission) {
    logger.warn('New PUT request to /spacemissions/ without spacemission, sending 400...');
    res.status(400).send();
    return;
  }

  logger.info('New PUT request to /spacemissions/' + id + ' with data ' + JSON.stringify(updatedSpaceMission, null, 2));
  if (!updatedSpaceMission.id) {
    logger.warn('The spacemission ' + JSON.stringify(updatedSpaceMission, null, 2) + ' is not well-formed, sending 422...');
    res.status(422).send();
    return;
  }

  try {
    const spacemissions = await db.find({ id: id });
    if (spacemissions.length > 0) {
      await db.update({ id: id }, updatedSpaceMission);
      logger.info('Modifying spacemission with id ' + id + ' with data ' + JSON.stringify(updatedSpaceMission, null, 2));
      res.status(204).send();
    } else {
      logger.warn('There are not any spacemission with id ' + id);
      res.status(404).send();
    }
  } catch (err) {
    logger.error('Error getting data from DB', err);
    res.status(500).send();
  }
}


export async function deleteSpaceMission(req, res) {
  var id = parseInt(req.params.id);
  if (isNaN(id)) {
    logger.warn('New DELETE request to /spacemissions/:id without valid id, sending 400...');
    res.status(400).send();
    return;
  }

  logger.info('New DELETE request to /spacemissions/' + id);
  try {
    var numRemoved = await db.remove({ id: id });
    logger.info('SpaceMissions removed: ' + numRemoved);
    if (numRemoved === 1) {
      logger.info('The spacemission with id ' + id + ' has been successfully deleted, sending 204...');
      res.status(204).send();
    } else {
      logger.warn('There are no spacemissions to delete');
      res.status(404).send();
    }
  } catch (err) {
    logger.error('Error removing data from DB', err);
    res.status(500).send();
  }
}

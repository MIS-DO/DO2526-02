import * as service from '../services/apiv1spacemissionsService.js';

export function getSpaceMissions(req, res) {
  service.getSpaceMissions(req, res);
}

export function addSpaceMission(req, res) {
  service.addSpaceMission(req, res);
}

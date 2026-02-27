import * as service from '../services/apiv1spacemissionsidService.js';

export function findByid(req, res) {
  service.findByid(req, res);
}

export function updateSpaceMission(req, res) {
  service.updateSpaceMission(req, res);
}

export function deleteSpaceMission(req, res) {
  service.deleteSpaceMission(req, res);
}

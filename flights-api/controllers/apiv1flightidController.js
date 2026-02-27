import * as service from '../services/apiv1flightidService.js';

export function findByid(req, res) {
  service.findByid(req, res);
}

export function updateFlights(req, res) {
  service.updateFlights(req, res);
}

export function deleteFlights(req, res) {
  service.deleteFlights(req, res);
}

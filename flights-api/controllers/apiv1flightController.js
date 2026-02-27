import * as service from '../services/apiv1flightService.js';

export function getflight(req, res) {
  service.getflight(req, res);
}

export function addFlights(req, res) {
  service.addFlights(req, res);
}

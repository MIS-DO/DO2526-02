import * as service from '../services/apiv1employeesidService.js';

export function findByid(req, res) {
  service.findByid(req, res);
}

export function updateEmployee(req, res) {
  service.updateEmployee(req, res);
}

export function deleteEmployee(req, res) {
  service.deleteEmployee(req, res);
}

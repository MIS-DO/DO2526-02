import * as service from '../services/apiv1employeesService.js';

export function getEmployees(req, res) {
  service.getEmployees(req, res);
}

export function addEmployee(req, res) {
  service.addEmployee(req, res);
}

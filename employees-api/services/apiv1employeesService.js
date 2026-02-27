import * as db from "../db.js";
import logger from "../logger.js";

export async function getEmployees(req, res) {
  logger.info("New GET request to /employees");
  try {
    const employees = await db.find({});
    logger.debug("Sending employees: " + JSON.stringify(employees, 2, null));
    res.send(employees);
  } catch (err) {
    logger.error("Error getting data from DB");
    res.status(500).send();
  }
}

export async function addEmployee(req, res) {
  var newEmployee = req.body;
  if (!newEmployee) {
    logger.warn(
      "New POST request to /employees without employee, sending 400...",
    );
    res.status(400).send();
    return;
  }

  logger.info(
    "New POST request to /employees with body: " +
    JSON.stringify(newEmployee, 2, null),
  );

  if (
    !newEmployee.id ||
    !newEmployee.fullName ||
    !newEmployee.email ||
    !newEmployee.salary ||
    newEmployee.teleworking === undefined
  ) {
    logger.warn(
      "The employee " +
      JSON.stringify(newEmployee, 2, null) +
      " is not well-formed, sending 422...",
    );
    res.status(422).send();
    return;
  }

  try {
    const existing = await db.find({ id: newEmployee.id });
    if (existing.length > 0) {
      logger.warn(
        "The employee " +
        JSON.stringify(newEmployee, 2, null) +
        " already exists, sending 409...",
      );
      res.status(409).send();
    } else {
      logger.debug("Adding employee " + JSON.stringify(newEmployee, 2, null));
      await db.insert(newEmployee);
      res.status(201).send();
    }
  } catch (err) {
    logger.error("Error getting data from DB");
    res.status(500).send();
  }
}

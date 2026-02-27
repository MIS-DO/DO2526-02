import * as db from "../db.js";
import logger from "../logger.js";

export async function findByid(req, res) {
  var id = req.params.id;
  if (!id) {
    logger.warn("New GET request to /employees/:id without id, sending 400...");
    res.status(400).send();
    return;
  }

  logger.info("New GET request to /employees/" + id);

  try {
    const employees = await db.find({ id: Number(id) });
    if (employees.length > 0) {
      var employee = employees[0];
      logger.debug("Sending employee: " + JSON.stringify(employee, 2, null));
      res.send(employee);
    } else {
      logger.warn("There are no employees with id " + id);
      res.status(404).send();
    }
  } catch (err) {
    logger.error("Error getting data from DB");
    res.status(500).send();
  }
}

export async function updateEmployee(req, res) {
  var updateData = req.body;
  var id = req.params.id;

  if (!updateData || Object.keys(updateData).length === 0) {
    logger.warn("New PUT request to /employees/ without data, sending 400...");
    res.status(400).send();
    return;
  }

  logger.info(
    "New PUT request to /employees/" +
    id +
    " with data " +
    JSON.stringify(updateData, 2, null),
  );

  try {
    const employees = await db.find({ id: Number(id) });
    if (employees.length > 0) {
      const existingEmployee = employees[0];

      const mergedEmployee = {
        ...existingEmployee,
        ...updateData,
        id: Number(id),
      };

      if (updateData.performance && existingEmployee.performance) {
        mergedEmployee.performance = {
          ...existingEmployee.performance,
          ...updateData.performance,
        };
      }

      delete mergedEmployee._id;

      await db.update({ id: Number(id) }, mergedEmployee);
      logger.debug(
        "Modifying employee with id " +
        id +
        " with data " +
        JSON.stringify(mergedEmployee, 2, null),
      );
      res.status(200).send(mergedEmployee);
    } else {
      logger.warn("There are not any employee with id " + id);
      res.status(404).send();
    }
  } catch (err) {
    logger.error("Error getting data from DB", err);
    res.status(500).send();
  }
}

export async function deleteEmployee(req, res) {
  var id = req.params.id;

  if (!id) {
    logger.warn(
      "New DELETE request to /employees/:id without id, sending 400...",
    );
    res.status(400).send();
    return;
  }

  logger.info("New DELETE request to /employees/" + id);

  try {
    const numRemoved = await db.remove({ id: Number(id) });
    logger.debug("Employees removed: " + numRemoved);
    if (numRemoved === 1) {
      logger.debug(
        "The employee with id " +
        id +
        " has been successfully deleted, sending 204...",
      );
      res.status(204).send();
    } else {
      logger.warn("There are no employees to delete");
      res.status(404).send();
    }
  } catch (err) {
    logger.error("Error removing data from DB");
    res.status(500).send();
  }
}

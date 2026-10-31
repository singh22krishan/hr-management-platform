const express = require("express");
const router = express.Router();
const employeesController = require("../controllers/employeesController");

router.post("/hire", employeesController.hireEmployee);
router.get("/list", employeesController.listEmployees);
router.get("/jobs", employeesController.listJobs);
router.get("/departments", employeesController.listDepartments);
router.get("/managers", employeesController.listManagers);
router.put("/update/:id", employeesController.updateEmployee);
router.post("/terminate/:id", employeesController.terminateEmployee);
router.get("/:id", employeesController.getEmployeeById);

module.exports = router;

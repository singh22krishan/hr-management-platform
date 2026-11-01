require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const db = require("./db");
const { asRequiredText, asOptionalText, asNumber, asEmail, asId } = require("./validation");

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "64kb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: "draft-8", legacyHeaders: false }));

function clientError(res, error) {
  return res.status(400).json({ error: error.message });
}

function serverError(res, error) {
  console.error("Request failed:", error.message);
  return res.status(500).json({ error: "Database operation failed" });
}

function parseDate(value, field = "date") {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) throw new Error(`${field} is invalid`);
  return date;
}

async function withConnection(handler) {
  const connection = await db.getConnection();
  try {
    return await handler(connection);
  } finally {
    await connection.close();
  }
}

function rowsToObjects(result) {
  const rows = result.rows || [];
  const meta = result.metaData || [];
  return rows.map((row) => Object.fromEntries(meta.map((column, index) => [column.name.toLowerCase(), row[index]])));
}

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/employees", async (_req, res) => {
  try {
    const employees = await withConnection(async (connection) => {
      const result = await connection.execute(
        `SELECT employee_id, first_name, last_name, email, phone_number,
                hire_date, job_id, salary, manager_id, department_id, emp_status
           FROM hr_employees
          ORDER BY employee_id`
      );
      return rowsToObjects(result);
    });
    res.json(employees);
  } catch (error) {
    serverError(res, error);
  }
});

app.get("/api/employees/:id", async (req, res) => {
  let employeeId;
  try {
    employeeId = asId(req.params.id, "employee id");
  } catch (error) {
    return clientError(res, error);
  }

  try {
    const employee = await withConnection(async (connection) => {
      const result = await connection.execute(
        `SELECT employee_id, first_name, last_name, email, phone_number,
                hire_date, job_id, salary, manager_id, department_id, emp_status
           FROM hr_employees
          WHERE employee_id = :employee_id`,
        { employee_id: employeeId }
      );
      return rowsToObjects(result)[0] || null;
    });
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  } catch (error) {
    serverError(res, error);
  }
});

app.post("/api/employees", async (req, res) => {
  let values;
  try {
    values = {
      p_first_name: asRequiredText(req.body.first_name, "first_name", 80),
      p_last_name: asRequiredText(req.body.last_name, "last_name", 80),
      p_email: asEmail(req.body.email),
      p_salary: asNumber(req.body.salary, "salary", { required: true, min: 0 }),
      p_hire_date: parseDate(req.body.hire_date, "hire_date"),
      p_phone: asOptionalText(req.body.phone, 40),
      p_job_id: asRequiredText(req.body.job_id, "job_id", 40),
      p_manager_id: asNumber(req.body.manager_id, "manager_id", { min: 1 }),
      p_department_id: asNumber(req.body.department_id, "department_id", { min: 1 }),
    };
  } catch (error) {
    return clientError(res, error);
  }

  try {
    await withConnection((connection) => connection.execute(
      `BEGIN employee_hire_sp(:p_first_name, :p_last_name, :p_email, :p_salary,
                              :p_hire_date, :p_phone, :p_job_id, :p_manager_id,
                              :p_department_id); END;`,
      values,
      { autoCommit: true }
    ));
    res.status(201).json({ message: "Employee hired successfully" });
  } catch (error) {
    serverError(res, error);
  }
});

app.put("/api/employees/:id", async (req, res) => {
  let values;
  try {
    values = {
      p_employee_id: asId(req.params.id, "employee id"),
      p_first_name: asRequiredText(req.body.first_name, "first_name", 80),
      p_last_name: asRequiredText(req.body.last_name, "last_name", 80),
      p_email: asEmail(req.body.email),
      p_phone: asOptionalText(req.body.phone, 40),
      p_job_id: asRequiredText(req.body.job_id, "job_id", 40),
      p_salary: asNumber(req.body.salary, "salary", { required: true, min: 0 }),
      p_manager_id: asNumber(req.body.manager_id, "manager_id", { min: 1 }),
      p_department_id: asNumber(req.body.department_id, "department_id", { min: 1 }),
    };
  } catch (error) {
    return clientError(res, error);
  }

  try {
    await withConnection((connection) => connection.execute(
      `BEGIN employee_update_sp(:p_employee_id, :p_first_name, :p_last_name,
                                :p_email, :p_phone, :p_job_id, :p_salary,
                                :p_manager_id, :p_department_id); END;`,
      values,
      { autoCommit: true }
    ));
    res.json({ message: "Employee updated successfully" });
  } catch (error) {
    serverError(res, error);
  }
});

app.post("/api/employees/:id/terminate", async (req, res) => {
  let employeeId;
  try {
    employeeId = asId(req.params.id, "employee id");
  } catch (error) {
    return clientError(res, error);
  }
  try {
    await withConnection((connection) => connection.execute(
      `BEGIN employee_terminate_sp(:p_employee_id); END;`,
      { p_employee_id: employeeId },
      { autoCommit: true }
    ));
    res.json({ message: "Employee terminated successfully" });
  } catch (error) {
    serverError(res, error);
  }
});

app.get("/api/jobs", async (_req, res) => {
  try {
    const jobs = await withConnection(async (connection) => rowsToObjects(await connection.execute(
      `SELECT job_id, job_title, min_salary, max_salary FROM hr_jobs ORDER BY job_id`
    )));
    res.json(jobs);
  } catch (error) {
    serverError(res, error);
  }
});

app.get("/api/jobs/:jobId/title", async (req, res) => {
  let jobId;
  try {
    jobId = asRequiredText(req.params.jobId, "job id", 40);
  } catch (error) {
    return clientError(res, error);
  }
  try {
    const jobTitle = await withConnection(async (connection) => {
      const result = await connection.execute(`SELECT get_job(:job_id) AS job_title FROM dual`, { job_id: jobId });
      return result.rows?.[0]?.[0] || null;
    });
    if (!jobTitle) return res.status(404).json({ error: "Job not found" });
    res.json({ job_id: jobId, job_title: jobTitle });
  } catch (error) {
    serverError(res, error);
  }
});

app.post("/api/jobs", async (req, res) => {
  let values;
  try {
    const minSalary = asNumber(req.body.min_salary, "min_salary", { required: true, min: 0 });
    const maxSalary = asNumber(req.body.max_salary, "max_salary", { required: true, min: 0 });
    if (maxSalary < minSalary) throw new Error("max_salary must be greater than or equal to min_salary");
    values = {
      job_id: asRequiredText(req.body.job_id, "job_id", 40),
      job_title: asRequiredText(req.body.job_title, "job_title", 120),
      min_salary: minSalary,
      max_salary: maxSalary,
    };
  } catch (error) {
    return clientError(res, error);
  }
  try {
    await withConnection((connection) => connection.execute(
      `BEGIN new_job_sp(:job_id, :job_title, :min_salary, :max_salary); END;`, values, { autoCommit: true }
    ));
    res.status(201).json({ message: "Job created successfully" });
  } catch (error) {
    serverError(res, error);
  }
});

app.put("/api/jobs/:jobId", async (req, res) => {
  let values;
  try {
    const minSalary = asNumber(req.body.min_salary, "min_salary", { required: true, min: 0 });
    const maxSalary = asNumber(req.body.max_salary, "max_salary", { required: true, min: 0 });
    if (maxSalary < minSalary) throw new Error("max_salary must be greater than or equal to min_salary");
    values = {
      job_id: asRequiredText(req.params.jobId, "job id", 40),
      job_title: asRequiredText(req.body.job_title, "job_title", 120),
      min_salary: minSalary,
      max_salary: maxSalary,
    };
  } catch (error) {
    return clientError(res, error);
  }
  try {
    await withConnection((connection) => connection.execute(
      `BEGIN update_job_sp(:job_id, :job_title, :min_salary, :max_salary); END;`, values, { autoCommit: true }
    ));
    res.json({ message: "Job updated successfully" });
  } catch (error) {
    serverError(res, error);
  }
});

app.get("/api/departments", async (_req, res) => {
  try {
    const departments = await withConnection(async (connection) => rowsToObjects(await connection.execute(
      `SELECT department_id, department_name, manager_id, location_id FROM hr_departments ORDER BY department_id`
    )));
    res.json(departments);
  } catch (error) {
    serverError(res, error);
  }
});

app.post("/api/departments", async (req, res) => {
  let values;
  try {
    values = {
      p_department_name: asRequiredText(req.body.department_name, "department_name", 120),
      p_manager_id: asNumber(req.body.manager_id, "manager_id", { min: 1 }),
      p_location_id: asNumber(req.body.location_id, "location_id", { min: 1 }),
    };
  } catch (error) {
    return clientError(res, error);
  }
  try {
    await withConnection((connection) => connection.execute(
      `BEGIN create_department_sp(:p_department_name, :p_manager_id, :p_location_id); END;`, values, { autoCommit: true }
    ));
    res.status(201).json({ message: "Department created successfully" });
  } catch (error) {
    serverError(res, error);
  }
});

app.put("/api/departments/:id", async (req, res) => {
  let values;
  try {
    values = {
      p_department_id: asId(req.params.id, "department id"),
      p_department_name: asRequiredText(req.body.department_name, "department_name", 120),
      p_manager_id: asNumber(req.body.manager_id, "manager_id", { min: 1 }),
      p_location_id: asNumber(req.body.location_id, "location_id", { min: 1 }),
    };
  } catch (error) {
    return clientError(res, error);
  }
  try {
    await withConnection((connection) => connection.execute(
      `BEGIN update_department_sp(:p_department_id, :p_department_name, :p_manager_id, :p_location_id); END;`, values, { autoCommit: true }
    ));
    res.json({ message: "Department updated successfully" });
  } catch (error) {
    serverError(res, error);
  }
});

app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

db.init()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((error) => {
    console.error("Failed to initialize DB pool", error.message);
    process.exit(1);
  });

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

function numOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
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
  return rows.map((row) => {
    const object = {};
    meta.forEach((column, index) => {
      object[column.name.toLowerCase()] = row[index];
    });
    return object;
  });
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
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/employees/:id", async (req, res) => {
  try {
    const employeeId = Number(req.params.id);
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
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/employees", async (req, res) => {
  const { first_name, last_name, email, salary, hire_date, phone, job_id, manager_id, department_id } = req.body;
  try {
    await withConnection(async (connection) => {
      await connection.execute(
        `BEGIN employee_hire_sp(:p_first_name, :p_last_name, :p_email, :p_salary,
                                :p_hire_date, :p_phone, :p_job_id, :p_manager_id,
                                :p_department_id); END;`,
        {
          p_first_name: first_name,
          p_last_name: last_name,
          p_email: email,
          p_salary: numOrNull(salary),
          p_hire_date: new Date(hire_date),
          p_phone: phone,
          p_job_id: job_id,
          p_manager_id: numOrNull(manager_id),
          p_department_id: numOrNull(department_id)
        },
        { autoCommit: true }
      );
    });
    res.status(201).json({ message: "Employee hired successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/employees/:id", async (req, res) => {
  const employeeId = Number(req.params.id);
  const { first_name, last_name, email, phone, job_id, salary, manager_id, department_id } = req.body;
  try {
    await withConnection(async (connection) => {
      await connection.execute(
        `BEGIN employee_update_sp(:p_employee_id, :p_first_name, :p_last_name,
                                  :p_email, :p_phone, :p_job_id, :p_salary,
                                  :p_manager_id, :p_department_id); END;`,
        {
          p_employee_id: employeeId,
          p_first_name: first_name,
          p_last_name: last_name,
          p_email: email,
          p_phone: phone,
          p_job_id: job_id,
          p_salary: numOrNull(salary),
          p_manager_id: numOrNull(manager_id),
          p_department_id: numOrNull(department_id)
        },
        { autoCommit: true }
      );
    });
    res.json({ message: "Employee updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/employees/:id/terminate", async (req, res) => {
  try {
    await withConnection(async (connection) => {
      await connection.execute(
        `BEGIN employee_terminate_sp(:p_employee_id); END;`,
        { p_employee_id: Number(req.params.id) },
        { autoCommit: true }
      );
    });
    res.json({ message: "Employee terminated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/jobs", async (_req, res) => {
  try {
    const jobs = await withConnection(async (connection) => {
      const result = await connection.execute(
        `SELECT job_id, job_title, min_salary, max_salary
           FROM hr_jobs
          ORDER BY job_id`
      );
      return rowsToObjects(result);
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/jobs/:jobId/title", async (req, res) => {
  try {
    const jobTitle = await withConnection(async (connection) => {
      const result = await connection.execute(
        `SELECT get_job(:job_id) AS job_title FROM dual`,
        { job_id: req.params.jobId }
      );
      return result.rows?.[0]?.[0] || null;
    });
    res.json({ job_id: req.params.jobId, job_title: jobTitle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/jobs", async (req, res) => {
  const { job_id, job_title, min_salary, max_salary } = req.body;
  try {
    await withConnection(async (connection) => {
      await connection.execute(
        `BEGIN new_job_sp(:job_id, :job_title, :min_salary, :max_salary); END;`,
        { job_id, job_title, min_salary, max_salary },
        { autoCommit: true }
      );
    });
    res.status(201).json({ message: "Job created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/jobs/:jobId", async (req, res) => {
  const { job_title, min_salary, max_salary } = req.body;
  try {
    await withConnection(async (connection) => {
      await connection.execute(
        `BEGIN update_job_sp(:job_id, :job_title, :min_salary, :max_salary); END;`,
        { job_id: req.params.jobId, job_title, min_salary, max_salary },
        { autoCommit: true }
      );
    });
    res.json({ message: "Job updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/departments", async (_req, res) => {
  try {
    const departments = await withConnection(async (connection) => {
      const result = await connection.execute(
        `SELECT department_id, department_name, manager_id, location_id
           FROM hr_departments
          ORDER BY department_id`
      );
      return rowsToObjects(result);
    });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/departments", async (req, res) => {
  const { department_name, manager_id, location_id } = req.body;
  try {
    await withConnection(async (connection) => {
      await connection.execute(
        `BEGIN create_department_sp(:p_department_name, :p_manager_id, :p_location_id); END;`,
        {
          p_department_name: department_name,
          p_manager_id: numOrNull(manager_id),
          p_location_id: numOrNull(location_id)
        },
        { autoCommit: true }
      );
    });
    res.status(201).json({ message: "Department created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/departments/:id", async (req, res) => {
  const { department_name, manager_id, location_id } = req.body;
  try {
    await withConnection(async (connection) => {
      await connection.execute(
        `BEGIN update_department_sp(:p_department_id, :p_department_name,
                                    :p_manager_id, :p_location_id); END;`,
        {
          p_department_id: Number(req.params.id),
          p_department_name: department_name,
          p_manager_id: numOrNull(manager_id),
          p_location_id: numOrNull(location_id)
        },
        { autoCommit: true }
      );
    });
    res.json({ message: "Department updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

db.init()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Failed to initialize DB pool", error.message);
    process.exit(1);
  });

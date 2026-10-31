require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const employeesRouter = require("./routes/employees");
const jobsRouter = require("./routes/jobs");
const departmentsRouter = require("./routes/departments");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/employees", employeesRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/departments", departmentsRouter);

const PORT = process.env.PORT || 5000;

db.init()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to initialize DB pool", err.message);
    process.exit(1);
  });

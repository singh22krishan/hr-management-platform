# HR Management Platform

A full-stack human resources management application built with **React, Node.js, Express, Oracle Database, SQL, and PL/SQL**. This repository is a clean standalone portfolio implementation derived from an academic Advanced Database project.

## Highlights

- Employee hiring, retrieval, updates, and termination workflows
- Job creation, updates, and job-title lookup
- Department creation and updates
- Oracle stored procedures, functions, `SYS_REFCURSOR`, and triggers
- Database-side salary-range enforcement
- Oracle bind-variable integration from Express
- REST API built with Express
- React dashboard for employees, jobs, and departments
- Environment-based configuration with no committed production credentials

## Architecture

```text
React / Vite frontend
        |
        v
Node.js + Express REST API
        |
        v
Oracle Database + PL/SQL procedures/functions/triggers
```

## Technology Stack

- **Frontend:** React, Vite, JavaScript
- **Backend:** Node.js, Express
- **Database:** Oracle Database
- **Database Programming:** SQL, PL/SQL, stored procedures, functions, cursors and triggers

## Repository Structure

```text
backend/
├── .env.example
├── db.js
├── package.json
└── server.js

database/
├── README.md
├── employees.sql
├── jobs.sql
├── salary_validation.sql
└── departments.sql

frontend/
├── .env.example
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```

## Oracle PL/SQL Layer

The `database/` directory contains the cleaned database-programming layer that supports the application.

### Employee lifecycle

`employees.sql` provides:

- `employee_hire_sp`
- `employee_update_sp`
- `employee_terminate_sp`

### Job management

`jobs.sql` provides:

- `new_job_sp`
- `update_job_sp`
- `get_job()`

### Salary validation

`salary_validation.sql` provides:

- reusable `check_salary` procedure
- `check_salary_trg` row-level trigger
- database-enforced validation against the minimum and maximum salary configured for a job

This means salary rules are enforced in Oracle rather than relying only on frontend or API validation.

### Department management

`departments.sql` provides:

- `list_departments_sp` using `SYS_REFCURSOR`
- `create_department_sp`
- `update_department_sp`

See [`database/README.md`](database/README.md) for expected schema objects and installation order.

## Backend Setup

1. Install Node.js 18 or newer.
2. In `backend/`, run `npm install`.
3. Copy `.env.example` to `.env`.
4. Configure your own Oracle credentials and connection string.
5. Install the PL/SQL scripts from `database/` against your Oracle schema.
6. Run `npm start`.

## Frontend Setup

1. In `frontend/`, run `npm install`.
2. Copy `.env.example` to `.env` if the API is not running at `http://localhost:5000`.
3. Run `npm run dev`.

## API Overview

- `GET /health`
- `GET /api/employees`
- `GET /api/employees/:id`
- `POST /api/employees`
- `PUT /api/employees/:id`
- `POST /api/employees/:id/terminate`
- `GET /api/jobs`
- `GET /api/jobs/:jobId/title`
- `POST /api/jobs`
- `PUT /api/jobs/:jobId`
- `GET /api/departments`
- `POST /api/departments`
- `PUT /api/departments/:id`

## Security and Privacy

Real `.env` files, credentials, database passwords, and local dependency folders are excluded from this portfolio repository. Only safe example environment files are committed.

The original academic repository is retained privately because older history contained classroom database configuration. This public portfolio repository has separate clean history.

## Academic Context

Originally developed for **COMP214 – Advanced Database** at Centennial College and maintained here as a standalone portfolio project demonstrating full-stack integration and Oracle PL/SQL development.

# Oracle PL/SQL Layer

This directory contains the cleaned PL/SQL layer used by the HR Management Platform.

The original academic project files included database credentials, course artifacts, test material, and private repository history. Those materials are intentionally excluded. These scripts preserve the stored procedures, function, and trigger that support the public application's employee, job, department, and salary-validation workflows.

## Expected database objects

The scripts assume an Oracle HR-style schema with these application tables:

- `HR_EMPLOYEES`
- `HR_JOBS`
- `HR_DEPARTMENTS`

The application also expects:

- `HR_EMPLOYEES_SEQ` for new employee IDs
- `HR_DEPARTMENTS_SEQ` for new department IDs
- an `EMP_STATUS` column on `HR_EMPLOYEES`

Example one-time setup for the status column:

```sql
ALTER TABLE HR_EMPLOYEES ADD (EMP_STATUS VARCHAR2(15));
UPDATE HR_EMPLOYEES SET EMP_STATUS = 'ACTIVE' WHERE EMP_STATUS IS NULL;
COMMIT;
```

Sequence definitions are environment-specific and are not included because this portfolio repository does not redistribute the original course database schema.

## Scripts

Run the scripts in this order after the required tables/sequences exist:

1. `employees.sql`
2. `jobs.sql`
3. `salary_validation.sql`
4. `departments.sql`

`salary_validation.sql` installs a row-level trigger that calls the `check_salary` procedure before employee salary/job changes are accepted.

## Application integration

The Express backend invokes these procedures with Oracle bind variables rather than concatenating user input into SQL statements. For example, the employee-create endpoint calls `employee_hire_sp` through an anonymous PL/SQL block.

## Academic context

These procedures come from the database layer of the COMP214 Advanced Database final project. This directory is a cleaned portfolio representation of that project layer; classroom-only files and sensitive configuration are not published.
